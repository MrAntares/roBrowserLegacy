/**
 * SUPORTE NO MODELO DO ATAQUE (segunda rodada dos ajustes do dono, 09/10/2026, item 4.5), na janela real no jsdom:
 * lista numerada com icone, liga/desliga por buff, setas de ordem, Tirar e "+ Usar"; sem teto de buffs (o teto de 3
 * vale so para os ataques); a ordem da lista e a ordem de lancamento (a frase diz isso).
 */
import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

vi.mock('Network/NetworkManager.js', () => ({
	default: { sendPacket: vi.fn(), hookPacket: vi.fn() }
}));
vi.mock('Renderer/Renderer.js', () => ({ default: { render: vi.fn(), stop: vi.fn(), width: 1280, height: 720 } }));
vi.mock('UI/UIManager.js', () => ({ default: { showErrorBox: vi.fn(), addComponent: c => c } }));
vi.mock('DB/DBManager.js', () => ({ default: { getItemInfo: () => ({ identifiedDisplayName: 'Unknown Item' }) } }));

const PASTA = join(__dirname, '..', '..', 'src', 'UI', 'Components', 'BotMenu');
const html = readFileSync(join(PASTA, 'BotMenu.html'), 'utf8');

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
	return { BotMenu, receber, enviados, host: BotMenu._host };
}

const TODAS = ['cacada', 'ataque', 'suporte', 'sobrevivencia', 'consumiveis', 'coleta', 'flechas', 'postura', 'armazem', 'perfis', 'avancado'];

/** Doze buffs de suporte (mais que o antigo teto de 8) e uma cura. */
const BUFFS = [
	[29, 'AL_INCAGI', 'Aumentar Agilidade'],
	[33, 'AL_ANGELUS', 'Angelus'],
	[34, 'AL_BLESSING', 'Bênção'],
	[66, 'PR_IMPOSITIO', 'Impositio Manus'],
	[67, 'PR_SUFFRAGIUM', 'Suffragium'],
	[71, 'PR_SLOWPOISON', 'Slow Poison'],
	[73, 'PR_KYRIE', 'Kyrie Eleison'],
	[74, 'PR_MAGNIFICAT', 'Magnificat'],
	[75, 'PR_GLORIA', 'Gloria'],
	[361, 'HP_ASSUMPTIO', 'Assumptio'],
	[80, 'XX_UM', 'Buff Onze'],
	[81, 'XX_DOIS', 'Buff Doze']
].map(([skillId, chave, nome]) => ({ skillId, chave, nome, aprendido: 10, aceita: false, suporte: 'buff', alcancaGrupo: true }));
const CURA = { skillId: 28, chave: 'AL_HEAL', nome: 'Curar', aprendido: 10, aceita: false, suporte: 'cura', alcancaGrupo: true };
const SKILLS = [...BUFFS, CURA];

const entrada = (skillId, extra = {}) => ({ skillId, nivel: 'aprendido', destino: 'eu', gatilho: 'manter', limiar: 0, ...extra });

function config(lista) {
	return {
		v: 1,
		cacar: true,
		raioDePercepcao: 12,
		especiesVetadas: [],
		modoDeAtaque: 'skills-e-basico',
		skills: { geral: [], porSkill: {}, porMonstro: {} },
		sobrevivencia: {
			pocoesHp: { itens: [], abaixoDe: 50, auto: true },
			pocoesSp: { itens: [], abaixoDe: 50, auto: true },
			descanso: { sentarHpAbaixoDe: 0, sentarSpAbaixoDe: 0, levantarEm: 100 }
		},
		suporte: { lista },
		coleta: { ligada: true, raio: 20, ignorar: [] },
		flechas: { ligada: true, modo: 'automatico', fixa: null, permitidas: [], porMonstro: {} },
		armazem: { ligado: false, cidade: null, pesoAcimaDe: 0, depositar: [], reservas: [], repor: [], tetoDeGasto: 0, voltar: true }
	};
}

function status(lista) {
	return {
		v: 1,
		tipo: 'status',
		requestId: null,
		personagemId: 7,
		mapa: 'prt_fild08',
		contexto: { mapa: 'prt_fild08', rotuloDoMapa: 'Campos', ehCidade: false },
		ok: true,
		erro: null,
		problemas: [],
		revisao: 0,
		config: config(lista),
		ligado: false,
		situacao: 'desligado',
		status: { codigo: 'controle-manual', alvo: null },
		statusRevision: 0,
		capacidades: { contrato: 1, versaoDaConfig: 1, limites: { skillsDeSuporte: 64, skillsNaListaGeral: 3 }, secoes: TODAS },
		monstros: [],
		skills: SKILLS,
		pocoes: [],
		municoes: [],
		municao: { vip: true, manual: null, tetoAutomatico: 4 },
		consumiveis: { buffs: [], asa: { quantidade: 0, vip: true } }
	};
}

function irParaSuporte(host) {
	const aba = [...host.querySelectorAll('.bm-aba')].find(b => b.textContent === 'Suporte');
	expect(aba, 'sem a aba Suporte').toBeTruthy();
	aba.click();
}

const itens = host => [...host.querySelectorAll('[data-secao="suporte"] .bm-lista-suporte .bm-suporte')];
const ids = host => itens(host).map(li => Number(li.getAttribute('data-skill')));

function aplicar(host, enviados) {
	host.querySelector('.bm-aplicar').click();
	const a = enviados().filter(e => e.verbo === 'aplicar').at(-1);
	expect(a, 'nenhum aplicar foi enviado').toBeTruthy();
	return a.config.suporte.lista;
}

describe('4.5 Suporte no modelo do Ataque', () => {
	it('a lista e numerada, tem icone e mostra os 12 buffs (nenhum corte; o teto de 3 e so do ataque)', async () => {
		const { host, receber } = await montar();
		receber(status(BUFFS.map(b => entrada(b.skillId))));
		irParaSuporte(host);
		const linhas = itens(host);
		expect(linhas.length).toBe(12);
		expect(linhas.map(l => l.querySelector('.bm-rodizio-ordem').textContent)).toEqual(Array.from({ length: 12 }, (_, i) => String(i + 1)));
		for (const l of linhas) {
			expect(l.querySelector('.bm-rodizio-icone'), 'sem icone').toBeTruthy();
			expect(l.querySelector('.bm-rodizio-ativa').checked).toBe(true);
		}
		// Nao sobra nenhum para "+ Usar" alem da cura.
		const fora = [...host.querySelectorAll('.bm-suporte-fora [data-skill]')].map(li => li.getAttribute('data-skill'));
		expect(fora).toEqual(['28']);
	});

	it('a frase diz que a ordem da lista e a ordem de lancamento e que o ativo e pulado', async () => {
		const { host, receber } = await montar();
		receber(status([entrada(34)]));
		irParaSuporte(host);
		const frase = host.querySelector('[data-secao="suporte"] .bm-rodizio-explica').textContent;
		expect(frase).toMatch(/ordem da lista/);
		expect(frase).toMatch(/ativo/);
	});

	it('desligar um buff grava ativa=false (a posicao fica); religar tira a chave; chega ao payload do Aplicar', async () => {
		const { host, receber, enviados } = await montar();
		receber(status([entrada(34), entrada(29), entrada(73)]));
		irParaSuporte(host);
		const chave = host.querySelector('[data-skill="29"] .bm-rodizio-ativa');
		chave.checked = false;
		chave.dispatchEvent(new Event('change'));
		expect(host.querySelector('[data-skill="29"]').classList.contains('is-desligada')).toBe(true);
		expect(host.querySelector('[data-skill="29"] .bm-rodizio-off').textContent).toMatch(/pula/);
		expect(ids(host)).toEqual([34, 29, 73]);
		const lista = aplicar(host, enviados);
		expect(lista.map(e => e.skillId)).toEqual([34, 29, 73]);
		expect(lista[1].ativa).toBe(false);
		expect(lista[0].ativa).toBeUndefined();
	});

	it('religar uma entrada desligada remove o campo ativa (so o false e gravado)', async () => {
		const { host, receber, enviados } = await montar();
		receber(status([entrada(34, { ativa: false }), entrada(29)]));
		irParaSuporte(host);
		const chave = host.querySelector('[data-skill="34"] .bm-rodizio-ativa');
		expect(chave.checked).toBe(false);
		chave.checked = true;
		chave.dispatchEvent(new Event('change'));
		const lista = aplicar(host, enviados);
		expect('ativa' in lista[0]).toBe(false);
	});

	it('as setas mudam a ordem de lancamento; Tirar remove; "+ Usar" poe a de fora no fim', async () => {
		const { host, receber, enviados } = await montar();
		receber(status([entrada(34), entrada(29), entrada(73)]));
		irParaSuporte(host);
		host.querySelector('[data-skill="73"] .bm-sobe').click();
		expect(ids(host)).toEqual([34, 73, 29]);
		host.querySelector('[data-skill="34"] .bm-desce').click();
		expect(ids(host)).toEqual([73, 34, 29]);
		host.querySelector('[data-skill="29"] .bm-remove').click();
		expect(ids(host)).toEqual([73, 34]);
		host.querySelector('.bm-suporte-fora [data-skill="75"] .bm-rodizio-usar').click();
		expect(ids(host)).toEqual([73, 34, 75]);
		expect(aplicar(host, enviados).map(e => e.skillId)).toEqual([73, 34, 75]);
	});

	it('a cura mostra o limiar de HP e o destino; o buff nao tem limiar', async () => {
		const { host, receber } = await montar();
		receber(status([entrada(28, { gatilho: 'hp', limiar: 60 }), entrada(34)]));
		irParaSuporte(host);
		expect(host.querySelector('[data-skill="28"] .bm-limiar').value).toBe('60');
		expect(host.querySelector('[data-skill="34"] .bm-limiar')).toBeNull();
		const destino = host.querySelector('[data-skill="34"] .bm-destino');
		expect([...destino.options].map(o => o.value)).toEqual(['eu', 'grupo']);
	});
});
