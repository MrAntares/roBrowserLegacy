/**
 * A JANELA DE HABILIDADES APLICA O PARCIAL (06/10/2026, a banda das janelas).
 *
 * A janela de verdade, com os vizinhos pesados (WebGL, GRF, rede) falsos - o
 * harness de `aplicarSoUmaVez.test.js`. O que se mede e o que sai para a rede e
 * o que a janela passa a mostrar:
 *  - o inteiro numerado (com `rev`) dispara UMA declaracao (`pedir` com `base`);
 *    o servidor que nao numera nunca a recebe;
 *  - o parcial vira o mesmo estado que o inteiro seria, e a janela desenha;
 *  - o parcial que nao cai pede o inteiro uma vez so, e os seguintes esperam;
 *  - abrir a janela pede pelo 0x0ffb com `base` ao servidor que numera, e pelo
 *    0x0ff9 ao que nao numera; aplicar e rotacao levam `base`.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	enviados: [],
	ganchos: new Map()
}));

vi.mock('UI/GUIComponent.js', () => {
	class GUIComponent {
		constructor(name) {
			this.name = name;
			this._host = document.createElement('div');
			this._shadow = this._host;
		}
		draggable() {}
		focus() {}
	}
	GUIComponent.MouseMode = { CROSS: 0 };
	return { default: GUIComponent };
});
vi.mock('UI/UIManager.js', () => ({ default: { addComponent: componente => componente } }));
vi.mock('Renderer/Renderer.js', () => ({ default: { width: 1280, height: 720 } }));
vi.mock('Core/Preferences.js', () => ({
	default: { get: (_nome, padrao) => Object.assign({ save() {} }, padrao) }
}));
vi.mock('DB/Skills/SkillInfo.js', () => ({ default: {} }));
vi.mock('Network/NetworkManager.js', () => ({
	default: {
		hookPacket: (id, fn) => mocks.ganchos.set(id, fn),
		sendPacket: pkt => mocks.enviados.push(pkt)
	}
}));
vi.mock('Network/PacketStructure.js', () => {
	function RAGIDLE_APRENDER() {
		this.nome = 'RAGIDLE_APRENDER';
	}
	function RAGIDLE_PEDIR_SKILLS() {
		this.nome = 'RAGIDLE_PEDIR_SKILLS';
	}
	function RAGIDLE_PRIORIZAR() {
		this.nome = 'RAGIDLE_PRIORIZAR';
	}
	return {
		default: {
			CZ: { RAGIDLE_APRENDER, RAGIDLE_PEDIR_SKILLS, RAGIDLE_PRIORIZAR },
			ZC: { RAGIDLE_SKILLS: 'ZC_RAGIDLE_SKILLS' }
		}
	};
});
vi.mock('UI/hudVertical.js', () => ({ ehCelularEmPe: () => false }));
vi.mock('UI/Components/MissoesIdle/MissoesIdle.js', () => ({ default: {} }));
vi.mock('UI/toqueParaAtalho.js', () => ({ pegar: vi.fn(), pendente: () => null, assinar: vi.fn() }));

const { default: IdleSkills } = await import('UI/Components/IdleSkills/IdleSkills.js');

function skill(skillId, aprendido) {
	return {
		skillId,
		nome: skillId,
		descricao: [],
		categoria: 'ativa',
		aprendido,
		nivelMaximo: 10,
		mecanica: [],
		podeAprender: true,
		motivo: null,
		custo: 1,
		portada: true,
		semEfeitoDeCombate: false,
		naRotacao: null,
		motivoDaRotacao: null,
		preRequisitos: [],
		nivelBaseMinimo: 0,
		nivelClasseMinimo: 0,
		grau: 1,
		aceitaPeloMotor: true
	};
}

/** O inteiro do contrato v5. `rev` ausente = o servidor que nao numera. */
function inteiro(extra) {
	return Object.assign(
		{
			v: 5,
			problemas: [],
			classe: { id: 1, nome: 'Swordman', nomePt: 'Espadachim' },
			graus: [{ grau: 1, classe: 'Swordman', nomePt: 'Espadachim' }],
			pontos: 6,
			nivelBase: 20,
			nivelDeJob: 10,
			trava: { grauAberto: 1, faltam: 0, pontosPorGrau: [], gratis: [], cotaDoAprendiz: 0, cotaDoPrimeiro: null },
			skills: [skill('SM_BASH', 0), skill('SM_PROVOKE', 0)]
		},
		extra || {}
	);
}

function receber(dados) {
	mocks.ganchos.get('ZC_RAGIDLE_SKILLS')({ json: JSON.stringify(dados) });
}

const corpos = nome => mocks.enviados.filter(p => p.nome === nome).map(p => JSON.parse(p.json));
const nomes = () => mocks.enviados.map(p => p.nome);

describe('a janela de habilidades aplica o parcial', () => {
	beforeEach(() => {
		vi.useRealTimers();
		mocks.enviados.length = 0;
		IdleSkills._shadow.innerHTML = IdleSkills.render();
		IdleSkills.limparEstadoDoPersonagem();
		IdleSkills.init();
	});

	it('o inteiro numerado declara UMA vez; o servidor que nao numera nunca recebe a declaracao', () => {
		receber(inteiro());
		expect(mocks.enviados, 'o servidor que nao numera recebeu um pedido').toHaveLength(0);
		IdleSkills.limparEstadoDoPersonagem();
		receber(inteiro({ rev: 1 }));
		expect(corpos('RAGIDLE_APRENDER')).toEqual([{ acao: 'pedir', base: 1 }]);
		// O segundo inteiro da mesma conexao (rev maior) nao declara de novo.
		receber(inteiro({ rev: 2 }));
		expect(corpos('RAGIDLE_APRENDER')).toHaveLength(1);
		// A conexao nova (a revisao recomeca) declara de novo.
		receber(inteiro({ rev: 1 }));
		expect(corpos('RAGIDLE_APRENDER')).toEqual([
			{ acao: 'pedir', base: 1 },
			{ acao: 'pedir', base: 1 }
		]);
	});

	it('o parcial vira o estado e a janela o desenha, como o inteiro faria', () => {
		receber(inteiro({ rev: 1 }));
		receber({
			v: 5,
			parcial: true,
			de: 1,
			rev: 2,
			trocas: [
				[['pontos'], 5],
				[['skills', 1, 'aprendido'], 3]
			],
			problemas: []
		});
		expect(IdleSkills.serverData.pontos).toBe(5);
		expect(IdleSkills.serverData.skills[1].aprendido).toBe(3);
		expect(IdleSkills.serverData.rev).toBe(2);
		expect(Object.prototype.hasOwnProperty.call(IdleSkills.serverData, 'aplicado')).toBe(false);
		// O desenho e o do estado novo: o rodape conta os pontos.
		expect(IdleSkills._shadow.querySelector('.is-pontos-pill').textContent).toContain('Pontos de habilidade: 5');
		// E o proximo parcial cai sobre a revisao 2.
		receber({ v: 5, parcial: true, de: 2, rev: 3, trocas: [[['pontos'], 4]], problemas: [] });
		expect(IdleSkills.serverData.pontos).toBe(4);
		expect(mocks.enviados.filter(p => JSON.parse(p.json).base === null)).toHaveLength(0);
	});

	it('a resposta ao "Aplicar" por parcial limpa o rascunho, como a do inteiro', () => {
		receber(inteiro({ rev: 1 }));
		IdleSkills.rascunho = { SM_BASH: 2 };
		IdleSkills._shadow.querySelector('.is-btn-aplicar').disabled = false;
		IdleSkills._shadow.querySelector('.is-btn-aplicar').dispatchEvent(new MouseEvent('click', { bubbles: true }));
		const lote = corpos('RAGIDLE_APRENDER').find(c => c.lote);
		expect(lote).toEqual({ lote: [{ skillId: 'SM_BASH', niveis: 2 }], base: 1 });
		receber({ v: 5, parcial: true, de: 1, rev: 2, trocas: [[['skills', 0, 'aprendido'], 2]], aplicado: true, problemas: [] });
		expect(IdleSkills.rascunho).toEqual({});
		expect(IdleSkills.serverData.skills[0].aprendido).toBe(2);
	});

	it('a recusa por parcial preserva o rascunho e mostra o problema', () => {
		receber(inteiro({ rev: 1 }));
		IdleSkills.rascunho = { SM_BASH: 2 };
		IdleSkills._esperandoAplicar = true;
		receber({ v: 5, parcial: true, de: 1, rev: 2, trocas: [], aplicado: false, problemas: ['sem pontos'] });
		expect(IdleSkills.rascunho).toEqual({ SM_BASH: 2 });
		expect(IdleSkills.problemas).toEqual(['sem pontos']);
	});

	it('o parcial que nao cai pede o inteiro UMA vez; os seguintes esperam por ele', () => {
		receber(inteiro({ rev: 1 }));
		mocks.enviados.length = 0;
		receber({ v: 5, parcial: true, de: 7, rev: 8, trocas: [[['pontos'], 0]], problemas: [] });
		receber({ v: 5, parcial: true, de: 8, rev: 9, trocas: [[['pontos'], 0]], problemas: [] });
		expect(corpos('RAGIDLE_APRENDER')).toEqual([{ acao: 'pedir', base: null }]);
		// Nada foi desenhado do parcial que nao caiu.
		expect(IdleSkills.serverData.pontos).toBe(6);
		// Nem de um que CAIRIA sobre a revisao na mao: com o inteiro no ar, so ele conta.
		receber({ v: 5, parcial: true, de: 1, rev: 2, trocas: [[['pontos'], 0]], problemas: [] });
		expect(IdleSkills.serverData.pontos).toBe(6);
		// O inteiro chega e o parcial seguinte volta a cair.
		receber(inteiro({ rev: 10, pontos: 1 }));
		receber({ v: 5, parcial: true, de: 10, rev: 11, trocas: [[['pontos'], 2]], problemas: [] });
		expect(IdleSkills.serverData.pontos).toBe(2);
	});

	it('o "Aplicar" que passou do outro lado mas cujo parcial nao caiu leva o rascunho junto', () => {
		receber(inteiro({ rev: 1 }));
		IdleSkills.rascunho = { SM_BASH: 2 };
		IdleSkills._esperandoAplicar = true;
		receber({ v: 5, parcial: true, de: 9, rev: 10, trocas: [], aplicado: true, problemas: [] });
		expect(IdleSkills.rascunho).toEqual({});
		expect(IdleSkills._esperandoAplicar).toBe(false);
	});

	it('abrir pede pelo 0x0ffb com base ao servidor que numera, e pelo 0x0ff9 ao que nao numera', () => {
		receber(inteiro());
		mocks.enviados.length = 0;
		IdleSkills.toggle();
		expect(nomes()).toEqual(['RAGIDLE_PEDIR_SKILLS']);
		IdleSkills.toggle();
		receber(inteiro({ rev: 3 }));
		mocks.enviados.length = 0;
		IdleSkills.toggle();
		expect(nomes()).toEqual(['RAGIDLE_APRENDER']);
		expect(corpos('RAGIDLE_APRENDER')).toEqual([{ acao: 'pedir', base: 3 }]);
	});

	it('a rotacao leva a base', () => {
		receber(inteiro({ rev: 4, skills: [Object.assign(skill('SM_BASH', 1), { naRotacao: 1 })] }));
		mocks.enviados.length = 0;
		const botao = IdleSkills._shadow.querySelector('[data-rotacao], .is-btn-rotacao');
		expect(botao, 'o botao da rotacao sumiu do detalhe').not.toBeNull();
		botao.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		expect(corpos('RAGIDLE_PRIORIZAR')).toEqual([{ skillId: 'SM_BASH', ligar: false, base: 4 }]);
	});

	it('a troca de personagem esquece a revisao e a declaracao', () => {
		receber(inteiro({ rev: 5 }));
		IdleSkills.limparEstadoDoPersonagem();
		expect(IdleSkills._estadoDoServidor).toBeNull();
		expect(IdleSkills._revDeclarada).toBeNull();
		expect(IdleSkills._inteiroPedido).toBe(false);
	});
});
