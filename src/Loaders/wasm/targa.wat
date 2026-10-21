(module
  (memory (export "memory") 1)

  ;; ---------------------------------------------------------------------------
  ;; decodeRLE(dataPtr, outPtr, dataSize, outputSize, pixelSize) -> bytesWritten
  ;;
  ;; Decodes TGA RLE packets. `dataPtr` points at the first RLE packet and
  ;; `dataSize` is the number of readable bytes. The decoded stream is written
  ;; to `outPtr` and must hold at least `outputSize` bytes.
  ;;
  ;; A packet header byte `c` describes a run of `(c & 0x7f) + 1` *pixels*:
  ;;  - when bit 7 is set the packet is a run-length packet: the next
  ;;    `pixelSize` bytes are one pixel that is repeated `count` times;
  ;;  - otherwise the packet is a raw packet: `count * pixelSize` bytes are
  ;;    copied verbatim.
  ;;
  ;; Reading past `dataSize` yields zero bytes (same as the JS fallback, where
  ;; `data[offset++]` is `undefined` and coerces to 0).
  ;; ---------------------------------------------------------------------------
  (func (export "decodeRLE") (param $dataPtr i32) (param $outPtr i32) (param $dataSize i32) (param $outputSize i32) (param $pixelSize i32) (result i32)
    (local $pos i32)
    (local $c i32)
    (local $count i32)
    (local $i i32)
    (local $rep i32)
    (local $pixelsPtr i32)
    (local $pixelSrc i32)
    (local $outputPos i32)
    (local $rawCount i32)
    (local $byte i32)

    (local.set $pos (i32.const 0))
    (local.set $outputPos (i32.const 0))

    (block $break_while
      (loop $loop_while
        ;; NOTE: we deliberately do NOT stop when the input is exhausted: the JS
        ;; fallback keeps decoding (reading zeros) until the output is full.
        ;; Stopping early would produce a short buffer and desynchronise the
        ;; pixel stream, so the behaviour is kept identical here.
        (br_if $break_while (i32.ge_u (local.get $outputPos) (local.get $outputSize)))

        ;; c = data[pos++]
        (local.set $c (i32.const 0))
        (if (i32.lt_u (local.get $pos) (local.get $dataSize))
          (then
            (local.set $c (i32.load8_u (i32.add (local.get $dataPtr) (local.get $pos))))
          )
        )
        (local.set $pos (i32.add (local.get $pos) (i32.const 1)))

        ;; count = (c & 0x7f) + 1
        (local.set $count (i32.and (local.get $c) (i32.const 0x7f)))
        (local.set $count (i32.add (local.get $count) (i32.const 1)))

        (if (i32.and (local.get $c) (i32.const 0x80))
          (then
            ;; RLE packet: read one pixel, then repeat it `count` times
            (local.set $pixelSrc (local.get $pos))
            (local.set $pixelsPtr (i32.add (local.get $dataPtr) (local.get $pixelSrc)))
            (local.set $pos (i32.add (local.get $pos) (local.get $pixelSize)))

            ;; Parity with the JS fallback: `output.set(pixels, pos)` throws a
            ;; RangeError when the run does not fit in the output buffer. The
            ;; overflow is detected on the last repetition of the run, so
            ;; testing the whole run is equivalent. Signal the error to the
            ;; caller with -1 instead of silently truncating the output.
            (if (i32.gt_u
                  (i32.add (local.get $outputPos)
                           (i32.mul (local.get $count) (local.get $pixelSize)))
                  (local.get $outputSize))
              (then (return (i32.const -1))))

            (local.set $rep (i32.const 0))
            (block $break_rep
              (loop $loop_rep
                (br_if $break_rep (i32.ge_u (local.get $rep) (local.get $count)))
                (br_if $break_rep (i32.ge_u (local.get $outputPos) (local.get $outputSize)))

                (local.set $i (i32.const 0))
                (block $break_pixel
                  (loop $loop_pixel
                    (br_if $break_pixel (i32.ge_u (local.get $i) (local.get $pixelSize)))
                    (br_if $break_pixel (i32.ge_u (local.get $outputPos) (local.get $outputSize)))

                    ;; out[outputPos] = (pixelSrc + i < dataSize) ? data[pixelSrc + i] : 0
                    (local.set $byte (i32.const 0))
                    (if (i32.lt_u (i32.add (local.get $pixelSrc) (local.get $i)) (local.get $dataSize))
                      (then
                        (local.set $byte (i32.load8_u (i32.add (local.get $pixelsPtr) (local.get $i))))
                      )
                    )
                    (i32.store8 (i32.add (local.get $outPtr) (local.get $outputPos)) (local.get $byte))

                    (local.set $outputPos (i32.add (local.get $outputPos) (i32.const 1)))
                    (local.set $i (i32.add (local.get $i) (i32.const 1)))
                    (br $loop_pixel)
                  )
                )

                (local.set $rep (i32.add (local.get $rep) (i32.const 1)))
                (br $loop_rep)
              )
            )
          )
          (else
            ;; Raw packet: count * pixelSize bytes
            (local.set $rawCount (i32.mul (local.get $count) (local.get $pixelSize)))
            (local.set $i (i32.const 0))
            (block $break_raw
              (loop $loop_raw
                (br_if $break_raw (i32.ge_u (local.get $i) (local.get $rawCount)))
                (br_if $break_raw (i32.ge_u (local.get $outputPos) (local.get $outputSize)))

                (local.set $byte (i32.const 0))
                (if (i32.lt_u (local.get $pos) (local.get $dataSize))
                  (then
                    (local.set $byte (i32.load8_u (i32.add (local.get $dataPtr) (local.get $pos))))
                  )
                )
                (i32.store8 (i32.add (local.get $outPtr) (local.get $outputPos)) (local.get $byte))

                (local.set $pos (i32.add (local.get $pos) (i32.const 1)))
                (local.set $outputPos (i32.add (local.get $outputPos) (i32.const 1)))
                (local.set $i (i32.add (local.get $i) (i32.const 1)))
                (br $loop_raw)
              )
            )
          )
        )

        ;; back-edge: decode the next packet
        (br $loop_while)
      )
    )

    (local.get $outputPos)
  )
)
