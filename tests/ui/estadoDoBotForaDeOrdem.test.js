/**
 * QA FINAL (08/10/2026, agente visual): o estado do menu do Bot diante de respostas FORA DE ORDEM,
 * revisao conflitante e troca de personagem durante a resposta. A tela nao provoca isso de forma
 * confiavel (o servidor responde em ordem numa conexao so), entao a prova e sobre o modulo REAL
 * (`estadoDoBot.js`), com o pacote do servidor no formato de `servidor/bot/protocolo-do-bot.ts`.
 *
 * Contrato 05 secao 4: "Resposta atrasada, de outro personagem/mapa ou mais antiga nao substitui
 * estado novo." e "Trocar personagem encerra requests/subscriptions e carrega o contexto proprio."
 */
import { describe, expect, it } from 'vitest';
import { criarEstadoDoBot } from 'UI/Components/BotMenu/estadoDoBot.js';

const CONFIG = { v: 1, cacar: true, especiesVetadas: [], modoDeAtaque: 'skills-e-basico', raioDePercepcao: 15, skills: { geral: [], porSkill: {}, porMonstro: {} } };

function montar() {
	const enviados = [];
	const e = criarEstadoDoBot({ enviar: c => enviados.push(c) });
	const pacote = (requestId, extra = {}) => ({
		v: 1,
		tipo: requestId === null ? 'status' : 'resposta',
		requestId,
		personagemId: 7,
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
	});
	return { e, enviados, pacote };
}

describe('estado do Bot: respostas fora de ordem', () => {
	it('a resposta de um "pedir" mais antigo que chega DEPOIS do Aplicar aceito nao volta a config nem a revisao', () => {
		const { e, pacote } = montar();
		e.receber(pacote(e.pedirEstado()), 7);
		const pedir = e.pedirEstado(); // ex.: reabrir a janela enquanto o Salvar esta em voo
		e.editar(c => ({ ...c, raioDePercepcao: 22 }));
		const aplicar = e.aplicar();
		// O Aplicar responde primeiro (revisao 1) e o "pedir" chega atrasado com a revisao 0.
		e.receber(pacote(aplicar, { revisao: 1, config: { ...CONFIG, raioDePercepcao: 22 }, statusRevision: 1 }), 7);
		e.receber(pacote(pedir, { revisao: 0, config: CONFIG, statusRevision: 0 }), 7);
		expect(e.estado().revisao).toBe(1);
		expect(e.estado().serverConfig.raioDePercepcao).toBe(22);
		expect(e.estado().editConfig.raioDePercepcao).toBe(22);
		expect(e.estado().dirty).toBe(false);
	});

	it('a resposta mais antiga nao desfaz o ON confirmado (ligado vem da observacao mais nova)', () => {
		const { e, pacote } = montar();
		e.receber(pacote(e.pedirEstado()), 7);
		const pedir = e.pedirEstado();
		const ligar = e.ligar();
		e.receber(pacote(ligar, { ligado: true, situacao: 'ativo', statusRevision: 2, status: { codigo: 'procurando-alvo', alvo: null } }), 7);
		e.receber(pacote(pedir, { ligado: false, situacao: 'desligado', statusRevision: 1 }), 7);
		expect(e.estado().ligado).toBe(true);
		expect(e.estado().status.codigo).toBe('procurando-alvo');
	});

	it('com rascunho sujo, a config nova do servidor avisa e NAO apaga a edicao', () => {
		const { e, pacote } = montar();
		e.receber(pacote(e.pedirEstado()), 7);
		e.editar(c => ({ ...c, raioDePercepcao: 25 }));
		e.receber(pacote(null, { revisao: 3, config: { ...CONFIG, cacar: false }, statusRevision: 4 }), 7);
		expect(e.estado().editConfig.raioDePercepcao).toBe(25);
		expect(e.estado().mudouNoServidor).toBe(true);
		expect(e.estado().revisao).toBe(3);
		// Aplicar depois disso usa a base antiga: o servidor responde conflito e a edicao fica.
		const id = e.aplicar();
		e.receber(pacote(id, { ok: false, erro: 'conflito-de-revisao', revisao: 3, config: { ...CONFIG, cacar: false }, statusRevision: 4 }), 7);
		expect(e.estado().conflito).toBe(true);
		expect(e.estado().editConfig.raioDePercepcao).toBe(25);
		expect(e.estado().serverConfig.cacar).toBe(false);
	});
});

describe('estado do Bot: troca de personagem durante a resposta', () => {
	it('a resposta de um pedido do personagem anterior (em voo na troca) e descartada', () => {
		const { e, pacote } = montar();
		e.receber(pacote(e.pedirEstado()), 7);
		const velho = e.aplicar() ?? e.ligar();
		e.reiniciar();
		const novo = e.pedirEstado();
		expect(novo).not.toBe(velho);
		expect(e.receber(pacote(velho, { personagemId: 7, ligado: true }), e.estado().personagemId)).toBe(false);
		e.receber(pacote(novo, { personagemId: 8 }), e.estado().personagemId);
		expect(e.estado().personagemId).toBe(8);
		expect(e.estado().ligado).toBe(false);
	});
});
