/**
 * FRENTE P (relatos de 13/10/2026 a noite): "se voce marcou 'Habilidades e ataque basico' e em Postura 'So suporte',
 * vai bugar". O par sempre funcionou no servidor (o Bot de suporte cura e buffa; quem o travava era o aliado em
 * economia de energia, consertado no servidor). A confusao era do menu: o modo de ataque parecia valer numa postura
 * que nunca ataca. Agora a aba Ataque diz que, no "So suporte", a escolha nao vale (e ela segue gravada e editavel).
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
	// D-2385: a janela FECHADA nao desenha (so guarda e suja); estes casos olham a janela aberta.
	BotMenu._host.querySelector('.bm-window').classList.add('is-open');
	const chamada = Network.hookPacket.mock.calls.at(-1);
	const receber = d => chamada[1]({ json: JSON.stringify(d) });
	return { BotMenu, receber };
}

function status(postura, revisao = 0) {
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
		revisao,
		config: {
			v: 1,
			cacar: true,
			raioDePercepcao: 12,
			especiesVetadas: [],
			modoDeAtaque: 'skills-e-basico',
			skills: { geral: [], porSkill: {}, porMonstro: {} },
			postura: { tipo: postura, fallbackMelee: false }
		},
		ligado: false,
		situacao: 'desligado',
		status: { codigo: 'controle-manual', alvo: null },
		statusRevision: revisao,
		capacidades: { contrato: 1, versaoDaConfig: 1, limites: {}, secoes: ['cacada', 'ataque', 'postura'] },
		monstros: [],
		skills: [],
		pocoes: []
	};
}

describe('frente P: o modo de ataque na postura "So suporte"', () => {
	it('no "So suporte" a aba Ataque diz que o modo nao vale; nas outras posturas o aviso some', async () => {
		const { BotMenu, receber } = await montar();
		const host = BotMenu._host;
		receber(status('ranged-buff'));
		const aviso = host.querySelector('.bm-modo-sem-efeito');
		expect(aviso.hidden).toBe(false);
		expect(aviso.textContent).toContain('Só suporte');
		expect(host.querySelector('.bm-modo').classList.contains('is-sem-efeito')).toBe(true);
		// A escolha continua la e editavel (vale quando a postura mudar).
		const basico = host.querySelector('input[name="bm-modo"][value="skills-e-basico"]');
		expect(basico.checked).toBe(true);
		expect(basico.disabled).toBe(false);
		for (const postura of ['tank', 'melee-dps', 'ranged-dps', 'ranged-buff-ataque']) {
			receber(status(postura, 1));
			expect(host.querySelector('.bm-modo-sem-efeito').hidden, postura).toBe(true);
			expect(host.querySelector('.bm-modo').classList.contains('is-sem-efeito'), postura).toBe(false);
		}
	});

	it('trocar a postura no rascunho para "So suporte" mostra o aviso na hora', async () => {
		const { BotMenu, receber } = await montar();
		const host = BotMenu._host;
		receber(status('melee-dps'));
		expect(host.querySelector('.bm-modo-sem-efeito').hidden).toBe(true);
		const soSuporte = host.querySelector('input[name="bm-postura"][value="ranged-buff"]');
		soSuporte.checked = true;
		soSuporte.dispatchEvent(new Event('change'));
		expect(host.querySelector('.bm-modo-sem-efeito').hidden).toBe(false);
	});
});
