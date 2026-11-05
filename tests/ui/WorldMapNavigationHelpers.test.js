import { describe, expect, it } from 'vitest';
import { createWorldMapMonsterLevelRange } from 'UI/Components/WorldMap/WorldMapMonsterTooltip.js';
import { renderWorldMapServiceOverlay } from 'UI/Components/WorldMap/WorldMapServiceOverlay.js';

describe('world map navigation helpers', () => {
	it('renders all distinct spawn levels as a range', () => {
		const badge = createWorldMapMonsterLevelRange([{ levels: [20, 30], mobType: 0 }]);
		expect(badge.textContent).toBe('Lv. 20-30');
	});

	it('does not show Kafra travel routes when the hovered map has no Kafra', () => {
		const mapView = document.createElement('div');
		const sections = [{ id: 'prontera', left: 0, top: 0, width: 20, height: 20 }, { id: 'izlude', left: 30, top: 0, width: 20, height: 20 }];
		const overlay = renderWorldMapServiceOverlay({
			mapView,
			hoveredMapId: 'prontera',
			sections,
			getTownInfo: () => [{ Type: 1, Name: 'Inn' }]
		});
		expect(overlay).toBeNull();
		expect(mapView.querySelector('.worldmap-service-overlay')).toBeNull();
	});
});
