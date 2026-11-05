/**
 * @module DB/Effects/Table/Jobs/Swordman/Knight
 *
 * The Swordman line's Knight effects: its named ef_<skill prefix>_* rows and the named
 * rows only its skills use. DB/Effects/EffectTable.js joins the parts; its header lists the
 * parameters a row takes. Keep a skill's rows together.
 */

export default {
	ef_spear_projectile: [
		{
			type: '3D',
			alphaMax: 1,
			angle: 180,
			attachedEntity: true,
			duration: 140,
			fadeIn: true,
			fadeOut: true,
			spriteName: '\xc3\xa2',
			playSprite: true,
			toSrc: true,
			rotateToTarget: true,
			rotateWithCamera: true,
			size: 100,
			zOffset: 1,
			zIndex: 1
		}
	]
};
