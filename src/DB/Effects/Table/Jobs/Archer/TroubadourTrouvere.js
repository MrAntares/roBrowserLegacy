/**
 * @module DB/Effects/Table/Jobs/Archer/TroubadourTrouvere
 *
 * The Archer line's TroubadourTrouvere effects: its named ef_<skill prefix>_* rows and the named
 * rows only its skills use. DB/Effects/EffectTable.js joins the parts; its header lists the
 * parameters a row takes. Keep a skill's rows together.
 */

export default {
	// Mystic Symphony (TR_MYSTIC_SYMPHONY), from the client's own effect folders.
	ef_tr_mystic_symphony: [
		{
			type: 'STR',
			file: 'mysticsymphony/mysticsymphony/mysticsymphony',
			texturePath: 'mysticsymphony/mysticsymphony/',
			min: 'mysticsymphony/mysticsymphony/min_mysticsymphony',
			wav: 'effect/tr_mystic_symphony'
		}
	],

	// Mystic Symphony (TR_MYSTIC_SYMPHONY), from the client's own effect folders.
	ef_tr_mystic_symphony_cast: [
		{
			type: 'STR',
			file: 'mysticsymphony/mysticsymphony_cast/mysticsymphony_cast',
			texturePath: 'mysticsymphony/mysticsymphony_cast/',
			min: 'mysticsymphony/mysticsymphony_cast/min_mysticsymphony_cast'
		}
	],

	// Kvasir Sonata (TR_KVASIR_SONATA), from the client's own effect folders.
	ef_tr_kvasir_sonata: [
		{
			type: 'STR',
			file: '4tr_kvasirsonata/kvasirsonata/kvasirsonata',
			texturePath: '4tr_kvasirsonata/kvasirsonata/',
			min: '4tr_kvasirsonata/kvasirsonata/min_kvasirsonata',
			wav: 'effect/tr_kvasir_sonata'
		}
	],

	// Kvasir Sonata (TR_KVASIR_SONATA), from the client's own effect folders.
	ef_tr_kvasir_sonata_cast: [
		{
			type: 'STR',
			file: '4tr_kvasirsonata/kvasirsonata_cast/kvasirsonata_cast',
			texturePath: '4tr_kvasirsonata/kvasirsonata_cast/',
			min: '4tr_kvasirsonata/kvasirsonata_cast/min_kvasirsonata_cast'
		},
		{
			type: 'STR',
			file: '4tr_kvasirsonata/kvasirsonata_cast_bottom/kvasirsonata_cast_bottom',
			texturePath: '4tr_kvasirsonata/kvasirsonata_cast_bottom/',
			min: '4tr_kvasirsonata/kvasirsonata_cast_bottom/min_kvasirsonata_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Rose Blossom (TR_ROSEBLOSSOM), from the client's own effect folders.
	ef_tr_roseblossom_cast: [
		{
			type: 'STR',
			file: 'roseblossom/roseblossom_cast/roseblossom_cast',
			texturePath: 'roseblossom/roseblossom_cast/',
			min: 'roseblossom/roseblossom_cast/min_roseblossom_cast'
		},
		{
			type: 'STR',
			file: 'roseblossom/roseblossom_cast_bottom/roseblossom_cast_bottom',
			texturePath: 'roseblossom/roseblossom_cast_bottom/',
			min: 'roseblossom/roseblossom_cast_bottom/min_roseblossom_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Rose Blossom (TR_ROSEBLOSSOM), from the client's own effect folders.
	ef_tr_roseblossom_hit: [
		{
			type: 'STR',
			file: 'roseblossom/roseblossom_hit/roseblossom_hit',
			texturePath: 'roseblossom/roseblossom_hit/',
			min: 'roseblossom/roseblossom_hit/min_roseblossom_hit'
		}
	],

	// Rose Blossom Attack (TR_ROSEBLOSSOM_ATK), from the client's own effect folders.
	ef_tr_roseblossom_atk: [
		{
			type: 'STR',
			file: 'roseblossom/roseblossom_hit/roseblossom_hit',
			texturePath: 'roseblossom/roseblossom_hit/',
			min: 'roseblossom/roseblossom_hit/min_roseblossom_hit'
		}
	],

	// Rhythm Shooting (TR_RHYTHMSHOOTING), from the client's own effect folders.
	ef_tr_rhythmshooting_cast: [
		{
			type: 'STR',
			file: 'rhythmshooting/rhythmshooting_cast/rhythmshooting_cast',
			texturePath: 'rhythmshooting/rhythmshooting_cast/',
			min: 'rhythmshooting/rhythmshooting_cast/min_rhythmshooting_cast',
			wav: 'effect/tr_rhythmshooting'
		},
		{
			type: 'STR',
			file: 'rhythmshooting/rhythmshooting_cast_bottom/rhythmshooting_cast_bottom',
			texturePath: 'rhythmshooting/rhythmshooting_cast_bottom/',
			min: 'rhythmshooting/rhythmshooting_cast_bottom/min_rhythmshooting_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Rhythm Shooting (TR_RHYTHMSHOOTING), from the client's own effect folders.
	ef_tr_rhythmshooting_hit: [
		{
			type: 'STR',
			file: 'rhythmshooting/rhythmshooting_hit/rhythmshooting_hit',
			texturePath: 'rhythmshooting/rhythmshooting_hit/',
			min: 'rhythmshooting/rhythmshooting_hit/min_rhythmshooting_hit'
		}
	],

	// Metallic Fury (TR_METALIC_FURY), from the client's own effect folders.
	ef_tr_metalic_fury: [
		{
			type: 'STR',
			file: 'metalicfury/metalicfury/metalicfury',
			texturePath: 'metalicfury/metalicfury/',
			min: 'metalicfury/metalicfury/min_metalicfury',
			wav: 'effect/tr_metalic_fury'
		}
	],

	// Sound Blend (TR_SOUNDBLEND), from the client's own effect folders.
	ef_tr_soundblend: [
		{
			type: 'STR',
			file: 'soundblend/soundblend/soundblend',
			texturePath: 'soundblend/soundblend/',
			min: 'soundblend/soundblend/min_soundblend'
		}
	],

	// Sound Blend (TR_SOUNDBLEND), from the client's own effect folders.
	ef_tr_soundblend_cast: [
		{
			type: 'STR',
			file: 'soundblend/soundblend_cast/soundblend_cast',
			texturePath: 'soundblend/soundblend_cast/',
			min: 'soundblend/soundblend_cast/min_soundblend_cast'
		},
		{
			type: 'STR',
			file: 'soundblend/soundblend_cast_bottom/soundblend_cast_bottom',
			texturePath: 'soundblend/soundblend_cast_bottom/',
			min: 'soundblend/soundblend_cast_bottom/min_soundblend_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Geffenia Nocturn (TR_GEF_NOCTURN), from the client's own effect folders.
	ef_tr_gef_nocturn: [
		{
			type: 'STR',
			file: 'gef_nocturn/gef_nocturn/gef_nocturn',
			texturePath: 'gef_nocturn/gef_nocturn/',
			min: 'gef_nocturn/gef_nocturn/min_gef_nocturn',
			wav: 'effect/tr_gef_nocturn'
		}
	],

	// Geffenia Nocturn (TR_GEF_NOCTURN), from the client's own effect folders.
	ef_tr_gef_nocturn_cast: [
		{
			type: 'STR',
			file: 'gef_nocturn/gef_nocturn_cast/gef_nocturn_cast',
			texturePath: 'gef_nocturn/gef_nocturn_cast/',
			min: 'gef_nocturn/gef_nocturn_cast/min_gef_nocturn_cast'
		},
		{
			type: 'STR',
			file: 'gef_nocturn/gef_nocturn_cast_bottom/gef_nocturn_cast_bottom',
			texturePath: 'gef_nocturn/gef_nocturn_cast_bottom/',
			min: 'gef_nocturn/gef_nocturn_cast_bottom/min_gef_nocturn_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Roki Capriccio (TR_ROKI_CAPRICCIO), from the client's own effect folders.
	ef_tr_roki_capriccio: [
		{
			type: 'STR',
			file: 'roki_capriccio/roki_capriccio/roki_capriccio',
			texturePath: 'roki_capriccio/roki_capriccio/',
			min: 'roki_capriccio/roki_capriccio/min_roki_capriccio',
			wav: 'effect/tr_roki_capriccio'
		}
	],

	// Roki Capriccio (TR_ROKI_CAPRICCIO), from the client's own effect folders.
	ef_tr_roki_capriccio_cast: [
		{
			type: 'STR',
			file: 'roki_capriccio/roki_capriccio_cast/roki_capriccio_cast',
			texturePath: 'roki_capriccio/roki_capriccio_cast/',
			min: 'roki_capriccio/roki_capriccio_cast/min_roki_capriccio_cast'
		},
		{
			type: 'STR',
			file: 'roki_capriccio/roki_capriccio_cast_bottom/roki_capriccio_cast_bottom',
			texturePath: 'roki_capriccio/roki_capriccio_cast_bottom/',
			min: 'roki_capriccio/roki_capriccio_cast_bottom/min_roki_capriccio_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Ain Rhapsody (TR_AIN_RHAPSODY), from the client's own effect folders.
	ef_tr_ain_rhapsody: [
		{
			type: 'STR',
			file: 'ain_rhapsody/ain_rhapsody/ain_rhapsody',
			texturePath: 'ain_rhapsody/ain_rhapsody/',
			min: 'ain_rhapsody/ain_rhapsody/min_ain_rhapsody',
			wav: 'effect/tr_ain_rhapsody'
		}
	],

	// Ain Rhapsody (TR_AIN_RHAPSODY), from the client's own effect folders.
	ef_tr_ain_rhapsody_cast: [
		{
			type: 'STR',
			file: 'ain_rhapsody/ain_rhapsody_cast/ain_rhapsody_cast',
			texturePath: 'ain_rhapsody/ain_rhapsody_cast/',
			min: 'ain_rhapsody/ain_rhapsody_cast/min_ain_rhapsody_cast'
		}
	],

	// Musical Interlude (TR_MUSICAL_INTERLUDE), from the client's own effect folders.
	ef_tr_musical_interlude: [
		{
			type: 'STR',
			file: 'musical_interlude/musical_interlude/musical_interlude',
			texturePath: 'musical_interlude/musical_interlude/',
			min: 'musical_interlude/musical_interlude/min_musical_interlude',
			wav: 'effect/tr_musical_interlude'
		}
	],

	// Musical Interlude (TR_MUSICAL_INTERLUDE), from the client's own effect folders.
	ef_tr_musical_interlude_cast: [
		{
			type: 'STR',
			file: 'musical_interlude/musical_interlude_cast/musical_interlude_cast',
			texturePath: 'musical_interlude/musical_interlude_cast/',
			min: 'musical_interlude/musical_interlude_cast/min_musical_interlude_cast'
		}
	],

	// Jawaii Serenade (TR_JAWAII_SERENADE), from the client's own effect folders.
	ef_tr_jawaii_serenade: [
		{
			type: 'STR',
			file: 'jawaii_serenade/jawaii_serenade/jawaii_serenade',
			texturePath: 'jawaii_serenade/jawaii_serenade/',
			min: 'jawaii_serenade/jawaii_serenade/min_jawaii_serenade',
			wav: 'effect/tr_jawaii_serenade'
		}
	],

	// Jawaii Serenade (TR_JAWAII_SERENADE), from the client's own effect folders.
	ef_tr_jawaii_serenade_cast: [
		{
			type: 'STR',
			file: 'jawaii_serenade/jawaii_serenade_cast/jawaii_serenade_cast',
			texturePath: 'jawaii_serenade/jawaii_serenade_cast/',
			min: 'jawaii_serenade/jawaii_serenade_cast/min_jawaii_serenade_cast'
		},
		{
			type: 'STR',
			file: 'jawaii_serenade/jawaii_serenade_cast_bottom/jawaii_serenade_cast_bottom',
			texturePath: 'jawaii_serenade/jawaii_serenade_cast_bottom/',
			min: 'jawaii_serenade/jawaii_serenade_cast_bottom/min_jawaii_serenade_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Nipelheim Requiem (TR_NIPELHEIM_REQUIEM), from the client's own effect folders.
	ef_tr_nipelheim_requiem: [
		{
			type: 'STR',
			file: 'nipelheim/nipelheim/nipelheim',
			texturePath: 'nipelheim/nipelheim/',
			min: 'nipelheim/nipelheim/min_nipelheim',
			wav: 'effect/tr_nipelheim_requiem'
		}
	],

	// Nipelheim Requiem (TR_NIPELHEIM_REQUIEM), from the client's own effect folders.
	ef_tr_nipelheim_requiem_cast: [
		{
			type: 'STR',
			file: 'nipelheim/nipelheim_cast/nipelheim_cast',
			texturePath: 'nipelheim/nipelheim_cast/',
			min: 'nipelheim/nipelheim_cast/min_nipelheim_cast'
		}
	],

	// Pron March (TR_PRON_MARCH), from the client's own effect folders.
	ef_tr_pron_march: [
		{
			type: 'STR',
			file: 'pronmarch/pronmarch/pronmarch',
			texturePath: 'pronmarch/pronmarch/',
			min: 'pronmarch/pronmarch/min_pronmarch',
			wav: 'effect/tr_pron_march'
		}
	],

	// Pron March (TR_PRON_MARCH), from the client's own effect folders.
	ef_tr_pron_march_cast: [
		{
			type: 'STR',
			file: 'pronmarch/pronmarch_cast/pronmarch_cast',
			texturePath: 'pronmarch/pronmarch_cast/',
			min: 'pronmarch/pronmarch_cast/min_pronmarch_cast'
		},
		{
			type: 'STR',
			file: 'pronmarch/pronmarch_cast_bottom/pronmarch_cast_bottom',
			texturePath: 'pronmarch/pronmarch_cast_bottom/',
			min: 'pronmarch/pronmarch_cast_bottom/min_pronmarch_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Rhythmical Wave (TR_RHYTHMICAL_WAVE), from the client's own effect folders.
	ef_tr_rhythmical_wave: [
		{
			type: 'STR',
			file: 'troubadour_trouvere/tr_rhythmical_wave/rhythmical_wave/rhythmical_wave',
			texturePath: 'troubadour_trouvere/tr_rhythmical_wave/rhythmical_wave/',
			min: 'troubadour_trouvere/tr_rhythmical_wave/rhythmical_wave/min_rhythmical_wave'
		},
		{
			type: 'STR',
			file: 'troubadour_trouvere/tr_rhythmical_wave/rhythmical_wave_bottom/rhythmical_wave_bottom',
			texturePath: 'troubadour_trouvere/tr_rhythmical_wave/rhythmical_wave_bottom/',
			min: 'troubadour_trouvere/tr_rhythmical_wave/rhythmical_wave_bottom/min_rhythmical_wave_bottom',
			renderBeforeEntities: true
		}
	],

	// Rhythmical Wave (TR_RHYTHMICAL_WAVE), from the client's own effect folders.
	ef_tr_rhythmical_wave_cast: [
		{
			type: 'STR',
			file: 'troubadour_trouvere/tr_rhythmical_wave/rhythmical_wave_cast/rhythmical_wave_cast',
			texturePath: 'troubadour_trouvere/tr_rhythmical_wave/rhythmical_wave_cast/',
			min: 'troubadour_trouvere/tr_rhythmical_wave/rhythmical_wave_cast/min_rhythmical_wave_cast'
		},
		{
			type: 'STR',
			file: 'troubadour_trouvere/tr_rhythmical_wave/rhythmical_wave_cast_bottom/rhythmical_wave_cast_bottom',
			texturePath: 'troubadour_trouvere/tr_rhythmical_wave/rhythmical_wave_cast_bottom/',
			min: 'troubadour_trouvere/tr_rhythmical_wave/rhythmical_wave_cast_bottom/min_rhythmical_wave_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Rhythmical Wave (TR_RHYTHMICAL_WAVE), from the client's own effect folders.
	ef_tr_rhythmical_wave_hit: [
		{
			type: 'STR',
			file: 'troubadour_trouvere/tr_rhythmical_wave/rhythmical_wave_hit/rhythmical_wave_hit',
			texturePath: 'troubadour_trouvere/tr_rhythmical_wave/rhythmical_wave_hit/',
			min: 'troubadour_trouvere/tr_rhythmical_wave/rhythmical_wave_hit/min_rhythmical_wave_hit'
		}
	]
};
