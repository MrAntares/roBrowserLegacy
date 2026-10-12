/**
 * A ECONOMIA DE ENERGIA SAIU DO CLIENTE; SO A SAIDA FICA (07/10/2026, Novo
 * Bot V5).
 *
 * Substitui `atrasoDaEconomia`, `economiaNaReentrada` e
 * `economiaAutomaticaDesligavel`, que provavam o pedido automatico, a opcao e
 * a tela preta - os tres retirados. O servidor ja recusa o `entrar`.
 *
 * O que FICA, e este teste cobra: o `ZC_RAGIDLE_ECONOMIA` continua com UM dono
 * (hookPacket substitui), e esse dono tira da economia quem tinha uma sessao
 * aberta antes da retirada (`ativa:true` -> manda `sair`), sem abrir tela.
 *
 * `MapEngine.js` nao carrega em jsdom; o fio e cobrado no fonte SEM
 * comentario.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

function semComentario(texto) {
	return texto.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}

const MOTOR = semComentario(readFileSync('src/Engine/MapEngine.js', 'utf8'));
const UI = semComentario(readFileSync('src/UI/UIManager.js', 'utf8'));

function corpoDe(fonte, assinatura) {
	const i = fonte.indexOf(assinatura);
	expect(i, assinatura).toBeGreaterThan(-1);
	return fonte.slice(i, fonte.indexOf('\n}', i));
}

describe('o pedido de economia saiu', () => {
	it('a aba escondida nao pede nada: sem ouvinte de visibilidade, sem `entrar`', () => {
		expect(MOTOR).not.toMatch(/onVisibilidadeMudouParaEconomia/);
		expect(MOTOR).not.toMatch(/acao: 'entrar'/);
		expect(MOTOR).not.toMatch(/MS_DE_ATRASO_ANTES_DE_ENTRAR_NA_ECONOMIA/);
	});

	it('a opcao saiu das Configuracoes de Video e das preferencias', () => {
		expect(readFileSync('src/UI/Components/GraphicsOption/GraphicsOption.html', 'utf8')).not.toMatch(/economia-automatica/);
		expect(semComentario(readFileSync('src/UI/Components/GraphicsOption/GraphicsOption.js', 'utf8'))).not.toMatch(
			/economia/i
		);
		expect(semComentario(readFileSync('src/Preferences/Graphics.js', 'utf8'))).not.toMatch(/economiaDeEnergiaAutomatica/);
	});

	it('a tela preta da economia saiu', () => {
		expect(UI).not.toMatch(/showEconomiaDeEnergia/);
		expect(MOTOR).not.toMatch(/showEconomiaDeEnergia|abrirTelaDaEconomia|fecharTelaDaEconomia/);
	});
});

describe('o dono do ZC_RAGIDLE_ECONOMIA continua de pe', () => {
	it('um gancho, um dono', () => {
		expect(MOTOR.match(/hookPacket\(PACKET\.ZC\.RAGIDLE_ECONOMIA,/g)).toHaveLength(1);
		expect(MOTOR).toMatch(/Network\.hookPacket\(PACKET\.ZC\.RAGIDLE_ECONOMIA, onEconomiaRecebida\);/);
	});

	it('`ativa:true` (sessao antiga) pede a saida na hora, sem tela', () => {
		const corpo = corpoDe(MOTOR, 'function onEconomiaRecebida(pkt)');
		const ativa = corpo.slice(corpo.indexOf('corpo.ativa === true'));
		expect(ativa.slice(0, 300)).toMatch(/acao: 'sair'/);
		expect(ativa.slice(0, 300)).toMatch(/Network\.sendPacket\(sair\)/);
	});

	it('`expulso:true` ainda volta pelo boot', () => {
		const corpo = corpoDe(MOTOR, 'function onEconomiaRecebida(pkt)');
		expect(corpo).toMatch(/corpo\.expulso === true\) \{\s*import\('Engine\/GameEngine\.js'\)\.then\(m => m\.default\.reload\(\)\);/);
	});
});
