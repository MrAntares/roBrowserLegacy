/**
 * @module DB/Effects/Table/Jobs/Archer/Windhawk
 *
 * The Archer line's Windhawk effects: its named ef_<skill prefix>_* rows and the named
 * rows only its skills use. DB/Effects/EffectTable.js joins the parts; its header lists the
 * parameters a row takes. Keep a skill's rows together.
 */

export default {
	// Wind Sign (WH_WIND_SIGN), from the client's own effect folders.
	ef_wh_wind_sign: [
		{
			type: 'STR',
			file: 'windsign/windsign/windsign',
			texturePath: 'windsign/windsign/',
			min: 'windsign/windsign/min_windsign',
			wav: 'effect/wh_wind_sign'
		}
	],

	// Hawk Rush (WH_HAWKRUSH), from the client's own effect folders.
	ef_wh_hawkrush: [
		{
			type: 'STR',
			file: 'hawkrush/hawkrush/hawkrush',
			texturePath: 'hawkrush/hawkrush/',
			wav: 'effect/wh_hawkrush'
		}
	],

	// Calamity Gale (WH_CALAMITYGALE), from the client's own effect folders.
	ef_wh_calamitygale_cast: [
		{
			type: 'STR',
			file: 'windhawk/calamitygale/calumitygale_cast/calumitygale_cast',
			texturePath: 'windhawk/calamitygale/calumitygale_cast/',
			min: 'windhawk/calamitygale/calumitygale_cast/min_calumitygale_cast',
			fallback: ['4wh_calumitygale/calumitygale_cast/calumitygale_cast'],
			wav: 'effect/wh_calamitygale'
		}
	],

	// Hawk Boomerang (WH_HAWKBOOMERANG), from the client's own effect folders.
	ef_wh_hawkboomerang: [
		{
			wav: 'effect/wh_hawkboomerang',
			attachedEntity: true
		}
	],

	// Gale Storm (WH_GALESTORM), from the client's own effect folders.
	ef_wh_galestorm: [
		{
			type: 'STR',
			file: 'galestorm/galestorm/galestorm',
			texturePath: 'galestorm/galestorm/',
			min: 'galestorm/galestorm/min_galestorm',
			wav: 'effect/wh_galestorm'
		}
	],

	// Gale Storm (WH_GALESTORM), from the client's own effect folders.
	ef_wh_galestorm_cast: [
		{
			type: 'STR',
			file: 'galestorm/galestorm_cast/galestorm_cast',
			texturePath: 'galestorm/galestorm_cast/',
			min: 'galestorm/galestorm_cast/min_galestorm_cast'
		}
	],

	// Gale Storm (WH_GALESTORM), from the client's own effect folders.
	ef_wh_galestorm_hit: [
		{
			type: 'STR',
			file: 'galestorm/galestorm_hit/galestorm_hit',
			texturePath: 'galestorm/galestorm_hit/',
			min: 'galestorm/galestorm_hit/min_galestorm_hit'
		}
	],

	// Deep Blind Trap (WH_DEEPBLINDTRAP), from the client's own effect folders.
	ef_wh_deepblindtrap: [
		{
			type: 'STR',
			file: 'deepblindtrap/deepblindtrap/deepblindtrap',
			texturePath: 'deepblindtrap/deepblindtrap/',
			min: 'deepblindtrap/deepblindtrap/min_deepblindtrap'
		},
		{
			type: 'STR',
			file: 'deepblindtrap/deepblindtrap_bottom/deepblindtrap_bottom',
			texturePath: 'deepblindtrap/deepblindtrap_bottom/',
			min: 'deepblindtrap/deepblindtrap_bottom/min_deepblindtrap_bottom',
			renderBeforeEntities: true
		}
	],

	// Deep Blind Trap (WH_DEEPBLINDTRAP), from the client's own effect folders.
	ef_wh_deepblindtrap_cast: [
		{
			type: 'STR',
			file: 'deepblindtrap/deepblindtrap_cast/deepblindtrap_cast',
			texturePath: 'deepblindtrap/deepblindtrap_cast/',
			min: 'deepblindtrap/deepblindtrap_cast/min_deepblindtrap_cast'
		}
	],

	// Deep Blind Trap (WH_DEEPBLINDTRAP), from the client's own effect folders.
	ef_wh_deepblindtrap_hit: [
		{
			type: 'STR',
			file: 'deepblindtrap/deepblindtrap_hit/deepblindtrap_hit',
			texturePath: 'deepblindtrap/deepblindtrap_hit/',
			min: 'deepblindtrap/deepblindtrap_hit/min_deepblindtrap_hit'
		}
	],

	// Solid Trap (WH_SOLIDTRAP), from the client's own effect folders.
	ef_wh_solidtrap: [
		{
			type: 'STR',
			file: 'solidtrap/solidtrap/solidtrap',
			texturePath: 'solidtrap/solidtrap/',
			min: 'solidtrap/solidtrap/min_solidtrap'
		},
		{
			type: 'STR',
			file: 'solidtrap/solidtrap_bottom/solidtrap_bottom',
			texturePath: 'solidtrap/solidtrap_bottom/',
			min: 'solidtrap/solidtrap_bottom/min_solidtrap_bottom',
			renderBeforeEntities: true
		}
	],

	// Solid Trap (WH_SOLIDTRAP), from the client's own effect folders.
	ef_wh_solidtrap_cast: [
		{
			type: 'STR',
			file: 'solidtrap/solidtrap_cast/solidtrap_cast',
			texturePath: 'solidtrap/solidtrap_cast/',
			min: 'solidtrap/solidtrap_cast/min_solidtrap_cast'
		},
		{
			type: 'STR',
			file: 'solidtrap/solidtrap_cast_bottom/solidtrap_cast_bottom',
			texturePath: 'solidtrap/solidtrap_cast_bottom/',
			min: 'solidtrap/solidtrap_cast_bottom/min_solidtrap_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Solid Trap (WH_SOLIDTRAP), from the client's own effect folders.
	ef_wh_solidtrap_hit: [
		{
			type: 'STR',
			file: 'solidtrap/solidtrap_hit/solidtrap_hit',
			texturePath: 'solidtrap/solidtrap_hit/',
			min: 'solidtrap/solidtrap_hit/min_solidtrap_hit'
		}
	],

	// Swift Trap (WH_SWIFTTRAP), from the client's own effect folders.
	ef_wh_swifttrap: [
		{
			type: 'STR',
			file: 'swifttrap/swifttrap/swifttrap',
			texturePath: 'swifttrap/swifttrap/',
			min: 'swifttrap/swifttrap/min_swifttrap'
		},
		{
			type: 'STR',
			file: 'swifttrap/swifttrap_bottom/swifttrap_bottom',
			texturePath: 'swifttrap/swifttrap_bottom/',
			min: 'swifttrap/swifttrap_bottom/min_swifttrap_bottom',
			renderBeforeEntities: true
		}
	],

	// Swift Trap (WH_SWIFTTRAP), from the client's own effect folders.
	ef_wh_swifttrap_cast: [
		{
			type: 'STR',
			file: 'swifttrap/swifttrap_cast/swifttrap_cast',
			texturePath: 'swifttrap/swifttrap_cast/',
			min: 'swifttrap/swifttrap_cast/min_swifttrap_cast'
		}
	],

	// Swift Trap (WH_SWIFTTRAP), from the client's own effect folders.
	ef_wh_swifttrap_hit: [
		{
			type: 'STR',
			file: 'swifttrap/swifttrap_hit/swifttrap_hit',
			texturePath: 'swifttrap/swifttrap_hit/',
			min: 'swifttrap/swifttrap_hit/min_swifttrap_hit'
		}
	],

	// Crescive Bolt (WH_CRESCIVE_BOLT), from the client's own effect folders.
	ef_wh_crescive_bolt: [
		{
			type: 'STR',
			file: 'crescivebolt/crescivebolt/crescivebolt',
			texturePath: 'crescivebolt/crescivebolt/',
			min: 'crescivebolt/crescivebolt/min_crescivebolt',
			wav: 'effect/wh_crescive_bolt'
		}
	],

	// Crescive Bolt (WH_CRESCIVE_BOLT), from the client's own effect folders.
	ef_wh_crescive_bolt_cast: [
		{
			type: 'STR',
			file: 'crescivebolt/crescivebolt_cast/crescivebolt_cast',
			texturePath: 'crescivebolt/crescivebolt_cast/',
			min: 'crescivebolt/crescivebolt_cast/min_crescivebolt_cast'
		}
	],

	// Crescive Bolt (WH_CRESCIVE_BOLT), from the client's own effect folders.
	ef_wh_crescive_bolt_hit: [
		{
			type: 'STR',
			file: 'crescivebolt/crescivebolt_hit/crescivebolt_hit',
			texturePath: 'crescivebolt/crescivebolt_hit/',
			min: 'crescivebolt/crescivebolt_hit/min_crescivebolt_hit'
		}
	],

	// Flame Trap (WH_FLAMETRAP), from the client's own effect folders.
	ef_wh_flametrap: [
		{
			type: 'STR',
			file: 'flametrap/flametrap/flametrap',
			texturePath: 'flametrap/flametrap/',
			min: 'flametrap/flametrap/min_flametrap'
		},
		{
			type: 'STR',
			file: 'flametrap/flametrap_bottom/flametrap_bottom',
			texturePath: 'flametrap/flametrap_bottom/',
			min: 'flametrap/flametrap_bottom/min_flametrap_bottom',
			renderBeforeEntities: true
		}
	],

	// Flame Trap (WH_FLAMETRAP), from the client's own effect folders.
	ef_wh_flametrap_cast: [
		{
			type: 'STR',
			file: 'flametrap/flametrap_cast/flametrap_cast',
			texturePath: 'flametrap/flametrap_cast/',
			min: 'flametrap/flametrap_cast/min_flametrap_cast'
		}
	],

	// Flame Trap (WH_FLAMETRAP), from the client's own effect folders.
	ef_wh_flametrap_hit: [
		{
			type: 'STR',
			file: 'flametrap/flametrap_hit/flametrap_hit',
			texturePath: 'flametrap/flametrap_hit/',
			min: 'flametrap/flametrap_hit/min_flametrap_hit'
		}
	],

	// Wild Walk (WH_WILD_WALK), from the client's own effect folders.
	ef_wh_wild_walk: [
		{
			type: 'STR',
			file: 'windhawk/wh_wild_walk/wild_walk/wild_walk',
			texturePath: 'windhawk/wh_wild_walk/wild_walk/',
			min: 'windhawk/wh_wild_walk/wild_walk/min_wild_walk',
			wav: 'effect/wh_wild_walk'
		}
	],

	// Wild Walk (WH_WILD_WALK), from the client's own effect folders.
	ef_wh_wild_walk_cast: [
		{
			type: 'STR',
			file: 'windhawk/wh_wild_walk/wild_walk_cast/wild_walk_cast',
			texturePath: 'windhawk/wh_wild_walk/wild_walk_cast/',
			min: 'windhawk/wh_wild_walk/wild_walk_cast/min_wild_walk_cast'
		},
		{
			type: 'STR',
			file: 'windhawk/wh_wild_walk/wild_walk_cast_bottom/wild_walk_cast_bottom',
			texturePath: 'windhawk/wh_wild_walk/wild_walk_cast_bottom/',
			min: 'windhawk/wh_wild_walk/wild_walk_cast_bottom/min_wild_walk_cast_bottom',
			renderBeforeEntities: true
		}
	],

	// Wild Walk (WH_WILD_WALK), from the client's own effect folders.
	ef_wh_wild_walk_hit: [
		{
			type: 'STR',
			file: 'windhawk/wh_wild_walk/wild_walk_hit/wild_walk_hit',
			texturePath: 'windhawk/wh_wild_walk/wild_walk_hit/',
			min: 'windhawk/wh_wild_walk/wild_walk_hit/min_wild_walk_hit'
		}
	]
};
