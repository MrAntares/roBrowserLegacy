/**
 * Renderer/Entity/Player.js
 *
 * Player class — represents the locally controlled character.
 * Extends Entity, adding properties specific to the current player
 * that are not already handled by Entity or its mixins.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 */

import Entity from 'Renderer/Entity/Entity.js';

/**
 * Player class
 *
 * Specialisation of Entity for the local player character.
 * Session.player is always an instance of this class.
 * Session.players[CharNum] holds all received character slots.
 */
class Player extends Entity {
	constructor(data) {
		super(data);
	}
}

/**
 * Player data fields — declared on the prototype intentionally.
 *
 * These MUST stay on Player.prototype (not as ES2022 class fields)
 * for the same reason as Entity.prototype fields: Entity.set() uses
 * Entity.prototype.hasOwnProperty(key) as a whitelist gate for
 * auto-syncing server-packet keys. Player.prototype fields participate
 * in this gate via the prototype chain.
 *
 * Properties already provided by Entity.prototype or its mixins are
 * intentionally NOT repeated here:
 *   - clevel (base level)         → Entity.prototype
 *   - display.name (entity name)  → EntityDisplay mixin
 *   - GID, AID, objecttype        → Entity.prototype
 *   - job/sex/head/weapon/shield  → EntityView mixin (getters/setters)
 *   - _effectState, _bodyState    → EntityState / Entity.prototype
 *   - life.hp/sp/ap               → EntityLife mixin
 *   - walk.speed                  → EntityWalk mixin
 *   - attack_range, honor, etc.   → Entity.prototype
 */

// ── Character identity ────────────────────────────────────────────
// clevel (base level) is already on Entity.prototype — not duplicated.
Player.prototype.joblevel = 0; // StatusProperty.JOBLEVEL

// ── Economy ──────────────────────────────────────────────────────
Player.prototype.money = 0; // StatusProperty.MONEY (zeny)
Player.prototype.weight = 0; // StatusProperty.WEIGHT
Player.prototype.max_weight = 0; // StatusProperty.MAXWEIGHT

// ── Experience ───────────────────────────────────────────────────
Player.prototype.base_exp = 0; // StatusProperty.EXP
Player.prototype.base_exp_next = 0; // StatusProperty.MAXEXP
Player.prototype.job_exp = 0; // StatusProperty.JOBEXP
Player.prototype.job_exp_next = 0; // StatusProperty.MAXJOBEXP

// ── Points ───────────────────────────────────────────────────────
Player.prototype.statuspoint = 0; // StatusProperty.POINT
Player.prototype.skpoint = 0; // StatusProperty.SKPOINT
Player.prototype.traitpoint = 0; // StatusProperty.VAR_SP_TRAITPOINT

// ── Base stats (base value + equipment/buff bonus stored separately)
Player.prototype.str = 0;
Player.prototype.plusStr = 0; // StatusProperty.STR (bonus)
Player.prototype.agi = 0;
Player.prototype.plusAgi = 0; // StatusProperty.AGI (bonus)
Player.prototype.vit = 0;
Player.prototype.plusVit = 0; // StatusProperty.VIT (bonus)
Player.prototype.int = 0;
Player.prototype.plusInt = 0; // StatusProperty.INT (bonus)
Player.prototype.dex = 0;
Player.prototype.plusDex = 0; // StatusProperty.DEX (bonus)
Player.prototype.luk = 0;
Player.prototype.plusLuk = 0; // StatusProperty.LUK (bonus)

// ── 4th-job / Expanded stats ─────────────────────────────────────
Player.prototype.pow = 0;
Player.prototype.plusPow = 0; // StatusProperty.VAR_SP_POW
Player.prototype.sta = 0;
Player.prototype.plusSta = 0; // StatusProperty.VAR_SP_STA
Player.prototype.wis = 0;
Player.prototype.plusWis = 0; // StatusProperty.VAR_SP_WIS
Player.prototype.spl = 0;
Player.prototype.plusSpl = 0; // StatusProperty.VAR_SP_SPL
Player.prototype.con = 0;
Player.prototype.plusCon = 0; // StatusProperty.VAR_SP_CON
Player.prototype.crt = 0;
Player.prototype.plusCrt = 0; // StatusProperty.VAR_SP_CRT

// ── Misc player-only flags ────────────────────────────────────────
Player.prototype.intravision = false; // toggled by PACKET.ZC.STATE_CHANGE3 (GM invisibility)

/**
 * Export
 */
export default Player;
