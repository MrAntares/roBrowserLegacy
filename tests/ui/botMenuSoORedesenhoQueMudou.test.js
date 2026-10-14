/**
 * O MENU DO BOT REDESENHA SO O QUE MUDOU (D-2385, 14/10/2026).
 *
 * O servidor manda ~0,4 status por segundo por Bot ligado, e cada um refazia a
 * janela INTEIRA (as listas do rodizio, das skills, dos monstros, das pocoes,
 * dos perfis...), mesmo FECHADA. Agora a fechada so guarda e suja, e a aberta
 * refaz so o bloco cujas entradas mudaram.
 *
 *  1. O ORACULO: a mesma sequencia de pacotes e gestos em duas janelas, uma no
 *     caminho de antes (`_redesenharSempre(true)`, redesenha tudo, aberta ou
 *     fechada) e outra no de agora. O DOM (o HTML e o estado dos controles)
 *     tem de ser IGUAL depois de cada passo com a janela aberta, inclusive ao
 *     abrir depois de ficar fechada recebendo pacotes. A sequencia muda cada
 *     entrada de cada bloco ao menos uma vez com a janela aberta.
 *  2. O PORTAO por contagem: status so de operacao com a janela aberta refaz
 *     so o topo e o Avancado e nao cria elemento nenhum; fechada, nada; ao
 *     abrir, tudo uma vez. O botao "Ataque auto" segue avisado a cada pacote.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

vi.mock('Network/NetworkManager.js', () => ({
	default: { sendPacket: vi.fn(), hookPacket: vi.fn() }
}));
vi.mock('Renderer/Renderer.js', () => ({ default: { render: vi.fn(), stop: vi.fn(), width: 1280, height: 720 } }));
vi.mock('UI/UIManager.js', () => ({ default: { showErrorBox: vi.fn(), addComponent: c => c } }));
vi.mock('DB/DBManager.js', () => ({
	default: { getItemInfo: id => ({ identifiedDisplayName: id === 909 ? 'Jellopy' : id === 512 ? 'Maçã' : 'Unknown Item' }) }
}));

const html = readFileSync(join(__dirname, '..', '..', 'src', 'UI', 'Components', 'BotMenu', 'BotMenu.html'), 'utf8');

const SECOES = ['cacada', 'ataque', 'suporte', 'sobrevivencia', 'consumiveis', 'coleta', 'flechas', 'postura', 'perfis', 'avancado'];

const SKILLS = [
	{ skillId: 5, chave: 'SM_BASH', nome: 'Golpe Fulminante', aprendido: 10, aceita: true, suporte: null, alcancaGrupo: false },
	{ skillId: 7, chave: 'SM_MAGNUM', nome: 'Impacto Explosivo', aprendido: 5, aceita: true, suporte: null, alcancaGrupo: false },
	{ skillId: 29, chave: 'AL_INCAGI', nome: 'Aumentar Agilidade', aprendido: 10, aceita: false, suporte: 'buff', alcancaGrupo: true },
	{ skillId: 28, chave: 'AL_HEAL', nome: 'Curar', aprendido: 10, aceita: false, suporte: 'cura', alcancaGrupo: true }
];
const MONSTROS = [
	{ especie: 1002, nome: 'Poring' },
	{ especie: 1007, nome: 'Fabre' }
];
const POCOES = [
	{ itemId: 501, nome: 'Poção Vermelha', hp: true, sp: false, quantidade: 12 },
	{ itemId: 505, nome: 'Poção Azul', hp: false, sp: true, quantidade: 3 }
];
const MUNICOES = [
	{ itemId: 1750, nome: 'Flecha', quantidade: 500, preco: 1, vestida: true },
	{ itemId: 1752, nome: 'Flecha de Fogo', quantidade: 100, preco: 3, vestida: false }
];
const CONSUMIVEIS = {
	buffs: [{ itemId: 645, nome: 'Poção de Concentração', quantidade: 3, serve: true, motivo: null, ativo: false }],
	asa: { quantidade: 4, vip: true }
};
const LIMITES = { skillsDeSuporte: 64, skillsNaListaGeral: 3, skillsPorMonstro: 3, pocoesPorLista: 6, buffsDeItem: 6, asaHpMinimo: 5, asaHpMaximo: 80 };

function config(extra = {}) {
	return {
		v: 1,
		cacar: true,
		raioDePercepcao: 12,
		especiesVetadas: [],
		modoDeAtaque: 'skills-e-basico',
		// O Fabre tem lista PROPRIA: trocar a especie do Avancado do Ataque muda o que a tela mostra.
		skills: { geral: [{ skillId: 5, nivel: 'aprendido' }], porSkill: {}, porMonstro: { 1007: { herdar: false, lista: [{ skillId: 7, nivel: 'aprendido' }] } } },
		postura: { tipo: 'tank', fallbackMelee: false },
		sobrevivencia: {
			pocoesHp: { itens: [501], abaixoDe: 50, auto: true },
			pocoesSp: { itens: [], abaixoDe: 50, auto: true },
			descanso: { sentarHpAbaixoDe: 0, sentarSpAbaixoDe: 0, levantarEm: 100 }
		},
		suporte: { lista: [{ skillId: 29, nivel: 'aprendido', destino: 'eu', gatilho: 'manter', limiar: 0 }] },
		coleta: { ligada: true, raio: 5, ignorar: [909] },
		flechas: { ligada: true, modo: 'automatico', fixa: null, permitidas: [], porMonstro: {} },
		consumiveis: { buffs: { ligado: false, itens: [] }, asa: { ligada: false, semAlvoPorSegundos: 10, cercadoPor: 0, hpAbaixoDe: 0, reserva: 0 } },
		...extra
	};
}

/** O pacote INTEIRO (a resposta a um pedido, ou o primeiro status da conexao). */
function inteiro(extra = {}) {
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
		revisao: 1,
		config: config(),
		ligado: false,
		situacao: 'desligado',
		status: { codigo: 'controle-manual', alvo: null },
		statusRevision: 0,
		capacidades: { contrato: 1, versaoDaConfig: 1, limites: LIMITES, secoes: SECOES },
		monstros: MONSTROS,
		skills: SKILLS,
		pocoes: POCOES,
		municoes: MUNICOES,
		municao: { vip: true, manual: null, tetoAutomatico: 4 },
		consumiveis: CONSUMIVEIS,
		grupo: { emGrupo: false, posto: null, postoNome: null },
		perfis: [
			{ nome: 'Party', classe: 7, postura: 'tank' },
			{ nome: 'Solo', classe: 7, postura: 'melee-dps' }
		],
		perfilAtivo: null,
		cidades: ['prontera'],
		diagnostico: null,
		...extra
	};
}

const CODIGOS = [
	{ codigo: 'procurando-alvo', alvo: null },
	{ codigo: 'indo-ate-alvo', alvo: { nome: 'Poring', especie: 1002 } },
	{ codigo: 'atacando', alvo: { nome: 'Poring', especie: 1002 } },
	{ codigo: 'coletando', alvo: null },
	{ codigo: 'atacando', alvo: { nome: 'Fabre', especie: 1007 } }
];

/** O status como o servidor manda desde a D-2366: o operacional, e SO os blocos que mudaram (`extra`). */
let _rev = 0;
function so(extra = {}) {
	_rev++;
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
		revisao: 1,
		ligado: true,
		situacao: 'ativo',
		status: CODIGOS[_rev % CODIGOS.length],
		statusRevision: _rev,
		agora: 1000 * _rev,
		diagnostico: null,
		...extra
	};
}

async function montar({ sempre, aberta = true }) {
	vi.resetModules();
	localStorage.clear();
	_rev = 0;
	const { default: Network } = await import('Network/NetworkManager.js');
	const { default: BotMenu } = await import('UI/Components/BotMenu/BotMenu.js');
	BotMenu._host = document.createElement('div');
	BotMenu._host.innerHTML = html;
	BotMenu._shadow = null;
	BotMenu.draggable = () => {};
	BotMenu.focus = () => {};
	// So o oraculo liga o caminho de antes: o padrao do modulo (o de producao) e o que os outros casos medem.
	if (sempre) {
		BotMenu._redesenharSempre(true);
	}
	BotMenu.init();
	if (aberta) {
		BotMenu._host.querySelector('.bm-window').classList.add('is-open');
	}
	const chamada = Network.hookPacket.mock.calls.at(-1);
	const receber = d => chamada[1]({ json: JSON.stringify(d) });
	const desde = Network.sendPacket.mock.calls.length;
	const enviados = () => Network.sendPacket.mock.calls.slice(desde).map(c => JSON.parse(c[0].json));
	/** A resposta ao ultimo pedido com este verbo (o `requestId` dele). */
	const responder = (verbo, extra) => {
		const pedido = enviados().filter(p => p.verbo === verbo).at(-1);
		receber(inteiro({ tipo: 'resposta', requestId: pedido.requestId, statusRevision: _rev, ...extra }));
	};
	return { BotMenu, receber, responder, enviados, host: BotMenu._host };
}

/** O que a tela mostra: o HTML e o estado dos controles (que nao vai para o HTML: `checked`, `value`). */
function retrato(host) {
	const controles = [...host.querySelectorAll('input, select, textarea, details')].map(e => [
		e.tagName,
		e.className,
		e.checked,
		e.value,
		e.disabled,
		e.open,
		e.selectedIndex
	]);
	return host.innerHTML + '\n' + JSON.stringify(controles);
}

const irPara = (host, nome) => {
	const aba = [...host.querySelectorAll('.bm-abas .ri-tab')].find(b => b.textContent === nome);
	expect(aba, 'sem a aba ' + nome).toBeTruthy();
	aba.click();
};

/**
 * A SEQUENCIA: cada passo devolve o retrato da tela (ou null com a janela fechada). Ela muda, com a janela
 * aberta, cada entrada de cada bloco ao menos uma vez (ver o comentario de `bloco` no BotMenu).
 */
async function sequencia({ sempre }) {
	const m = await montar({ sempre, aberta: false });
	const { BotMenu, receber, responder, host } = m;
	let mochila = [{ ITID: 909, count: 3 }];
	BotMenu.lerMochila = () => mochila;
	const aberta = () => host.querySelector('.bm-window').classList.contains('is-open');
	const retratos = [];
	const passo = (nome, fn) => {
		fn();
		retratos.push([nome, aberta() ? retrato(host) : null]);
	};
	const proximoMonstro = (especie, nome) => ({ monstros: [...MONSTROS, { especie, nome }] });

	const MESMO = { codigo: 'atacando', alvo: { nome: 'Poring', especie: 1002 } };
	passo('antes do primeiro pacote (carregando)', () => BotMenu.toggle());
	// Sem o campo `status`: o carregado vira sem o status mudar de objeto.
	passo('o pacote inteiro (sem status)', () => receber(inteiro({ status: undefined })));
	for (let i = 0; i < 5; i++) passo('status so de operacao ' + i, () => receber(so()));
	passo('a mesma frase de novo', () => receber(so({ status: MESMO })));
	passo('aba Ataque', () => irPara(host, 'Ataque'));
	passo('o mapa muda com a mesma frase (contexto)', () =>
		receber(so({ status: MESMO, mapa: 'prt_fild09', contexto: { mapa: 'prt_fild09', rotuloDoMapa: 'Campos 2', ehCidade: false } }))
	);
	passo('o mesmo mapa vira cidade (so a cidade muda)', () =>
		receber(so({ status: MESMO, mapa: 'prt_fild09', contexto: { mapa: 'prt_fild09', rotuloDoMapa: 'Campos 2', ehCidade: true } }))
	);
	passo('e volta a ser campo', () =>
		receber(so({ status: MESMO, mapa: 'prt_fild09', contexto: { mapa: 'prt_fild09', rotuloDoMapa: 'Campos 2', ehCidade: false } }))
	);
	passo('os monstros mudam', () => receber(so(proximoMonstro(1063, 'Lunatic'))));
	passo('a especie do Avancado do Ataque', () => {
		const sel = host.querySelector('[data-secao="ataque"] .bm-escopo');
		sel.value = '1007';
		sel.dispatchEvent(new Event('change'));
	});
	passo('as skills mudam (ataque e suporte)', () =>
		receber(
			so({
				skills: SKILLS.map(x =>
					x.skillId === 5 ? { ...x, aprendido: 9 } : x.skillId === 29 ? { ...x, nome: 'Aumentar Agilidade II' } : x
				)
			})
		)
	);
	passo('editar: desmarcar um monstro (rascunho)', () => {
		irPara(host, 'Caçada');
		host.querySelector('.bm-monstros [data-especie="1002"]').click();
	});
	passo('a config muda no servidor com rascunho', () => receber(so({ revisao: 2, config: config({ raioDePercepcao: 15 }) })));
	passo('o grupo muda', () => receber(so({ grupo: { emGrupo: true, posto: 'vanguarda', postoNome: 'Vanguarda' } })));
	passo('as pocoes mudam', () => receber(so({ pocoes: [{ ...POCOES[0], quantidade: 11 }, POCOES[1]] })));
	passo('os consumiveis mudam', () => receber(so({ consumiveis: { ...CONSUMIVEIS, asa: { quantidade: 3, vip: true } } })));
	passo('as municoes mudam', () => receber(so({ municoes: MUNICOES.map(x => ({ ...x, quantidade: x.quantidade - 1 })) })));
	passo('a flecha vestida muda', () => receber(so({ municoes: MUNICOES.map(x => ({ ...x, vestida: x.itemId === 1752 })) })));
	passo('a municao muda', () => receber(so({ municao: { vip: true, manual: 1752, tetoAutomatico: 4 } })));
	passo('o perfil ativo muda', () => receber(so({ perfilAtivo: 'Party' })));
	// A mesma frase do status seguinte: o passo do ON/OFF abaixo muda SO o `ligado`.
	passo('os perfis mudam', () =>
		receber(so({ status: MESMO, perfis: [...inteiro().perfis, { nome: 'Farm', classe: 7, postura: 'ranged-dps' }] }))
	);
	passo('ON/OFF em voo', () => host.querySelector('.bm-liga').click());
	// Com o ON/OFF em voo o botao mostra "...": so o `ligado` muda o resto do topo (o titulo, a moldura).
	passo('o servidor desliga com o ON/OFF em voo e a mesma frase', () =>
		receber(so({ status: MESMO, ligado: false, situacao: 'desligado' }))
	);
	passo('ON/OFF respondido', () => responder('desligar', { ligado: false, situacao: 'desligado' }));
	passo('Salvar em voo', () => host.querySelector('.bm-aplicar').click());
	passo('Salvar recusado (erro e problemas)', () =>
		responder('aplicar', { ok: false, erro: 'config-invalida', problemas: [{ campo: 'raio', mensagem: 'Raio fora do limite' }], revisao: 2, config: undefined })
	);
	passo('descartar o rascunho', () => host.querySelector('.bm-descartar').click());
	passo('editar de novo', () => host.querySelector('.bm-monstros [data-especie="1007"]').click());
	// Sem o "mudou no servidor" de pe: so o conflito mostra o Recarregar.
	passo('Salvar com conflito', () => {
		host.querySelector('.bm-aplicar').click();
		responder('aplicar', { ok: false, erro: 'conflito-de-revisao', problemas: [], revisao: 2, config: undefined });
	});
	passo('recarregar', () => host.querySelector('.bm-recarregar').click());
	passo('o recarregar respondido', () => responder('pedir', { revisao: 2, config: config({ raioDePercepcao: 15 }) }));
	passo('usar um perfil (em voo)', () => {
		const sel = host.querySelector('.bm-perfil-escolha');
		sel.value = 'Solo';
		sel.dispatchEvent(new Event('change'));
	});
	passo('o perfil respondido: a postura, o rodizio e a coleta mudam', () =>
		responder('perfil-aplicar', {
			revisao: 3,
			config: config({
				postura: { tipo: 'melee-dps', fallbackMelee: false },
				skills: { geral: [{ skillId: 7, nivel: 'aprendido' }, { skillId: 5, nivel: 'aprendido' }], porSkill: {}, porMonstro: {} },
				coleta: { ligada: true, raio: 9, ignorar: [] }
			}),
			perfilAtivo: 'Solo'
		})
	);
	// So o bloco da config (um status, e nao uma resposta inteira): o rodizio e a coleta tem de seguir o rascunho.
	passo('a config muda no servidor sem rascunho', () =>
		receber(
			so({
				revisao: 4,
				config: config({
					postura: { tipo: 'melee-dps', fallbackMelee: false },
					skills: { geral: [{ skillId: 5, nivel: 'aprendido' }], porSkill: {}, porMonstro: {} },
					coleta: { ligada: true, raio: 11, ignorar: [909] }
				})
			})
		)
	);
	passo('as capacidades mudam (outras secoes)', () =>
		receber(so({ capacidades: { contrato: 1, versaoDaConfig: 1, limites: { ...LIMITES, raioMaximo: 25 }, secoes: SECOES.filter(x => x !== 'suporte') } }))
	);
	passo('na cidade', () => receber(so({ mapa: 'prontera', contexto: { mapa: 'prontera', rotuloDoMapa: 'Prontera', ehCidade: true } })));
	passo('aba Avancado (pede o diagnostico)', () => irPara(host, 'Avançado'));
	passo('o diagnostico chega', () =>
		responder('pedir', { diagnostico: { status: CODIGOS[2], sessao: { desdeMs: 61_000, abates: 4, pocoes: 1, flechas: 0, asas: 0, buffs: 2 } } })
	);
	passo('o diagnostico seguinte: o mesmo status, outra sessao', () => {
		BotMenu._estado.pedirEstado();
		responder('pedir', { diagnostico: { status: CODIGOS[2], sessao: { desdeMs: 66_000, abates: 5, pocoes: 1, flechas: 0, asas: 0, buffs: 2 } } });
	});
	passo('aba Coleta com o seletor aberto', () => {
		irPara(host, 'Coleta');
		host.querySelector('[data-secao="coleta"] .bm-escolher').click();
	});
	passo('a mochila muda com o seletor aberto (status)', () => {
		mochila = [
			{ ITID: 909, count: 4 },
			{ ITID: 512, count: 2 }
		];
		receber(so());
	});
	passo('fechar a janela', () => BotMenu.toggle());
	for (let i = 0; i < 4; i++) passo('fechada: status ' + i, () => receber(so()));
	passo('fechada: os monstros mudam', () => receber(so(proximoMonstro(1031, 'Poporing'))));
	passo('fechada: as pocoes mudam', () => receber(so({ pocoes: [POCOES[1]] })));
	passo('fechada: a config muda', () => receber(so({ revisao: 5, config: config({ cacar: false }) })));
	passo('fechada: os perfis mudam', () => receber(so({ perfis: [{ nome: 'Party', classe: 7, postura: 'tank' }] })));
	passo('abrir de novo', () => BotMenu.toggle());
	for (let i = 0; i < 3; i++) passo('aberta de novo: status ' + i, () => receber(so()));
	return retratos;
}

describe('o oraculo: o DOM de agora e o do caminho que redesenha sempre', () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it('igual depois de cada passo com a janela aberta, inclusive ao abrir depois de fechada', async () => {
		const antes = await sequencia({ sempre: true });
		const agora = await sequencia({ sempre: false });
		expect(agora.map(([n]) => n)).toEqual(antes.map(([n]) => n));
		let comparados = 0;
		for (let i = 0; i < antes.length; i++) {
			const [nome, a] = antes[i];
			const b = agora[i][1];
			expect(b === null, 'janela aberta num lado e fechada no outro: ' + nome).toBe(a === null);
			if (a !== null) {
				expect(b, 'o DOM divergiu em: ' + nome).toBe(a);
				comparados++;
			}
		}
		// A sequencia nao passa com zero: os passos com a janela aberta sao comparados de verdade.
		expect(comparados).toBeGreaterThanOrEqual(45);
		// E a tela mudou ao longo dela (um retrato igual do comeco ao fim nao provaria nada).
		expect(new Set(antes.filter(([, r]) => r !== null).map(([, r]) => r)).size).toBeGreaterThanOrEqual(35);
	}, 60_000);
});

describe('o portao por contagem (D-2385)', () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	/** Conta os ELEMENTOS criados na janela (o `innerHTML = ''` e tudo de novo cria elementos). */
	function contarElementosCriados(host) {
		const obs = new MutationObserver(() => {});
		obs.observe(host, { childList: true, subtree: true });
		return () => {
			let n = 0;
			for (const r of obs.takeRecords()) {
				for (const no of r.addedNodes) {
					if (no.nodeType === 1) {
						n += 1 + no.querySelectorAll('*').length;
					}
				}
			}
			return n;
		};
	}

	async function preparar(sempre) {
		const m = await montar({ sempre });
		m.receber(inteiro());
		irPara(m.host, 'Avançado');
		// O primeiro status liga o Bot (o rodape le o `ligado`); daqui em diante so o status de operacao muda.
		m.receber(so());
		m.BotMenu._zerarContagemDeDesenhos();
		return m;
	}

	it('aberta: 20 status so de operacao refazem so o topo e o Avancado, sem criar elemento', async () => {
		const antes = await preparar(true);
		const criadosAntes = contarElementosCriados(antes.host);
		for (let i = 0; i < 20; i++) antes.receber(so());
		const nAntes = criadosAntes();
		const cAntes = antes.BotMenu._contagemDeDesenhos();

		const agora = await preparar(false);
		const criadosAgora = contarElementosCriados(agora.host);
		for (let i = 0; i < 20; i++) agora.receber(so());
		const nAgora = criadosAgora();
		const cAgora = agora.BotMenu._contagemDeDesenhos();

		// Antes: todo bloco a cada status (19 blocos x 20), e centenas de elementos recriados.
		expect(cAntes.janela).toBe(20);
		expect(Object.values(cAntes.blocos).every(n => n === 20)).toBe(true);
		expect(Object.keys(cAntes.blocos).length).toBeGreaterThanOrEqual(15);
		expect(nAntes).toBeGreaterThan(20 * 50);
		// Agora: a janela passa 20 vezes, mas so o topo e o Avancado (o status mudou) sao refeitos.
		expect(cAgora.janela).toBe(20);
		expect(cAgora.blocos).toEqual({ topo: 20, avancado: 20 });
		expect(nAgora).toBe(0);
		console.log(`[D-2385] aberta, 20 status: blocos ${Object.values(cAntes.blocos).reduce((a, b) => a + b, 0)} -> ${40}; elementos criados ${nAntes} -> ${nAgora}`);
	});

	it('o primeiro status depois do pacote inteiro so refaz o topo e o Avancado', async () => {
		// O desenho do Ataque escolhe a especie da lista por monstro (`_escopoDasSkills`): as entradas guardadas
		// sao as de DEPOIS do desenho, senao o status seguinte refaria o Ataque a toa.
		const agora = await montar({ sempre: false });
		agora.receber(inteiro({ ligado: true, situacao: 'ativo' }));
		agora.BotMenu._zerarContagemDeDesenhos();
		agora.receber(so());
		expect(agora.BotMenu._contagemDeDesenhos().blocos).toEqual({ topo: 1, avancado: 1 });
	});

	it('aberta: 20 status com a MESMA frase nao refazem bloco nenhum', async () => {
		const agora = await preparar(false);
		const mesmo = { codigo: 'atacando', alvo: { nome: 'Poring', especie: 1002 } };
		agora.receber(so({ status: mesmo }));
		agora.BotMenu._zerarContagemDeDesenhos();
		const criados = contarElementosCriados(agora.host);
		const obs = new MutationObserver(() => {});
		obs.observe(agora.host, { childList: true, subtree: true, attributes: true, characterData: true });
		for (let i = 0; i < 20; i++) agora.receber(so({ status: { ...mesmo } }));
		const c = agora.BotMenu._contagemDeDesenhos();
		expect(c.janela).toBe(20);
		expect(c.blocos).toEqual({});
		expect(obs.takeRecords().length).toBe(0);
		expect(criados()).toBe(0);
	});

	it('com o diagnostico na tela, o status de fora nao refaz o Avancado (ele mostra o do diagnostico)', async () => {
		const agora = await preparar(false);
		agora.BotMenu._estado.pedirEstado();
		const pedido = agora.enviados().filter(p => p.verbo === 'pedir').at(-1);
		agora.receber(
			inteiro({
				tipo: 'resposta',
				requestId: pedido.requestId,
				statusRevision: 50,
				ligado: true,
				situacao: 'ativo',
				diagnostico: { status: CODIGOS[2], sessao: { desdeMs: 1000, abates: 1, pocoes: 0, flechas: 0, asas: 0, buffs: 0 } }
			})
		);
		_rev = 50;
		agora.BotMenu._zerarContagemDeDesenhos();
		for (let i = 0; i < 5; i++) agora.receber(so());
		expect(agora.BotMenu._contagemDeDesenhos().blocos).toEqual({ topo: 5 });
	});

	it('aberta: o pacote com um bloco so refaz quem le aquele bloco', async () => {
		const agora = await preparar(false);
		agora.receber(so({ monstros: [...MONSTROS, { especie: 1063, nome: 'Lunatic' }] }));
		// Os monstros entram na Cacada, no Avancado do Ataque e nas regras por monstro das Flechas.
		expect(agora.BotMenu._contagemDeDesenhos().blocos).toEqual({ topo: 1, avancado: 1, monstros: 1, ataque: 1, flechas: 1 });
		agora.BotMenu._zerarContagemDeDesenhos();
		agora.receber(so({ pocoes: [POCOES[0]] }));
		expect(agora.BotMenu._contagemDeDesenhos().blocos).toEqual({ topo: 1, avancado: 1, sobrevivencia: 1 });
	});

	it('fechada: nada no DOM; ao abrir, tudo uma vez; o "Ataque auto" segue avisado a cada pacote', async () => {
		const agora = await preparar(false);
		const avisos = [];
		agora.BotMenu.aoMudarLigado(e => avisos.push(e.ligado));
		agora.BotMenu.toggle(); // fecha
		agora.BotMenu._zerarContagemDeDesenhos();
		const criados = contarElementosCriados(agora.host);
		const obs = new MutationObserver(() => {});
		obs.observe(agora.host, { childList: true, subtree: true, attributes: true, characterData: true });
		for (let i = 0; i < 20; i++) agora.receber(so({ ligado: i % 2 === 0 }));
		agora.receber(so({ monstros: [...MONSTROS, { especie: 1063, nome: 'Lunatic' }], pocoes: [POCOES[0]] }));
		expect(agora.BotMenu._contagemDeDesenhos()).toEqual({ janela: 0, blocos: {} });
		expect(obs.takeRecords().length, 'a janela fechada mexeu no DOM').toBe(0);
		expect(criados()).toBe(0);
		expect(avisos.length, 'o botao "Ataque auto" deixou de ser avisado').toBe(21);
		expect(avisos.slice(0, 3)).toEqual([true, false, true]);

		agora.BotMenu.toggle(); // abre
		const c = agora.BotMenu._contagemDeDesenhos();
		expect(c.janela).toBe(1);
		expect(Object.values(c.blocos).every(n => n === 1)).toBe(true);
		expect(Object.keys(c.blocos).sort()).toEqual(
			['abas', 'ataque', 'avancado', 'cacada', 'coleta', 'consumiveis', 'flecha-atual', 'flechas', 'monstros', 'perfil', 'perfil-ativo', 'perfis', 'postura', 'problemas', 'recado', 'rodape', 'sobrevivencia', 'suporte', 'topo'].sort()
		);
	});

	it('antes, a janela fechada redesenhava tudo a cada pacote (a medida do "antes")', async () => {
		const antes = await preparar(true);
		antes.BotMenu.toggle(); // fecha
		antes.BotMenu._zerarContagemDeDesenhos();
		const criados = contarElementosCriados(antes.host);
		for (let i = 0; i < 20; i++) antes.receber(so());
		const c = antes.BotMenu._contagemDeDesenhos();
		const n = criados();
		expect(c.janela).toBe(20);
		expect(n).toBeGreaterThan(20 * 50);
		console.log(`[D-2385] fechada, 20 status: desenhos da janela 20 -> 0; elementos criados ${n} -> 0`);
	});
});
