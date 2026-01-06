/**
 * Network/Packets/packets2025_len_main.js
 *
 * Network Packet Length
 * Manage packets length
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * Thanks to Andrei Karas (4144)
 *
 * @author Alison Serafim
 */

define(function (require) {
	'use strict';

	let length_list = new Array();

	function init(packetver) {
		// Packet: 0x0064
		length_list[0x0064] = 55;

		// Packet: 0x0065
		length_list[0x0065] = 17;

		// Packet: 0x0066
		length_list[0x0066] = 3;

		// Packet: 0x0067
		length_list[0x0067] = 37;

		// Packet: 0x0068
		length_list[0x0068] = 46;

		// Packet: 0x0069
		length_list[0x0069] = -1;

		// Packet: 0x006A
		length_list[0x006A] = 23;

		// Packet: 0x006B
		length_list[0x006B] = -1;

		// Packet: 0x006C
		length_list[0x006C] = 3;

		// Packet: 0x006D
		length_list[0x006D] = 157;

		// Packet: 0x006E
		length_list[0x006E] = 3;

		// Packet: 0x006F
		length_list[0x006F] = 2;

		// Packet: 0x0070
		length_list[0x0070] = 3;

		// Packet: 0x0071
		length_list[0x0071] = 28;

		// Packet: 0x0072
		length_list[0x0072] = 22;

		// Packet: 0x0073
		length_list[0x0073] = 11;

		// Packet: 0x0074
		length_list[0x0074] = 3;

		// Packet: 0x0075
		length_list[0x0075] = -1;

		// Packet: 0x0076
		length_list[0x0076] = 9;

		// Packet: 0x0077
		length_list[0x0077] = 5;

		// Packet: 0x0078
		length_list[0x0078] = 55;

		// Packet: 0x0079
		length_list[0x0079] = 53;

		// Packet: 0x007A
		length_list[0x007A] = 58;

		// Packet: 0x007B
		length_list[0x007B] = 60;

		// Packet: 0x007C
		length_list[0x007C] = 44;

		// Packet: 0x007D
		length_list[0x007D] = 2;

		// Packet: 0x007E
		length_list[0x007E] = 46;

		// Packet: 0x007F
		length_list[0x007F] = 6;

		// Packet: 0x0080
		length_list[0x0080] = 7;

		// Packet: 0x0081
		length_list[0x0081] = 3;

		// Packet: 0x0082
		length_list[0x0082] = 2;

		// Packet: 0x0083
		length_list[0x0083] = 2;

		// Packet: 0x0084
		length_list[0x0084] = 2;

		// Packet: 0x0085
		length_list[0x0085] = 10;

		// Packet: 0x0086
		length_list[0x0086] = 16;

		// Packet: 0x0087
		length_list[0x0087] = 12;

		// Packet: 0x0088
		length_list[0x0088] = 10;

		// Packet: 0x0089
		length_list[0x0089] = 11;

		// Packet: 0x008A
		length_list[0x008A] = 29;

		// Packet: 0x008B
		length_list[0x008B] = 23;

		// Packet: 0x008C
		length_list[0x008C] = 14;

		// Packet: 0x008D
		length_list[0x008D] = -1;

		// Packet: 0x008E
		length_list[0x008E] = -1;

		// Packet: 0x0090
		length_list[0x0090] = 7;

		// Packet: 0x0091
		length_list[0x0091] = 22;

		// Packet: 0x0092
		length_list[0x0092] = 28;

		// Packet: 0x0093
		length_list[0x0093] = 2;

		// Packet: 0x0094
		length_list[0x0094] = 19;

		// Packet: 0x0095
		length_list[0x0095] = 30;

		// Packet: 0x0096
		length_list[0x0096] = -1;

		// Packet: 0x0097
		length_list[0x0097] = -1;

		// Packet: 0x0098
		length_list[0x0098] = 3;

		// Packet: 0x0099
		length_list[0x0099] = -1;

		// Packet: 0x009A
		length_list[0x009A] = -1;

		// Packet: 0x009B
		length_list[0x009B] = 34;

		// Packet: 0x009C
		length_list[0x009C] = 9;

		// Packet: 0x009D
		length_list[0x009D] = 19;

		// Packet: 0x009E
		length_list[0x009E] = 19;

		// Packet: 0x009F
		length_list[0x009F] = 20;

		// Packet: 0x00A0
		length_list[0x00A0] = 33;

		// Packet: 0x00A1
		length_list[0x00A1] = 6;

		// Packet: 0x00A2
		length_list[0x00A2] = 14;

		// Packet: 0x00A3
		length_list[0x00A3] = -1;

		// Packet: 0x00A4
		length_list[0x00A4] = -1;

		// Packet: 0x00A5
		length_list[0x00A5] = -1;

		// Packet: 0x00A6
		length_list[0x00A6] = -1;

		// Packet: 0x00A7
		length_list[0x00A7] = 9;

		// Packet: 0x00A8
		length_list[0x00A8] = 7;

		// Packet: 0x00A9
		length_list[0x00A9] = 6;

		// Packet: 0x00AA
		length_list[0x00AA] = 9;

		// Packet: 0x00AB
		length_list[0x00AB] = 4;

		// Packet: 0x00AC
		length_list[0x00AC] = 7;

		// Packet: 0x00AE
		length_list[0x00AE] = -1;

		// Packet: 0x00AF
		length_list[0x00AF] = 6;

		// Packet: 0x00B0
		length_list[0x00B0] = 8;

		// Packet: 0x00B1
		length_list[0x00B1] = 8;

		// Packet: 0x00B2
		length_list[0x00B2] = 3;

		// Packet: 0x00B3
		length_list[0x00B3] = 3;

		// Packet: 0x00B4
		length_list[0x00B4] = -1;

		// Packet: 0x00B5
		length_list[0x00B5] = 6;

		// Packet: 0x00B6
		length_list[0x00B6] = 6;

		// Packet: 0x00B7
		length_list[0x00B7] = -1;

		// Packet: 0x00B8
		length_list[0x00B8] = 7;

		// Packet: 0x00B9
		length_list[0x00B9] = 6;

		// Packet: 0x00BA
		length_list[0x00BA] = 2;

		// Packet: 0x00BB
		length_list[0x00BB] = 5;

		// Packet: 0x00BC
		length_list[0x00BC] = 6;

		// Packet: 0x00BD
		length_list[0x00BD] = 44;

		// Packet: 0x00BE
		length_list[0x00BE] = 5;

		// Packet: 0x00BF
		length_list[0x00BF] = 3;

		// Packet: 0x00C0
		length_list[0x00C0] = 7;

		// Packet: 0x00C1
		length_list[0x00C1] = 2;

		// Packet: 0x00C2
		length_list[0x00C2] = 6;

		// Packet: 0x00C3
		length_list[0x00C3] = 8;

		// Packet: 0x00C4
		length_list[0x00C4] = 6;

		// Packet: 0x00C5
		length_list[0x00C5] = 7;

		// Packet: 0x00C6
		length_list[0x00C6] = -1;

		// Packet: 0x00C7
		length_list[0x00C7] = -1;

		// Packet: 0x00C8
		length_list[0x00C8] = -1;

		// Packet: 0x00C9
		length_list[0x00C9] = -1;

		// Packet: 0x00CA
		length_list[0x00CA] = 3;

		// Packet: 0x00CB
		length_list[0x00CB] = 3;

		// Packet: 0x00CC
		length_list[0x00CC] = 6;

		// Packet: 0x00CD
		length_list[0x00CD] = 3;

		// Packet: 0x00CE
		length_list[0x00CE] = 2;

		// Packet: 0x00CF
		length_list[0x00CF] = 27;

		// Packet: 0x00D0
		length_list[0x00D0] = 3;

		// Packet: 0x00D1
		length_list[0x00D1] = 4;

		// Packet: 0x00D2
		length_list[0x00D2] = 4;

		// Packet: 0x00D3
		length_list[0x00D3] = 2;

		// Packet: 0x00D4
		length_list[0x00D4] = -1;

		// Packet: 0x00D5
		length_list[0x00D5] = -1;

		// Packet: 0x00D6
		length_list[0x00D6] = 3;

		// Packet: 0x00D7
		length_list[0x00D7] = -1;

		// Packet: 0x00D8
		length_list[0x00D8] = 6;

		// Packet: 0x00D9
		length_list[0x00D9] = 14;

		// Packet: 0x00DA
		length_list[0x00DA] = 3;

		// Packet: 0x00DB
		length_list[0x00DB] = -1;

		// Packet: 0x00DC
		length_list[0x00DC] = 28;

		// Packet: 0x00DD
		length_list[0x00DD] = 29;

		// Packet: 0x00DE
		length_list[0x00DE] = -1;

		// Packet: 0x00DF
		length_list[0x00DF] = -1;

		// Packet: 0x00E0
		length_list[0x00E0] = 30;

		// Packet: 0x00E1
		length_list[0x00E1] = 30;

		// Packet: 0x00E2
		length_list[0x00E2] = 26;

		// Packet: 0x00E3
		length_list[0x00E3] = 2;

		// Packet: 0x00E4
		length_list[0x00E4] = 6;

		// Packet: 0x00E5
		length_list[0x00E5] = 26;

		// Packet: 0x00E6
		length_list[0x00E6] = 3;

		// Packet: 0x00E7
		length_list[0x00E7] = 3;

		// Packet: 0x00E8
		length_list[0x00E8] = 8;

		// Packet: 0x00E9
		length_list[0x00E9] = 29;

		// Packet: 0x00EA
		length_list[0x00EA] = 5;

		// Packet: 0x00EB
		length_list[0x00EB] = 2;

		// Packet: 0x00EC
		length_list[0x00EC] = 3;

		// Packet: 0x00ED
		length_list[0x00ED] = 2;

		// Packet: 0x00EE
		length_list[0x00EE] = 2;

		// Packet: 0x00EF
		length_list[0x00EF] = 2;

		// Packet: 0x00F0
		length_list[0x00F0] = 3;

		// Packet: 0x00F1
		length_list[0x00F1] = 2;

		// Packet: 0x00F2
		length_list[0x00F2] = 6;

		// Packet: 0x00F3
		length_list[0x00F3] = -1;

		// Packet: 0x00F4
		length_list[0x00F4] = 31;

		// Packet: 0x00F5
		length_list[0x00F5] = 11;

		// Packet: 0x00F6
		length_list[0x00F6] = 8;

		// Packet: 0x00F7
		length_list[0x00F7] = 17;

		// Packet: 0x00F8
		length_list[0x00F8] = 2;

		// Packet: 0x00F9
		length_list[0x00F9] = 26;

		// Packet: 0x00FA
		length_list[0x00FA] = 3;

		// Packet: 0x00FB
		length_list[0x00FB] = -1;

		// Packet: 0x00FC
		length_list[0x00FC] = 6;

		// Packet: 0x00FD
		length_list[0x00FD] = 27;

		// Packet: 0x00FE
		length_list[0x00FE] = 30;

		// Packet: 0x00FF
		length_list[0x00FF] = 10;

		// Packet: 0x0100
		length_list[0x0100] = 2;

		// Packet: 0x0101
		length_list[0x0101] = 6;

		// Packet: 0x0102
		length_list[0x0102] = 6;

		// Packet: 0x0103
		length_list[0x0103] = 30;

		// Packet: 0x0104
		length_list[0x0104] = 79;

		// Packet: 0x0105
		length_list[0x0105] = 31;

		// Packet: 0x0106
		length_list[0x0106] = 10;

		// Packet: 0x0107
		length_list[0x0107] = 10;

		// Packet: 0x0108
		length_list[0x0108] = -1;

		// Packet: 0x0109
		length_list[0x0109] = -1;

		// Packet: 0x010A
		length_list[0x010A] = 6;

		// Packet: 0x010B
		length_list[0x010B] = 6;

		// Packet: 0x010C
		length_list[0x010C] = 6;

		// Packet: 0x010D
		length_list[0x010D] = 2;

		// Packet: 0x010E
		length_list[0x010E] = 11;

		// Packet: 0x010F
		length_list[0x010F] = -1;

		// Packet: 0x0110
		length_list[0x0110] = 14;

		// Packet: 0x0111
		length_list[0x0111] = 39;

		// Packet: 0x0112
		length_list[0x0112] = 4;

		// Packet: 0x0113
		length_list[0x0113] = 25;

		// Packet: 0x0114
		length_list[0x0114] = 31;

		// Packet: 0x0115
		length_list[0x0115] = 35;

		// Packet: 0x0116
		length_list[0x0116] = 17;

		// Packet: 0x0117
		length_list[0x0117] = 18;

		// Packet: 0x0118
		length_list[0x0118] = 2;

		// Packet: 0x0119
		length_list[0x0119] = 13;

		// Packet: 0x011A
		length_list[0x011A] = 15;

		// Packet: 0x011B
		length_list[0x011B] = 20;

		// Packet: 0x011C
		length_list[0x011C] = 68;

		// Packet: 0x011D
		length_list[0x011D] = 2;

		// Packet: 0x011E
		length_list[0x011E] = 3;

		// Packet: 0x011F
		length_list[0x011F] = 16;

		// Packet: 0x0120
		length_list[0x0120] = 6;

		// Packet: 0x0121
		length_list[0x0121] = 14;

		// Packet: 0x0122
		length_list[0x0122] = -1;

		// Packet: 0x0123
		length_list[0x0123] = -1;

		// Packet: 0x0124
		length_list[0x0124] = 31;

		// Packet: 0x0125
		length_list[0x0125] = 8;

		// Packet: 0x0126
		length_list[0x0126] = 8;

		// Packet: 0x0127
		length_list[0x0127] = 8;

		// Packet: 0x0128
		length_list[0x0128] = 8;

		// Packet: 0x0129
		length_list[0x0129] = 8;

		// Packet: 0x012A
		length_list[0x012A] = 2;

		// Packet: 0x012B
		length_list[0x012B] = 2;

		// Packet: 0x012C
		length_list[0x012C] = 3;

		// Packet: 0x012D
		length_list[0x012D] = 4;

		// Packet: 0x012E
		length_list[0x012E] = 2;

		// Packet: 0x012F
		length_list[0x012F] = -1;

		// Packet: 0x0130
		length_list[0x0130] = 6;

		// Packet: 0x0131
		length_list[0x0131] = 86;

		// Packet: 0x0132
		length_list[0x0132] = 6;

		// Packet: 0x0133
		length_list[0x0133] = -1;

		// Packet: 0x0134
		length_list[0x0134] = -1;

		// Packet: 0x0135
		length_list[0x0135] = 7;

		// Packet: 0x0136
		length_list[0x0136] = -1;

		// Packet: 0x0137
		length_list[0x0137] = 6;

		// Packet: 0x0138
		length_list[0x0138] = 3;

		// Packet: 0x0139
		length_list[0x0139] = 16;

		// Packet: 0x013A
		length_list[0x013A] = 4;

		// Packet: 0x013B
		length_list[0x013B] = 4;

		// Packet: 0x013C
		length_list[0x013C] = 4;

		// Packet: 0x013D
		length_list[0x013D] = 6;

		// Packet: 0x013E
		length_list[0x013E] = 24;

		// Packet: 0x013F
		length_list[0x013F] = 26;

		// Packet: 0x0140
		length_list[0x0140] = 22;

		// Packet: 0x0141
		length_list[0x0141] = 14;

		// Packet: 0x0142
		length_list[0x0142] = 6;

		// Packet: 0x0143
		length_list[0x0143] = 10;

		// Packet: 0x0144
		length_list[0x0144] = 23;

		// Packet: 0x0145
		length_list[0x0145] = 19;

		// Packet: 0x0146
		length_list[0x0146] = 6;

		// Packet: 0x0147
		length_list[0x0147] = 39;

		// Packet: 0x0148
		length_list[0x0148] = 8;

		// Packet: 0x0149
		length_list[0x0149] = 9;

		// Packet: 0x014A
		length_list[0x014A] = 6;

		// Packet: 0x014B
		length_list[0x014B] = 27;

		// Packet: 0x014C
		length_list[0x014C] = -1;

		// Packet: 0x014D
		length_list[0x014D] = 2;

		// Packet: 0x014E
		length_list[0x014E] = 6;

		// Packet: 0x014F
		length_list[0x014F] = 6;

		// Packet: 0x0150
		length_list[0x0150] = 110;

		// Packet: 0x0151
		length_list[0x0151] = 6;

		// Packet: 0x0152
		length_list[0x0152] = -1;

		// Packet: 0x0153
		length_list[0x0153] = -1;

		// Packet: 0x0154
		length_list[0x0154] = -1;

		// Packet: 0x0155
		length_list[0x0155] = -1;

		// Packet: 0x0156
		length_list[0x0156] = -1;

		// Packet: 0x0157
		length_list[0x0157] = 6;

		// Packet: 0x0159
		length_list[0x0159] = 54;

		// Packet: 0x015A
		length_list[0x015A] = 66;

		// Packet: 0x015B
		length_list[0x015B] = 54;

		// Packet: 0x015C
		length_list[0x015C] = 90;

		// Packet: 0x015D
		length_list[0x015D] = 42;

		// Packet: 0x015E
		length_list[0x015E] = 6;

		// Packet: 0x015F
		length_list[0x015F] = 42;

		// Packet: 0x0160
		length_list[0x0160] = -1;

		// Packet: 0x0161
		length_list[0x0161] = -1;

		// Packet: 0x0162
		length_list[0x0162] = -1;

		// Packet: 0x0163
		length_list[0x0163] = -1;

		// Packet: 0x0164
		length_list[0x0164] = -1;

		// Packet: 0x0165
		length_list[0x0165] = 30;

		// Packet: 0x0166
		length_list[0x0166] = -1;

		// Packet: 0x0167
		length_list[0x0167] = 3;

		// Packet: 0x0168
		length_list[0x0168] = 14;

		// Packet: 0x0169
		length_list[0x0169] = 3;

		// Packet: 0x016A
		length_list[0x016A] = 30;

		// Packet: 0x016B
		length_list[0x016B] = 10;

		// Packet: 0x016C
		length_list[0x016C] = 43;

		// Packet: 0x016D
		length_list[0x016D] = 14;

		// Packet: 0x016E
		length_list[0x016E] = 186;

		// Packet: 0x016F
		length_list[0x016F] = 182;

		// Packet: 0x0170
		length_list[0x0170] = 14;

		// Packet: 0x0171
		length_list[0x0171] = 30;

		// Packet: 0x0172
		length_list[0x0172] = 10;

		// Packet: 0x0173
		length_list[0x0173] = 3;

		// Packet: 0x0174
		length_list[0x0174] = -1;

		// Packet: 0x0175
		length_list[0x0175] = 6;

		// Packet: 0x0176
		length_list[0x0176] = 106;

		// Packet: 0x0177
		length_list[0x0177] = -1;

		// Packet: 0x0178
		length_list[0x0178] = 4;

		// Packet: 0x0179
		length_list[0x0179] = 5;

		// Packet: 0x017A
		length_list[0x017A] = 4;

		// Packet: 0x017B
		length_list[0x017B] = -1;

		// Packet: 0x017C
		length_list[0x017C] = 6;

		// Packet: 0x017D
		length_list[0x017D] = 7;

		// Packet: 0x017E
		length_list[0x017E] = -1;

		// Packet: 0x017F
		length_list[0x017F] = -1;

		// Packet: 0x0180
		length_list[0x0180] = 6;

		// Packet: 0x0181
		length_list[0x0181] = 3;

		// Packet: 0x0182
		length_list[0x0182] = 106;

		// Packet: 0x0183
		length_list[0x0183] = 10;

		// Packet: 0x0184
		length_list[0x0184] = 10;

		// Packet: 0x0185
		length_list[0x0185] = 34;

		// Packet: 0x0187
		length_list[0x0187] = 6;

		// Packet: 0x0188
		length_list[0x0188] = 8;

		// Packet: 0x0189
		length_list[0x0189] = 4;

		// Packet: 0x018A
		length_list[0x018A] = 4;

		// Packet: 0x018B
		length_list[0x018B] = 4;

		// Packet: 0x018C
		length_list[0x018C] = 29;

		// Packet: 0x018D
		length_list[0x018D] = -1;

		// Packet: 0x018E
		length_list[0x018E] = 18;

		// Packet: 0x018F
		length_list[0x018F] = 8;

		// Packet: 0x0190
		length_list[0x0190] = 23;

		// Packet: 0x0191
		length_list[0x0191] = 27;

		// Packet: 0x0192
		length_list[0x0192] = 24;

		// Packet: 0x0193
		length_list[0x0193] = 2;

		// Packet: 0x0194
		length_list[0x0194] = 30;

		// Packet: 0x0195
		length_list[0x0195] = 102;

		// Packet: 0x0196
		length_list[0x0196] = 9;

		// Packet: 0x0197
		length_list[0x0197] = 4;

		// Packet: 0x0198
		length_list[0x0198] = 8;

		// Packet: 0x0199
		length_list[0x0199] = 4;

		// Packet: 0x019A
		length_list[0x019A] = 14;

		// Packet: 0x019B
		length_list[0x019B] = 10;

		// Packet: 0x019C
		length_list[0x019C] = -1;

		// Packet: 0x019D
		length_list[0x019D] = 6;

		// Packet: 0x019E
		length_list[0x019E] = 2;

		// Packet: 0x019F
		length_list[0x019F] = 6;

		// Packet: 0x01A0
		length_list[0x01A0] = 3;

		// Packet: 0x01A1
		length_list[0x01A1] = 3;

		// Packet: 0x01A2
		length_list[0x01A2] = 37;

		// Packet: 0x01A3
		length_list[0x01A3] = 7;

		// Packet: 0x01A4
		length_list[0x01A4] = 11;

		// Packet: 0x01A5
		length_list[0x01A5] = 26;

		// Packet: 0x01A6
		length_list[0x01A6] = -1;

		// Packet: 0x01A7
		length_list[0x01A7] = 4;

		// Packet: 0x01A8
		length_list[0x01A8] = 4;

		// Packet: 0x01A9
		length_list[0x01A9] = 6;

		// Packet: 0x01AA
		length_list[0x01AA] = 10;

		// Packet: 0x01AB
		length_list[0x01AB] = 12;

		// Packet: 0x01AC
		length_list[0x01AC] = 6;

		// Packet: 0x01AD
		length_list[0x01AD] = -1;

		// Packet: 0x01AE
		length_list[0x01AE] = 6;

		// Packet: 0x01AF
		length_list[0x01AF] = 4;

		// Packet: 0x01B0
		length_list[0x01B0] = 11;

		// Packet: 0x01B1
		length_list[0x01B1] = 7;

		// Packet: 0x01B2
		length_list[0x01B2] = -1;

		// Packet: 0x01B3
		length_list[0x01B3] = 67;

		// Packet: 0x01B4
		length_list[0x01B4] = 12;

		// Packet: 0x01B5
		length_list[0x01B5] = 18;

		// Packet: 0x01B6
		length_list[0x01B6] = 114;

		// Packet: 0x01B7
		length_list[0x01B7] = 6;

		// Packet: 0x01B8
		length_list[0x01B8] = 3;

		// Packet: 0x01B9
		length_list[0x01B9] = 6;

		// Packet: 0x01BA
		length_list[0x01BA] = 26;

		// Packet: 0x01BB
		length_list[0x01BB] = 26;

		// Packet: 0x01BC
		length_list[0x01BC] = 26;

		// Packet: 0x01BD
		length_list[0x01BD] = 26;

		// Packet: 0x01BE
		length_list[0x01BE] = 2;

		// Packet: 0x01BF
		length_list[0x01BF] = 3;

		// Packet: 0x01C0
		length_list[0x01C0] = 2;

		// Packet: 0x01C1
		length_list[0x01C1] = 14;

		// Packet: 0x01C2
		length_list[0x01C2] = 10;

		// Packet: 0x01C3
		length_list[0x01C3] = -1;

		// Packet: 0x01C4
		length_list[0x01C4] = 32;

		// Packet: 0x01C5
		length_list[0x01C5] = 32;

		// Packet: 0x01C6
		length_list[0x01C6] = 4;

		// Packet: 0x01C7
		length_list[0x01C7] = 2;

		// Packet: 0x01C8
		length_list[0x01C8] = 15;

		// Packet: 0x01C9
		length_list[0x01C9] = 97;

		// Packet: 0x01CA
		length_list[0x01CA] = 3;

		// Packet: 0x01CB
		length_list[0x01CB] = 9;

		// Packet: 0x01CC
		length_list[0x01CC] = 9;

		// Packet: 0x01CD
		length_list[0x01CD] = 30;

		// Packet: 0x01CE
		length_list[0x01CE] = 6;

		// Packet: 0x01CF
		length_list[0x01CF] = 28;

		// Packet: 0x01D0
		length_list[0x01D0] = 8;

		// Packet: 0x01D1
		length_list[0x01D1] = 14;

		// Packet: 0x01D2
		length_list[0x01D2] = 10;

		// Packet: 0x01D3
		length_list[0x01D3] = 35;

		// Packet: 0x01D4
		length_list[0x01D4] = 6;

		// Packet: 0x01D5
		length_list[0x01D5] = -1;

		// Packet: 0x01D6
		length_list[0x01D6] = 4;

		// Packet: 0x01D7
		length_list[0x01D7] = 15;

		// Packet: 0x01D8
		length_list[0x01D8] = 58;

		// Packet: 0x01D9
		length_list[0x01D9] = 57;

		// Packet: 0x01DA
		length_list[0x01DA] = 64;

		// Packet: 0x01DB
		length_list[0x01DB] = 2;

		// Packet: 0x01DC
		length_list[0x01DC] = -1;

		// Packet: 0x01DD
		length_list[0x01DD] = 47;

		// Packet: 0x01DE
		length_list[0x01DE] = 33;

		// Packet: 0x01DF
		length_list[0x01DF] = 6;

		// Packet: 0x01E0
		length_list[0x01E0] = 30;

		// Packet: 0x01E1
		length_list[0x01E1] = 8;

		// Packet: 0x01E2
		length_list[0x01E2] = 34;

		// Packet: 0x01E3
		length_list[0x01E3] = 14;

		// Packet: 0x01E4
		length_list[0x01E4] = 2;

		// Packet: 0x01E5
		length_list[0x01E5] = 6;

		// Packet: 0x01E6
		length_list[0x01E6] = 26;

		// Packet: 0x01E7
		length_list[0x01E7] = 2;

		// Packet: 0x01E8
		length_list[0x01E8] = 28;

		// Packet: 0x01E9
		length_list[0x01E9] = 81;

		// Packet: 0x01EA
		length_list[0x01EA] = 6;

		// Packet: 0x01EB
		length_list[0x01EB] = 10;

		// Packet: 0x01EC
		length_list[0x01EC] = 26;

		// Packet: 0x01ED
		length_list[0x01ED] = 2;

		// Packet: 0x01EE
		length_list[0x01EE] = -1;

		// Packet: 0x01EF
		length_list[0x01EF] = -1;

		// Packet: 0x01F0
		length_list[0x01F0] = -1;

		// Packet: 0x01F1
		length_list[0x01F1] = -1;

		// Packet: 0x01F2
		length_list[0x01F2] = 20;

		// Packet: 0x01F3
		length_list[0x01F3] = 10;

		// Packet: 0x01F4
		length_list[0x01F4] = 32;

		// Packet: 0x01F5
		length_list[0x01F5] = 9;

		// Packet: 0x01F6
		length_list[0x01F6] = 34;

		// Packet: 0x01F7
		length_list[0x01F7] = 14;

		// Packet: 0x01F8
		length_list[0x01F8] = 2;

		// Packet: 0x01F9
		length_list[0x01F9] = 6;

		// Packet: 0x01FA
		length_list[0x01FA] = 48;

		// Packet: 0x01FB
		length_list[0x01FB] = 56;

		// Packet: 0x01FC
		length_list[0x01FC] = -1;

		// Packet: 0x01FD
		length_list[0x01FD] = 25;

		// Packet: 0x01FE
		length_list[0x01FE] = 5;

		// Packet: 0x01FF
		length_list[0x01FF] = 10;

		// Packet: 0x0200
		length_list[0x0200] = 26;

		// Packet: 0x0201
		length_list[0x0201] = -1;

		// Packet: 0x0202
		length_list[0x0202] = 26;

		// Packet: 0x0203
		length_list[0x0203] = 10;

		// Packet: 0x0204
		length_list[0x0204] = 18;

		// Packet: 0x0205
		length_list[0x0205] = 26;

		// Packet: 0x0206
		length_list[0x0206] = 35;

		// Packet: 0x0207
		length_list[0x0207] = 34;

		// Packet: 0x0208
		length_list[0x0208] = 14;

		// Packet: 0x0209
		length_list[0x0209] = 36;

		// Packet: 0x020A
		length_list[0x020A] = 10;

		// Packet: 0x020D
		length_list[0x020D] = -1;

		// Packet: 0x020E
		length_list[0x020E] = 32;

		// Packet: 0x0212
		length_list[0x0212] = 26;

		// Packet: 0x0213
		length_list[0x0213] = 26;

		// Packet: 0x0214
		length_list[0x0214] = 42;

		// Packet: 0x0215
		length_list[0x0215] = 6;

		// Packet: 0x0216
		length_list[0x0216] = 6;

		// Packet: 0x0217
		length_list[0x0217] = 2;

		// Packet: 0x0218
		length_list[0x0218] = 2;

		// Packet: 0x0219
		length_list[0x0219] = 282;

		// Packet: 0x021A
		length_list[0x021A] = 282;

		// Packet: 0x021B
		length_list[0x021B] = 10;

		// Packet: 0x021C
		length_list[0x021C] = 10;

		// Packet: 0x021D
		length_list[0x021D] = 6;

		// Packet: 0x021E
		length_list[0x021E] = 6;

		// Packet: 0x021F
		length_list[0x021F] = 66;

		// Packet: 0x0220
		length_list[0x0220] = 10;

		// Packet: 0x0221
		length_list[0x0221] = -1;

		// Packet: 0x0222
		length_list[0x0222] = 6;

		// Packet: 0x0223
		length_list[0x0223] = 10;

		// Packet: 0x0224
		length_list[0x0224] = 10;

		// Packet: 0x0225
		length_list[0x0225] = 2;

		// Packet: 0x0226
		length_list[0x0226] = 282;

		// Packet: 0x0227
		length_list[0x0227] = 18;

		// Packet: 0x0228
		length_list[0x0228] = 18;

		// Packet: 0x0229
		length_list[0x0229] = 15;

		// Packet: 0x022A
		length_list[0x022A] = 62;

		// Packet: 0x022B
		length_list[0x022B] = 61;

		// Packet: 0x022C
		length_list[0x022C] = 69;

		// Packet: 0x022D
		length_list[0x022D] = 5;

		// Packet: 0x022E
		length_list[0x022E] = 73;

		// Packet: 0x022F
		length_list[0x022F] = 7;

		// Packet: 0x0230
		length_list[0x0230] = 12;

		// Packet: 0x0231
		length_list[0x0231] = 26;

		// Packet: 0x0232
		length_list[0x0232] = 9;

		// Packet: 0x0233
		length_list[0x0233] = 11;

		// Packet: 0x0234
		length_list[0x0234] = 6;

		// Packet: 0x0235
		length_list[0x0235] = -1;

		// Packet: 0x0236
		length_list[0x0236] = 10;

		// Packet: 0x0237
		length_list[0x0237] = 2;

		// Packet: 0x0238
		length_list[0x0238] = 282;

		// Packet: 0x0239
		length_list[0x0239] = 11;

		// Packet: 0x023A
		length_list[0x023A] = 4;

		// Packet: 0x023B
		length_list[0x023B] = 36;

		// Packet: 0x023C
		length_list[0x023C] = 6;

		// Packet: 0x023D
		length_list[0x023D] = 6;

		// Packet: 0x023E
		length_list[0x023E] = 8;

		// Packet: 0x023F
		length_list[0x023F] = 2;

		// Packet: 0x0240
		length_list[0x0240] = -1;

		// Packet: 0x0241
		length_list[0x0241] = 6;

		// Packet: 0x0242
		length_list[0x0242] = -1;

		// Packet: 0x0243
		length_list[0x0243] = 6;

		// Packet: 0x0244
		length_list[0x0244] = 6;

		// Packet: 0x0245
		length_list[0x0245] = 3;

		// Packet: 0x0246
		length_list[0x0246] = 4;

		// Packet: 0x0247
		length_list[0x0247] = 8;

		// Packet: 0x0248
		length_list[0x0248] = -1;

		// Packet: 0x0249
		length_list[0x0249] = 3;

		// Packet: 0x024A
		length_list[0x024A] = 70;

		// Packet: 0x024B
		length_list[0x024B] = 4;

		// Packet: 0x024C
		length_list[0x024C] = 8;

		// Packet: 0x024D
		length_list[0x024D] = 12;

		// Packet: 0x024E
		length_list[0x024E] = 6;

		// Packet: 0x024F
		length_list[0x024F] = 10;

		// Packet: 0x0250
		length_list[0x0250] = 3;

		// Packet: 0x0251
		length_list[0x0251] = 34;

		// Packet: 0x0252
		length_list[0x0252] = -1;

		// Packet: 0x0253
		length_list[0x0253] = 3;

		// Packet: 0x0254
		length_list[0x0254] = 3;

		// Packet: 0x0255
		length_list[0x0255] = 5;

		// Packet: 0x0256
		length_list[0x0256] = 5;

		// Packet: 0x0257
		length_list[0x0257] = 8;

		// Packet: 0x0258
		length_list[0x0258] = 2;

		// Packet: 0x0259
		length_list[0x0259] = 3;

		// Packet: 0x025A
		length_list[0x025A] = -1;

		// Packet: 0x025B
		length_list[0x025B] = 8;

		// Packet: 0x025C
		length_list[0x025C] = 4;

		// Packet: 0x025D
		length_list[0x025D] = 6;

		// Packet: 0x025E
		length_list[0x025E] = 4;

		// Packet: 0x025F
		length_list[0x025F] = 6;

		// Packet: 0x0260
		length_list[0x0260] = 6;

		// Packet: 0x0261
		length_list[0x0261] = 11;

		// Packet: 0x0262
		length_list[0x0262] = 11;

		// Packet: 0x0263
		length_list[0x0263] = 11;

		// Packet: 0x0264
		length_list[0x0264] = 20;

		// Packet: 0x0265
		length_list[0x0265] = 20;

		// Packet: 0x0266
		length_list[0x0266] = 30;

		// Packet: 0x0267
		length_list[0x0267] = 4;

		// Packet: 0x0268
		length_list[0x0268] = 4;

		// Packet: 0x0269
		length_list[0x0269] = 4;

		// Packet: 0x026A
		length_list[0x026A] = 4;

		// Packet: 0x026B
		length_list[0x026B] = 4;

		// Packet: 0x026C
		length_list[0x026C] = 4;

		// Packet: 0x026D
		length_list[0x026D] = 4;

		// Packet: 0x026F
		length_list[0x026F] = 2;

		// Packet: 0x0270
		length_list[0x0270] = 2;

		// Packet: 0x0271
		length_list[0x0271] = 40;

		// Packet: 0x0272
		length_list[0x0272] = 44;

		// Packet: 0x0273
		length_list[0x0273] = 30;

		// Packet: 0x0274
		length_list[0x0274] = 8;

		// Packet: 0x0275
		length_list[0x0275] = 37;

		// Packet: 0x0276
		length_list[0x0276] = -1;

		// Packet: 0x0277
		length_list[0x0277] = 84;

		// Packet: 0x0278
		length_list[0x0278] = 2;

		// Packet: 0x0279
		length_list[0x0279] = 2;

		// Packet: 0x027A
		length_list[0x027A] = -1;

		// Packet: 0x027B
		length_list[0x027B] = 14;

		// Packet: 0x027C
		length_list[0x027C] = 60;

		// Packet: 0x027D
		length_list[0x027D] = 62;

		// Packet: 0x027E
		length_list[0x027E] = -1;

		// Packet: 0x027F
		length_list[0x027F] = 8;

		// Packet: 0x0280
		length_list[0x0280] = 12;

		// Packet: 0x0281
		length_list[0x0281] = 4;

		// Packet: 0x0282
		length_list[0x0282] = 284;

		// Packet: 0x0283
		length_list[0x0283] = 6;

		// Packet: 0x0284
		length_list[0x0284] = 14;

		// Packet: 0x0285
		length_list[0x0285] = 6;

		// Packet: 0x0286
		length_list[0x0286] = 4;

		// Packet: 0x0287
		length_list[0x0287] = -1;

		// Packet: 0x0288
		length_list[0x0288] = -1;

		// Packet: 0x0289
		length_list[0x0289] = 12;

		// Packet: 0x028A
		length_list[0x028A] = 18;

		// Packet: 0x028B
		length_list[0x028B] = -1;

		// Packet: 0x028C
		length_list[0x028C] = 46;

		// Packet: 0x028D
		length_list[0x028D] = 34;

		// Packet: 0x028E
		length_list[0x028E] = 4;

		// Packet: 0x028F
		length_list[0x028F] = 6;

		// Packet: 0x0290
		length_list[0x0290] = 4;

		// Packet: 0x0291
		length_list[0x0291] = 4;

		// Packet: 0x0292
		length_list[0x0292] = 2;

		// Packet: 0x0293
		length_list[0x0293] = 70;

		// Packet: 0x0294
		length_list[0x0294] = 10;

		// Packet: 0x0295
		length_list[0x0295] = -1;

		// Packet: 0x0296
		length_list[0x0296] = -1;

		// Packet: 0x0297
		length_list[0x0297] = -1;

		// Packet: 0x0298
		length_list[0x0298] = 10;

		// Packet: 0x0299
		length_list[0x0299] = 8;

		// Packet: 0x029A
		length_list[0x029A] = 37;

		// Packet: 0x029B
		length_list[0x029B] = 80;

		// Packet: 0x029C
		length_list[0x029C] = 66;

		// Packet: 0x029D
		length_list[0x029D] = -1;

		// Packet: 0x029E
		length_list[0x029E] = 11;

		// Packet: 0x029F
		length_list[0x029F] = 3;

		// Packet: 0x02A2
		length_list[0x02A2] = 8;

		// Packet: 0x02A5
		length_list[0x02A5] = 8;

		// Packet: 0x02A6
		length_list[0x02A6] = -1;

		// Packet: 0x02A7
		length_list[0x02A7] = -1;

		// Packet: 0x02AA
		length_list[0x02AA] = 4;

		// Packet: 0x02AB
		length_list[0x02AB] = 36;

		// Packet: 0x02AC
		length_list[0x02AC] = 6;

		// Packet: 0x02AD
		length_list[0x02AD] = 8;

		// Packet: 0x02B0
		length_list[0x02B0] = 85;

		// Packet: 0x02B1
		length_list[0x02B1] = -1;

		// Packet: 0x02B2
		length_list[0x02B2] = -1;

		// Packet: 0x02B3
		length_list[0x02B3] = 107;

		// Packet: 0x02B4
		length_list[0x02B4] = 6;

		// Packet: 0x02B5
		length_list[0x02B5] = -1;

		// Packet: 0x02B6
		length_list[0x02B6] = 7;

		// Packet: 0x02B7
		length_list[0x02B7] = 7;

		// Packet: 0x02B8
		length_list[0x02B8] = 32;

		// Packet: 0x02B9
		length_list[0x02B9] = 191;

		// Packet: 0x02BA
		length_list[0x02BA] = 11;

		// Packet: 0x02BB
		length_list[0x02BB] = 8;

		// Packet: 0x02BC
		length_list[0x02BC] = 6;

		// Packet: 0x02C1
		length_list[0x02C1] = -1;

		// Packet: 0x02C2
		length_list[0x02C2] = -1;

		// Packet: 0x02C4
		length_list[0x02C4] = 26;

		// Packet: 0x02C5
		length_list[0x02C5] = 30;

		// Packet: 0x02C6
		length_list[0x02C6] = 30;

		// Packet: 0x02C7
		length_list[0x02C7] = 7;

		// Packet: 0x02C8
		length_list[0x02C8] = 3;

		// Packet: 0x02C9
		length_list[0x02C9] = 3;

		// Packet: 0x02CA
		length_list[0x02CA] = 3;

		// Packet: 0x02CB
		length_list[0x02CB] = 65;

		// Packet: 0x02CC
		length_list[0x02CC] = 4;

		// Packet: 0x02CD
		length_list[0x02CD] = 71;

		// Packet: 0x02CE
		length_list[0x02CE] = 10;

		// Packet: 0x02CF
		length_list[0x02CF] = 6;

		// Packet: 0x02D0
		length_list[0x02D0] = -1;

		// Packet: 0x02D1
		length_list[0x02D1] = -1;

		// Packet: 0x02D2
		length_list[0x02D2] = -1;

		// Packet: 0x02D3
		length_list[0x02D3] = 4;

		// Packet: 0x02D4
		length_list[0x02D4] = 39;

		// Packet: 0x02D5
		length_list[0x02D5] = 2;

		// Packet: 0x02D6
		length_list[0x02D6] = 6;

		// Packet: 0x02D7
		length_list[0x02D7] = -1;

		// Packet: 0x02D8
		length_list[0x02D8] = 10;

		// Packet: 0x02D9
		length_list[0x02D9] = 10;

		// Packet: 0x02DA
		length_list[0x02DA] = 3;

		// Packet: 0x02DB
		length_list[0x02DB] = -1;

		// Packet: 0x02DC
		length_list[0x02DC] = -1;

		// Packet: 0x02DD
		length_list[0x02DD] = 32;

		// Packet: 0x02DE
		length_list[0x02DE] = 6;

		// Packet: 0x02DF
		length_list[0x02DF] = 36;

		// Packet: 0x02E0
		length_list[0x02E0] = 34;

		// Packet: 0x02E1
		length_list[0x02E1] = 33;

		// Packet: 0x02E2
		length_list[0x02E2] = 20;

		// Packet: 0x02E3
		length_list[0x02E3] = 22;

		// Packet: 0x02E4
		length_list[0x02E4] = 11;

		// Packet: 0x02E5
		length_list[0x02E5] = 9;

		// Packet: 0x02E6
		length_list[0x02E6] = 6;

		// Packet: 0x02E7
		length_list[0x02E7] = -1;

		// Packet: 0x02E8
		length_list[0x02E8] = -1;

		// Packet: 0x02E9
		length_list[0x02E9] = -1;

		// Packet: 0x02EA
		length_list[0x02EA] = -1;

		// Packet: 0x02EB
		length_list[0x02EB] = 13;

		// Packet: 0x02EC
		length_list[0x02EC] = 71;

		// Packet: 0x02ED
		length_list[0x02ED] = 63;

		// Packet: 0x02EE
		length_list[0x02EE] = 64;

		// Packet: 0x02EF
		length_list[0x02EF] = 8;

		// Packet: 0x02F0
		length_list[0x02F0] = 10;

		// Packet: 0x02F1
		length_list[0x02F1] = 2;

		// Packet: 0x02F2
		length_list[0x02F2] = 2;

		// Packet: 0x02F3
		length_list[0x02F3] = -1;

		// Packet: 0x02F4
		length_list[0x02F4] = 3;

		// Packet: 0x02F5
		length_list[0x02F5] = 7;

		// Packet: 0x02F6
		length_list[0x02F6] = 7;

		// Packet: 0x02F7
		length_list[0x02F7] = 47;

		// Packet: 0x02F8
		length_list[0x02F8] = -1;

		// Packet: 0x02F9
		length_list[0x02F9] = -1;

		// Packet: 0x035C
		length_list[0x035C] = 2;

		// Packet: 0x035D
		length_list[0x035D] = -1;

		// Packet: 0x035E
		length_list[0x035E] = 2;

		// Packet: 0x035F
		length_list[0x035F] = 5;

		// Packet: 0x0360
		length_list[0x0360] = 6;

		// Packet: 0x0361
		length_list[0x0361] = 5;

		// Packet: 0x0362
		length_list[0x0362] = 6;

		// Packet: 0x0363
		length_list[0x0363] = 6;

		// Packet: 0x0364
		length_list[0x0364] = 8;

		// Packet: 0x0365
		length_list[0x0365] = 8;

		// Packet: 0x0366
		length_list[0x0366] = 10;

		// Packet: 0x0367
		length_list[0x0367] = 31;

		// Packet: 0x0368
		length_list[0x0368] = 6;

		// Packet: 0x0369
		length_list[0x0369] = 6;

		// Packet: 0x03DD
		length_list[0x03DD] = 18;

		// Packet: 0x03DE
		length_list[0x03DE] = 18;

		// Packet: 0x0436
		length_list[0x0436] = 23;

		// Packet: 0x0437
		length_list[0x0437] = 7;

		// Packet: 0x0438
		length_list[0x0438] = 10;

		// Packet: 0x0439
		length_list[0x0439] = 8;

		// Packet: 0x043D
		length_list[0x043D] = 8;

		// Packet: 0x043E
		length_list[0x043E] = -1;

		// Packet: 0x043F
		length_list[0x043F] = 25;

		// Packet: 0x0440
		length_list[0x0440] = 10;

		// Packet: 0x0441
		length_list[0x0441] = 4;

		// Packet: 0x0442
		length_list[0x0442] = -1;

		// Packet: 0x0443
		length_list[0x0443] = 8;

		// Packet: 0x0444
		length_list[0x0444] = -1;

		// Packet: 0x0445
		length_list[0x0445] = 12;

		// Packet: 0x0446
		length_list[0x0446] = 14;

		// Packet: 0x0447
		length_list[0x0447] = 2;

		// Packet: 0x0448
		length_list[0x0448] = -1;

		// Packet: 0x0449
		length_list[0x0449] = 4;

		// Packet: 0x044A
		length_list[0x044A] = 6;

		// Packet: 0x044B
		length_list[0x044B] = 2;

		// Packet: 0x07D7
		length_list[0x07D7] = 8;

		// Packet: 0x07D8
		length_list[0x07D8] = 8;

		// Packet: 0x07D9
		length_list[0x07D9] = 268;

		// Packet: 0x07DA
		length_list[0x07DA] = 6;

		// Packet: 0x07DB
		length_list[0x07DB] = 8;

		// Packet: 0x07DC
		length_list[0x07DC] = 6;

		// Packet: 0x07DD
		length_list[0x07DD] = 54;

		// Packet: 0x07DE
		length_list[0x07DE] = 30;

		// Packet: 0x07DF
		length_list[0x07DF] = 54;

		// Packet: 0x07E0
		length_list[0x07E0] = 58;

		// Packet: 0x07E1
		length_list[0x07E1] = 15;

		// Packet: 0x07E2
		length_list[0x07E2] = 8;

		// Packet: 0x07E3
		length_list[0x07E3] = 6;

		// Packet: 0x07E4
		length_list[0x07E4] = -1;

		// Packet: 0x07E5
		length_list[0x07E5] = 4;

		// Packet: 0x07E6
		length_list[0x07E6] = 8;

		// Packet: 0x07E7
		length_list[0x07E7] = 32;

		// Packet: 0x07E8
		length_list[0x07E8] = -1;

		// Packet: 0x07E9
		length_list[0x07E9] = 5;

		// Packet: 0x07EA
		length_list[0x07EA] = 2;

		// Packet: 0x07EB
		length_list[0x07EB] = -1;

		// Packet: 0x07EC
		length_list[0x07EC] = 8;

		// Packet: 0x07ED
		length_list[0x07ED] = 10;

		// Packet: 0x07EE
		length_list[0x07EE] = 6;

		// Packet: 0x07EF
		length_list[0x07EF] = 8;

		// Packet: 0x07F0
		length_list[0x07F0] = 6;

		// Packet: 0x07F1
		length_list[0x07F1] = 18;

		// Packet: 0x07F2
		length_list[0x07F2] = 8;

		// Packet: 0x07F3
		length_list[0x07F3] = 6;

		// Packet: 0x07F4
		length_list[0x07F4] = 3;

		// Packet: 0x07F5
		length_list[0x07F5] = 6;

		// Packet: 0x07F6
		length_list[0x07F6] = 14;

		// Packet: 0x07F7
		length_list[0x07F7] = -1;

		// Packet: 0x07F8
		length_list[0x07F8] = -1;

		// Packet: 0x07F9
		length_list[0x07F9] = -1;

		// Packet: 0x07FA
		length_list[0x07FA] = 8;

		// Packet: 0x07FB
		length_list[0x07FB] = 25;

		// Packet: 0x07FC
		length_list[0x07FC] = 10;

		// Packet: 0x07FD
		length_list[0x07FD] = -1;

		// Packet: 0x07FE
		length_list[0x07FE] = 26;

		// Packet: 0x0800
		length_list[0x0800] = -1;

		// Packet: 0x0801
		length_list[0x0801] = -1;

		// Packet: 0x0802
		length_list[0x0802] = 18;

		// Packet: 0x0803
		length_list[0x0803] = 4;

		// Packet: 0x0804
		length_list[0x0804] = 14;

		// Packet: 0x0805
		length_list[0x0805] = -1;

		// Packet: 0x0806
		length_list[0x0806] = 2;

		// Packet: 0x0807
		length_list[0x0807] = 4;

		// Packet: 0x0808
		length_list[0x0808] = 14;

		// Packet: 0x0809
		length_list[0x0809] = 50;

		// Packet: 0x080A
		length_list[0x080A] = 18;

		// Packet: 0x080B
		length_list[0x080B] = 6;

		// Packet: 0x080C
		length_list[0x080C] = 2;

		// Packet: 0x080D
		length_list[0x080D] = 3;

		// Packet: 0x080E
		length_list[0x080E] = 14;

		// Packet: 0x080F
		length_list[0x080F] = 30;

		// Packet: 0x0810
		length_list[0x0810] = 3;

		// Packet: 0x0811
		length_list[0x0811] = -1;

		// Packet: 0x0812
		length_list[0x0812] = 8;

		// Packet: 0x0813
		length_list[0x0813] = -1;

		// Packet: 0x0814
		length_list[0x0814] = 86;

		// Packet: 0x0815
		length_list[0x0815] = 2;

		// Packet: 0x0816
		length_list[0x0816] = 6;

		// Packet: 0x0817
		length_list[0x0817] = 6;

		// Packet: 0x0818
		length_list[0x0818] = -1;

		// Packet: 0x0819
		length_list[0x0819] = -1;

		// Packet: 0x081A
		length_list[0x081A] = 4;

		// Packet: 0x081B
		length_list[0x081B] = 12;

		// Packet: 0x081C
		length_list[0x081C] = 10;

		// Packet: 0x081D
		length_list[0x081D] = 22;

		// Packet: 0x081E
		length_list[0x081E] = 8;

		// Packet: 0x081F
		length_list[0x081F] = -1;

		// Packet: 0x0820
		length_list[0x0820] = 11;

		// Packet: 0x0821
		length_list[0x0821] = 2;

		// Packet: 0x0822
		length_list[0x0822] = 9;

		// Packet: 0x0823
		length_list[0x0823] = -1;

		// Packet: 0x0824
		length_list[0x0824] = 8;

		// Packet: 0x0825
		length_list[0x0825] = -1;

		// Packet: 0x0827
		length_list[0x0827] = 6;

		// Packet: 0x0828
		length_list[0x0828] = 14;

		// Packet: 0x0829
		length_list[0x0829] = 12;

		// Packet: 0x082A
		length_list[0x082A] = 10;

		// Packet: 0x082B
		length_list[0x082B] = 6;

		// Packet: 0x082C
		length_list[0x082C] = 10;

		// Packet: 0x082D
		length_list[0x082D] = -1;

		// Packet: 0x0835
		length_list[0x0835] = -1;

		// Packet: 0x0836
		length_list[0x0836] = -1;

		// Packet: 0x0837
		length_list[0x0837] = 3;

		// Packet: 0x0838
		length_list[0x0838] = 2;

		// Packet: 0x0839
		length_list[0x0839] = 66;

		// Packet: 0x083A
		length_list[0x083A] = 5;

		// Packet: 0x083B
		length_list[0x083B] = 2;

		// Packet: 0x083C
		length_list[0x083C] = 14;

		// Packet: 0x083D
		length_list[0x083D] = 6;

		// Packet: 0x083E
		length_list[0x083E] = 26;

		// Packet: 0x0840
		length_list[0x0840] = -1;

		// Packet: 0x0841
		length_list[0x0841] = 4;

		// Packet: 0x0842
		length_list[0x0842] = 6;

		// Packet: 0x0843
		length_list[0x0843] = 6;

		// Packet: 0x0844
		length_list[0x0844] = 2;

		// Packet: 0x0845
		length_list[0x0845] = 10;

		// Packet: 0x0846
		length_list[0x0846] = 4;

		// Packet: 0x0847
		length_list[0x0847] = -1;

		// Packet: 0x0848
		length_list[0x0848] = -1;

		// Packet: 0x0849
		length_list[0x0849] = 16;

		// Packet: 0x084A
		length_list[0x084A] = 2;

		// Packet: 0x084B
		length_list[0x084B] = 21;

		// Packet: 0x084C
		length_list[0x084C] = 10;

		// Packet: 0x084D
		length_list[0x084D] = 10;

		// Packet: 0x084E
		length_list[0x084E] = 5;

		// Packet: 0x084F
		length_list[0x084F] = 6;

		// Packet: 0x0850
		length_list[0x0850] = 7;

		// Packet: 0x0851
		length_list[0x0851] = -1;

		// Packet: 0x0852
		length_list[0x0852] = 2;

		// Packet: 0x0853
		length_list[0x0853] = -1;

		// Packet: 0x0854
		length_list[0x0854] = -1;

		// Packet: 0x0855
		length_list[0x0855] = 6;

		// Packet: 0x0856
		length_list[0x0856] = -1;

		// Packet: 0x0857
		length_list[0x0857] = -1;

		// Packet: 0x0858
		length_list[0x0858] = -1;

		// Packet: 0x0859
		length_list[0x0859] = -1;

		// Packet: 0x085A
		length_list[0x085A] = 2;

		// Packet: 0x085B
		length_list[0x085B] = 2;

		// Packet: 0x085C
		length_list[0x085C] = 2;

		// Packet: 0x085D
		length_list[0x085D] = 2;

		// Packet: 0x085E
		length_list[0x085E] = 2;

		// Packet: 0x085F
		length_list[0x085F] = 2;

		// Packet: 0x0860
		length_list[0x0860] = 2;

		// Packet: 0x0861
		length_list[0x0861] = 2;

		// Packet: 0x0862
		length_list[0x0862] = 2;

		// Packet: 0x0863
		length_list[0x0863] = 2;

		// Packet: 0x0864
		length_list[0x0864] = 2;

		// Packet: 0x0865
		length_list[0x0865] = 2;

		// Packet: 0x0866
		length_list[0x0866] = 2;

		// Packet: 0x0867
		length_list[0x0867] = 2;

		// Packet: 0x0868
		length_list[0x0868] = 2;

		// Packet: 0x0869
		length_list[0x0869] = 2;

		// Packet: 0x086A
		length_list[0x086A] = 2;

		// Packet: 0x086B
		length_list[0x086B] = 2;

		// Packet: 0x086C
		length_list[0x086C] = 2;

		// Packet: 0x086D
		length_list[0x086D] = 2;

		// Packet: 0x086E
		length_list[0x086E] = 2;

		// Packet: 0x086F
		length_list[0x086F] = 2;

		// Packet: 0x0870
		length_list[0x0870] = 2;

		// Packet: 0x0871
		length_list[0x0871] = 2;

		// Packet: 0x0872
		length_list[0x0872] = 2;

		// Packet: 0x0873
		length_list[0x0873] = 2;

		// Packet: 0x0874
		length_list[0x0874] = 2;

		// Packet: 0x0875
		length_list[0x0875] = 2;

		// Packet: 0x0876
		length_list[0x0876] = 2;

		// Packet: 0x0877
		length_list[0x0877] = 2;

		// Packet: 0x0878
		length_list[0x0878] = 2;

		// Packet: 0x0879
		length_list[0x0879] = 2;

		// Packet: 0x087A
		length_list[0x087A] = 2;

		// Packet: 0x087B
		length_list[0x087B] = 2;

		// Packet: 0x087C
		length_list[0x087C] = 2;

		// Packet: 0x087D
		length_list[0x087D] = 2;

		// Packet: 0x087E
		length_list[0x087E] = 2;

		// Packet: 0x087F
		length_list[0x087F] = 2;

		// Packet: 0x0880
		length_list[0x0880] = 2;

		// Packet: 0x0881
		length_list[0x0881] = 2;

		// Packet: 0x0882
		length_list[0x0882] = 2;

		// Packet: 0x0883
		length_list[0x0883] = 2;

		// Packet: 0x0884
		length_list[0x0884] = 2;

		// Packet: 0x0885
		length_list[0x0885] = 2;

		// Packet: 0x0886
		length_list[0x0886] = 2;

		// Packet: 0x0887
		length_list[0x0887] = 2;

		// Packet: 0x0888
		length_list[0x0888] = 2;

		// Packet: 0x0889
		length_list[0x0889] = 2;

		// Packet: 0x088A
		length_list[0x088A] = 2;

		// Packet: 0x088B
		length_list[0x088B] = 2;

		// Packet: 0x088C
		length_list[0x088C] = 2;

		// Packet: 0x088D
		length_list[0x088D] = 2;

		// Packet: 0x088E
		length_list[0x088E] = 2;

		// Packet: 0x088F
		length_list[0x088F] = 2;

		// Packet: 0x0890
		length_list[0x0890] = 2;

		// Packet: 0x0891
		length_list[0x0891] = 2;

		// Packet: 0x0892
		length_list[0x0892] = 2;

		// Packet: 0x0893
		length_list[0x0893] = 2;

		// Packet: 0x0894
		length_list[0x0894] = 2;

		// Packet: 0x0895
		length_list[0x0895] = 2;

		// Packet: 0x0896
		length_list[0x0896] = 2;

		// Packet: 0x0897
		length_list[0x0897] = 2;

		// Packet: 0x0898
		length_list[0x0898] = 2;

		// Packet: 0x0899
		length_list[0x0899] = 2;

		// Packet: 0x089A
		length_list[0x089A] = 2;

		// Packet: 0x089B
		length_list[0x089B] = 2;

		// Packet: 0x089C
		length_list[0x089C] = 2;

		// Packet: 0x089D
		length_list[0x089D] = 2;

		// Packet: 0x089E
		length_list[0x089E] = 2;

		// Packet: 0x089F
		length_list[0x089F] = 2;

		// Packet: 0x08A0
		length_list[0x08A0] = 2;

		// Packet: 0x08A1
		length_list[0x08A1] = 2;

		// Packet: 0x08A2
		length_list[0x08A2] = 2;

		// Packet: 0x08A3
		length_list[0x08A3] = 2;

		// Packet: 0x08A4
		length_list[0x08A4] = 2;

		// Packet: 0x08A5
		length_list[0x08A5] = 2;

		// Packet: 0x08A6
		length_list[0x08A6] = 2;

		// Packet: 0x08A7
		length_list[0x08A7] = 2;

		// Packet: 0x08A8
		length_list[0x08A8] = 2;

		// Packet: 0x08A9
		length_list[0x08A9] = 2;

		// Packet: 0x08AA
		length_list[0x08AA] = 2;

		// Packet: 0x08AB
		length_list[0x08AB] = 2;

		// Packet: 0x08AC
		length_list[0x08AC] = 2;

		// Packet: 0x08AD
		length_list[0x08AD] = 2;

		// Packet: 0x08AF
		length_list[0x08AF] = 10;

		// Packet: 0x08B0
		length_list[0x08B0] = 17;

		// Packet: 0x08B1
		length_list[0x08B1] = -1;

		// Packet: 0x08B2
		length_list[0x08B2] = -1;

		// Packet: 0x08B3
		length_list[0x08B3] = -1;

		// Packet: 0x08B4
		length_list[0x08B4] = 2;

		// Packet: 0x08B5
		length_list[0x08B5] = 6;

		// Packet: 0x08B6
		length_list[0x08B6] = 3;

		// Packet: 0x08B8
		length_list[0x08B8] = 10;

		// Packet: 0x08B9
		length_list[0x08B9] = 12;

		// Packet: 0x08BA
		length_list[0x08BA] = 10;

		// Packet: 0x08BB
		length_list[0x08BB] = 8;

		// Packet: 0x08BC
		length_list[0x08BC] = 10;

		// Packet: 0x08BD
		length_list[0x08BD] = 8;

		// Packet: 0x08BE
		length_list[0x08BE] = 14;

		// Packet: 0x08BF
		length_list[0x08BF] = 8;

		// Packet: 0x08C0
		length_list[0x08C0] = -1;

		// Packet: 0x08C1
		length_list[0x08C1] = 2;

		// Packet: 0x08C2
		length_list[0x08C2] = 2;

		// Packet: 0x08C3
		length_list[0x08C3] = 10;

		// Packet: 0x08C4
		length_list[0x08C4] = 8;

		// Packet: 0x08C5
		length_list[0x08C5] = 6;

		// Packet: 0x08C6
		length_list[0x08C6] = 4;

		// Packet: 0x08C7
		length_list[0x08C7] = -1;

		// Packet: 0x08C8
		length_list[0x08C8] = 34;

		// Packet: 0x08C9
		length_list[0x08C9] = 2;

		// Packet: 0x08CA
		length_list[0x08CA] = -1;

		// Packet: 0x08CB
		length_list[0x08CB] = -1;

		// Packet: 0x08CC
		length_list[0x08CC] = 109;

		// Packet: 0x08CD
		length_list[0x08CD] = 10;

		// Packet: 0x08CE
		length_list[0x08CE] = 2;

		// Packet: 0x08CF
		length_list[0x08CF] = 10;

		// Packet: 0x08D0
		length_list[0x08D0] = 9;

		// Packet: 0x08D1
		length_list[0x08D1] = 7;

		// Packet: 0x08D2
		length_list[0x08D2] = 10;

		// Packet: 0x08D3
		length_list[0x08D3] = 10;

		// Packet: 0x08D4
		length_list[0x08D4] = 8;

		// Packet: 0x08D5
		length_list[0x08D5] = -1;

		// Packet: 0x08D6
		length_list[0x08D6] = 6;

		// Packet: 0x08D7
		length_list[0x08D7] = 28;

		// Packet: 0x08D8
		length_list[0x08D8] = 27;

		// Packet: 0x08D9
		length_list[0x08D9] = 30;

		// Packet: 0x08DA
		length_list[0x08DA] = 26;

		// Packet: 0x08DB
		length_list[0x08DB] = 27;

		// Packet: 0x08DC
		length_list[0x08DC] = 26;

		// Packet: 0x08DD
		length_list[0x08DD] = 27;

		// Packet: 0x08DE
		length_list[0x08DE] = 27;

		// Packet: 0x08DF
		length_list[0x08DF] = 50;

		// Packet: 0x08E0
		length_list[0x08E0] = 51;

		// Packet: 0x08E1
		length_list[0x08E1] = 51;

		// Packet: 0x08E2
		length_list[0x08E2] = 27;

		// Packet: 0x08E3
		length_list[0x08E3] = 157;

		// Packet: 0x08E4
		length_list[0x08E4] = 6;

		// Packet: 0x08FC
		length_list[0x08FC] = 30;

		// Packet: 0x08FD
		length_list[0x08FD] = 6;

		// Packet: 0x08FE
		length_list[0x08FE] = -1;

		// Packet: 0x08FF
		length_list[0x08FF] = 24;

		// Packet: 0x0900
		length_list[0x0900] = -1;

		// Packet: 0x0901
		length_list[0x0901] = -1;

		// Packet: 0x0902
		length_list[0x0902] = -1;

		// Packet: 0x0903
		length_list[0x0903] = -1;

		// Packet: 0x0904
		length_list[0x0904] = -1;

		// Packet: 0x0905
		length_list[0x0905] = -1;

		// Packet: 0x0906
		length_list[0x0906] = -1;

		// Packet: 0x0907
		length_list[0x0907] = 5;

		// Packet: 0x0908
		length_list[0x0908] = 5;

		// Packet: 0x090A
		length_list[0x090A] = 26;

		// Packet: 0x090D
		length_list[0x090D] = -1;

		// Packet: 0x090E
		length_list[0x090E] = 2;

		// Packet: 0x090F
		length_list[0x090F] = -1;

		// Packet: 0x0910
		length_list[0x0910] = 10;

		// Packet: 0x0911
		length_list[0x0911] = 30;

		// Packet: 0x0912
		length_list[0x0912] = 10;

		// Packet: 0x0913
		length_list[0x0913] = 30;

		// Packet: 0x0914
		length_list[0x0914] = -1;

		// Packet: 0x0915
		length_list[0x0915] = -1;

		// Packet: 0x0916
		length_list[0x0916] = 26;

		// Packet: 0x0917
		length_list[0x0917] = 2;

		// Packet: 0x0918
		length_list[0x0918] = 2;

		// Packet: 0x0919
		length_list[0x0919] = 2;

		// Packet: 0x091A
		length_list[0x091A] = 2;

		// Packet: 0x091B
		length_list[0x091B] = 2;

		// Packet: 0x091C
		length_list[0x091C] = 2;

		// Packet: 0x091D
		length_list[0x091D] = 2;

		// Packet: 0x091E
		length_list[0x091E] = 2;

		// Packet: 0x091F
		length_list[0x091F] = 2;

		// Packet: 0x0920
		length_list[0x0920] = 2;

		// Packet: 0x0921
		length_list[0x0921] = 2;

		// Packet: 0x0922
		length_list[0x0922] = 2;

		// Packet: 0x0923
		length_list[0x0923] = 2;

		// Packet: 0x0924
		length_list[0x0924] = 2;

		// Packet: 0x0925
		length_list[0x0925] = 2;

		// Packet: 0x0926
		length_list[0x0926] = 2;

		// Packet: 0x0927
		length_list[0x0927] = 2;

		// Packet: 0x0928
		length_list[0x0928] = 2;

		// Packet: 0x0929
		length_list[0x0929] = 2;

		// Packet: 0x092A
		length_list[0x092A] = 2;

		// Packet: 0x092B
		length_list[0x092B] = 2;

		// Packet: 0x092C
		length_list[0x092C] = 2;

		// Packet: 0x092D
		length_list[0x092D] = 2;

		// Packet: 0x092E
		length_list[0x092E] = 2;

		// Packet: 0x092F
		length_list[0x092F] = 2;

		// Packet: 0x0930
		length_list[0x0930] = 2;

		// Packet: 0x0931
		length_list[0x0931] = 2;

		// Packet: 0x0932
		length_list[0x0932] = 2;

		// Packet: 0x0933
		length_list[0x0933] = 2;

		// Packet: 0x0934
		length_list[0x0934] = 2;

		// Packet: 0x0935
		length_list[0x0935] = 2;

		// Packet: 0x0936
		length_list[0x0936] = 2;

		// Packet: 0x0937
		length_list[0x0937] = 2;

		// Packet: 0x0938
		length_list[0x0938] = 2;

		// Packet: 0x0939
		length_list[0x0939] = 2;

		// Packet: 0x093A
		length_list[0x093A] = 2;

		// Packet: 0x093B
		length_list[0x093B] = 2;

		// Packet: 0x093C
		length_list[0x093C] = 2;

		// Packet: 0x093D
		length_list[0x093D] = 2;

		// Packet: 0x093E
		length_list[0x093E] = 2;

		// Packet: 0x093F
		length_list[0x093F] = 2;

		// Packet: 0x0940
		length_list[0x0940] = 2;

		// Packet: 0x0941
		length_list[0x0941] = 2;

		// Packet: 0x0942
		length_list[0x0942] = 2;

		// Packet: 0x0943
		length_list[0x0943] = 2;

		// Packet: 0x0944
		length_list[0x0944] = 2;

		// Packet: 0x0945
		length_list[0x0945] = 2;

		// Packet: 0x0946
		length_list[0x0946] = 2;

		// Packet: 0x0947
		length_list[0x0947] = 2;

		// Packet: 0x0948
		length_list[0x0948] = 2;

		// Packet: 0x0949
		length_list[0x0949] = 2;

		// Packet: 0x094A
		length_list[0x094A] = 2;

		// Packet: 0x094B
		length_list[0x094B] = 2;

		// Packet: 0x094C
		length_list[0x094C] = 2;

		// Packet: 0x094D
		length_list[0x094D] = 2;

		// Packet: 0x094E
		length_list[0x094E] = 2;

		// Packet: 0x094F
		length_list[0x094F] = 2;

		// Packet: 0x0950
		length_list[0x0950] = 2;

		// Packet: 0x0951
		length_list[0x0951] = 2;

		// Packet: 0x0952
		length_list[0x0952] = 2;

		// Packet: 0x0953
		length_list[0x0953] = 2;

		// Packet: 0x0954
		length_list[0x0954] = 2;

		// Packet: 0x0955
		length_list[0x0955] = 2;

		// Packet: 0x0956
		length_list[0x0956] = 2;

		// Packet: 0x0957
		length_list[0x0957] = 2;

		// Packet: 0x0958
		length_list[0x0958] = 2;

		// Packet: 0x0959
		length_list[0x0959] = 2;

		// Packet: 0x095A
		length_list[0x095A] = 2;

		// Packet: 0x095B
		length_list[0x095B] = 2;

		// Packet: 0x095C
		length_list[0x095C] = 2;

		// Packet: 0x095D
		length_list[0x095D] = 2;

		// Packet: 0x095E
		length_list[0x095E] = 2;

		// Packet: 0x095F
		length_list[0x095F] = 2;

		// Packet: 0x0960
		length_list[0x0960] = 2;

		// Packet: 0x0961
		length_list[0x0961] = 2;

		// Packet: 0x0962
		length_list[0x0962] = 2;

		// Packet: 0x0963
		length_list[0x0963] = 2;

		// Packet: 0x0964
		length_list[0x0964] = 2;

		// Packet: 0x0965
		length_list[0x0965] = 2;

		// Packet: 0x0966
		length_list[0x0966] = 2;

		// Packet: 0x0967
		length_list[0x0967] = 2;

		// Packet: 0x0968
		length_list[0x0968] = 2;

		// Packet: 0x0969
		length_list[0x0969] = 2;

		// Packet: 0x096A
		length_list[0x096A] = 2;

		// Packet: 0x096B
		length_list[0x096B] = 4;

		// Packet: 0x096C
		length_list[0x096C] = 6;

		// Packet: 0x096D
		length_list[0x096D] = -1;

		// Packet: 0x096E
		length_list[0x096E] = -1;

		// Packet: 0x096F
		length_list[0x096F] = 7;

		// Packet: 0x0970
		length_list[0x0970] = 31;

		// Packet: 0x0971
		length_list[0x0971] = 6;

		// Packet: 0x0972
		length_list[0x0972] = -1;

		// Packet: 0x0973
		length_list[0x0973] = 7;

		// Packet: 0x0974
		length_list[0x0974] = 2;

		// Packet: 0x0975
		length_list[0x0975] = -1;

		// Packet: 0x0976
		length_list[0x0976] = -1;

		// Packet: 0x0977
		length_list[0x0977] = 14;

		// Packet: 0x0978
		length_list[0x0978] = 6;

		// Packet: 0x0979
		length_list[0x0979] = 50;

		// Packet: 0x097A
		length_list[0x097A] = -1;

		// Packet: 0x097B
		length_list[0x097B] = -1;

		// Packet: 0x097C
		length_list[0x097C] = 4;

		// Packet: 0x097D
		length_list[0x097D] = 288;

		// Packet: 0x097E
		length_list[0x097E] = 12;

		// Packet: 0x097F
		length_list[0x097F] = -1;

		// Packet: 0x0980
		length_list[0x0980] = 7;

		// Packet: 0x0981
		length_list[0x0981] = -1;

		// Packet: 0x0982
		length_list[0x0982] = 7;

		// Packet: 0x0983
		length_list[0x0983] = 29;

		// Packet: 0x0984
		length_list[0x0984] = 28;

		// Packet: 0x0985
		length_list[0x0985] = -1;

		// Packet: 0x0986
		length_list[0x0986] = 10;

		// Packet: 0x0987
		length_list[0x0987] = -1;

		// Packet: 0x0988
		length_list[0x0988] = 6;

		// Packet: 0x0989
		length_list[0x0989] = 2;

		// Packet: 0x098A
		length_list[0x098A] = -1;

		// Packet: 0x098B
		length_list[0x098B] = 2;

		// Packet: 0x098C
		length_list[0x098C] = 4;

		// Packet: 0x098D
		length_list[0x098D] = -1;

		// Packet: 0x098E
		length_list[0x098E] = -1;

		// Packet: 0x098F
		length_list[0x098F] = -1;

		// Packet: 0x0990
		length_list[0x0990] = 41;

		// Packet: 0x0991
		length_list[0x0991] = -1;

		// Packet: 0x0992
		length_list[0x0992] = -1;

		// Packet: 0x0993
		length_list[0x0993] = -1;

		// Packet: 0x0994
		length_list[0x0994] = -1;

		// Packet: 0x0995
		length_list[0x0995] = -1;

		// Packet: 0x0996
		length_list[0x0996] = -1;

		// Packet: 0x0997
		length_list[0x0997] = -1;

		// Packet: 0x0998
		length_list[0x0998] = 8;

		// Packet: 0x0999
		length_list[0x0999] = 11;

		// Packet: 0x099A
		length_list[0x099A] = 9;

		// Packet: 0x099B
		length_list[0x099B] = 8;

		// Packet: 0x099C
		length_list[0x099C] = 6;

		// Packet: 0x099D
		length_list[0x099D] = -1;

		// Packet: 0x099E
		length_list[0x099E] = 12;

		// Packet: 0x099F
		length_list[0x099F] = -1;

		// Packet: 0x09A0
		length_list[0x09A0] = 6;

		// Packet: 0x09A1
		length_list[0x09A1] = 2;

		// Packet: 0x09A2
		length_list[0x09A2] = 6;

		// Packet: 0x09A3
		length_list[0x09A3] = -1;

		// Packet: 0x09A4
		length_list[0x09A4] = 18;

		// Packet: 0x09A5
		length_list[0x09A5] = 7;

		// Packet: 0x09A6
		length_list[0x09A6] = 12;

		// Packet: 0x09A7
		length_list[0x09A7] = 10;

		// Packet: 0x09A8
		length_list[0x09A8] = 16;

		// Packet: 0x09A9
		length_list[0x09A9] = 10;

		// Packet: 0x09AA
		length_list[0x09AA] = 16;

		// Packet: 0x09AB
		length_list[0x09AB] = 6;

		// Packet: 0x09AC
		length_list[0x09AC] = -1;

		// Packet: 0x09AD
		length_list[0x09AD] = 12;

		// Packet: 0x09AE
		length_list[0x09AE] = 19;

		// Packet: 0x09AF
		length_list[0x09AF] = 4;

		// Packet: 0x09B0
		length_list[0x09B0] = 10;

		// Packet: 0x09B1
		length_list[0x09B1] = 4;

		// Packet: 0x09B2
		length_list[0x09B2] = 10;

		// Packet: 0x09B3
		length_list[0x09B3] = 6;

		// Packet: 0x09B4
		length_list[0x09B4] = 6;

		// Packet: 0x09B5
		length_list[0x09B5] = 2;

		// Packet: 0x09B6
		length_list[0x09B6] = 6;

		// Packet: 0x09B7
		length_list[0x09B7] = 4;

		// Packet: 0x09B8
		length_list[0x09B8] = 6;

		// Packet: 0x09B9
		length_list[0x09B9] = 4;

		// Packet: 0x09BA
		length_list[0x09BA] = 2;

		// Packet: 0x09BB
		length_list[0x09BB] = 6;

		// Packet: 0x09BC
		length_list[0x09BC] = 6;

		// Packet: 0x09BD
		length_list[0x09BD] = 2;

		// Packet: 0x09BE
		length_list[0x09BE] = 2;

		// Packet: 0x09BF
		length_list[0x09BF] = 4;

		// Packet: 0x09C1
		length_list[0x09C1] = 10;

		// Packet: 0x09C2
		length_list[0x09C2] = -1;

		// Packet: 0x09C3
		length_list[0x09C3] = 10;

		// Packet: 0x09C4
		length_list[0x09C4] = 10;

		// Packet: 0x09C5
		length_list[0x09C5] = 1042;

		// Packet: 0x09C6
		length_list[0x09C6] = -1;

		// Packet: 0x09C7
		length_list[0x09C7] = 18;

		// Packet: 0x09C8
		length_list[0x09C8] = -1;

		// Packet: 0x09C9
		length_list[0x09C9] = -1;

		// Packet: 0x09CA
		length_list[0x09CA] = -1;

		// Packet: 0x09CB
		length_list[0x09CB] = 17;

		// Packet: 0x09CC
		length_list[0x09CC] = -1;

		// Packet: 0x09CD
		length_list[0x09CD] = 8;

		// Packet: 0x09CE
		length_list[0x09CE] = 102;

		// Packet: 0x09CF
		length_list[0x09CF] = -1;

		// Packet: 0x09D0
		length_list[0x09D0] = -1;

		// Packet: 0x09D1
		length_list[0x09D1] = 14;

		// Packet: 0x09D2
		length_list[0x09D2] = -1;

		// Packet: 0x09D3
		length_list[0x09D3] = -1;

		// Packet: 0x09D4
		length_list[0x09D4] = 2;

		// Packet: 0x09D5
		length_list[0x09D5] = -1;

		// Packet: 0x09D6
		length_list[0x09D6] = -1;

		// Packet: 0x09D7
		length_list[0x09D7] = -1;

		// Packet: 0x09D8
		length_list[0x09D8] = 2;

		// Packet: 0x09D9
		length_list[0x09D9] = 4;

		// Packet: 0x09DA
		length_list[0x09DA] = -1;

		// Packet: 0x09DB
		length_list[0x09DB] = -1;

		// Packet: 0x09DC
		length_list[0x09DC] = -1;

		// Packet: 0x09DD
		length_list[0x09DD] = -1;

		// Packet: 0x09DE
		length_list[0x09DE] = -1;

		// Packet: 0x09DF
		length_list[0x09DF] = 7;

		// Packet: 0x09E0
		length_list[0x09E0] = -1;

		// Packet: 0x09E1
		length_list[0x09E1] = 8;

		// Packet: 0x09E2
		length_list[0x09E2] = 8;

		// Packet: 0x09E3
		length_list[0x09E3] = 8;

		// Packet: 0x09E4
		length_list[0x09E4] = 8;

		// Packet: 0x09E5
		length_list[0x09E5] = 18;

		// Packet: 0x09E6
		length_list[0x09E6] = 24;

		// Packet: 0x09E7
		length_list[0x09E7] = 3;

		// Packet: 0x09E8
		length_list[0x09E8] = 11;

		// Packet: 0x09E9
		length_list[0x09E9] = 2;

		// Packet: 0x09EA
		length_list[0x09EA] = 11;

		// Packet: 0x09EB
		length_list[0x09EB] = -1;

		// Packet: 0x09EC
		length_list[0x09EC] = -1;

		// Packet: 0x09ED
		length_list[0x09ED] = 3;

		// Packet: 0x09EE
		length_list[0x09EE] = 11;

		// Packet: 0x09EF
		length_list[0x09EF] = 11;

		// Packet: 0x09F0
		length_list[0x09F0] = -1;

		// Packet: 0x09F1
		length_list[0x09F1] = 11;

		// Packet: 0x09F2
		length_list[0x09F2] = 12;

		// Packet: 0x09F3
		length_list[0x09F3] = 11;

		// Packet: 0x09F4
		length_list[0x09F4] = 12;

		// Packet: 0x09F5
		length_list[0x09F5] = 11;

		// Packet: 0x09F6
		length_list[0x09F6] = 11;

		// Packet: 0x09F7
		length_list[0x09F7] = 77;

		// Packet: 0x09F8
		length_list[0x09F8] = -1;

		// Packet: 0x09F9
		length_list[0x09F9] = 143;

		// Packet: 0x09FA
		length_list[0x09FA] = -1;

		// Packet: 0x09FB
		length_list[0x09FB] = -1;

		// Packet: 0x09FC
		length_list[0x09FC] = 6;

		// Packet: 0x09FD
		length_list[0x09FD] = -1;

		// Packet: 0x09FE
		length_list[0x09FE] = -1;

		// Packet: 0x09FF
		length_list[0x09FF] = -1;

		// Packet: 0x0A00
		length_list[0x0A00] = 269;

		// Packet: 0x0A01
		length_list[0x0A01] = 3;

		// Packet: 0x0A02
		length_list[0x0A02] = 4;

		// Packet: 0x0A03
		length_list[0x0A03] = 2;

		// Packet: 0x0A04
		length_list[0x0A04] = 6;

		// Packet: 0x0A05
		length_list[0x0A05] = 63;

		// Packet: 0x0A06
		length_list[0x0A06] = 6;

		// Packet: 0x0A07
		length_list[0x0A07] = 9;

		// Packet: 0x0A08
		length_list[0x0A08] = 26;

		// Packet: 0x0A09
		length_list[0x0A09] = 55;

		// Packet: 0x0A0A
		length_list[0x0A0A] = 57;

		// Packet: 0x0A0B
		length_list[0x0A0B] = 57;

		// Packet: 0x0A0C
		length_list[0x0A0C] = 66;

		// Packet: 0x0A0D
		length_list[0x0A0D] = -1;

		// Packet: 0x0A0E
		length_list[0x0A0E] = 14;

		// Packet: 0x0A0F
		length_list[0x0A0F] = -1;

		// Packet: 0x0A10
		length_list[0x0A10] = -1;

		// Packet: 0x0A11
		length_list[0x0A11] = -1;

		// Packet: 0x0A12
		length_list[0x0A12] = 27;

		// Packet: 0x0A13
		length_list[0x0A13] = 26;

		// Packet: 0x0A14
		length_list[0x0A14] = 10;

		// Packet: 0x0A15
		length_list[0x0A15] = 12;

		// Packet: 0x0A16
		length_list[0x0A16] = 26;

		// Packet: 0x0A17
		length_list[0x0A17] = 6;

		// Packet: 0x0A18
		length_list[0x0A18] = 14;

		// Packet: 0x0A19
		length_list[0x0A19] = 2;

		// Packet: 0x0A1A
		length_list[0x0A1A] = 25;

		// Packet: 0x0A1B
		length_list[0x0A1B] = 2;

		// Packet: 0x0A1C
		length_list[0x0A1C] = -1;

		// Packet: 0x0A1D
		length_list[0x0A1D] = 2;

		// Packet: 0x0A1E
		length_list[0x0A1E] = 3;

		// Packet: 0x0A1F
		length_list[0x0A1F] = 2;

		// Packet: 0x0A20
		length_list[0x0A20] = 23;

		// Packet: 0x0A21
		length_list[0x0A21] = 3;

		// Packet: 0x0A22
		length_list[0x0A22] = 7;

		// Packet: 0x0A23
		length_list[0x0A23] = -1;

		// Packet: 0x0A24
		length_list[0x0A24] = 66;

		// Packet: 0x0A25
		length_list[0x0A25] = 6;

		// Packet: 0x0A26
		length_list[0x0A26] = 7;

		// Packet: 0x0A27
		length_list[0x0A27] = 8;

		// Packet: 0x0A28
		length_list[0x0A28] = 3;

		// Packet: 0x0A29
		length_list[0x0A29] = 6;

		// Packet: 0x0A2A
		length_list[0x0A2A] = 6;

		// Packet: 0x0A2B
		length_list[0x0A2B] = 14;

		// Packet: 0x0A2C
		length_list[0x0A2C] = 12;

		// Packet: 0x0A2D
		length_list[0x0A2D] = -1;

		// Packet: 0x0A2E
		length_list[0x0A2E] = 6;

		// Packet: 0x0A2F
		length_list[0x0A2F] = 7;

		// Packet: 0x0A30
		length_list[0x0A30] = 106;

		// Packet: 0x0A31
		length_list[0x0A31] = -1;

		// Packet: 0x0A32
		length_list[0x0A32] = 2;

		// Packet: 0x0A33
		length_list[0x0A33] = 7;

		// Packet: 0x0A34
		length_list[0x0A34] = 6;

		// Packet: 0x0A35
		length_list[0x0A35] = 4;

		// Packet: 0x0A36
		length_list[0x0A36] = 7;

		// Packet: 0x0A37
		length_list[0x0A37] = 69;

		// Packet: 0x0A38
		length_list[0x0A38] = 3;

		// Packet: 0x0A39
		length_list[0x0A39] = 36;

		// Packet: 0x0A3A
		length_list[0x0A3A] = 12;

		// Packet: 0x0A3B
		length_list[0x0A3B] = -1;

		// Packet: 0x0A3C
		length_list[0x0A3C] = -1;

		// Packet: 0x0A3D
		length_list[0x0A3D] = 20;

		// Packet: 0x0A3E
		length_list[0x0A3E] = -1;

		// Packet: 0x0A3F
		length_list[0x0A3F] = 11;

		// Packet: 0x0A40
		length_list[0x0A40] = 11;

		// Packet: 0x0A41
		length_list[0x0A41] = 18;

		// Packet: 0x0A42
		length_list[0x0A42] = 43;

		// Packet: 0x0A43
		length_list[0x0A43] = 85;

		// Packet: 0x0A44
		length_list[0x0A44] = -1;

		// Packet: 0x0A46
		length_list[0x0A46] = 14;

		// Packet: 0x0A47
		length_list[0x0A47] = 3;

		// Packet: 0x0A48
		length_list[0x0A48] = 2;

		// Packet: 0x0A49
		length_list[0x0A49] = 22;

		// Packet: 0x0A4A
		length_list[0x0A4A] = 6;

		// Packet: 0x0A4B
		length_list[0x0A4B] = 22;

		// Packet: 0x0A4C
		length_list[0x0A4C] = 28;

		// Packet: 0x0A4D
		length_list[0x0A4D] = -1;

		// Packet: 0x0A4E
		length_list[0x0A4E] = 6;

		// Packet: 0x0A4F
		length_list[0x0A4F] = -1;

		// Packet: 0x0A50
		length_list[0x0A50] = 4;

		// Packet: 0x0A51
		length_list[0x0A51] = 34;

		// Packet: 0x0A52
		length_list[0x0A52] = 20;

		// Packet: 0x0A53
		length_list[0x0A53] = 10;

		// Packet: 0x0A54
		length_list[0x0A54] = -1;

		// Packet: 0x0A55
		length_list[0x0A55] = 2;

		// Packet: 0x0A56
		length_list[0x0A56] = 6;

		// Packet: 0x0A57
		length_list[0x0A57] = 6;

		// Packet: 0x0A58
		length_list[0x0A58] = 8;

		// Packet: 0x0A59
		length_list[0x0A59] = -1;

		// Packet: 0x0A5A
		length_list[0x0A5A] = 2;

		// Packet: 0x0A5B
		length_list[0x0A5B] = 7;

		// Packet: 0x0A5C
		length_list[0x0A5C] = 18;

		// Packet: 0x0A5D
		length_list[0x0A5D] = 6;

		// Packet: 0x0A5E
		length_list[0x0A5E] = 26;

		// Packet: 0x0A5F
		length_list[0x0A5F] = 8;

		// Packet: 0x0A60
		length_list[0x0A60] = 3;

		// Packet: 0x0A68
		length_list[0x0A68] = 3;

		// Packet: 0x0A69
		length_list[0x0A69] = 6;

		// Packet: 0x0A6A
		length_list[0x0A6A] = 12;

		// Packet: 0x0A6B
		length_list[0x0A6B] = -1;

		// Packet: 0x0A6C
		length_list[0x0A6C] = 7;

		// Packet: 0x0A6D
		length_list[0x0A6D] = -1;

		// Packet: 0x0A6E
		length_list[0x0A6E] = -1;

		// Packet: 0x0A6F
		length_list[0x0A6F] = -1;

		// Packet: 0x0A70
		length_list[0x0A70] = 2;

		// Packet: 0x0A71
		length_list[0x0A71] = -1;

		// Packet: 0x0A72
		length_list[0x0A72] = 61;

		// Packet: 0x0A73
		length_list[0x0A73] = 2;

		// Packet: 0x0A74
		length_list[0x0A74] = 8;

		// Packet: 0x0A76
		length_list[0x0A76] = 80;

		// Packet: 0x0A77
		length_list[0x0A77] = 15;

		// Packet: 0x0A78
		length_list[0x0A78] = 15;

		// Packet: 0x0A79
		length_list[0x0A79] = -1;

		// Packet: 0x0A7B
		length_list[0x0A7B] = -1;

		// Packet: 0x0A7C
		length_list[0x0A7C] = -1;

		// Packet: 0x0A7D
		length_list[0x0A7D] = -1;

		// Packet: 0x0A7E
		length_list[0x0A7E] = -1;

		// Packet: 0x0A7F
		length_list[0x0A7F] = -1;

		// Packet: 0x0A80
		length_list[0x0A80] = 6;

		// Packet: 0x0A81
		length_list[0x0A81] = 4;

		// Packet: 0x0A82
		length_list[0x0A82] = 46;

		// Packet: 0x0A83
		length_list[0x0A83] = 46;

		// Packet: 0x0A84
		length_list[0x0A84] = 94;

		// Packet: 0x0A85
		length_list[0x0A85] = 82;

		// Packet: 0x0A86
		length_list[0x0A86] = -1;

		// Packet: 0x0A87
		length_list[0x0A87] = -1;

		// Packet: 0x0A88
		length_list[0x0A88] = 2;

		// Packet: 0x0A89
		length_list[0x0A89] = 61;

		// Packet: 0x0A8A
		length_list[0x0A8A] = 6;

		// Packet: 0x0A8B
		length_list[0x0A8B] = 2;

		// Packet: 0x0A8C
		length_list[0x0A8C] = 2;

		// Packet: 0x0A8D
		length_list[0x0A8D] = -1;

		// Packet: 0x0A8E
		length_list[0x0A8E] = 2;

		// Packet: 0x0A8F
		length_list[0x0A8F] = 2;

		// Packet: 0x0A90
		length_list[0x0A90] = 3;

		// Packet: 0x0A91
		length_list[0x0A91] = -1;

		// Packet: 0x0A92
		length_list[0x0A92] = -1;

		// Packet: 0x0A93
		length_list[0x0A93] = 3;

		// Packet: 0x0A94
		length_list[0x0A94] = 2;

		// Packet: 0x0A95
		length_list[0x0A95] = 4;

		// Packet: 0x0A96
		length_list[0x0A96] = 61;

		// Packet: 0x0A97
		length_list[0x0A97] = 8;

		// Packet: 0x0A98
		length_list[0x0A98] = 10;

		// Packet: 0x0A99
		length_list[0x0A99] = 4;

		// Packet: 0x0A9A
		length_list[0x0A9A] = 10;

		// Packet: 0x0A9B
		length_list[0x0A9B] = -1;

		// Packet: 0x0A9C
		length_list[0x0A9C] = 2;

		// Packet: 0x0A9D
		length_list[0x0A9D] = 4;

		// Packet: 0x0A9E
		length_list[0x0A9E] = 2;

		// Packet: 0x0A9F
		length_list[0x0A9F] = 2;

		// Packet: 0x0AA0
		length_list[0x0AA0] = 2;

		// Packet: 0x0AA1
		length_list[0x0AA1] = 4;

		// Packet: 0x0AA2
		length_list[0x0AA2] = -1;

		// Packet: 0x0AA3
		length_list[0x0AA3] = 9;

		// Packet: 0x0AA4
		length_list[0x0AA4] = 2;

		// Packet: 0x0AA5
		length_list[0x0AA5] = -1;

		// Packet: 0x0AA6
		length_list[0x0AA6] = 36;

		// Packet: 0x0AA7
		length_list[0x0AA7] = 6;

		// Packet: 0x0AA8
		length_list[0x0AA8] = 5;

		// Packet: 0x0AA9
		length_list[0x0AA9] = -1;

		// Packet: 0x0AAA
		length_list[0x0AAA] = -1;

		// Packet: 0x0AAB
		length_list[0x0AAB] = -1;

		// Packet: 0x0AAC
		length_list[0x0AAC] = 69;

		// Packet: 0x0AAD
		length_list[0x0AAD] = 51;

		// Packet: 0x0AAE
		length_list[0x0AAE] = 2;

		// Packet: 0x0AAF
		length_list[0x0AAF] = 6;

		// Packet: 0x0AB0
		length_list[0x0AB0] = 6;

		// Packet: 0x0AB1
		length_list[0x0AB1] = 14;

		// Packet: 0x0AB2
		length_list[0x0AB2] = 7;

		// Packet: 0x0AB3
		length_list[0x0AB3] = 19;

		// Packet: 0x0AB4
		length_list[0x0AB4] = 6;

		// Packet: 0x0AB5
		length_list[0x0AB5] = 2;

		// Packet: 0x0AB6
		length_list[0x0AB6] = 8;

		// Packet: 0x0AB7
		length_list[0x0AB7] = 4;

		// Packet: 0x0AB8
		length_list[0x0AB8] = 2;

		// Packet: 0x0AB9
		length_list[0x0AB9] = 47;

		// Packet: 0x0ABA
		length_list[0x0ABA] = 2;

		// Packet: 0x0ABB
		length_list[0x0ABB] = 2;

		// Packet: 0x0ABC
		length_list[0x0ABC] = -1;

		// Packet: 0x0ABD
		length_list[0x0ABD] = 10;

		// Packet: 0x0ABE
		length_list[0x0ABE] = -1;

		// Packet: 0x0ABF
		length_list[0x0ABF] = -1;

		// Packet: 0x0AC0
		length_list[0x0AC0] = 26;

		// Packet: 0x0AC1
		length_list[0x0AC1] = 26;

		// Packet: 0x0AC2
		length_list[0x0AC2] = -1;

		// Packet: 0x0AC3
		length_list[0x0AC3] = 2;

		// Packet: 0x0AC4
		length_list[0x0AC4] = -1;

		// Packet: 0x0AC5
		length_list[0x0AC5] = 156;

		// Packet: 0x0AC6
		length_list[0x0AC6] = 156;

		// Packet: 0x0AC7
		length_list[0x0AC7] = 156;

		// Packet: 0x0AC8
		length_list[0x0AC8] = 2;

		// Packet: 0x0AC9
		length_list[0x0AC9] = -1;

		// Packet: 0x0ACA
		length_list[0x0ACA] = 3;

		// Packet: 0x0ACB
		length_list[0x0ACB] = 12;

		// Packet: 0x0ACC
		length_list[0x0ACC] = 18;

		// Packet: 0x0ACD
		length_list[0x0ACD] = 23;

		// Packet: 0x0ACE
		length_list[0x0ACE] = 4;

		// Packet: 0x0ACF
		length_list[0x0ACF] = 68;

		// Packet: 0x0AD0
		length_list[0x0AD0] = 11;

		// Packet: 0x0AD1
		length_list[0x0AD1] = -1;

		// Packet: 0x0AD2
		length_list[0x0AD2] = 30;

		// Packet: 0x0AD3
		length_list[0x0AD3] = -1;

		// Packet: 0x0AD4
		length_list[0x0AD4] = -1;

		// Packet: 0x0AD5
		length_list[0x0AD5] = 2;

		// Packet: 0x0AD6
		length_list[0x0AD6] = 2;

		// Packet: 0x0AD7
		length_list[0x0AD7] = 8;

		// Packet: 0x0AD8
		length_list[0x0AD8] = 8;

		// Packet: 0x0AD9
		length_list[0x0AD9] = -1;

		// Packet: 0x0ADA
		length_list[0x0ADA] = 32;

		// Packet: 0x0ADB
		length_list[0x0ADB] = -1;

		// Packet: 0x0ADC
		length_list[0x0ADC] = 6;

		// Packet: 0x0ADD
		length_list[0x0ADD] = 24;

		// Packet: 0x0ADE
		length_list[0x0ADE] = 6;

		// Packet: 0x0ADF
		length_list[0x0ADF] = 58;

		// Packet: 0x0AE0
		length_list[0x0AE0] = 30;

		// Packet: 0x0AE1
		length_list[0x0AE1] = 28;

		// Packet: 0x0AE2
		length_list[0x0AE2] = 7;

		// Packet: 0x0AE3
		length_list[0x0AE3] = -1;

		// Packet: 0x0AE4
		length_list[0x0AE4] = 89;

		// Packet: 0x0AE5
		length_list[0x0AE5] = -1;

		// Packet: 0x0AE6
		length_list[0x0AE6] = 10;

		// Packet: 0x0AE7
		length_list[0x0AE7] = 38;

		// Packet: 0x0AE8
		length_list[0x0AE8] = 2;

		// Packet: 0x0AE9
		length_list[0x0AE9] = 13;

		// Packet: 0x0AEC
		length_list[0x0AEC] = 2;

		// Packet: 0x0AED
		length_list[0x0AED] = 2;

		// Packet: 0x0AEE
		length_list[0x0AEE] = 2;

		// Packet: 0x0AEF
		length_list[0x0AEF] = 2;

		// Packet: 0x0AF0
		length_list[0x0AF0] = 10;

		// Packet: 0x0AF1
		length_list[0x0AF1] = 102;

		// Packet: 0x0AF2
		length_list[0x0AF2] = 40;

		// Packet: 0x0AF3
		length_list[0x0AF3] = -1;

		// Packet: 0x0AF4
		length_list[0x0AF4] = 11;

		// Packet: 0x0AF5
		length_list[0x0AF5] = 3;

		// Packet: 0x0AF6
		length_list[0x0AF6] = 88;

		// Packet: 0x0AF7
		length_list[0x0AF7] = 32;

		// Packet: 0x0AF8
		length_list[0x0AF8] = 11;

		// Packet: 0x0AF9
		length_list[0x0AF9] = 6;

		// Packet: 0x0AFA
		length_list[0x0AFA] = 58;

		// Packet: 0x0AFB
		length_list[0x0AFB] = -1;

		// Packet: 0x0AFC
		length_list[0x0AFC] = 16;

		// Packet: 0x0AFD
		length_list[0x0AFD] = -1;

		// Packet: 0x0AFE
		length_list[0x0AFE] = -1;

		// Packet: 0x0AFF
		length_list[0x0AFF] = -1;

		// Packet: 0x0B00
		length_list[0x0B00] = 8;

		// Packet: 0x0B01
		length_list[0x0B01] = 56;

		// Packet: 0x0B02
		length_list[0x0B02] = 26;

		// Packet: 0x0B03
		length_list[0x0B03] = -1;

		// Packet: 0x0B04
		length_list[0x0B04] = 190;

		// Packet: 0x0B05
		length_list[0x0B05] = 63;

		// Packet: 0x0B07
		length_list[0x0B07] = -1;

		// Packet: 0x0B08
		length_list[0x0B08] = -1;

		// Packet: 0x0B09
		length_list[0x0B09] = -1;

		// Packet: 0x0B0A
		length_list[0x0B0A] = -1;

		// Packet: 0x0B0B
		length_list[0x0B0B] = 4;

		// Packet: 0x0B0C
		length_list[0x0B0C] = 155;

		// Packet: 0x0B0D
		length_list[0x0B0D] = 10;

		// Packet: 0x0B0E
		length_list[0x0B0E] = -1;

		// Packet: 0x0B0F
		length_list[0x0B0F] = -1;

		// Packet: 0x0B10
		length_list[0x0B10] = 10;

		// Packet: 0x0B11
		length_list[0x0B11] = 4;

		// Packet: 0x0B12
		length_list[0x0B12] = 2;

		// Packet: 0x0B13
		length_list[0x0B13] = 48;

		// Packet: 0x0B14
		length_list[0x0B14] = 2;

		// Packet: 0x0B15
		length_list[0x0B15] = 7;

		// Packet: 0x0B16
		length_list[0x0B16] = 2;

		// Packet: 0x0B17
		length_list[0x0B17] = 3;

		// Packet: 0x0B18
		length_list[0x0B18] = 4;

		// Packet: 0x0B19
		length_list[0x0B19] = 2;

		// Packet: 0x0B1A
		length_list[0x0B1A] = 29;

		// Packet: 0x0B1B
		length_list[0x0B1B] = 2;

		// Packet: 0x0B1C
		length_list[0x0B1C] = 2;

		// Packet: 0x0B1D
		length_list[0x0B1D] = 2;

		// Packet: 0x0B1E
		length_list[0x0B1E] = 14;

		// Packet: 0x0B1F
		length_list[0x0B1F] = 14;

		// Packet: 0x0B20
		length_list[0x0B20] = 271;

		// Packet: 0x0B21
		length_list[0x0B21] = 13;

		// Packet: 0x0B22
		length_list[0x0B22] = 5;

		// Packet: 0x0B23
		length_list[0x0B23] = 6;

		// Packet: 0x0B24
		length_list[0x0B24] = 6;

		// Packet: 0x0B25
		length_list[0x0B25] = 6;

		// Packet: 0x0B27
		length_list[0x0B27] = -1;

		// Packet: 0x0B28
		length_list[0x0B28] = 3;

		// Packet: 0x0B2B
		length_list[0x0B2B] = 11;

		// Packet: 0x0B2C
		length_list[0x0B2C] = 3;

		// Packet: 0x0B2D
		length_list[0x0B2D] = 11;

		// Packet: 0x0B2E
		length_list[0x0B2E] = 4;

		// Packet: 0x0B2F
		length_list[0x0B2F] = 73;

		// Packet: 0x0B30
		length_list[0x0B30] = -1;

		// Packet: 0x0B31
		length_list[0x0B31] = 17;

		// Packet: 0x0B32
		length_list[0x0B32] = -1;

		// Packet: 0x0B33
		length_list[0x0B33] = 17;

		// Packet: 0x0B34
		length_list[0x0B34] = 50;

		// Packet: 0x0B35
		length_list[0x0B35] = 3;

		// Packet: 0x0B36
		length_list[0x0B36] = -1;

		// Packet: 0x0B37
		length_list[0x0B37] = -1;

		// Packet: 0x0B39
		length_list[0x0B39] = -1;

		// Packet: 0x0B3C
		length_list[0x0B3C] = 4;

		// Packet: 0x0B3D
		length_list[0x0B3D] = -1;

		// Packet: 0x0B3E
		length_list[0x0B3E] = -1;

		// Packet: 0x0B3F
		length_list[0x0B3F] = 64;

		// Packet: 0x0B40
		length_list[0x0B40] = -1;

		// Packet: 0x0B41
		length_list[0x0B41] = 70;

		// Packet: 0x0B42
		length_list[0x0B42] = 62;

		// Packet: 0x0B43
		length_list[0x0B43] = 48;

		// Packet: 0x0B44
		length_list[0x0B44] = 58;

		// Packet: 0x0B45
		length_list[0x0B45] = 58;

		// Packet: 0x0B46
		length_list[0x0B46] = 10;

		// Packet: 0x0B47
		length_list[0x0B47] = 14;

		// Packet: 0x0B48
		length_list[0x0B48] = 18;

		// Packet: 0x0B49
		length_list[0x0B49] = 4;

		// Packet: 0x0B4A
		length_list[0x0B4A] = 6;

		// Packet: 0x0B4B
		length_list[0x0B4B] = 4;

		// Packet: 0x0B4C
		length_list[0x0B4C] = 2;

		// Packet: 0x0B4D
		length_list[0x0B4D] = -1;

		// Packet: 0x0B4E
		length_list[0x0B4E] = -1;

		// Packet: 0x0B4F
		length_list[0x0B4F] = 2;

		// Packet: 0x0B50
		length_list[0x0B50] = 2;

		// Packet: 0x0B51
		length_list[0x0B51] = 2;

		// Packet: 0x0B52
		length_list[0x0B52] = 2;

		// Packet: 0x0B53
		length_list[0x0B53] = 52;

		// Packet: 0x0B54
		length_list[0x0B54] = 8;

		// Packet: 0x0B55
		length_list[0x0B55] = -1;

		// Packet: 0x0B56
		length_list[0x0B56] = -1;

		// Packet: 0x0B57
		length_list[0x0B57] = -1;

		// Packet: 0x0B58
		length_list[0x0B58] = 2;

		// Packet: 0x0B59
		length_list[0x0B59] = 4;

		// Packet: 0x0B5A
		length_list[0x0B5A] = -1;

		// Packet: 0x0B5B
		length_list[0x0B5B] = 14;

		// Packet: 0x0B5C
		length_list[0x0B5C] = 2;

		// Packet: 0x0B5D
		length_list[0x0B5D] = 10;

		// Packet: 0x0B5E
		length_list[0x0B5E] = 33;

		// Packet: 0x0B5F
		length_list[0x0B5F] = -1;

		// Packet: 0x0B60
		length_list[0x0B60] = -1;

		// Packet: 0x0B61
		length_list[0x0B61] = -1;

		// Packet: 0x0B62
		length_list[0x0B62] = -1;

		// Packet: 0x0B63
		length_list[0x0B63] = -1;

		// Packet: 0x0B64
		length_list[0x0B64] = -1;

		// Packet: 0x0B65
		length_list[0x0B65] = -1;

		// Packet: 0x0B66
		length_list[0x0B66] = 26;

		// Packet: 0x0B67
		length_list[0x0B67] = 33;

		// Packet: 0x0B68
		length_list[0x0B68] = 12;

		// Packet: 0x0B69
		length_list[0x0B69] = 18;

		// Packet: 0x0B6A
		length_list[0x0B6A] = -1;

		// Packet: 0x0B6B
		length_list[0x0B6B] = 14;

		// Packet: 0x0B6C
		length_list[0x0B6C] = 12;

		// Packet: 0x0B6D
		length_list[0x0B6D] = 6;

		// Packet: 0x0B6E
		length_list[0x0B6E] = 14;

		// Packet: 0x0B6F
		length_list[0x0B6F] = 177;

		// Packet: 0x0B70
		length_list[0x0B70] = -1;

		// Packet: 0x0B71
		length_list[0x0B71] = 177;

		// Packet: 0x0B72
		length_list[0x0B72] = -1;

		// Packet: 0x0B73
		length_list[0x0B73] = 8;

		// Packet: 0x0B74
		length_list[0x0B74] = 1026;

		// Packet: 0x0B75
		length_list[0x0B75] = 1026;

		// Packet: 0x0B76
		length_list[0x0B76] = 77;

		// Packet: 0x0B77
		length_list[0x0B77] = -1;

		// Packet: 0x0B78
		length_list[0x0B78] = -1;

		// Packet: 0x0B79
		length_list[0x0B79] = -1;

		// Packet: 0x0B7A
		length_list[0x0B7A] = -1;

		// Packet: 0x0B7B
		length_list[0x0B7B] = 118;

		// Packet: 0x0B7C
		length_list[0x0B7C] = -1;

		// Packet: 0x0B7D
		length_list[0x0B7D] = -1;

		// Packet: 0x0B7E
		length_list[0x0B7E] = 60;

		// Packet: 0x0B7F
		length_list[0x0B7F] = 10;

		// Packet: 0x0B80
		length_list[0x0B80] = 10;

		// Packet: 0x0B8C
		length_list[0x0B8C] = -1;

		// Packet: 0x0B8D
		length_list[0x0B8D] = -1;

		// Packet: 0x0B8E
		length_list[0x0B8E] = 18;

		// Packet: 0x0B8F
		length_list[0x0B8F] = 6;

		// Packet: 0x0B90
		length_list[0x0B90] = 2;

		// Packet: 0x0B91
		length_list[0x0B91] = 8;

		// Packet: 0x0B92
		length_list[0x0B92] = 5;

		// Packet: 0x0B93
		length_list[0x0B93] = 12;

		// Packet: 0x0B94
		length_list[0x0B94] = 14;

		// Packet: 0x0B95
		length_list[0x0B95] = -1;

		// Packet: 0x0B96
		length_list[0x0B96] = 26;

		// Packet: 0x0B97
		length_list[0x0B97] = 27;

		// Packet: 0x0B98
		length_list[0x0B98] = 6;

		// Packet: 0x0B99
		length_list[0x0B99] = 10;

		// Packet: 0x0B9A
		length_list[0x0B9A] = 11;

		// Packet: 0x0B9B
		length_list[0x0B9B] = 12;

		// Packet: 0x0B9C
		length_list[0x0B9C] = 16;

		// Packet: 0x0B9D
		length_list[0x0B9D] = 14;

		// Packet: 0x0B9E
		length_list[0x0B9E] = 12;

		// Packet: 0x0B9F
		length_list[0x0B9F] = 10;

		// Packet: 0x0BA0
		length_list[0x0BA0] = 2;

		// Packet: 0x0BA1
		length_list[0x0BA1] = 3;

		// Packet: 0x0BA2
		length_list[0x0BA2] = 10;

		// Packet: 0x0BA3
		length_list[0x0BA3] = 10;

		// Packet: 0x0BA4
		length_list[0x0BA4] = 85;

		// Packet: 0x0BA5
		length_list[0x0BA5] = 12;

		// Packet: 0x0BA6
		length_list[0x0BA6] = -1;

		// Packet: 0x0BA7
		length_list[0x0BA7] = -1;

		// Packet: 0x0BA8
		length_list[0x0BA8] = 7;

		// Packet: 0x0BA9
		length_list[0x0BA9] = -1;

		// Packet: 0x0BAA
		length_list[0x0BAA] = 22;

		// Packet: 0x0BAB
		length_list[0x0BAB] = 22;

		// Packet: 0x0BAC
		length_list[0x0BAC] = 22;

		// Packet: 0x0BAD
		length_list[0x0BAD] = 2;

		// Packet: 0x0BAE
		length_list[0x0BAE] = 3;

		// Packet: 0x0BAF
		length_list[0x0BAF] = 16;

		// Packet: 0x0BB0
		length_list[0x0BB0] = 9;

		// Packet: 0x0BB1
		length_list[0x0BB1] = 3;

		// Packet: 0x0BB2
		length_list[0x0BB2] = 2;

		// Packet: 0x0BB3
		length_list[0x0BB3] = -1;

		// Packet: 0x0BB4
		length_list[0x0BB4] = 31;

		// Packet: 0x0BB5
		length_list[0x0BB5] = 10;

		// Packet: 0x0BB6
		length_list[0x0BB6] = 18;

		// Packet: 0x0BB7
		length_list[0x0BB7] = -1;

		// Packet: 0x0BB8
		length_list[0x0BB8] = 16;

		// Packet: 0x0BB9
		length_list[0x0BB9] = 27;

		// Packet: 0x0BBA
		length_list[0x0BBA] = -1;

		// Packet: 0x0BBB
		length_list[0x0BBB] = -1;

		// Packet: 0x0BBC
		length_list[0x0BBC] = 22;

		// Packet: 0x0BBD
		length_list[0x0BBD] = 6;

		// Packet: 0x0BBE
		length_list[0x0BBE] = 6;

		// Packet: 0x0BBF
		length_list[0x0BBF] = 12;

		// Packet: 0x0BC0
		length_list[0x0BC0] = 3;

		// Packet: 0x0BC1
		length_list[0x0BC1] = -1;

		// Packet: 0x0BC2
		length_list[0x0BC2] = 5;

		// Packet: 0x0BC3
		length_list[0x0BC3] = 10;

		// Packet: 0x0BC4
		length_list[0x0BC4] = 2;

		// Packet: 0x0BC5
		length_list[0x0BC5] = 7;

		// Packet: 0x0BC6
		length_list[0x0BC6] = 9;

		// Packet: 0x0BC7
		length_list[0x0BC7] = 6;

		// Packet: 0x0BC8
		length_list[0x0BC8] = -1;

		// Packet: 0x0BC9
		length_list[0x0BC9] = 10;

		// Packet: 0x0BCA
		length_list[0x0BCA] = -1;

		// Packet: 0x0BCB
		length_list[0x0BCB] = 4;

		// Packet: 0x0BCC
		length_list[0x0BCC] = -1;

		// Packet: 0x0BCD
		length_list[0x0BCD] = -1;

		// Packet: 0x0BCE
		length_list[0x0BCE] = 8;

		// Packet: 0x0BCF
		length_list[0x0BCF] = 9;

		// Packet: 0x0BD0
		length_list[0x0BD0] = 8;

		// Packet: 0x0BD1
		length_list[0x0BD1] = 13;

		// Packet: 0x0BD2
		length_list[0x0BD2] = 8;

		// Packet: 0x0BD3
		length_list[0x0BD3] = 13;

		// Packet: 0x0BD4
		length_list[0x0BD4] = 2;

		// Packet: 0x0BD5
		length_list[0x0BD5] = 9;

		// Packet: 0x0BD6
		length_list[0x0BD6] = 8;

		// Packet: 0x0BD7
		length_list[0x0BD7] = 9;

		// Packet: 0x0BD8
		length_list[0x0BD8] = 14;

		// Packet: 0x0BD9
		length_list[0x0BD9] = 51;

		// Packet: 0x0BDA
		length_list[0x0BDA] = -1;

		// Packet: 0x0BDB
		length_list[0x0BDB] = 19;

		// Packet: 0x0BDC
		length_list[0x0BDC] = 18;

		// Packet: 0x0BDD
		length_list[0x0BDD] = -1;

		// Packet: 0x0BDE
		length_list[0x0BDE] = -1;

		// Packet: 0x0BDF
		length_list[0x0BDF] = 3;

		// Packet: 0x0BE0
		length_list[0x0BE0] = 3;

		// Packet: 0x0BE1
		length_list[0x0BE1] = 3;

		// Packet: 0x0BE2
		length_list[0x0BE2] = 137;

		// Packet: 0x0BE3
		length_list[0x0BE3] = 34;

		// Packet: 0x0BE4
		length_list[0x0BE4] = 14;

		// Packet: 0x0BE5
		length_list[0x0BE5] = 8;

		// Packet: 0x0BE6
		length_list[0x0BE6] = 8;

		// Packet: 0x0BE7
		length_list[0x0BE7] = 4;

		// Packet: 0x0BE8
		length_list[0x0BE8] = 4;

		// Packet: 0x0BE9
		length_list[0x0BE9] = 6;

		// Packet: 0x0BEA
		length_list[0x0BEA] = 10;

		// Packet: 0x0BEB
		length_list[0x0BEB] = 7;

		// Packet: 0x0BEC
		length_list[0x0BEC] = 7;

		// Packet: 0x0BED
		length_list[0x0BED] = 9;

		// Packet: 0x0BEE
		length_list[0x0BEE] = 5;

		// Packet: 0x0BEF
		length_list[0x0BEF] = -1;

		// Packet: 0x0BF0
		length_list[0x0BF0] = 14;

		// Packet: 0x0BF1
		length_list[0x0BF1] = 18;

		// Packet: 0x0BF2
		length_list[0x0BF2] = 13;

		// Packet: 0x0BF3
		length_list[0x0BF3] = -1;

		// Packet: 0x0BF4
		length_list[0x0BF4] = -1;

		// Packet: 0x0BF5
		length_list[0x0BF5] = 6;

		// Packet: 0x0BF6
		length_list[0x0BF6] = -1;

		// Packet: 0x0BF7
		length_list[0x0BF7] = -1;

		// Packet: 0x0BF8
		length_list[0x0BF8] = 6;

		// Packet: 0x0BF9
		length_list[0x0BF9] = 11;

		// Packet: 0x0BFA
		length_list[0x0BFA] = 9;

		// Packet: 0x0BFB
		length_list[0x0BFB] = 35;

		// Packet: 0x0BFC
		length_list[0x0BFC] = 6;

		// Packet: 0x0BFD
		length_list[0x0BFD] = 4;

		// Packet: 0x0BFE
		length_list[0x0BFE] = -1;

		// Packet: 0x0BFF
		length_list[0x0BFF] = 24;

		// Packet: 0x0C00
		length_list[0x0C00] = 6;

		// Packet: 0x0C01
		length_list[0x0C01] = 6;

		// Packet: 0x0C02
		length_list[0x0C02] = 6;

		// Packet: 0x0C03
		length_list[0x0C03] = 6;

		// Packet: 0x0C04
		length_list[0x0C04] = 8;

		// Packet: 0x0C05
		length_list[0x0C05] = 30;

		// Packet: 0x0C06
		length_list[0x0C06] = 8;

		// Packet: 0x0C07
		length_list[0x0C07] = 12;

		// Packet: 0x0C08
		length_list[0x0C08] = 6;

		// Packet: 0x0C09
		length_list[0x0C09] = 116;

		// Packet: 0x0C0A
		length_list[0x0C0A] = 30;

		// Packet: 0x0C0B
		length_list[0x0C0B] = 18;

		// Packet: 0x0C0C
		length_list[0x0C0C] = 4;

		// Packet: 0x0C0D
		length_list[0x0C0D] = 167;

		// Packet: 0x0C0E
		length_list[0x0C0E] = 689;

		// Packet: 0x0C0F
		length_list[0x0C0F] = 610;

		// Packet: 0x0C10
		length_list[0x0C10] = 15;

		// Packet: 0x0C11
		length_list[0x0C11] = 11;

		// Packet: 0x0C12
		length_list[0x0C12] = 7;

		// Packet: 0x0C13
		length_list[0x0C13] = 11;

		// Packet: 0x0C14
		length_list[0x0C14] = 14;

		// Packet: 0x0C15
		length_list[0x0C15] = -1;

		// Packet: 0x0C16
		length_list[0x0C16] = 9;

		// Packet: 0x0C17
		length_list[0x0C17] = 10;

		// Packet: 0x0C18
		length_list[0x0C18] = 20;

		// Packet: 0x0C19
		length_list[0x0C19] = 8;

		// Packet: 0x0C1A
		length_list[0x0C1A] = 20;

		// Packet: 0x0C1B
		length_list[0x0C1B] = 8;

		// Packet: 0x0C1C
		length_list[0x0C1C] = -1;

		// Packet: 0x0C1D
		length_list[0x0C1D] = -1;

		// Packet: 0x0C1E
		length_list[0x0C1E] = 10;

		// Packet: 0x0C1F
		length_list[0x0C1F] = 1000;

		// Packet: 0x0C20
		length_list[0x0C20] = -1;

		// Packet: 0x0C21
		length_list[0x0C21] = -1;

		// Packet: 0x0C22
		length_list[0x0C22] = 12;

		// Packet: 0x0C23
		length_list[0x0C23] = 9;

		// Packet: 0x0C24
		length_list[0x0C24] = 979;

		// Packet: 0x0C25
		length_list[0x0C25] = 12;

		// Packet: 0x0C26
		length_list[0x0C26] = 94;

		// Packet: 0x0C27
		length_list[0x0C27] = 2;

		// Packet: 0x0C28
		length_list[0x0C28] = -1;

		// Packet: 0x0C29
		length_list[0x0C29] = -1;

		// Packet: 0x0C2A
		length_list[0x0C2A] = 4;

		// Packet: 0x0C2B
		length_list[0x0C2B] = 8;

		// Packet: 0x0C2C
		length_list[0x0C2C] = 4;

		// Packet: 0x0C2D
		length_list[0x0C2D] = 3;

		// Packet: 0x0C2E
		length_list[0x0C2E] = 15;

		// Packet: 0x0C2F
		length_list[0x0C2F] = 2;

		// Packet: 0x0C30
		length_list[0x0C30] = 15;

		// Packet: 0x0C31
		length_list[0x0C31] = -1;

		// Packet: 0x0C32
		length_list[0x0C32] = -1;

		// Packet: 0x0C33
		length_list[0x0C33] = 8;

		// Packet: 0x0C34
		length_list[0x0C34] = 3;

		// Packet: 0x0C35
		length_list[0x0C35] = 6;

		// Packet: 0x0C36
		length_list[0x0C36] = 12;

		// Packet: 0x0C37
		length_list[0x0C37] = -1;

		// Packet: 0x0C38
		length_list[0x0C38] = -1;

		// Packet: 0x0C39
		length_list[0x0C39] = -1;

		// Packet: 0x0C3A
		length_list[0x0C3A] = -1;

		// Packet: 0x0C3B
		length_list[0x0C3B] = 33;

		// Packet: 0x0C3C
		length_list[0x0C3C] = 6;

		// Packet: 0x0C3D
		length_list[0x0C3D] = 6;

		// Packet: 0x0C3E
		length_list[0x0C3E] = 8;

		// Packet: 0x0C3F
		length_list[0x0C3F] = 7;

		// Packet: 0x0C40
		length_list[0x0C40] = 19;

		// Packet: 0x0C41
		length_list[0x0C41] = 2;

		// Packet: 0x0C42
		length_list[0x0C42] = 19;

		// Packet: 0x0C43
		length_list[0x0C43] = 18;

		// Packet: 0x0C44
		length_list[0x0C44] = -1;

		// Packet: 0x26AC
		length_list[0x26AC] = 23;

		return length_list;
	}

	/**
	 * Export
	 */
	return {
		init: init
	};
});