/**
 * @module DB/Effects/Table/ById/Effects0172-0198
 *
 * Effects 172 to 198 of the effect table, in ID order (see EffectConst.js).
 * DB/Effects/EffectTable.js joins the parts; its header lists the parameters a row takes.
 */

import Camera from 'Renderer/Camera.js';

export default {
	//172: [{}],	//EF_CHANGEDARK	   Change Element (Dark)
	//173: [{}],	//EF_CHANGEFIRE	   Change Element (Fire)
	//174: [{}],	//EF_CHANGECOLD	   Change Element (Water)
	//175: [{}],	//EF_CHANGEWIND	   Change Element (Wind)
	//176: [{}],	//EF_CHANGEFLAME	   Change Element (Fire)
	//177: [{}],	//EF_CHANGEEARTH	   Change Element (Earth)
	//178: [{}],	//EF_CHAINGEHOLY	   Change Element (Holy)
	//179: [{}],	//EF_CHANGEPOISON	   Change Element (Poison)

	//180: [{}],	//EF_HITDARK	   Dark Elemental Hit

	181: [
		{
			//EF_MENTALBREAK	Mental Breaker
			type: 'STR',
			file: 'mentalbreak',
			attachedEntity: true
		}
	],

	182: [
		{
			//EF_MAGICALATTHIT	Magical Hit
			type: 'STR',
			file: 'magical',
			attachedEntity: true
		}
	],

	183: [
		{
			//EF_SUI_EXPLOSION	Self Destruction
			type: 'STR',
			file: 'sui_explosion',
			attachedEntity: true,
			wav: 'effect/ef_hit2'
		},
		{
			type: 'FUNC',
			attachedEntity: true,
			func: function (Params) {
				const start = Params.Inst.startTick;
				const duration = 200;
				Camera.setQuake(start, duration);
			}
		}
	],

	//184: [{}],	//EF_DARKATTACK	   Dark Elemental Attack

	185: [
		{
			//EF_SUICIDE	(Nothing)
			type: 'STR',
			file: 'suicide',
			attachedEntity: true
		}
	],

	186: [
		{
			//EF_COMBOATTACK1	Combo Attack 1
			type: 'STR',
			file: 'yunta_1',
			attachedEntity: true
		}
	],

	187: [
		{
			//EF_COMBOATTACK2	Combo Attack 2
			type: 'STR',
			file: 'yunta_2',
			attachedEntity: true
		}
	],

	188: [
		{
			//EF_COMBOATTACK3	Combo Attack 3
			type: 'STR',
			file: 'yunta_3',
			attachedEntity: true
		}
	],

	189: [
		{
			//EF_COMBOATTACK4	Combo Attack 4
			type: 'STR',
			file: 'yunta_4',
			attachedEntity: true
		}
	],

	190: [
		{
			//EF_COMBOATTACK5	Combo Attack 5
			type: 'STR',
			file: 'yunta_5',
			attachedEntity: true
		}
	],

	191: [
		{
			//EF_GUIDEDATTACK	Guided Attack
			type: 'STR',
			file: 'homing',
			attachedEntity: true
		}
	],

	192: [
		{
			//EF_POISONATTACK	Poison Attack
			type: 'STR',
			file: 'poison',
			attachedEntity: true
		}
	],

	193: [
		{
			//EF_SILENCEATTACK	Silence Attack
			type: 'STR',
			file: 'silence',
			attachedEntity: true
		}
	],

	194: [
		{
			//EF_STUNATTACK	Stun Attack
			type: 'STR',
			file: 'stun',
			attachedEntity: true
		}
	],

	195: [
		{
			//EF_PETRIFYATTACK	Petrify Attack
			type: 'STR',
			file: 'stonecurse',
			attachedEntity: true
		}
	],

	//196: [{}],	//EF_CURSEATTACK	   Curse Attack

	197: [
		{
			//EF_SLEEPATTACK	Sleep Attack
			type: 'STR',
			file: 'sleep',
			attachedEntity: true
		}
	]
};
