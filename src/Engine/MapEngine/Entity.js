/**
 * Engine/MapEngine/Entity.js
 *
 * Manage Entity based on received packets from server
 *
 * @author Vincent Thibault
 */

define(function( require )
{
	'use strict';


	/**
	 * Load dependencies
	 */
	var DB                = require('DB/DBManager');
	var SkillId           = require('DB/Skills/SkillConst');
	var SkillInfo         = require('DB/Skills/SkillInfo');
	var StatusConst       = require('DB/Status/StatusConst');
	var StatusState       = require('DB/Status/StatusState');
	var Emotions          = require('DB/Emotions');
	var SkillEffect       = require('DB/Skills/SkillEffect');
	var SkillActionTable  = require('DB/Skills/SkillAction');
	var EffectConst       = require('DB/Effects/EffectConst');
	var PetMessageConst   = require('DB/Pets/PetMessageConst');
	var Sound             = require('Audio/SoundManager');
	var Events            = require('Core/Events');
	var Guild             = require('Engine/MapEngine/Guild');
	var Session           = require('Engine/SessionStorage');
	var Network           = require('Network/NetworkManager');
	var PACKETVER	      = require('Network/PacketVerManager');
	var PACKET            = require('Network/PacketStructure');
	var Altitude          = require('Renderer/Map/Altitude');
	var Renderer          = require('Renderer/Renderer');
	var EntityManager     = require('Renderer/EntityManager');
	var Entity            = require('Renderer/Entity/Entity');
	var EffectManager     = require('Renderer/EffectManager');
	var Damage            = require('Renderer/Effects/Damage');
	var MagicTarget       = require('Renderer/Effects/MagicTarget');
	var LockOnTarget      = require('Renderer/Effects/LockOnTarget');
	var MagicRing         = require('Renderer/Effects/MagicRing');

	var UIVersionManager      = require('UI/UIVersionManager');

	var BasicInfo;
	if (UIVersionManager.getBasicInfoVersion() === 0) {
		BasicInfo = require('UI/Components/BasicInfoV0/BasicInfoV0');
	} else if (UIVersionManager.getBasicInfoVersion() === 3) {
		BasicInfo = require('UI/Components/BasicInfoV3/BasicInfoV3');
	} else if (UIVersionManager.getBasicInfoVersion() === 4) {
		BasicInfo = require('UI/Components/BasicInfoV4/BasicInfoV4');
	} else {
		BasicInfo = require('UI/Components/BasicInfo/BasicInfo');
	}
	var SkillList;
	if (UIVersionManager.getSkillListVersion() === 0) {
		SkillList = require('UI/Components/SkillListV0/SkillListV0');
	} else {
		SkillList = require('UI/Components/SkillList/SkillList');
	}

	var ChatBox           = require('UI/Components/ChatBox/ChatBox');
	var ChatRoom          = require('UI/Components/ChatRoom/ChatRoom');
	var Escape            = require('UI/Components/Escape/Escape');
	var HomunInformations = require('UI/Components/HomunInformations/HomunInformations');
	var Inventory         = require('UI/Components/Inventory/Inventory');
	var MiniMap;
	if(PACKETVER.value >= 20180124) {
		MiniMap          = require('UI/Components/MiniMapV2/MiniMapV2');
	} else {
		MiniMap          = require('UI/Components/MiniMap/MiniMap');
	}
	var ShortCut          = require('UI/Components/ShortCut/ShortCut');
	var StatusIcons       = require('UI/Components/StatusIcons/StatusIcons');

	// Excludes for skill name display
	var SkillNameDisplayExclude = [
				//Hiding skills
				SkillId.TF_HIDING,
				SkillId.AS_CLOAKING,
				SkillId.RG_CHASEWALK,
				SkillId.GC_CLOAKINGEXCEED,
				SkillId.RA_CAMOUFLAGE,
				SkillId.NC_STEALTHFIELD,
				SkillId.SC_SHADOWFORM,
				SkillId.SC_INVISIBILITY,
				SkillId.KO_YAMIKUMO,

				//3rd job extra skills
				SkillId.LG_OVERBRAND_BRANDISH,
				SkillId.LG_OVERBRAND_PLUSATK,
				SkillId.WM_REVERBERATION_MELEE,
				SkillId.WM_REVERBERATION_MAGIC,
				SkillId.WL_TETRAVORTEX_FIRE,
				SkillId.WL_TETRAVORTEX_WATER,
				SkillId.WL_TETRAVORTEX_WIND,
				SkillId.WL_TETRAVORTEX_GROUND,
				SkillId.WL_SUMMON_ATK_FIRE,
				SkillId.WL_SUMMON_ATK_WIND,
				SkillId.WL_SUMMON_ATK_WATER,
				SkillId.WL_SUMMON_ATK_GROUND
			];

	// Skills that display blue crit like combo damage
	var SkillBlueCombo = [
				SkillId.TK_STORMKICK,
				SkillId.TK_DOWNKICK,
				SkillId.TK_TURNKICK,
				SkillId.TK_COUNTER,
				SkillId.TK_JUMPKICK,
				SkillId.SR_RAMPAGEBLASTER,
			];

	const C_MULTIHIT_DELAY = 200; // PLUSATTACKED_MOTIONTIME

	/**
	 * Spam an entity on the map
	 * Generic packet handler
	 */
	function onEntitySpam( pkt )
	{
		var entity = EntityManager.get(pkt.GID);

		if (entity) {
			entity.set(pkt);
		}
		else {
			entity = new Entity();
			entity.set(pkt);
			if(pkt.job == 45){
				var EF_Init_Par = {
					ownerAID: entity.GID,
					position: entity.position
				};

				if(PACKETVER.value < 20030715){
					EF_Init_Par.effectId = EffectConst.EF_WARPZONE;
					EffectManager.spam( EF_Init_Par );
				} else {
					EF_Init_Par.effectId = EffectConst.EF_WARPZONE2;
					EffectManager.spam( EF_Init_Par );
				}
			}
			EntityManager.add(entity);
		}

		if(entity.objecttype === Entity.TYPE_PC &&
			!(entity._effectState & StatusState.EffectState.INVISIBLE) &&
			(pkt instanceof PACKET.ZC.NOTIFY_STANDENTRY || pkt instanceof PACKET.ZC.NOTIFY_STANDENTRY2 || pkt instanceof PACKET.ZC.NOTIFY_STANDENTRY3
			|| pkt instanceof PACKET.ZC.NOTIFY_STANDENTRY4 || pkt instanceof PACKET.ZC.NOTIFY_STANDENTRY5 || pkt instanceof PACKET.ZC.NOTIFY_STANDENTRY6
			|| pkt instanceof PACKET.ZC.NOTIFY_STANDENTRY7 || pkt instanceof PACKET.ZC.NOTIFY_STANDENTRY8 || pkt instanceof PACKET.ZC.NOTIFY_STANDENTRY9)
		){
			var EF_Init_Par = {
				ownerAID: entity.GID,
				position: entity.position
			};

			if(PACKETVER.value < 20030715){
				EF_Init_Par.effectId = EffectConst.EF_ENTRY;
				EffectManager.spam( EF_Init_Par );
			} else {
				EF_Init_Par.effectId = EffectConst.EF_ENTRY2;
				EffectManager.spam( EF_Init_Par );
			}
		}

		if(entity.objecttype === Entity.TYPE_HOM && pkt.GID === Session.homunId){
			HomunInformations.startAI();
		}

		// load others aura
		entity.aura.load( EffectManager );
	}


	/**
	 * Remove an entity from the map
	 *
	 * @param {object} pkt - PACKET.ZC.NOTIFY_VANISH
	 */
	function onEntityVanish( pkt )
	{
		var entity = EntityManager.get(pkt.GID);
		if (entity) {

			if (entity.objecttype === Entity.TYPE_PC && pkt.GID === Session.Entity.GID) {  //death animation only for myself
				var EF_Init_Par = {
					effectId: EffectConst.EF_DEVIL,
					ownerAID: entity.GID
				};

				EffectManager.spam( EF_Init_Par );
			}

			if(entity.objecttype === Entity.TYPE_HOM && pkt.GID === Session.homunId){
				HomunInformations.stopAI();
			}

			EffectManager.remove( null, pkt.GID,[ EffectConst.EF_CHOOKGI, EffectConst.EF_CHOOKGI2, EffectConst.EF_CHOOKGI3, EffectConst.EF_CHOOKGI_N ]); // Spirit spheres
			EffectManager.remove( null, pkt.GID,[ EffectConst.EF_CHOOKGI_FIRE, EffectConst.EF_CHOOKGI_WIND, EffectConst.EF_CHOOKGI_WATER, EffectConst.EF_CHOOKGI_GROUND, 'temporary_warlock_sphere' ]); // Elemental spheres (Warlock)

			switch( pkt.type ) {
				case Entity.VT.EXIT:
				case Entity.VT.TELEPORT:
					if( !(entity._effectState & StatusState.EffectState.INVISIBLE) ){

						var EF_Init_Par = { position: entity.position };

						if(PACKETVER.value < 20030715){
							EF_Init_Par.effectId = EffectConst.EF_TELEPORTATION;
						} else {
							EF_Init_Par.effectId = EffectConst.EF_TELEPORTATION2;
						}
						EffectManager.spam( EF_Init_Par );
					}

				case Entity.VT.OUTOFSIGHT:
					EffectManager.remove( null, pkt.GID, null);

				case Entity.VT.DEAD:
					// remove aura on non-PC death
					if (entity.objecttype !== Entity.TYPE_PC) {
						entity.aura.remove( EffectManager );
					}
			}

			entity.remove( pkt.type );
		}

		// Show escape menu
		if (pkt.GID === Session.Entity.GID && pkt.type === 1) {
			Escape.ui.show();
			Escape.ui.find('.savepoint').show();
			if(haveSiegfriedItem()){
				Escape.ui.find('.resurection').show();
			}
			Escape.ui.find('.graphics, .sound, .hotkey').hide();
		}
	}


	/**
	 * An entity start walking
	 *
	 * @param {object} pkt - PACKET.ZC.NOTIFY_MOVE
	 */
	function onEntityMove( pkt )
	{
		var entity = EntityManager.get(pkt.GID);
		if (entity) {
			//entity.position[0] = pkt.MoveData[0];
			//entity.position[1] = pkt.MoveData[1];
			//entity.position[2] = Altitude.getCellHeight(  pkt.MoveData[0],  pkt.MoveData[1] );
			entity.walkTo( pkt.MoveData[0], pkt.MoveData[1], pkt.MoveData[2], pkt.MoveData[3] );
		}
	}


	/**
	 * Entity stop walking
	 *
	 * @param {object} pkt - PACKET.ZC.STOPMOVE
	 */
	function onEntityStopMove( pkt )
	{
		var entity = EntityManager.get(pkt.AID);
		if (entity) {
			entity.position[0] = pkt.xPos;
			entity.position[1] = pkt.yPos;
			entity.position[2] = Altitude.getCellHeight( pkt.xPos,  pkt.yPos );

			entity.walk.index = entity.walk.total;

			if (entity.action === entity.ACTION.WALK) {
				entity.setAction({
					action: entity.ACTION.IDLE,
					frame:  0,
					repeat: true,
					play:   true
				});
			}
		}
	}


	/**
	 * Move entity to a point
	 *
	 * @param {object} pkt - PACKET_ZC_HIGHJUMP
	 */
	function onEntityJump( pkt )
	{
		var entity = EntityManager.get(pkt.AID);
		if (entity) {
			entity.position[0] = pkt.xPos;
			entity.position[1] = pkt.yPos;
			entity.position[2] = Altitude.getCellHeight( pkt.xPos,  pkt.yPos );
		}
	}


	/**
	 * Body relocation packet support
	 *
	 * @param {object} pkt - PACKET.ZC.FASTMOVE
	 */
	function onEntityFastMove( pkt )
	{
		var entity = EntityManager.get(pkt.AID);
		if (entity) {
			entity.walkTo( entity.position[0], entity.position[1], pkt.targetXpos, pkt.targetYpos );

			if (entity.walk.path.length) {
				var speed = entity.walk.speed;
				entity.walk.speed = 10;
				entity.walk.onEnd = function onWalkEnd(){
					entity.walk.speed = speed;
				};
			}
		}
	}


	/**
	 * Display entity's emotion
	 *
	 * @param {object} pkt - PACKET.ZC.EMOTION
	 */
	function onEntityEmotion( pkt )
	{
		var entity = EntityManager.get(pkt.GID);
		if (entity && (pkt.type in Emotions.indexes)) {
			entity.attachments.add({
				frame: Emotions.indexes[pkt.type],
				file:  'emotion',
				play:   true,
				head:   true,
				depth:  5.0
			});
		}
	}


	/**
	 * Resurect an entity
	 *
	 * @param {object} pkt - PACKET_ZC_RESURRECTION
	 */
	function onEntityResurect( pkt )
	{
		var entity = EntityManager.get(pkt.AID);

		if (!entity) {
			return;
		}

		// There is always a packet to use the skill "Resurection"
		// on yourself after, but what if this packet isn't here ?
		// The entity will stay die ? So update the action just in case
		entity.setAction({
			action: entity.ACTION.IDLE,
			frame:  0,
			repeat: true,
			play:   true
		});

		// If it's our main character update Escape ui
		if (entity === Session.Entity) {
			Escape.ui.hide();
			Escape.ui.find('.resurection, .savepoint').hide();
			Escape.ui.find('.graphics, .sound, .hotkey').show();
		}
	}


	/**
	 * Perform Entity Action
	 *
	 * @param {object} pkt - PACKET.ZC.NOTIFY_ACT
	 */
	function onEntityAction( pkt )
	{
		var srcEntity = EntityManager.get(pkt.GID);
		// Entity out of the screen ?
		if (!srcEntity) {
			return;
		}
		var dstEntity = EntityManager.get(pkt.targetGID);
		var target;
		var srcWeapon = srcEntity.weapon ? srcEntity.weapon : 0;
		var srcWeaponLeft = srcEntity.shield ? srcEntity.shield : 0;


		srcEntity.targetGID = pkt.targetGID;

		switch (pkt.action) {

			// Damage
			case 0:  // regular [DMG_NORMAL]
			//case 1: // [DMG_PICKUP_ITEM]
			//case 2: // [DMG_SIT_DOWN]
			//case 3: // [DMG_STAND_UP]
			case 4:  // absorbed [DMG_ENDURE]
			//case 5: [DMG_SPLASH]
			//case 5: [DMG_SKILL]
			//case 7: [DMG_REPEAT]
			//case 11: [DMG_TOUCH] probably something new.
			case 8:  // double attack [DMG_MULTI_HIT]
			case 9:  // endure [DMG_MULTI_HIT_ENDURE]
			case 10: // critital [DMG_CRITICAL]
			case 11: // lucky
			case 13: // multi-hit critical
				var WSnd = DB.getWeaponSound(srcWeapon);
				var weaponSound = WSnd ? WSnd[0] : false;
				var weaponSoundRelease = WSnd ? WSnd[1] : false;

				var WSndL = DB.getWeaponSound(srcWeaponLeft);
				var weaponSoundLeft = WSndL ? WSndL[0] : false;
				var weaponSoundReleaseLeft = WSndL ? WSndL[1] : false;

				// Display throw arrow effect when using bows, not an elegant conditional but it works.. [Waken]
				if (weaponSound && weaponSound.includes('bow')) {
					var EF_Init_Par = {
						effectId: 'ef_arrow_projectile',
						ownerAID: dstEntity.GID,
						otherAID: srcEntity.GID,
						otherPosition: srcEntity.position
					};

					EffectManager.spam( EF_Init_Par );
				}

				//attack sound
				if(weaponSound){
					Events.setTimeout(function(){
						Sound.play(weaponSound);
						}, 0 );
				}
				//attack release sound for bow and dagger
				if(weaponSoundRelease){
					Events.setTimeout(function(){
						Sound.play(weaponSoundRelease);
						}, pkt.attackMT * 0.25 );
				}

				//second hit (double attack)
				if(pkt.count == 2){
					if(weaponSound){
						Events.setTimeout(function(){
							Sound.play(weaponSound);
							}, C_MULTIHIT_DELAY );
					}
					if(weaponSoundRelease){
						Events.setTimeout(function(){
							Sound.play(weaponSoundRelease);
							}, (pkt.attackMT * 0.25) + C_MULTIHIT_DELAY );
					}
				}
				//left hand
				if(pkt.leftDamage){
					if(weaponSoundLeft){
						Events.setTimeout(function(){
							Sound.play(weaponSoundLeft);
							}, C_MULTIHIT_DELAY * 1.75 );
					}
					if(weaponSoundReleaseLeft){
						Events.setTimeout(function(){
							Sound.play(weaponSoundRelease);
							}, (pkt.attackMT * 0.25) + (C_MULTIHIT_DELAY * 1.75) );
					}
				}


				if (dstEntity) {
					// only if damage and do not have endure
					// and damage isn't absorbed (healing)

					// Will be hit actions
					onEntityWillBeHitSub( pkt, dstEntity );

					// damage blocking status effect display
					if(pkt.action == 0 && pkt.damage == 0 && pkt.leftDamage == 0){

					}

					target = pkt.damage ? dstEntity : srcEntity;

					// damage or miss display
					if (target) {
						if(dstEntity.objecttype === Entity.TYPE_MOB){
							if(pkt.damage > 0){
								var EF_Init_Par = {
									effectId: EffectConst.EF_HIT1,
									ownerAID: pkt.targetGID,
									startTick: Renderer.tick + pkt.attackMT,
								};
								EffectManager.spam(EF_Init_Par);
							}
						}

						var type = null;
						switch (pkt.action) {

							// Single damage
							case 10: // critical
								type = Damage.TYPE.CRIT;
							case 0: // regular damage
							case 4: // regular damage (endure)
								Damage.add( pkt.damage, target, Renderer.tick + pkt.attackMT, srcWeapon, type );
								if(pkt.leftDamage){
									Damage.add( pkt.leftDamage, target, Renderer.tick + pkt.attackMT + (C_MULTIHIT_DELAY*1.75), srcWeaponLeft, type );
								}
								break;

							// Combo
							case 13: //multi-hit critical
								type = Damage.TYPE.CRIT;
							case 8: // multi-hit damage
							case 9: // multi-hit damage (endure)

								// Display combo only if entity is mob and the attack don't miss
								if ( dstEntity.objecttype === Entity.TYPE_MOB && pkt.damage > 0 ) {
									if( pkt.damage > 1 ){ // Can't divide 1 damage
										Damage.add(	pkt.damage / 2, dstEntity, Renderer.tick + pkt.attackMT, srcWeapon,	Damage.TYPE.COMBO );
									}
									if(pkt.leftDamage){
										Damage.add(	pkt.damage, dstEntity, Renderer.tick + pkt.attackMT + (C_MULTIHIT_DELAY/2), srcWeapon, Damage.TYPE.COMBO );
										Damage.add(	pkt.damage + pkt.leftDamage, dstEntity, Renderer.tick + pkt.attackMT + (C_MULTIHIT_DELAY*1.75),	srcWeaponLeft, Damage.TYPE.COMBO | Damage.TYPE.COMBO_FINAL );
									} else {
										Damage.add( pkt.damage, dstEntity, Renderer.tick + pkt.attackMT + C_MULTIHIT_DELAY,	srcWeapon, Damage.TYPE.COMBO | Damage.TYPE.COMBO_FINAL );
									}
								}

								var div = 1;
								if( pkt.damage > 1 ){ // Can't divide 1 damage
									div = 2;
									Damage.add(	pkt.damage / div, target, Renderer.tick + pkt.attackMT, srcWeapon, type );
								}
								if(pkt.leftDamage){
									Damage.add(	pkt.damage / div, target, Renderer.tick + pkt.attackMT + (C_MULTIHIT_DELAY/2), srcWeapon, type );
									Damage.add( pkt.leftDamage, target, Renderer.tick + pkt.attackMT + (C_MULTIHIT_DELAY*1.75), srcWeaponLeft, type );
								} else {
									Damage.add(	pkt.damage / div, target, Renderer.tick + pkt.attackMT + C_MULTIHIT_DELAY, srcWeapon, type );
								}
								break;

							// TODO: lucky miss
							case 11:
								dstEntity.attachments.add({
									frame: 3,
									file:  'msg',
									uid:    'lucky',
									play:   true,
									head:   true,
									repeat: false,
								});
								break;

						}
					}

					// Update entity position
					srcEntity.lookTo( dstEntity.position[0], dstEntity.position[1] );
				}

				srcEntity.attack_speed = pkt.attackMT;


				if(pkt.leftDamage){
					srcEntity.setAction({
						action: srcEntity.ACTION.ATTACK3,
						frame:  0,
						repeat: false,
						play:   true,
						next: {
							delay:  Renderer.tick + pkt.attackMT,
							action: srcEntity.ACTION.READYFIGHT,
							frame:  0,
							repeat: true,
							play:   true,
							next:  false
						}
					});
				} else {
					srcEntity.setAction({
						action: srcEntity.ACTION.ATTACK,
						frame:  0,
						repeat: false,
						play:   true,
						next: {
							delay:  Renderer.tick + pkt.attackMT,
							action: srcEntity.ACTION.READYFIGHT,
							frame:  0,
							repeat: true,
							play:   true,
							next:  false
						}
					});
				}

				// Talk sometime
				if(srcEntity.GID === Session.Entity.GID && (Session.pet.friendly > 900 && (Session.pet.lastTalk || 0) + 10000 < Date.now())){
					const talkRate = parseInt((Math.random() * 10));
					if(talkRate < 3){
						const hunger = DB.getPetHungryState(Session.pet.oldHungry);
						const talk = DB.getPetTalkNumber(Session.pet.job, PetMessageConst.PM_HUNTING, hunger);

						var talkPkt    = new PACKET.CZ.PET_ACT();
						talkPkt.data = talk;
						Network.sendPacket(talkPkt);
						Session.pet.lastTalk = Date.now();
					}
				}

				break;

			// Pickup item
			case 1:
				srcEntity.setAction({
					action: srcEntity.ACTION.PICKUP,
					frame:  0,
					repeat: false,
					play:   true,
					next:{
						action: srcEntity.ACTION.IDLE,
						frame:  0,
						repeat: true,
						play:   true,
						next:   false
					}
				});
				if (dstEntity) {
					srcEntity.lookTo( dstEntity.position[0], dstEntity.position[1] );
				}
				break;

			// Sit Down
			case 2:
				srcEntity.setAction({
					action: srcEntity.ACTION.SIT,
					frame:  0,
					repeat: true,
					play:   true
				});
				break;

			// Stand up
			case 3:
				srcEntity.setAction({
					action: srcEntity.ACTION.IDLE,
					frame:  0,
					repeat: true,
					play:   true
				});
				break;
		}
	}


	/**
	 * Entity say something
	 *
	 * @param {object} pkt - PACKET.ZC.NOTIFY_CHAT
	 */
	function onEntityTalk( pkt )
	{
		var entity, type;

		// Remove "pseudo : |00Dialogue
		pkt.msg = pkt.msg.replace(/\: \|\d{2}/, ': ');

		if (ChatRoom.isOpen) {
			ChatRoom.message(pkt.msg);
			return;
		}

		type = ChatBox.TYPE.PUBLIC;
		entity = EntityManager.get(pkt.GID);

		if (entity) {
			entity.dialog.set( pkt.msg );

			// Should not happen
			if (entity === Session.Entity) {
				type |= ChatBox.TYPE.SELF;
			}
			else if (entity.isAdmin) {
				type |= ChatBox.TYPE.ADMIN;
			}
		}

		ChatBox.addText( pkt.msg, type, ChatBox.FILTER.PUBLIC_CHAT );
	}


	/**
	 * Entity say something in color (channel system)
	 *
	 * @param {object} pkt - PACKET.ZC.NPC_CHAT
	 */
	function onEntityTalkColor( pkt )
	{
		var entity;
		var color = 'rgb(' + ([
			( pkt.color & 0x000000ff ),
			( pkt.color & 0x0000ff00 ) >> 8,
			( pkt.color & 0x00ff0000 ) >> 16
		]).join(',') + ')'; // bgr to rgb.

		// Remove "pseudo : |00Dialogue"
		pkt.msg = pkt.msg.replace(/\: \|\d{2}/, ': ');

		entity = EntityManager.get(pkt.accountID);
		if (entity) {
			entity.dialog.set( pkt.msg );
		}
		ChatBox.addText( pkt.msg, ChatBox.TYPE.PUBLIC, ChatBox.FILTER.PUBLIC_CHAT, color);
	}


	/**
	 * Display entity's name
	 *
	 * @param {object} pkt - PACKET.ZC.ACK_REQNAME
	 */
	function onEntityIdentity( pkt )
	{
		var entity = EntityManager.get(pkt.AID);
		if (entity) {
			if(entity.display.name){
				entity.display.fakename = pkt.CName;
			} else {
				entity.display.name = pkt.CName;
			}

			entity.display.party_name = pkt.PName || '';
			entity.display.guild_name = pkt.GName || '';
			entity.display.guild_rank = pkt.RName || '';

			entity.display.load = entity.display.TYPE.COMPLETE;

			if (entity.GUID) {
				Guild.requestGuildEmblem(entity.GUID, entity.GEmblemVer, function(image) {
					entity.display.emblem = image;
					entity.display.update(
						entity.objecttype === Entity.TYPE_MOB ? entity.display.STYLE.MOB :
						entity.objecttype === Entity.TYPE_DISGUISED ? entity.display.STYLE.MOB :
						entity.objecttype === Entity.TYPE_NPC ? entity.display.STYLE.NPC :
						entity.display.STYLE.DEFAULT
					)
				});
			}
			else {
				entity.display.emblem = null;
			}
			entity.display.update(
				entity.objecttype === Entity.TYPE_MOB ? entity.display.STYLE.MOB :
				entity.objecttype === Entity.TYPE_DISGUISED ? entity.display.STYLE.MOB :
				entity.objecttype === Entity.TYPE_NPC ? entity.display.STYLE.NPC :
				entity.display.STYLE.DEFAULT
			);

			if (EntityManager.getOverEntity() === entity) {
				entity.display.add();
			}
		}
	}


	/**
	 * Update entity's life
	 *
	 * @param {object} pkt - PACKET.ZC.NOTIFY_MONSTER_HP
	 */
	function onEntityLifeUpdate( pkt )
	{
		var entity = EntityManager.get(pkt.AID);
		if (entity) {
			entity.life.hp = pkt.hp;
			entity.life.hp_max = pkt.maxhp;
			entity.life.update();
		}
	}


	/**
	* Shows notification effect for quests and events
	*
	* @param {object} pkt - PACKET.ZC.QUEST_NOTIFY_EFFECT
	*/
	function onEntityQuestNotifyEffect( pkt ) {
		var Entity = EntityManager.get(pkt.npcID);
		var color = 0;

		if (pkt.effect !== 9999) {
		var emotionId = pkt.effect + 81;

			if (Entity && (pkt.effect in Emotions.indexes)) {
				Entity.attachments.add({
					frame: Emotions.indexes[emotionId],
					file:  'emotion',
					play:   true,
					head:   true,
					repeat: true,
					depth:  5.0
				});
			}

		}

		switch (pkt.color + 1) {
			case 1:
				// yellow
				color = 0xffff00;
				break;
			case 2:
				// orange
				color = 0xffa500;
				break;
			case 3:
				// green
				color = 0x00e16a;
				break;
			case 4:
				// purple
				color = 0x800080;
				break;
			case 0:
			default:
				return;
		}

		MiniMap.addNpcMark( pkt.npcID, pkt.xPos, pkt.yPos, color, Infinity);
	}



	/**
	 * Updating entity direction
	 *
	 * @param {object} pkt - PACKET.ZC.CHANGE_DIRECTION
	 */
	function onEntityDirectionChange( pkt )
	{
		var entity = EntityManager.get(pkt.AID);
		if (entity) {
			entity.direction = ([ 4, 3, 2, 1, 0, 7, 6, 5 ])[pkt.dir];
			entity.headDir   = pkt.headDir;
		}
	}


	/**
	 * Update Entity's visual look
	 *
	 * @param {object} pkt - PACKET.ZC.SPRITE_CHANGE2
	 */
	function onEntityViewChange( pkt )
	{
		var entity = EntityManager.get(pkt.GID);

		if (!entity) {
			return;
		}

		switch (pkt.type) {
			case 0:
				if(entity.objecttype === Entity.TYPE_EFFECT || entity.objecttype === Entity.TYPE_UNIT || entity.objecttype === Entity.TYPE_TRAP){
					EffectManager.spamSkillZone(pkt.value, entity.position[0], entity.position[1], pkt.GID, entity.creatorGID);
				} else {
					entity.job = pkt.value;
					if (entity === Session.Entity) {
						BasicInfo.update('job', pkt.value);
						Session.Character.job = pkt.value;
					}
				}
				break;

			case 1:
				entity.head = pkt.value;
				break;

			case 2:
				// In packet PACKET.ZC.SPRITE_CHANGE2, weapon and shield values are
				// stored in a long value (uint16 and uint16 in uint32)
				// source: https://github.com/rathena/rathena/blob/master/src/map/clif.c#L3162
				if (pkt instanceof PACKET.ZC.SPRITE_CHANGE2) {
					entity.shield = pkt.value >> 16;
					entity.weapon = pkt.value & 0x00FFFF;
				}
				else {
					entity.weapon = pkt.value;
				}

				// load self aura
				entity.aura.load( EffectManager );
				break;

			case 3: entity.accessory   = pkt.value; break;
			case 4: entity.accessory2  = pkt.value; break;
			case 5: entity.accessory3  = pkt.value; break;
			case 6: entity.headpalette = pkt.value; break;
			case 7: entity.bodypalette = pkt.value; break;
			case 8: entity.shield      = pkt.value; break;
			case 9:  break; // UNKNOWN
			case 10: break; // UNKNOWN²
			case 11: break; // robe, not supported yet
		}
	}

	/**
	 * Update NPC's visual look
	 *
	 * @param {object} pkt - PACKET.ZC.NPCSPRITE_CHANGE
	 */
	function onNPCViewChange( pkt )
	{
		var entity = EntityManager.get(pkt.GID);

		// Type is fixed 1 and no other values. No need to do anything with it
		if (entity) {
			entity.job = pkt.value;
		}
	}


	/**
	 * Entity use skill on another entity (no damage : heal, boost, etc.)
	 *
	 * @param {object} pkt - PACKET.ZC.USE_SKILL
	 */
	function onEntityUseSkill( pkt )
	{
		var srcEntity = EntityManager.get(pkt.srcAID);
		var dstEntity = EntityManager.get(pkt.targetAID);

		// Don't display skill names for mobs and hiding skills
		if (srcEntity && (srcEntity.objecttype === Entity.TYPE_PC || srcEntity.objecttype === Entity.TYPE_DISGUISED ||
			srcEntity.objecttype === Entity.TYPE_PET || srcEntity.objecttype === Entity.TYPE_HOM ||
			srcEntity.objecttype === Entity.TYPE_MERC || srcEntity.objecttype === Entity.TYPE_ELEM)
		)
		{
			if(!SkillNameDisplayExclude.includes(pkt.SKID)){
				srcEntity.dialog.set(
					( (SkillInfo[pkt.SKID] && SkillInfo[pkt.SKID].SkillName ) || 'Unknown Skill' ) + ' !!',
					'white'
				);
			}
		}

		//Action handling
		if(srcEntity){
			if(srcEntity.action !== srcEntity.ACTION.DIE && srcEntity.action !== srcEntity.ACTION.SIT){
				if(pkt.SKID in SkillActionTable){
					var action = SkillActionTable[pkt.SKID];
					if(action){
						srcEntity.setAction(action(srcEntity, Renderer.tick));
					}
				} else {
					srcEntity.setAction(SkillActionTable['DEFAULT'](srcEntity, Renderer.tick));
				}
			}
		}

		if (dstEntity) {
			if (srcEntity && dstEntity !== srcEntity) {
				srcEntity.lookTo( dstEntity.position[0], dstEntity.position[1] );
			}

			// In healing skill, the level parameter stored the healed value
			if (pkt.SKID === SkillId.AL_HEAL ||
				pkt.SKID === SkillId.AB_HIGHNESSHEAL ||
				pkt.SKID === SkillId.AB_CHEAL) {
				Damage.add( pkt.level, dstEntity, Renderer.tick, null, Damage.TYPE.HEAL );
				Sound.playPosition('_heal_effect.wav', dstEntity.position); // healing on neutral targets got another effect than undeads
			}

			// Steal Coin zeny
			if (pkt.SKID === SkillId.RG_STEALCOIN) {
				ChatBox.addText('You got '+pkt.level+' zeny.', ChatBox.TYPE.BLUE, ChatBox.FILTER.ITEM );
			}

			if (pkt.SKID === SkillId.GC_ROLLINGCUTTER) {
				if(dstEntity.RollCounter){
					var EF_Init_Par = {
						effectId: EffectConst.EF_ROLLING1 + dstEntity.RollCounter-1,
						ownerAID: dstEntity.GID
					};

					EffectManager.spam( EF_Init_Par );
				}
			}

			if (pkt.SKID === SkillId.TK_SEVENWIND) {
				if(pkt.level){
					var EF_Init_Par = {
						effectId: EffectConst.EF_BEGINASURA1 + pkt.level-1,
						ownerAID: dstEntity.GID
					};

					EffectManager.spam( EF_Init_Par );
				}
			}

			EffectManager.spamSkill( pkt.SKID, pkt.targetAID, null, null, pkt.srcAID);

			if (pkt.result == 1){
				EffectManager.spamSkillSuccess( pkt.SKID, pkt.targetAID, null, pkt.srcAID);
			}
		}
	}


	/**
	 * Entity just finish casting a skill to position
	 *
	 * @param {object} pkt - PACKET.ZC.SKILL_ENTRY
	 */
	function onSkillAppear( pkt )
	{
		EffectManager.spamSkillZone( pkt.job, pkt.xPos, pkt.yPos, pkt.AID, pkt.creatorAID);
	}


	/**
	 * Remove a skill from screen
	 *
	 * @param {object} pkt - PACKET.ZC.SKILL_DISAPPEAR
	 */
	function onSkillDisapear( pkt )
	{
		EffectManager.remove( null, pkt.AID );
		var entity = EntityManager.get(pkt.AID);
		if (entity) {
			entity.remove();
		}
	}


	/**
	 * Entity use skill on another entity with damage
	 *
	 * @param {object} pkt - PACKET.ZC.NOTIFY_SKILL
	 */
	function onEntityUseSkillToAttack( pkt )
	{
		var SkillAction = {};	//Corresponds to e_damage_type in clif.hpp
		SkillAction.NORMAL				= 0;	/// damage [ damage: total damage, div: amount of hits, damage2: assassin dual-wield damage ]
		SkillAction.PICKUP_ITEM			= 1;	/// pick up item
		SkillAction.SIT_DOWN			= 2;	/// sit down
		SkillAction.STAND_UP			= 3;	/// stand up
		SkillAction.ENDURE				= 4;	/// damage (endure)
		SkillAction.SPLASH				= 5;	/// (splash?)
		SkillAction.SKILL				= 6;	/// (skill?)
		SkillAction.REPEAT				= 7;	/// (repeat damage?)
		SkillAction.MULTI_HIT			= 8;	/// multi-hit damage
		SkillAction.MULTI_HIT_ENDURE	= 9;	/// multi-hit damage (endure)
		SkillAction.CRITICAL			= 10;	/// critical hit
		SkillAction.LUCY_DODGE			= 11;	/// lucky dodge
		SkillAction.TOUCH				= 12;	/// (touch skill?)
		SkillAction.MULTI_HIT_CRITICAL	= 13;	/// multi-hit critical


		var srcEntity = EntityManager.get(pkt.AID);
		var dstEntity = EntityManager.get(pkt.targetID);
		var srcWeapon;

		if (srcEntity) {
			pkt.attackMT = Math.min( 9999, pkt.attackMT ); // FIXME: cap value ?
			pkt.attackMT = Math.max(   1, pkt.attackMT );
			srcEntity.attack_speed = pkt.attackMT;
			srcEntity.amotionTick = Renderer.tick + pkt.attackMT; // Add amotion delay

			srcWeapon = 0;
			if(srcEntity.weapon){
				srcWeapon = srcEntity.weapon;
			}

			// Don't display skill names for mobs and hiding skills
			if (!SkillNameDisplayExclude.includes(pkt.SKID)
				&&
				(srcEntity.objecttype === Entity.TYPE_PC || srcEntity.objecttype === Entity.TYPE_DISGUISED ||
				srcEntity.objecttype === Entity.TYPE_PET || srcEntity.objecttype === Entity.TYPE_HOM ||
				srcEntity.objecttype === Entity.TYPE_MERC || srcEntity.objecttype === Entity.TYPE_ELEM)
			){
				srcEntity.dialog.set( ( (SkillInfo[pkt.SKID] && SkillInfo[pkt.SKID].SkillName ) || 'Unknown Skill' ) + ' !!' );
			}

			//Action handling
			if(srcEntity.action !== srcEntity.ACTION.DIE && srcEntity.action !== srcEntity.ACTION.SIT){
				if(pkt.SKID in SkillActionTable){
					var action = SkillActionTable[pkt.SKID];
					if(action){
						srcEntity.setAction(action(srcEntity, Renderer.tick));
					}
				} else {
					srcEntity.setAction(SkillActionTable['DEFAULT'](srcEntity, Renderer.tick));
				}

				//Pet Talk
				if(srcEntity.GID === Session.Entity.GID && (Session.pet.friendly > 900 && (Session.pet.lastTalk || 0) + 10000 < Date.now())){
					var talkRate = parseInt((Math.random() * 10));
					if(talkRate < 3){
						var hunger = DB.getPetHungryState(Session.pet.oldHungry);
						var talk = DB.getPetTalkNumber(Session.pet.job, PetMessageConst.PM_HUNTING, hunger);

						var talkPkt    = new PACKET.CZ.PET_ACT();
						talkPkt.data = talk;
						Network.sendPacket(talkPkt);
						Session.pet.lastTalk = Date.now();
					}
				}

			}
		}

		if (dstEntity) {
			var target = pkt.damage ? dstEntity : srcEntity;

			if (target && !(srcEntity == dstEntity && pkt.action == SkillAction.SKILL)) {

				// Will be hit actions
				onEntityWillBeHitSub( pkt, dstEntity );

				var isCombo = target.objecttype !== Entity.TYPE_PC && pkt.count > 1;
				var isBlueCombo = SkillBlueCombo.includes(pkt.SKID);

				var addDamage = function(i, startTick) {

					if(pkt.damage){ // Only if hits
						EffectManager.spamSkillHit( pkt.SKID, pkt.targetID, startTick, pkt.AID);
					}

					if(!isCombo && isBlueCombo && pkt.damage){ // Blue 'crit' non-combo EG: Rampage Blaster that hits
						Damage.add( pkt.damage / pkt.count, target, startTick, srcWeapon, Damage.TYPE.COMBO_B | ( (i+1) === pkt.count ? Damage.TYPE.COMBO_FINAL : 0 ) );
					} else {
						Damage.add( pkt.damage / pkt.count, target, startTick, srcWeapon); // Normal
					}

					// Only display combo if the target is not entity and
					// there are multiple attacks and actually hits
					if (isCombo && pkt.damage) {
						Damage.add(
							pkt.damage / pkt.count * (i+1),
							target,
							startTick,
							srcWeapon,
							(isBlueCombo?Damage.TYPE.COMBO_B:Damage.TYPE.COMBO) | ( (i+1) === pkt.count ? Damage.TYPE.COMBO_FINAL : 0 )
						);
					}
				};

				for (var i = 0; i < pkt.count; ++i) {
					EffectManager.spamSkillBeforeHit( pkt.SKID, pkt.targetID, Renderer.tick + (C_MULTIHIT_DELAY * i), pkt.AID);
					addDamage(i, Renderer.tick + pkt.attackMT + (C_MULTIHIT_DELAY * i));
				}
			}
		}

		if (srcEntity && dstEntity && pkt.action != SkillAction.SPLASH) {
			EffectManager.spamSkill( pkt.SKID, pkt.targetID, null, Renderer.tick + pkt.attackMT, pkt.AID);
		}
	}


	/**
	 * Cast a skill to someone
	 * @param {object} pkt - pkt PACKET.ZC.USESKILL_ACK
	 */
	function onEntityCastSkill( pkt )
	{
		// property:
		//     0 = Yellow cast aura
		//     1 = Water elemental cast aura
		//     2 = Earth elemental cast aura
		//     3 = Fire elemental cast aura
		//     4 = Wind elemental cast aura
		//     5 = Poison elemental cast aura
		//     6 = Holy elemental cast aura
		//     7 = Shadow/Dark elemental cast aura
		//     8 = Ghost elemental cast aura (same as 6?)
		//     9 = Undead elemental cast aura
		// is disposable:
		//     0 = yellow chat text "[src name] will use skill [skill name]."
		//     1 = no text

		var srcEntity = EntityManager.get(pkt.AID);
		var dstEntity = EntityManager.get(pkt.targetID);

		var message = false;

		if (!srcEntity) {
			return;
		}

		var hideCastBar = false;
		var hideCastAura = false;
		var isPlay = true;
		var next = {
			action: srcEntity.ACTION.READYFIGHT,
			frame:  0,
			repeat: true,
			play:   true,
			next:   false
		}

		if(pkt.delayTime) {

			// Check if cast bar needs to be hidden
			hideCastBar = (pkt.SKID in SkillEffect && SkillEffect[pkt.SKID].hideCastBar);

			if ( !hideCastBar ) {
				srcEntity.cast.set( pkt.delayTime );
			}
			isPlay = false;
			next = false;
		}

		if (srcEntity.objecttype === Entity.TYPE_PC) { //monsters don't use ACTION.SKILL animation

			var action = (SkillInfo[pkt.SKID] && SkillInfo[pkt.SKID].ActionType) || 'SKILL';

			srcEntity.setAction({
				action: srcEntity.ACTION[action],
				frame:  0,
				repeat: false,
				play: isPlay,
				next: next,
			});
		}

		Session.Entity.lastSKID = pkt.SKID;

		// Hardcoded version of Auto Counter casting bar
		// It's dont gey any delayTime so we need to handle it diffrent:
		// if the monster hit us then PACKET_ZC_DISPEL is received (to force cast bar to cancel)
		// if not it's end by itself (on kRO Renewal you can move during AC to cancel it but it's not implemented on privates yet)
		if(pkt.SKID == SkillId.KN_AUTOCOUNTER){
			srcEntity.cast.set( 1000 );
			if (srcEntity === Session.Entity) {
				Session.underAutoCounter = true;
			}
		}

		//Frost joke and scream messages
		if(pkt.SKID === SkillId.BA_FROSTJOKER && srcEntity == Session.Entity){
			var msg = DB.getRandomJoke();
			if(msg){
				ChatBox.onRequestTalk('', msg, ChatBox.TYPE.PUBLIC);
				message = true;
			}
		} else if(pkt.SKID === SkillId.DC_SCREAM && srcEntity == Session.Entity){
			var msg = DB.getRandomScream();
			if(msg){
				ChatBox.onRequestTalk('', msg, ChatBox.TYPE.PUBLIC);
				message = true;
			}
		}

		// Only mob to don't display skill name ?
		if (srcEntity.objecttype === Entity.TYPE_PC || srcEntity.objecttype === Entity.TYPE_DISGUISED ||
				srcEntity.objecttype === Entity.TYPE_PET || srcEntity.objecttype === Entity.TYPE_HOM ||
				srcEntity.objecttype === Entity.TYPE_MERC || srcEntity.objecttype === Entity.TYPE_ELEM
		) {
			if(!SkillNameDisplayExclude.includes(pkt.SKID) && !message){
				srcEntity.dialog.set(
					( ( SkillInfo[pkt.SKID] && SkillInfo[pkt.SKID].SkillName ) || 'Unknown Skill' ) + ' !!',
					'white'
				);
			}
		}

		//Spells like Bash, Hide, Double Strafe etc. has special casting effect
		EffectManager.spamSkillCast( pkt.SKID, pkt.AID, null, pkt.targetID);

		if (dstEntity && dstEntity !== srcEntity) {
			srcEntity.lookTo( dstEntity.position[0], dstEntity.position[1] );
			if (pkt.delayTime) {
				var EF_Init_Par = {
					effectId: EffectConst.EF_LOCKON,
					ownerAID: dstEntity.GID,
					position: dstEntity.position,
					duration: pkt.delayTime
				};

				EffectManager.spam( EF_Init_Par );
			}
		} else if (pkt.xPos && pkt.yPos) {
			srcEntity.lookTo( pkt.xPos, pkt.yPos );
			if (pkt.delayTime) {
				var EF_Init_Par = {
					effectId: EffectConst.EF_GROUNDSAMPLE,
					skillId: pkt.SKID,
					position: [pkt.xPos, pkt.yPos, Altitude.getCellHeight(pkt.yPos, pkt.yPos)],
					duration: pkt.delayTime,
					otherAID: srcEntity.GID
				};

				EffectManager.spam( EF_Init_Par );
			}
		}

		// Check if cast aura needs to be hidden
		hideCastAura = (pkt.SKID in SkillEffect && SkillEffect[pkt.SKID].hideCastAura);

		// Cast aura
		if(srcEntity && pkt.delayTime && !hideCastAura){
			var EF_Init_Par = {
				effectId: EffectConst.EF_BEGINSPELL, // Default
				ownerAID: srcEntity.GID,
				position: srcEntity.position,
				duration: pkt.delayTime
			};

			switch(pkt.property) {
				case 0:
					EF_Init_Par.effectId = EffectConst.EF_BEGINSPELL;
					break;
				case 1:
					EF_Init_Par.effectId =  EffectConst.EF_BEGINSPELL2;
					break;
				case 2:
					EF_Init_Par.effectId = EffectConst.EF_BEGINSPELL5;
					break;
				case 3:
					EF_Init_Par.effectId = EffectConst.EF_BEGINSPELL3;
					break;
				case 4:
					EF_Init_Par.effectId = EffectConst.EF_BEGINSPELL4;
					break;
				case 5:
					EF_Init_Par.effectId = EffectConst.EF_BEGINSPELL7;
					break;
				case 6:
					EF_Init_Par.effectId = EffectConst.EF_BEGINSPELL6;
					break;
				case 7:
					EF_Init_Par.effectId = EffectConst.EF_DARKCASTING;
					break;
				case 8:
					EF_Init_Par.effectId = EffectConst.EF_BEGINSPELL6;
					break;
				case 9:
					EF_Init_Par.effectId = EffectConst.EF_DARKCASTING;
					break;
			}

			EffectManager.spam( EF_Init_Par );
		}
	}


	/**
	 * A cast from an entity just canceled
	 *
	 * @param {object} pkt - PACKET.ZC.DISPEL
	 */
	function onEntityCastCancel(pkt)
	{
		var entity = EntityManager.get(pkt.AID);
		if (entity) {
			entity.cast.clean();

			// Cancel effects
			EffectManager.remove(null, entity.GID, [12, 54, 55, 56, 57, 58, 59, 454, 60, 513]);
			EffectManager.remove(LockOnTarget, entity.GID);
			EffectManager.remove(MagicTarget, entity.GID);
			EffectManager.remove(MagicRing, entity.GID);

			if (entity === Session.Entity) { // Autocounter hardcoded animation (any better place to put this?)
				if(Session.underAutoCounter) {
					if(Session.Entity.life.hp > 0)
						var EF_Init_Par = {
							effectId: EffectConst.EF_AUTOCOUNTER,
							ownerAID: pkt.AID
						};

						EffectManager.spam( EF_Init_Par );
					Session.underAutoCounter = false;
				}
			}
		}
	}


	/**
	 * Update Player status
	 *
	 * @param {object} pkt - PACKET.ZC.MSG_STATE_CHANGE
	 */
	function onEntityStatusChange( pkt )
	{
		var entity = EntityManager.get( pkt.AID );

		if (!entity) {
			return;
		}

		// TODO: add other status
		switch (pkt.index) {

			// Maya purple card
			case StatusConst.CLAIRVOYANCE:
				if (entity === Session.Entity) {
					Session.Character.intravision = pkt.state;
					EntityManager.forEach(function(entity){
						entity.effectState = entity.effectState;
					});
				}
				break;

			// Show cart
			case StatusConst.ON_PUSH_CART:
				entity.hasCart = pkt.state || (!pkt.hasOwnProperty('state'));
				if(pkt.val && (pkt.state || (!pkt.hasOwnProperty('state')) )){
					entity.CartNum = pkt.val[0];
				}
				break;


			case StatusConst.HIDING:
				var EF_Init_Par = {
					effectId: EffectConst.EF_SUMMONSLAVE,
					ownerAID: pkt.AID
				};

				if (pkt.state == 1){
					EF_Init_Par.effectId = EffectConst.EF_BASH;
				}

				EffectManager.spam( EF_Init_Par );
				break;

			case StatusConst.EXPLOSIONSPIRITS: //state: 1 ON  0 OFF
			case StatusConst.MARIONETTE_MASTER:
			case StatusConst.MARIONETTE:
			case StatusConst.TWOHANDQUICKEN:
			case StatusConst.ONEHANDQUICKEN:
			case StatusConst.SPEARQUICKEN:
			case StatusConst.LKCONCENTRATION:
			case StatusConst.BERSERK:
			case StatusConst.ENERGYCOAT:
			case StatusConst.OVERTHRUST:
			case StatusConst.OVERTHRUSTMAX:
			case StatusConst.SWOO:
			case StatusConst.SKE:
			case StatusConst.NJ_BUNSINJYUTSU:
			case StatusConst.STEELBODY:
			case StatusConst.AURABLADE:
			case StatusConst.ASSUMPTIO:
			case StatusConst.ASSUMPTIO2:
			case StatusConst.SG_WARM:
			case StatusConst.SG_SUN_WARM:
			case StatusConst.SG_MOON_WARM:
			case StatusConst.SG_STAR_WARM:
			case StatusConst.KAITE:
			case StatusConst.SOULLINK:
			case StatusConst.PROPERTYUNDEAD:
			case StatusConst.DA_CONTRACT:
			//CG_MOONLIT Moonlit Water Mill
			//SC_MERC_QUICKEN
			//SC_SKA
			//SC_INCATKRATE
				entity.toggleOpt3(pkt.index, pkt.state)
				break;

			case StatusConst.RUN: //state: 1 ON  0 OFF
				var EF_Init_Par = {
					effectId: EffectConst.EF_STOPEFFECT,
					ownerAID: pkt.AID
				};

				if (pkt.state == 1){
					EF_Init_Par.effectId = EffectConst.EF_RUN;
					//todo: draw footprints on the floor
				}

				EffectManager.spam( EF_Init_Par );
				break;

			case StatusConst.TING:
				var EF_Init_Par = {
					effectId: EffectConst.EF_QUAKEBODY,
					ownerAID: pkt.AID
				};

				EffectManager.spam( EF_Init_Par );
				break;

			case StatusConst.STORMKICK_ON:
			case StatusConst.STORMKICK_READY:
				entity.setAction({
					action: entity.ACTION.SKILL,
					frame:  0,
					repeat: false,
					play:   false,
					next:   false
				});
				break;

			case StatusConst.DOWNKICK_ON:
			case StatusConst.DOWNKICK_READY:
				entity.setAction({
					action: entity.ACTION.SKILL,
					frame:  2,
					repeat: false,
					play:   false,
					next:   false
				});
				break;

			case StatusConst.TURNKICK_ON:
			case StatusConst.TURNKICK_READY:
				entity.setAction({
					action: entity.ACTION.SKILL,
					frame:  3,
					repeat: false,
					play:   false,
					next:   false
				});
				break;

			case StatusConst.COUNTER_ON:
			case StatusConst.COUNTER_READY:
				entity.setAction({
					action: entity.ACTION.SKILL,
					frame:  4,
					repeat: false,
					play:   false,
					next:   false
				});
				break;

			case StatusConst.DODGE_ON:
			case StatusConst.DODGE_READY:
				entity.setAction({
					action: entity.ACTION.PICKUP,
					frame:  1,
					repeat: false,
					play:   false,
					next:   false
				});
				break;

			case StatusConst.ROLLINGCUTTER:
				if (pkt.state == 1) {
					entity.RollCounter = pkt.val[0];
				} else {
					entity.RollCounter = 0;
				}
				break;

			case StatusConst.CAMOUFLAGE:
				if (pkt.state == 1) {
					entity.Camouflage = pkt.val[0];
				} else {
					entity.Camouflage = 0;
				}
				entity.effectState = entity.effectState;
				break;

			case StatusConst.SUMMON1:
				if (pkt.state == 1) {
					entity.Summon1 = pkt.val[0];
				} else {
					entity.Summon1 = 0;
				}
				updateWarlockSpheres(entity);
				break;

			case StatusConst.SUMMON2:
				if (pkt.state == 1) {
					entity.Summon2 = pkt.val[0];
				} else {
					entity.Summon2 = 0;
				}
				updateWarlockSpheres(entity);
				break;

			case StatusConst.SUMMON3:
				if (pkt.state == 1) {
					entity.Summon3 = pkt.val[0];
				} else {
					entity.Summon3 = 0;
				}
				updateWarlockSpheres(entity);
				break;

			case StatusConst.SUMMON4:
				if (pkt.state == 1) {
					entity.Summon4 = pkt.val[0];
				} else {
					entity.Summon4 = 0;
				}
				updateWarlockSpheres(entity);
				break;

			case StatusConst.SUMMON5:
				if (pkt.state == 1) {
					entity.Summon5 = pkt.val[0];
				} else {
					entity.Summon5 = 0;
				}
				updateWarlockSpheres(entity);
				break;

			case StatusConst.STEALTHFIELD:
				if (pkt.state == 1) {
					entity.Stealthfield = pkt.val[0];
				} else {
					entity.Stealthfield = 0;
				}
				entity.effectState = entity.effectState;
				break;

			case StatusConst.SHADOWFORM:
				if (pkt.state == 1) {
					entity.Shadowform = pkt.val[0];
				} else {
					entity.Shadowform = 0;
				}
				entity.effectState = entity.effectState;
				break;

			case StatusConst.TRICKDEAD:
				if(pkt.state == 1) {
					entity.setAction({
						action: entity.ACTION.DIE,
						frame:  0,
						repeat: false,
						play:   true,
						next:   false
					});
				}
				if(pkt.state == 0) {
					entity.setAction({
						action: entity.ACTION.IDLE,
						frame:  0,
						repeat: false,
						play:   true,
						next:   false
					});
				}
				break;

			case StatusConst.ILLUSION:
				if (pkt.state == 1) {
					entity.isHallucinating = true;
				} else {
					entity.isHallucinating = false;
				}
				break;

			case StatusConst.STOP:
				if (pkt.state == 1) {
					entity.attachments.add({
						repeat:    true,
						uid:       'status-stop',
						file:      '\xbd\xba\xc5\xe9'
					});
				} else {
					entity.attachments.remove('status-stop');
				}
				break;

			case StatusConst.C_MARKER:
				if (pkt.state == 1) {
					var EF_Init_Par = {
						effectId: 'ef_c_marker2',
						ownerAID: pkt.AID
					};

					EffectManager.spam( EF_Init_Par );
				}
				break;


			// Cast a skill, TODO: add progressbar in shortcut
			case StatusConst.POSTDELAY:
				entity.setAction({
					action: entity.ACTION.SKILL,
					frame:  0,
					repeat: false,
					play:   true,
					next: {
						action: entity.ACTION.READYFIGHT,
						frame:  0,
						repeat: true,
						play:   true,
						next:   false
					}
				});
				if(pkt.RemainMS && entity == Session.Entity){
					ShortCut.setGlobalSkillDelay(pkt.RemainMS);
				}
				break;

			case StatusConst.ALL_RIDING:
				entity.allRidingState = pkt.state;
				break;


		}

		// Modify icon
		if (entity === Session.Entity) {
			StatusIcons.update( pkt.index, pkt.state, pkt.RemainMS );
		}
	}


	//Warlock sphere summons update
	function updateWarlockSpheres(entity){
		if (entity.Summon1 || entity.Summon2 || entity.Summon3 || entity.Summon4 || entity.Summon5){
			var EF_Init_Par = {
				effectId: 'temporary_warlock_sphere',
				ownerAID: entity.GID,
				persistent: false
			};

			EffectManager.spam( EF_Init_Par );

			entity.WarlockSpheres = true;
		} else if (entity.WarlockSpheres){
			EffectManager.remove( null, entity.GID, 'temporary_warlock_sphere');
			entity.WarlockSpheres = false;
		}
	}


	/**
	 * Update player option
	 *
	 * @param {object} pkt - PACKET.ZC.STATE_CHANGE
	 */
	function onEntityOptionChange( pkt )
	{
		var entity = EntityManager.get( pkt.AID );
		if (!entity) {
			return;
		}

		entity.bodyState   = pkt.bodyState;
		entity.healthState = pkt.healthState;
		entity.effectState = pkt.effectState;
		entity.isPKModeON  = pkt.isPKModeON;

		// for changes in effectState (HIDING, CLOAK)
		entity.aura.load( EffectManager );
	}


	/**
	 * Display a shop above entity's head
	 *
	 * @param {object} pkt - PACKET.ZC.STORE_ENTRY / PACKET.ZC.DISAPPEAR_BUYING_STORE_ENTRY
	 */
	function onEntityCreateRoom( pkt )
	{
		var entity;

		if (pkt instanceof PACKET.ZC.STORE_ENTRY) {
			entity = EntityManager.get( pkt.makerAID );
			if (entity) {
				entity.room.create(
					pkt.storeName,
					pkt.makerAID,
					entity.room.constructor.Type.BUY_SHOP,
					true
				);
			}
			return;
		}

		if (pkt instanceof PACKET.ZC.BUYING_STORE_ENTRY) {
			entity = EntityManager.get( pkt.makerAID );
			if (entity) {
				entity.room.create(
					pkt.storeName,
					pkt.makerAID,
					entity.room.constructor.Type.SELL_SHOP,
					true
				);
			}
			return;
		}

		if (pkt instanceof PACKET.ZC.ROOM_NEWENTRY) {
			entity = EntityManager.get( pkt.AID );
			if (entity) {

				var type  = entity.room.constructor.Type.PUBLIC_CHAT;
				var title = pkt.title + '('+ pkt.curcount +'/'+ pkt.maxcount +')';

				switch (pkt.type) {
					case 0: // password
						type = entity.room.constructor.Type.PRIVATE_CHAT;
						break;

					case 1: break; // public
					case 2: break; // arena (npc waiting room)

					case 3: // PK zone - non clickable ???
						title = pkt.title; // no user limit
						break;
				}

				entity.room.title = pkt.title;
				entity.room.limit = pkt.maxcount;
				entity.room.count = pkt.curcount;

				entity.room.create(
					title,
					pkt.roomID,
					type,
					true
				);
			};
		}
	}


	/**
	 * Remove entity room
	 *
	 * @param {object} pkt - PACKET.ZC.DISAPPEAR_ENTRY
	 */
	function onEntityDestroyRoom( pkt )
	{
		if ('roomID' in pkt) {
			EntityManager.forEach(function(entity){
				if (entity.room.id === pkt.roomID) {
					entity.room.remove();
					return false;
				}
				return true;
			});
			return;
		}

		var entity = EntityManager.get( pkt.makerAID );
		if (entity) {
			entity.room.remove();
		}
	}


	/**
	 * "Blade Stop" / "Root" visual
	 */

	function onBladeStopVisual(srcEntity, dstEntity, state)
	{
			srcEntity.lookTo( dstEntity.position[0], dstEntity.position[1] );
			srcEntity.toggleOpt3(StatusConst.BLADESTOP, state);
			if(state == 1)
				srcEntity.setAction({
					action: srcEntity.ACTION.READYFIGHT,
					frame:  0,
					repeat: false,
					play:   true,
					next:   false
				});
			if(state == 0)
				srcEntity.setAction({
					action: srcEntity.ACTION.IDLE,
					frame:  0,
					repeat: false,
					play:   true,
					next:   false
				});
	}

	 /**
	 * "Blade Stop" / "Root" skill status
	 *
	 * @param {object} pkt - PACKET.ZC.BLADESTOP
	 */
	function onBladeStopPacket(pkt)
	{
		var srcEntity = EntityManager.get(pkt.srcAID);
		var dstEntity = EntityManager.get(pkt.destAID);
		if (srcEntity && dstEntity) {
			onBladeStopVisual(srcEntity, dstEntity, pkt.flag);
			onBladeStopVisual(dstEntity, srcEntity, pkt.flag);
		}
	}

	/**
	 * Notify experience gained
	 *
	 * @param {object} pkt - PACKET_ZC_NOTIFY_EXP
	 */

	function onNotifyExp( pkt )
	{
		if(pkt.expType == 1) {  // for now it will be only for quest (for common exp @showexp is much better)
			if(pkt. varID == 1) {
				ChatBox.addText( 'Experience gained from Quest, Base:'+pkt.amount, null, ChatBox.FILTER.EXP, '#A442DC');
			}
			if(pkt. varID == 2) {
				ChatBox.addText( 'Experience gained from Quest, Job:'+pkt.amount, null, ChatBox.FILTER.EXP, '#A442DC');
			}
		}
	}

	/**
	 * Mark MVP position on map (Convex Mirror item)
	 * it's show small icon  at minimap when MVP is spawned (but I will use cross, it's more accurate)
	 * @param {object} pkt - PACKET_ZC_BOSS_INFO
	 *
	 *   probably it's not updated with Tombstone system, but Tombstones are fail...
	 */

	function onMarkMvp( pkt )
	{
		MiniMap.removeNpcMark('mvp'); //hack for mark system (todo: debug this)
		if(pkt.infoType == 1) {
			MiniMap.addNpcMark( 'mvp', pkt.xPos, pkt.yPos, 0x0ff0000, Infinity );
			/**if(!MiniMap.isNpcMarkExist('mvp')) {    // wtf marker is pushed with delay??
				ChatBox.addText( pkt.name+' is already spawned at ('+pkt.xPos+','+pkt.yPos+')', null, ChatBox.FILTER.PUBLIC_LOG, '#FFFF63');
			}*/
		}
		if(pkt.infoType == 0) {
			ChatBox.addText( 'Boss monster not found.', ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG);
		}
	}

	/**
	* Show MvP reward Effect
	 *
	 * @param {object} pkt - PACKET.ZC.MVP
	 */
	function onEntityMvpReward( pkt )
	{
		var EF_Init_Par = {
			effectId: EffectConst.EF_MVP,
			ownerAID: pkt.AID
		};
		EffectManager.spam( EF_Init_Par );
	}


	/**
	 * Show MvP item message
	 *
	 * @param {object} pkt - PACKET.ZC.MVP_GETTING_ITEM
	 */
	function onEntityMvpRewardItemMessage( pkt ) {
		var item = DB.getItemInfo(pkt.ITID);
		ChatBox.addText(DB.getMessage(143), ChatBox.TYPE.BLUE, ChatBox.FILTER.ITEM);
		ChatBox.addText(item.identifiedDisplayName, ChatBox.TYPE.BLUE, ChatBox.FILTER.ITEM);
	}


	/**
	 * Entity will be hit, handle getting hit and after actions
	 *
	 * @param pkt - packet PACKET.ZC.NOTIFY_ACT or PACKET.ZC.NOTIFY_SKILL
	 * @param dstEntity - Reveiver entity
	 */
	function onEntityWillBeHitSub( pkt, dstEntity ){
		// only if has damage > 0 and type is not endure and not lucky
		if ((pkt.damage > 0 || pkt.leftDamage > 0) && pkt.action !== 4 && pkt.action !== 9 && pkt.action !== 11) {

			var count = pkt.count || 1;

			function impendingAttack(){ // Get hurt when attack happens
				if(dstEntity.action !== dstEntity.ACTION.DIE){
					dstEntity.setAction({
						action: dstEntity.ACTION.HURT,
						frame:  0,
						repeat: false,
						play:   true,
						next:	{
							action: dstEntity.ACTION.READYFIGHT, // Wiggle-wiggle
							delay:  pkt.attackedMT+0,
							frame:  0,
							repeat: true,
							play:   true,
						}
					});
				}
			}

			for(var i = 0; i<count; i++){
				if( pkt.damage ){
					Events.setTimeout( impendingAttack, pkt.attackMT + (C_MULTIHIT_DELAY * i) );
				}
				if( pkt.leftDamage ){
					Events.setTimeout( impendingAttack, pkt.attackMT + ((C_MULTIHIT_DELAY*1.75) * i) );
				}
			}
		}
	}

	/**
	 * Does player have a Token of Siegfried?
	 */
	function haveSiegfriedItem(){
		var	itemInfo = Inventory.getItemById(7621);

		if ( Session.IsPKZone || Session.IsSiegeMode || Session.IsEventPVPMode )
			return false ;
		else if ( itemInfo && itemInfo.count > 0 )
			return true ;
		else
			return false ;
	}

	/**
	 * Initialize
	 */
	return function EntityEngine()
	{
		Network.hookPacket( PACKET.ZC.NOTIFY_STANDENTRY,            onEntitySpam );
		Network.hookPacket( PACKET.ZC.NOTIFY_NEWENTRY,              onEntitySpam );
		Network.hookPacket( PACKET.ZC.NOTIFY_ACTENTRY,              onEntitySpam );
		Network.hookPacket( PACKET.ZC.NOTIFY_MOVEENTRY,             onEntitySpam );
		Network.hookPacket( PACKET.ZC.NOTIFY_STANDENTRY_NPC,        onEntitySpam );
		Network.hookPacket( PACKET.ZC.NOTIFY_STANDENTRY2,           onEntitySpam );
		Network.hookPacket( PACKET.ZC.NOTIFY_NEWENTRY2,             onEntitySpam );
		Network.hookPacket( PACKET.ZC.NOTIFY_MOVEENTRY2,            onEntitySpam );
		Network.hookPacket( PACKET.ZC.NOTIFY_STANDENTRY3,           onEntitySpam );
		Network.hookPacket( PACKET.ZC.NOTIFY_NEWENTRY3,             onEntitySpam );
		Network.hookPacket( PACKET.ZC.NOTIFY_MOVEENTRY3,            onEntitySpam );
		Network.hookPacket( PACKET.ZC.NOTIFY_STANDENTRY4,           onEntitySpam );
		Network.hookPacket( PACKET.ZC.NOTIFY_NEWENTRY4,             onEntitySpam );
		Network.hookPacket( PACKET.ZC.NOTIFY_MOVEENTRY4,            onEntitySpam );
		Network.hookPacket( PACKET.ZC.NOTIFY_STANDENTRY5,           onEntitySpam );
		Network.hookPacket( PACKET.ZC.NOTIFY_NEWENTRY5,             onEntitySpam );
		Network.hookPacket( PACKET.ZC.NOTIFY_MOVEENTRY5,            onEntitySpam );
		Network.hookPacket( PACKET.ZC.NOTIFY_STANDENTRY6,           onEntitySpam );
		Network.hookPacket( PACKET.ZC.NOTIFY_NEWENTRY6,             onEntitySpam );
		Network.hookPacket( PACKET.ZC.NOTIFY_MOVEENTRY6,            onEntitySpam );
		Network.hookPacket( PACKET.ZC.NOTIFY_STANDENTRY7,           onEntitySpam );
		Network.hookPacket( PACKET.ZC.NOTIFY_NEWENTRY7,             onEntitySpam );
		Network.hookPacket( PACKET.ZC.NOTIFY_MOVEENTRY7,            onEntitySpam );
		Network.hookPacket( PACKET.ZC.NOTIFY_STANDENTRY8,           onEntitySpam );
		Network.hookPacket( PACKET.ZC.NOTIFY_NEWENTRY8,             onEntitySpam );
		Network.hookPacket( PACKET.ZC.NOTIFY_MOVEENTRY8,            onEntitySpam );
		Network.hookPacket( PACKET.ZC.NOTIFY_STANDENTRY9,           onEntitySpam );
		Network.hookPacket( PACKET.ZC.NOTIFY_NEWENTRY9,             onEntitySpam );
		Network.hookPacket( PACKET.ZC.NOTIFY_MOVEENTRY9,            onEntitySpam );
		Network.hookPacket( PACKET.ZC.NOTIFY_VANISH,                onEntityVanish );
		Network.hookPacket( PACKET.ZC.NOTIFY_MOVE,                  onEntityMove );
		Network.hookPacket( PACKET.ZC.STOPMOVE,                     onEntityStopMove );
		Network.hookPacket( PACKET.ZC.NOTIFY_ACT,                   onEntityAction );
		Network.hookPacket( PACKET.ZC.NOTIFY_ACT2,                  onEntityAction );
		Network.hookPacket( PACKET.ZC.NOTIFY_ACT3,                  onEntityAction );
		Network.hookPacket( PACKET.ZC.NOTIFY_CHAT,                  onEntityTalk );
		Network.hookPacket( PACKET.ZC.SHOWSCRIPT,                   onEntityTalk );
		Network.hookPacket( PACKET.ZC.NPC_CHAT,                     onEntityTalkColor );
		Network.hookPacket( PACKET.ZC.ACK_REQNAME,                  onEntityIdentity );
		Network.hookPacket( PACKET.ZC.ACK_REQNAMEALL,               onEntityIdentity );
		Network.hookPacket( PACKET.ZC.ACK_REQNAMEALL2,              onEntityIdentity );
		Network.hookPacket( PACKET.ZC.ACK_REQNAMEALL3,              onEntityIdentity );
		Network.hookPacket( PACKET.ZC.CHANGE_DIRECTION,             onEntityDirectionChange );
		Network.hookPacket( PACKET.ZC.SPRITE_CHANGE,                onEntityViewChange );
		Network.hookPacket( PACKET.ZC.SPRITE_CHANGE2,               onEntityViewChange );
		Network.hookPacket( PACKET.ZC.NPCSPRITE_CHANGE,             onNPCViewChange );
		Network.hookPacket( PACKET.ZC.USE_SKILL,                    onEntityUseSkill );
		Network.hookPacket( PACKET.ZC.USE_SKILL2,                   onEntityUseSkill );
		Network.hookPacket( PACKET.ZC.NOTIFY_SKILL,                 onEntityUseSkillToAttack );
		Network.hookPacket( PACKET.ZC.NOTIFY_SKILL2,                onEntityUseSkillToAttack );
		Network.hookPacket( PACKET.ZC.NOTIFY_SKILL_POSITION,        onEntityUseSkillToAttack );
		Network.hookPacket( PACKET.ZC.USESKILL_ACK,                 onEntityCastSkill );
		Network.hookPacket( PACKET.ZC.USESKILL_ACK2,                onEntityCastSkill );
		Network.hookPacket( PACKET.ZC.STATE_CHANGE,                 onEntityOptionChange );
		Network.hookPacket( PACKET.ZC.STATE_CHANGE3,                onEntityOptionChange );
		Network.hookPacket( PACKET.ZC.MSG_STATE_CHANGE,             onEntityStatusChange );
		Network.hookPacket( PACKET.ZC.MSG_STATE_CHANGE2,            onEntityStatusChange );
		Network.hookPacket( PACKET.ZC.MSG_STATE_CHANGE3,            onEntityStatusChange );
		Network.hookPacket( PACKET.ZC.MSG_STATE_CHANGE4,            onEntityStatusChange );
		Network.hookPacket( PACKET.ZC.MSG_STATE_CHANGE5,            onEntityStatusChange );
		Network.hookPacket( PACKET.ZC.STORE_ENTRY,                  onEntityCreateRoom );
		Network.hookPacket( PACKET.ZC.DISAPPEAR_ENTRY,              onEntityDestroyRoom );
		Network.hookPacket( PACKET.ZC.BUYING_STORE_ENTRY,           onEntityCreateRoom );
		Network.hookPacket( PACKET.ZC.DISAPPEAR_BUYING_STORE_ENTRY, onEntityDestroyRoom );
		Network.hookPacket( PACKET.ZC.ROOM_NEWENTRY,                onEntityCreateRoom );
		Network.hookPacket( PACKET.ZC.DESTROY_ROOM,                 onEntityDestroyRoom );
		Network.hookPacket( PACKET.ZC.SKILL_ENTRY,                  onSkillAppear);
		Network.hookPacket( PACKET.ZC.SKILL_ENTRY2,                 onSkillAppear);
		Network.hookPacket( PACKET.ZC.SKILL_ENTRY3,                 onSkillAppear);
		Network.hookPacket( PACKET.ZC.SKILL_ENTRY4,                 onSkillAppear);
		Network.hookPacket( PACKET.ZC.SKILL_ENTRY5,                 onSkillAppear);
		Network.hookPacket( PACKET.ZC.SKILL_DISAPPEAR,              onSkillDisapear);
		Network.hookPacket( PACKET.ZC.DISPEL,                       onEntityCastCancel);
		Network.hookPacket( PACKET.ZC.HIGHJUMP,                     onEntityJump);
		Network.hookPacket( PACKET.ZC.FASTMOVE,                     onEntityFastMove);
		Network.hookPacket( PACKET.ZC.RESURRECTION,                 onEntityResurect);
		Network.hookPacket( PACKET.ZC.EMOTION,                      onEntityEmotion);
		Network.hookPacket( PACKET.ZC.NOTIFY_MONSTER_HP,            onEntityLifeUpdate);
		Network.hookPacket( PACKET.ZC.QUEST_NOTIFY_EFFECT,          onEntityQuestNotifyEffect);
		Network.hookPacket( PACKET.ZC.BLADESTOP,                    onBladeStopPacket);
		Network.hookPacket( PACKET.ZC.NOTIFY_EXP,                   onNotifyExp);
		Network.hookPacket( PACKET.ZC.NOTIFY_EXP2,                  onNotifyExp);
		Network.hookPacket( PACKET.ZC.BOSS_INFO,                    onMarkMvp);
		Network.hookPacket( PACKET.ZC.MVP,                          onEntityMvpReward);
		Network.hookPacket( PACKET.ZC.MVP_GETTING_ITEM,             onEntityMvpRewardItemMessage);
	};
});
