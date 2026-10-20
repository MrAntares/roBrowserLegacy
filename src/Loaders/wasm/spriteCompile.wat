(module
  (memory (export "memory") 1)

  ;; compilePal(palPtr, srcPtr, dstPtr, width, height, glWidth, glHeight, startX, startY)
  ;; Copies 8-bit palette indices to a (glWidth * glHeight) 8-bit buffer centered at (startX, startY).
  ;; If pal32[idx] == 0xFFFF00FF (MAGENTA), writes 0 (transparent), else writes idx.
  ;; Destination buffer is 1 byte per pixel.
  (func (export "compilePal")
    (param $palPtr i32)
    (param $srcPtr i32)
    (param $dstPtr i32)
    (param $width i32)
    (param $height i32)
    (param $glWidth i32)
    (param $glHeight i32)
    (param $startX i32)
    (param $startY i32)

    (local $y i32)
    (local $x i32)
    (local $srcRow i32)
    (local $dstRow i32)
    (local $idx i32)

    (local.set $y (i32.const 0))
    (block $break_y
      (loop $loop_y
        (br_if $break_y (i32.ge_u (local.get $y) (local.get $height)))

        ;; srcRow = srcPtr + y * width
        (local.set $srcRow
          (i32.add
            (local.get $srcPtr)
            (i32.mul (local.get $y) (local.get $width))
          )
        )

        ;; dstRow = dstPtr + (y + startY) * glWidth + startX
        (local.set $dstRow
          (i32.add
            (local.get $dstPtr)
            (i32.add
              (i32.mul
                (i32.add (local.get $y) (local.get $startY))
                (local.get $glWidth)
              )
              (local.get $startX)
            )
          )
        )

        (local.set $x (i32.const 0))
        (block $break_x
          (loop $loop_x
            (br_if $break_x (i32.ge_u (local.get $x) (local.get $width)))

            ;; idx = load8_u(srcRow + x)
            (local.set $idx
              (i32.load8_u (i32.add (local.get $srcRow) (local.get $x)))
            )

            ;; check if pal32[idx] == 0xFFFF00FF (-65281 signed)
            (if
              (i32.eq
                (i32.load (i32.add (local.get $palPtr) (i32.shl (local.get $idx) (i32.const 2))))
                (i32.const 0xffff00ff)
              )
              (then
                (i32.store8
                  (i32.add (local.get $dstRow) (local.get $x))
                  (i32.const 0)
                )
              )
              (else
                (i32.store8
                  (i32.add (local.get $dstRow) (local.get $x))
                  (local.get $idx)
                )
              )
            )

            (local.set $x (i32.add (local.get $x) (i32.const 1)))
            (br $loop_x)
          )
        )

        (local.set $y (i32.add (local.get $y) (i32.const 1)))
        (br $loop_y)
      )
    )
  )

  ;; compileRgba(srcPtr, dstPtr, width, height, glWidth, startX, startY)
  ;; Copies 32-bit RGBA pixels with vertical flip (srcRow = (height - y - 1) * width * 4).
  ;; Destination is 32-bit (glWidth * glHeight * 4), row offset = (y + startY) * glWidth + startX.
  ;; Swizzle: a = src[0], b = src[1], g = src[2], r = src[3].
  ;; If a == 0 -> write 0; else -> (a << 24) | (b << 16) | (g << 8) | r.
  (func (export "compileRgba")
    (param $srcPtr i32)
    (param $dstPtr i32)
    (param $width i32)
    (param $height i32)
    (param $glWidth i32)
    (param $startX i32)
    (param $startY i32)

    (local $y i32)
    (local $x i32)
    (local $w4 i32)
    (local $srcRow i32)
    (local $dstRow i32)
    (local $srcPixelPtr i32)
    (local $dstPixelPtr i32)
    (local $a i32)
    (local $pixelVal i32)

    ;; w4 = width * 4
    (local.set $w4 (i32.shl (local.get $width) (i32.const 2)))

    (local.set $y (i32.const 0))
    (block $break_y
      (loop $loop_y
        (br_if $break_y (i32.ge_u (local.get $y) (local.get $height)))

        ;; srcRow = srcPtr + (height - y - 1) * w4
        (local.set $srcRow
          (i32.add
            (local.get $srcPtr)
            (i32.mul
              (i32.sub
                (i32.sub (local.get $height) (local.get $y))
                (i32.const 1)
              )
              (local.get $w4)
            )
          )
        )

        ;; dstRow = dstPtr + ((y + startY) * glWidth + startX) * 4
        (local.set $dstRow
          (i32.add
            (local.get $dstPtr)
            (i32.shl
              (i32.add
                (i32.mul
                  (i32.add (local.get $y) (local.get $startY))
                  (local.get $glWidth)
                )
                (local.get $startX)
              )
              (i32.const 2)
            )
          )
        )

        (local.set $x (i32.const 0))
        (block $break_x
          (loop $loop_x
            (br_if $break_x (i32.ge_u (local.get $x) (local.get $width)))

            ;; srcPixelPtr = srcRow + (x * 4)
            (local.set $srcPixelPtr
              (i32.add (local.get $srcRow) (i32.shl (local.get $x) (i32.const 2)))
            )

            ;; dstPixelPtr = dstRow + (x * 4)
            (local.set $dstPixelPtr
              (i32.add (local.get $dstRow) (i32.shl (local.get $x) (i32.const 2)))
            )

            ;; a = src[srcPixelPtr + 0]
            (local.set $a (i32.load8_u (local.get $srcPixelPtr)))

            (if
              (i32.eqz (local.get $a))
              (then
                (i32.store align=4 (local.get $dstPixelPtr) (i32.const 0))
              )
              (else
                ;; pixelVal = (a << 24) | (b << 16) | (g << 8) | r
                ;; r = src[srcPixelPtr + 3]
                ;; g = src[srcPixelPtr + 2]
                ;; b = src[srcPixelPtr + 1]
                (local.set $pixelVal
                  (i32.or
                    (i32.or
                      (i32.shl (local.get $a) (i32.const 24))
                      (i32.shl (i32.load8_u offset=1 (local.get $srcPixelPtr)) (i32.const 16))
                    )
                    (i32.or
                      (i32.shl (i32.load8_u offset=2 (local.get $srcPixelPtr)) (i32.const 8))
                      (i32.load8_u offset=3 (local.get $srcPixelPtr))
                    )
                  )
                )
                (i32.store align=4 (local.get $dstPixelPtr) (local.get $pixelVal))
              )
            )

            (local.set $x (i32.add (local.get $x) (i32.const 1)))
            (br $loop_x)
          )
        )

        (local.set $y (i32.add (local.get $y) (i32.const 1)))
        (br $loop_y)
      )
    )
  )

  ;; frameRgbaToCanvas(srcPtr, dstPtr, width, height)
  ;; Converts RGBA frame pixels to Canvas ImageData (data32) format with vertical flip.
  ;; Reads 32-bit pixel as Little-Endian u32:
  ;;   p = src32[y * width + x]
  ;; Swizzle:
  ;;   dst32[(height - y - 1) * width + x] =
  ;;     ((p & 0x000000ff) << 24) |
  ;;     ((p & 0x0000ff00) << 8)  |
  ;;     ((p & 0x00ff0000) >> 8)  |
  ;;     ((p & 0xff000000) >>> 24)
  ;; Note: No alpha === 0 check is performed here.
  (func (export "frameRgbaToCanvas")
    (param $srcPtr i32)
    (param $dstPtr i32)
    (param $width i32)
    (param $height i32)

    (local $y i32)
    (local $x i32)
    (local $w4 i32)
    (local $srcRow i32)
    (local $dstRow i32)
    (local $p i32)
    (local $swizzled i32)

    ;; w4 = width * 4
    (local.set $w4 (i32.shl (local.get $width) (i32.const 2)))

    (local.set $y (i32.const 0))
    (block $break_y
      (loop $loop_y
        (br_if $break_y (i32.ge_u (local.get $y) (local.get $height)))

        ;; srcRow = srcPtr + y * w4
        (local.set $srcRow
          (i32.add
            (local.get $srcPtr)
            (i32.mul (local.get $y) (local.get $w4))
          )
        )

        ;; dstRow = dstPtr + (height - y - 1) * w4
        (local.set $dstRow
          (i32.add
            (local.get $dstPtr)
            (i32.mul
              (i32.sub
                (i32.sub (local.get $height) (local.get $y))
                (i32.const 1)
              )
              (local.get $w4)
            )
          )
        )

        (local.set $x (i32.const 0))
        (block $break_x
          (loop $loop_x
            (br_if $break_x (i32.ge_u (local.get $x) (local.get $width)))

            ;; p = i32.load(srcRow + (x * 4))
            (local.set $p
              (i32.load align=4 (i32.add (local.get $srcRow) (i32.shl (local.get $x) (i32.const 2))))
            )

            ;; swizzled = ((p & 0x000000ff) << 24) |
            ;;            ((p & 0x0000ff00) << 8)  |
            ;;            ((p & 0x00ff0000) >> 8)  |
            ;;            ((p & 0xff000000) >>> 24)
            (local.set $swizzled
              (i32.or
                (i32.or
                  (i32.shl (i32.and (local.get $p) (i32.const 0x000000ff)) (i32.const 24))
                  (i32.shl (i32.and (local.get $p) (i32.const 0x0000ff00)) (i32.const 8))
                )
                (i32.or
                  (i32.shr_u (i32.and (local.get $p) (i32.const 0x00ff0000)) (i32.const 8))
                  (i32.shr_u (i32.and (local.get $p) (i32.const 0xff000000)) (i32.const 24))
                )
              )
            )

            ;; dst32[dstRow + (x * 4)] = swizzled
            (i32.store align=4
              (i32.add (local.get $dstRow) (i32.shl (local.get $x) (i32.const 2)))
              (local.get $swizzled)
            )

            (local.set $x (i32.add (local.get $x) (i32.const 1)))
            (br $loop_x)
          )
        )

        (local.set $y (i32.add (local.get $y) (i32.const 1)))
        (br $loop_y)
      )
    )
  )

  ;; framePalToCanvas(palPtr, srcPtr, dstPtr, width, height)
  ;; Converts indexed 8-bit frame to 32-bit Canvas pixels using pal32 lookup.
  ;; NO vertical flip: dst32[y * width + x] = pal32[src8[y * width + x]].
  ;; totalPixels = width * height.
  (func (export "framePalToCanvas")
    (param $palPtr i32)
    (param $srcPtr i32)
    (param $dstPtr i32)
    (param $width i32)
    (param $height i32)

    (local $i i32)
    (local $totalPixels i32)
    (local $idx i32)
    (local $color i32)

    (local.set $totalPixels (i32.mul (local.get $width) (local.get $height)))
    (local.set $i (i32.const 0))

    (block $break_loop
      (loop $pixel_loop
        (br_if $break_loop (i32.ge_u (local.get $i) (local.get $totalPixels)))

        ;; idx = load8_u(srcPtr + i)
        (local.set $idx
          (i32.load8_u (i32.add (local.get $srcPtr) (local.get $i)))
        )

        ;; color = load32(palPtr + (idx << 2))
        (local.set $color
          (i32.load align=4 (i32.add (local.get $palPtr) (i32.shl (local.get $idx) (i32.const 2))))
        )

        ;; store32(dstPtr + (i << 2), color)
        (i32.store align=4
          (i32.add (local.get $dstPtr) (i32.shl (local.get $i) (i32.const 2)))
          (local.get $color)
        )

        (local.set $i (i32.add (local.get $i) (i32.const 1)))
        (br $pixel_loop)
      )
    )
  )
)

