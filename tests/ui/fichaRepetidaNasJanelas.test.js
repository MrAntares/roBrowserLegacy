import { describe, expect, it, vi } from 'vitest';

/*
 * A FICHA REENVIADA NAO MEXE NO DOM DAS JANELAS NATIVAS (D-2374).
 *
 * O servidor reenvia a ficha inteira a cada ficha suja do tique (uns vinte
 * `ZC_PAR_CHANGE` mais os `ZC_COUPLESTATUS`), quase sempre com os mesmos
 * numeros. `BasicInfo.update` e `WinStats.update` reescreviam tudo: cada
 * `textContent` igual troca o no de texto (mutacao real, que acorda os
 * observadores da raiz). Agora elas escrevem por `UI/escreverSeMudou.js`.
 *
 * Contagem para UM reenvio de ficha com os mesmos valores — registros de um
 * `MutationObserver` na raiz da janela (texto e titulo) e atribuicoes de estilo
 * (o jsdom nao registra mutacao para estilo igual, entao elas sao contadas no
 * setter, `contarEscritasDeEstilo.js`):
 *   ANTES (a3ebe0fe): BasicInfo 17 mutacoes + 15 estilos; WinStats 16 + 8.
 *   DEPOIS: 0 e 0 nas duas.
 * (os numeros do ANTES sairam desta mesma bateria com o ajudante desligado:
 * `RAG_MUTANTE_PERF=textoSempre,tituloSempre` e `=estiloSempre`, ver
 * `tests/mutantes/perf-13-10.config.mjs`.)
 *
 * Exatidao: o HTML da raiz depois do reenvio e IDENTICO ao de antes dele, e a
 * janela que alternou A,B,A,B termina igual a que so viu A,B (as escritas
 * dependem so do ultimo valor de cada campo; a barra vazia guarda a largura
 * do ultimo valor nao vazio, como sempre guardou). O oraculo geral, contra o
 * caminho antigo escrita a escrita, esta em `escreverSeMudou.test.js`.
 */

const contextoMudo = new Proxy(
	{},
	{
		get: (alvo, nome) => {
			if (nome === 'measureText') return () => ({ width: 0 });
			if (nome === 'getImageData' || nome === 'createImageData') return () => ({ data: new Uint8ClampedArray(4) });
			return nome in alvo ? alvo[nome] : () => {};
		},
		set: (alvo, nome, valor) => {
			alvo[nome] = valor;
			return true;
		}
	}
);
HTMLCanvasElement.prototype.getContext = () => contextoMudo;

// O arquivo da barra chega na hora, como no navegador depois da primeira carga
// (`MemoryItem.addEventListener` chama o callback sincrono quando completo).
vi.doMock('Core/Client.js', () => ({
	default: { loadFile: (nome, aoCarregar) => aoCarregar(`blob:${nome}`), loadFiles: () => {} }
}));

// A ordem de carga e a do jogo (a janela publica primeiro): importar a fabrica
// direto entra no ciclo de imports das janelas pela porta errada.
await import('UI/Components/BasicInfo/BasicInfo.js');
await import('UI/Components/WinStats/WinStats.js');
const { contarEscritasDeEstilo } = await import('./contarEscritasDeEstilo.js');
// O jsdom nao registra mutacao para estilo reescrito com o mesmo valor: as
// atribuicoes de estilo sao contadas a parte.
const escritasDeEstilo = contarEscritasDeEstilo(['width', 'left', 'backgroundImage', 'opacity', 'pointerEvents', 'display', 'color']);
const { createBasicInfo } = await import('UI/Components/BasicInfo/BasicInfoCommon.js');
const { createWinStats } = await import('UI/Components/WinStats/WinStatsCommon.js');

const HTML_BASIC = `
<div class="topbar"></div>
<span class="name_value"></span><span class="blvl_value"></span><span class="jlvl_value"></span>
<span class="zeny_value"></span><span class="job_value"></span>
<div class="bexp"><div></div></div><span class="bexp_value"></span>
<div class="jexp"><div></div></div><span class="jexp_value"></span>
<div class="weight"><span class="weight_value"></span>/<span class="weight_total"></span></div>
<span class="hp_value"></span><span class="hp_max_value"></span><span class="hp_perc"></span>
<div class="hp_bar"><div class="hp_bar_left"></div><div class="hp_bar_middle"></div><div class="hp_bar_right"></div></div>
<span class="sp_value"></span><span class="sp_max_value"></span><span class="sp_perc"></span>
<div class="sp_bar"><div class="sp_bar_left"></div><div class="sp_bar_middle"></div><div class="sp_bar_right"></div></div>`;

const HTML_STATS = `
<div class="stats"><span class="str"></span><span class="agi"></span><span class="vit"></span></div>
<div class="bonus"><span class="str"></span><span class="agi"></span></div>
<div class="requirements"><div class="str">2</div><div class="agi">3</div></div>
<div class="up"><button class="str"></button><button class="agi"></button></div>
<span class="statuspoint"></span><span class="atak"></span><span class="atak2"></span>
<span class="matak"></span><span class="matak2"></span><span class="def"></span><span class="def2"></span>
<span class="aspd"></span><span class="hit"></span><span class="flee"></span><span class="flee2"></span>`;

let sequencia = 0;
function basicNova() {
	const c = createBasicInfo({ name: `BasicInfoTeste${++sequencia}`, htmlText: HTML_BASIC, cssText: '', prefKey: `BasicInfoTeste${sequencia}` });
	c.prepare();
	return c;
}
function statsNova() {
	const c = createWinStats({ name: `WinStatsTeste${++sequencia}`, htmlText: HTML_STATS, cssText: '', hasTraits: false });
	c.prepare();
	return c;
}

/** A ficha da janela de informacao basica, como `Main.js` a manda. */
function fichaBasica(c, v) {
	c.update('name', 'Fulano');
	c.update('blvl', v.nivel);
	c.update('jlvl', 10);
	c.update('zeny', v.zeny);
	c.update('bexp', 120, 1000);
	c.update('jexp', 30, 200);
	c.update('weight', v.peso, 8000);
	c.update('hp', v.hp, 1000);
	c.update('sp', 40, 80);
}

function fichaDeStats(c, v) {
	c.update('statuspoint', v.pontos);
	c.update('str', v.str);
	c.update('agi', 9);
	c.update('str2', 3);
	c.update('agi2', 0);
	c.update('str3', 2);
	c.update('agi3', 3);
	c.update('atak', 120);
	c.update('atak2', 5);
	c.update('matak', 30);
	c.update('matak2', 40);
	c.update('def', 10);
	c.update('def2', -2);
	c.update('aspd', 1400);
	c.update('hit', 80);
	c.update('flee', 70);
	c.update('flee2', 1);
}

/** O HTML da janela, sem as folhas de estilo (que levam o nome do componente). */
function conteudo(c) {
	return c.getRoot().querySelector('.ui-component-root').innerHTML;
}

function vigiar(raiz) {
	const o = new MutationObserver(() => {});
	o.observe(raiz, { childList: true, subtree: true, characterData: true, attributes: true });
	return o;
}

const A = { nivel: 50, zeny: 123456, peso: 3000, hp: 700, pontos: 5, str: 30 };
const B = { nivel: 51, zeny: 99, peso: 5000, hp: 0, pontos: 1, str: 31 };

describe('BasicInfo: o reenvio da mesma ficha nao muta o DOM', () => {
	it('zero mutacoes e zero atribuicoes de estilo no reenvio, e o HTML fica identico', () => {
		const c = basicNova();
		fichaBasica(c, A);
		const raiz = c.getRoot();
		const antes = raiz.innerHTML;
		const o = vigiar(raiz);
		const estilosAntes = escritasDeEstilo.n;
		fichaBasica(c, A);
		expect(o.takeRecords().length).toBe(0);
		expect(escritasDeEstilo.n - estilosAntes, 'atribuicoes de estilo no reenvio').toBe(0);
		expect(raiz.innerHTML).toBe(antes);
	});

	it('A,B,A,B termina com o HTML de quem so viu A,B', () => {
		const c = basicNova();
		fichaBasica(c, A);
		fichaBasica(c, B);
		fichaBasica(c, A);
		fichaBasica(c, B);
		const so = basicNova();
		fichaBasica(so, A);
		fichaBasica(so, B);
		expect(conteudo(c)).toBe(conteudo(so));
	});
});

describe('WinStats: o reenvio da mesma ficha nao muta o DOM', () => {
	it('zero mutacoes e zero atribuicoes de estilo no reenvio, e o HTML fica identico', () => {
		const c = statsNova();
		fichaDeStats(c, A);
		const raiz = c.getRoot();
		const antes = raiz.innerHTML;
		const o = vigiar(raiz);
		const estilosAntes = escritasDeEstilo.n;
		fichaDeStats(c, A);
		expect(o.takeRecords().length).toBe(0);
		expect(escritasDeEstilo.n - estilosAntes, 'atribuicoes de estilo no reenvio').toBe(0);
		expect(raiz.innerHTML).toBe(antes);
	});

	it('A,B,A,B termina com o HTML de quem so viu A,B', () => {
		const c = statsNova();
		fichaDeStats(c, A);
		fichaDeStats(c, B);
		fichaDeStats(c, A);
		fichaDeStats(c, B);
		const so = statsNova();
		fichaDeStats(so, A);
		fichaDeStats(so, B);
		expect(conteudo(c)).toBe(conteudo(so));
	});
});
