/**
 * @module Renderer/EffectManager
 *
 * Effects Manager
 *
 * @author Vincent Thibault
 */

/**
 * Load dependencies
 */
import EffectDB from 'DB/Effects/EffectTable.js';
import SkillEffect from 'DB/Skills/SkillEffect.js';
import { motionEffectForPacket } from 'DB/Skills/SkillMotionEffect.js';
import SkillUnit, { SkillUnitEnd, SkillUnitFallback } from 'DB/Skills/SkillUnit.js';
import SU from 'DB/Skills/SkillUnitConst.js';
import ItemEffect from 'DB/Items/ItemEffect.js';
import Commands from 'Controls/ProcessCommand.js';
import Events from 'Core/Events.js';
import Configs from 'Core/Configs.js';
import Cylinder from 'Renderer/Effects/Cylinder.js';
import EffectPrim from 'Renderer/Effects/EffectPrim.js';
import AreaSpawner from 'Renderer/Effects/AreaSpawner.js';
import groundScatter from 'Renderer/Effects/GroundScatter.js';
import StrEffect from 'Renderer/Effects/StrEffect.js';
import BezierArcThrowStrEffect from 'Renderer/Effects/BezierArcThrow.js';
import RsmEffect from 'Renderer/Effects/RsmEffect.js';
import TwoDEffect from 'Renderer/Effects/TwoDEffect.js';
import ThreeDEffect from 'Renderer/Effects/ThreeDEffect.js';
import Entity from 'Renderer/Entity/Entity.js';
import EntityManager from 'Renderer/EntityManager.js';
import { screenAngle, screenSector, screenSide } from 'Renderer/Effects/ScreenDirection.js';
import shuffledGrid from 'Renderer/Effects/ShuffledGrid.js';
import spinSets, { SPIN_SLOT } from 'Renderer/Effects/SpinSets.js';
import Renderer from 'Renderer/Renderer.js';
import Altitude from 'Renderer/Map/Altitude.js';
import Sound from 'Audio/SoundManager.js';
import Preferences from 'Preferences/Map.js';
import QuadHorn from 'Renderer/Effects/QuadHorn.js';
import Trail from 'Renderer/Effects/Trail.js';
import WaterfallEffect from 'Renderer/Effects/WaterfallEffect.js';
import Session from 'Engine/SessionStorage.js';
import GraphicsSettings from 'Preferences/Graphics.js';

/**
 * @type {object} saved webgl context
 */
let _gl;

/**
 * @type {object} effect listing
 */
const _list = {};

/**
 * @type {number} used to differenciate constructors
 */
let _uniqueId = 1;

/**
 * Create a new EF_Init_Par object and attach existing call params
 */
function PrepareInit(callParams) {
	const Params = {
		effectId: -1,
		skillId: null,
		ownerAID: null,
		position: null,
		startTick: null,
		duration: null,
		persistent: false,
		repeatEnd: null,
		repeatDelay: 0,
		otherAID: null,
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
 * Spam an effect to the scene
 *
 * @param {object} effect params
 */
function spamSTR(Params) {
	let filename;
	const texturePath = Params.effect.texturePath || '';

	// Get STR file
	const minimal = !!(Preferences.mineffect && Params.effect.min);
	if (minimal) {
		filename = Params.effect.min;
	} else {
		filename = Params.effect.file;
	}

	// Randomize STR file name, the same pick for every candidate
	let pick = name => name;
	if (Params.effect.rand) {
		const n = Math.round(Params.effect.rand[0] + (Params.effect.rand[1] - Params.effect.rand[0]) * Math.random());
		pick = name => name.replace('%d', n);
	}
	filename = pick(filename);

	// Where the client keeps the same art under another folder. A fallback's
	// textures sit beside it, so its texture path is its own folder.
	const fallbacks = (Params.effect.fallback || []).map(file => ({
		filename: 'data/texture/effect/' + pick(file) + '.str',
		texturePath: file.substring(0, file.lastIndexOf('/') + 1)
	}));
	if (minimal) {
		// No minimal version: the full one is better than nothing.
		fallbacks.unshift({ filename: 'data/texture/effect/' + pick(Params.effect.file) + '.str', texturePath });
	}

	// Thrown from the owner onto the position (Thundering Orb's orb)
	const str = Params.effect.arcThrow
		? new BezierArcThrowStrEffect(
				'data/texture/effect/' + filename + '.str',
				Params.Inst.position,
				Params.Inst.startTick,
				texturePath,
				fallbacks,
				Params.Init.ownerEntity
			)
		: new StrEffect(
				'data/texture/effect/' + filename + '.str',
				Params.Inst.position,
				Params.Inst.startTick,
				texturePath,
				fallbacks
			);

	// A row from the client's EZ2 table carries its PosX/PosY: placed as the
	// client places those effects (StrEffect.layout).
	if (Params.effect.xOffset !== undefined || Params.effect.yOffset !== undefined) {
		str.ez2Offset = [Params.effect.xOffset || 0, Params.effect.yOffset || 0];
	}

	// A copy the client turns on screen (degrees clockwise, StrEffect.layout).
	// A row's turnOffset adds to it: art drawn pointing the other way.
	if (Params.Init.screenTurn !== undefined || Params.effect.turnOffset) {
		const turn = (Params.Init.screenTurn || 0) + (Params.effect.turnOffset || 0);
		if (turn % 360) {
			str.screenTurn = turn;
		}
	}

	// A copy the client mirrors (before the turn) or tilts back (after it)
	if (Params.Init.flipX) {
		str.flipX = true;
	}
	if (Params.Init.flipY) {
		str.flipY = true;
	}
	if (Params.effect.tilt) {
		str.tilt = Params.effect.tilt;
	}

	// A copy the client draws larger or smaller (StrEffect.layout)
	const scale = Params.Init.scale || Params.effect.scale;
	if (scale > 0 && scale !== 1) {
		str.scale = scale;
	}

	// Start effect
	EffectManager.add(str, Params);
}

/**
 * Spam an effect to the scene
 *
 * @param {object} effect prams
 */
function spamSprite(Params) {
	let entity = Params.Init.ownerEntity;
	let isNewEntity = false;

	if (!entity) {
		entity = new Entity();
		entity.GID = Params.Init.ownerAID;
		entity.position = Params.Inst.position;
		entity.objecttype = entity.constructor.TYPE_EFFECT;
		isNewEntity = true;
	} else if (!Params.effect.attachedEntity) {
		entity = new Entity();
		entity.GID = -1;
		entity.position = Params.Inst.position;
		entity.objecttype = entity.constructor.TYPE_EFFECT;
		isNewEntity = true;
	}

	// Sprite effect
	// Use Params.Inst.effectID as uid (for hat effects this is the hatEffectID)
	// Fall back to Params.effect.effectID for other cases.
	// Append duplicateID to make each duplicate instance independent.
	const baseUid = Params.Inst.effectID || Params.effect.effectID;
	const uid = Params.Inst.duplicateID > 0 ? `${baseUid}_${Params.Inst.duplicateID}` : baseUid;

	entity.attachments.add({
		uid: uid,
		file: Params.effect.file,
		head: !!Params.effect.head,
		direction: !!Params.effect.direction,
		repeat: Params.effect.repeat || Params.Inst.persistent,
		duration: Params.effect.duration,
		stackable: !!Params.effect.stackable,
		stopAtEnd: Params.effect.stopAtEnd,
		xOffset: Params.effect.xOffset,
		yOffset: Params.effect.yOffset,
		frame: Params.effect.frame,
		delay: Params.effect.delayFrame,
		renderBefore: !!Params.effect.renderBeforeEntities
	});

	if (isNewEntity) {
		EntityManager.add(entity);
	}
}

// TODO: Move these somewhere else, maybe a DB file
/** for the EffectManager.spamSkillZone */
const targetableUnits = [SU.UNT_ICEWALL, SU.UNT_REVERBERATION];

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
 * A cast loop stops when its cast ends, wherever its own animation is.
 *
 * @param {object} effect
 * @param {number} tick
 */
function stopEndedCastLoop(effect, tick) {
	const Params = effect._Params;
	if (Params && Params.effect && Params.effect.castLoop && Params.Inst.endTick > 0 && tick >= Params.Inst.endTick) {
		effect.needCleanUp = true;
	}
}

/**
 * Repeat an existing effect if needed
 *
 * @param {object} effect
 */
function repeatEffect(effect) {
	const Params = effect._Params;
	let restartTick = false,
		RepeatParams,
		EF_Inst_Par;

	if (!Params || !Params.Inst) {
		return 0;
	}

	if ((Params.Inst.persistent || Params.Inst.repeatEnd) && !effect._AlreadyRepeated) {
		if (
			Params.Inst.duration &&
			Params.Inst.duration > 0 &&
			Renderer.tick > Params.Inst.endTick + Params.Inst.repeatDelay
		) {
			// Has predefined duration and time to repeat (negative delay)

			if (!Params.Inst.repeatEnd || Params.Inst.repeatEnd > Params.Inst.endTick + Params.Inst.repeatDelay) {
				// Repeat period not ended
				restartTick = Params.Inst.endTick + Params.Inst.repeatDelay; // Reference original timing to avoid timing going crazy
			}
		} else if (effect.needCleanUp) {
			// Finished rendering and need to set a repeat (0 or positive delay)

			if (!Params.Inst.repeatEnd || Params.Inst.repeatEnd > Renderer.tick + Params.Inst.repeatDelay) {
				// Repeat period not ended
				restartTick = Renderer.tick + Params.Inst.repeatDelay;
			}
		}

		if (restartTick) {
			// Re-spam effect if needed to repeat
			EF_Inst_Par = {
				effectID: Params.Inst.effectID,
				duplicateID: Params.Inst.duplicateID,
				startTick: restartTick,
				noDelay: true // Offsets and delays are no longer used
			};

			RepeatParams = {
				effect: Params.effect,
				Inst: EF_Inst_Par,
				Init: Params.Init
			};

			EffectManager.spamEffect(RepeatParams);
			effect._AlreadyRepeated = true;
			return 1;
		}
	}

	return 0;
}

function clean(name, AID, effectID) {
	const effectIdList = Array.isArray(effectID) ? effectID : [effectID];
	let i, count;

	const list = _list[name];
	count = list.length;

	for (i = 0; i < count; ++i) {
		if (
			(!AID || list[i]._Params.Init.ownerAID === AID) &&
			(!effectID || effectIdList.includes(list[i]._Params.Inst.effectID))
		) {
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

function cleanRepeat(name, AID, effectID) {
	const effectIdList = Array.isArray(effectID) ? effectID : [effectID];
	const list = _list[name];

	list.forEach(item => {
		if ((!AID || item._Params.Init.ownerAID === AID) && (!effectID || effectIdList.includes(item.effectID))) {
			if (item._Params.Inst.persistent) {
				item._Params.Inst.persistent = false;
			}

			if (item._Params.Inst.repeatEnd) {
				item._Params.Inst.repeatEnd = false;
			}
		}
	});
}

/**
 * @type {object} Effects namespace
 */
class EffectManager {
	/**
	 * Initialize effects manager
	 */
	static init(gl) {
		_gl = gl;

		if (Configs.get('development')) {
			Commands.add(
				'd_effectmanager',
				'Print EffectManager list to console.',
				function () {
					EffectManager.debug();
				},
				['d_em'],
				true
			);
		} else {
			if (Commands.isEnabled('d_effectmanager')) {
				Commands.remove('d_effectmanager');
			}
		}
	}

	/**
	 * Add effect to the render list
	 *
	 * @param {function} effect renderer function
	 * @param {object} effect parameter object
	 */
	static add(effect, Params) {
		const name = effect.constructor.name || effect.constructor._uid || (effect.constructor._uid = _uniqueId++);

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
	}

	/**
	 * Destroy all effects
	 */
	static free(gl) {
		const keys = Object.keys(_list);

		keys.forEach(key => {
			const list = _list[key];
			const constructor = list[0].constructor;

			list.forEach(item => {
				if (item.free) {
					item.free(gl);
				}
			});

			if (constructor.free) {
				constructor.free(gl);
			}

			delete _list[key];
		});
	}

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
	static render(gl, modelView, projection, fog, tick, renderBeforeEntities) {
		const keys = Object.keys(_list);
		const count = keys.length;
		let i, j, size, list, constructor;

		// Calculate culling bounds
		// Simple distance check from player
		let center = [0, 0, 0];
		if (Session.Entity && Session.Entity.position) {
			center = Session.Entity.position;
		}
		const area_size = GraphicsSettings.performanceMode ? GraphicsSettings.viewArea : 20;
		const cullDistanceSq = area_size * area_size;

		for (i = 0; i < count; ++i) {
			list = _list[keys[i]];

			if (!list.length) {
				delete _list[keys[i]];
				continue;
			}

			constructor = list[0].constructor;

			// Initialize constructor if needed
			if (!constructor.ready && constructor.needInit) {
				constructor.init(gl);
				constructor.needInit = false;
			}

			if (constructor.ready) {
				constructor.beforeRender(gl, modelView, projection, fog, tick, null);

				for (j = 0, size = list.length; j < size; ++j) {
					// Filter per-instance ordering against the pass flag
					if (!!list[j].renderBeforeEntities !== renderBeforeEntities) {
						continue;
					}

					const effect = list[j];
					const pos = effect._Params && effect._Params.Inst ? effect._Params.Inst.position : null;
					stopEndedCastLoop(effect, tick);

					// Culling: If effect has position, check distance
					// Some effects might track an entity, updating their position is usually done in render()
					// so we might need to run a lightweight update if we cull rendering.
					// However, most RO effects are static or simple.
					// Effects with a position can be distance-culled. Effects without one
					// (e.g. standalone viewer effects) have no cullable position and must
					// always render.
					let culled = false;
					if (pos) {
						const distSq =
							(pos[0] - center[0]) * (pos[0] - center[0]) + (pos[1] - center[1]) * (pos[1] - center[1]);
						if (distSq > cullDistanceSq) {
							// Cull this effect (don't render), but we must check lifecycle
							// Check if effect is finished

							// Simulate tick for removal
							let shouldRemove = effect.needCleanUp;
							if (
								effect._Params.Inst.duration > 0 &&
								effect._Params.Inst.endTick > 0 &&
								tick > effect._Params.Inst.endTick
							) {
								shouldRemove = true;
							}

							if (shouldRemove) {
								effect.needCleanUp = true;
								culled = true;
							} else {
								// Check for repeat logic even if culled
								size += repeatEffect(effect);
								continue; // Skip rendering
							}
						}
					}

					if (!culled && !effect.needCleanUp) {
						if (!effect.ready && effect.needInit) {
							effect.init(gl);
							effect.needInit = false;
						}

						if (effect.ready) {
							effect.render(gl, tick);
						} else if (effect.endTick > 0 && tick > effect.endTick) {
							// Never became ready (its texture is missing): expire it anyway
							effect.needCleanUp = true;
						}
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
	}

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
	static spam(EF_Init_Par) {
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

		const effects = EffectDB[EF_Init_Par.effectId];
		let EF_Inst_Par;
		let Params;
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
					effectID: EF_Init_Par.effectId,
					duplicateID: j,
					startTick: EF_Init_Par.startTick + effects[i].timeBetweenDupli * j
				};

				Params = {
					effect: effects[i],
					Inst: EF_Inst_Par,
					Init: EF_Init_Par
				};

				EffectManager.spamEffect(Params);
			}
		}
	}

	/**
	 * Spam an effect
	 *
	 * @param {object} effect params
	 */
	static spamEffect(Params) {
		let filename;

		Params.Inst.position = Params.Init.position;
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
				Params.Inst.otherPosition = [
					Params.Inst.position[0] - 5,
					Params.Inst.position[1] + 5,
					Params.Inst.position[2]
				];
			}
		}

		// Copy instead of get reference
		Params.Inst.position = Params.effect.attachedEntity
			? Params.Inst.position
			: [Params.Inst.position[0], Params.Inst.position[1], Params.Inst.position[2]];

		// Some world-placed copies land at a random spot around the position (official units).
		if (Params.effect.groundScatter && !Params.effect.attachedEntity) {
			const [dx, dy] = groundScatter(Params.effect.groundScatter);
			Params.Inst.position[0] += dx;
			Params.Inst.position[1] += dy;
		}

		// Repeat
		Params.Inst.persistent = Params.Init.persistent || false;

		if (typeof Params.effect.repeat !== 'undefined' && Params.effect.repeat !== null) {
			Params.Inst.persistent = Params.effect.repeat; // Effect conf overrides. We can selecively enable/disable repeat on parts using this.
		}

		Params.Inst.repeatEnd = Params.Init.repeatEnd ? Params.Init.repeatEnd : Params.effect.repeatEnd || 0; // Main has priority
		Params.Inst.repeatDelay = Params.effect.repeatDelay ? Params.effect.repeatDelay : Params.Init.repeatDelay; // Instance has priority

		// Play sound. A cast loop plays it once, not on every replay.
		if (Params.effect.wav && !(Params.Inst.noDelay && Params.effect.castLoop)) {
			filename = Params.effect.wav;

			if (Params.effect.rand) {
				filename = filename.replace(
					'%d',
					Math.round(Params.effect.rand[0] + (Params.effect.rand[1] - Params.effect.rand[0]) * Math.random())
				);
			}

			Events.setTimeout(
				function () {
					//calculate the sound volume from distance
					Sound.playPosition(filename + '.wav', Params.Inst.position);
				},
				Params.Inst.startTick + (!isNaN(Params.effect.delayWav) ? Params.effect.delayWav : 0) - Renderer.tick
			);
		}

		Params.Inst.direction =
			Params.effect.attachedEntity && Params.Init.ownerEntity ? Params.Init.ownerEntity.direction : 0;

		//Set delays
		// duration may be worked out per instance (an arrow's flight from its distance, say)
		Params.Inst.duration =
			typeof Params.effect.duration === 'function'
				? Params.effect.duration(Params)
				: !isNaN(Params.effect.duration)
					? Params.effect.duration
					: Params.Init.duration;

		Params.Inst.delayOffsetDelta = !isNaN(Params.effect.delayOffsetDelta)
			? Params.effect.delayOffsetDelta * Params.Inst.duplicateID
			: 0;
		Params.Inst.delayLateDelta = !isNaN(Params.effect.delayLateDelta)
			? Params.effect.delayLateDelta * Params.Inst.duplicateID
			: 0;

		Params.Inst.delayOffset = !isNaN(Params.effect.delayOffset)
			? Params.effect.delayOffset + Params.Inst.delayOffsetDelta
			: 0;
		Params.Inst.delayLate = !isNaN(Params.effect.delayLate)
			? Params.effect.delayLate + Params.Inst.delayLateDelta
			: 0;

		//Start and End
		// delayStart may be worked out per cast (from the caster's motion, say)
		const delayStart =
			typeof Params.effect.delayStart === 'function'
				? Params.effect.delayStart(Params)
				: Params.effect.delayStart;
		Params.Inst.startTick =
			Params.Inst.startTick +
			(Params.Inst.noDelay ? Params.Inst.delayOffset + Params.Inst.delayLate : delayStart || 0);
		Params.Inst.endTick =
			Params.Inst.duration > 0
				? Params.Inst.startTick + (Params.Inst.noDelay ? Params.Inst.delayOffset : 0) + Params.Inst.duration
				: -1;

		// Cast effects marked castLoop replay until the cast ends and stop there,
		// like the official client's cast effects. Without a cast time they play once.
		if (Params.effect.castLoop && Params.Init.castEndTick > 0) {
			Params.Inst.repeatEnd = Params.Init.castEndTick;
			Params.Inst.endTick = Params.Init.castEndTick;
		}

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

			case 'PRIM':
				EffectManager.add(new EffectPrim(Params.effect, Params.Inst, Params.Init), Params);
				break;

			case 'AREA_SPAWN':
				EffectManager.add(
					new AreaSpawner(
						Params.effect,
						Params.Inst,
						Params.Init,
						(effectId, position, startTick, scale) =>
							EffectManager.spam(
								Object.assign(
									{ effectId, position, startTick, otherAID: Params.Init.otherAID },
									scale && { scale }
								)
							),
						(x, y) => Altitude.getCellHeight(x, y)
					),
					Params
				);
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

			case 'WATERFALL':
				EffectManager.add(new WaterfallEffect(Params.effect, Params.Inst, Params.Init), Params);
				break;

			case 'QuadHorn':
				EffectManager.add(new QuadHorn(Params.effect, Params.Inst, Params.Init), Params);
				break;

			case 'TRAIL':
				EffectManager.add(new Trail(Params.effect, Params.Inst, Params.Init), Params);
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
	}

	/**
	 * Spam effect on ground
	 *
	 * @param {number} unit id
	 * @param {number} position x
	 * @param {number} position y
	 * @param {number} skill unique id
	 * @param {number} creator id
	 * @param {number} [level] skill level, when the packet has it
	 * @param {number} [range] skill unit range, when the packet has it
	 */
	static spamSkillZone(unit_id, xPos, yPos, uid, creatorUid, level, range) {
		// No effect mode (/effect)
		if (!Preferences.effect) {
			return;
		}

		if (!(unit_id in SkillUnit)) {
			return;
		}

		// A unit can play several effects (an official unit's start and loop rows)
		let effectIds = [SkillUnit[unit_id]].flat().filter(effectId => effectId in EffectDB);

		// Without the client's EZ2 table, the unit's older effect, played once
		let persistent = true;
		if (!effectIds.length && unit_id in SkillUnitFallback) {
			effectIds = SkillUnitFallback[unit_id].filter(effectId => effectId in EffectDB);
			persistent = false;
		}

		if (!effectIds.length) {
			return;
		}

		// Remove old version if present (effect & entity)
		EffectManager.remove(null, uid);

		// New Entity
		const entity = new Entity();
		entity.GID = uid;
		entity.position = [xPos, yPos, Altitude.getCellHeight(xPos, yPos)];
		entity.hideShadow = true;
		entity.objecttype = traps.includes(unit_id)
			? entity.constructor.TYPE_TRAP
			: targetableUnits.includes(unit_id)
				? entity.constructor.TYPE_UNIT
				: entity.constructor.TYPE_EFFECT;
		entity.creatorGID = creatorUid;
		entity.skillUnitId = unit_id;

		EntityManager.add(entity);

		// Effects
		effectIds.forEach(effectId => {
			const EF_Init_Par = {
				effectId: effectId,
				ownerAID: uid,
				position: [xPos, yPos, Altitude.getCellHeight(xPos, yPos)],
				startTick: Renderer.tick,
				// A row's own `repeat` wins over this (spamEffect). EZ2 rows set it from
				// IsInfinite, so a unit's start rows play once and only its loops repeat.
				persistent: persistent,
				duration: -1, // Infinite by default but the effect param can have a duration that overrides this
				otherAID: creatorUid,
				skillLevel: level,
				unitRange: range
			};

			EffectManager.spam(EF_Init_Par);
		});
	}

	/**
	 * Play a skill unit's end effects where it stood, when it goes
	 *
	 * @param {number} uid skill unique id
	 */
	static spamSkillZoneEnd(uid) {
		if (!Preferences.effect) {
			return;
		}

		const entity = EntityManager.get(uid);
		if (!entity || !(entity.skillUnitId in SkillUnitEnd)) {
			return;
		}

		const position = [entity.position[0], entity.position[1], entity.position[2]];
		SkillUnitEnd[entity.skillUnitId].forEach(effectId => EffectManager.spam({ effectId, position }));
	}

	/**
	 * Spam a skill on a target
	 *
	 * @param {number} skill id
	 * @param {number} target aid
	 * @param {Array} position
	 * @param {number} tick
	 * @param {number} srcAID caster aid
	 * @param {number} [level] skill level from the ground packet
	 */
	static spamSkill(skillId, destAID, position, tick, srcAID, level) {
		let effects, EF_Init_Par;
		if (!(skillId in SkillEffect)) {
			return;
		}

		if (SkillEffect[skillId].effectId) {
			if (typeof SkillEffect[skillId].effectId === 'function') effects = SkillEffect[skillId].effectId(srcAID);
			else effects = SkillEffect[skillId].effectId;
			effects = Array.isArray(effects) ? effects : [effects];

			effects.forEach(effectId => {
				EF_Init_Par = {
					effectId: effectId,
					ownerAID: destAID,
					position: position,
					startTick: tick,
					otherAID: srcAID
				};

				EffectManager.spam(EF_Init_Par);
			});
		}

		// One file at the cell, picked by skill level (index level - 1; a level
		// past the end plays the last). Only from the ground packet, which
		// carries the cell and the level. Typhoon Wing's size.
		const groundByLevel = SkillEffect[skillId].groundEffectIdByLevel;
		if (groundByLevel && groundByLevel.length && position && level > 0) {
			const effectId = groundByLevel[Math.min(level, groundByLevel.length) - 1];
			if (effectId) {
				EffectManager.spam({
					effectId: effectId,
					ownerAID: destAID,
					position: position,
					startTick: tick,
					otherAID: srcAID,
					skillLevel: level
				});
			}
		}

		if (SkillEffect[skillId].effectIdOnCaster && srcAID) {
			effects = Array.isArray(SkillEffect[skillId].effectIdOnCaster)
				? SkillEffect[skillId].effectIdOnCaster
				: [SkillEffect[skillId].effectIdOnCaster];

			effects.forEach(effectId => {
				EF_Init_Par = {
					effectId: effectId,
					ownerAID: srcAID,
					position: position,
					startTick: tick,
					otherAID: destAID
				};

				EffectManager.spam(EF_Init_Par);
			});
		}
	}

	/**
	 * Spam skill effect on success
	 *
	 * @param {number} skill id
	 * @param {number} target aid
	 * @param {number} tick
	 * @param {number} srcAID caster aid
	 * @param {number} [level] skill level from the packet
	 */
	static spamSkillSuccess(skillId, destAID, tick, srcAID, level) {
		let effects, EF_Init_Par;
		if (!(skillId in SkillEffect)) {
			return;
		}

		if (SkillEffect[skillId].successEffectId) {
			effects = Array.isArray(SkillEffect[skillId].successEffectId)
				? SkillEffect[skillId].successEffectId
				: [SkillEffect[skillId].successEffectId];

			effects.forEach(effectId => {
				EF_Init_Par = {
					effectId: effectId,
					ownerAID: destAID,
					startTick: tick,
					otherAID: srcAID
				};

				EffectManager.spam(EF_Init_Par);
			});
		}

		// One file on the caster, picked by skill level (index level - 1; a
		// level past the end plays the last). Grenade Fragment's element.
		const byLevel = SkillEffect[skillId].successEffectIdOnCasterByLevel;
		if (byLevel && byLevel.length && level > 0) {
			const effectId = byLevel[Math.min(level, byLevel.length) - 1];
			if (effectId) {
				EffectManager.spam({
					effectId: effectId,
					ownerAID: srcAID,
					startTick: tick,
					otherAID: destAID,
					skillLevel: level
				});
			}
		}

		// The same pick on the target, following it. Thundering Call's size.
		const byLevelOnTarget = SkillEffect[skillId].successEffectIdOnTargetByLevel;
		if (byLevelOnTarget && byLevelOnTarget.length && level > 0 && destAID) {
			const effectId = byLevelOnTarget[Math.min(level, byLevelOnTarget.length) - 1];
			if (effectId) {
				EffectManager.spam({
					effectId: effectId,
					ownerAID: destAID,
					startTick: tick,
					otherAID: srcAID,
					skillLevel: level
				});
			}
		}

		if (SkillEffect[skillId].successEffectIdOnCaster) {
			effects = Array.isArray(SkillEffect[skillId].successEffectIdOnCaster)
				? SkillEffect[skillId].successEffectIdOnCaster
				: [SkillEffect[skillId].successEffectIdOnCaster];

			effects.forEach(effectId => {
				EF_Init_Par = {
					effectId: effectId,
					ownerAID: srcAID,
					startTick: tick,
					otherAID: destAID
				};

				EffectManager.spam(EF_Init_Par);
			});
		}

		// One of 12 files on the caster, picked by which way the target lies on screen
		// (ScreenDirection.screenSector). Chul Ho Sonic Claw's waves.
		const byDirection = SkillEffect[skillId].successEffectIdOnCasterByScreenDirection;
		if (byDirection && srcAID && destAID) {
			const srcEntity = EntityManager.get(srcAID);
			const destEntity = EntityManager.get(destAID);
			if (srcEntity && destEntity) {
				const angle = screenAngle(srcEntity.position, destEntity.position);
				const effectId = byDirection[screenSector(angle)];
				if (effectId) {
					EffectManager.spam({
						effectId: effectId,
						ownerAID: srcAID,
						startTick: tick,
						otherAID: destAID
					});
				}
			}
		}

		// One effect on the caster, turned on screen toward the target once, at
		// the start (screenTurn = ScreenDirection.screenAngle). Needs a target.
		// Quill Spear.
		const aimed = SkillEffect[skillId].successEffectIdOnCasterAimed;
		if (aimed && srcAID && destAID) {
			const srcEntity = EntityManager.get(srcAID);
			const destEntity = EntityManager.get(destAID);
			if (srcEntity && destEntity) {
				EffectManager.spam({
					effectId: aimed,
					ownerAID: srcAID,
					startTick: tick,
					otherAID: destAID,
					screenTurn: screenAngle(srcEntity.position, destEntity.position)
				});
			}
		}

		// Thrown from the caster onto the target's spot (BezierArcThrow rows).
		// Wind Bomb's tornado.
		const thrown = SkillEffect[skillId].successEffectThrowAtTarget;
		if (thrown && srcAID && destAID) {
			const destEntity = EntityManager.get(destAID);
			if (destEntity && EntityManager.get(srcAID)) {
				EffectManager.spam({
					effectId: thrown,
					ownerAID: srcAID,
					position: destEntity.position.slice(),
					startTick: tick,
					otherAID: destAID
				});
			}
		}

		// One effect where the target stands (its rows are not attached, so it stays
		// put), picked by which half of the screen the target is in, seen from the
		// caster (ScreenDirection.screenSide). Radiant Spear's leftdown/rightdown spear.
		const bySide = SkillEffect[skillId].successEffectIdOnTargetByScreenSide;
		if (bySide && srcAID && destAID) {
			const srcEntity = EntityManager.get(srcAID);
			const destEntity = EntityManager.get(destAID);
			if (srcEntity && destEntity) {
				const effectId = bySide[screenSide(screenAngle(srcEntity.position, destEntity.position))];
				if (effectId) {
					EffectManager.spam({
						effectId: effectId,
						ownerAID: destAID,
						startTick: tick,
						otherAID: srcAID
					});
				}
			}
		}

		// Copies spread over a grid around the target, one per row and column,
		// placed once on the ground and started a step apart. The grid size
		// comes from the skill level (a level past the end uses the last size).
		// An entry that is a list plays one of its files at random per spot.
		// Hell's Drive's blasts.
		const gridIds = SkillEffect[skillId].successEffectGridIds;
		const gridSizes = SkillEffect[skillId].successEffectGridSizeByLevel;
		const center = gridIds && level > 0 ? EntityManager.get(destAID) || EntityManager.get(srcAID) : null;
		if (center && gridSizes && gridSizes.length) {
			const size = gridSizes[Math.min(level, gridSizes.length) - 1];
			const step = SkillEffect[skillId].successEffectGridStep || 0;
			const start = tick || Renderer.tick;
			const [x, y, z] = center.position;
			shuffledGrid(size).forEach(([dx, dy], k) => {
				gridIds.forEach(entry => {
					// .at() rather than [i]: CodeQL takes a random index into a list for a
					// security value (js/insecure-randomness). This only picks which effect plays.
					const effectId = Array.isArray(entry) ? entry.at(Math.floor(Math.random() * entry.length)) : entry;
					EffectManager.spam({
						effectId: effectId,
						ownerAID: destAID,
						position: [x + dx, y + dy, z],
						startTick: start + step * k,
						otherAID: srcAID,
						skillLevel: level
					});
				});
			});
		}

		// Sets of copies at the target, one set per file, each copy turned on
		// screen and started in its own 32 ms slot (SpinSets.js). Placed once on
		// the ground. Kunai - Nightmare's blades.
		const spinIds = SkillEffect[skillId].successEffectSpinSets;
		const spinAt = spinIds ? EntityManager.get(destAID) || EntityManager.get(srcAID) : null;
		if (spinAt) {
			const start = tick || Renderer.tick;
			const [x, y, z] = spinAt.position;
			spinSets(spinIds.length).forEach(({ set, turn, slot }) => {
				EffectManager.spam({
					effectId: spinIds[set],
					ownerAID: destAID,
					position: [x, y, z],
					startTick: start + SPIN_SLOT * slot,
					otherAID: srcAID,
					screenTurn: turn
				});
			});
		}
	}

	/**
	 * Spam skill effects as a damage packet arrives, before the hit lands
	 * (damageEffectIdOnCaster, damageEffectIdOnTarget). Every damage packet
	 * counts, splash and misses included.
	 *
	 * @param {number} skillId skill id
	 * @param {number} destAID target aid
	 * @param {number} tick
	 * @param {number} srcAID caster aid
	 * @param {function} [random] returns a number in [0, 1)
	 * @param {number} [hitCount] the packet's hit count, handed to the effects as hitCount
	 */
	static spamSkillDamage(skillId, destAID, tick, srcAID, random = Math.random, hitCount = 1) {
		const skill = SkillEffect[skillId];
		if (!skill) {
			return;
		}

		const play = (field, ownerAID, otherAID) => {
			if (!skill[field] || !ownerAID) {
				return;
			}
			(Array.isArray(skill[field]) ? skill[field] : [skill[field]]).forEach(entry => {
				// A list plays one of its effects, picked at random (Demolition's two strikes).
				// .at() as in spamSkill: an effect id is not a security value.
				const effectId = Array.isArray(entry) ? entry.at(Math.floor(random() * entry.length)) : entry;
				EffectManager.spam({
					effectId: effectId,
					ownerAID: ownerAID,
					startTick: tick,
					otherAID: otherAID,
					// The packet's hit count: the bolts draw one bolt per hit
					hitCount: hitCount
				});
			});
		};

		play('damageEffectIdOnCaster', srcAID, destAID);
		play('damageEffectIdOnTarget', destAID, srcAID);
	}

	/**
	 * Spam the caster's motion effect as a skill damage packet arrives: 16
	 * (EF_BASH) for most skills, from the official client's table
	 * (DB/Skills/SkillMotionEffect.js). Not played again when the skill's own
	 * damageEffectIdOnCaster already lists it.
	 *
	 * @param {number} skillId skill id
	 * @param {number} srcAID caster aid
	 * @param {number} destAID target aid
	 * @param {number} tick
	 * @param {number} damageType the packet's action field
	 * @param {number} level the packet's level field
	 * @param {boolean} targetFound is the packet's target a known actor
	 */
	static spamSkillMotion(skillId, srcAID, destAID, tick, damageType, level, targetFound) {
		const effectId = motionEffectForPacket(skillId, damageType, level, targetFound);
		if (effectId === null || !srcAID) {
			return;
		}
		const own = SkillEffect[skillId] && SkillEffect[skillId].damageEffectIdOnCaster;
		if (own != null && (Array.isArray(own) ? own : [own]).includes(effectId)) {
			return;
		}
		EffectManager.spam({
			effectId: effectId,
			ownerAID: srcAID,
			startTick: tick,
			otherAID: destAID
		});
	}

	/**
	 * Spam skill effect on hit with damage
	 *
	 * @param {number} skill id
	 * @param {number} target aid
	 * @param {number} tick
	 */
	static spamSkillHit(skillId, destAID, tick, srcAID, hitIndex = 0) {
		let effects, EF_Init_Par;
		if (!(skillId in SkillEffect)) {
			return;
		}

		// Skills marked hitEffectOnce play their hit effects for the first hit
		// of a damage packet only.
		if (SkillEffect[skillId].hitEffectOnce && hitIndex > 0) {
			return;
		}

		// 0 is an effect too: the hit flash (EF_HIT1)
		if (SkillEffect[skillId].hitEffectId != null) {
			effects = Array.isArray(SkillEffect[skillId].hitEffectId)
				? SkillEffect[skillId].hitEffectId
				: [SkillEffect[skillId].hitEffectId];

			effects.forEach(effectId => {
				EF_Init_Par = {
					effectId: effectId,
					ownerAID: destAID,
					startTick: tick,
					otherAID: srcAID
				};

				EffectManager.spam(EF_Init_Par);
			});
		}

		// Only on the first hit of a damage packet: the official client sends the
		// hit-map effect with the first hit message of a multi-hit packet only
		if (hitIndex === 0 && SkillEffect[skillId].firstHitEffectId != null) {
			effects = Array.isArray(SkillEffect[skillId].firstHitEffectId)
				? SkillEffect[skillId].firstHitEffectId
				: [SkillEffect[skillId].firstHitEffectId];

			effects.forEach(effectId => {
				EffectManager.spam({
					effectId: effectId,
					ownerAID: destAID,
					startTick: tick,
					otherAID: srcAID
				});
			});
		}

		if (SkillEffect[skillId].hitEffectIdOnCaster) {
			effects = Array.isArray(SkillEffect[skillId].hitEffectIdOnCaster)
				? SkillEffect[skillId].hitEffectIdOnCaster
				: [SkillEffect[skillId].hitEffectIdOnCaster];

			effects.forEach(effectId => {
				EF_Init_Par = {
					effectId: effectId,
					ownerAID: srcAID,
					startTick: tick,
					otherAID: destAID
				};

				EffectManager.spam(EF_Init_Par);
			});
		}
	}

	/**
	 * Spam skill effect when the skill is released on its target (hit or miss)
	 *
	 * @param {number} skill id
	 * @param {number} target aid
	 * @param {number} tick
	 * @param {number} source aid
	 */
	static spamSkillRelease(skillId, destAID, tick, srcAID) {
		if (!(skillId in SkillEffect) || !SkillEffect[skillId].releaseEffectId) {
			return;
		}

		const effects = Array.isArray(SkillEffect[skillId].releaseEffectId)
			? SkillEffect[skillId].releaseEffectId
			: [SkillEffect[skillId].releaseEffectId];

		effects.forEach(effectId => {
			EffectManager.spam({
				effectId: effectId,
				ownerAID: destAID,
				startTick: tick,
				otherAID: srcAID
			});
		});
	}

	/**
	 * Spam skill before the hit lands (regardless of damage)
	 *
	 * @param {number} skill id
	 * @param {number} target aid
	 * @param {number} tick
	 */
	static spamSkillBeforeHit(skillId, destAID, tick, srcAID) {
		let effects, EF_Init_Par;
		if (!(skillId in SkillEffect)) {
			return;
		}

		if (SkillEffect[skillId].beforeHitEffectId) {
			effects = Array.isArray(SkillEffect[skillId].beforeHitEffectId)
				? SkillEffect[skillId].beforeHitEffectId
				: [SkillEffect[skillId].beforeHitEffectId];

			effects.forEach(effectId => {
				EF_Init_Par = {
					effectId: effectId,
					ownerAID: destAID,
					startTick: tick,
					otherAID: srcAID
				};

				EffectManager.spam(EF_Init_Par);
			});
		}

		if (SkillEffect[skillId].beforeHitEffectIdOnCaster) {
			effects = Array.isArray(SkillEffect[skillId].beforeHitEffectIdOnCaster)
				? SkillEffect[skillId].beforeHitEffectIdOnCaster
				: [SkillEffect[skillId].beforeHitEffectIdOnCaster];

			// var EF_Init_Par = { // Unused
			// 	effectId: effectId,
			// 	ownerAID: srcAID,
			// 	startTick: tick,
			// 	otherAID: destAID
			// };

			effects.forEach(effectId => {
				EF_Init_Par = {
					effectId: effectId,
					ownerAID: srcAID,
					startTick: tick,
					otherAID: destAID
				};

				EffectManager.spam(EF_Init_Par);
			});
		}
	}

	/**
	 * Spam skill cast effect
	 *
	 * @param {number} skill id
	 * @param {number} target aid
	 * @param {number} tick
	 * @param {number} source aid
	 * @param {number} cast time in ms, used by effect rows marked castLoop
	 */
	static spamSkillCast(skillId, destAID, tick, srcAID, castTime) {
		let effects, EF_Init_Par;
		if (!(skillId in SkillEffect)) {
			return;
		}

		const startTick = tick || Renderer.tick;
		const castEndTick = castTime > 0 ? startTick + castTime : 0;

		if (SkillEffect[skillId].beginCastEffectId) {
			effects = Array.isArray(SkillEffect[skillId].beginCastEffectId)
				? SkillEffect[skillId].beginCastEffectId
				: [SkillEffect[skillId].beginCastEffectId];

			effects.forEach(effectId => {
				EF_Init_Par = {
					effectId: effectId,
					ownerAID: destAID,
					startTick: tick,
					otherAID: srcAID,
					castEndTick: castEndTick
				};

				EffectManager.spam(EF_Init_Par);
			});
		}
	}

	/**
	 * Remove the cast effects (rows marked castLoop) still playing on an entity,
	 * when its cast is cancelled.
	 *
	 * @param {number} aid
	 */
	static removeCastLoops(AID) {
		Object.keys(_list).forEach(name => {
			const list = _list[name];
			for (let i = list.length - 1; i >= 0; --i) {
				const Params = list[i]._Params;
				if (Params && Params.effect && Params.effect.castLoop && Params.Init.ownerAID === AID) {
					if (list[i].free) {
						list[i].free(_gl);
					}
					list.splice(i, 1);
				}
			}
			if (!list.length) {
				delete _list[name];
			}
		});
	}

	/**
	 * Spam a item on a target
	 *
	 * @param {number} item id
	 * @param {number} target aid
	 * @param {Array} position
	 * @param {number} tick
	 */
	static spamItem(itemId, destAID, position, tick, srcAID) {
		let effects, EF_Init_Par;
		if (!(itemId in ItemEffect)) {
			return;
		}

		if (ItemEffect[itemId].effectId) {
			effects = Array.isArray(ItemEffect[itemId].effectId)
				? ItemEffect[itemId].effectId
				: [ItemEffect[itemId].effectId];

			effects.forEach(effectId => {
				EF_Init_Par = {
					effectId: effectId,
					ownerAID: destAID,
					position: position,
					startTick: tick,
					otherAID: srcAID
				};

				EffectManager.spam(EF_Init_Par);
			});
		}

		if (ItemEffect[itemId].effectIdOnCaster && srcAID) {
			effects = Array.isArray(ItemEffect[itemId].effectIdOnCaster)
				? ItemEffect[itemId].effectIdOnCaster
				: [ItemEffect[itemId].effectIdOnCaster];

			effects.forEach(effectId => {
				EF_Init_Par = {
					effectId: effectId,
					ownerAID: srcAID,
					position: position,
					startTick: tick,
					otherAID: destAID
				};

				EffectManager.spam(EF_Init_Par);
			});
		}
	}

	/**
	 * Spawn a hat effect attached to an entity
	 */
	static spamHatEffect(Params) {
		if (!Params || !Preferences.effect) {
			return;
		}

		const init = Params.Init || {};
		const ownerAID = init.ownerAID;
		const ownerEntity = init.ownerEntity || EntityManager.get(ownerAID);
		if (!ownerEntity) {
			return;
		}

		const eff = Params.effect || {};
		if (!ownerEntity._hatEffects) {
			ownerEntity._hatEffects = {};
		}

		const resource = (eff.file || eff.resourceFileName || '').toString();

		// EffectTable fallback
		if (!resource && eff.hatEffectID != null) {
			const startTick = init.startTick || Renderer.tick;
			const hatEffectID = eff.hatEffectID;

			if (hatEffectID in EffectDB) {
				const effectEntries = EffectDB[hatEffectID];
				effectEntries.forEach((effectEntry, i) => {
					const EF_Inst_Par = {
						effectID: hatEffectID,
						duplicateID: i,
						startTick: startTick + (effectEntry.timeBetweenDupli || 200) * i
					};

					EffectManager.spamEffect({
						effect: effectEntry,
						Inst: EF_Inst_Par,
						Init: {
							effectId: hatEffectID,
							position: ownerEntity.position,
							ownerEntity: ownerEntity,
							startTick: startTick,
							duration: effectEntry.duration || 0,
							persistent: true,
							repeatEnd: 0,
							repeatDelay: effectEntry.repeatDelay || 0,
							renderBeforeEntities: true
						}
					});
				});
			}

			if (eff.effectID != null) {
				ownerEntity._hatEffects[eff.effectID] = { type: 'effect', effectTableId: eff.hatEffectID };
			}
			return;
		}

		// STR attachment
		if (/\.str$/i.test(resource)) {
			const uid = 'hat-str-' + ownerAID + '-' + (eff.effectID || Date.now());
			const strPath = 'data/texture/effect/' + resource.replace(/\\/g, '/');

			ownerEntity.attachments.add({
				uid: uid,
				strFile: strPath,
				head: eff.isAttachedHead || eff.head || false,
				repeat: true,
				xOffset: eff.xOffset || eff.hatEffectPosX || 0,
				yOffset: eff.yOffset || eff.hatEffectPos || 0,
				renderBefore: !!eff.isRenderBeforeCharacter
			});

			if (eff.effectID != null) {
				ownerEntity._hatEffects[eff.effectID] = { type: 'str', uid: uid };
			}
		}
	}

	/**
	 * Remove a hat effect from an entity
	 */
	static removeHatEffect(ownerAID, effectID) {
		if (ownerAID == null || effectID == null) {
			return;
		}
		const entity = EntityManager.get(ownerAID);
		if (!entity) {
			return;
		}

		const attachments = entity.attachments;
		const hatEffects = entity._hatEffects;
		const info = hatEffects && hatEffects[effectID] ? hatEffects[effectID] : null;

		if (attachments && typeof attachments.remove === 'function') {
			if (info && info.uid) {
				attachments.remove(info.uid);
			} else {
				attachments.remove('hat-str-' + ownerAID + '-' + effectID);
			}

			if (info && info.type === 'effect' && info.effectTableId) {
				attachments.remove(info.effectTableId);
			}
		}

		if (hatEffects) {
			delete hatEffects[effectID];
		}
	}

	static debug() {
		console.log('%c[DEBUG] EffectManager _list: ', 'color:#F5B342', _list);
	}

	/**
	 * Whether an actor already has an effect running (or waiting to start)
	 *
	 * @param {number} AID effect owner ID
	 * @param {mixed} effectID effect ID
	 * @return {boolean}
	 */
	static has(AID, effectID) {
		return Object.keys(_list).some(name =>
			_list[name].some(
				effect =>
					effect._Params && effect._Params.Init.ownerAID === AID && effect._Params.Inst.effectID === effectID
			)
		);
	}

	/**
	 * Remove an effect
	 *
	 * @param {effect}
	 * @param {mixed} effect owner ID
	 */
	static remove(effect, AID, effectID) {
		if (!effect || !(effect.name in _list)) {
			Object.keys(_list).forEach(key => clean(key, AID, effectID));
		} else {
			clean(effect.name, AID, effectID);
		}

		// Remove entity effects
		if (!(AID == null)) {
			const entity = EntityManager.get(AID);
			if (entity) {
				if (entity.objecttype === entity.constructor.TYPE_EFFECT) {
					EntityManager.remove(AID); // Whole entity is an effect, just remove it
				} else if (!(effectID == null)) {
					entity.attachments.remove(effectID); // Only remove attached effect

					// Cleanup hat effects tracking if present
					if (entity._hatEffects && entity._hatEffects[effectID]) {
						delete entity._hatEffects[effectID];
					}
				}
			}
		}
	}
	/**
	 * Stops an effect's repeat
	 *
	 * @param {effect}
	 * @param {mixed} effect owner ID
	 * @param {mixed} effect ID
	 */
	static endRepeat(effect, AID, effectID) {
		if (!effect || !(effect.name in _list)) {
			Object.keys(_list).forEach(key => cleanRepeat(key, AID, effectID));
			return;
		}

		cleanRepeat(effect.name, AID, effectID);
	}
}

/**
 * Export
 */
export default EffectManager;
