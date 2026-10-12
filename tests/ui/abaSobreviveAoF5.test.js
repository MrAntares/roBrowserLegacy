/**
 * "FECHOU EM ALVOS, VOLTA PARA ALVOS" — a prova de ponta a ponta (D-797).
 *
 * `memoriaDeAba.test.js` mede as peças e o portão. Este mede o PEDIDO, com a
 * janela real: monta a janela com o HTML de verdade, clica numa aba, joga fora
 * o módulo inteiro (que é o que o F5 faz) e monta de novo.
 *
 * Os dois casos separados existem porque as duas metades falham por motivos
 * diferentes: gravar sem restaurar, e restaurar sem acender o botão. A segunda
 * é a que ninguém testa e o jogador vê primeiro — a lista certa embaixo do
 * rótulo errado.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('Network/NetworkManager.js', () => ({
	default: { sendPacket: vi.fn(), hookPacket: vi.fn() }
}));
vi.mock('Renderer/Renderer.js', () => ({ default: { render: vi.fn(), stop: vi.fn(), width: 1280, height: 720 } }));
vi.mock('UI/UIManager.js', () => ({ default: { showErrorBox: vi.fn(), addComponent: c => c } }));
vi.mock('UI/Components/ChatBox/ChatBox.js', () => ({
	default: { addText: vi.fn(), TYPE: { ERROR: 1 }, FILTER: { PUBLIC_LOG: 1 } }
}));

/*
 * A primeira metade deste arquivo media a `Configuração idle` (IdleConfig), e
 * saiu com ela em 07/10/2026 (Novo Bot V5). Fica a janela de Missões.
 */

/**
 * A janela de Missões tem a pergunta da troca de personagem.
 *
 * `limparEstadoDoPersonagem` devolvia a aba a 'principais' junto com o dado do
 * personagem. Aba não é dado de personagem: é a escolha da PESSOA, e vale para
 * os personagens dela todos.
 */
async function montarMissoes() {
	const { default: html } = await import('UI/Components/MissoesIdle/MissoesIdle.html?raw');
	const { default: MissoesIdle } = await import('UI/Components/MissoesIdle/MissoesIdle.js');

	MissoesIdle._host = document.createElement('div');
	MissoesIdle._host.innerHTML = html;
	MissoesIdle._shadow = null;
	MissoesIdle.draggable = () => {};
	MissoesIdle.init();

	return MissoesIdle;
}

describe('a janela de Missões abre na aba em que o jogador a fechou', () => {
	beforeEach(() => {
		localStorage.clear();
		vi.resetModules();
	});

	it('clicar em Opcionais sobrevive ao F5', async () => {
		const antes = await montarMissoes();
		antes._host.querySelector('.mi-tab[data-tab="opcionais"]').click();
		expect(antes.activeTab).toBe('opcionais');

		vi.resetModules();
		const depois = await montarMissoes();

		expect(depois.activeTab).toBe('opcionais');
		expect(depois._host.querySelector('.mi-tab.is-active').dataset.tab).toBe('opcionais');
	});

	it('trocar de personagem NÃO esquece a aba', async () => {
		const MissoesIdle = await montarMissoes();
		MissoesIdle._host.querySelector('.mi-tab[data-tab="opcionais"]').click();

		// O que o `cleanGameUI()` chama na volta ao menu de personagem.
		MissoesIdle.limparEstadoDoPersonagem();

		expect(MissoesIdle.missoes, 'o dado do personagem anterior ficou').toEqual([]);
		expect(MissoesIdle.activeTab, 'a aba foi zerada junto com o dado').toBe('opcionais');
	});
});
