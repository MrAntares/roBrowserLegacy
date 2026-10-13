/**
 * A recusa do encaixe de carta vira aviso na tela (bug #1 de 13/10/2026).
 * Ver src/UI/Components/MochilaIdle/recusaDoEncarte.js.
 */
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { absorverCatalogo, desligarTraducao, traduzir } from 'Core/Traducao.js';
import { avisoDaRecusaDoEncarte } from 'UI/Components/MochilaIdle/recusaDoEncarte.js';

describe('a recusa do encaixe de carta', () => {
	it('a carta que o motor recusa vira aviso, sem o remetente', () => {
		expect(
			avisoDaRecusaDoEncarte(
				'Sistema : Nao deu para encaixar a carta: esta carta ainda nao tem efeito no jogo e nao pode ser encaixada.\0'
			)
		).toBe('Nao deu para encaixar a carta: esta carta ainda nao tem efeito no jogo e nao pode ser encaixada.');
	});
	it('a recusa do encaixe de uma peca tambem vira aviso', () => {
		expect(avisoDaRecusaDoEncarte('Sistema : Nao deu para encaixar a carta: a peca nao tem slot livre.')).toBe(
			'Nao deu para encaixar a carta: a peca nao tem slot livre.'
		);
	});
	it('a lista vazia (nenhuma peca aceita) vira aviso', () => {
		expect(
			avisoDaRecusaDoEncarte(
				'Sistema : Nenhuma peca da sua mochila aceita Carta Sorrateiro. Lembre: a peca precisa estar GUARDADA (nao vestida), ter slot livre, e a carta precisa servir naquele tipo de equipamento.'
			)
		).toMatch(/^Nenhuma peca da sua mochila aceita Carta Sorrateiro\./);
	});
	it('CONTROLE: outra fala do sistema nao acende o aviso', () => {
		expect(avisoDaRecusaDoEncarte('Sistema : Nao deu para equipar: a sua classe nao usa este item')).toBeNull();
		expect(avisoDaRecusaDoEncarte('Sistema : Voce recebeu 10 zeny')).toBeNull();
		expect(avisoDaRecusaDoEncarte(undefined)).toBeNull();
	});
});

describe('em modo EN o servidor ainda manda PT: a regex le o PT cru e a faixa traduz ao mostrar', () => {
	afterEach(() => desligarTraducao());
	const FALA = 'Sistema : Nao deu para encaixar a carta: esta carta ainda nao tem efeito no jogo e nao pode ser encaixada.\0';
	const CATALOGO = {
		v: 1,
		exatos: {
			'Nao deu para encaixar a carta: esta carta ainda nao tem efeito no jogo e nao pode ser encaixada.':
				"Couldn't insert the card: this card has no effect in the game yet, so it can't be inserted."
		},
		modelos: [{ pt: 'Nao deu para encaixar a carta: {0}', en: "Couldn't insert the card: {0}", cru: [] }]
	};
	it('o catalogo ligado nao atrapalha a regex: ela ainda casa o PT e o aviso sai em ingles', () => {
		absorverCatalogo(CATALOGO);
		const aviso = avisoDaRecusaDoEncarte(FALA);
		expect(aviso).not.toBeNull();
		expect(traduzir(aviso)).toBe("Couldn't insert the card: this card has no effect in the game yet, so it can't be inserted.");
	});
	it('em PT o aviso sai igual', () => {
		expect(traduzir(avisoDaRecusaDoEncarte(FALA))).toBe(avisoDaRecusaDoEncarte(FALA));
	});
	it('a fala ja em ingles NAO casa (nunca chega assim: o servidor so manda PT)', () => {
		expect(avisoDaRecusaDoEncarte("Sistema : Couldn't insert the card: this card has no effect")).toBeNull();
	});
});

describe('a costura: o tratador da fala do sistema acende a faixa', () => {
	const MAIN = readFileSync('src/Engine/MapEngine/Main.js', 'utf8').replaceAll('\r\n', '\n');
	it('onFalaDoSistema chama avisoDaRecusaDoEncarte e mostra no Announce', () => {
		const i = MAIN.indexOf('function onFalaDoSistema(');
		expect(i, 'o tratador da fala do sistema sumiu').toBeGreaterThan(0);
		const corpo = MAIN.slice(i, MAIN.indexOf('\n}\n', i));
		expect(corpo).toContain('avisoDaRecusaDoEncarte(pkt.msg)');
		expect(corpo).toContain('Announce.append();');
		expect(corpo).toContain('Announce.set(traduzir(avisoDoEncarte)');
		// a fala continua indo ao chat: a faixa e reforco, nao troca
		expect(corpo).toContain('ChatBox.addText(pkt.msg, ChatBox.TYPE.PUBLIC, ChatBox.FILTER.SISTEMA);');
	});
});
