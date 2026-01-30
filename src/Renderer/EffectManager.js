/**
 * @module Renderer/EffectManager
 *
 * Effects Manager
 *
 * @author Vincent Thibault
 */
define(function (require) {
	'use strict';


	/**
	 * Load dependencies
	 */
	const EffectDB    = require('DB/Effects/EffectTable');
	const SkillEffect   = require('DB/Skills/SkillEffect');
	const SkillUnit     = require('DB/Skills/SkillUnit');
	const SU            = require('DB/Skills/SkillUnitConst');
	const ItemEffect    = require('DB/Items/ItemEffect');
	const Commands      = require('Controls/ProcessCommand');
	const Events        = require('Core/Events');
	const Configs       = require('Core/Configs');
	const Cylinder      = require('Renderer/Effects/Cylinder');
	const StrEffect     = require('Renderer/Effects/StrEffect');
	const RsmEffect     = require('Renderer/Effects/RsmEffect');
	const TwoDEffect    = require('Renderer/Effects/TwoDEffect');
	const ThreeDEffect  = require('Renderer/Effects/ThreeDEffect');
	const Entity        = require('Renderer/Entity/Entity');
	const EntityManager = require('Renderer/EntityManager');
	const Renderer      = require('Renderer/Renderer');
	const Altitude      = require('Renderer/Map/Altitude');
	const Sound         = require('Audio/SoundManager');
	const Preferences   = require('Preferences/Map');
	const QuadHorn      = require('Renderer/Effects/QuadHorn');
	const Session       = require('Engine/SessionStorage');
	var GraphicsSettings = require('Preferences/Graphics');

	/**
	 * @type {object} saved webgl context
	 */
	let _gl;


	/**
	 * @type {object} effect listing
	 */
	let _list = {};


	/**
	 * @type {object} Effects namespace
	 */
	const EffectManager = {};


	/**
	 * @type {number} used to differenciate constructors
	 */
	let _uniqueId = 1;

	/**
	 * Reset a constructor and clear its instances so it re-initializes on next use.
	 *
	 * @param {string} name constructor key in _list
	 */
	EffectManager.resetConstructor = function resetConstructor(name) {
		if (_list[name]) {
			delete _list[name];
		}
		// If we have a known constructor in scope, mark for re-init
		switch (name) {
		case 'TwoDEffect':
			TwoDEffect.ready = false;
			TwoDEffect.needInit = true;
			break;
		case 'ThreeDEffect':
			ThreeDEffect.ready = false;
			ThreeDEffect.needInit = true;
			break;
		default:
			break;
		}
	};


	/**
	 * Initialize effects manager
	 */
	EffectManager.init = function init(gl) {
		_gl = gl;

		if(Configs.get('development')){
			Commands.add(
				'd_effectmanager',
				'Print EffectManager list to console.',
				function(){
					EffectManager.debug();
				},
				['d_em'],
				true
			);
		} else {
			if(Commands.isEnabled('d_effectmanager')){
				Commands.remove('d_effectmanager');
			}
		}

	};


	/**
	 * Create a new EF_Init_Par object and attach existing call params
	 */
	function PrepareInit(callParams) {
		const Params = {
			effectId:      -1,
			skillId:       null,
			ownerAID:      null,
			position:      null,
			startTick:     null,
			duration:      null,
			persistent:    false,
			repeatEnd:     null,
			repeatDelay:   0,
			otherAID:      null,
			otherPosition: null
		};
		Object.assign(Params, callParams);

		if (!Params.startTick) {
			Params.startTick = Renderer.tick;
		}

		Params.ownerEntity = EntityManager.get(Params.ownerAID);
		Params.otherEntity = EntityManager.get(Params.otherAID);

		return Params;
	}

	/**
	 * Add effect to the render list
	 *
	 * @param {function} effect renderer function
	 * @param {object} effect parameter object
	 */
	EffectManager.add = function add(effect, Params) {
		const name = (effect.constructor.name || effect.constructor._uid || (effect.constructor._uid = (_uniqueId++)));

		if (!(name in _list)) {
			_list[name] = [];

			if (effect.constructor.init) {
				effect.constructor.needInit = true;
			}

			// Keep constructor renderBeforeEntities as-is; do not override to false here,
			// so external configuration (e.g., aura ordering) is respected.
		}

		if (effect.init) {
			effect.needInit = true;
		}

		effect._Params = Params;

		// Per-instance ordering: prefer explicit flag, else constructor default
		if (effect._Params && effect._Params.Inst && typeof effect._Params.Inst.renderBeforeEntities !== 'undefined') {
			effect.renderBeforeEntities = !!effect._Params.Inst.renderBeforeEntities;
		} else {
			effect.renderBeforeEntities = !!effect.constructor.renderBeforeEntities;
		}

		// Aura-specific: force renderBeforeEntities for known aura effect IDs to keep them under sprites.
		if (effect._Params && effect._Params.Inst && effect._Params.Inst.effectID) {
			const auraEffectIds = [200, 201, 202, 362, 397, 398, 881];
			if (auraEffectIds.indexOf(effect._Params.Inst.effectID) !== -1) {
				effect.renderBeforeEntities = true;
			}
		}

		_list[name].push(effect);
	};


	/**
	 * Remove an effect
	 *
	 * @param {effect}
	 * @param {mixed} effect owner ID
	 */
	EffectManager.remove = function removeClosure() {
		function clean(name, AID, effectID) {
			const effectIdList = Array.isArray(effectID) ? effectID : [effectID];
			let list, i, count;

			list  = _list[name];
			count = list.length;

			for (i = 0; i < count; ++i) {
				if ((!AID || (AID && list[i]._Params.Init.ownerAID === AID)) && (!effectID || (effectID && effectIdList.includes(list[i]._Params.Inst.effectID)))) {
					if (list[i].free) {
						list[i].free(_gl);
					}
					list.splice(i, 1);
					i--;
					count--;
				}
			}

			if (!count) {
				//if (effect.free) {
				//	effect.free(_gl);
				//}
				delete _list[name];
			}
		}

		return function remove(effect, AID, effectID) {
			if (!effect || !(effect.name in _list)) {
				const keys = Object.keys(_list);
				let i, count;

				for (i = 0, count = keys.length; i < count; ++i) {
					clean(keys[i], AID, effectID);
				}

			} else {
				clean(effect.name, AID, effectID);
			}

			// Remove entity effects
			if (!(AID == null)) {
				var entity = EntityManager.get(AID);
				if (entity) {
					if (entity.objecttype === entity.constructor.TYPE_EFFECT) {
						EntityManager.remove(AID); // Whole entity is an effect, just remove it
					} else if (!(effectID == null)) {
						entity.attachments.remove(effectID); // Only remove attached effect
					}
				}
			}
		};
	}();


	/**
	 * Destroy all effects
	 */
	EffectManager.free = function free(gl) {
		const keys = Object.keys(_list);
		let i, j, size, count, list, constructor;

		for (i = 0, count = keys.length; i < count; ++i) {
			list        = _list[keys[i]];
			constructor = list[0].constructor;

			for (j = 0, size = list.length; j < size; ++j) {
				if (list[j].free) {
					list[j].free(gl);
				}
			}

			if (constructor.free) {
				constructor.free(gl);
			}

			delete _list[keys[i]];
		}
	};


	/**
	 * Renderering all effects
	 *
	 * @param {object} webgl context
	 * @param {mat4} modelView matrix
	 * @param {mat4} projection matrix
	 * @param {mat3} normal matrix
	 * @param {object} fog structure
	 * @param {object} light structure
	 * @param {number} game tick
	 * @param {boolean} render before entities ?
	 */
	EffectManager.render = function render(gl, modelView, projection, fog, tick, renderBeforeEntities) {
		const keys  = Object.keys(_list);
		const count = keys.length;
		let i, j, size, list, constructor;

		for (i = 0; i < count; ++i) {
			list = _list[keys[i]];

			if (!list.length) {
				delete _list[keys[i]];
				continue;
			}

			constructor = list[0].constructor;

			// Initialize constructor if needed
			if (!(constructor.ready) && constructor.needInit) {
				constructor.init(gl);
				constructor.needInit = false;
			}

			if (constructor.ready) {
				constructor.beforeRender(gl, modelView, projection, fog, tick, null);

				for (j = 0, size = list.length; j < size; ++j) {
					var effect = list[j];
					// Filter per-instance ordering against the pass flag
					if (!!effect.renderBeforeEntities !== renderBeforeEntities) {
						continue;
					}

					if (!(effect.ready) && effect.needInit) {
						effect.init(gl);
						effect.needInit = false;
					}

					if (effect.ready) {
						effect.render(gl, tick);
					}

					// Try repeating the effect.
					size += repeatEffect(effect);

					if (effect.needCleanUp) {
						if (effect.free) {
							effect.free(gl);
						}
						list.splice(j, 1);
						j--;
						size--;
					}
				}

				constructor.afterRender(gl);

				if (size === 0) {
					if (constructor.free) {
						constructor.free(gl);
					}
					delete _list[keys[i]];
				}
			}
		}
	};


	/**
	 * Repeat an existing effect if needed
	 *
	 * @param {object} effect
	 */
	function repeatEffect(effect) {
		const Params    = effect._Params;
		let restartTick = false, RepeatParams, EF_Inst_Par

		if ((Params.Inst.persistent || Params.Inst.repeatEnd) && !(effect._AlreadyRepeated)) {

			if (Params.Inst.duration && Params.Inst.duration > 0 && (Renderer.tick > Params.Inst.endTick + Params.Inst.repeatDelay)) { // Has predefined duration and time to repeat (negative delay)


				if ((!Params.Inst.repeatEnd) || (Params.Inst.repeatEnd > Params.Inst.endTick + Params.Inst.repeatDelay)) { // Repeat period not ended
					restartTick = Params.Inst.endTick + Params.Inst.repeatDelay; // Reference original timing to avoid timing going crazy
				}

			} else if (effect.needCleanUp) { // Finished rendering and need to set a repeat (0 or positive delay)

				if ((!Params.Inst.repeatEnd) || (Params.Inst.repeatEnd > Renderer.tick + Params.Inst.repeatDelay)) { // Repeat period not ended
					restartTick = Renderer.tick + Params.Inst.repeatDelay;
				}

			}

			if (restartTick) {

				// Re-spam effect if needed to repeat
				EF_Inst_Par = {
					effectID:    Params.Inst.effectID,
					duplicateID: Params.Inst.duplicateID,
					startTick:   restartTick,
					noDelay:     true // Offsets and delays are no longer used
				}

				RepeatParams = {
					effect: Params.effect,
					Inst:   EF_Inst_Par,
					Init:   Params.Init
				}

				EffectManager.spamEffect(RepeatParams);
				effect._AlreadyRepeated = true;
				return 1;
			}

		}

		return 0;
	}


	/**
	 * Stops an effect's repeat
	 *
	 * @param {effect}
	 * @param {mixed} effect owner ID
	 * @param {mixed} effect ID
	 */
	EffectManager.endRepeat = function endRepeatClosure() {
		function cleanRepeat(name, AID, effectID) {
			let list, i, count;
			const effectIdList = Array.isArray(effectID) ? effectID : [effectID];

			list  = _list[name];
			count = list.length;

			for (i = 0; i < count; ++i) {
				if ((!AID || (AID && list[i]._Params.Init.ownerAID === AID)) && (!effectID || (effectID && effectIdList.includes(list[i].effectID)))) {
					if (list[i]._Params.Inst.persistent) {
						list[i]._Params.Inst.persistent = false;
					}

					if (list[i]._Params.Inst.repeatEnd) {
						list[i]._Params.Inst.repeatEnd = false;
					}
				}
			}
		}

		return function endRepeat(effect, AID, effectID) {
			if (!effect || !(effect.name in _list)) {
				let i, count;
				const keys = Object.keys(_list);

				for (i = 0, count = keys.length; i < count; ++i) {
					cleanRepeat(keys[i], AID, effectID);
				}

				return;
			}

			cleanRepeat(effect.name, AID, effectID);
		};
	}();

	/**
	 * Spam an effect to the scene
	 *
	 * @param {object} Effect initial parameters {
	 *     @param effectId {number} effect id
	 *     @param ownerAID {number} owner actor id
	 *     @param position {Array} position
	 *     @param startTick {number} tick
	 *     @param persistent {boolean} is persistent?
	 *     @param repeatEnd {repeatEnd} for how long to repeat
	 *     @param otherAID {number} target/source (other) actor id
	 *     @param otherPosition {Array} target/source (other) position
	 * }
	 */
	EffectManager.spam = function spam(EF_Init_Par) {
		// Empty call
		if (!EF_Init_Par) {
			return;
		}

		// No effect mode (/effect)
		if (!Preferences.effect) {
			return;
		}

		// Prepare params
		EF_Init_Par = PrepareInit(EF_Init_Par);

		// Not found
		if (!(EF_Init_Par.effectId in EffectDB)) {
			return;
		}

		let effects = EffectDB[EF_Init_Par.effectId], EF_Inst_Par, Params;
		let i, j, count;

		for (i = 0, count = effects.length; i < count; ++i) {

			if (effects[i].duplicate == -1) {
				effects[i].duplicate = 999;
			} else {
				effects[i].duplicate = effects[i].duplicate ? Math.min(effects[i].duplicate, 999) : 1;
			}

			effects[i].timeBetweenDupli = !isNaN(effects[i].timeBetweenDupli) ? effects[i].timeBetweenDupli : 200;

			for (j = 0; j < effects[i].duplicate; ++j) {
				EF_Inst_Par = {
					effectID:    EF_Init_Par.effectId,
					duplicateID: j,
					startTick:   EF_Init_Par.startTick + (effects[i].timeBetweenDupli * j)
				}

				Params = {
					effect: effects[i],
					Inst:   EF_Inst_Par,
					Init:   EF_Init_Par
				}

				EffectManager.spamEffect(Params);
			}
		}
	};


	/**
	 * Spam an effect
	 *
	 * @param {object} effect params
	 */
	EffectManager.spamEffect = function spamEffect(Params) {
		let filename;

		Params.Inst.position      = Params.Init.position;
		Params.Inst.otherPosition = Params.Init.otherPosition;

		// Propagate per-instance render ordering from effect definition
		if (typeof Params.effect.renderBeforeEntities !== 'undefined') {
			Params.Inst.renderBeforeEntities = !!Params.effect.renderBeforeEntities;
		}

		if (!Params.Inst.position) {
			if (!Params.Init.ownerEntity) {
				return;
			}
			Params.Inst.position = Params.Init.ownerEntity.position;
		}

		if (!Params.Inst.otherPosition) {
			if (Params.Init.otherEntity) {
				Params.Inst.otherPosition = Params.Init.otherEntity.position;
			} else {
				Params.Inst.otherPosition = [Params.Inst.position[0] - 5
					, Params.Inst.position[1] + 5
					, Params.Inst.position[2]];
			}

		}

		// Copy instead of get reference
		Params.Inst.position = Params.effect.attachedEntity ? Params.Inst.position : [Params.Inst.position[0], Params.Inst.position[1], Params.Inst.position[2]];

		// Repeat
		Params.Inst.persistent = Params.Init.persistent || false;

		if (typeof Params.effect.repeat !== 'undefined' && Params.effect.repeat !== null) {
			Params.Inst.persistent = Params.effect.repeat; // Effect conf overrides. We can selecively enable/disable repeat on parts using this.
		}

		Params.Inst.repeatEnd   = Params.Init.repeatEnd ? Params.Init.repeatEnd : Params.effect.repeatEnd || 0; // Main has priority
		Params.Inst.repeatDelay = Params.effect.repeatDelay ? Params.effect.repeatDelay : Params.Init.repeatDelay; // Instance has priority

		// Play sound
		if (Params.effect.wav) {
			filename = Params.effect.wav;

			if (Params.effect.rand) {
				filename = filename.replace('%d', Math.round(Params.effect.rand[0] + (Params.effect.rand[1] - Params.effect.rand[0]) * Math.random()));
			}

			Events.setTimeout(function () {
				//calculate the sound volume from distance
				Sound.playPosition(filename + '.wav', Params.Inst.position);
			}, Params.Inst.startTick + (!isNaN(Params.effect.delayWav) ? Params.effect.delayWav : 0) - Renderer.tick);
		}

		Params.Inst.direction = (Params.effect.attachedEntity && Params.Init.ownerEntity) ? Params.Init.ownerEntity.direction : 0;

		//Set delays
		Params.Inst.duration = !isNaN(Params.effect.duration) ? Params.effect.duration : Params.Init.duration;

		Params.Inst.delayOffsetDelta = !isNaN(Params.effect.delayOffsetDelta) ? Params.effect.delayOffsetDelta * Params.Inst.duplicateID : 0;
		Params.Inst.delayLateDelta   = !isNaN(Params.effect.delayLateDelta) ? Params.effect.delayLateDelta * Params.Inst.duplicateID : 0;

		Params.Inst.delayOffset = !isNaN(Params.effect.delayOffset) ? Params.effect.delayOffset + Params.Inst.delayOffsetDelta : 0;
		Params.Inst.delayLate   = !isNaN(Params.effect.delayLate) ? Params.effect.delayLate + Params.Inst.delayLateDelta : 0;

		//Start and End
		Params.Inst.startTick = Params.Inst.startTick + (Params.Inst.noDelay ? Params.Inst.delayOffset + Params.Inst.delayLate : 0);
		Params.Inst.endTick   = Params.Inst.duration > 0 ? Params.Inst.startTick + (Params.Inst.noDelay ? Params.Inst.delayOffset : 0) + Params.Inst.duration : -1;

		switch (Params.effect.type) {
			case 'SPR':
				spamSprite(Params);
				break;

			case 'STR':
				spamSTR(Params);
				break;

			case 'CYLINDER':
				EffectManager.add(new Cylinder(Params.effect, Params.Inst, Params.Init), Params);
				break;

			case '2D':
				EffectManager.add(new TwoDEffect(Params.effect, Params.Inst, Params.Init), Params);
				break;

			case '3D':
				EffectManager.add(new ThreeDEffect(Params.effect, Params.Inst, Params.Init), Params);
				break;

			case 'RSM':
			case 'RSM2':
				EffectManager.add(new RsmEffect(Params), Params);
				break;

			case 'QuadHorn':
				EffectManager.add(new QuadHorn(Params.effect, Params.Inst, Params.Init), Params);
				break;

			case 'FUNC':
				if (Params.effect.func) {
					if (Params.effect.attachedEntity) {
						if (Params.Init.ownerEntity) {
							Params.effect.func.call(this, Params);
						}
					} else {
						Params.effect.func.call(this, Params);
					}
				}
				break;
		}
	};


	/**
	 * Spam an effect to the scene
	 *
	 * @param {object} effect params
	 */
	function spamSTR(Params) {
		let filename;
		const texturePath = Params.effect.texturePath || '';

		// Get STR file
		if (Preferences.mineffect && Params.effect.min) {
			filename = Params.effect.min;
		} else {
			filename = Params.effect.file;
		}

		// Randomize STR file name
		if (Params.effect.rand) {
			filename = filename.replace('%d', Math.round(Params.effect.rand[0] + (Params.effect.rand[1] - Params.effect.rand[0]) * Math.random()));
		}

		// Start effect
		EffectManager.add(new StrEffect('data/texture/effect/' + filename + '.str', Params.Inst.position, Params.Inst.startTick, texturePath), Params);
	}


	/**
	 * Spam an effect to the scene
	 *
	 * @param {object} effect prams
	 */
	function spamSprite(Params) {
		let entity      = Params.Init.ownerEntity;
		let isNewEntity = false;

		if (!entity) {
			entity            = new Entity();
			entity.GID        = Params.Init.ownerAID;
			entity.position   = Params.Inst.position;
			entity.objecttype = entity.constructor.TYPE_EFFECT;
			isNewEntity       = true;
		} else if (!Params.effect.attachedEntity) {
			entity            = new Entity();
			entity.GID        = -1;
			entity.position   = Params.Inst.position;
			entity.objecttype = entity.constructor.TYPE_EFFECT;
			isNewEntity       = true;
		}


		// Sprite effect
		entity.attachments.add({
			uid:       Params.effect.effectID,
			file:      Params.effect.file,
			head:      !!Params.effect.head,
			direction: !!Params.effect.direction,
			repeat:    Params.effect.repeat || Params.Inst.persistent,
			duplicate: Params.effect.duplicate,
			stopAtEnd: Params.effect.stopAtEnd,
			xOffset:   Params.effect.xOffset,
			yOffset:   Params.effect.yOffset,
			frame:     Params.effect.frame,
			delay:     Params.effect.delayFrame
		});

		if (isNewEntity) {
			EntityManager.add(entity);
		}
	}

	// TODO: Move these somewhere else, maybe a DB file
	/** for the EffectManager.spamSkillZone */
	const targetableUnits = [
		SU.UNT_ICEWALL,
		SU.UNT_REVERBERATION,
	];

	/** for the EffectManager.spamSkillZone */
	const traps = [
		SU.UNT_TRAP,
		SU.UNT_BLASTMINE,
		SU.UNT_SKIDTRAP,
		SU.UNT_ANKLESNARE,
		SU.UNT_LANDMINE,
		SU.UNT_SHOCKWAVE,
		SU.UNT_SANDMAN,
		SU.UNT_FLASHER,
		SU.UNT_FREEZINGTRAP,
		SU.UNT_CLAYMORETRAP,
		SU.UNT_TALKIEBOX,
		SU.UNT_MAGENTATRAP,
		SU.UNT_COBALTTRAP,
		SU.UNT_MAIZETRAP,
		SU.UNT_VERDURETRAP,
		SU.UNT_FIRINGTRAP,
		SU.UNT_ICEBOUNDTRAP,
		SU.UNT_ELECTRICSHOCKE,
		SU.UNT_CLUSTERBOMB,
		SU.UNT_ICEMINE
	];

	/**
	 * Spam effect on ground
	 *
	 * @param {number} unit id
	 * @param {number} position x
	 * @param {number} position y
	 * @param {number} skill unique id
	 */
	EffectManager.spamSkillZone = function spamUnit(unit_id, xPos, yPos, uid, creatorUid) {
		let effectId, entity, isNewEntity = false, EF_Init_Par;

		// No effect mode (/effect)
		if (!Preferences.effect) {
			return;
		}

		if (!(unit_id in SkillUnit)) {
			return;
		}

		effectId = SkillUnit[unit_id];

		if (!(effectId in EffectDB)) {
			return;
		}

		// Remove old version if present (effect & entity)
		EffectManager.remove(null, uid);

		// New Entity
		entity            = new Entity();
		entity.GID        = uid;
		entity.position   = [xPos, yPos, Altitude.getCellHeight(xPos, yPos)];
		entity.hideShadow = true;
		entity.objecttype = traps.includes(unit_id) ? entity.constructor.TYPE_TRAP : (targetableUnits.includes(unit_id) ? entity.constructor.TYPE_UNIT : entity.constructor.TYPE_EFFECT);
		entity.creatorGID = creatorUid;

		EntityManager.add(entity);

		// Effect
		EF_Init_Par = {
			effectId:   effectId,
			ownerAID:   uid,
			position:   [xPos, yPos, Altitude.getCellHeight(xPos, yPos)],
			startTick:  Renderer.tick,
			persistent: true,
			duration:   -1, // Infinite by default but the effect param can have a duration that overrides this
			otherAID:   creatorUid
		};

		EffectManager.spam(EF_Init_Par);
	};


	/**
	 * Spam a skill on a target
	 *
	 * @param {number} skill id
	 * @param {number} target aid
	 * @param {Array} position
	 * @param {number} tick
	 */
	EffectManager.spamSkill = function spamSkill(skillId, destAID, position, tick, srcAID) {
		let effects, EF_Init_Par;
		if (!(skillId in SkillEffect)) {
			return;
		}

		if (SkillEffect[skillId].effectId) {
			effects = Array.isArray(SkillEffect[skillId].effectId) ? SkillEffect[skillId].effectId : [SkillEffect[skillId].effectId];

			effects.forEach(effectId => {
				EF_Init_Par = {
					effectId:  effectId,
					ownerAID:  destAID,
					position:  position,
					startTick: tick,
					otherAID:  srcAID
				};

				EffectManager.spam(EF_Init_Par);
			});
		}

		if (SkillEffect[skillId].effectIdOnCaster && srcAID) {
			effects = Array.isArray(SkillEffect[skillId].effectIdOnCaster) ? SkillEffect[skillId].effectIdOnCaster : [SkillEffect[skillId].effectIdOnCaster];

			effects.forEach(effectId => {
				EF_Init_Par = {
					effectId:  effectId,
					ownerAID:  srcAID,
					position:  position,
					startTick: tick,
					otherAID:  destAID
				};

				EffectManager.spam(EF_Init_Par);
			});
		}
	};

	/**
	 * Spam skill effect on success
	 *
	 * @param {number} skill id
	 * @param {number} target aid
	 * @param {number} tick
	 */
	EffectManager.spamSkillSuccess = function spamSkillSuccess(skillId, destAID, tick, srcAID) {
		let effects, EF_Init_Par;
		if (!(skillId in SkillEffect)) {
			return;
		}

		if (SkillEffect[skillId].successEffectId) {
			effects = Array.isArray(SkillEffect[skillId].successEffectId) ? SkillEffect[skillId].successEffectId : [SkillEffect[skillId].successEffectId];

			effects.forEach(effectId => {
				EF_Init_Par = {
					effectId:  effectId,
					ownerAID:  destAID,
					startTick: tick,
					otherAID:  srcAID
				};

				EffectManager.spam(EF_Init_Par);
			});
		}

		if (SkillEffect[skillId].successEffectIdOnCaster) {
			effects = Array.isArray(SkillEffect[skillId].successEffectIdOnCaster) ? SkillEffect[skillId].successEffectIdOnCaster : [SkillEffect[skillId].successEffectIdOnCaster];

			effects.forEach(effectId => {
				EF_Init_Par = {
					effectId:  effectId,
					ownerAID:  srcAID,
					startTick: tick,
					otherAID:  destAID
				};

				EffectManager.spam(EF_Init_Par);
			});
		}
	};

	/**
	 * Spam skill effect on hit with damage
	 *
	 * @param {number} skill id
	 * @param {number} target aid
	 * @param {number} tick
	 */
	EffectManager.spamSkillHit = function spamSkillHit(skillId, destAID, tick, srcAID) {
		let effects, EF_Init_Par;
		if (!(skillId in SkillEffect)) {
			return;
		}

		if (SkillEffect[skillId].hitEffectId) {
			effects = Array.isArray(SkillEffect[skillId].hitEffectId) ? SkillEffect[skillId].hitEffectId : [SkillEffect[skillId].hitEffectId];

			effects.forEach(effectId => {
				EF_Init_Par = {
					effectId:  effectId,
					ownerAID:  destAID,
					startTick: tick,
					otherAID:  srcAID
				};

				EffectManager.spam(EF_Init_Par);
			});
		}

		if (SkillEffect[skillId].hitEffectIdOnCaster) {
			effects = Array.isArray(SkillEffect[skillId].hitEffectIdOnCaster) ? SkillEffect[skillId].hitEffectIdOnCaster : [SkillEffect[skillId].hitEffectIdOnCaster];

			effects.forEach(effectId => {
				EF_Init_Par = {
					effectId:  effectId,
					ownerAID:  srcAID,
					startTick: tick,
					otherAID:  destAID
				};

				EffectManager.spam(EF_Init_Par);
			});
		}
	};

	/**
	 * Spam skill before the hit lands (regardless of damage)
	 *
	 * @param {number} skill id
	 * @param {number} target aid
	 * @param {number} tick
	 */
	EffectManager.spamSkillBeforeHit = function spamSkillBeforeHit(skillId, destAID, tick, srcAID) {
		let effects, EF_Init_Par;
		if (!(skillId in SkillEffect)) {
			return;
		}

		if (SkillEffect[skillId].beforeHitEffectId) {
			effects = Array.isArray(SkillEffect[skillId].beforeHitEffectId) ? SkillEffect[skillId].beforeHitEffectId : [SkillEffect[skillId].beforeHitEffectId];

			effects.forEach(effectId => {
				EF_Init_Par = {
					effectId:  effectId,
					ownerAID:  destAID,
					startTick: tick,
					otherAID:  srcAID
				};

				EffectManager.spam(EF_Init_Par);
			});
		}

		if (SkillEffect[skillId].beforeHitEffectIdOnCaster) {
			effects = Array.isArray(SkillEffect[skillId].beforeHitEffectIdOnCaster) ? SkillEffect[skillId].beforeHitEffectIdOnCaster : [SkillEffect[skillId].beforeHitEffectIdOnCaster];

			// var EF_Init_Par = { // Unused
			// 	effectId: effectId,
			// 	ownerAID: srcAID,
			// 	startTick: tick,
			// 	otherAID: destAID
			// };

			effects.forEach(effectId => {
				EF_Init_Par = {
					effectId:  effectId,
					ownerAID:  srcAID,
					startTick: tick,
					otherAID:  destAID
				};

				EffectManager.spam(EF_Init_Par);
			});
		}
	};

	/**
	 * Spam skill cast effect
	 *
	 * @param {number} skill id
	 * @param {number} target aid
	 * @param {number} tick
	 */
	EffectManager.spamSkillCast = function spamSkillCast(skillId, destAID, tick, srcAID) {
		let effects, EF_Init_Par;
		if (!(skillId in SkillEffect)) {
			return;
		}

		if (SkillEffect[skillId].beginCastEffectId) {
			effects = Array.isArray(SkillEffect[skillId].beginCastEffectId) ? SkillEffect[skillId].beginCastEffectId : [SkillEffect[skillId].beginCastEffectId];

			effects.forEach(effectId => {
				EF_Init_Par = {
					effectId:  effectId,
					ownerAID:  destAID,
					startTick: tick,
					otherAID:  srcAID
				};

				EffectManager.spam(EF_Init_Par);
			});
		}
	};

	/**
	 * Spam a item on a target
	 *
	 * @param {number} item id
	 * @param {number} target aid
	 * @param {Array} position
	 * @param {number} tick
	 */
	EffectManager.spamItem = function spamItem(itemId, destAID, position, tick, srcAID) {
		let effects, EF_Init_Par;
		if (!(itemId in ItemEffect)) {
			return;
		}

		if (ItemEffect[itemId].effectId) {
			effects = Array.isArray(ItemEffect[itemId].effectId) ? ItemEffect[itemId].effectId : [ItemEffect[itemId].effectId];

			effects.forEach(effectId => {
				EF_Init_Par = {
					effectId:  effectId,
					ownerAID:  destAID,
					position:  position,
					startTick: tick,
					otherAID:  srcAID
				};

				EffectManager.spam(EF_Init_Par);
			});
		}

		if (ItemEffect[itemId].effectIdOnCaster && srcAID) {
			effects = Array.isArray(ItemEffect[itemId].effectIdOnCaster) ? ItemEffect[itemId].effectIdOnCaster : [ItemEffect[itemId].effectIdOnCaster];

			effects.forEach(effectId => {
				EF_Init_Par = {
					effectId:  effectId,
					ownerAID:  srcAID,
					position:  position,
					startTick: tick,
					otherAID:  destAID
				};

				EffectManager.spam(EF_Init_Par);
			});
		}
	};

	EffectManager.debug = function(){
		console.log( '%c[DEBUG] EffectManager _list: ', 'color:#F5B342', _list );
	};

	/**
	 * Export
	 */
	return EffectManager;
});
