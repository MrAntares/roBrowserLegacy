/**
 * @module DB/Effects/Table/Jobs/Merchant/Blacksmith
 *
 * The Merchant line's Blacksmith effects: its named ef_<skill prefix>_* rows and the named
 * rows only its skills use. DB/Effects/EffectTable.js joins the parts; its header lists the
 * parameters a row takes. Keep a skill's rows together.
 */

import SoundManager from 'Audio/SoundManager.js';
import Events from 'Core/Events.js';

export default {
	maximize_power_sounds: [
		{
			type: 'FUNC',
			attachedEntity: true,
			func: function MaximizePowerSounds(Params) {
				Events.setTimeout(function () {
					SoundManager.play('effect/black_maximize_power_circle.wav');
				}, 1);
				Events.setTimeout(function () {
					SoundManager.play('effect/black_maximize_power_sword.wav');
				}, 550);
				Events.setTimeout(function () {
					SoundManager.play('effect/black_maximize_power_sword.wav');
				}, 700);
				Events.setTimeout(function () {
					SoundManager.play('effect/black_maximize_power_sword_bic.wav');
				}, 950);
			}
		}
	],

	ef_greed_sound: [
		{
			wav: 'effect/ef_entry',
			attachedEntity: true
		}
	],

	// Advanced Adrenaline Rush (BS_ADRENALINE2), from the client's own effect folders.
	ef_bs_adrenaline2: [
		{
			type: 'STR',
			file: 'adrenaline',
			texturePath: ''
		}
	]
};
