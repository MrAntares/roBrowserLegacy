(module
  (memory (export "memory") 1)

  ;; ---------------------------------------------------------------------------
  ;; Static Tables Layout (0x0000 - 0x02BF):
  ;; 0x0000..0x003F (64B): initialPermutation.table
  ;; 0x0040..0x007F (64B): finalPermutation.table
  ;; 0x0080..0x009F (32B): transposition.table
  ;; 0x00A0..0x00A7 (8B):  mask
  ;; 0x00A8..0x01A7 (256B): shuffleDec.table
  ;; 0x01A8..0x01E7 (64B): substitutionBox[0]
  ;; 0x01E8..0x0227 (64B): substitutionBox[1]
  ;; 0x0228..0x0267 (64B): substitutionBox[2]
  ;; 0x0268..0x02A7 (64B): substitutionBox[3]
  ;; 0x02A8..0x02AF (8B):  scratch tmp
  ;; 0x02B0..0x02B7 (8B):  scratch tmp2
  ;; 0x02C0+: Buffer space (passed via bufPtr)
  ;; ---------------------------------------------------------------------------

  ;; initialPermutation.table (64 bytes)
  (data (i32.const 0)
    "\3a\32\2a\22\1a\12\0a\02\3c\34\2c\24\1c\14\0c\04\3e\36\2e\26\1e\16\0e\06\40\38\30\28\20\18\10\08\39\31\29\21\19\11\09\01\3b\33\2b\23\1b\13\0b\03\3d\35\2d\25\1d\15\0d\05\3f\37\2f\27\1f\17\0f\07"
  )

  ;; finalPermutation.table (64 bytes)
  (data (i32.const 64)
    "\28\08\30\10\38\18\40\20\27\07\2f\0f\37\17\3f\1f\26\06\2e\0e\36\16\3e\1e\25\05\2d\0d\35\15\3d\1d\24\04\2c\0c\34\14\3c\1c\23\03\2b\0b\33\13\3b\1b\22\02\2a\0a\32\12\3a\1a\21\01\29\09\31\11\39\19"
  )

  ;; transposition.table (32 bytes)
  (data (i32.const 128)
    "\10\07\14\15\1d\0c\1c\11\01\0f\17\1a\05\12\1f\0a\02\08\18\0e\20\1b\03\09\13\0d\1e\06\16\0b\04\19"
  )

  ;; mask (8 bytes)
  (data (i32.const 160)
    "\80\40\20\10\08\04\02\01"
  )

  ;; shuffleDec.table (256 bytes)
  (data (i32.const 168)
    "\2b\68\02\03\04\05\06\07\08\09\0a\0b\0c\0d\0e\0f\10\11\12\13\14\15\16\17\18\19\1a\1b\1c\1d\1e\1f\20\21\22\23\24\25\26\27\28\29\2a\00\2c\2d\2e\2f\30\31\32\33\34\35\36\37\38\39\3a\3b\3c\3d\3e\3f\40\41\42\43\44\45\46\47\77\49\4a\4b\4c\4d\4e\4f\50\51\52\53\54\55\56\57\58\59\5a\5b\5c\5d\5e\5f\ff\61\62\63\64\65\66\67\01\69\6a\6b\80\6d\6e\6f\70\71\72\73\74\75\76\48\78\79\7a\7b\7c\7d\7e\7f\6c\81\82\83\84\85\86\87\88\89\8a\8b\8c\8d\8e\8f\90\91\92\93\94\95\96\97\98\99\9a\9b\9c\9d\9e\9f\a0\a1\a2\a3\a4\a5\a6\a7\a8\a9\aa\ab\ac\ad\ae\af\b0\b1\b2\b3\b4\b5\b6\b7\b8\c0\ba\bb\bc\bd\be\bf\b9\c1\c2\c3\c4\c5\c6\c7\c8\c9\ca\cb\cc\cd\ce\cf\d0\d1\d2\d3\d4\d5\d6\d7\d8\d9\da\db\dc\dd\de\df\e0\e1\e2\e3\e4\e5\e6\e7\e8\e9\ea\fe\ec\ed\ee\ef\f0\f1\f2\f3\f4\f5\f6\f7\f8\f9\fa\fb\fc\fd\eb\60"
  )

  ;; substitutionBox[0] (64 bytes)
  (data (i32.const 424)
    "\ef\03\41\fd\d8\74\1e\47\26\ef\fb\22\b3\d8\84\1e\39\ac\a7\60\62\c1\cd\ba\5c\96\90\59\05\3b\7a\85\40\fd\1e\c8\e7\8a\8b\21\da\43\64\9f\2d\14\b1\72\f5\5b\c8\b6\9c\37\76\ec\39\a0\a3\05\52\6e\0f\d9"
  )

  ;; substitutionBox[1] (64 bytes)
  (data (i32.const 488)
    "\a7\dd\0d\78\9e\0b\e3\95\60\36\36\4f\f9\60\5a\a3\11\24\d2\87\c8\52\75\ec\bb\c1\4c\ba\24\fe\8f\19\da\13\66\af\49\d0\90\06\8c\6a\fb\91\37\8d\0d\78\bf\49\11\f4\23\e5\ce\3b\55\bc\a2\57\e8\22\74\ce"
  )

  ;; substitutionBox[2] (64 bytes)
  (data (i32.const 552)
    "\2c\ea\c1\bf\4a\24\1f\c2\79\47\a2\7c\b6\d9\68\15\80\56\5d\01\33\fd\f4\ae\de\30\07\9b\e5\83\9b\68\49\b4\2e\83\1f\c2\b5\7c\a2\19\d8\e5\7c\2f\83\da\f7\6b\90\fe\c4\01\5a\97\61\a6\3d\40\0b\58\e6\3d"
  )

  ;; substitutionBox[3] (64 bytes)
  (data (i32.const 616)
    "\4d\d1\b2\0f\28\bd\e4\78\f6\4a\0f\93\8b\17\d1\a4\3a\ec\c9\35\93\56\7e\cb\55\20\a0\fe\6c\89\17\62\17\62\4b\b1\b4\de\d1\87\c9\14\3c\4a\7e\a8\e2\7d\a0\9f\f6\5c\6a\09\8d\f0\0f\e3\53\25\95\36\28\cb"
  )

  ;; ---------------------------------------------------------------------------
  ;; clearTmp: clears 8 bytes at 0x02A8 (680)
  ;; ---------------------------------------------------------------------------
  (func $clearTmp
    (i64.store (i32.const 680) (i64.const 0))
  )

  ;; ---------------------------------------------------------------------------
  ;; initialPermutation(ptr)
  ;; ---------------------------------------------------------------------------
  (func $initialPermutation (param $ptr i32)
    (local $i i32)
    (local $j i32)
    (local $srcByte i32)
    (local $maskByte i32)
    (local $tmpAddr i32)

    (call $clearTmp)
    (local.set $i (i32.const 0))

    (block $break_loop
      (loop $loop
        (br_if $break_loop (i32.ge_s (local.get $i) (i32.const 64)))

        ;; j = table[i] - 1
        (local.set $j
          (i32.sub
            (i32.load8_u (local.get $i))
            (i32.const 1)
          )
        )

        ;; srcByte = load(ptr + ((j >> 3) & 7))
        (local.set $srcByte
          (i32.load8_u
            (i32.add
              (local.get $ptr)
              (i32.and (i32.shr_u (local.get $j) (i32.const 3)) (i32.const 7))
            )
          )
        )

        ;; maskByte = load(160 + (j & 7))
        (local.set $maskByte
          (i32.load8_u
            (i32.add (i32.const 160) (i32.and (local.get $j) (i32.const 7)))
          )
        )

        (if (i32.and (local.get $srcByte) (local.get $maskByte))
          (then
            ;; tmp[(i >> 3) & 7] |= mask[i & 7]
            (local.set $tmpAddr
              (i32.add
                (i32.const 680)
                (i32.and (i32.shr_u (local.get $i) (i32.const 3)) (i32.const 7))
              )
            )
            (i32.store8
              (local.get $tmpAddr)
              (i32.or
                (i32.load8_u (local.get $tmpAddr))
                (i32.load8_u (i32.add (i32.const 160) (i32.and (local.get $i) (i32.const 7))))
              )
            )
          )
        )

        (local.set $i (i32.add (local.get $i) (i32.const 1)))
        (br $loop)
      )
    )

    ;; Copy tmp back to ptr
    (i64.store (local.get $ptr) (i64.load (i32.const 680)))
  )

  ;; ---------------------------------------------------------------------------
  ;; finalPermutation(ptr)
  ;; ---------------------------------------------------------------------------
  (func $finalPermutation (param $ptr i32)
    (local $i i32)
    (local $j i32)
    (local $srcByte i32)
    (local $maskByte i32)
    (local $tmpAddr i32)

    (call $clearTmp)
    (local.set $i (i32.const 0))

    (block $break_loop
      (loop $loop
        (br_if $break_loop (i32.ge_s (local.get $i) (i32.const 64)))

        ;; j = table[i] - 1 (finalPermutation.table at 64)
        (local.set $j
          (i32.sub
            (i32.load8_u (i32.add (i32.const 64) (local.get $i)))
            (i32.const 1)
          )
        )

        ;; srcByte = load(ptr + ((j >> 3) & 7))
        (local.set $srcByte
          (i32.load8_u
            (i32.add
              (local.get $ptr)
              (i32.and (i32.shr_u (local.get $j) (i32.const 3)) (i32.const 7))
            )
          )
        )

        ;; maskByte = load(160 + (j & 7))
        (local.set $maskByte
          (i32.load8_u
            (i32.add (i32.const 160) (i32.and (local.get $j) (i32.const 7)))
          )
        )

        (if (i32.and (local.get $srcByte) (local.get $maskByte))
          (then
            ;; tmp[(i >> 3) & 7] |= mask[i & 7]
            (local.set $tmpAddr
              (i32.add
                (i32.const 680)
                (i32.and (i32.shr_u (local.get $i) (i32.const 3)) (i32.const 7))
              )
            )
            (i32.store8
              (local.get $tmpAddr)
              (i32.or
                (i32.load8_u (local.get $tmpAddr))
                (i32.load8_u (i32.add (i32.const 160) (i32.and (local.get $i) (i32.const 7))))
              )
            )
          )
        )

        (local.set $i (i32.add (local.get $i) (i32.const 1)))
        (br $loop)
      )
    )

    ;; Copy tmp back to ptr
    (i64.store (local.get $ptr) (i64.load (i32.const 680)))
  )

  ;; ---------------------------------------------------------------------------
  ;; transposition(ptr) - operates on 8 bytes at ptr
  ;; ---------------------------------------------------------------------------
  (func $transposition (param $ptr i32)
    (local $i i32)
    (local $j i32)
    (local $srcByte i32)
    (local $maskByte i32)
    (local $tmpAddr i32)

    (call $clearTmp)
    (local.set $i (i32.const 0))

    (block $break_loop
      (loop $loop
        (br_if $break_loop (i32.ge_s (local.get $i) (i32.const 32)))

        ;; j = transposition.table[i] - 1 (table at 128)
        (local.set $j
          (i32.sub
            (i32.load8_u (i32.add (i32.const 128) (local.get $i)))
            (i32.const 1)
          )
        )

        ;; srcByte = load(ptr + (j >> 3))
        (local.set $srcByte
          (i32.load8_u
            (i32.add (local.get $ptr) (i32.shr_u (local.get $j) (i32.const 3)))
          )
        )

        ;; maskByte = load(160 + (j & 7))
        (local.set $maskByte
          (i32.load8_u
            (i32.add (i32.const 160) (i32.and (local.get $j) (i32.const 7)))
          )
        )

        (if (i32.and (local.get $srcByte) (local.get $maskByte))
          (then
            ;; tmp[(i >> 3) + 4] |= mask[i & 7]
            (local.set $tmpAddr
              (i32.add
                (i32.const 680)
                (i32.add (i32.shr_u (local.get $i) (i32.const 3)) (i32.const 4))
              )
            )
            (i32.store8
              (local.get $tmpAddr)
              (i32.or
                (i32.load8_u (local.get $tmpAddr))
                (i32.load8_u (i32.add (i32.const 160) (i32.and (local.get $i) (i32.const 7))))
              )
            )
          )
        )

        (local.set $i (i32.add (local.get $i) (i32.const 1)))
        (br $loop)
      )
    )

    ;; Copy tmp back to ptr
    (i64.store (local.get $ptr) (i64.load (i32.const 680)))
  )

  ;; ---------------------------------------------------------------------------
  ;; expansion(ptr) - operates on 8 bytes at ptr
  ;; ---------------------------------------------------------------------------
  (func $expansion (param $ptr i32)
    (local $b4 i32)
    (local $b5 i32)
    (local $b6 i32)
    (local $b7 i32)

    (local.set $b4 (i32.load8_u (i32.add (local.get $ptr) (i32.const 4))))
    (local.set $b5 (i32.load8_u (i32.add (local.get $ptr) (i32.const 5))))
    (local.set $b6 (i32.load8_u (i32.add (local.get $ptr) (i32.const 6))))
    (local.set $b7 (i32.load8_u (i32.add (local.get $ptr) (i32.const 7))))

    ;; tmp[0] = ((src[index + 7] << 5) | (src[index + 4] >> 3)) & 0x3f;
    (i32.store8
      (i32.const 680)
      (i32.and
        (i32.or
          (i32.shl (local.get $b7) (i32.const 5))
          (i32.shr_u (local.get $b4) (i32.const 3))
        )
        (i32.const 0x3f)
      )
    )

    ;; tmp[1] = ((src[index + 4] << 1) | (src[index + 5] >> 7)) & 0x3f;
    (i32.store8
      (i32.const 681)
      (i32.and
        (i32.or
          (i32.shl (local.get $b4) (i32.const 1))
          (i32.shr_u (local.get $b5) (i32.const 7))
        )
        (i32.const 0x3f)
      )
    )

    ;; tmp[2] = ((src[index + 4] << 5) | (src[index + 5] >> 3)) & 0x3f;
    (i32.store8
      (i32.const 682)
      (i32.and
        (i32.or
          (i32.shl (local.get $b4) (i32.const 5))
          (i32.shr_u (local.get $b5) (i32.const 3))
        )
        (i32.const 0x3f)
      )
    )

    ;; tmp[3] = ((src[index + 5] << 1) | (src[index + 6] >> 7)) & 0x3f;
    (i32.store8
      (i32.const 683)
      (i32.and
        (i32.or
          (i32.shl (local.get $b5) (i32.const 1))
          (i32.shr_u (local.get $b6) (i32.const 7))
        )
        (i32.const 0x3f)
      )
    )

    ;; tmp[4] = ((src[index + 5] << 5) | (src[index + 6] >> 3)) & 0x3f;
    (i32.store8
      (i32.const 684)
      (i32.and
        (i32.or
          (i32.shl (local.get $b5) (i32.const 5))
          (i32.shr_u (local.get $b6) (i32.const 3))
        )
        (i32.const 0x3f)
      )
    )

    ;; tmp[5] = ((src[index + 6] << 1) | (src[index + 7] >> 7)) & 0x3f;
    (i32.store8
      (i32.const 685)
      (i32.and
        (i32.or
          (i32.shl (local.get $b6) (i32.const 1))
          (i32.shr_u (local.get $b7) (i32.const 7))
        )
        (i32.const 0x3f)
      )
    )

    ;; tmp[6] = ((src[index + 6] << 5) | (src[index + 7] >> 3)) & 0x3f;
    (i32.store8
      (i32.const 686)
      (i32.and
        (i32.or
          (i32.shl (local.get $b6) (i32.const 5))
          (i32.shr_u (local.get $b7) (i32.const 3))
        )
        (i32.const 0x3f)
      )
    )

    ;; tmp[7] = ((src[index + 7] << 1) | (src[index + 4] >> 7)) & 0x3f;
    (i32.store8
      (i32.const 687)
      (i32.and
        (i32.or
          (i32.shl (local.get $b7) (i32.const 1))
          (i32.shr_u (local.get $b4) (i32.const 7))
        )
        (i32.const 0x3f)
      )
    )

    ;; Copy tmp back to ptr
    (i64.store (local.get $ptr) (i64.load (i32.const 680)))
  )

  ;; ---------------------------------------------------------------------------
  ;; substitutionBox(ptr) - operates on 8 bytes at ptr
  ;; ---------------------------------------------------------------------------
  (func $substitutionBox (param $ptr i32)
    (local $i i32)
    (local $sboxBase i32)
    (local $byte0 i32)
    (local $byte1 i32)
    (local $val i32)

    (call $clearTmp)
    (local.set $i (i32.const 0))

    (block $break_loop
      (loop $loop
        (br_if $break_loop (i32.ge_s (local.get $i) (i32.const 4)))

        ;; sboxBase = 424 + i * 64
        (local.set $sboxBase
          (i32.add (i32.const 424) (i32.shl (local.get $i) (i32.const 6)))
        )

        (local.set $byte0
          (i32.load8_u
            (i32.add
              (local.get $sboxBase)
              (i32.load8_u (i32.add (local.get $ptr) (i32.shl (local.get $i) (i32.const 1))))
            )
          )
        )

        (local.set $byte1
          (i32.load8_u
            (i32.add
              (local.get $sboxBase)
              (i32.load8_u
                (i32.add
                  (local.get $ptr)
                  (i32.add (i32.shl (local.get $i) (i32.const 1)) (i32.const 1))
                )
              )
            )
          )
        )

        ;; tmp[i] = (byte0 & 0xf0) | (byte1 & 0x0f)
        (i32.store8
          (i32.add (i32.const 680) (local.get $i))
          (i32.or
            (i32.and (local.get $byte0) (i32.const 0xf0))
            (i32.and (local.get $byte1) (i32.const 0x0f))
          )
        )

        (local.set $i (i32.add (local.get $i) (i32.const 1)))
        (br $loop)
      )
    )

    ;; Copy tmp back to ptr
    (i64.store (local.get $ptr) (i64.load (i32.const 680)))
  )

  ;; ---------------------------------------------------------------------------
  ;; roundFunction(ptr)
  ;; ---------------------------------------------------------------------------
  (func $roundFunction (param $ptr i32)
    ;; Copy 8 bytes from ptr to tmp2 (688)
    (i64.store (i32.const 688) (i64.load (local.get $ptr)))

    (call $expansion (i32.const 688))
    (call $substitutionBox (i32.const 688))
    (call $transposition (i32.const 688))

    ;; src[0..3] ^= tmp2[4..7]
    (i32.store
      (local.get $ptr)
      (i32.xor
        (i32.load (local.get $ptr))
        (i32.load (i32.const 692))
      )
    )
  )

  ;; ---------------------------------------------------------------------------
  ;; decryptBlock(ptr)
  ;; ---------------------------------------------------------------------------
  (func $decryptBlock (param $ptr i32)
    (call $initialPermutation (local.get $ptr))
    (call $roundFunction (local.get $ptr))
    (call $finalPermutation (local.get $ptr))
  )

  ;; ---------------------------------------------------------------------------
  ;; shuffleDec(ptr)
  ;; ---------------------------------------------------------------------------
  (func $shuffleDec (param $ptr i32)
    (local $b0 i32)
    (local $b1 i32)
    (local $b2 i32)
    (local $b3 i32)
    (local $b4 i32)
    (local $b5 i32)
    (local $b6 i32)
    (local $b7 i32)

    (local.set $b0 (i32.load8_u (local.get $ptr)))
    (local.set $b1 (i32.load8_u (i32.add (local.get $ptr) (i32.const 1))))
    (local.set $b2 (i32.load8_u (i32.add (local.get $ptr) (i32.const 2))))
    (local.set $b3 (i32.load8_u (i32.add (local.get $ptr) (i32.const 3))))
    (local.set $b4 (i32.load8_u (i32.add (local.get $ptr) (i32.const 4))))
    (local.set $b5 (i32.load8_u (i32.add (local.get $ptr) (i32.const 5))))
    (local.set $b6 (i32.load8_u (i32.add (local.get $ptr) (i32.const 6))))
    (local.set $b7 (i32.load8_u (i32.add (local.get $ptr) (i32.const 7))))

    ;; tmp[0] = b3
    (i32.store8 (i32.const 680) (local.get $b3))
    ;; tmp[1] = b4
    (i32.store8 (i32.const 681) (local.get $b4))
    ;; tmp[2] = b6
    (i32.store8 (i32.const 682) (local.get $b6))
    ;; tmp[3] = b0
    (i32.store8 (i32.const 683) (local.get $b0))
    ;; tmp[4] = b1
    (i32.store8 (i32.const 684) (local.get $b1))
    ;; tmp[5] = b2
    (i32.store8 (i32.const 685) (local.get $b2))
    ;; tmp[6] = b5
    (i32.store8 (i32.const 686) (local.get $b5))
    ;; tmp[7] = shuffleDec.table[b7] (table at 168)
    (i32.store8
      (i32.const 687)
      (i32.load8_u (i32.add (i32.const 168) (local.get $b7)))
    )

    ;; Copy tmp to ptr
    (i64.store (local.get $ptr) (i64.load (i32.const 680)))
  )

  ;; ---------------------------------------------------------------------------
  ;; decodeHeader(bufPtr, len)
  ;; ---------------------------------------------------------------------------
  (func (export "decodeHeader") (param $bufPtr i32) (param $len i32)
    (local $nblocks i32)
    (local $i i32)

    (local.set $nblocks (i32.shr_u (local.get $len) (i32.const 3)))
    (local.set $i (i32.const 0))

    (block $break_header
      (loop $loop_header
        (br_if $break_header (i32.ge_s (local.get $i) (i32.const 20)))
        (br_if $break_header (i32.ge_s (local.get $i) (local.get $nblocks)))

        (call $decryptBlock
          (i32.add (local.get $bufPtr) (i32.shl (local.get $i) (i32.const 3)))
        )

        (local.set $i (i32.add (local.get $i) (i32.const 1)))
        (br $loop_header)
      )
    )
  )

  ;; ---------------------------------------------------------------------------
  ;; decodeFull(bufPtr, len, cycle)
  ;; ---------------------------------------------------------------------------
  (func (export "decodeFull") (param $bufPtr i32) (param $len i32) (param $cycle i32)
    (local $nblocks i32)
    (local $i i32)
    (local $j i32)

    (local.set $nblocks (i32.shr_u (local.get $len) (i32.const 3)))
    (local.set $i (i32.const 0))

    ;; First 20 blocks (or up to nblocks)
    (block $break_first20
      (loop $loop_first20
        (br_if $break_first20 (i32.ge_s (local.get $i) (i32.const 20)))
        (br_if $break_first20 (i32.ge_s (local.get $i) (local.get $nblocks)))

        (call $decryptBlock
          (i32.add (local.get $bufPtr) (i32.shl (local.get $i) (i32.const 3)))
        )

        (local.set $i (i32.add (local.get $i) (i32.const 1)))
        (br $loop_first20)
      )
    )

    ;; Remaining blocks
    (local.set $i (i32.const 20))
    (local.set $j (i32.const 0))

    (block $break_rest
      (loop $loop_rest
        (br_if $break_rest (i32.ge_s (local.get $i) (local.get $nblocks)))

        ;; if (i % cycle === 0) -> decryptBlock
        (if (i32.eqz (i32.rem_u (local.get $i) (local.get $cycle)))
          (then
            (call $decryptBlock
              (i32.add (local.get $bufPtr) (i32.shl (local.get $i) (i32.const 3)))
            )
          )
          (else
            ;; if (j === 7) -> shuffleDec; j = 0;
            (if (i32.eq (local.get $j) (i32.const 7))
              (then
                (call $shuffleDec
                  (i32.add (local.get $bufPtr) (i32.shl (local.get $i) (i32.const 3)))
                )
                (local.set $j (i32.const 0))
              )
            )
            (local.set $j (i32.add (local.get $j) (i32.const 1)))
          )
        )

        (local.set $i (i32.add (local.get $i) (i32.const 1)))
        (br $loop_rest)
      )
    )
  )
)
