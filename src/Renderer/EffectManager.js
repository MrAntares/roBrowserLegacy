/**
 * Renderer/EffectManager.js
 *
 * Effects Manager
 *
 * @author Vincent Thibault
 */
define(function( require )
{
	'use strict';


	/**
	 * Load dependencies
	 */
	var EffectDB      = require('DB/Effects/EffectTable');
	var SkillEffect   = require('DB/Skills/SkillEffect');
	var SkillUnit     = require('DB/Skills/SkillUnit');
	var ItemEffect    = require('DB/Items/ItemEffect');
	var Events        = require('Core/Events');
	var Cylinder      = require('Renderer/Effects/Cylinder');
	var StrEffect     = require('Renderer/Effects/StrEffect');
	var TwoDEffect    = require('Renderer/Effects/TwoDEffect');
	var ThreeDEffect  = require('Renderer/Effects/ThreeDEffect');
	var Entity        = require('Renderer/Entity/Entity');
	var EntityManager = require('Renderer/EntityManager');
	var Renderer      = require('Renderer/Renderer');
	var Altitude      = require('Renderer/Map/Altitude');
	var Sound         = require('Audio/SoundManager');
	var Session 	  = require('Engine/SessionStorage');
	var Preferences   = require('Preferences/Map');
	var glMatrix 	  = require('Utils/gl-matrix');


	/**
	 * @var {object} saved webgl context
	 */
	var _gl;


	/**
	 * @var {object} effect listing
	 */
	var _list = {};


	/**
	 * @var {object} Effects namespace
	 */
	var EffectManager = {};


	/**
	 * @var {number} used to differenciate constructors
	 */
	var _uniqueId = 1;


	/**
	 * Initialize effects manager
	 */
	EffectManager.init = function init(gl)
	{
		_gl = gl;
	};


	/**
	 * Add effect to the render list
	 *
	 * @param {function} effect
	 * @param {mixed} effect owner ID
	 * @param {boolean} persistent
	 */
	EffectManager.add = function add(effect, EF_Init_Par)
	{
		var name = (effect.constructor.name || effect.constructor._uid || (effect.constructor._uid = (_uniqueId++)));

		if (!(name in _list)) {
			_list[name] = [];

			if (effect.constructor.init) {
				effect.constructor.init(_gl);
			}

			if (!effect.constructor.renderBeforeEntities) {
				effect.constructor.renderBeforeEntities = false;
			}
		}

		if (effect.init) {
			effect.init(_gl);
		}

		effect._AID        = EF_Init_Par.ownerAID;
		effect._persistent = EF_Init_Par.persistent;
		effect._repeatEnd = EF_Init_Par.repeatEnd;

		_list[name].push(effect);
	};


	/**
	 * Remove an effect
	 *
	 * @param {effect}
	 * @param {mixed} effect owner ID
	 */
	EffectManager.remove = function removeClosure()
	{
		function clean(name, AID, effectID) {
			var list;
			var i, count;
			var effectIdList = Array.isArray(effectID) ? effectID : [effectID];
			

			list  = _list[name];
			count = list.length;

			for (i = 0; i < count; ++i) {
				if ( ( AID && list[i]._AID === AID ) || ( effectID && effectIdList.includes(list[i].effectID) )) {
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

		return function remove(effect, AID, effectID)
		{
			if (!effect || !(effect.name in _list)) {
				var i, count;
				var keys = Object.keys(_list);

				for (i = 0, count = keys.length; i < count; ++i) {
					clean( keys[i], AID, effectID);
				}

				return;
			} else {
				clean( effect.name, AID, effectID);
			}
		};
	}();


	/**
	 * Destroy all effects
	 */
	EffectManager.free = function free( gl )
	{
		var keys = Object.keys(_list);
		var i, j, size, count;
		var list, constructor;

		for (i = 0, count = keys.length; i < count; ++i) {
			list        = _list[ keys[i] ];
			constructor = list[0].constructor;

			for (j = 0, size = list.length; j < size; ++j) {
				if (list[j].free) {
					list[j].free(gl);
				}
			}

			if (constructor.free) {
				constructor.free(gl);
			}

			delete _list[ keys[i] ];
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
	EffectManager.render = function render(gl, modelView, projection, fog, tick, renderBeforeEntities )
	{
		var keys = Object.keys(_list);
		var i, count = keys.length;
		var j, size;
		var list, constructor;

		for (i = 0; i < count; ++i) {
			list        = _list[ keys[i] ];

			if (!list.length) {
				delete _list[ keys[i] ];
				continue;
			}

			constructor = list[0].constructor;

			// Will be render after/before.
			if (constructor.renderBeforeEntities !== renderBeforeEntities) {
				continue;
			}

			if (constructor.ready) {
				constructor.beforeRender(gl, modelView, projection, fog, tick);

				for (j = 0, size = list.length; j < size; ++j) {
					if (list[j].ready) {
						list[j].render(gl, tick);
					}

					if (list[j].needCleanUp) {
						if (list[j]._persistent || (list[j]._repeatEnd) > tick) {
							if(list[j].endTick){
								list[j].endTick = tick + (list[j].endTick - list[j].startTick);
							}
							list[j].startTick   = tick;
							list[j].needCleanUp = false;
							continue;
						}

						if (list[j].free) {
							list[j].free(gl);
						}
						list.splice( j, 1);
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
	EffectManager.spam = function spam( EF_Init_Par )
	{
		// Empty call
		if(!EF_Init_Par){
			return;
		}
		
		// No effect mode (/effect)
		if (!Preferences.effect) {
			return;
		}

		// Prepare params
		EF_Init_Par.effectId       = EF_Init_Par.effectId;
		EF_Init_Par.skillId        = EF_Init_Par.skillId        || null;
		EF_Init_Par.ownerAID       = EF_Init_Par.ownerAID       || null;
		EF_Init_Par.position       = EF_Init_Par.position       || null;
		EF_Init_Par.startTick      = EF_Init_Par.startTick      || Renderer.tick;
		EF_Init_Par.persistent     = EF_Init_Par.persistent     || false;
		EF_Init_Par.repeatEnd      = EF_Init_Par.repeatEnd      || null;
		EF_Init_Par.otherAID       = EF_Init_Par.otherAID       || null;
		EF_Init_Par.otherPosition  = EF_Init_Par.otherPosition  || null;
		
		EF_Init_Par.ownerEntity    = EntityManager.get(EF_Init_Par.ownerAID);
		EF_Init_Par.otherEntity    = EntityManager.get(EF_Init_Par.otherAID);

		// Not found
		if (!(EF_Init_Par.effectId in EffectDB)) {
			return;
		}

		var effects = EffectDB[EF_Init_Par.effectId];
		var i, j, count;
		
		for (i = 0, count = effects.length; i < count; ++i) {
			
            if (effects[i].duplicate == -1) { effects[i].duplicate = 999; }
            else { effects[i].duplicate = effects[i].duplicate ? Math.min(effects[i].duplicate, 999) : 1; } 
			
            effects[i].timeBetweenDupli = !isNaN(effects[i].timeBetweenDupli) ? effects[i].timeBetweenDupli : 200;
			
            for (j = 0; j < effects[i].duplicate; ++j) {
				var EF_Inst_Par = {
					effectID: EF_Init_Par.effectId,
					duplicateID: j,
					startTick: EF_Init_Par.startTick + (effects[i].timeBetweenDupli * j)
				}
				
				EffectManager.spamEffect(effects[i], EF_Inst_Par, EF_Init_Par);
			}
        }
	};


	/**
	 * Spam en effect
	 *
	 * @param {object} effect
	 * @param {object} Effect instance parameters
	 * @param {object} Effect initial parameters
	 */
	EffectManager.spamEffect = function spamEffect( effect, EF_Inst_Par, EF_Init_Par)
	{
		var filename;
		
		EF_Inst_Par.position = EF_Init_Par.position;
		EF_Inst_Par.otherPosition = EF_Init_Par.otherPosition;

		if (!EF_Inst_Par.position) {
			if (!EF_Init_Par.ownerEntity) {
				return;
			}
			EF_Inst_Par.position = EF_Init_Par.ownerEntity.position;
		}
		
		if (!EF_Inst_Par.otherPosition) {
			if (EF_Init_Par.otherEntity) {
				EF_Inst_Par.otherPosition = EF_Init_Par.otherEntity.position;
			} else {
				EF_Inst_Par.otherPosition = [EF_Inst_Par.position[0] - 5
											,EF_Inst_Par.position[1] + 5
											,EF_Inst_Par.position[2]];
			}
			
		}

		// Copy instead of get reference
		EF_Inst_Par.position   = effect.attachedEntity ? EF_Inst_Par.position : [ EF_Inst_Par.position[0], EF_Inst_Par.position[1], EF_Inst_Par.position[2] ];
		EF_Inst_Par.persistent = EF_Inst_Par.persistent || effect.repeat || false;

		// Play sound
		if (effect.wav) {
			filename = effect.wav;
		
			if (effect.rand) {
				filename = filename.replace('%d', Math.round(effect.rand[0] + (effect.rand[1]-effect.rand[0]) * Math.random()));
			}

			Events.setTimeout(function(){
				//calculate the sound volume from distance
				var dist = Math.floor(glMatrix.vec2.dist(EF_Inst_Par.position, Session.Entity.position));
				Sound.play(filename + '.wav', Math.max(((1-Math.abs((dist - 1) * (1 - 0.01) / (25 - 1) + 0.01))), 0.1 ));
			}, EF_Inst_Par.startTick + (!isNaN(effect.delayWav) ? effect.delayWav : 0) - Renderer.tick);
		}
		
		EF_Inst_Par.direction = (effect.attachedEntity && EF_Init_Par.ownerEntity) ? EF_Init_Par.ownerEntity.direction : 0;
		
		//Set delays
		EF_Inst_Par.duration = !isNaN(effect.duration) ? effect.duration : 1000; // used to be delay !isNaN(effect.delay) ? effect.delay : 1000;
		
		EF_Inst_Par.delayOffsetDelta = !isNaN(effect.delayOffsetDelta) ? effect.delayOffsetDelta * EF_Inst_Par.duplicateID : 0;
		EF_Inst_Par.delayLateDelta = !isNaN(effect.delayLateDelta) ? effect.delayLateDelta * EF_Inst_Par.duplicateID : 0;
		
		EF_Inst_Par.delayOffset = !isNaN(effect.delayOffset) ? effect.delayOffset + EF_Inst_Par.delayOffsetDelta : 0;
		EF_Inst_Par.delayLate = !isNaN(effect.delayLate) ? effect.delayLate + EF_Inst_Par.delayLateDelta : 0;
		
		//Start and End
		EF_Inst_Par.startTick = EF_Inst_Par.startTick + EF_Inst_Par.delayOffset + EF_Inst_Par.delayLate;
		EF_Inst_Par.endTick = EF_Inst_Par.startTick + EF_Inst_Par.delayOffset + EF_Inst_Par.duration;
		
		switch (effect.type) {
			case 'SPR':
				spamSprite( effect, EF_Inst_Par, EF_Init_Par );
				break;

			case 'STR':
				spamSTR( effect, EF_Inst_Par, EF_Init_Par );
				break;

			case 'CYLINDER':
				EffectManager.add(new Cylinder(effect, EF_Inst_Par, EF_Init_Par), EF_Init_Par);
				break;
				
			case '2D':
				EffectManager.add(new TwoDEffect(effect, EF_Inst_Par, EF_Init_Par), EF_Init_Par);
				break;
			
			case '3D':
				EffectManager.add(new ThreeDEffect(effect, EF_Inst_Par, EF_Init_Par), EF_Init_Par);
				break;
				
			case 'RSM':
				break;
			
			case 'FUNC':
				if (effect.func) {
					if (effect.attachedEntity) {
						if (EF_Init_Par.ownerEntity) {
							effect.func.call(this, EF_Inst_Par, EF_Init_Par);
						}
					}
					else {
						effect.func.call(this, EF_Inst_Par, EF_Init_Par);
					}
				}
				break;
		}
	};


	/**
	 * Spam an effect to the scene
	 *
	 * @param {object} effect
	 * @param {object} Effect instance parameters
	 * @param {object} Effect initial parameters
	 */
	function spamSTR( effect, EF_Inst_Par, EF_Init_Par)
	{
		var filename;

		// Get STR file
		if (Preferences.mineffect && effect.min) {
			filename = effect.min;
		}
		else {
			filename = effect.file;
		}

		// Randomize STR file name
		if (effect.rand) {
			filename = filename.replace('%d', Math.round(effect.rand[0] + (effect.rand[1]-effect.rand[0]) * Math.random()) );
		}

		// Start effect
		EffectManager.add(new StrEffect('data/texture/effect/' + filename + '.str', EF_Inst_Par.position, EF_Inst_Par.startTick), EF_Init_Par);
	}


	/**
	 * Spam an effect to the scene
	 *
	 * @param {object} effect
	 * @param {object} Effect instance parameters
	 * @param {object} Effect initial parameters
	 */
	function spamSprite( effect, EF_Inst_Par, EF_Init_Par)
	{
		var entity = EF_Init_Par.ownerEntity;
		var isNewEntity = false;

		if (!entity) {
			entity            = new Entity();
			entity.GID        = EF_Init_Par.ownerAID;
			entity.position   = EF_Inst_Par.position;
			entity.objecttype = entity.constructor.TYPE_EFFECT;
			isNewEntity = true;
		} else if (!effect.attachedEntity) {
			entity            = new Entity();
			entity.GID        = -1;
			entity.position   = EF_Inst_Par.position;
			entity.objecttype = entity.constructor.TYPE_EFFECT;
			isNewEntity = true;
		}


		// Sprite effect
		entity.attachments.add({
			uid:			effect.effectID,
			file:			effect.file,
			head:			!!effect.head,
			direction:		!!effect.direction,
			repeat:			effect.repeat || EF_Inst_Par.persistent,
			duplicate:		effect.duplicate,
			stopAtEnd:		effect.stopAtEnd,
			xOffset:		effect.xOffset,
			yOffset:		effect.yOffset,
			frame:			effect.frame,
			delay:			effect.delayFrame
		});
		
		if(isNewEntity){
			EntityManager.add(entity);
		}
	}


	/**
	 * Spam effect on ground
	 *
	 * @param {number} unit id
	 * @param {number} position x
	 * @param {number} position y
	 * @param {number} skill unique id
	 */
	EffectManager.spamSkillZone = function spamUnit( unit_id, xPos, yPos, uid, creatorUid )
	{
		var skillId, effectId;
		var skill;
		
		// No effect mode (/effect)
		if (!Preferences.effect) {
			return;
		}

		if (!(unit_id in SkillUnit)) {
			return;
		}

		skillId = SkillUnit[unit_id];

		if(!SkillEffect[skillId]){
			return;
		}

		skill = SkillEffect[skillId];

		if (!skill.groundEffectId) {
			return;
		}

		effectId = skill.groundEffectId;

		if (!(effectId in EffectDB)) {
			return;
		}
		
		EffectManager.remove(null, uid);
		
		var EF_Init_Par = {
			effectId: effectId,
			ownerAID: uid,
			position: [ xPos, yPos, Altitude.getCellHeight( xPos, yPos) ],
			startTick: Renderer.tick,
			persistent: true,
			otherAID: creatorUid
		};
		
		EffectManager.spam( EF_Init_Par );
	};


	/**
	 * Spam a skill on a target
	 *
	 * @param {number} skill id
	 * @param {number} target aid
	 * @param {Array} position
	 * @param {number} tick
	 */
	EffectManager.spamSkill = function spamSkill( skillId, destAID, position, tick, srcAID)
	{

		if(!SkillEffect[skillId]){
			return;
		}
		
		if(SkillEffect[skillId].effectId){
			var effects = Array.isArray(SkillEffect[skillId].effectId) ? SkillEffect[skillId].effectId : [SkillEffect[skillId].effectId];
			
			effects.forEach(effectId => {
				var EF_Init_Par = {
					effectId: effectId,
					ownerAID: destAID,
					position: position,
					startTick: tick,
					otherAID: srcAID
				};
				
				EffectManager.spam( EF_Init_Par );
			});
		}
		
		if (SkillEffect[skillId].effectIdOnCaster && srcAID) {
			var effects = Array.isArray(SkillEffect[skillId].effectIdOnCaster) ? SkillEffect[skillId].effectIdOnCaster : [SkillEffect[skillId].effectIdOnCaster];
			
			effects.forEach(effectId => {
				var EF_Init_Par = {
					effectId: effectId,
					ownerAID: srcAID,
					position: position,
					startTick: tick,
					otherAID: destAID
				};
				
				EffectManager.spam( EF_Init_Par );
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
	EffectManager.spamSkillSuccess = function spamSkillSuccess( skillId, destAID, tick, srcAID)
	{
		if(!SkillEffect[skillId]){
			return;
		}

		if (SkillEffect[skillId].successEffectId) {
			var effects = Array.isArray(SkillEffect[skillId].successEffectId) ? SkillEffect[skillId].successEffectId : [SkillEffect[skillId].successEffectId];
			
			effects.forEach(effectId => {
				var EF_Init_Par = {
					effectId: effectId,
					ownerAID: destAID,
					startTick: tick,
					otherAID: srcAID
				};
				
				EffectManager.spam( EF_Init_Par );
			});
		}
		
		if (SkillEffect[skillId].successEffectIdOnCaster) {
			var effects = Array.isArray(SkillEffect[skillId].successEffectIdOnCaster) ? SkillEffect[skillId].successEffectIdOnCaster : [SkillEffect[skillId].successEffectIdOnCaster];
			
			effects.forEach(effectId => {
				var EF_Init_Par = {
					effectId: effectId,
					ownerAID: srcAID,
					startTick: tick,
					otherAID: destAID
				};
				
				EffectManager.spam( EF_Init_Par );
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
	EffectManager.spamSkillHit = function spamSkillHit( skillId, destAID, tick, srcAID)
	{
		if(!SkillEffect[skillId]){
			return;
		}

		if (SkillEffect[skillId].hitEffectId) {
			var effects = Array.isArray(SkillEffect[skillId].hitEffectId) ? SkillEffect[skillId].hitEffectId : [SkillEffect[skillId].hitEffectId];
			
			effects.forEach(effectId => {
				var EF_Init_Par = {
					effectId: effectId,
					ownerAID: destAID,
					startTick: tick,
					otherAID: srcAID
				};
				
				EffectManager.spam( EF_Init_Par );
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
	EffectManager.spamSkillBeforeHit = function spamSkillBeforeHit( skillId, destAID, tick, srcAID)
	{
		if(!SkillEffect[skillId]){
			return;
		}

		if (SkillEffect[skillId].beforeHitEffectId) {
			var effects = Array.isArray(SkillEffect[skillId].beforeHitEffectId) ? SkillEffect[skillId].beforeHitEffectId : [SkillEffect[skillId].beforeHitEffectId];
			
			effects.forEach(effectId => {
				var EF_Init_Par = {
					effectId: effectId,
					ownerAID: destAID,
					startTick: tick,
					otherAID: srcAID
				};
				
				EffectManager.spam( EF_Init_Par );
			});
		}
		
		if (SkillEffect[skillId].beforeHitEffectIdOnCaster) {
			var effects = Array.isArray(SkillEffect[skillId].beforeHitEffectIdOnCaster) ? SkillEffect[skillId].beforeHitEffectIdOnCaster : [SkillEffect[skillId].beforeHitEffectIdOnCaster];
			
			var EF_Init_Par = {
				effectId: effectId,
				ownerAID: srcAID,
				startTick: tick,
				otherAID: destAID
			};
			
			effects.forEach(effectId => {
				var EF_Init_Par = {
					effectId: effectId,
					ownerAID: srcAID,
					startTick: tick,
					otherAID: destAID
				};
				
				EffectManager.spam( EF_Init_Par );
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
	EffectManager.spamItem = function spamItem( itemId, destAID, position, tick, srcAID)
	{
		if (!(itemId in ItemEffect)) {
			return;
		}
		
		if(ItemEffect[itemId].effectId){
			var effects = Array.isArray(ItemEffect[itemId].effectId) ? ItemEffect[itemId].effectId : [ItemEffect[itemId].effectId];
			
			effects.forEach(effectId => {
				var EF_Init_Par = {
					effectId: effectId,
					ownerAID: destAID,
					position: position,
					startTick: tick,
					otherAID: srcAID
				};
				
				EffectManager.spam( EF_Init_Par );
			});
		}
		
		if (ItemEffect[itemId].effectIdOnCaster && srcAID) {
			var effects = Array.isArray(ItemEffect[itemId].effectIdOnCaster) ? ItemEffect[itemId].effectIdOnCaster : [ItemEffect[itemId].effectIdOnCaster];
			
			effects.forEach(effectId => {
				var EF_Init_Par = {
					effectId: effectId,
					ownerAID: srcAID,
					position: position,
					startTick: tick,
					otherAID: destAID
				};
				
				EffectManager.spam( EF_Init_Par );
			});
		}
	};

	/**
	 * Export
	 */
	return EffectManager;
});
