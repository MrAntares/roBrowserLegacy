import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
	ESPERA_DA_CONFIRMACAO_MS,
	TEXTO_CAMINHADA_RECUSADA,
	armarEspera,
	confirmarPeloServidor,
	fimDaCaminhadaEhDoPedido,
	vencerEspera
} from '../../src/Engine/MapEngine/confirmacaoDaCaminhada.js';

/*
 * C47 (auditoria de tela, 30/09/2026): o `onWalkEnd` roda no fim de QUALQUER
 * caminhada, e o boneco so anda com o ZC_NOTIFY_PLAYERMOVE. A skill guardada
 * so sai no fim da caminhada que o servidor confirmou depois do pedido; sem
 * confirmacao no prazo, o pedido e descartado com aviso (o rAthena recusa o
 * andar calado, unit.cpp:855-869).
 */
const sessao = () => ({ moveAction: null, moveActionAlcance: null, moveActionEspera: null });

describe('a caminhada confirmada pelo servidor', () => {
	it('o fim de uma caminhada ANTERIOR ao pedido nao solta a skill; depois do PLAYERMOVE, solta', () => {
		const s = sessao();
		const skill = { SKID: 83 };
		s.moveAction = skill;
		armarEspera(s, skill);
		// O boneco ja andava (clique antes, caca): essa caminhada termina primeiro.
		expect(fimDaCaminhadaEhDoPedido(s)).toBe(false);
		// O servidor responde o CZ_REQUEST_MOVE: a caminhada nova e a do pedido.
		confirmarPeloServidor(s);
		expect(fimDaCaminhadaEhDoPedido(s)).toBe(true);
	});

	it('sem resposta no prazo o pedido e descartado (e o chamador avisa); confirmado, o prazo nao descarta', () => {
		const s = sessao();
		const skill = { SKID: 83 };
		const alcance = { pacote: skill };
		s.moveAction = skill;
		s.moveActionAlcance = alcance;
		const espera = armarEspera(s, skill);
		expect(vencerEspera(s, espera)).toBe(true);
		expect(s.moveAction).toBe(null);
		expect(s.moveActionAlcance).toBe(null);
		expect(s.moveActionEspera).toBe(null);

		const t = sessao();
		t.moveAction = skill;
		const confirmada = armarEspera(t, skill);
		confirmarPeloServidor(t);
		expect(vencerEspera(t, confirmada)).toBe(false);
		expect(t.moveAction).toBe(skill);
	});

	it('o prazo de uma espera VELHA nao descarta o pedido novo', () => {
		const s = sessao();
		const primeira = { SKID: 83 };
		const segunda = { SKID: 19 };
		s.moveAction = primeira;
		const velha = armarEspera(s, primeira);
		// A caminhada extra do 017e67b2 (ou um pedido novo) re-arma a espera.
		s.moveAction = segunda;
		armarEspera(s, segunda);
		expect(vencerEspera(s, velha)).toBe(false);
		expect(s.moveAction).toBe(segunda);
		// Re-armada para o MESMO pacote, a velha tambem nao vale.
		const t = sessao();
		t.moveAction = primeira;
		const antes = armarEspera(t, primeira);
		armarEspera(t, primeira);
		expect(vencerEspera(t, antes)).toBe(false);
	});

	it('um pedido que nao armou espera (ataque, coleta) solta como antes; a espera de outro pacote nao o prende', () => {
		const s = sessao();
		s.moveAction = { tipo: 'ataque' };
		expect(fimDaCaminhadaEhDoPedido(s)).toBe(true);
		armarEspera(s, { SKID: 83 });
		expect(fimDaCaminhadaEhDoPedido(s)).toBe(true);
		// O PLAYERMOVE nao confirma a espera de um pacote que ja nao esta guardado.
		const espera = s.moveActionEspera;
		confirmarPeloServidor(s);
		expect(espera.confirmada).toBe(false);
	});

	it('o prazo cobre a ida e volta e a troca de rumo no fim do passo; o aviso e em portugues', () => {
		expect(ESPERA_DA_CONFIRMACAO_MS).toBe(2000);
		expect(TEXTO_CAMINHADA_RECUSADA).toBe('Não foi possível andar até o alvo. Chegue mais perto para usar a habilidade.');
	});
});

describe('a costura: PLAYERMOVE confirma, onWalkEnd espera, Skill.js arma o prazo', () => {
	const semTabs = (arquivo) => fs.readFileSync(arquivo, 'utf8').replace(/\r\n/g, '\n').replace(/\n\t+/g, '\n');

	it('Main.onPlayerMove confirma antes de andar', () => {
		const src = semTabs('src/Engine/MapEngine/Main.js');
		expect(src.indexOf('function onPlayerMove(pkt) {\n// C47')).toBeGreaterThan(-1);
		expect(src.indexOf('confirmarPeloServidor(Session);\nSession.Entity.walkTo(')).toBeGreaterThan(-1);
	});

	it('MapEngine.onWalkEnd sai antes de soltar quando a caminhada nao e a do pedido', () => {
		const src = semTabs('src/Engine/MapEngine.js');
		expect(
			src.indexOf('function onWalkEnd() {\n// C47: a caminhada que terminou e mais velha que o pedido guardado (o\n// servidor ainda nao confirmou a dele) - ver confirmacaoDaCaminhada.js.\nif (!fimDaCaminhadaEhDoPedido(Session)) {\nreturn;\n}')
		).toBeGreaterThan(-1);
	});

	it('Skill.js arma a espera depois do CZ_REQUEST_MOVE nos dois caminhos do jogador e na caminhada extra', () => {
		const src = semTabs('src/Engine/MapEngine/Skill.js');
		expect(src.indexOf('Network.sendPacket(pkt);\nif (!isHomun && !isMerc) {\nesperarConfirmacao(Session.moveAction);\n}\n}')).toBeGreaterThan(-1);
		expect(src.indexOf('Network.sendPacket(pkt);\nif (!isHomun) {\nesperarConfirmacao(Session.moveAction);\n}\n};')).toBeGreaterThan(-1);
		expect(src.indexOf('Network.sendPacket(mover);\nesperarConfirmacao(pacote);\nreturn true;')).toBeGreaterThan(-1);
		expect(
			src.indexOf('const espera = armarEspera(Session, pacote);\nEvents.setTimeout(() => {\nif (vencerEspera(Session, espera)) {\nChatBox.addText(TEXTO_CAMINHADA_RECUSADA, ChatBox.TYPE.ERROR, ChatBox.FILTER.SKILL_FAIL);\n}\n}, ESPERA_DA_CONFIRMACAO_MS);')
		).toBeGreaterThan(-1);
	});
});
