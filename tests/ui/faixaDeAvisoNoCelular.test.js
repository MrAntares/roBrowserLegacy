/**
 * A faixa de aviso (UI Announce) no celular em pe (bug #1 de 13/10/2026).
 * Ver src/UI/Components/Announce/posicaoDaFaixa.js.
 *
 * O relato: a faixa caia SOBRE a barra do topo da HUD vertical e o botao do menu
 * cobria o fim da 1a linha. A rodada 1 tirou a faixa do topo e a pos debaixo do
 * cartao de missoes, e o critico mediu duas colisoes novas: a faixa escrevia por
 * cima do placar do MVP e o banner de conquista passava por baixo da coluna de
 * buffs. Os numeros dos casos abaixo sao os MEDIDOS pelo critico em 390x844
 * (`wt-bugs-13-10/prints/n/critico-r1/saida-depois-celular.txt`): cartao ate 286,
 * placar em 8,260 248x114, buffs em 284,286 / 284,340 / 284,394 (38x51), faixa
 * de grupo em y=436.
 *
 * Este arquivo cobre a regra pura (largura, altura, lugar livre, medida das
 * pecas, acompanhamento) e a costura com o CSS. O componente montado de verdade
 * (o `Announce.set` usando a regra) e `faixaDeAvisoNoComponente.test.js`; a
 * geometria com o jogo rodando e da sonda `scripts/diag-faixa-de-aviso-na-tela.ts`
 * no repositorio do servidor.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
	FILEIRA_DO_AVISO_DE_ITEM,
	LARGURA_DO_CARTAO,
	LARGURA_DO_TRILHO,
	MARGEM,
	PASSO_DO_ACOMPANHAMENTO_MS,
	PECAS_DA_HUD,
	VAO,
	VARIAVEL_DO_TOPO,
	acompanharNaVertical,
	alturaDaFaixa,
	areaCoberta,
	caixaVisivel,
	ehHudVertical,
	inicioDaColuna,
	larguraDaColuna,
	lugarDaFaixa,
	medidasDaFaixa,
	medirPecas,
	publicarTopo,
	soltarDaVertical
} from 'UI/Components/Announce/posicaoDaFaixa.js';
import { LARGURA_DA_CELULA } from 'UI/Components/StatusIcons/statusTiming.js';

/** As larguras de celular em pe da matriz da casa (Common.css: ate 599px). */
const TELAS = [320, 360, 375, 390, 393, 412, 430, 599];

/** As pecas medidas pelo critico em 390x844 (viewport px). */
const CABECALHO = { nome: 'cabecalho', x: 8, y: 6, w: 325, h: 70 };
const CARTAO = { nome: 'cartao-de-missoes', x: 8, y: 84, w: 236, h: 202 };
const PLACAR = { nome: 'placar-mvp', x: 8, y: 260, w: 248, h: 114 };
const BUFFS = [286, 340, 394].map(y => ({ nome: 'buff', x: 284, y, w: 38, h: 51 }));
const ATALHOS = { nome: 'barra-de-atalhos', x: 8, y: 778, w: 374, h: 62 };
const grupo = membros => ({ nome: 'faixa-de-grupo', x: 8, y: 436, w: 132, h: 18 + 22 * membros });

describe('a largura da faixa', () => {
	it('a coluna e a do cartao de missoes (236) e encolhe so quando a tela e menor', () => {
		expect(larguraDaColuna(390)).toBe(LARGURA_DO_CARTAO);
		expect(larguraDaColuna(393)).toBe(236);
		expect(larguraDaColuna(320)).toBe(228);
	});
	it('nunca fica abaixo do piso de 100px, nem em tela absurda', () => {
		expect(larguraDaColuna(100)).toBe(100);
	});
	it('no desktop e no celular deitado nada muda: o pedido do chamador e a tela inteira', () => {
		expect(medidasDaFaixa(false, 1366, null)).toEqual({ largura: null, quebra: 1366 });
		expect(medidasDaFaixa(false, 1366, 1366)).toEqual({ largura: 1366, quebra: 1366 });
		expect(medidasDaFaixa(false, 844, 300)).toEqual({ largura: 300, quebra: 844 });
	});
	it('na vertical o aviso comum quebra na coluna e encolhe ao texto', () => {
		expect(medidasDaFaixa(true, 390, null)).toEqual({ largura: null, quebra: 236 });
		expect(medidasDaFaixa(true, 390, 0)).toEqual({ largura: null, quebra: 236 });
	});
	it('na vertical o banner que pede a tela inteira (conquista) fica na coluna', () => {
		expect(medidasDaFaixa(true, 390, 390)).toEqual({ largura: 236, quebra: 236 });
		expect(medidasDaFaixa(true, 320, 320)).toEqual({ largura: 228, quebra: 228 });
		expect(medidasDaFaixa(true, 390, 200)).toEqual({ largura: 200, quebra: 236 });
	});
	it('INVARIANTE: de 360px para cima a faixa termina ANTES da coluna de buffs (que encosta no trilho)', () => {
		for (const w of TELAS.filter(t => t >= 360)) {
			const comecoDoBuff = w - LARGURA_DO_TRILHO - MARGEM - LARGURA_DA_CELULA;
			for (const pedida of [null, 100, w, 2000]) {
				const { largura, quebra } = medidasDaFaixa(true, w, pedida);
				const maior = Math.max(largura || 0, quebra);
				expect(MARGEM + maior + VAO, `tela ${w}, pedida ${pedida}`).toBeLessThanOrEqual(comecoDoBuff);
			}
		}
	});
	it('em 390 a coluna termina em 244 e o buff comeca em 284: 40px de folga (o banner de 306 da rodada 1 cruzava)', () => {
		const { largura } = medidasDaFaixa(true, 390, 390);
		expect(MARGEM + largura).toBe(244);
		expect(390 - LARGURA_DO_TRILHO - MARGEM - LARGURA_DA_CELULA).toBe(BUFFS[0].x);
	});
});

describe('a altura da faixa', () => {
	it('no desktop e a de sempre: a pedida, ou a do texto', () => {
		expect(alturaDaFaixa(false, 50, 3, 20)).toBe(50);
		expect(alturaDaFaixa(false, undefined, 3, 12)).toBe(10 + 17 * 3);
	});
	it('na vertical a pedida vira piso e a altura acompanha as linhas (o titulo nao sai do canvas)', () => {
		expect(alturaDaFaixa(true, 50, 3, 20)).toBe(10 + 25 * 3);
		expect(alturaDaFaixa(true, 50, 1, 20)).toBe(50);
		expect(alturaDaFaixa(true, undefined, 2, 12)).toBe(10 + 17 * 2);
	});
});

describe('o lugar livre na coluna', () => {
	const inicio = CARTAO.y + CARTAO.h + VAO + FILEIRA_DO_AVISO_DE_ITEM;
	const faixa = { inicio, fim: 844, esquerda: 8, largura: 211, altura: 61 };

	it('sem nada debaixo do cartao a faixa fica logo abaixo da fileira do aviso de item', () => {
		expect(inicio).toBe(334);
		expect(lugarDaFaixa({ ...faixa, pecas: [CABECALHO, CARTAO, ATALHOS] })).toBe(334);
	});
	it('DEFEITO 1 da rodada 1: com o placar do MVP na tela, a faixa desce para debaixo dele', () => {
		const topo = lugarDaFaixa({ ...faixa, pecas: [CABECALHO, CARTAO, PLACAR, ATALHOS] });
		expect(topo).toBe(PLACAR.y + PLACAR.h + VAO);
		expect(areaCoberta({ x: 8, y: topo, w: 211, h: 61 }, [PLACAR])).toBe(0);
	});
	it('com placar E faixa de grupo, nao cabe entre os dois: desce para debaixo do grupo', () => {
		const party = grupo(3);
		const topo = lugarDaFaixa({ ...faixa, pecas: [CARTAO, PLACAR, party, ATALHOS] });
		expect(topo).toBe(party.y + party.h + VAO);
	});
	it('uma faixa baixa CABE entre o placar e o grupo, e fica la (o mais alto livre)', () => {
		const topo = lugarDaFaixa({ ...faixa, altura: 27, pecas: [CARTAO, PLACAR, grupo(3), ATALHOS] });
		expect(topo).toBe(PLACAR.y + PLACAR.h + VAO);
	});
	it('os buffs encostados no trilho nao empurram a coluna de 390 (40px de folga)', () => {
		expect(lugarDaFaixa({ ...faixa, largura: 236, pecas: [CARTAO, ...BUFFS] })).toBe(334);
	});
	it('em 320 a coluna e os buffs dividem o x: a faixa desce para debaixo dos buffs', () => {
		const buffs = [286, 340, 394].map(y => ({ nome: 'buff', x: 214, y, w: 38, h: 51 }));
		const topo = lugarDaFaixa({ ...faixa, largura: 228, pecas: [CARTAO, ...buffs] });
		expect(topo).toBe(394 + 51 + VAO);
	});
	it('nunca escolhe um lugar que passa do pe da tela', () => {
		const topo = lugarDaFaixa({ ...faixa, fim: 760, pecas: [CARTAO, { nome: 'chat', x: 8, y: 330, w: 296, h: 400 }] });
		expect(topo + 61).toBeLessThanOrEqual(760);
	});
	it('coluna toda ocupada: fica onde MENOS cobre, e nao some', () => {
		const item = { nome: 'aviso-de-item', x: 8, y: 330, w: 236, h: 50 };
		const chat = { nome: 'chat', x: 8, y: 400, w: 296, h: 380 };
		// 334 cobre o aviso de item inteiro (215 x 50); 384, debaixo dele, cobre so o
		// comeco do chat (215 x 49); debaixo do chat nao cabe mais
		const topo = lugarDaFaixa({ ...faixa, fim: 844, pecas: [CARTAO, item, chat, ATALHOS] });
		expect(topo).toBe(384);
	});
	it('empate de area: o mais alto', () => {
		expect(lugarDaFaixa({ ...faixa, pecas: [CARTAO, { nome: 'x', x: 300, y: 600, w: 10, h: 10 }] })).toBe(334);
	});
	it('nem o comeco da coluna cabe na tela: fica no comeco', () => {
		expect(lugarDaFaixa({ ...faixa, fim: 380, pecas: [CARTAO, PLACAR] })).toBe(334);
	});
	it('a ordem das pecas nao importa: vale o lugar livre MAIS ALTO', () => {
		// a faixa de grupo arrastada pelo jogador para baixo vem antes do placar na lista
		const grupoArrastado = { nome: 'faixa-de-grupo', x: 8, y: 500, w: 132, h: 96 };
		expect(lugarDaFaixa({ ...faixa, pecas: [grupoArrastado, CARTAO, PLACAR] })).toBe(378);
	});
	it('a peca acima do comeco da coluna nao vira candidata (a fileira do aviso de item fica livre)', () => {
		// o vao entre o cartao e a fileira estaria "livre" para quem esquecesse o comeco
		expect(lugarDaFaixa({ ...faixa, pecas: [CABECALHO, CARTAO] })).toBe(334);
	});
});

describe('a area coberta', () => {
	it('encostar no vao nao conta', () => {
		expect(areaCoberta({ x: 8, y: 378, w: 211, h: 61 }, [PLACAR])).toBe(0);
		expect(areaCoberta({ x: 8, y: 100, w: 211, h: 61 }, [{ x: 8, y: 165, w: 10, h: 10 }])).toBe(0);
	});
	it('peca ao lado, na mesma altura, nao conta (a coluna de 390 e os buffs)', () => {
		expect(areaCoberta({ x: 8, y: 334, w: 236, h: 61 }, BUFFS)).toBe(0);
	});
	it('um pixel dentro do vao ja conta, dos dois lados', () => {
		expect(areaCoberta({ x: 8, y: 377, w: 211, h: 61 }, [PLACAR])).toBeGreaterThan(0);
		expect(areaCoberta({ x: 8, y: 100, w: 211, h: 61 }, [{ x: 8, y: 164, w: 10, h: 10 }])).toBe(10);
		expect(areaCoberta({ x: 100, y: 100, w: 50, h: 50 }, [{ x: 153, y: 100, w: 10, h: 50 }])).toBe(50);
	});
	it('soma a area de cada peca', () => {
		const pecas = [
			{ x: 0, y: 0, w: 10, h: 10 },
			{ x: 20, y: 0, w: 10, h: 10 }
		];
		// a faixa com o vao vai de 0 a 28 em x e de 0 a 10 em y
		expect(areaCoberta({ x: 4, y: 4, w: 20, h: 2 }, pecas)).toBe(10 * 10 + 8 * 10);
	});
});

describe('o comeco da coluna', () => {
	it('e debaixo do cartao, com o vao e a fileira livre do aviso de item', () => {
		expect(inicioDaColuna([CABECALHO, CARTAO, PLACAR])).toBe(286 + VAO + FILEIRA_DO_AVISO_DE_ITEM);
	});
	it('sem cartao (jogador sem missao) e debaixo do cabecalho', () => {
		expect(inicioDaColuna([CABECALHO])).toBe(76 + 48);
	});
	it('sem cabecalho nem cartao nao ha comeco: o CSS usa o calc de nascenca', () => {
		expect(inicioDaColuna([PLACAR, ...BUFFS])).toBeNull();
		expect(inicioDaColuna([])).toBeNull();
	});
});

/** Um elemento falso com caixa e estilo. */
function el(caixa, estilo = {}) {
	const c = caixa || { x: 0, y: 0, w: 0, h: 0 };
	return {
		estilo: { visibility: 'visible', opacity: '1', ...estilo },
		getBoundingClientRect: () => ({ left: c.x, top: c.y, width: c.w, height: c.h })
	};
}

/** Um documento falso: hosts por id, shadow com seletor, estilo computado e a altura da tela. */
function docFalso({ hosts = {}, vertical = true, innerHeight = 844 } = {}) {
	return {
		documentElement: { classList: { contains: marca => vertical && marca === 'ri-vertical' } },
		getElementById: id => hosts[id] || null,
		defaultView: { innerHeight, getComputedStyle: e => e.estilo }
	};
}

/** Um host cujo shadow devolve `filhos` para o seletor `seletor`. */
function hostComShadow(seletor, filhos) {
	return { shadowRoot: { querySelectorAll: s => (s === seletor ? filhos : []) } };
}

describe('a caixa visivel', () => {
	const doc = docFalso();
	it('devolve x, y, largura e altura em pixel de viewport', () => {
		expect(caixaVisivel(el({ x: 8, y: 260, w: 248, h: 114 }), doc)).toEqual({ x: 8, y: 260, w: 248, h: 114 });
	});
	it('sem elemento, sem tamanho, escondido ou transparente: nao conta', () => {
		expect(caixaVisivel(null, doc)).toBeNull();
		expect(caixaVisivel(el({ x: 8, y: 260, w: 0, h: 114 }), doc)).toBeNull();
		expect(caixaVisivel(el({ x: 8, y: 260, w: 248, h: 0 }), doc)).toBeNull();
		expect(caixaVisivel(el({ x: 8, y: 260, w: 248, h: 114 }, { visibility: 'hidden' }), doc)).toBeNull();
		expect(caixaVisivel(el({ x: 8, y: 260, w: 248, h: 114 }, { opacity: '0' }), doc)).toBeNull();
	});
	it('meio transparente ainda e peca na tela', () => {
		expect(caixaVisivel(el({ x: 8, y: 260, w: 248, h: 114 }, { opacity: '0.5' }), doc)).not.toBeNull();
	});
	it('sem estilo computado (casca de teste) vale a caixa', () => {
		expect(caixaVisivel(el({ x: 1, y: 2, w: 3, h: 4 }), {})).toEqual({ x: 1, y: 2, w: 3, h: 4 });
	});
});

describe('as pecas da HUD medidas', () => {
	it('a lista cobre o que a rodada 1 nao via: placar, faixa de grupo, cada buff e o chat por dentro', () => {
		const por = Object.fromEntries(PECAS_DA_HUD.map(p => [p.host, p.dentro || null]));
		expect(por.PlacarMvpIdle).toBe('.pm-placar');
		expect(por.PartyHud).toBe('.ph-hud');
		expect(por.StatusIcons).toBe('.state');
		expect(por.ChatBox).toBe('#chatbox');
		expect(por.ItemObtain).toBe('#ItemObtain');
		expect(por.TopMenuIdle).toBe('.tm-fab, .tm-item');
		for (const host of ['BasicInfoIdle', 'MissoesTrackerIdle', 'CombatCornerIdle', 'HuntButtonIdle', 'ShortCut']) {
			expect(por[host], host).toBeNull();
		}
	});
	it('mede os hosts com caixa, e os ICONES de buff e a caixa do placar por dentro do shadow', () => {
		const icones = BUFFS.map(b => el(b));
		const doc = docFalso({
			hosts: {
				BasicInfoIdle: el(CABECALHO),
				MissoesTrackerIdle: el(CARTAO),
				PlacarMvpIdle: hostComShadow('.pm-placar', [el(PLACAR)]),
				StatusIcons: hostComShadow('.state', icones),
				ChatBox: hostComShadow('#chatbox', [el({ x: 8, y: 735, w: 42, h: 42 })])
			}
		});
		const pecas = medirPecas(doc);
		expect(pecas.map(p => p.nome)).toEqual(['cabecalho', 'cartao-de-missoes', 'placar-mvp', 'buff', 'buff', 'buff', 'chat']);
		expect(pecas[2]).toEqual({ ...PLACAR });
		expect(pecas.filter(p => p.nome === 'buff').map(p => p.y)).toEqual([286, 340, 394]);
	});
	it('o placar e a faixa de grupo escondidos (hidden) nao contam', () => {
		const doc = docFalso({
			hosts: {
				PlacarMvpIdle: hostComShadow('.pm-placar', [el(null)]),
				PartyHud: hostComShadow('.ph-hud', [el(null)])
			}
		});
		expect(medirPecas(doc)).toEqual([]);
	});
	it('host sem shadow: procura dentro do proprio host', () => {
		const party = el(grupo(2));
		const doc = docFalso({ hosts: { PartyHud: { querySelectorAll: s => (s === '.ph-hud' ? [party] : []) } } });
		expect(medirPecas(doc).map(p => p.nome)).toEqual(['faixa-de-grupo']);
	});
});

/** Um host da faixa falso: a caixa desenhada (canvas) e o `style` que a regra escreve. */
function faixaFalsa(caixa = { x: 8, y: 0, w: 211, h: 61 }) {
	const props = new Map();
	return {
		props,
		caixa,
		estilo: { visibility: 'visible', opacity: '1' },
		getBoundingClientRect: () => ({ left: caixa.x, top: caixa.y, width: caixa.w, height: caixa.h }),
		style: {
			setProperty: (nome, valor) => props.set(nome, valor),
			removeProperty: nome => props.delete(nome)
		}
	};
}

/** A HUD de 390x844 do critico, com o placar ligavel. */
function hudFalsa({ placar = false, innerHeight = 844 } = {}) {
	const caixaDoPlacar = { ...PLACAR };
	const elDoPlacar = {
		estilo: { visibility: 'visible', opacity: '1' },
		mostrar: placar,
		getBoundingClientRect: () =>
			elDoPlacar.mostrar
				? { left: caixaDoPlacar.x, top: caixaDoPlacar.y, width: caixaDoPlacar.w, height: caixaDoPlacar.h }
				: { left: 0, top: 0, width: 0, height: 0 }
	};
	const doc = docFalso({
		innerHeight,
		hosts: {
			BasicInfoIdle: el(CABECALHO),
			MissoesTrackerIdle: el(CARTAO),
			PlacarMvpIdle: hostComShadow('.pm-placar', [elDoPlacar]),
			StatusIcons: hostComShadow('.state', BUFFS.map(b => el(b))),
			ShortCut: el(ATALHOS)
		}
	});
	return { doc, placar: elDoPlacar };
}

describe('publicar o topo medido', () => {
	it('escreve o lugar livre na variavel que o CSS le', () => {
		const host = faixaFalsa();
		expect(publicarTopo(host, hudFalsa().doc)).toBe(334);
		expect(host.props.get(VARIAVEL_DO_TOPO)).toBe('334px');
		expect(VARIAVEL_DO_TOPO).toBe('--vr-aviso-topo');
	});
	it('com o placar na tela a faixa publicada fica debaixo dele', () => {
		const host = faixaFalsa();
		publicarTopo(host, hudFalsa({ placar: true }).doc);
		expect(host.props.get(VARIAVEL_DO_TOPO)).toBe('378px');
	});
	it('passa a medida pelo conversor da HUD (o zoom obriga) e arredonda', () => {
		const host = faixaFalsa();
		publicarTopo(host, hudFalsa({ placar: true }).doc, px => px / 3);
		expect(host.props.get(VARIAVEL_DO_TOPO)).toBe('126px');
		publicarTopo(host, hudFalsa().doc, px => px / 3);
		expect(host.props.get(VARIAVEL_DO_TOPO)).toBe('111px');
	});
	it('o pe da tela e o innerHeight: numa tela baixa a faixa nao desce para fora', () => {
		const host = faixaFalsa({ x: 8, y: 0, w: 211, h: 61 });
		// em 844 caberia debaixo do placar (378..439); em 430 nao cabe, e fica, dentro da
		// tela, na candidata que menos cobre o placar (a borda de baixo do 1o buff, 341)
		const topo = publicarTopo(host, hudFalsa({ placar: true, innerHeight: 430 }).doc);
		expect(topo + 61).toBeLessThanOrEqual(430);
		expect(topo).toBe(341);
	});
	it('a faixa nao desenhada ou a HUD sem cabecalho e cartao: a variavel SAI (calc de nascenca)', () => {
		const semCaixa = faixaFalsa({ x: 8, y: 0, w: 0, h: 0 });
		semCaixa.props.set(VARIAVEL_DO_TOPO, '999px');
		expect(publicarTopo(semCaixa, hudFalsa().doc)).toBeNull();
		expect(semCaixa.props.has(VARIAVEL_DO_TOPO)).toBe(false);
		const semHud = faixaFalsa();
		semHud.props.set(VARIAVEL_DO_TOPO, '999px');
		expect(publicarTopo(semHud, docFalso())).toBeNull();
		expect(semHud.props.has(VARIAVEL_DO_TOPO)).toBe(false);
	});
	it('soltar tira a variavel (o aparelho que gira volta ao top do desktop)', () => {
		const host = faixaFalsa();
		host.props.set(VARIAVEL_DO_TOPO, '334px');
		soltarDaVertical(host);
		expect(host.props.has(VARIAVEL_DO_TOPO)).toBe(false);
	});
});

/** Um relogio falso no molde do `Core/Events.js`: setTimeout/clearTimeout por id. */
function relogioFalso() {
	let proximo = 1;
	const pendentes = new Map();
	return {
		pendentes,
		setTimeout(fn, ms) {
			const id = proximo++;
			pendentes.set(id, { fn, ms });
			return id;
		},
		clearTimeout(id) {
			pendentes.delete(id);
		},
		andar() {
			const agora = [...pendentes.entries()];
			pendentes.clear();
			for (const [, { fn }] of agora) fn();
		}
	};
}

describe('acompanhar enquanto a faixa vive', () => {
	it('posiciona na hora e agenda a proxima medida no passo de 250 ms', () => {
		const host = faixaFalsa();
		const relogio = relogioFalso();
		acompanharNaVertical(host, hudFalsa().doc, px => px, relogio);
		expect(host.props.get(VARIAVEL_DO_TOPO)).toBe('334px');
		expect([...relogio.pendentes.values()].map(p => p.ms)).toEqual([PASSO_DO_ACOMPANHAMENTO_MS]);
		expect(PASSO_DO_ACOMPANHAMENTO_MS).toBe(250);
	});
	it('o placar que aparece DEPOIS da faixa a empurra para baixo dele na medida seguinte, e segue medindo', () => {
		const host = faixaFalsa();
		const relogio = relogioFalso();
		const hud = hudFalsa();
		acompanharNaVertical(host, hud.doc, px => px, relogio);
		hud.placar.mostrar = true;
		relogio.andar();
		expect(host.props.get(VARIAVEL_DO_TOPO)).toBe('378px');
		hud.placar.mostrar = false;
		relogio.andar();
		expect(host.props.get(VARIAVEL_DO_TOPO)).toBe('334px');
		expect(relogio.pendentes.size).toBe(1);
	});
	it('usa o conversor em toda medida, nao so na primeira', () => {
		const host = faixaFalsa();
		const relogio = relogioFalso();
		const hud = hudFalsa();
		acompanharNaVertical(host, hud.doc, px => px / 2, relogio);
		hud.placar.mostrar = true;
		relogio.andar();
		expect(host.props.get(VARIAVEL_DO_TOPO)).toBe('189px');
	});
	it('o desligador cancela a medida pendente: nada mais e escrito', () => {
		const host = faixaFalsa();
		const relogio = relogioFalso();
		const hud = hudFalsa();
		const parar = acompanharNaVertical(host, hud.doc, px => px, relogio);
		relogio.andar();
		parar();
		expect(relogio.pendentes.size).toBe(0);
		hud.placar.mostrar = true;
		relogio.andar();
		expect(host.props.get(VARIAVEL_DO_TOPO)).toBe('334px');
	});
});

describe('a HUD vertical vale?', () => {
	it('le a marca ri-vertical do <html>, a mesma que o CSS usa', () => {
		expect(ehHudVertical(docFalso({ vertical: true }))).toBe(true);
		expect(ehHudVertical(docFalso({ vertical: false }))).toBe(false);
	});
	it('sem documento nao vale (casca de teste)', () => {
		expect(ehHudVertical(null)).toBe(false);
		expect(ehHudVertical({})).toBe(false);
	});
});

const RAIZ = join(process.cwd(), 'src', 'UI');
const COMUM = readFileSync(join(RAIZ, 'Common.css'), 'utf8');
const CSS_DA_FAIXA = readFileSync(join(RAIZ, 'Components', 'Announce', 'Announce.css'), 'utf8');

/** O corpo da primeira regra cujo seletor e exatamente `seletor` no Common.css. */
function regra(seletor) {
	const inicio = COMUM.indexOf(`${seletor} {`);
	expect(inicio, `a regra ${seletor} sumiu do Common.css`).toBeGreaterThan(-1);
	const abre = COMUM.indexOf('{', inicio);
	const fecha = COMUM.indexOf('}', abre);
	return COMUM.slice(abre + 1, fecha).replace(/\s+/g, ' ');
}

describe('a costura com o CSS', () => {
	it('o CSS da vertical posiciona por VARIAVEL com o calc de nascenca de reserva, e com !important', () => {
		const corpo = regra('html.ri-vertical #Announce');
		expect(corpo, 'o top deixou de ler a variavel que o componente publica').toMatch(
			/top:\s*var\(\s*--vr-aviso-topo\s*,\s*calc\(.*\)\s*\)\s*!important/
		);
		expect(corpo, 'o left deixou de respeitar a margem e a borda segura').toMatch(
			/left:\s*calc\(\s*var\(--safe-esq, 0px\) \+ var\(--vr-margem\)\s*\)\s*!important/
		);
	});
	it('o calc de nascenca deixa a fileira do aviso de item livre debaixo do topo da HUD', () => {
		expect(regra('html.ri-vertical #Announce')).toContain('var(--vr-abaixo-do-topo) + 48px');
		expect(VAO + FILEIRA_DO_AVISO_DE_ITEM).toBe(48);
	});
	it('as constantes da regra sao as do CSS da HUD vertical (margem, trilho, cartao, fileira dos buffs)', () => {
		const tokens = regra('.ri-vertical');
		expect(tokens).toContain(`--vr-margem: ${MARGEM}px;`);
		expect(tokens).toContain(`--vr-trilho-largura: ${LARGURA_DO_TRILHO}px;`);
		expect(regra('html.ri-vertical #MissoesTrackerIdle')).toContain(
			`width: min(${LARGURA_DO_CARTAO}px, calc(100vw - var(--vr-trilho-largura) - 32px)) !important;`
		);
		expect(regra('html.ri-vertical #StatusIcons')).toContain(`+ ${FILEIRA_DO_AVISO_DE_ITEM}px +`);
	});
	it('o desktop continua com o top de sempre: o Announce.css nao mudou', () => {
		expect(CSS_DA_FAIXA).toMatch(/:host\s*\{\s*top:\s*40px;/);
	});
});
