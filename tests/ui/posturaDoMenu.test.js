/**
 * A ABA POSTURA do menu do Bot (Fase 8, 07/10/2026), na janela real montada
 * no jsdom: a aba so com a capacidade `postura`; a postura e o fallback viram
 * edicao do RASCUNHO (nada vai ao servidor ate o Aplicar); o fallback so
 * aparece no Dano a distancia; o posto em vigor vem do servidor.
 */
import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fraseDoStatus } from 'UI/Components/BotMenu/estadoDoBot.js';

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
	return { BotMenu, Network, receber };
}

function status(secoes, extra = {}) {
	return {
		v: 1,
		tipo: 'status',
		requestId: null,
		personagemId: 7,
		mapa: 'prt_fild08',
		ok: true,
		erro: null,
		problemas: [],
		revisao: 0,
		config: {
			v: 1,
			cacar: true,
			raioDePercepcao: 12,
			especiesVetadas: [],
			modoDeAtaque: 'skills-e-basico',
			skills: { geral: [], porSkill: {}, porMonstro: {} },
			postura: { tipo: 'melee-dps', fallbackMelee: false }
		},
		ligado: false,
		situacao: 'desligado',
		status: { codigo: 'controle-manual', alvo: null },
		statusRevision: 0,
		capacidades: { contrato: 1, versaoDaConfig: 1, limites: {}, secoes },
		monstros: [],
		skills: [],
		pocoes: [],
		grupo: { emGrupo: true, posto: 'vanguarda', postoNome: 'Vanguarda' },
		...extra
	};
}

const abas = host => [...host.querySelectorAll('.bm-abas .ri-tab')].map(b => b.textContent);

describe('a aba Postura na janela real', () => {
	it('sem a capacidade nao aparece; com ela, a postura confirmada vem marcada e o posto em vigor e explicado', async () => {
		const { BotMenu, receber } = await montar();
		receber(status(['cacada', 'ataque']));
		expect(abas(BotMenu._host)).not.toContain('Grupo');
		receber(status(['cacada', 'ataque', 'postura'], { statusRevision: 1 }));
		const host = BotMenu._host;
		// A aba da postura se chama "Grupo" no menu (mockup do dono, 08/10/2026).
		expect(abas(host)).toContain('Grupo');
		expect(host.querySelector('input[name="bm-postura"]:checked').value).toBe('melee-dps');
		expect(host.querySelector('.bm-posto-atual').textContent).toBe('Posto em vigor: Vanguarda.');
		expect(host.querySelector('.bm-fallback-melee').hidden).toBe(true);
	});

	it('trocar a postura e o fallback suja o RASCUNHO; nada vai ao servidor ate o Aplicar', async () => {
		const { BotMenu, Network, receber } = await montar();
		receber(status(['cacada', 'postura']));
		const host = BotMenu._host;
		const antes = Network.sendPacket.mock.calls.length;
		const longe = host.querySelector('input[name="bm-postura"][value="ranged-dps"]');
		longe.checked = true;
		longe.dispatchEvent(new Event('change'));
		expect(host.querySelector('.bm-fallback-melee').hidden).toBe(false);
		const fb = host.querySelector('.bm-fallback');
		fb.checked = true;
		fb.dispatchEvent(new Event('change'));
		const s = BotMenu._estado.estado();
		expect(s.editConfig.postura).toEqual({ tipo: 'ranged-dps', fallbackMelee: true });
		expect(s.serverConfig.postura).toEqual({ tipo: 'melee-dps', fallbackMelee: false });
		expect(s.dirty).toBe(true);
		expect(Network.sendPacket.mock.calls.length).toBe(antes);
		host.querySelector('.bm-aplicar').click();
		expect(JSON.parse(Network.sendPacket.mock.calls.at(-1)[0].json).config.postura).toEqual({ tipo: 'ranged-dps', fallbackMelee: true });
	});

	it('config de servidor velho sem postura le o padrao; as frases dos status novos', async () => {
		const { BotMenu, receber } = await montar();
		const velho = status(['cacada', 'postura']);
		delete velho.config.postura;
		receber(velho);
		expect(BotMenu._host.querySelector('input[name="bm-postura"]:checked').value).toBe('melee-dps');
		expect(fraseDoStatus({ codigo: 'seguindo-lider', alvo: null })).toBe('Seguindo o líder');
		expect(fraseDoStatus({ codigo: 'apoiando', alvo: null })).toBe('Apoiando o grupo');
	});
});
