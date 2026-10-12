/**
 * A EDICAO DA SOBREVIVENCIA, DO SUPORTE E DA COLETA DO BOT (Fase 6,
 * 07/10/2026): funcoes puras sobre a config v1. Tetos, sem repetir, gatilho e
 * limiar padrao pelo tipo, grupo so com `alcancaGrupo`, faixas, e nunca mutar
 * a config recebida.
 */
import { describe, expect, it } from 'vitest';
import {
	adicionarPocao,
	adicionarSuporte,
	definirDescanso,
	definirDestinoDoSuporte,
	definirLimiarDaCura,
	definirLimiarDePocao,
	definirNivelDoSuporte,
	definirRaioDeColeta,
	deixarDeIgnorar,
	descansoCoerente,
	ignorarItem,
	ligarColeta,
	moverPocao,
	moverSuporte,
	removerPocao,
	removerSuporte
} from 'UI/Components/BotMenu/edicaoDeManutencao.js';

function congelar(o) {
	if (o && typeof o === 'object') {
		Object.values(o).forEach(congelar);
		Object.freeze(o);
	}
	return o;
}

const base = () =>
	congelar({
		v: 1,
		cacar: true,
		especiesVetadas: [],
		modoDeAtaque: 'skills-e-basico',
		raioDePercepcao: 15,
		skills: { geral: [], porSkill: {}, porMonstro: {} },
		sobrevivencia: {
			pocoesHp: { itens: [], abaixoDe: 0 },
			pocoesSp: { itens: [], abaixoDe: 0 },
			descanso: { sentarHpAbaixoDe: 0, sentarSpAbaixoDe: 0, levantarEm: 100 }
		},
		suporte: { lista: [] },
		coleta: { ligada: false, raio: 5, ignorar: [] }
	});

const BENCAO = { skillId: 34, nome: 'Bênção', aprendido: 10, aceita: false, suporte: 'buff', alcancaGrupo: true };
const AGI = { skillId: 29, nome: 'Aumentar Agilidade', aprendido: 10, aceita: false, suporte: 'buff', alcancaGrupo: false };
const CURA = { skillId: 28, nome: 'Curar', aprendido: 10, aceita: false, suporte: 'cura', alcancaGrupo: true };

describe('pocoes do Bot', () => {
	it('adiciona sem repetir e respeita o teto, em cada eixo separado', () => {
		const b = base();
		let c = adicionarPocao(b, 'hp', 501, 2);
		c = adicionarPocao(c, 'hp', 501, 2);
		c = adicionarPocao(c, 'hp', 502, 2);
		c = adicionarPocao(c, 'hp', 503, 2);
		c = adicionarPocao(c, 'sp', 505, 2);
		expect(c.sobrevivencia.pocoesHp.itens).toEqual([501, 502]);
		expect(c.sobrevivencia.pocoesSp.itens).toEqual([505]);
		expect(b.sobrevivencia.pocoesHp.itens).toEqual([]);
	});

	it('ordena e remove; nos extremos nada muda', () => {
		let c = adicionarPocao(adicionarPocao(base(), 'hp', 501), 'hp', 502);
		expect(moverPocao(c, 'hp', 501, -1)).toBe(c);
		c = moverPocao(c, 'hp', 502, -1);
		expect(c.sobrevivencia.pocoesHp.itens).toEqual([502, 501]);
		c = removerPocao(c, 'hp', 502);
		expect(c.sobrevivencia.pocoesHp.itens).toEqual([501]);
		expect(removerPocao(c, 'hp', 999)).toBe(c);
	});

	it('o limiar fica inteiro de 0 a 99', () => {
		expect(definirLimiarDePocao(base(), 'hp', 150).sobrevivencia.pocoesHp.abaixoDe).toBe(99);
		expect(definirLimiarDePocao(base(), 'sp', -3).sobrevivencia.pocoesSp.abaixoDe).toBe(0);
		expect(definirLimiarDePocao(base(), 'hp', '40.4').sobrevivencia.pocoesHp.abaixoDe).toBe(40);
	});
});

describe('descanso do Bot', () => {
	it('faixas por campo e a coerencia do levantar', () => {
		let c = definirDescanso(base(), 'sentarHpAbaixoDe', 30);
		c = definirDescanso(c, 'levantarEm', 1);
		expect(c.sobrevivencia.descanso).toEqual({ sentarHpAbaixoDe: 30, sentarSpAbaixoDe: 0, levantarEm: 2 });
		expect(descansoCoerente(c)).toBe(false);
		c = definirDescanso(c, 'levantarEm', 90);
		expect(descansoCoerente(c)).toBe(true);
		expect(definirDescanso(c, 'outro', 5)).toBe(c);
	});
});

describe('suporte do Bot', () => {
	it('gatilho e limiar padrao pelo tipo, destino "eu", e skill sem tipo nao entra', () => {
		let c = adicionarSuporte(base(), BENCAO, 8);
		c = adicionarSuporte(c, CURA, 8);
		expect(c.suporte.lista).toEqual([
			{ skillId: 34, nivel: 'aprendido', destino: 'eu', gatilho: 'manter', limiar: 0 },
			{ skillId: 28, nivel: 'aprendido', destino: 'eu', gatilho: 'hp', limiar: 60 }
		]);
		expect(adicionarSuporte(c, { skillId: 5, nome: 'Golpe', suporte: null }, 8)).toBe(c);
	});

	it('teto e sem repetir skill+destino', () => {
		let c = adicionarSuporte(base(), BENCAO, 2);
		expect(adicionarSuporte(c, BENCAO, 2)).toBe(c);
		c = adicionarSuporte(c, CURA, 2);
		expect(adicionarSuporte(c, AGI, 2)).toBe(c);
	});

	it('"grupo" so com alcancaGrupo; a mesma skill pode ir em mim E no grupo, mas nunca duas vezes no mesmo destino', () => {
		let c = adicionarSuporte(adicionarSuporte(base(), AGI), BENCAO);
		expect(definirDestinoDoSuporte(c, 0, 'grupo', AGI)).toBe(c);
		c = definirDestinoDoSuporte(c, 1, 'grupo', BENCAO);
		expect(c.suporte.lista[1].destino).toBe('grupo');
		c = adicionarSuporte(c, BENCAO);
		expect(c.suporte.lista.map(e => e.skillId + ':' + e.destino)).toEqual(['29:eu', '34:grupo', '34:eu']);
		expect(definirDestinoDoSuporte(c, 2, 'grupo', BENCAO)).toBe(c);
	});

	it('nivel, limiar so da cura (1..99), ordem e remocao por posicao', () => {
		let c = adicionarSuporte(adicionarSuporte(base(), BENCAO), CURA);
		expect(definirLimiarDaCura(c, 0, 40)).toBe(c);
		c = definirLimiarDaCura(c, 1, 0);
		expect(c.suporte.lista[1].limiar).toBe(1);
		c = definirLimiarDaCura(c, 1, 45);
		expect(c.suporte.lista[1].limiar).toBe(45);
		c = definirNivelDoSuporte(c, 0, 5);
		expect(c.suporte.lista[0].nivel).toBe(5);
		c = moverSuporte(c, 1, -1);
		expect(c.suporte.lista.map(e => e.skillId)).toEqual([28, 34]);
		expect(moverSuporte(c, 1, 1)).toBe(c);
		c = removerSuporte(c, 0);
		expect(c.suporte.lista.map(e => e.skillId)).toEqual([34]);
	});
});

describe('coleta do Bot', () => {
	it('liga, raio na faixa, ignora sem repetir e com teto, e volta a coletar', () => {
		const b = base();
		let c = ligarColeta(b, true);
		c = definirRaioDeColeta(c, 40, 1, 15);
		expect(c.coleta.raio).toBe(15);
		c = definirRaioDeColeta(c, 0, 1, 15);
		expect(c.coleta.raio).toBe(1);
		c = ignorarItem(c, 909, 2);
		c = ignorarItem(c, 909, 2);
		c = ignorarItem(c, 512, 2);
		c = ignorarItem(c, 713, 2);
		expect(c.coleta).toEqual({ ligada: true, raio: 1, ignorar: [909, 512] });
		expect(ignorarItem(c, -1)).toBe(c);
		expect(ignorarItem(c, 1.5)).toBe(c);
		c = deixarDeIgnorar(c, 909);
		expect(c.coleta.ignorar).toEqual([512]);
		expect(b.coleta).toEqual({ ligada: false, raio: 5, ignorar: [] });
	});

	it('config sem os blocos novos (servidor antigo): a edicao nasce do padrao', () => {
		const velha = { v: 1, cacar: true };
		// O padrao novo (ajustes do dono, 09/10/2026): ligada, raio 20.
		expect(ligarColeta(velha, true).coleta).toEqual({ ligada: true, raio: 20, ignorar: [] });
		expect(adicionarPocao(velha, 'sp', 505).sobrevivencia.pocoesSp.itens).toEqual([505]);
		expect(adicionarSuporte(velha, CURA).suporte.lista).toHaveLength(1);
		expect(velha).toEqual({ v: 1, cacar: true });
	});
});
