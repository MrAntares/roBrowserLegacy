/**
 * O LAYOUT DO MOCKUP do menu do Bot (Fase 11, 08/10/2026), na janela real
 * montada no jsdom: o topo (Auto Caca ON/OFF, o mapa pelo contexto do
 * servidor, o perfil atual), a barra lateral na ordem do mockup com o
 * subtitulo, o cabecalho da secao, o Ataque com o rodizio na frente e o
 * Avancado recolhido (ajustes do dono, 09/10/2026: as sub-abas Geral, Por
 * Skill e Por Monstro sairam), o cartao por habilidade e o "Salvar e Iniciar"
 * (so liga depois que o servidor aceitar o Aplicar).
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

const html = readFileSync(join(__dirname, '..', '..', 'src', 'UI', 'Components', 'BotMenu', 'BotMenu.html'), 'utf8');

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
	const chamada = Network.hookPacket.mock.calls.at(-1);
	const receber = d => chamada[1]({ json: JSON.stringify(d) });
	// O mock do Network e o mesmo entre os testes: so conta o que ESTA janela mandou.
	const desde = Network.sendPacket.mock.calls.length;
	const enviados = () => Network.sendPacket.mock.calls.slice(desde).map(c => JSON.parse(c[0].json));
	return { BotMenu, Network, receber, enviados };
}

const BASH = { skillId: 5, chave: 'SM_BASH', nome: 'Golpe Fulminante', aprendido: 10, aceita: true, suporte: null, alcancaGrupo: false };
const MONSTROS = [
	{ especie: 1002, nome: 'Poring' },
	{ especie: 1113, nome: 'Drops' }
];

function config(extra = {}) {
	return {
		v: 1,
		cacar: true,
		raioDePercepcao: 12,
		especiesVetadas: [],
		modoDeAtaque: 'skills-e-basico',
		skills: { geral: [{ skillId: 5, nivel: 'aprendido' }], porSkill: {}, porMonstro: {} },
		...extra
	};
}

function status(secoes, extra = {}) {
	return {
		v: 1,
		tipo: 'status',
		requestId: null,
		personagemId: 7,
		mapa: 'prontera',
		contexto: { mapa: 'prontera', rotuloDoMapa: 'Prontera', ehCidade: true },
		ok: true,
		erro: null,
		problemas: [],
		revisao: 0,
		config: config(),
		ligado: false,
		situacao: 'desligado',
		status: { codigo: 'controle-manual', alvo: null },
		statusRevision: 0,
		capacidades: { contrato: 1, versaoDaConfig: 1, limites: {}, secoes },
		monstros: MONSTROS,
		skills: [BASH],
		pocoes: [],
		...extra
	};
}

const TODAS = ['cacada', 'ataque', 'sobrevivencia', 'suporte', 'coleta', 'flechas', 'postura', 'armazem', 'perfis'];

describe('o topo do mockup', () => {
	it('Auto Caca mostra OFF/ON, o mapa vem do contexto e o "Salvar e Iniciar" some com o Bot ligado', async () => {
		const { BotMenu, receber } = await montar();
		receber(status(['cacada', 'ataque']));
		const host = BotMenu._host;
		expect(host.querySelector('.bm-liga-texto').textContent).toBe('OFF');
		expect(host.querySelector('.bm-liga').getAttribute('aria-checked')).toBe('false');
		expect(host.querySelector('.bm-mapa').textContent).toBe('Prontera');
		expect(host.querySelector('.bm-mapa-rotulo').textContent).toBe('Você está na cidade');
		expect(host.querySelector('.bm-iniciar').hidden).toBe(false);
		receber(
			status(['cacada', 'ataque'], {
				statusRevision: 1,
				ligado: true,
				situacao: 'ligado',
				mapa: 'prt_fild08',
				contexto: { mapa: 'prt_fild08', rotuloDoMapa: 'Campos de Prontera', ehCidade: false }
			})
		);
		expect(host.querySelector('.bm-liga-texto').textContent).toBe('ON');
		expect(host.querySelector('.bm-window').classList.contains('is-ligado')).toBe(true);
		expect(host.querySelector('.bm-mapa').textContent).toBe('Campos de Prontera');
		expect(host.querySelector('.bm-mapa-rotulo').textContent).toBe('Você está em');
		expect(host.querySelector('.bm-iniciar').hidden).toBe(true);
	});

	it('o perfil atual lista os perfis; escolher um manda o verbo imediato perfil-aplicar', async () => {
		const { BotMenu, receber, enviados } = await montar();
		receber(
			status(['cacada', 'perfis'], {
				perfis: [
					{ nome: 'Pioneiro', classe: 'Arqueiro', postura: 'ranged-dps' },
					{ nome: 'Tanque', classe: 'Arqueiro', postura: 'tank' }
				],
				perfilAtivo: 'Pioneiro'
			})
		);
		const sel = BotMenu._host.querySelector('.bm-perfil-escolha');
		expect([...sel.options].map(o => o.textContent)).toEqual(['Configuração própria', 'Pioneiro', 'Tanque']);
		expect(sel.value).toBe('Pioneiro');
		sel.value = 'Tanque';
		sel.dispatchEvent(new Event('change'));
		const ultimo = enviados().at(-1);
		expect(ultimo.verbo).toBe('perfil-aplicar');
		expect(ultimo.nome).toBe('Tanque');
		expect(BotMenu._estado.estado().dirty).toBe(false);
	});

	it('sem perfil salvo a escolha fica desabilitada', async () => {
		const { BotMenu, receber } = await montar();
		receber(status(['cacada', 'perfis'], { perfis: [], perfilAtivo: null }));
		const sel = BotMenu._host.querySelector('.bm-perfil-escolha');
		expect(sel.disabled).toBe(true);
		expect(sel.options[0].textContent).toBe('Nenhum perfil salvo');
	});
});

describe('a barra lateral e o cabecalho da secao', () => {
	it('a ordem e a do mockup, com subtitulo; Flechas nao e aba; Postura se chama Grupo', async () => {
		const { BotMenu, receber } = await montar();
		receber(status(TODAS));
		const abas = [...BotMenu._host.querySelectorAll('.bm-abas .bm-aba')];
		// O Armazem saiu do menu (ajustes do dono, 09/10/2026): mesmo anunciado, nao aparece.
		expect(abas.map(b => b.textContent)).toEqual(['Caçada', 'Ataque', 'Suporte', 'Sobrevivência', 'Coleta', 'Grupo', 'Perfis']);
		expect(abas.map(b => b.getAttribute('data-sub'))).toEqual([
			'Mapas e monstros',
			'Skills e comportamento',
			'Buffs e cura',
			'Poções e HP/SP',
			'Coleta de itens',
			'Postura e cooperação',
			'Salvar e carregar'
		]);
		expect(abas.every(b => b.querySelector('svg'))).toBe(true);
	});

	it('clicar numa aba troca a secao visivel e o cabecalho (emblema, titulo e descricao)', async () => {
		const { BotMenu, receber } = await montar();
		receber(status(TODAS));
		const host = BotMenu._host;
		const ataque = [...host.querySelectorAll('.bm-aba')].find(b => b.textContent === 'Ataque');
		ataque.click();
		expect(host.querySelector('[data-secao="ataque"]').hidden).toBe(false);
		expect(host.querySelector('[data-secao="cacada"]').hidden).toBe(true);
		expect(host.querySelector('.bm-secao-titulo').textContent).toBe('Configurações de Ataque');
		expect(host.querySelector('.bm-secao-desc').textContent).toMatch(/habilidades/);
		expect(host.querySelector('.bm-emblema img').getAttribute('src')).toBe('/ragidle/ui-icons/caca.webp');
		const cacada = [...host.querySelectorAll('.bm-aba')].find(b => b.textContent === 'Caçada');
		cacada.click();
		expect(host.querySelector('.bm-secao-titulo').textContent).toBe('Configurações de Caçada');
		// Sem arte propria, o emblema e o glifo da secao.
		expect(host.querySelector('.bm-emblema svg')).not.toBeNull();
	});
});

describe('o Ataque: o rodizio na frente e o Avancado recolhido (ajustes do dono, 09/10/2026)', () => {
	async function noAtaque() {
		const m = await montar();
		m.receber(status(['cacada', 'ataque']));
		[...m.BotMenu._host.querySelectorAll('.bm-aba')].find(b => b.textContent === 'Ataque').click();
		return { ...m, host: m.BotMenu._host };
	}

	it('o modo e o rodizio na frente; o cartao por habilidade mora no Avancado, sem sub-abas', async () => {
		const { host } = await noAtaque();
		expect(host.querySelectorAll('.bm-subaba')).toHaveLength(0);
		expect(host.querySelector('.bm-modo').hidden).toBe(false);
		expect(host.querySelector('.bm-rodizio-caixa').hidden).toBe(false);
		const avancado = host.querySelector('.bm-ataque-avancado');
		expect(avancado.open).toBe(false);
		const cartao = avancado.querySelector('.bm-ps-cartao[data-skill="5"]');
		expect(cartao.querySelector('.bm-ps-icone').getAttribute('src')).toBe('/ragidle/skills/SM_BASH.png');
		expect(cartao.querySelector('.bm-ps-nome').textContent).toBe('Golpe Fulminante');
		expect(cartao.querySelector('.bm-passo-valor').textContent).toBe('10');
		expect(cartao.querySelector('.bm-ps-ativa').checked).toBe(true);
	});

	it('a lista por monstro do Avancado tira a opcao geral do seletor e abre na primeira especie do mapa', async () => {
		const { host } = await noAtaque();
		const opcoes = [...host.querySelectorAll('.bm-escopo option')].map(o => o.value);
		expect(opcoes).not.toContain('geral');
		expect(host.querySelector('.bm-escopo').value).toBe('1002');
		expect(host.querySelector('.bm-skills').hidden).toBe(false);
		expect(host.querySelector('.bm-skills-titulo').textContent).toBe('Lista deste monstro');
	});

	it('lista por monstro vazia diz o motivo: na cidade nao ha monstros; fora dela, o mapa sem monstro (correcoes pos-QA)', async () => {
		const m = await montar();
		m.receber(status(['cacada', 'ataque'], { monstros: [] }));
		const host = m.BotMenu._host;
		[...host.querySelectorAll('.bm-aba')].find(b => b.textContent === 'Ataque').click();
		const aviso = host.querySelector('.bm-por-monstro-vazio');
		expect(host.querySelector('.bm-skills').hidden).toBe(true);
		expect(aviso.hidden, 'lista por monstro vazia sem explicacao').toBe(false);
		expect(aviso.textContent).toBe('Na cidade não há monstros. Entre num mapa de caça para montar a lista de cada monstro.');
		m.receber(status(['cacada', 'ataque'], { monstros: [], statusRevision: 1, mapa: 'prt_fild08', contexto: { mapa: 'prt_fild08', rotuloDoMapa: 'Campos de Prontera', ehCidade: false } }));
		expect(aviso.textContent).toBe('Nenhum monstro neste mapa para montar uma lista própria.');
		// Com monstros (controle), o aviso some e a lista volta.
		m.receber(status(['cacada', 'ataque'], { statusRevision: 2 }));
		expect(aviso.hidden).toBe(true);
		expect(host.querySelector('.bm-skills').hidden).toBe(false);
	});

	it('o cartao por habilidade edita o RASCUNHO: ativa, nivel, escopo e as fichas dos monstros', async () => {
		const { BotMenu, Network, host } = await noAtaque();
		const antes = Network.sendPacket.mock.calls.length;
		const cartao = () => host.querySelector('.bm-ps-cartao[data-skill="5"]');
		cartao().querySelector('.bm-passo-menos').click();
		const s = BotMenu._estado.estado();
		expect(s.editConfig.skills.geral).toEqual([{ skillId: 5, nivel: 9 }]);
		expect(cartao().querySelector('.bm-passo-valor').textContent).toBe('9');
		cartao().querySelector('.bm-passo-mais').click();
		expect(BotMenu._estado.estado().editConfig.skills.geral).toEqual([{ skillId: 5, nivel: 'aprendido' }]);
		const ativa = cartao().querySelector('.bm-ps-ativa');
		ativa.checked = false;
		ativa.dispatchEvent(new Event('change'));
		expect(BotMenu._estado.estado().editConfig.skills.porSkill['5'].ativa).toBe(false);
		expect(cartao().classList.contains('is-desligada')).toBe(true);
		// O rodizio da frente mostra a mesma skill desligada, no mesmo lugar.
		expect(host.querySelector('.bm-rodizio-item[data-skill="5"] .bm-rodizio-ativa').checked).toBe(false);
		const alguns = cartao().querySelector('.bm-ps-alguns input');
		alguns.checked = true;
		alguns.dispatchEvent(new Event('change'));
		expect(BotMenu._estado.estado().editConfig.skills.porSkill['5'].especies).toEqual([]);
		const add = cartao().querySelector('.bm-ps-add-monstro');
		add.value = '1002';
		add.dispatchEvent(new Event('change'));
		expect(BotMenu._estado.estado().editConfig.skills.porSkill['5'].especies).toEqual([1002]);
		const ficha = cartao().querySelector('.bm-chip[data-especie="1002"]');
		expect(ficha.querySelector('img').getAttribute('src')).toBe('/ragidle/mobs/1002.png');
		expect(ficha.textContent).toContain('Poring');
		ficha.querySelector('.bm-chip-tirar').click();
		expect(BotMenu._estado.estado().editConfig.skills.porSkill['5'].especies).toEqual([]);
		// A janela de teste nao esta no documento: o radio recebe o change na mao.
		const todos = cartao().querySelector('.bm-ps-todos input');
		todos.checked = true;
		todos.dispatchEvent(new Event('change'));
		expect(BotMenu._estado.estado().editConfig.skills.porSkill['5'].especies).toBe(null);
		expect(BotMenu._estado.estado().dirty).toBe(true);
		expect(Network.sendPacket.mock.calls.length).toBe(antes);
	});

	it('skill fora do rodizio oferece "Pôr no rodízio" em vez do nivel', async () => {
		const m = await montar();
		m.receber(status(['cacada', 'ataque'], { config: config({ skills: { geral: [], porSkill: {}, porMonstro: {} } }) }));
		const host = m.BotMenu._host;
		[...host.querySelectorAll('.bm-aba')].find(b => b.textContent === 'Ataque').click();
		const cartao = host.querySelector('.bm-ps-cartao[data-skill="5"]');
		expect(cartao.querySelector('.bm-passo')).toBeNull();
		expect(cartao.querySelector('.bm-ps-incluir').textContent).toBe('Pôr no rodízio');
		cartao.querySelector('.bm-ps-incluir').click();
		expect(m.BotMenu._estado.estado().editConfig.skills.geral).toEqual([{ skillId: 5, nivel: 'aprendido' }]);
	});
});

describe('Salvar e Iniciar', () => {
	it('com rascunho: aplica e SO liga depois que o servidor aceita', async () => {
		const { BotMenu, receber, enviados } = await montar();
		receber(status(['cacada', 'ataque']));
		BotMenu._estado.editar(c => ({ ...c, raioDePercepcao: 9 }));
		BotMenu._host.querySelector('.bm-iniciar').click();
		const aplicar = enviados().at(-1);
		expect(aplicar.verbo).toBe('aplicar');
		expect(enviados().some(e => e.verbo === 'ligar')).toBe(false);
		receber({ ...status(['cacada', 'ataque']), tipo: 'resposta', requestId: aplicar.requestId, revisao: 1, config: config({ raioDePercepcao: 9 }) });
		expect(enviados().at(-1).verbo).toBe('ligar');
	});

	it('Aplicar recusado nao liga e mantem o rascunho', async () => {
		const { BotMenu, receber, enviados } = await montar();
		receber(status(['cacada', 'ataque']));
		BotMenu._estado.editar(c => ({ ...c, raioDePercepcao: 9 }));
		BotMenu._host.querySelector('.bm-iniciar').click();
		const aplicar = enviados().at(-1);
		receber({ ...status(['cacada', 'ataque']), tipo: 'resposta', requestId: aplicar.requestId, ok: false, erro: 'config-invalida', config: null });
		expect(enviados().some(e => e.verbo === 'ligar')).toBe(false);
		expect(BotMenu._estado.estado().dirty).toBe(true);
		// O proximo Aplicar comum nao herda o "ligar depois".
		BotMenu._host.querySelector('.bm-aplicar').click();
		const outro = enviados().at(-1);
		receber({ ...status(['cacada', 'ataque']), tipo: 'resposta', requestId: outro.requestId, revisao: 1, config: config({ raioDePercepcao: 9 }) });
		expect(enviados().some(e => e.verbo === 'ligar')).toBe(false);
	});

	it('sem rascunho liga direto', async () => {
		const { BotMenu, receber, enviados } = await montar();
		receber(status(['cacada', 'ataque']));
		BotMenu._host.querySelector('.bm-iniciar').click();
		expect(enviados().at(-1).verbo).toBe('ligar');
	});
});
