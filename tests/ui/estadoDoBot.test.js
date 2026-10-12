/**
 * O ESTADO DO MENU DO BOT NOVO (07/10/2026): serverConfig x rascunho, ON/OFF
 * imediatos, Aplicar transacional, conflito, resposta atrasada, outro
 * personagem e status mais velho. Sem DOM.
 */
import { describe, expect, it } from 'vitest';
import { criarEstadoDoBot, fraseDoStatus } from 'UI/Components/BotMenu/estadoDoBot.js';

const CONFIG = { v: 1, cacar: true, especiesVetadas: [], modoDeAtaque: 'skills-e-basico', raioDePercepcao: 15, skills: { geral: [], porSkill: {}, porMonstro: {} } };

function montar() {
	const enviados = [];
	const e = criarEstadoDoBot({ enviar: c => enviados.push(c) });
	const resposta = (requestId, extra = {}) => ({
		v: 1,
		tipo: 'resposta',
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
		monstros: [{ especie: 1002, nome: 'Poring' }],
		...extra
	});
	return { e, enviados, resposta };
}

describe('estado do menu do Bot', () => {
	it('pedir carrega a config confirmada e as capacidades; rascunho comeca limpo', () => {
		const { e, enviados, resposta } = montar();
		const id = e.pedirEstado();
		expect(enviados[0]).toEqual({ v: 1, requestId: id, verbo: 'pedir' });
		expect(e.receber(resposta(id), 7)).toBe(true);
		expect(e.estado().serverConfig).toEqual(CONFIG);
		expect(e.estado().dirty).toBe(false);
		expect(e.secoes()).toEqual(['cacada', 'ataque']);
	});

	it('editar marca dirty; descartar volta ao confirmado', () => {
		const { e, resposta } = montar();
		e.receber(resposta(e.pedirEstado()), 7);
		e.editar(c => ({ ...c, raioDePercepcao: 20 }));
		expect(e.estado().dirty).toBe(true);
		e.descartar();
		expect(e.estado().dirty).toBe(false);
		expect(e.estado().editConfig.raioDePercepcao).toBe(15);
	});

	it('OFF funciona com rascunho sujo e nao consome o rascunho; so afirma desligado depois da resposta', () => {
		const { e, enviados, resposta } = montar();
		e.receber(resposta(e.pedirEstado(), { ligado: true, situacao: 'ativo' }), 7);
		e.editar(c => ({ ...c, raioDePercepcao: 20 }));
		const id = e.desligar();
		expect(enviados.at(-1)).toEqual({ v: 1, requestId: id, verbo: 'desligar' });
		expect(e.estado().ligado).toBe(true);
		expect(e.estado().pendenteLigarDesligar).toBe('desligar');
		e.receber(resposta(id, { ligado: false }), 7);
		expect(e.estado().ligado).toBe(false);
		expect(e.estado().pendenteLigarDesligar).toBeNull();
		expect(e.estado().dirty).toBe(true);
		expect(e.estado().editConfig.raioDePercepcao).toBe(20);
	});

	it('ON nao envia o rascunho (usa a config confirmada no servidor)', () => {
		const { e, enviados, resposta } = montar();
		e.receber(resposta(e.pedirEstado()), 7);
		e.editar(c => ({ ...c, cacar: false }));
		e.ligar();
		expect(enviados.at(-1)).not.toHaveProperty('config');
	});

	it('Aplicar aceito limpa o rascunho e sobe a revisao', () => {
		const { e, enviados, resposta } = montar();
		e.receber(resposta(e.pedirEstado()), 7);
		e.editar(c => ({ ...c, raioDePercepcao: 20 }));
		const id = e.aplicar();
		expect(enviados.at(-1)).toMatchObject({ verbo: 'aplicar', baseRevision: 0, config: { raioDePercepcao: 20 } });
		expect(e.aplicar()).toBeNull(); // sem pedido duplo
		e.receber(resposta(id, { revisao: 1, config: { ...CONFIG, raioDePercepcao: 20 } }), 7);
		expect(e.estado().dirty).toBe(false);
		expect(e.estado().revisao).toBe(1);
		expect(e.estado().baseRevision).toBe(1);
	});

	it('Aplicar rejeitado mantem o rascunho e lista os problemas', () => {
		const { e, resposta } = montar();
		e.receber(resposta(e.pedirEstado()), 7);
		e.editar(c => ({ ...c, raioDePercepcao: 99 }));
		const id = e.aplicar();
		e.receber(resposta(id, { ok: false, erro: 'config-invalida', problemas: [{ campo: 'raioDePercepcao', mensagem: 'x' }] }), 7);
		expect(e.estado().dirty).toBe(true);
		expect(e.estado().editConfig.raioDePercepcao).toBe(99);
		expect(e.estado().problemas).toHaveLength(1);
	});

	it('conflito de revisao: avisa, mantem a edicao e recarregar e escolha explicita', () => {
		const { e, resposta } = montar();
		e.receber(resposta(e.pedirEstado()), 7);
		e.editar(c => ({ ...c, raioDePercepcao: 20 }));
		const id = e.aplicar();
		e.receber(resposta(id, { ok: false, erro: 'conflito-de-revisao', revisao: 4, config: { ...CONFIG, cacar: false } }), 7);
		expect(e.estado().conflito).toBe(true);
		expect(e.estado().mudouNoServidor).toBe(true);
		expect(e.estado().editConfig.raioDePercepcao).toBe(20);
		e.recarregar();
		expect(e.estado().editConfig.cacar).toBe(false);
		expect(e.estado().baseRevision).toBe(4);
	});

	it('resposta atrasada (requestId que nao esta em voo) nao substitui estado novo', () => {
		const { e, resposta } = montar();
		e.receber(resposta(e.pedirEstado(), { revisao: 5 }), 7);
		expect(e.receber(resposta(999, { revisao: 1, config: { ...CONFIG, cacar: false } }), 7)).toBe(false);
		expect(e.estado().revisao).toBe(5);
	});

	it('resposta de outro personagem e ignorada; reiniciar mata pedidos em voo', () => {
		const { e, resposta } = montar();
		const id = e.pedirEstado();
		expect(e.receber({ ...resposta(id), personagemId: 8 }, 7)).toBe(false);
		e.reiniciar();
		expect(e.receber(resposta(id), 7)).toBe(false);
		expect(e.estado().carregado).toBe(false);
	});

	it('status mais velho nao substitui o atual', () => {
		const { e, resposta } = montar();
		e.receber(resposta(e.pedirEstado()), 7);
		e.receber({ ...resposta(null), tipo: 'status', requestId: null, statusRevision: 5, status: { codigo: 'atacando', alvo: { nome: 'Poring', especie: 1002 } } }, 7);
		e.receber({ ...resposta(null), tipo: 'status', requestId: null, statusRevision: 3, status: { codigo: 'procurando-alvo', alvo: null } }, 7);
		expect(e.estado().status.codigo).toBe('atacando');
		expect(fraseDoStatus(e.estado().status)).toBe('Atacando Poring');
	});

	it('o servidor mudou a config sem rascunho sujo: a tela acompanha', () => {
		const { e, resposta } = montar();
		e.receber(resposta(e.pedirEstado()), 7);
		e.receber({ ...resposta(null), tipo: 'status', requestId: null, statusRevision: 1, revisao: 2, config: { ...CONFIG, raioDePercepcao: 9 } }, 7);
		expect(e.estado().editConfig.raioDePercepcao).toBe(9);
		expect(e.estado().dirty).toBe(false);
	});

	it('guarda as pocoes da resposta (Fase 6), como as skills', () => {
		const { e, resposta } = montar();
		expect(e.estado().pocoes).toBeNull();
		const pocoes = [{ itemId: 501, nome: 'Poção Vermelha', hp: true, sp: false, quantidade: 4 }];
		e.receber(resposta(e.pedirEstado(), { pocoes }), 7);
		expect(e.estado().pocoes).toEqual(pocoes);
		// Status sem a lista nao apaga a que ja chegou.
		e.receber({ ...resposta(null), tipo: 'status', requestId: null, statusRevision: 1, pocoes: undefined }, 7);
		expect(e.estado().pocoes).toEqual(pocoes);
	});

	it('os codigos de status da Fase 6 tem frase', () => {
		const frase = codigo => fraseDoStatus({ codigo, alvo: null });
		expect(frase('recuperando-hp')).toBe('Recuperando HP');
		expect(frase('recuperando-sp')).toBe('Recuperando SP');
		expect(frase('curando')).toBe('Curando');
		expect(frase('mantendo-buffs')).toBe('Mantendo buffs');
		expect(frase('descansando')).toBe('Descansando');
		expect(frase('coletando')).toBe('Coletando itens');
	});
});
