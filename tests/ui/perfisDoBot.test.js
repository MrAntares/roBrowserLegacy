/**
 * A ABA PERFIS do menu do Bot (Fase 9, 08/10/2026), na janela real: os perfis sao verbos imediatos (salvar,
 * usar com a revisao confirmada, renomear, excluir) e o header mostra o perfil e a postura. A aba Armazem que
 * morava neste arquivo saiu do menu nos ajustes do dono de 09/10/2026 (o servidor ignora o bloco); o filtro do
 * seletor de item continua servindo a Coleta.
 */
import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fraseDoErro, fraseDoStatus } from 'UI/Components/BotMenu/estadoDoBot.js';
import { filtrarCandidatos, normalizarNome } from 'UI/Components/BotMenu/seletorDeItem.js';

vi.mock('Network/NetworkManager.js', () => ({
	default: { sendPacket: vi.fn(), hookPacket: vi.fn() }
}));
vi.mock('Renderer/Renderer.js', () => ({ default: { render: vi.fn(), stop: vi.fn(), width: 1280, height: 720 } }));
vi.mock('UI/UIManager.js', () => ({ default: { showErrorBox: vi.fn(), addComponent: c => c } }));
vi.mock('DB/DBManager.js', () => ({
	default: {
		getItemInfo: id =>
			id === 909
				? { identifiedDisplayName: 'Jellopy' }
				: id === 501
					? { identifiedDisplayName: 'Poção Vermelha' }
					: { identifiedDisplayName: 'Unknown Item' }
	}
}));
vi.mock('UI/itemNaTela.js', () => ({ aplicarIconeDoItem: (img, id) => img.setAttribute('src', '/ragidle/item/' + id + '.png') }));

const html = readFileSync(join(__dirname, '..', '..', 'src', 'UI', 'Components', 'BotMenu', 'BotMenu.html'), 'utf8');

describe('o seletor de item e as frases', () => {
	it('o filtro do seletor acha pelo nome sem acento nem caixa', () => {
		expect(normalizarNome('  Poção VERMELHA ')).toBe('pocao vermelha');
		const lista = [{ itemId: 1, nome: 'Poção Vermelha' }, { itemId: 2, nome: 'Jellopy' }];
		expect(filtrarCandidatos(lista, 'pocao').map(x => x.itemId)).toEqual([1]);
		expect(filtrarCandidatos(lista, '').map(x => x.itemId)).toEqual([1, 2]);
		expect(filtrarCandidatos(lista, 'zzz')).toEqual([]);
	});

	it('as frases novas: status do armazem com o motivo e os erros de perfil', () => {
		expect(fraseDoStatus({ codigo: 'armazem-indisponivel', alvo: null, detalhe: 'sem-loja' })).toBe('Armazém indisponível: a loja não vende o que falta');
		expect(fraseDoStatus({ codigo: 'indo-ao-armazem', alvo: null })).toBe('Indo ao armazém');
		expect(fraseDoErro('perfil-invalido')).toBe('Esse perfil não vale para o personagem agora. Nada foi alterado.');
	});
});

describe('a costura da aba Perfis na janela real', () => {
	async function montar() {
		vi.resetModules();
		localStorage.clear();
		const { default: Network } = await import('Network/NetworkManager.js');
		const { default: BotMenu } = await import('UI/Components/BotMenu/BotMenu.js');
		BotMenu._host = document.createElement('div');
		BotMenu._host.innerHTML = html;
		BotMenu._shadow = null;
		BotMenu.draggable = () => {};
		BotMenu.lerMochila = () => [{ ITID: 909, count: 3 }, { ITID: 0, count: 1 }];
		BotMenu.init();
		const chamada = Network.hookPacket.mock.calls.at(-1);
		const receber = d => chamada[1]({ json: JSON.stringify(d) });
		return { BotMenu, Network, receber };
	}
	const status = (secoes, extra = {}) => ({
		v: 1,
		tipo: 'status',
		requestId: null,
		personagemId: 7,
		mapa: 'prt_fild08',
		ok: true,
		erro: null,
		problemas: [],
		revisao: 4,
		config: {
			v: 1,
			cacar: true,
			raioDePercepcao: 12,
			especiesVetadas: [],
			modoDeAtaque: 'skills-e-basico',
			skills: { geral: [], porSkill: {}, porMonstro: {} },
			postura: { tipo: 'tank', fallbackMelee: false }
		},
		ligado: false,
		situacao: 'desligado',
		status: { codigo: 'controle-manual', alvo: null },
		statusRevision: 0,
		capacidades: { contrato: 1, versaoDaConfig: 1, limites: { itensNoDeposito: 100, reservasNoDeposito: 30, itensNaReposicao: 12 }, secoes },
		monstros: [],
		skills: [],
		pocoes: [],
		perfis: [{ nome: 'Party', classe: 7, postura: 'tank' }],
		perfilAtivo: 'Party',
		cidades: [{ mapa: 'prontera', rotulo: 'Prontera' }],
		...extra
	});
	const abas = host => [...host.querySelectorAll('.bm-abas .ri-tab')].map(b => b.textContent);
	const ultimo = Network => JSON.parse(Network.sendPacket.mock.calls.at(-1)[0].json);

	it('sem a capacidade a aba nao aparece; com ela, o header mostra perfil e postura', async () => {
		const { BotMenu, receber } = await montar();
		receber(status(['cacada']));
		expect(abas(BotMenu._host)).not.toContain('Perfis');
		// O servidor velho ainda anuncia o Armazem: a secao nao volta (saiu do menu em 09/10/2026).
		receber(status(['cacada', 'armazem', 'perfis'], { statusRevision: 1 }));
		expect(abas(BotMenu._host)).toContain('Perfis');
		expect(abas(BotMenu._host)).not.toContain('Armazém');
		expect(BotMenu._host.querySelector('.bm-perfil-ativo').textContent).toBe('Party · Tanque');
	});

	it('perfis: salvar, usar (com a revisao confirmada), renomear e excluir sao verbos imediatos', async () => {
		const { BotMenu, Network, receber } = await montar();
		receber(status(['cacada', 'perfis']));
		const host = BotMenu._host;
		const nome = host.querySelector('.bm-perfil-nome');
		nome.value = '  Solo ';
		host.querySelector('.bm-perfil-salvar').click();
		expect(ultimo(Network)).toMatchObject({ verbo: 'perfil-salvar', nome: 'Solo' });
		expect(ultimo(Network).config).toBeUndefined();
		receber({ ...status(['cacada', 'perfis']), tipo: 'resposta', requestId: ultimo(Network).requestId, statusRevision: 1 });
		host.querySelector('[data-perfil="Party"] .bm-perfil-aplicar').click();
		expect(ultimo(Network)).toMatchObject({ verbo: 'perfil-aplicar', nome: 'Party', baseRevision: 4 });
		receber({ ...status(['cacada', 'perfis']), tipo: 'resposta', requestId: ultimo(Network).requestId, statusRevision: 2 });
		nome.value = 'Grupo';
		host.querySelector('[data-perfil="Party"] .bm-perfil-renomear').click();
		expect(ultimo(Network)).toMatchObject({ verbo: 'perfil-renomear', nome: 'Party', novoNome: 'Grupo' });
		receber({ ...status(['cacada', 'perfis']), tipo: 'resposta', requestId: ultimo(Network).requestId, statusRevision: 3 });
		host.querySelector('[data-perfil="Party"] .bm-remove').click();
		expect(ultimo(Network)).toMatchObject({ verbo: 'perfil-excluir', nome: 'Party' });
		expect(BotMenu._estado.estado().dirty).toBe(false);
	});

	it('perfil recusado: a frase do erro aparece e o rascunho fica', async () => {
		const { BotMenu, Network, receber } = await montar();
		receber(status(['cacada', 'perfis']));
		BotMenu._host.querySelector('[data-perfil="Party"] .bm-perfil-aplicar').click();
		const pedido = ultimo(Network);
		receber({ ...status(['cacada', 'perfis']), tipo: 'resposta', requestId: pedido.requestId, ok: false, erro: 'perfil-invalido', problemas: [{ campo: 'armazem.cidade', mensagem: 'a cidade precisa ter Kafra' }], statusRevision: 1 });
		expect(BotMenu._host.querySelector('.bm-recado').textContent).toBe(fraseDoErro('perfil-invalido'));
		expect([...BotMenu._host.querySelectorAll('.bm-problemas li')].map(l => l.textContent)).toEqual(['a cidade precisa ter Kafra']);
	});
});
