/**
 * A REDE DA HUD (05/10/2026, relato da Floresta Encantada 2: os botoes "Caçar"
 * e "Retornar para Prontera" somem e so voltam relogando). O porque em
 * `src/Engine/redeDaHud.js`.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { agendarRedeDaHud, garantirHud } from 'Engine/redeDaHud.js';

/** Um componente falso com o mesmo contrato do GUIComponent (`__active`, `append`). */
function componente(name, { lanca = false } = {}) {
	const c = {
		name,
		__active: false,
		append: vi.fn(() => {
			c.__active = true;
			if (lanca) throw new Error(name + ' quebrou');
		})
	};
	return c;
}

/**
 * A lista de `onLoad` (Engine/MapEngine.js) em miniatura: anexa em ordem e para
 * no primeiro que lanca — e quem chama engole a excecao (MapRenderer.js, F28).
 */
function entradaNoMapa(lista) {
	try {
		for (const c of lista) c.append();
	} catch {
		/* o MapRenderer registra e segue */
	}
}

describe('garantirHud', () => {
	it('a entrada que para no meio deixa os ultimos de fora, e a rede os anexa', () => {
		const topo = componente('TopMenuIdle', { lanca: true });
		const botoes = componente('HuntButtonIdle');
		entradaNoMapa([componente('BasicInfoIdle'), topo, botoes]);
		// O defeito do relato: o host dos botoes nunca voltou para a pagina.
		expect(botoes.__active).toBe(false);

		const relatar = vi.fn();
		expect(garantirHud([topo, botoes], relatar)).toEqual(['HuntButtonIdle']);
		expect(botoes.__active).toBe(true);
		expect(botoes.append).toHaveBeenCalledTimes(1);
		// O que lancou ja estava ativo (o host entrou antes do onAppend lancar):
		// a rede nao o anexa de novo.
		expect(topo.append).toHaveBeenCalledTimes(1);
		expect(relatar).toHaveBeenCalledWith('[hud] a entrada no mapa parou antes de anexar: HuntButtonIdle');
	});

	it('no caminho normal todos estao ativos: nada e anexado e nada e relatado', () => {
		const lista = [componente('TopMenuIdle'), componente('HuntButtonIdle')];
		entradaNoMapa(lista);
		const relatar = vi.fn();
		expect(garantirHud(lista, relatar)).toEqual([]);
		for (const c of lista) expect(c.append).toHaveBeenCalledTimes(1);
		expect(relatar).not.toHaveBeenCalled();
	});

	it('um componente que lanca na rede nao leva o vizinho junto, e o erro e relatado com a pilha', () => {
		const quebrado = { name: 'Quebrado', __active: false, append: vi.fn(() => { throw new Error('sem host'); }) };
		const botoes = componente('HuntButtonIdle');
		const relatar = vi.fn();
		const erro = vi.spyOn(console, 'error').mockImplementation(() => {});
		expect(garantirHud([quebrado, botoes], relatar)).toEqual(['Quebrado', 'HuntButtonIdle']);
		erro.mockRestore();
		expect(botoes.__active).toBe(true);
		expect(relatar).toHaveBeenCalledWith('[hud] Quebrado nao anexou: sem host', expect.stringContaining('sem host'));
	});

	it('sem relator, a rede ainda anexa', () => {
		const botoes = componente('HuntButtonIdle');
		expect(garantirHud([null, botoes])).toEqual(['HuntButtonIdle']);
		expect(botoes.__active).toBe(true);
	});
});

describe('agendarRedeDaHud', () => {
	it('roda DEPOIS da lista: agendada antes dela, ve o estado final', () => {
		let pendente = null;
		const botoes = componente('HuntButtonIdle');
		agendarRedeDaHud([botoes], { agendar: fn => (pendente = fn) });
		// Agendar nao anexa nada sozinho.
		expect(botoes.append).not.toHaveBeenCalled();
		botoes.append(); // a lista normal anexou
		pendente();
		expect(botoes.append).toHaveBeenCalledTimes(1);
	});

	it('o padrao e o setTimeout de zero', () => {
		vi.useFakeTimers();
		try {
			const botoes = componente('HuntButtonIdle');
			agendarRedeDaHud([botoes]);
			expect(botoes.__active).toBe(false);
			vi.runAllTimers();
			expect(botoes.__active).toBe(true);
		} finally {
			vi.useRealTimers();
		}
	});
});

describe('a costura em Engine/MapEngine.js', () => {
	const fonte = readFileSync('src/Engine/MapEngine.js', 'utf8').replace(/\r\n/g, '\n');
	const inicioDoOnLoad = fonte.indexOf('MapRenderer.onLoad = () => {');
	const rede = fonte.indexOf('agendarRedeDaHud([', inicioDoOnLoad);
	const listaDeAppends = fonte.indexOf('HuntButtonIdle.append();', inicioDoOnLoad);

	it('a rede e agendada dentro do onLoad, ANTES da lista de append()', () => {
		expect(inicioDoOnLoad).toBeGreaterThan(-1);
		expect(rede).toBeGreaterThan(inicioDoOnLoad);
		expect(rede).toBeLessThan(listaDeAppends);
	});

	it('os botoes do relato estao na rede, e o relator e o do /analytics/erro', () => {
		const chamada = fonte.slice(rede, fonte.indexOf('});', rede));
		expect(chamada).toContain('HuntButtonIdle');
		expect(chamada).toContain('TopMenuIdle');
		expect(chamada).toContain('relatar: relatarErro');
	});

	it('D-2323: o menu do Bot e o botao "Ataque auto" estao na rede, o menu antes do botao', () => {
		const chamada = fonte.slice(rede, fonte.indexOf('});', rede));
		const menu = chamada.indexOf('BotMenu');
		const botao = chamada.indexOf('CombatCornerIdle');
		expect(menu).toBeGreaterThan(-1);
		expect(botao).toBeGreaterThan(menu);
	});

	it('D-2323: os dois moram no meio da lista de append(), depois do primeiro componente da HUD', () => {
		// Se um dia subirem para o topo da lista, a rede deixa de ser a unica volta deles - mas continua valendo.
		const primeiro = fonte.indexOf('MiniMap.getUI().append();', inicioDoOnLoad);
		const doMenu = fonte.indexOf('BotMenu.append();', inicioDoOnLoad);
		expect(primeiro).toBeGreaterThan(-1);
		expect(doMenu).toBeGreaterThan(primeiro);
	});
});
