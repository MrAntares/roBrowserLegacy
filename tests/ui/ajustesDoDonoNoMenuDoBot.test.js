/**
 * OS AJUSTES DO DONO NO MENU DO BOT (09/10/2026, prompt 12, parte do cliente), na janela real montada no jsdom:
 *  - 3.2 Ataque: o rodizio na frente (ordem numerada, liga/desliga por skill, a frase do rodizio), sem sub-abas;
 *        nivel fixo, escopo por skill e lista por monstro num "Avancado" recolhido;
 *  - 3.3 fontes do topo, do titulo da secao e da lista de secoes 20 a 25 por cento menores (base e celular);
 *  - 3.4 e 3.6 Sobrevivencia no modelo do menu antigo: interruptor, frasco com a quantidade, Automatico, barra;
 *        cada gesto CHEGA ao payload do Salvar; o padrao novo do servidor aparece certo;
 *  - 3.5 Consumiveis: uma linha por coisa que o Bot faz; a Asa automatica diz que e VIP;
 *  - 3.7 Coleta: teto 20 e padrao ligada com raio 20;
 *  - 3.8 Armazem fora do menu (e do payload); os Perfis continuam;
 *  - 3.12 Flechas: padrao ligado e o selo VIP;
 *  - o status novo `patrulhando`.
 */
import { describe, expect, it, vi } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { definirRaioDeColeta, lerColeta, lerSobrevivencia } from 'UI/Components/BotMenu/edicaoDeManutencao.js';
import { lerFlechas } from 'UI/Components/BotMenu/edicaoDeFlechas.js';
import { EXPLICACAO_DO_STATUS, explicacaoDoStatus, fraseDoStatus } from 'UI/Components/BotMenu/estadoDoBot.js';

vi.mock('Network/NetworkManager.js', () => ({
	default: { sendPacket: vi.fn(), hookPacket: vi.fn() }
}));
vi.mock('Renderer/Renderer.js', () => ({ default: { render: vi.fn(), stop: vi.fn(), width: 1280, height: 720 } }));
vi.mock('UI/UIManager.js', () => ({ default: { showErrorBox: vi.fn(), addComponent: c => c } }));
vi.mock('DB/DBManager.js', () => ({ default: { getItemInfo: () => ({ identifiedDisplayName: 'Unknown Item' }) } }));

const PASTA = join(__dirname, '..', '..', 'src', 'UI', 'Components', 'BotMenu');
const html = readFileSync(join(PASTA, 'BotMenu.html'), 'utf8');
const css = readFileSync(join(PASTA, 'BotMenu.css'), 'utf8');

async function montar() {
	vi.resetModules();
	localStorage.clear();
	const { default: Network } = await import('Network/NetworkManager.js');
	const { default: BotMenu } = await import('UI/Components/BotMenu/BotMenu.js');
	BotMenu._host = document.createElement('div');
	BotMenu._host.innerHTML = html;
	BotMenu._shadow = null;
	BotMenu.draggable = () => {};
	BotMenu.init();
	// D-2385: a janela FECHADA nao desenha (so guarda e suja); estes casos olham a janela aberta.
	BotMenu._host.querySelector('.bm-window').classList.add('is-open');
	const chamada = Network.hookPacket.mock.calls.at(-1);
	const receber = d => chamada[1]({ json: JSON.stringify(d) });
	const desde = Network.sendPacket.mock.calls.length;
	const enviados = () => Network.sendPacket.mock.calls.slice(desde).map(c => JSON.parse(c[0].json));
	return { BotMenu, Network, receber, enviados, host: BotMenu._host };
}

const BASH = { skillId: 5, chave: 'SM_BASH', nome: 'Golpe Fulminante', aprendido: 10, aceita: true, suporte: null, alcancaGrupo: false };
const FOGO = { skillId: 19, chave: 'MG_FIREBOLT', nome: 'Lanças de Fogo', aprendido: 10, aceita: true, suporte: null, alcancaGrupo: false };
const GELO = { skillId: 14, chave: 'MG_COLDBOLT', nome: 'Lanças de Gelo', aprendido: 10, aceita: true, suporte: null, alcancaGrupo: false };
const MONSTROS = [
	{ especie: 1002, nome: 'Poring' },
	{ especie: 1113, nome: 'Drops' }
];
const POCOES = [
	{ itemId: 501, nome: 'Poção Vermelha', hp: true, sp: false, quantidade: 30 },
	{ itemId: 502, nome: 'Poção Laranja', hp: true, sp: false, quantidade: 20 },
	{ itemId: 505, nome: 'Poção Azul', hp: false, sp: true, quantidade: 15 }
];

/** O padrao NOVO do servidor (contrato de 09/10): HP e SP ligados em 50 %, Automatico ligado, sem frasco. */
function sobrevivenciaPadrao() {
	return {
		pocoesHp: { itens: [], abaixoDe: 50, auto: true },
		pocoesSp: { itens: [], abaixoDe: 50, auto: true },
		descanso: { sentarHpAbaixoDe: 0, sentarSpAbaixoDe: 0, levantarEm: 100 }
	};
}

function config(extra = {}) {
	return {
		v: 1,
		cacar: true,
		raioDePercepcao: 12,
		especiesVetadas: [],
		modoDeAtaque: 'skills-e-basico',
		skills: { geral: [{ skillId: 5, nivel: 'aprendido' }, { skillId: 19, nivel: 'aprendido' }], porSkill: {}, porMonstro: {} },
		sobrevivencia: sobrevivenciaPadrao(),
		suporte: { lista: [] },
		coleta: { ligada: true, raio: 20, ignorar: [] },
		flechas: { ligada: true, modo: 'automatico', fixa: null, permitidas: [], porMonstro: {} },
		armazem: { ligado: false, cidade: null, pesoAcimaDe: 0, depositar: [], reservas: [], repor: [], tetoDeGasto: 0, voltar: true },
		...extra
	};
}

const TODAS = ['cacada', 'ataque', 'suporte', 'sobrevivencia', 'consumiveis', 'coleta', 'flechas', 'postura', 'armazem', 'perfis', 'avancado'];

function status(secoes = TODAS, extra = {}) {
	return {
		v: 1,
		tipo: 'status',
		requestId: null,
		personagemId: 7,
		mapa: 'prt_fild08',
		contexto: { mapa: 'prt_fild08', rotuloDoMapa: 'Campos de Prontera', ehCidade: false },
		ok: true,
		erro: null,
		problemas: [],
		revisao: 0,
		config: config(),
		ligado: false,
		situacao: 'desligado',
		status: { codigo: 'controle-manual', alvo: null },
		statusRevision: 0,
		capacidades: { contrato: 1, versaoDaConfig: 1, limites: { raioDeColetaMinimo: 1, raioDeColetaMaximo: 20 }, secoes },
		monstros: MONSTROS,
		skills: [BASH, FOGO, GELO],
		pocoes: POCOES,
		municoes: [],
		municao: { vip: true, manual: null, tetoAutomatico: 4 },
		consumiveis: { buffs: [{ itemId: 645, nome: 'Poção da Concentração', quantidade: 5, serve: true, ativo: false }], asa: { quantidade: 25, vip: true } },
		...extra
	};
}

function irPara(host, nome) {
	const aba = [...host.querySelectorAll('.bm-aba')].find(b => b.textContent === nome);
	expect(aba, 'sem a aba ' + nome).toBeTruthy();
	aba.click();
}

function mudar(input, valor, evento = 'change') {
	if (input.type === 'checkbox') {
		input.checked = !!valor;
	} else {
		input.value = String(valor);
	}
	input.dispatchEvent(new Event(evento));
}

function ultimoAplicar(enviados) {
	const a = enviados().filter(e => e.verbo === 'aplicar').at(-1);
	expect(a, 'nenhum aplicar foi enviado').toBeTruthy();
	return a;
}

/* ===================== 3.2 ATAQUE ===================== */

describe('3.2 Ataque: o rodizio na frente, o resto no Avancado', () => {
	async function noAtaque(extra) {
		const m = await montar();
		m.receber(status(TODAS, extra));
		irPara(m.host, 'Ataque');
		return m;
	}

	it('sem sub-abas; o rodizio mostra as skills em ordem numerada e explica o 1, 2, 3, 1 numa linha', async () => {
		const { host } = await noAtaque();
		expect(host.querySelectorAll('.bm-subaba').length, 'as sub-abas Geral/Por Skill/Por Monstro continuam').toBe(0);
		const linhas = [...host.querySelectorAll('.bm-rodizio .bm-rodizio-item')];
		expect(linhas.map(l => l.getAttribute('data-skill'))).toEqual(['5', '19']);
		expect(linhas.map(l => l.querySelector('.bm-rodizio-ordem').textContent)).toEqual(['1', '2']);
		expect(linhas[1].querySelector('.bm-rodizio-nome').textContent).toBe('Lanças de Fogo');
		const frase = host.querySelector('.bm-rodizio-explica').textContent;
		expect(frase).toMatch(/1, 2, 3, 1/);
		expect(frase).toMatch(/recarga/);
		// A skill que o Bot sabe usar e esta fora do rodizio aparece com o "Usar".
		const fora = host.querySelector('.bm-rodizio-fora [data-skill="14"]');
		expect(fora).toBeTruthy();
		expect(fora.querySelector('.bm-rodizio-usar')).toBeTruthy();
		// O Avancado existe e comeca RECOLHIDO.
		const avancado = host.querySelector('[data-secao="ataque"] .bm-ataque-avancado');
		expect(avancado.tagName).toBe('DETAILS');
		expect(avancado.open).toBe(false);
		expect(avancado.querySelector('.bm-por-skill')).toBeTruthy();
		expect(avancado.querySelector('.bm-skills')).toBeTruthy();
	});

	it('desligar uma skill grava `porSkill[id].ativa = false`, a posicao fica, e chega ao payload do Salvar', async () => {
		const { host, BotMenu, enviados } = await noAtaque();
		const chave = host.querySelector('.bm-rodizio-item[data-skill="5"] .bm-rodizio-ativa');
		expect(chave.checked).toBe(true);
		mudar(chave, false);
		const s = BotMenu._estado.estado();
		expect(s.editConfig.skills.porSkill['5'].ativa).toBe(false);
		expect(s.editConfig.skills.geral.map(e => e.skillId)).toEqual([5, 19]);
		const linha = host.querySelector('.bm-rodizio-item[data-skill="5"]');
		expect(linha.classList.contains('is-desligada')).toBe(true);
		expect(linha.querySelector('.bm-rodizio-ordem').textContent).toBe('1');
		host.querySelector('.bm-aplicar').click();
		const a = ultimoAplicar(enviados);
		expect(a.config.skills.porSkill['5']).toEqual({ ativa: false, especies: null });
		expect(a.config.skills.geral.map(e => e.skillId)).toEqual([5, 19]);
	});

	it('subir, descer, tirar do rodizio e usar uma de fora mexem na ordem da lista geral', async () => {
		const { host, BotMenu } = await noAtaque();
		const geral = () => BotMenu._estado.estado().editConfig.skills.geral.map(e => e.skillId);
		host.querySelector('.bm-rodizio-item[data-skill="19"] .bm-sobe').click();
		expect(geral()).toEqual([19, 5]);
		host.querySelector('.bm-rodizio-fora [data-skill="14"] .bm-rodizio-usar').click();
		expect(geral()).toEqual([19, 5, 14]);
		host.querySelector('.bm-rodizio-item[data-skill="5"] .bm-remove').click();
		expect(geral()).toEqual([19, 14]);
		expect(host.querySelector('.bm-rodizio-fora [data-skill="5"]')).toBeTruthy();
		host.querySelector('.bm-rodizio-item[data-skill="19"] .bm-desce').click();
		expect(geral()).toEqual([14, 19]);
	});

	it('o Avancado tem o nivel e o escopo por skill e a lista por monstro (so especies, sem a opcao geral)', async () => {
		const { host, BotMenu } = await noAtaque();
		const avancado = host.querySelector('.bm-ataque-avancado');
		const cartao = avancado.querySelector('.bm-ps-cartao[data-skill="5"]');
		cartao.querySelector('.bm-passo-menos').click();
		expect(BotMenu._estado.estado().editConfig.skills.geral[0]).toEqual({ skillId: 5, nivel: 9 });
		const escopo = avancado.querySelector('.bm-escopo');
		expect([...escopo.options].map(o => o.value)).not.toContain('geral');
		expect(escopo.value).toBe('1002');
		const propria = avancado.querySelector('.bm-usar-propria');
		mudar(propria, true);
		expect(BotMenu._estado.estado().editConfig.skills.porMonstro['1002']).toEqual({ herdar: false, lista: [] });
	});

	it('sem monstro no mapa o Avancado diz o motivo da lista por monstro vazia', async () => {
		const { host } = await noAtaque({ monstros: [] });
		const aviso = host.querySelector('.bm-ataque-avancado .bm-por-monstro-vazio');
		expect(aviso.hidden).toBe(false);
		expect(aviso.textContent).toBe('Nenhum monstro neste mapa para montar uma lista própria.');
	});

	it('servidor sem skills no Bot: o aviso de indisponivel e nenhuma linha', async () => {
		const { host } = await noAtaque({ skills: undefined });
		expect(host.querySelector('[data-secao="ataque"] .bm-indisponivel').hidden).toBe(false);
		expect(host.querySelectorAll('.bm-rodizio-item').length).toBe(0);
	});
});

/* ===================== 3.3 FONTES ===================== */

/** O tamanho de fonte declarado para `seletor` na base (fora de @media) ou dentro do @media indicado. */
function fonteDe(seletor, media = null) {
	let texto = css;
	if (media) {
		const i = css.indexOf(media);
		expect(i, 'sem o bloco ' + media).toBeGreaterThan(-1);
		texto = css.slice(i);
		// Ate o fim do bloco @media (chaves balanceadas).
		let nivel = 0;
		let fim = texto.indexOf('{');
		for (let k = fim; k < texto.length; k++) {
			if (texto[k] === '{') nivel++;
			if (texto[k] === '}') {
				nivel--;
				if (nivel === 0) {
					fim = k;
					break;
				}
			}
		}
		texto = texto.slice(0, fim);
	} else {
		texto = css.slice(0, css.indexOf('@media'));
	}
	const regras = [...texto.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
	let achado = null;
	for (const [, sel, corpo] of regras) {
		const lista = sel.replace(/\/\*[\s\S]*?\*\//g, '').split(',').map(s => s.trim());
		if (lista.includes(seletor)) {
			const m = corpo.match(/font-size:\s*([\d.]+)px/);
			if (m) achado = Number(m[1]);
		}
	}
	return achado;
}

describe('3.3 fontes 20 a 25 por cento menores (topo, titulo da secao, lista de secoes)', () => {
	const ANTES_BASE = {
		'#BotMenu .bm-cartao-rotulo': 18,
		'#BotMenu .bm-mapa': 18,
		'#BotMenu .bm-perfil-escolha': 18,
		'#BotMenu .bm-liga': 15,
		'#BotMenu .bm-secao-titulo': 22,
		'#BotMenu .bm-aba.ri-tab': 16
	};
	const ANTES_CELULAR = {
		'#BotMenu .bm-mapa': 16,
		'#BotMenu .bm-perfil-escolha': 16,
		'#BotMenu .bm-aba.ri-tab': 14
	};
	for (const [sel, antes] of Object.entries(ANTES_BASE)) {
		it('base: ' + sel + ' cai de ' + antes + 'px para 75 a 80 por cento', () => {
			const agora = fonteDe(sel);
			expect(agora, sel + ' sem font-size').not.toBeNull();
			expect(agora / antes).toBeGreaterThanOrEqual(0.75);
			expect(agora / antes).toBeLessThanOrEqual(0.8);
		});
	}
	for (const [sel, antes] of Object.entries(ANTES_CELULAR)) {
		it('celular (max-width 720px): ' + sel + ' cai de ' + antes + 'px para 75 a 80 por cento', () => {
			const agora = fonteDe(sel, '@media (max-width: 720px)');
			expect(agora, sel + ' sem font-size no celular').not.toBeNull();
			expect(agora / antes).toBeGreaterThanOrEqual(0.75);
			expect(agora / antes).toBeLessThanOrEqual(0.8);
		});
	}
});

/* ===================== 3.4 e 3.6 SOBREVIVENCIA ===================== */

describe('3.4 e 3.6 Sobrevivencia no modelo do menu antigo, e cada gesto chega ao payload', () => {
	async function naSobrevivencia(extra) {
		const m = await montar();
		m.receber(status(TODAS, extra));
		irPara(m.host, 'Sobrevivência');
		const eixo = e => m.host.querySelector('.bm-pocoes[data-eixo="' + e + '"]');
		return { ...m, eixo };
	}

	it('o padrao novo do servidor aparece certo: ligado, Automatico ligado, barra em 50, sem frasco e sem aviso', async () => {
		const { eixo } = await naSobrevivencia();
		for (const e of ['hp', 'sp']) {
			const b = eixo(e);
			expect(b.querySelector('.bm-eixo-ligado').checked, e + ' ligado').toBe(true);
			expect(b.querySelector('.bm-eixo-auto').checked, e + ' automatico').toBe(true);
			expect(b.querySelector('.bm-limiar').type).toBe('range');
			expect(b.querySelector('.bm-limiar').value).toBe('50');
			expect(b.querySelector('.bm-limiar-valor').textContent).toBe('50%');
			expect(b.querySelector('.bm-frasco').value).toBe('');
			expect(b.querySelector('.bm-sem-frasco').hidden, e + ' aviso indevido').toBe(true);
		}
		// O frasco lista so as pocoes do eixo, com a quantidade no inventario.
		const opcoesHp = [...eixo('hp').querySelectorAll('.bm-frasco option')].map(o => o.textContent);
		expect(opcoesHp).toContain('Poção Vermelha (30 no inventário)');
		expect(opcoesHp).toContain('Poção Laranja (20 no inventário)');
		expect(opcoesHp.some(t => /Azul/.test(t))).toBe(false);
		const opcoesSp = [...eixo('sp').querySelectorAll('.bm-frasco option')].map(o => o.textContent);
		expect(opcoesSp).toContain('Poção Azul (15 no inventário)');
	});

	it('escolher o frasco, desligar o Automatico, mexer na barra e desligar um eixo CHEGAM ao payload do Salvar', async () => {
		const { eixo, host, enviados } = await naSobrevivencia();
		const hp = eixo('hp');
		mudar(hp.querySelector('.bm-eixo-auto'), false);
		// Ligado, sem Automatico e sem frasco: o Bot nao teria o que beber, e a tela diz.
		expect(hp.querySelector('.bm-sem-frasco').hidden).toBe(false);
		mudar(hp.querySelector('.bm-frasco'), 502);
		expect(hp.querySelector('.bm-sem-frasco').hidden).toBe(true);
		mudar(hp.querySelector('.bm-limiar'), 35, 'input');
		expect(hp.querySelector('.bm-limiar-valor').textContent).toBe('35%');
		mudar(eixo('sp').querySelector('.bm-eixo-ligado'), false);
		host.querySelector('.bm-aplicar').click();
		const a = ultimoAplicar(enviados);
		expect(a.config.sobrevivencia.pocoesHp).toEqual({ itens: [502], abaixoDe: 35, auto: false });
		expect(a.config.sobrevivencia.pocoesSp).toEqual({ itens: [], abaixoDe: 0, auto: true });
	});

	it('religar o eixo volta ao ultimo valor da barra (ou 50); o frasco preferido com Automatico ligado tambem vai', async () => {
		const { eixo, host, enviados, BotMenu } = await naSobrevivencia();
		const sp = eixo('sp');
		mudar(sp.querySelector('.bm-limiar'), 40, 'input');
		mudar(sp.querySelector('.bm-eixo-ligado'), false);
		expect(sp.querySelector('.bm-limiar').disabled).toBe(true);
		mudar(sp.querySelector('.bm-eixo-ligado'), true);
		expect(BotMenu._estado.estado().editConfig.sobrevivencia.pocoesSp.abaixoDe).toBe(40);
		mudar(sp.querySelector('.bm-frasco'), 505);
		host.querySelector('.bm-aplicar').click();
		expect(ultimoAplicar(enviados).config.sobrevivencia.pocoesSp).toEqual({ itens: [505], abaixoDe: 40, auto: true });
	});

	it('voltar o frasco para "nenhum" tira a pocao; frasco salvo sem estoque aparece com 0 e avisa sem Automatico', async () => {
		const sob = sobrevivenciaPadrao();
		sob.pocoesHp = { itens: [504], abaixoDe: 30, auto: false };
		const { eixo, BotMenu } = await naSobrevivencia({ config: config({ sobrevivencia: sob }) });
		const hp = eixo('hp');
		const frasco = hp.querySelector('.bm-frasco');
		expect(frasco.value).toBe('504');
		expect(frasco.selectedOptions[0].textContent).toMatch(/\(0 no inventário\)/);
		expect(hp.querySelector('.bm-frasco-acabou').hidden).toBe(false);
		// Trocar o frasco poe o novo na frente e mantem o resto da ordem salva (o servidor tenta na ordem).
		mudar(frasco, 501);
		expect(BotMenu._estado.estado().editConfig.sobrevivencia.pocoesHp.itens).toEqual([501, 504]);
		mudar(hp.querySelector('.bm-frasco'), '');
		expect(BotMenu._estado.estado().editConfig.sobrevivencia.pocoesHp.itens).toEqual([]);
	});

	it('config gravada antes do campo `auto` (ausente) le Automatico desligado; o bloco ausente le o padrao novo', () => {
		const velha = { sobrevivencia: { pocoesHp: { itens: [501], abaixoDe: 20 }, pocoesSp: { itens: [], abaixoDe: 0 }, descanso: { sentarHpAbaixoDe: 0, sentarSpAbaixoDe: 0, levantarEm: 100 } } };
		expect(lerSobrevivencia(velha).pocoesHp).toEqual({ itens: [501], abaixoDe: 20, auto: false });
		const nova = lerSobrevivencia({});
		expect(nova.pocoesHp).toEqual({ itens: [], abaixoDe: 50, auto: true });
		expect(nova.pocoesSp).toEqual({ itens: [], abaixoDe: 50, auto: true });
		expect(nova.descanso).toEqual({ sentarHpAbaixoDe: 0, sentarSpAbaixoDe: 0, levantarEm: 100 });
	});

	it('o descanso no mesmo estilo: interruptor e barra por eixo; ligar o sentar grava 30 e a barra edita', async () => {
		const { host, BotMenu } = await naSobrevivencia();
		const ligar = host.querySelector('.bm-sentar-hp-ligado');
		expect(ligar.checked).toBe(false);
		expect(host.querySelector('.bm-sentar-hp').type).toBe('range');
		mudar(ligar, true);
		expect(BotMenu._estado.estado().editConfig.sobrevivencia.descanso.sentarHpAbaixoDe).toBe(30);
		mudar(host.querySelector('.bm-sentar-hp'), 25, 'input');
		expect(BotMenu._estado.estado().editConfig.sobrevivencia.descanso.sentarHpAbaixoDe).toBe(25);
		mudar(host.querySelector('.bm-levantar'), 90, 'input');
		expect(BotMenu._estado.estado().editConfig.sobrevivencia.descanso.levantarEm).toBe(90);
		mudar(ligar, false);
		expect(BotMenu._estado.estado().editConfig.sobrevivencia.descanso.sentarHpAbaixoDe).toBe(0);
	});
});

/* ===================== 3.5 CONSUMIVEIS ===================== */

describe('3.5 Consumiveis: uma linha por coisa que o Bot faz, a Asa diz que e VIP', () => {
	it('a Asa tem o selo VIP visivel mesmo COM o passe, e a frase do beneficio; cada gatilho e uma linha com interruptor', async () => {
		const { host } = await montar().then(m => {
			m.receber(status());
			irPara(m.host, 'Consumíveis');
			return m;
		});
		const asa = host.querySelector('.bm-asa');
		expect(asa.querySelector('.bm-selo-vip').textContent).toBe('VIP');
		expect(asa.querySelector('.bm-asa-vip-dica').hidden).toBe(false);
		expect(asa.querySelector('.bm-asa-vip-dica').textContent).toMatch(/benefício VIP/i);
		for (const g of ['hp', 'cercado', 'sem-alvo']) {
			const linha = asa.querySelector('.bm-gatilho-' + g);
			expect(linha.querySelector('.bm-interruptor input[type="checkbox"]'), g).toBeTruthy();
		}
		expect(asa.querySelector('.bm-gatilho-hp').textContent).toMatch(/Quando a vida cair para/);
		expect(asa.querySelector('.bm-gatilho-cercado').textContent).toMatch(/Quando estiver cercado por/);
		expect(asa.querySelector('.bm-gatilho-sem-alvo').textContent).toMatch(/Quando ficar/);
		// A pocao de velocidade: interruptor no mesmo estilo.
		expect(host.querySelector('.bm-interruptor .bm-buffs-ligado')).toBeTruthy();
	});
});

/* ===================== 3.7 COLETA ===================== */

describe('3.7 Coleta: teto 20 e o padrao novo', () => {
	it('a barra vai ate o teto anunciado (20) e, sem o anuncio, o teto de fabrica tambem e 20', async () => {
		const m = await montar();
		m.receber(status());
		irPara(m.host, 'Coleta');
		expect(m.host.querySelector('.bm-raio-coleta').max).toBe('20');
		expect(m.host.querySelector('.bm-raio-coleta').value).toBe('20');
		const m2 = await montar();
		m2.receber(status(TODAS, { capacidades: { contrato: 1, versaoDaConfig: 1, limites: {}, secoes: TODAS } }));
		irPara(m2.host, 'Coleta');
		expect(m2.host.querySelector('.bm-raio-coleta').max).toBe('20');
	});

	it('padrao ligada com raio 20; o raio aceita 20 sem passar o teto', () => {
		expect(lerColeta({})).toEqual({ ligada: true, raio: 20, ignorar: [] });
		expect(definirRaioDeColeta({}, 20).coleta.raio).toBe(20);
		expect(definirRaioDeColeta({}, 25).coleta.raio).toBe(20);
	});
});

/* ===================== 3.8 ARMAZEM ===================== */

describe('3.8 Armazem sai do menu; os Perfis continuam', () => {
	it('mesmo anunciada pelo servidor velho, a secao Armazem nao aparece e nao existe no HTML', async () => {
		const m = await montar();
		m.receber(status());
		const abas = [...m.host.querySelectorAll('.bm-aba')].map(b => b.textContent);
		expect(abas).not.toContain('Armazém');
		expect(abas).toContain('Perfis');
		expect(m.host.querySelector('[data-secao="armazem"]')).toBeNull();
		expect(html).not.toMatch(/Armazém/);
	});

	it('os editores do Armazem sairam; os Perfis tem arquivo proprio', async () => {
		expect(existsSync(join(PASTA, 'editorDeArmazem.js'))).toBe(false);
		expect(existsSync(join(PASTA, 'edicaoDeArmazem.js'))).toBe(false);
		const perfis = join(PASTA, 'editorDePerfis.js');
		expect(existsSync(perfis)).toBe(true);
		expect(readFileSync(perfis, 'utf8')).toMatch(/export function desenharPerfis\(/);
	});

	it('o payload do Salvar omite o bloco `armazem`', async () => {
		const m = await montar();
		m.receber(status());
		mudar(m.host.querySelector('.bm-raio'), 9, 'input');
		m.host.querySelector('.bm-aplicar').click();
		const a = ultimoAplicar(m.enviados);
		expect('armazem' in a.config).toBe(false);
		expect(a.config.raioDePercepcao).toBe(9);
	});
});

/* ===================== 3.12 FLECHAS ===================== */

describe('3.12 Flechas: padrao ligado e o VIP claro', () => {
	it('o bloco ausente le a troca ligada, automatica, todas permitidas', () => {
		expect(lerFlechas({})).toEqual({ ligada: true, modo: 'automatico', fixa: null, permitidas: [], porMonstro: {} });
	});

	it('o cartao das Flechas tem o selo VIP e a frase do beneficio mesmo com o passe', async () => {
		const m = await montar();
		m.receber(status());
		irPara(m.host, 'Ataque');
		const cartao = m.host.querySelector('.bm-cartao-flechas');
		expect(cartao.querySelector('.bm-selo-vip').textContent).toBe('VIP');
		const dica = cartao.querySelector('.bm-flechas-vip-dica');
		expect(dica.hidden).toBe(false);
		expect(dica.textContent).toMatch(/benefício VIP/);
	});
});

/* ===================== STATUS patrulhando ===================== */

describe('o status novo `patrulhando`', () => {
	it('tem frase curta e explicacao', () => {
		expect(fraseDoStatus({ codigo: 'patrulhando', alvo: null })).toBe('Patrulhando o mapa');
		expect(EXPLICACAO_DO_STATUS.patrulhando).toBeTruthy();
		expect(explicacaoDoStatus({ codigo: 'patrulhando', alvo: null })).toMatch(/mapa/);
	});

	it('o catalogo en publicado traduz a frase', () => {
		const cat = JSON.parse(readFileSync(join(__dirname, '..', '..', 'public', 'ragidle', 'i18n', 'en', 'catalogo.json'), 'utf8'));
		expect(cat.exatos['Patrulhando o mapa']).toBe('Patrolling the map');
	});
});

describe('so 3 skills de ataque equipadas por vez (pedido do dono, 09/10/2026)', () => {
	const base = { skills: { geral: [{ skillId: 1, nivel: 'aprendido' }, { skillId: 2, nivel: 'aprendido' }, { skillId: 3, nivel: 'aprendido' }], porSkill: {}, porMonstro: {} } };

	it('com o teto 3 a quarta skill nao entra (a lista segue igual), e a terceira entra', async () => {
		const { adicionarSkill } = await import('UI/Components/BotMenu/edicaoDeSkills.js');
		const duas = { skills: { geral: base.skills.geral.slice(0, 2), porSkill: {}, porMonstro: {} } };
		expect(adicionarSkill(duas, 'geral', 3, 3).skills.geral.map(e => e.skillId)).toEqual([1, 2, 3]);
		expect(adicionarSkill(base, 'geral', 4, 3).skills.geral.map(e => e.skillId)).toEqual([1, 2, 3]);
	});

	it('o cliente nao inventa teto maior que o do servidor: o plano B (sem capacidades) tambem e 3', () => {
		const fonte = readFileSync(join(PASTA, 'BotMenu.js'), 'utf8');
		expect(fonte).toContain('lim.skillsNaListaGeral || 3');
		expect(fonte).toContain('lim.skillsPorMonstro || 3');
		expect(fonte).not.toMatch(/skillsNaListaGeral \|\| 12/);
	});
});
