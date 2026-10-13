/**
 * A ECONOMIA DE ENERGIA AUTOMATICA PODE SER DESLIGADA (23/09/2026, ordem do
 * dono): a opcao mora nas Configuracoes de Video, nasce LIGADA, e desligada a
 * aba escondida nao pede nada ao servidor.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const src = join(__dirname, '..', '..', 'src');
const ler = rel => readFileSync(join(src, rel), 'utf8');

describe('a economia de energia automatica desligavel', () => {
	it('nasce LIGADA (o comportamento de sempre)', () => {
		expect(ler('Preferences/Graphics.js')).toMatch(/economiaDeEnergiaAutomatica: true,/);
	});

	it('a opcao esta nas Configuracoes de Video e grava a preferencia', () => {
		expect(ler('UI/Components/GraphicsOption/GraphicsOption.html')).toContain('class="economia-automatica"');
		const js = ler('UI/Components/GraphicsOption/GraphicsOption.js');
		expect(js).toContain("bindChange('.economia-automatica', onToggleEconomiaAutomatica);");
		expect(js).toContain('GraphicsSettings.economiaDeEnergiaAutomatica = !!this.checked;');
	});

	it('desligada, a aba escondida nao pede a economia (nem pelo atraso ja agendado): o gatilho le a preferencia', () => {
		const js = ler('Engine/MapEngine.js');
		expect(js).toContain('automaticaLigada: () => GraphicsSettings.economiaDeEnergiaAutomatica !== false,');
		// O comportamento (atraso cancelado, disparo que reconfere) e provado com relogio falso em `atrasoDaEconomia.test.js`.
	});
});
