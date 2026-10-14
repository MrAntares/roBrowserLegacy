/**
 * UI/Components/IdleSkills/parcialDasSkills.js
 *
 * O PARCIAL DA JANELA DE HABILIDADES (06/10/2026, a banda das janelas) - a
 * metade do cliente, pura.
 *
 * O `ZC_RAGIDLE_SKILLS` (0x0ffa) descia a arvore INTEIRA (~20 KB) a cada envio,
 * e a maior parte deles e o servidor EMPURRANDO (login, aprender, promover,
 * comando...). O servidor (`servidor/mapa/parcial-das-skills.ts`, no
 * repositorio do jogo) agora numera cada envio (`rev`, por conexao) e, para a
 * conexao que DECLAROU que entende o parcial, manda so as TROCAS
 * (`[caminho, valor]`) sobre a revisao `de`: `{v, parcial: true, de, rev,
 * trocas, aplicado?, problemas}`.
 *
 * A DECLARACAO e mandar `base` (a revisao na mao, ou `null`) num pedido JSON
 * da janela - o verbo `pedir` do `CZ_RAGIDLE_APRENDER`, o lote, o esquecer e
 * a rotacao. O `CZ_RAGIDLE_PEDIR_SKILLS` (0x0ff9) e fixo e nao leva nada: e o
 * pedido de quem fala com um servidor que nao numera (sem `rev` no inteiro).
 *
 * A janela continua sem calcular nada: as trocas chegam prontas, e o que sai
 * daqui e o MESMO objeto que o inteiro seria - dai em diante o caminho e o
 * dele. A aplicacao das trocas e a da Temporada (`aplicarTrocas`).
 */

import { aplicarTrocas } from '../TemporadaIdle/parcialDaTemporada.js';

function copia(valor) {
	return JSON.parse(JSON.stringify(valor));
}

/** O envio e um parcial (e nao o estado inteiro)? */
export function ehParcialDasSkills(envio) {
	return !!envio && envio.parcial === true;
}

/**
 * O corpo do pedido com a revisao que a janela tem (`base`). Sem revisao na
 * mao vai `base: null` - a chave SEMPRE vai, porque e ela que declara.
 */
export function comBase(corpo, estado) {
	return { ...corpo, base: estado && typeof estado.rev === 'number' ? estado.rev : null };
}

/** O servidor numera os envios (o inteiro trouxe `rev`): entao entende `base`. */
export function servidorNumera(estado) {
	return !!estado && typeof estado.rev === 'number';
}

/**
 * O estado que a janela GUARDA de um inteiro: uma copia (a janela traduz a
 * sua no lugar), sem o que e do envio (`aplicado`, `problemas`).
 */
export function estadoDoInteiro(inteiro) {
	const estado = copia(inteiro);
	delete estado.aplicado;
	delete estado.problemas;
	return estado;
}

/**
 * Aplica o parcial sobre o estado guardado. Devolve o estado NOVO (o de antes
 * fica intacto), com a `rev` nova; ou `null` quando o parcial nao cai sobre
 * ele (sem estado, ou `de` nao e a revisao que a janela tem) - quem chama
 * pede o inteiro.
 */
export function aplicarParcialDasSkills(estado, parcial) {
	if (!ehParcialDasSkills(parcial) || !estado || estado.rev !== parcial.de || !Array.isArray(parcial.trocas)) {
		return null;
	}
	const montado = aplicarTrocas(estado, parcial.trocas);
	if (!montado) {
		return null;
	}
	return { ...montado, rev: parcial.rev };
}

/**
 * O que a janela desenha: uma copia do estado guardado com o que e do ENVIO.
 * `aplicado` so quando o envio o trouxe - a janela distingue a resposta ao
 * gesto do anuncio comum pela PRESENCA da chave.
 */
export function dadosDoEnvio(estado, envio) {
	const dados = copia(estado);
	if (Object.prototype.hasOwnProperty.call(envio, 'aplicado')) {
		dados.aplicado = envio.aplicado;
	}
	dados.problemas = Array.isArray(envio.problemas) ? envio.problemas : [];
	return dados;
}

/**
 * O inteiro que chegou pede uma DECLARACAO? Sim quando o servidor numera e
 * esta revisao nao passa da ultima declarada: a primeira vez, e a conexao nova
 * (a revisao recomeca do 1). Sem isto, o servidor so saberia que a janela
 * entende o parcial quando o jogador abrisse a janela.
 */
export function precisaDeclarar(inteiro, revDeclarada) {
	if (!inteiro || typeof inteiro.rev !== 'number') {
		return false;
	}
	return revDeclarada === null || inteiro.rev <= revDeclarada;
}
