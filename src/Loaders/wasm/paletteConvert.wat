(module
  (memory (export "memory") 1)
  (func (export "convertPal") (param $palPtr i32) (param $srcPtr i32) (param $dstPtr i32) (param $width i32) (param $height i32)
    (local $y i32)
    (local $x i32)
    (local $srcRow i32)
    (local $dstRow i32)
    (local $w4 i32)
    (local $idx0 i32)
    (local $idx1 i32)
    (local $idx2 i32)
    (local $idx3 i32)

    ;; w4 = width * 4 (bytes per destination row)
    (local.set $w4 (i32.shl (local.get $width) (i32.const 2)))

    ;; y = 0
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

        ;; x = 0
        (local.set $x (i32.const 0))

        ;; Process in blocks of 4 pixels (16 bytes out) via SIMD v128
        (block $break_simd
          (loop $loop_simd
            (br_if $break_simd
              (i32.gt_u
                (i32.add (local.get $x) (i32.const 4))
                (local.get $width)
              )
            )

            ;; load 4 index bytes
            (local.set $idx0 (i32.load8_u (i32.add (local.get $srcRow) (local.get $x))))
            (local.set $idx1 (i32.load8_u offset=1 (i32.add (local.get $srcRow) (local.get $x))))
            (local.set $idx2 (i32.load8_u offset=2 (i32.add (local.get $srcRow) (local.get $x))))
            (local.set $idx3 (i32.load8_u offset=3 (i32.add (local.get $srcRow) (local.get $x))))

            ;; construct v128 from 4x 32-bit palette entries and store at dstRow + (x << 2)
            (v128.store align=4
              (i32.add (local.get $dstRow) (i32.shl (local.get $x) (i32.const 2)))
              (i32x4.replace_lane 3
                (i32x4.replace_lane 2
                  (i32x4.replace_lane 1
                    (i32x4.splat
                      (i32.load (i32.add (local.get $palPtr) (i32.shl (local.get $idx0) (i32.const 2))))
                    )
                    (i32.load (i32.add (local.get $palPtr) (i32.shl (local.get $idx1) (i32.const 2))))
                  )
                  (i32.load (i32.add (local.get $palPtr) (i32.shl (local.get $idx2) (i32.const 2))))
                )
                (i32.load (i32.add (local.get $palPtr) (i32.shl (local.get $idx3) (i32.const 2))))
              )
            )

            (local.set $x (i32.add (local.get $x) (i32.const 4)))
            (br $loop_simd)
          )
        )

        ;; Scalar tail for remaining pixels
        (block $break_scalar
          (loop $loop_scalar
            (br_if $break_scalar (i32.ge_u (local.get $x) (local.get $width)))

            (i32.store align=4
              (i32.add (local.get $dstRow) (i32.shl (local.get $x) (i32.const 2)))
              (i32.load
                (i32.add
                  (local.get $palPtr)
                  (i32.shl
                    (i32.load8_u (i32.add (local.get $srcRow) (local.get $x)))
                    (i32.const 2)
                  )
                )
              )
            )

            (local.set $x (i32.add (local.get $x) (i32.const 1)))
            (br $loop_scalar)
          )
        )

        (local.set $y (i32.add (local.get $y) (i32.const 1)))
        (br $loop_y)
      )
    )
  )
)
