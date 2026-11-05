/**
 * Navigation-era compatibility for the Morroc topology changed in Episode 12.
 *
 * The stock client tables bundled with this project contain the post-Satan
 * Morroc links only. These pre-Satan links were reconstructed from rAthena's
 * preserved pre-renewal warp records. Keep this module data-only so both the
 * DB loader and WorldMap can share the exact Episode 12 boundary.
 */

export const SATAN_MORROC_EPISODE = 12;

const POST_SATAN_MAPS = new Set(['moc_fild20', 'moc_fild21', 'moc_fild22', 'moc_fild22b']);

const PRE_SATAN_MAPS = [
	['moc_fild04', 'moc_fild04', 5001, 400, 400],
	['moc_fild05', 'moc_fild05', 5001, 400, 400],
	['moc_fild06', 'moc_fild06', 5001, 400, 400],
	['moc_fild08', 'moc_fild08', 5001, 400, 400],
	['moc_fild09', 'moc_fild09', 5001, 400, 400],
	['moc_fild10', 'moc_fild10', 5001, 400, 400],
	['moc_fild14', 'moc_fild14', 5001, 400, 400],
	['moc_fild15', 'moc_fild15', 5001, 400, 400]
];

// Navi_Link schema:
// source map, link id, type, sprite, label, display name, source x/y,
// destination map, destination x/y.
const PRE_SATAN_LINKS = [
	['moc_fild01', 900000, 200, 99999, 'moc_fild01_moc_fild04_pre_satan_900000', '', 101, 16, 'moc_fild04', 317, 376],
	['moc_fild04', 900001, 200, 99999, 'moc_fild04_moc_fild05_pre_satan_900001', '', 14, 122, 'moc_fild05', 378, 119],
	['moc_fild04', 900002, 200, 99999, 'moc_fild04_moc_fild05_pre_satan_900002', '', 14, 146, 'moc_fild05', 378, 119],
	['moc_fild04', 900003, 200, 99999, 'moc_fild04_moc_fild05_pre_satan_900003', '', 14, 98, 'moc_fild05', 378, 119],
	['moc_fild04', 900004, 200, 99999, 'moc_fild04_moc_fild08_pre_satan_900004', '', 175, 18, 'moc_fild08', 170, 380],
	['moc_fild04', 900005, 200, 99999, 'moc_fild04_moc_fild05_pre_satan_900005', '', 19, 206, 'moc_fild05', 373, 208],
	['moc_fild04', 900006, 200, 99999, 'moc_fild04_moc_fild01_pre_satan_900006', '', 292, 381, 'moc_fild01', 76, 25],
	['moc_fild04', 900007, 200, 99999, 'moc_fild04_moc_fild01_pre_satan_900007', '', 314, 381, 'moc_fild01', 76, 25],
	['moc_fild04', 900008, 200, 99999, 'moc_fild04_moc_fild01_pre_satan_900008', '', 336, 381, 'moc_fild01', 76, 25],
	['moc_fild04', 900009, 200, 99999, 'moc_fild04_prt_fild09_pre_satan_900009', '', 92, 381, 'prt_fild09', 246, 19],
	['moc_fild05', 900010, 200, 99999, 'moc_fild05_prt_fild10_pre_satan_900010', '', 144, 375, 'prt_fild10', 263, 23],
	['moc_fild05', 900011, 200, 99999, 'moc_fild05_moc_fild06_pre_satan_900011', '', 18, 136, 'moc_fild06', 367, 317],
	['moc_fild05', 900012, 200, 99999, 'moc_fild05_moc_fild06_pre_satan_900012', '', 18, 154, 'moc_fild06', 367, 317],
	['moc_fild05', 900013, 200, 99999, 'moc_fild05_moc_fild06_pre_satan_900013', '', 18, 172, 'moc_fild06', 367, 317],
	['moc_fild05', 900014, 200, 99999, 'moc_fild05_moc_fild09_pre_satan_900014', '', 268, 18, 'moc_fild09', 267, 368],
	['moc_fild05', 900015, 200, 99999, 'moc_fild05_prt_fild09_pre_satan_900015', '', 325, 382, 'prt_fild09', 95, 19],
	['moc_fild05', 900016, 200, 99999, 'moc_fild05_moc_fild04_pre_satan_900016', '', 378, 208, 'moc_fild04', 26, 206],
	['moc_fild05', 900017, 200, 99999, 'moc_fild05_moc_fild04_pre_satan_900017', '', 384, 108, 'moc_fild04', 22, 123],
	['moc_fild05', 900018, 200, 99999, 'moc_fild05_moc_fild04_pre_satan_900018', '', 384, 126, 'moc_fild04', 22, 123],
	['moc_fild05', 900019, 200, 99999, 'moc_fild05_moc_fild04_pre_satan_900019', '', 384, 144, 'moc_fild04', 22, 123],
	['moc_fild05', 900020, 200, 99999, 'moc_fild05_moc_fild09_pre_satan_900020', '', 82, 16, 'moc_fild09', 80, 366],
	['moc_fild06', 900021, 200, 99999, 'moc_fild06_moc_fild07_pre_satan_900021', '', 18, 198, 'moc_fild07', 378, 201],
	['moc_fild06', 900022, 200, 99999, 'moc_fild06_moc_fild10_pre_satan_900022', '', 207, 18, 'moc_fild10', 208, 295],
	['moc_fild06', 900023, 200, 99999, 'moc_fild06_moc_fild05_pre_satan_900023', '', 377, 316, 'moc_fild05', 24, 153],
	['moc_fild07', 900024, 200, 99999, 'moc_fild07_moc_fild06_pre_satan_900024', '', 381, 201, 'moc_fild06', 28, 201],
	['moc_fild08', 900025, 200, 99999, 'moc_fild08_moc_fild09_pre_satan_900025', '', 16, 207, 'moc_fild09', 371, 195],
	['moc_fild08', 900026, 200, 99999, 'moc_fild08_moc_fild04_pre_satan_900026', '', 170, 383, 'moc_fild04', 175, 21],
	['moc_fild08', 900027, 200, 99999, 'moc_fild08_moc_fild14_pre_satan_900027', '', 204, 16, 'moc_fild14', 196, 379],
	['moc_fild08', 900028, 200, 99999, 'moc_fild08_moc_fild13_pre_satan_900028', '', 383, 211, 'moc_fild13', 32, 171],
	['moc_fild09', 900029, 200, 99999, 'moc_fild09_moc_fild15_pre_satan_900029', '', 126, 20, 'moc_fild15', 158, 360],
	['moc_fild09', 900030, 200, 99999, 'moc_fild09_moc_fild05_pre_satan_900030', '', 267, 371, 'moc_fild05', 268, 21],
	['moc_fild09', 900031, 200, 99999, 'moc_fild09_moc_fild10_pre_satan_900031', '', 30, 162, 'moc_fild10', 381, 258],
	['moc_fild09', 900032, 200, 99999, 'moc_fild09_moc_fild08_pre_satan_900032', '', 374, 195, 'moc_fild08', 19, 207],
	['moc_fild09', 900033, 200, 99999, 'moc_fild09_moc_fild05_pre_satan_900033', '', 80, 369, 'moc_fild05', 82, 19],
	['moc_fild10', 900034, 200, 99999, 'moc_fild10_moc_fild11_pre_satan_900034', '', 189, 23, 'moc_fild11', 189, 360],
	['moc_fild10', 900035, 200, 99999, 'moc_fild10_morocc_pre_satan_900035', '', 19, 207, 'morocc', 299, 207],
	['moc_fild10', 900036, 200, 99999, 'moc_fild10_moc_fild06_pre_satan_900036', '', 208, 298, 'moc_fild06', 207, 21],
	['moc_fild10', 900037, 200, 99999, 'moc_fild10_moc_fild09_pre_satan_900037', '', 384, 258, 'moc_fild09', 33, 162],
	['moc_fild11', 900038, 200, 99999, 'moc_fild11_moc_fild10_pre_satan_900038', '', 189, 363, 'moc_fild10', 189, 26],
	['moc_fild11', 900039, 200, 99999, 'moc_fild11_moc_fild15_pre_satan_900039', '', 379, 197, 'moc_fild15', 41, 105],
	['moc_fild13', 900040, 200, 99999, 'moc_fild13_moc_fild08_pre_satan_900040', '', 29, 171, 'moc_fild08', 380, 211],
	['moc_fild14', 900041, 200, 99999, 'moc_fild14_moc_fild15_pre_satan_900041', '', 16, 278, 'moc_fild15', 364, 276],
	['moc_fild14', 900042, 200, 99999, 'moc_fild14_moc_fild08_pre_satan_900042', '', 196, 382, 'moc_fild08', 204, 19],
	['moc_fild15', 900043, 200, 99999, 'moc_fild15_moc_fild16_pre_satan_900043', '', 104, 16, 'moc_fild16', 125, 380],
	['moc_fild15', 900044, 200, 99999, 'moc_fild15_moc_fild09_pre_satan_900044', '', 158, 363, 'moc_fild09', 126, 23],
	['moc_fild15', 900045, 200, 99999, 'moc_fild15_moc_fild16_pre_satan_900045', '', 348, 18, 'moc_fild16', 334, 379],
	['moc_fild15', 900046, 200, 99999, 'moc_fild15_moc_fild14_pre_satan_900046', '', 367, 276, 'moc_fild14', 19, 278],
	['moc_fild15', 900047, 200, 99999, 'moc_fild15_moc_fild11_pre_satan_900047', '', 38, 105, 'moc_fild11', 376, 197],
	['moc_fild16', 900048, 200, 99999, 'moc_fild16_moc_fild15_pre_satan_900048', '', 125, 383, 'moc_fild15', 104, 19],
	['moc_fild16', 900049, 200, 99999, 'moc_fild16_moc_fild15_pre_satan_900049', '', 334, 382, 'moc_fild15', 348, 21],
	['prt_fild09', 900050, 200, 99999, 'prt_fild09_moc_fild04_pre_satan_900050', '', 246, 16, 'moc_fild04', 92, 378],
	['prt_fild09', 900051, 200, 99999, 'prt_fild09_moc_fild05_pre_satan_900051', '', 95, 16, 'moc_fild05', 325, 379],
	['prt_fild10', 900052, 200, 99999, 'prt_fild10_moc_fild05_pre_satan_900052', '', 263, 20, 'moc_fild05', 144, 372],
	['morocc', 900053, 200, 99999, 'morocc_moc_fild10_pre_satan_900053', '', 302, 207, 'moc_fild10', 22, 207]
];

export function isPreSatanMorroc(settings) {
	const episode = Number(settings && settings.episode);
	return Number.isFinite(episode) && episode < SATAN_MORROC_EPISODE;
}

export function isEpisodeInRange(entry, episode) {
	return episode >= entry.ep_from && episode < entry.ep_to;
}

export function getIncomingNavigationMapPoint(mapName, links) {
	const target = String(mapName || '').replace(/\.gat$/i, '').toLowerCase();
	const incoming = (Array.isArray(links) ? links : []).filter(link =>
		link && String(link[8] || '').replace(/\.gat$/i, '').toLowerCase() === target
	);
	const link = incoming.find(candidate => Number(candidate[2]) === 200) || incoming[0];
	if (!link) return null;

	const x = Number(link[9]);
	const y = Number(link[10]);
	return Number.isFinite(x) && Number.isFinite(y) && x >= 0 && y >= 0 ? { x, y } : null;
}

export function applyNavigationMapEra(maps, settings) {
	if (!isPreSatanMorroc(settings)) {
		return maps;
	}

	const filtered = maps.filter(map => map && !POST_SATAN_MAPS.has(map[0]));
	const existing = new Set(filtered.map(map => map[0]));

	return filtered.concat(PRE_SATAN_MAPS.filter(map => !existing.has(map[0])));
}

export function applyNavigationLinkEra(links, settings) {
	if (!isPreSatanMorroc(settings)) {
		return links;
	}

	return links
		.filter(link => link && !POST_SATAN_MAPS.has(link[0]) && !POST_SATAN_MAPS.has(link[8]))
		.concat(PRE_SATAN_LINKS);
}

export function applyNavigationDistanceEra(distances, settings) {
	// The bundled distance closure was generated for the post-Satan graph and
	// can re-introduce moc_fild20 indirectly. Direct links remain fully usable,
	// and MapPathFinder supplies a default cost when this table is empty.
	return isPreSatanMorroc(settings) ? [] : distances;
}
