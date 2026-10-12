import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

/*
 * C9 (auditoria de tela, 29/09/2026): o icone de status nascia com a faixa do
 * relogio vazia ate o proximo passo global de 500 ms do `rendering`. O
 * Contra-Ataque (2 s) era fotografado sem numero. O icone agora entra pela
 * `mostrarIcone`, que pinta na hora, e o status re-emitido tambem repinta.
 *
 * Teste de TEXTO porque o StatusIcons nao carrega no jsdom (canvas nulo no
 * import do Renderer). A prova de comportamento e a tela (KN_AUTOCOUNTER item 6).
 */
const src = fs.readFileSync('src/UI/Components/StatusIcons/StatusIcons.js', 'utf8').replace(/\r\n/g, '\n');

describe('relogio do icone de status nasce pintado (C9)', () => {
	it('mostrarIcone anexa e pinta o relogio no mesmo passo', () => {
		expect(src).toMatch(/function mostrarIcone\(index\) \{\n\taddElement\(_status\[index\]\.element\);\n\trenderStatus\(_status\[index\], Renderer\.tick\);\n\}/);
	});

	it('os tres caminhos que poem o icone na tela passam por mostrarIcone', () => {
		expect(src.match(/mostrarIcone\(index\);/g)).toHaveLength(3);
		expect(src).not.toMatch(/\taddElement\(_status\[index\]\.element\);\n\}\n\nfunction addResizedStatusIcon/);
		expect(src.match(/addElement\(_status\[index\]\.element\)/g)).toHaveLength(1);
	});

	it('status re-emitido com o icone ja carregado repinta o relogio na hora', () => {
		expect(src).toMatch(/_status\[index\]\.end = getStatusEnd\(Renderer\.tick, life\);\n(?:\t\/\/[^\n]*\n)*\tif \(_status\[index\]\.img\) \{\n\t\trenderStatus\(_status\[index\], Renderer\.tick\);/);
	});
});
