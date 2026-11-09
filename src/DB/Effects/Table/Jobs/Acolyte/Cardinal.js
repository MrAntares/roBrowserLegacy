/**
 * @module DB/Effects/Table/Jobs/Acolyte/Cardinal
 *
 * The Acolyte line's Cardinal effects: its named ef_<skill prefix>_* rows and the named
 * rows only its skills use. DB/Effects/EffectTable.js joins the parts; its header lists the
 * parameters a row takes. Keep a skill's rows together.
 */

export default {
	// Reparatio (CD_REPARATIO), from the client's own effect folders.
	ef_cd_reparatio: [
		{
			type: 'STR',
			file: 'new_reparatio/new_reparatio/new_reparatio',
			texturePath: 'new_reparatio/new_reparatio/',
			min: 'new_reparatio/new_reparatio/min_new_reparatio'
		},
		{
			type: 'STR',
			file: 'new_reparatio/new_reparatio_bottom/new_reparatio_bottom',
			texturePath: 'new_reparatio/new_reparatio_bottom/',
			min: 'new_reparatio/new_reparatio_bottom/min_new_reparatio_bottom',
			renderBeforeEntities: true
		}
	],

	// Reparatio (CD_REPARATIO), from the client's own effect folders.
	ef_cd_reparatio_cast: [
		{
			type: 'STR',
			file: 'new_reparatio/new_reparatio_cast/new_reparatio_cast',
			texturePath: 'new_reparatio/new_reparatio_cast/',
			min: 'new_reparatio/new_reparatio_cast/min_new_reparatio_cast'
		},
		{
			type: 'STR',
			file: 'new_reparatio/new_reparatio_cast_bottom/new_reparatio_cast_bottom',
			texturePath: 'new_reparatio/new_reparatio_cast_bottom/',
			min: 'new_reparatio/new_reparatio_cast_bottom/min_new_reparatio_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Mediale Votum (CD_MEDIALE_VOTUM), from the client's own effect folders.
	ef_cd_mediale_votum: [
		{
			type: 'STR',
			file: 'medialevotum/medialevotum/medialevotum',
			texturePath: 'medialevotum/medialevotum/',
			min: 'medialevotum/medialevotum/min_medialevotum',
			wav: 'effect/cd_mediale_votum'
		}
	],

	// Mediale Votum (CD_MEDIALE_VOTUM), from the client's own effect folders.
	ef_cd_mediale_votum_cast: [
		{
			type: 'STR',
			file: 'medialevotum/medialevotum_cast/medialevotum_cast',
			texturePath: 'medialevotum/medialevotum_cast/',
			min: 'medialevotum/medialevotum_cast/min_medialevotum_cast'
		}
	],

	// Argutus Vita (CD_ARGUTUS_VITA), from the client's own effect folders.
	ef_cd_argutus_vita: [
		{
			type: 'STR',
			file: 'argutusvita/argutusvita/argutusvita',
			texturePath: 'argutusvita/argutusvita/',
			min: 'argutusvita/argutusvita/min_argutusvita',
			wav: 'effect/cd_argutus_vita'
		}
	],

	// Argutus Vita (CD_ARGUTUS_VITA), from the client's own effect folders.
	ef_cd_argutus_vita_cast: [
		{
			type: 'STR',
			file: 'argutusvita/argutusvita_cast/argutusvita_cast',
			texturePath: 'argutusvita/argutusvita_cast/',
			min: 'argutusvita/argutusvita_cast/min_argutusvita_cast'
		}
	],

	// Argutus Telum (CD_ARGUTUS_TELUM), from the client's own effect folders.
	ef_cd_argutus_telum: [
		{
			type: 'STR',
			file: 'argutustelum/argutustelum/argutustelum',
			texturePath: 'argutustelum/argutustelum/',
			min: 'argutustelum/argutustelum/min_argutustelum'
		}
	],

	// Argutus Telum (CD_ARGUTUS_TELUM), from the client's own effect folders.
	ef_cd_argutus_telum_cast: [
		{
			type: 'STR',
			file: 'argutustelum/argutustelum_cast/argutustelum_cast',
			texturePath: 'argutustelum/argutustelum_cast/',
			min: 'argutustelum/argutustelum_cast/min_argutustelum_cast'
		}
	],

	// Arbitrium (CD_ARBITRIUM), from the client's own effect folders.
	ef_cd_arbitrium: [
		{
			type: 'STR',
			file: 'arbitrium/arbitrium/arbitrium',
			texturePath: 'arbitrium/arbitrium/',
			min: 'arbitrium/arbitrium/min_arbitrium',
			wav: 'effect/cd_arbitrium'
		},
		{
			type: 'STR',
			file: 'arbitrium/arbitrium_bottom/arbitrium_bottom',
			texturePath: 'arbitrium/arbitrium_bottom/',
			min: 'arbitrium/arbitrium_bottom/min_arbitrium_bottom',
			renderBeforeEntities: true
		}
	],

	// Arbitrium (CD_ARBITRIUM), from the client's own effect folders.
	ef_cd_arbitrium_cast: [
		{
			type: 'STR',
			file: 'arbitrium/arbitrium_cast/arbitrium_cast',
			texturePath: 'arbitrium/arbitrium_cast/',
			min: 'arbitrium/arbitrium_cast/min_arbitrium_cast'
		},
		{
			type: 'STR',
			file: 'arbitrium/arbitrium_cast_bottom/arbitrium_cast_bottom',
			texturePath: 'arbitrium/arbitrium_cast_bottom/',
			min: 'arbitrium/arbitrium_cast_bottom/min_arbitrium_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Arbitrium (CD_ARBITRIUM), from the client's own effect folders.
	ef_cd_arbitrium_hit: [
		{
			type: 'STR',
			file: 'arbitrium/arbitrium_hit/arbitrium_hit',
			texturePath: 'arbitrium/arbitrium_hit/',
			min: 'arbitrium/arbitrium_hit/min_arbitrium_hit'
		}
	],

	// Arbitrium Attack (CD_ARBITRIUM_ATK), from the client's own effect folders.
	ef_cd_arbitrium_atk: [
		{
			type: 'STR',
			file: 'arbitrium/arbitrium_hit/arbitrium_hit',
			texturePath: 'arbitrium/arbitrium_hit/',
			min: 'arbitrium/arbitrium_hit/min_arbitrium_hit'
		}
	],

	// Presens Acies (CD_PRESENS_ACIES), from the client's own effect folders.
	ef_cd_presens_acies: [
		{
			type: 'STR',
			file: 'presensacies/presensacies/presensacies',
			texturePath: 'presensacies/presensacies/',
			min: 'presensacies/presensacies/min_presensacies',
			wav: 'effect/cd_presens_acies'
		}
	],

	// Presens Acies (CD_PRESENS_ACIES), from the client's own effect folders.
	ef_cd_presens_acies_cast: [
		{
			type: 'STR',
			file: 'presensacies/presensacies_cast/presensacies_cast',
			texturePath: 'presensacies/presensacies_cast/',
			min: 'presensacies/presensacies_cast/min_presensacies_cast'
		}
	],

	// Effligo (CD_EFFLIGO), from the client's own effect folders.
	ef_cd_effligo: [
		{
			type: 'STR',
			file: 'effligo/effligo/effligo',
			texturePath: 'effligo/effligo/',
			min: 'effligo/effligo/min_effligo',
			wav: 'effect/cd_effligo'
		},
		{
			type: 'STR',
			file: 'effligo/effligo_bottom/effligo_bottom',
			texturePath: 'effligo/effligo_bottom/',
			min: 'effligo/effligo_bottom/min_effligo_bottom',
			renderBeforeEntities: true
		}
	],

	// Effligo (CD_EFFLIGO), from the client's own effect folders.
	ef_cd_effligo_hit: [
		{
			type: 'STR',
			file: 'effligo/effligo_hit/effligo_hit',
			texturePath: 'effligo/effligo_hit/',
			min: 'effligo/effligo_hit/min_effligo_hit'
		}
	],

	// Competentia (CD_COMPETENTIA), from the client's own effect folders.
	ef_cd_competentia: [
		{
			type: 'STR',
			file: 'competentia/competentia/competentia',
			texturePath: 'competentia/competentia/',
			min: 'competentia/competentia/min_competentia',
			wav: 'effect/cd_competentia'
		},
		{
			type: 'STR',
			file: 'competentia/competentia_bottom/competentia_bottom',
			texturePath: 'competentia/competentia_bottom/',
			min: 'competentia/competentia_bottom/min_competentia_bottom',
			renderBeforeEntities: true
		}
	],

	// Competentia (CD_COMPETENTIA), from the client's own effect folders.
	ef_cd_competentia_cast: [
		{
			type: 'STR',
			file: 'competentia/competentia_cast/competentia_cast',
			texturePath: 'competentia/competentia_cast/'
		}
	],

	// Pneumaticus Procella (CD_PNEUMATICUS_PROCELLA), from the client's own effect folders.
	ef_cd_pneumaticus_procella: [
		{
			type: 'STR',
			file: 'new_pneumaticusprocella/new_pneumaticusprocella/new_pneumaticusprocella',
			texturePath: 'new_pneumaticusprocella/new_pneumaticusprocella/',
			wav: 'effect/cd_pneumaticus_procella'
		}
	],

	// Pneumaticus Procella (CD_PNEUMATICUS_PROCELLA), from the client's own effect folders.
	ef_cd_pneumaticus_procella_cast: [
		{
			type: 'STR',
			file: 'new_pneumaticusprocella/new_pneumaticusprocella_cast/new_pneumaticusprocella_cast',
			texturePath: 'new_pneumaticusprocella/new_pneumaticusprocella_cast/'
		}
	],

	// Dilectio Heal (CD_DILECTIO_HEAL), from the client's own effect folders.
	ef_cd_dilectio_heal: [
		{
			type: 'STR',
			file: 'new_dilectioheal/new_dilectioheal/new_dilectioheal',
			texturePath: 'new_dilectioheal/new_dilectioheal/',
			min: 'new_dilectioheal/new_dilectioheal/min_new_dilectioheal',
			wav: 'effect/cd_dilectio_heal'
		}
	],

	// Dilectio Heal (CD_DILECTIO_HEAL), from the client's own effect folders.
	ef_cd_dilectio_heal_cast: [
		{
			type: 'STR',
			file: 'new_dilectioheal/new_dilectioheal_cast/new_dilectioheal_cast',
			texturePath: 'new_dilectioheal/new_dilectioheal_cast/',
			min: 'new_dilectioheal/new_dilectioheal_cast/min_new_dilectioheal_cast'
		},
		{
			type: 'STR',
			file: 'new_dilectioheal/new_dilectioheal_cast_bottom/new_dilectioheal_cast_bottom',
			texturePath: 'new_dilectioheal/new_dilectioheal_cast_bottom/',
			min: 'new_dilectioheal/new_dilectioheal_cast_bottom/min_new_dilectioheal_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Religio (CD_RELIGIO), from the client's own effect folders.
	ef_cd_religio: [
		{
			type: 'STR',
			file: 'religio/religio/religio',
			texturePath: 'religio/religio/',
			min: 'religio/religio/min_religio',
			wav: 'effect/cd_religio'
		}
	],

	// Religio (CD_RELIGIO), from the client's own effect folders.
	ef_cd_religio_cast: [
		{
			type: 'STR',
			file: 'religio/religio_cast/religio_cast',
			texturePath: 'religio/religio_cast/',
			min: 'religio/religio_cast/min_religio_cast'
		}
	],

	// Benedictum (CD_BENEDICTUM), from the client's own effect folders.
	ef_cd_benedictum: [
		{
			type: 'STR',
			file: 'benedictum/benedictum/benedictum',
			texturePath: 'benedictum/benedictum/',
			min: 'benedictum/benedictum/min_benedictum',
			wav: 'effect/cd_benedictum'
		}
	],

	// Benedictum (CD_BENEDICTUM), from the client's own effect folders.
	ef_cd_benedictum_cast: [
		{
			type: 'STR',
			file: 'benedictum/benedictum_cast/benedictum_cast',
			texturePath: 'benedictum/benedictum_cast/',
			min: 'benedictum/benedictum_cast/min_benedictum_cast'
		},
		{
			type: 'STR',
			file: 'benedictum/benedictum_cast_bottom/benedictum_cast_bottom',
			texturePath: 'benedictum/benedictum_cast_bottom/',
			min: 'benedictum/benedictum_cast_bottom/min_benedictum_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Petitio (CD_PETITIO), from the client's own effect folders.
	ef_cd_petitio: [
		{
			type: 'STR',
			file: 'petitio/petitio/petitio',
			texturePath: 'petitio/petitio/',
			min: 'petitio/petitio/min_petitio',
			wav: 'effect/cd_petitio'
		},
		{
			type: 'STR',
			file: 'petitio/petitio_bottom/petitio_bottom',
			texturePath: 'petitio/petitio_bottom/',
			min: 'petitio/petitio_bottom/min_petitio_bottom',
			renderBeforeEntities: true
		}
	],

	// Framen (CD_FRAMEN), from the client's own effect folders.
	ef_cd_framen: [
		{
			wav: 'effect/cd_framen',
			attachedEntity: true
		}
	],

	// Divinus Flos (CD_DIVINUS_FLOS), from the client's own effect folders.
	ef_cd_divinus_flos: [
		{
			type: 'STR',
			file: 'cardinal/cd_divinus_flos/divinus_flos/divinus_flos',
			texturePath: 'cardinal/cd_divinus_flos/divinus_flos/',
			min: 'cardinal/cd_divinus_flos/divinus_flos/min_divinus_flos',
			wav: 'effect/cd_divinus_flos'
		},
		{
			type: 'STR',
			file: 'cardinal/cd_divinus_flos/divinus_flos_bottom/divinus_flos_bottom',
			texturePath: 'cardinal/cd_divinus_flos/divinus_flos_bottom/',
			min: 'cardinal/cd_divinus_flos/divinus_flos_bottom/min_divinus_flos_bottom',
			renderBeforeEntities: true
		}
	],

	// Divinus Flos (CD_DIVINUS_FLOS), from the client's own effect folders.
	ef_cd_divinus_flos_cast: [
		{
			type: 'STR',
			file: 'cardinal/cd_divinus_flos/divinus_flos_cast/divinus_flos_cast',
			texturePath: 'cardinal/cd_divinus_flos/divinus_flos_cast/',
			min: 'cardinal/cd_divinus_flos/divinus_flos_cast/min_divinus_flos_cast'
		},
		{
			type: 'STR',
			file: 'cardinal/cd_divinus_flos/divinus_flos_cast_bottom/divinus_flos_cast_bottom',
			texturePath: 'cardinal/cd_divinus_flos/divinus_flos_cast_bottom/',
			min: 'cardinal/cd_divinus_flos/divinus_flos_cast_bottom/min_divinus_flos_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Divinus Flos (CD_DIVINUS_FLOS), from the client's own effect folders.
	ef_cd_divinus_flos_hit: [
		{
			type: 'STR',
			file: 'cardinal/cd_divinus_flos/divinus_flos_hit/divinus_flos_hit',
			texturePath: 'cardinal/cd_divinus_flos/divinus_flos_hit/',
			min: 'cardinal/cd_divinus_flos/divinus_flos_hit/min_divinus_flos_hit'
		}
	]
};
