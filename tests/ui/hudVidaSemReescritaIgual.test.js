/**
 * A HUD NAO REESCREVE A VIDA IGUAL (D-2385, 14/10/2026).
 *
 * O HP e o SP que o `ZC_PAR_CHANGE` (e o `ZC_NOTIFY_HP_TO_GROUPM`) poem na
 * entidade nao tocam o DOM no pacote: quem os desenha e a PESQUISA da HUD
 * (`BasicInfoIdle`, 250 ms; `PartyHud`, 400 ms). A auditoria de 11/09 levou a
 * comparacao ao `setText`, mas as barras ficaram de fora: quatro textos e a
 * inicial do avatar a cada 250 ms, e o numero e a largura de cada companheiro a
 * cada 400 ms, com a vida parada. Cada `textContent` igual troca o no de texto.
 *
 * Contado num `MutationObserver` na janela real montada no jsdom, com o
 * relogio falso: 20 voltas com a vida parada.
 *   BasicInfoIdle: com o interruptor de medicao desligado (o caminho que
 *   escreve TUDO, o de 11/09 e o de agora) 284 registros; DEPOIS 0. So a
 *   parte desta leva (as barras, a inicial, o ping) sai da bateria:
 *   `tests/mutantes/redesenho-sem-mudanca.config.mjs`.
 *   PartyHud (2 companheiros): ANTES 40 (o numero de cada um). DEPOIS 0.
 * E a vida que muda continua aparecendo na volta seguinte.
 *
 * O botao "Ataque auto" (`CombatCornerIdle`), avisado a cada pacote do Bot
 * (~0,4 por segundo com ele ligado), tambem so escreve o atributo que mudou.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { contarEscritasDeEstilo } from './contarEscritasDeEstilo.js';

// O jsdom nao registra mutacao para estilo reescrito com o mesmo valor: as larguras sao contadas no setter.
const escritasDeLargura = contarEscritasDeEstilo(['width']);

const raiz = join(__dirname, '..', '..');
const ler = (...p) => readFileSync(join(raiz, ...p), 'utf8');

const contextoMudo = new Proxy(
	{},
	{
		get: (alvo, nome) => {
			if (nome === 'measureText') return () => ({ width: 0 });
			if (nome === 'getImageData' || nome === 'createImageData') return () => ({ data: new Uint8ClampedArray(4) });
			return () => {};
		}
	}
);
HTMLCanvasElement.prototype.getContext = () => contextoMudo;

function vigiar(no) {
	const obs = new MutationObserver(() => {});
	obs.observe(no, { subtree: true, childList: true, characterData: true, attributes: true });
	return () => obs.takeRecords();
}

describe('BasicInfoIdle: a barra de HP e SP e a inicial so escrevem o que mudou', () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	async function montar() {
		vi.resetModules();
		vi.doMock('Renderer/Renderer.js', () => ({ default: { render: vi.fn(), stop: vi.fn(), width: 1280, height: 720 } }));
		vi.doMock('UI/UIManager.js', () => ({ default: { showErrorBox: vi.fn(), addComponent: c => c } }));
		vi.doMock('UI/Components/BasicInfo/BasicInfo.js', () => ({
			default: { getUI: () => ({ base_exp: 300, base_exp_next: 1000, job_exp: 10, job_exp_next: 100, weight_max: 8000, _host: null }) }
		}));
		vi.doMock('UI/escalaDaHud.js', () => ({ emUnidadesDaHud: x => x, ehDedo: () => false }));
		const { default: Session } = await import('Engine/SessionStorage.js');
		const { default: BasicInfoIdle } = await import('UI/Components/BasicInfoIdle/BasicInfoIdle.js');
		BasicInfoIdle._host = document.createElement('div');
		BasicInfoIdle._host.innerHTML = ler('src', 'UI', 'Components', 'BasicInfoIdle', 'BasicInfoIdle.html');
		BasicInfoIdle._shadow = null;
		BasicInfoIdle.draggable = () => {};
		Session.zeny = 1234;
		Session.cash = 0;
		Session.Entity = {
			display: { name: 'Fulano' },
			job: 1,
			clevel: 30,
			joblevel: 20,
			weight: 1000,
			life: { hp: 700, hp_max: 1000, sp: 50, sp_max: 80 }
		};
		BasicInfoIdle.init();
		BasicInfoIdle.onAppend();
		return { BasicInfoIdle, Session };
	}

	it('20 voltas com a vida parada: 0 mutacoes; a vida nova aparece na volta seguinte', async () => {
		const { BasicInfoIdle, Session } = await montar();
		const host = BasicInfoIdle._host;
		const registros = vigiar(host);
		const larguras = escritasDeLargura.n;
		vi.advanceTimersByTime(250 * 20);
		expect(registros().length, 'a vida parada reescreveu a HUD').toBe(0);
		expect(escritasDeLargura.n - larguras, 'a vida parada reescreveu a largura das barras').toBe(0);
		expect(host.querySelector('.bi-bar-hp .bi-bar-text').textContent).toBe('700 / 1000');
		Session.Entity.life.hp = 650;
		vi.advanceTimersByTime(250);
		expect(host.querySelector('.bi-bar-hp .bi-bar-text').textContent).toBe('650 / 1000');
		expect(host.querySelector('.bi-bar-hp .bi-bar-fill').style.width).toBe('65%');
		expect(registros().length).toBeGreaterThan(0);
		BasicInfoIdle.onRemove();
	});

	it('CONTROLE: com o interruptor de medicao desligado (o caminho de antes) as mesmas 20 voltas mutam', async () => {
		const { BasicInfoIdle } = await montar();
		window.__ri_hud_compara = false;
		try {
			const registros = vigiar(BasicInfoIdle._host);
			vi.advanceTimersByTime(250 * 20);
			const n = registros().length;
			expect(n).toBeGreaterThanOrEqual(100);
			console.log(`[D-2385] BasicInfoIdle, 20 voltas com a vida parada: mutacoes ${n} -> 0`);
		} finally {
			delete window.__ri_hud_compara;
			BasicInfoIdle.onRemove();
		}
	});
});

describe('PartyHud: a vida ao vivo dos companheiros so escreve o que mudou', () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it('20 voltas com a vida parada: 0 mutacoes; o HP novo aparece', async () => {
		vi.resetModules();
		const vidas = new Map([
			[2000001, { hp: 800, hp_max: 1000 }],
			[2000002, { hp: 450, hp_max: 1000 }]
		]);
		vi.doMock('Network/NetworkManager.js', () => ({ default: { sendPacket: vi.fn(), hookPacket: vi.fn() } }));
		vi.doMock('UI/UIManager.js', () => ({ default: { showErrorBox: vi.fn(), addComponent: c => c } }));
		vi.doMock('Renderer/EntityManager.js', () => ({ default: { getLife: conta => vidas.get(conta) || null } }));
		vi.doMock('UI/Components/GrupoIdle/GrupoIdle.js', () => ({
			default: {
				estado: {
					grupo: {
						membros: [
							{ contaId: 2000001, nome: 'Eu', classe: 1, nivel: 50, vivo: true, online: true, souEu: true, ehLider: true },
							{ contaId: 2000002, nome: 'Outro', classe: 4, nivel: 48, vivo: true, online: true }
						]
					}
				}
			}
		}));
		const { default: PartyHud } = await import('UI/Components/PartyHud/PartyHud.js');
		PartyHud._host = document.createElement('div');
		PartyHud._host.innerHTML = ler('src', 'UI', 'Components', 'PartyHud', 'PartyHud.html');
		PartyHud._shadow = null;
		PartyHud.atualizar();
		const host = PartyHud._host;
		const num = conta => host.querySelector(`.ph-membro[data-conta="${conta}"] .ph-hp-num`).textContent;
		expect(num(2000002)).toBe('450 / 1000');
		const registros = vigiar(host);
		const larguras = escritasDeLargura.n;
		vi.advanceTimersByTime(400 * 20);
		expect(registros().length, 'a vida parada reescreveu a HUD do grupo').toBe(0);
		expect(escritasDeLargura.n - larguras, 'a vida parada reescreveu a largura das barras').toBe(0);
		vidas.set(2000002, { hp: 300, hp_max: 1000 });
		vi.advanceTimersByTime(400);
		expect(num(2000002)).toBe('300 / 1000');
		expect(host.querySelector('.ph-membro[data-conta="2000002"] .fill').style.width).toBe('30%');
		expect(registros().length).toBeGreaterThan(0);
	});
});

describe('as larguras "45.0%" e "45%" sao o mesmo valor para a comparacao', () => {
	it('escreverEstilo com a forma lida: pula as duas, escreve a diferente', async () => {
		const { escreverEstilo } = await import('UI/escreverSeMudou.js');
		const el = document.createElement('span');
		el.style.width = '45%';
		expect(escreverEstilo(el, 'width', '45.0%', Number('45.0') + '%')).toBe(false);
		el.style.width = '45.0%';
		expect(escreverEstilo(el, 'width', '45.0%', '45%')).toBe(false);
		expect(escreverEstilo(el, 'width', '45.5%', Number('45.5') + '%')).toBe(true);
		expect(el.style.width).toBe('45.5%');
	});
});

/*
 * A COSTURA no fonte, onde montar a janela exige meio cliente (a GrupoIdle, a lista nativa de habilidades): o
 * mesmo recurso de `hudNaoRedesenhaAToa.test.js`. A comparacao em si tem oraculo em `escreverSeMudou.test.js`.
 */
function corpoDaFuncao(fonte, assinatura, recuo = '') {
	const daqui = fonte.slice(fonte.indexOf(assinatura));
	// A chave que fecha a funcao no MESMO recuo da assinatura (`}` ou `};`, CRLF ou LF).
	const fim = daqui.search(new RegExp('\\r?\\n' + recuo + '\\};?\\r?\\n'));
	expect(fim, `"${assinatura}" nao fecha`).toBeGreaterThan(0);
	return daqui.slice(0, fim);
}

describe('a costura no fonte', () => {
	it('GrupoIdle.vidaAoVivo: numero, largura e titulo pelos ajudantes, nunca crus', () => {
		const corpo = corpoDaFuncao(ler('src', 'UI', 'Components', 'GrupoIdle', 'GrupoIdle.js'), 'function vidaAoVivo() {');
		expect(corpo).not.toMatch(/\.textContent\s*=/);
		expect(corpo).not.toMatch(/\.style\.width\s*=/);
		expect(corpo).not.toMatch(/\.title\s*=/);
		expect(corpo).toContain('escreverTexto(numero, barra.texto)');
		expect(corpo).toContain("escreverEstilo(fill, 'width', largura + '%', Number(largura) + '%')");
		expect(corpo).toContain('escreverTitulo(estado,');
	});

	it('PartyHud.vidaAoVivo: a largura com a forma que o navegador le de volta', () => {
		const corpo = corpoDaFuncao(ler('src', 'UI', 'Components', 'PartyHud', 'PartyHud.js'), 'function vidaAoVivo() {');
		expect(corpo).toContain("escreverEstilo(fill, 'width', largura + '%', Number(largura) + '%')");
		expect(corpo).toContain('escreverTexto(numero, barra.texto)');
	});

	it('SkillList.setPoints: o numero de pontos pelo ajudante', () => {
		const corpo = corpoDaFuncao(ler('src', 'UI', 'Components', 'SkillList', 'SkillListCommon.js'), 'Component.setPoints = function setPoints(amount) {', '	');
		expect(corpo).not.toMatch(/\.textContent\s*=/);
		expect(corpo).toContain("escreverTexto(root.querySelector('.skpoints_count'), amount)");
	});
});

describe('CombatCornerIdle: o botao "Ataque auto" so escreve o atributo que mudou', () => {
	it('20 pacotes do Bot com o mesmo estado: 0 mutacoes no botao', async () => {
		vi.resetModules();
		vi.doMock('Network/NetworkManager.js', () => ({ default: { sendPacket: vi.fn(), hookPacket: vi.fn() } }));
		vi.doMock('Renderer/Renderer.js', () => ({ default: { render: vi.fn(), stop: vi.fn(), width: 1280, height: 720 } }));
		vi.doMock('UI/UIManager.js', () => ({ default: { showErrorBox: vi.fn(), addComponent: c => c } }));
		vi.doMock('DB/DBManager.js', () => ({ default: { getItemInfo: () => ({ identifiedDisplayName: 'Unknown Item' }) } }));
		const { default: Network } = await import('Network/NetworkManager.js');
		const { default: BotMenu } = await import('UI/Components/BotMenu/BotMenu.js');
		const { default: CombatCornerIdle } = await import('UI/Components/CombatCornerIdle/CombatCornerIdle.js');
		BotMenu._host = document.createElement('div');
		BotMenu._host.innerHTML = ler('src', 'UI', 'Components', 'BotMenu', 'BotMenu.html');
		BotMenu._shadow = null;
		BotMenu.draggable = () => {};
		BotMenu.init();
		CombatCornerIdle._host = document.createElement('div');
		CombatCornerIdle._host.innerHTML = ler('src', 'UI', 'Components', 'CombatCornerIdle', 'CombatCornerIdle.html');
		CombatCornerIdle._shadow = null;
		CombatCornerIdle.init();
		if (CombatCornerIdle.onAppend) CombatCornerIdle.onAppend();
		const receber = Network.hookPacket.mock.calls.filter(c => c[1] && c[1].name === 'onBotRecebido').at(-1)[1];
		const status = n => ({
			json: JSON.stringify({
				v: 1,
				tipo: 'status',
				requestId: null,
				personagemId: 7,
				mapa: 'prt_fild08',
				ok: true,
				ligado: true,
				situacao: 'ativo',
				status: { codigo: 'atacando', alvo: { nome: 'Poring' } },
				statusRevision: n,
				capacidades: { contrato: 1, versaoDaConfig: 1, limites: {}, secoes: ['cacada'] }
			})
		});
		receber(status(1));
		const botao = CombatCornerIdle._host.querySelector('.cc-btn--auto');
		expect(botao.getAttribute('aria-pressed')).toBe('true');
		const registros = vigiar(botao);
		for (let i = 2; i < 22; i++) receber(status(i));
		expect(registros().length, 'o mesmo estado reescreveu o botao').toBe(0);
		expect(botao.title).toBe('Ataque automático ligado: clique para desligar');
	});
});
