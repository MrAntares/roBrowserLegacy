/**
 * V-18 DO QA FINAL (correcoes pos-QA, 08/10/2026): o status do personagem ANTERIOR que chega depois
 * da troca de personagem nao entra no menu do novo. Contrato 05 secao 4: "Resposta atrasada, de outro
 * personagem/mapa ou mais antiga nao substitui estado novo." e "Trocar personagem encerra
 * requests/subscriptions e carrega o contexto proprio."
 *
 * A reproducao do QA (agente visual, staging da fase 7) era sobre o modulo `estadoDoBot.js` com o
 * personagem do PROPRIO estado como filtro: depois do `reiniciar` ele e null e o status velho entrava,
 * fixando o antigo (e o novo passava a ser recusado). A correcao esta na COSTURA (`BotMenu`): o filtro
 * e o personagem da SESSAO (`Session.GID`, o `personagemId` do `HC_NOTIFY_ZONESVR2`), entao a prova
 * monta a janela real e o pacote do servidor no formato de `servidor/bot/protocolo-do-bot.ts`.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

vi.mock('Network/NetworkManager.js', () => ({
	default: { sendPacket: vi.fn(), hookPacket: vi.fn() }
}));
vi.mock('Renderer/Renderer.js', () => ({ default: { render: vi.fn(), stop: vi.fn(), width: 1280, height: 720 } }));
vi.mock('UI/UIManager.js', () => ({ default: { showErrorBox: vi.fn(), addComponent: c => c } }));
vi.mock('DB/DBManager.js', () => ({ default: { getItemInfo: () => ({ identifiedDisplayName: 'Unknown Item' }) } }));

const html = readFileSync(join(__dirname, '..', '..', 'src', 'UI', 'Components', 'BotMenu', 'BotMenu.html'), 'utf8');

const CONFIG = { v: 1, cacar: true, especiesVetadas: [], modoDeAtaque: 'skills-e-basico', raioDePercepcao: 15, skills: { geral: [], porSkill: {}, porMonstro: {} } };

function pacote(personagemId, extra = {}) {
	return {
		v: 1,
		tipo: 'status',
		requestId: null,
		personagemId,
		mapa: 'prt_fild08',
		ok: true,
		erro: null,
		problemas: [],
		revisao: 0,
		config: CONFIG,
		ligado: false,
		situacao: 'desligado',
		status: { codigo: 'controle-manual', alvo: null },
		statusRevision: 0,
		agora: 0,
		capacidades: { contrato: 1, versaoDaConfig: 1, limites: { raioMinimo: 3, raioMaximo: 30 }, secoes: ['cacada', 'ataque'] },
		monstros: [],
		...extra
	};
}

async function montar() {
	vi.resetModules();
	localStorage.clear();
	const { default: Network } = await import('Network/NetworkManager.js');
	const { default: Session } = await import('Engine/SessionStorage.js');
	const { default: BotMenu } = await import('UI/Components/BotMenu/BotMenu.js');
	BotMenu._host = document.createElement('div');
	BotMenu._host.innerHTML = html;
	BotMenu._shadow = null;
	BotMenu.draggable = () => {};
	BotMenu.init();
	const chamada = Network.hookPacket.mock.calls.at(-1);
	const receber = d => chamada[1]({ json: JSON.stringify(d) });
	return { BotMenu, Session, receber };
}

afterEach(() => {
	vi.restoreAllMocks();
});

describe('V-18: troca de personagem com status do anterior no fio', () => {
	it('o status do personagem ANTERIOR que chega depois da troca nao entra; o do novo entra (controle)', async () => {
		const { BotMenu, Session, receber } = await montar();
		Session.GID = 7;
		receber(pacote(7, { ligado: true, situacao: 'ativo', statusRevision: 3, revisao: 5, config: { ...CONFIG, raioDePercepcao: 30 } }));
		expect(BotMenu._estado.estado().personagemId, 'controle: o primeiro personagem nao carregou').toBe(7);
		// Troca de personagem: o MapEngine limpa a janela e a sessao passa a ser a do novo (8).
		BotMenu.limparEstadoDoPersonagem();
		Session.GID = 8;
		// Ainda no fio: um status do personagem 7 (o antigo), sem correlacao.
		receber(pacote(7, { ligado: true, situacao: 'ativo', statusRevision: 9, revisao: 5, config: { ...CONFIG, raioDePercepcao: 30 } }));
		expect(BotMenu._estado.estado().personagemId, 'o status do anterior entrou no menu do novo').toBeNull();
		expect(BotMenu._estado.estado().ligado).toBe(false);
		// O do novo personagem chega e entra.
		receber(pacote(8));
		const s = BotMenu._estado.estado();
		expect({ personagemId: s.personagemId, raio: s.serverConfig.raioDePercepcao, ligado: s.ligado }).toEqual({ personagemId: 8, raio: 15, ligado: false });
	});

	it('sem sessao (GID 0) o filtro e o do proprio estado, como antes: o primeiro pacote carrega', async () => {
		const { BotMenu, Session, receber } = await montar();
		Session.GID = 0;
		receber(pacote(7));
		expect(BotMenu._estado.estado().personagemId).toBe(7);
		receber(pacote(9, { statusRevision: 1 }));
		expect(BotMenu._estado.estado().personagemId, 'o pacote de outro personagem entrou').toBe(7);
	});
});
