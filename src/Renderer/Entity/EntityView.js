/**
 * Renderer/EntityView.js
 *
 * Manage Entity files (attachments) to load once a view change
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import Client from 'Core/Client.js';
import DB from 'DB/DBManager.js';
import ShadowTable from 'DB/Monsters/ShadowTable.js';
import MountTable from 'DB/Jobs/MountTable.js';
import AllMountTable from 'DB/Jobs/AllMountTable.js';
import EntityAction from './EntityAction.js';
import PACKETVER from 'Network/PacketVerManager.js';
import JobConst from 'DB/Jobs/JobConst.js';
import Session from 'Engine/SessionStorage.js';

/**
 * Files to display a view
 *
 * @param {optional|string} sprite path
 * @param {optional|string} action path
 * @param {optional|string} palette path
 */
function ViewFiles(spr, act, pal) {
	this.spr = spr || null;
	this.act = act || null;
	this.pal = pal || null;
	this.size = 1.0;
}

/**
 * View structure
 */
function View() {
	this.body = new ViewFiles();
	this.head = new ViewFiles();
	this.weapon = new ViewFiles();
	this.weapon_trail = new ViewFiles();
	this.shield = new ViewFiles();
	this.accessory = new ViewFiles();
	this.accessory2 = new ViewFiles();
	this.accessory3 = new ViewFiles();
	this.robe = new ViewFiles();
	this.shadow = new ViewFiles('data/sprite/shadow.spr', 'data/sprite/shadow.act');

	this.cart = [];
	//Super novice
	this.cart[0] = new ViewFiles(DB.getCartPath(0) + '.spr', DB.getCartPath(0) + '.act');

	this.cart[1] = new ViewFiles(DB.getCartPath(1) + '.spr', DB.getCartPath(1) + '.act');
	this.cart[2] = new ViewFiles(DB.getCartPath(2) + '.spr', DB.getCartPath(2) + '.act');
	this.cart[3] = new ViewFiles(DB.getCartPath(3) + '.spr', DB.getCartPath(3) + '.act');
	this.cart[4] = new ViewFiles(DB.getCartPath(4) + '.spr', DB.getCartPath(4) + '.act');
	this.cart[5] = new ViewFiles(DB.getCartPath(5) + '.spr', DB.getCartPath(5) + '.act');
	this.cart[6] = new ViewFiles(DB.getCartPath(6) + '.spr', DB.getCartPath(6) + '.act');
	this.cart[7] = new ViewFiles(DB.getCartPath(7) + '.spr', DB.getCartPath(7) + '.act');
	this.cart[8] = new ViewFiles(DB.getCartPath(8) + '.spr', DB.getCartPath(8) + '.act');
	this.cart[9] = new ViewFiles(DB.getCartPath(9) + '.spr', DB.getCartPath(9) + '.act');
	this.cart[10] = new ViewFiles(DB.getCartPath(10) + '.spr', DB.getCartPath(10) + '.act');
	this.cart[11] = new ViewFiles(DB.getCartPath(11) + '.spr', DB.getCartPath(11) + '.act');
	this.cart[12] = new ViewFiles(DB.getCartPath(12) + '.spr', DB.getCartPath(12) + '.act');
	this.cart[13] = new ViewFiles(DB.getCartPath(13) + '.spr', DB.getCartPath(13) + '.act');

	this.cart_shadow = new ViewFiles('data/sprite/shadow.spr', 'data/sprite/shadow.act');
}

/**
 * If changing sex, all files have to be reload
 * (not used in game but can be used in a next update or in offline mode)
 *
 * @param {number} sex (mal/female)
 */
function UpdateSex(sex) {
	// Not defined yet, no update others
	if (this._sex === -1) {
		this._sex = sex;
		return;
	}

	// Update other elements
	this._sex = sex;
	this.job = this._job; // will update body, body palette, weapon, shield
	this.head = this._head; // will update hair color
	this.accessory = this._accessory;
	this.accessory2 = this._accessory2;
	this.accessory3 = this._accessory3;
	this.robe = this._robe;
}

/**
 * Suppress head and accessory sprites (used for monster/transformation)
 */
function suppressHeadSprites() {
	for (let i = 0, count = HeadParts.length; i < count; ++i) {
		const part = HeadParts[i];
		this.files[part].spr = null;
		this.files[part].act = null;
		if (part === 'head') {
			this.files.head.pal = null;
		}
	}
}

/**
 * Restore head and accessories
 */
function restoreHeadSprites() {
	if (this._head >= 0) {
		UpdateHead.call(this, this._head);
	}
	if (this._headpalette > 0) {
		UpdateHeadPalette.call(this, this._headpalette);
	}
	if (this._accessory > 0) {
		this.accessory = this._accessory;
	}
	if (this._accessory2 > 0) {
		this.accessory2 = this._accessory2;
	}
	if (this._accessory3 > 0) {
		this.accessory3 = this._accessory3;
	}
}

/**
 * Returns true if any transformation (monster or job form) is currently active
 */
function hasTransformation() {
	return !!(this._active_monster_transform || this._monster_transform || this._job_transform);
}

/**
 * Returns the effective display job, considering all active transformations
 */
function getEffectiveJob() {
	return (
		this._active_monster_transform || this._monster_transform || this._job_transform || this.costume || this._job
	);
}

/**
 * List of view parts that should be suppressed when transformed
 */
const HeadParts = ['head', 'accessory', 'accessory2', 'accessory3'];

/**
 * Returns true if head sprites should be suppressed for the current state
 */
function shouldSuppressHead() {
	const job = getEffectiveJob.call(this);
	return hasTransformation.call(this) || DB.isMonster(job) || job === 4356 || job === 4357;
}

/**
 * Refresh head state (suppress or restore based on current conditions)
 */
function refreshHeadState() {
	if (shouldSuppressHead.call(this)) {
		suppressHeadSprites.call(this);
	} else if (!this.costume) {
		restoreHeadSprites.call(this);
	}
}

/**
 * Updating job
 *
 * @param {number} job id
 */
function UpdateBody(job) {
	let baseJob, path;
	let Entity;
	// Capture sequence number for stale callback detection
	const transformationSeq = this._transformationSeq || 0;

	if (job < 0) {
		return;
	}

	// Check if this is a transformation job (monster or form)
	// If so, don't update _job - it should preserve the original job
	const isTransformation = hasTransformation.call(this);

	// Avoid fuck*ng errors with mounts !
	// Sometimes the server send us the job of the mount sprite instead
	// of the base sprite + effect to have the mount.
	for (baseJob in MountTable) {
		if (MountTable[baseJob] === job) {
			this.costume = job;
			job = baseJob;
			break;
		}
	}

	for (baseJob in AllMountTable) {
		if (AllMountTable[baseJob] === job) {
			this.costume = job;
			job = baseJob;
			break;
		}
	}

	// Clothes keep the old job in memory
	// and show the costum if used
	// BUT: if this is a transformation, we should NOT update _job
	if (!isTransformation) {
		this._job = job;
	}

	// Update effective job
	this._effectiveJob = getEffectiveJob.call(this);

	if (this.costume) {
		job = this.costume;
	}

	// Resize character
	this.xSize = this.ySize = DB.isBaby(job) ? 4 : 5;

	this.files.shadow.size = job in ShadowTable ? ShadowTable[job] : 1.0;
	path = this.isAdmin ? DB.getAdminPath(this._sex) : DB.getBodyPath(job, this._sex);
	Entity = this.constructor;

	// Define Object type based on its id
	if (this.objecttype === Entity.TYPE_UNKNOWN) {
		let objecttype;
		switch (true) {
			case DB.isPlayer(job):
				objecttype = Entity.TYPE_PC;
				break;

			case DB.isWarp(job):
				objecttype = Entity.TYPE_WARP;
				break;

			case DB.isNPC(job):
				objecttype = Entity.TYPE_NPC;
				break;

			case DB.isMonster(job):
				objecttype = Entity.TYPE_MOB;
				break;

			case DB.isHomunculus(job):
				objecttype = Entity.TYPE_HOM;
				break;

			case DB.isMercenary(job):
				objecttype = Entity.TYPE_MER;
				break;

			case DB.isElem(job):
				objecttype = Entity.TYPE_ELEM;
				break;

			case DB.isAbr(job):
				objecttype = Entity.TYPE_NPC_ABR;
				break;

			case DB.isBionic(job):
				objecttype = Entity.TYPE_NPC_BIONIC;
				break;

			default:
				objecttype = Entity.TYPE_UNKNOWN;
				break;
		}

		// Clean up action frames
		if (objecttype !== this.objecttype) {
			this.objecttype = objecttype;
			EntityAction.call(this);
		}
	}

	// Invisible sprites
	if (job === 111 || job === 139 || job === 45) {
		this.files.body.spr = null;
		this.files.body.act = null;
		return;
	}

	// granny model not supported yet :(
	// Display a poring instead
	if (path === null || path.match(/\.gr2$/i)) {
		if (path.match(/aguardian90_8\.gr2$/i)) {
			path = DB.getBodyPath(1276, this._sex);
		} else if (path.match(/empelium90_0\.gr2$/i)) {
			path = DB.getBodyPath(2080, this._sex);
		} else if (path.match(/guildflag90_1\.gr2$/i)) {
			path = DB.getBodyPath(1911, this._sex);
		} else if (path.match(/kguardian90_7\.gr2$/i)) {
			path = DB.getBodyPath(2691, this._sex);
		} else if (path.match(/sguardian90_9\.gr2$/i)) {
			path = DB.getBodyPath(1163, this._sex);
		} else if (path.match(/treasurebox_2\.gr2$/i)) {
			path = DB.getBodyPath(1191, this._sex);
		} else {
			path = DB.getBodyPath(1002, this._sex);
		}
	}

	// Determine if we should suppress head NOW (before async operations)
	const suppress = shouldSuppressHead.call(this);

	// Loading
	Client.loadFile(path + '.act');
	Client.loadFile(
		path + '.spr',
		function () {
			// Check if callback is stale (transformation changed while callback was pending)
			const isStaleCallback = this._transformationSeq && this._transformationSeq > transformationSeq;

			// Get current job considering transformations
			const currentJob = getEffectiveJob.call(this);

			// Only update if callback is valid
			if (!isStaleCallback && job === currentJob) {
				this.files.body.spr = path + '.spr';
				this.files.body.act = path + '.act';

				// Apply head suppression/restoration
				// Apply head suppression/restoration
				refreshHeadState.call(this);
			}

			// Update linked attachments (always update these)
			this.bodypalette = this._bodypalette;
			this.weapon = this._weapon;
			this.shield = this._shield;
		}.bind(this),
		null,
		{
			to_rgba: this.objecttype !== Entity.TYPE_PC
		}
	);

	// Refresh costume
	if (PACKETVER.value > 20141022 && this._body > 0) {
		this.body = this._body;
	}
}

/**
 * Get body value
 * @returns {number} body value
 */
function getBodyVal() {
	let job;
	switch (this._job) {
		case JobConst.DRAGON_KNIGHT:
		case JobConst.DRAGON_KNIGHT_H:
		case JobConst.DRAGON_KNIGHT_B:
		case JobConst.RUNE_KNIGHT:
		case JobConst.RUNE_KNIGHT_H:
		case JobConst.RUNE_KNIGHT_B:
			job = JobConst.RUNE_KNIGHT_2ND;
			break;
		case JobConst.MEISTER:
		case JobConst.MEISTER_H:
		case JobConst.MEISTER_B:
		case JobConst.MECHANIC:
		case JobConst.MECHANIC_H:
		case JobConst.MECHANIC_B:
			job = JobConst.MECHANIC_2ND;
			break;
		case JobConst.SHADOW_CROSS:
		case JobConst.SHADOW_CROSS_H:
		case JobConst.SHADOW_CROSS_B:
		case JobConst.GUILLOTINE_CROSS:
		case JobConst.GUILLOTINE_CROSS_H:
		case JobConst.GUILLOTINE_CROSS_B:
			job = JobConst.GUILLOTINE_CROSS_2ND;
			break;
		case JobConst.ARCH_MAGE:
		case JobConst.ARCH_MAGE_H:
		case JobConst.ARCH_MAGE_B:
		case JobConst.WARLOCK:
		case JobConst.WARLOCK_H:
		case JobConst.WARLOCK_B:
			job = JobConst.WARLOCK_2ND;
			break;
		case JobConst.CARDINAL:
		case JobConst.CARDINAL_H:
		case JobConst.CARDINAL_B:
		case JobConst.ARCHBISHOP:
		case JobConst.ARCHBISHOP_H:
		case JobConst.ARCHBISHOP_B:
			job = JobConst.ARCH_BISHOP_2ND;
			break;
		case JobConst.WINDHAWK:
		case JobConst.WINDHAWK_H:
		case JobConst.WINDHAWK_B:
		case JobConst.RANGER:
		case JobConst.RANGER_H:
		case JobConst.RANGER_B:
			job = JobConst.RANGER_2ND;
			break;
		case JobConst.IMPERIAL_GUARD:
		case JobConst.IMPERIAL_GUARD_H:
		case JobConst.IMPERIAL_GUARD_B:
		case JobConst.ROYAL_GUARD:
		case JobConst.ROYAL_GUARD_H:
		case JobConst.ROYAL_GUARD_B:
			job = JobConst.ROYAL_GUARD_2ND;
			break;
		case JobConst.BIOLO:
		case JobConst.BIOLO_H:
		case JobConst.BIOLO_B:
		case JobConst.GENETIC:
		case JobConst.GENETIC_H:
		case JobConst.GENETIC_B:
			job = JobConst.GENETIC_2ND;
			break;
		case JobConst.ABYSS_CHASER:
		case JobConst.ABYSS_CHASER_H:
		case JobConst.ABYSS_CHASER_B:
		case JobConst.SHADOW_CHASER:
		case JobConst.SHADOW_CHASER_H:
		case JobConst.SHADOW_CHASER_B:
			job = JobConst.SHADOW_CHASER_2ND;
			break;
		case JobConst.ELEMENTAL_MASTER:
		case JobConst.ELEMENTAL_MASTER_H:
		case JobConst.ELEMENTAL_MASTER_B:
		case JobConst.SORCERER:
		case JobConst.SORCERER_H:
		case JobConst.SORCERER_B:
			job = JobConst.SORCERER_2ND;
			break;
		case JobConst.INQUISITOR:
		case JobConst.INQUISITOR_H:
		case JobConst.INQUISITOR_B:
		case JobConst.SURA:
		case JobConst.SURA_H:
		case JobConst.SURA_B:
			job = JobConst.SURA_2ND;
			break;
		case JobConst.TROUBADOUR:
		case JobConst.TROUBADOUR_H:
		case JobConst.TROUBADOUR_B:
		case JobConst.MINSTREL:
		case JobConst.MINSTREL_H:
		case JobConst.MINSTREL_B:
			job = JobConst.MINSTREL_2ND;
			break;
		case JobConst.TROUVERE:
		case JobConst.TROUVERE_H:
		case JobConst.TROUVERE_B:
		case JobConst.WANDERER:
		case JobConst.WANDERER_H:
		case JobConst.WANDERER_B:
			job = JobConst.WANDERER_2ND;
			break;
	}
	return job || this._job;
}

/**
 * Updating BodyStyle
 *
 * @param {number} Body2 id
 */
function UpdateBodyStyle(look) {
	let path;
	let Entity;

	if (look < 0) {
		return;
	}

	setTimeout(
		function () {
			this._body = look;
			let job = this._job;
			let cashMountCostume = false;
			if (PACKETVER.value <= 20231220) {
				if (look > 0) {
					look = getBodyVal();
				}
			}

			if (this.costume) {
				const mountValue = this._allRidingState ? AllMountTable[look] : MountTable[look];
				if (
					look > JobConst.COSTUME_SECOND_JOB_START &&
					look < JobConst.COSTUME_SECOND_JOB_END &&
					this._allRidingState
				) {
					// we don't have costume all_riding constants
					job = mountValue;
					cashMountCostume = true;
				} else {
					look = mountValue;
					job = this.costume;
				}
			}

			path = this.isAdmin ? DB.getAdminPath(this._sex) : DB.getBodyPath(job, this._sex, look, cashMountCostume);
			Entity = this.constructor;

			// Loading
			Client.loadFile(path + '.act');
			Client.loadFile(
				path + '.spr',
				function () {
					this.files.body.spr = path + '.spr';
					this.files.body.act = path + '.act';

					// Update linked attachments
					this.bodypalette = this._bodypalette;
					this.weapon = this._weapon;
					this.shield = this._shield;
				}.bind(this),
				null,
				{
					to_rgba: this.objecttype !== Entity.TYPE_PC
				}
			);
		}.bind(this),
		50
	);
}

/**
 * Update body palette
 *
 * @param {number} body palette number
 */
function UpdateBodyPalette(pal) {
	this._bodypalette = pal;

	// Internal palette
	if (pal <= 0) {
		this.files.body.pal = null;
		return;
	}

	// Wait body to be loaded
	if (this._job === -1) {
		return;
	}

	this.files.body.pal = DB.getBodyPalPath(this._job, this._bodypalette, this._sex);
}

/**
 * Update head
 *
 * @param {number} head index
 */
function UpdateHead(head) {
	let path;

	if (head < 0) {
		return;
	}

	this._head = head;
	path = DB.getHeadPath(head, this.job, this._sex, this.isOrcish);

	Client.loadFile(path + '.act');
	Client.loadFile(
		path + '.spr',
		function () {
			// Don't apply the head sprite if it should be suppressed
			if (!shouldSuppressHead.call(this)) {
				this.files.head.spr = path + '.spr';
				this.files.head.act = path + '.act';
				this.files.head.pal = null;
			}
			this.headpalette = this._headpalette;
		}.bind(this)
	);
}

/**
 * Update head palette
 *
 * @param {number} palette id
 */
function UpdateHeadPalette(pal) {
	this._headpalette = pal;

	// Using internal palette stored in sprite
	if (pal <= 0) {
		this.files.head.pal = null;
		return;
	}

	// Wait head to load before
	if (this._head === -1) {
		return;
	}
	this.files.head.pal = DB.getHeadPalPath(this._head, this._headpalette, this.job, this._sex);
}

/**
 * Update Generic function to load hats, weapons and shields
 *
 * @param {string} type - weapon / shield / etc
 * @param {string} method from DB to get path
 * @param {function} callback if fail
 */
function UpdateGeneric(type, func, fallback) {
	return function (val) {
		let path;
		const _this = this;
		let _val = val;

		// Nothing to load
		if (val <= 0) {
			this['_' + type] = 0;
			return;
		}

		// Find file path
		switch (type) {
			case 'weapon':
			case 'shield':
			case 'robe':
				path = DB[func](val, this.job, this._sex);
				break;

			default:
				path = DB[func](val, this._sex);
				break;
		}

		// No path found, remove current files used
		if (!path) {
			this.files[type].spr = null;
			this.files[type].act = null;
			this.files[type].pal = null;

			// Load weapon sound
			if (type === 'weapon') {
				this.sound.attackFile = DB.getWeaponSound(val);
			}

			return;
		}

		function LoadView(path, final) {
			Client.loadFile(path + '.act');
			Client.loadFile(
				path + '.spr',
				function () {
					_this['_' + type] = _val;

					// Head accessories should not be applied if they should be suppressed
					const isAccessory = type === 'accessory' || type === 'accessory2' || type === 'accessory3';

					if (!isAccessory || !shouldSuppressHead.call(_this)) {
						_this.files[type].spr = path + '.spr';
						_this.files[type].act = path + '.act';
					}

					// Load weapon sound
					if (type === 'weapon') {
						_this.attackFile = DB.getWeaponSound(_val);

						//Load weapon trail effect
						const trail_file = DB.getWeaponTrail(_val, _this.job, _this._sex);
						if (trail_file) {
							Client.loadFile(trail_file + '.act');
							Client.loadFile(trail_file + '.spr', function () {
								_this.files['weapon_trail'].spr = trail_file + '.spr';
								_this.files['weapon_trail'].act = trail_file + '.act';
							});
						}
					}
				},

				// if weapon isn't loaded, try to load the default sprite for the weapon type
				function () {
					if (fallback && !final) {
						_val = DB[fallback](val);
						path = DB[func](_val, _this.job, _this._sex);
						if (path) {
							LoadView(path, true);
						}
					}

					// The generic just used : weapon, shield, accessory.
					// This sprites don't use external palettes, so compile it now to rgba.
				},
				{ to_rgba: true }
			);
		}

		// Start loading view
		LoadView(path);
	};
}

/**
 * Unified transformation handler - Optimized (Shared across entities)
 */
function onTransformationChange() {
	this._transformationSeq++;

	// Cache effective job
	const oldEffectiveJob = this._effectiveJob;
	this._effectiveJob = getEffectiveJob.call(this);

	// Only trigger UpdateBody if job actually changed
	if (this._effectiveJob && (this._effectiveJob !== oldEffectiveJob || !this.files.body.spr)) {
		UpdateBody.call(this, this._effectiveJob);
	}

	// Immediate suppression/restoration for UI responsiveness
	refreshHeadState.call(this);
}

/**
 * Hooking, export
 */
export default function Init() {
	this.files = new View();

	Object.defineProperty(this, 'sex', {
		get: function () {
			return this._sex;
		},
		set: UpdateSex
	});

	Object.defineProperty(this, 'job', {
		get: function () {
			return this._effectiveJob;
		},
		set: UpdateBody
	});

	this._body = this._job;
	Object.defineProperty(this, 'body', {
		get: function () {
			return this._body;
		},
		set: UpdateBodyStyle
	});

	Object.defineProperty(this, 'bodypalette', {
		get: function () {
			return this._bodypalette;
		},
		set: UpdateBodyPalette
	});

	Object.defineProperty(this, 'head', {
		get: function () {
			return this._head;
		},
		set: UpdateHead
	});

	Object.defineProperty(this, 'headpalette', {
		get: function () {
			return this._headpalette;
		},
		set: UpdateHeadPalette
	});

	Object.defineProperty(this, 'weapon', {
		get: function () {
			return this._weapon;
		},
		set: UpdateGeneric('weapon', 'getWeaponPath', 'getWeaponViewID')
	});

	Object.defineProperty(this, 'shield', {
		get: function () {
			return this._shield;
		},
		set: UpdateGeneric('shield', 'getShieldPath')
	});

	Object.defineProperty(this, 'accessory', {
		get: function () {
			return this._accessory;
		},
		set: UpdateGeneric('accessory', 'getHatPath')
	});

	Object.defineProperty(this, 'accessory2', {
		get: function () {
			return this._accessory2;
		},
		set: UpdateGeneric('accessory2', 'getHatPath')
	});

	Object.defineProperty(this, 'accessory3', {
		get: function () {
			return this._accessory3;
		},
		set: UpdateGeneric('accessory3', 'getHatPath')
	});

	Object.defineProperty(this, 'robe', {
		get: function () {
			return this._robe;
		},
		set: UpdateGeneric('robe', 'getRobePath')
	});

	// Initialize transformation properties
	this._monster_transform = null;
	this._active_monster_transform = null;
	this._job_transform = null;
	this._transformationSeq = 0;
	this._effectiveJob = this._job;

	const _this = this;

	// Transformation properties - consolidated setter logic
	function createTransformationProperty(name) {
		Object.defineProperty(_this, name, {
			get: function () {
				return _this['_' + name] || null;
			},
			set: function (value) {
				const oldValue = _this['_' + name];
				if (value !== oldValue) {
					_this['_' + name] = value;
					onTransformationChange.call(_this);
				}
			}
		});
	}

	createTransformationProperty('monster_transform');
	createTransformationProperty('active_monster_transform');
	createTransformationProperty('job_transform');
}
