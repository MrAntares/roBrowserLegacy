/**
 * UI/telaAcesaNoFarm.js — O MODO LEITURA (D-992, 09/09/2026, pedido do dono).
 *
 * A decisao nasceu D-970 e virou D-992 na colisao 23: o master ja tinha um
 * D-970 publicado um dia antes. A mensagem do commit que trouxe este arquivo
 * (`61b73008`) ainda cita o numero velho — nao da para reescrever historia ja
 * empurrada, e a nota no corpo de D-992 e o que liga um ao outro.
 *
 * ═══════════════════════════════════════════════════════════════════════
 * O PEDIDO
 * ═══════════════════════════════════════════════════════════════════════
 * *"Quando o personagem esta farmando (AFK/auto-farm), a tela do celular
 * desliga sozinha apos o tempo padrao de inatividade do sistema, pois o jogo
 * nao esta enviando nenhum sinal de 'atividade' ao dispositivo — mesmo com o
 * personagem ativo em combate/farm."*
 *
 * E ele esta certo no diagnostico: o sistema conta INATIVIDADE DO DEDO, e nao
 * do jogo. Um idle e o caso extremo disso — o jogador olha, e nao toca.
 *
 * ═══════════════════════════════════════════════════════════════════════
 * O QUE ESTE MODULO E, E O QUE ELE NAO E
 * ═══════════════════════════════════════════════════════════════════════
 * Ele e um INTERRUPTOR com uma condicao: enquanto a condicao valer, pede o
 * `screen` wake lock; quando ela cair, solta. Nao desenha nada, nao guarda
 * preferencia e nao tem estado proprio alem da sentinela.
 *
 * **Ele NAO impede o jogador de apagar a tela.** O wake lock evita o
 * apagamento por INATIVIDADE; o botao de energia continua fazendo o que
 * sempre fez. Isso e da propria API, e nao um cuidado nosso — mas esta escrito
 * aqui porque o pedido cobra explicitamente ("respeitar a acao do usuario") e
 * quem ler este arquivo vai querer saber onde isso e garantido.
 *
 * ═══════════════════════════════════════════════════════════════════════
 * A CONDICAO, E POR QUE ELA TEM DUAS PERNAS
 * ═══════════════════════════════════════════════════════════════════════
 *   1. **`serverConfig.cacaAutomatica`** — a declaracao do jogador, aceita
 *      pelo SERVIDOR. E a mesma fonte que o botao "Auto" do canto desenha
 *      (`CombatCornerIdle`), e nao um segundo estado nosso: se o servidor
 *      recusou a caca, o botao apaga e o lock cai junto, sem combinar nada.
 *   2. **nao estar numa CIDADE** (`contexto.ehCidade`) — o pedido cobra "nao
 *      consumir bateria desnecessariamente fora do momento de uso", e parado
 *      na cidade com o Auto armado e exatamente isso. Em cidade nao ha
 *      populacao de mobs (D-246), entao nao ha farm acontecendo.
 *
 * **Contexto OBSOLETO nao decide.** `IdleConfig.contextoObsoleto` marca que o
 * contexto na mao descreve o mapa ANTERIOR (o aviso esta no proprio
 * `IdleConfig.js`, e ele existe porque `contexto` nunca volta a ser `null`).
 * Durante a troca de mapa este modulo MANTEM o que ja estava — soltar o lock
 * com base no mapa de onde o jogador saiu apagaria a tela no meio de uma
 * viagem entre dois mapas de caca.
 *
 * ═══════════════════════════════════════════════════════════════════════
 * O SEGUNDO PLANO E DE GRACA, E ISSO E ESPECIFICACAO
 * ═══════════════════════════════════════════════════════════════════════
 * O `WakeLockSentinel` e liberado pelo NAVEGADOR quando o documento fica
 * oculto — nao ha nada a fazer para cumprir "liberar quando o app for para
 * segundo plano". O que HA a fazer e o contrario: **re-pedir quando ele
 * voltar**, porque a sentinela liberada nao se reata sozinha. Sem o
 * `visibilitychange` abaixo, trocar de app uma vez desligaria o modo leitura
 * pelo resto da sessao, em silencio.
 */

/* Desde o Bot novo (07/10/2026) o estado vem de `UI/contextoDoMapa.js` (sem
   janela): o Bot LIGADO, confirmado pelo servidor, faz o papel da antiga caca
   automatica. A CONDICAO continua sozinha em `decisaoDoModoLeitura.js`. */
import { botLigado, contextoDoMapa } from 'UI/contextoDoMapa.js';
import { deveManterAcesa, esperaAposRecusa } from 'UI/decisaoDoModoLeitura.js';

/**
 * De quanto em quanto tempo a condicao e reavaliada.
 *
 * O botao "Auto" pesquisa a 250 ms porque ele DESENHA e o jogador olha para
 * ele; um wake lock nao tem pressa nenhuma — o sistema so apaga a tela depois
 * de dezenas de segundos. 1 s e barato e responde muito antes de importar.
 */
const INTERVALO_MS = 1000;

let _sentinela = null;
let _timer = null;
let _ligado = false;
/** Um pedido em voo — sem isto, dois tiques do relogio pedem dois locks. */
let _pedindo = false;
/*
 * O FREIO DA RECUSA (medido em 09/09/2026 pela `diag-modo-leitura`).
 *
 * Sem ele o modulo pedia o lock a cada tique de 1 s, para sempre, num
 * navegador que recusa — 8 tentativas na fase da sonda, contra 2 com o freio.
 * E a recusa mais comum da especificacao e BATERIA FRACA, ou seja o aparelho
 * em que insistir custa mais. Ver `esperaAposRecusa`.
 */
let _recusasSeguidas = 0;
let _naoAntesDe = 0;

/** O navegador deste aparelho sabe o que e um wake lock? */
export function haSuporte() {
	return typeof navigator !== 'undefined' && 'wakeLock' in navigator && !!navigator.wakeLock;
}

/** Le o estado de agora das fontes de verdade. */
function estadoDeAgora() {
	const ctx = contextoDoMapa();
	return {
		cacaAutomatica: botLigado(),
		ehCidade: !!(ctx && ctx.ehCidade),
		contextoObsoleto: ctx === null,
		estavaAcesa: _sentinela !== null,
	};
}

async function pedir() {
	if (_sentinela || _pedindo || !haSuporte()) {
		return;
	}
	/* Pedir com o documento oculto e recusado pela especificacao, e a recusa
	   chega como excecao. Perguntar antes evita um `catch` por segundo
	   enquanto o jogo esta em segundo plano. */
	if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
		return;
	}
	/* O freio da recusa: enquanto a espera nao vence, nem tentamos. */
	if (Date.now() < _naoAntesDe) {
		return;
	}
	_pedindo = true;
	try {
		const s = await navigator.wakeLock.request('screen');
		/* O navegador libera a sentinela sozinho quando o documento oculta.
		   Sem zerar a referencia aqui, o modulo acharia que ainda segura o
		   lock e nunca voltaria a pedir. */
		s.addEventListener('release', () => {
			if (_sentinela === s) {
				_sentinela = null;
			}
		});
		_sentinela = s;
		/* Deu certo: o freio zera. Uma recusa passada nao pode continuar
		   penalizando uma sessao que hoje funciona. */
		_recusasSeguidas = 0;
		_naoAntesDe = 0;
	} catch (erro) {
		/* Bateria fraca, politica do navegador, contexto inseguro: em todos, o
		   jogo continua igual e so o modo leitura nao vale. Nao ha o que
		   avisar ao jogador — ele nao pediu nada e nao ha o que ele possa
		   fazer. */
		_sentinela = null;
		_recusasSeguidas++;
		_naoAntesDe = Date.now() + esperaAposRecusa(_recusasSeguidas);
	} finally {
		_pedindo = false;
	}
}

async function soltar() {
	const s = _sentinela;
	_sentinela = null;
	if (!s) {
		return;
	}
	try {
		await s.release();
	} catch (erro) {
		/* Soltar o que ja foi solto pelo navegador lanca. Nao e erro nosso. */
	}
}

function avaliar() {
	if (deveManterAcesa(estadoDeAgora())) {
		void pedir();
		return;
	}
	/*
	 * A condicao caiu: alem de soltar, o freio ZERA. E a transicao que da ao
	 * jogador uma tentativa limpa quando ele volta a farmar — sem isto, uma
	 * recusa de manha ainda estaria fazendo o modo leitura esperar a tarde.
	 */
	_recusasSeguidas = 0;
	_naoAntesDe = 0;
	void soltar();
}

function aoTrocarDeVisibilidade() {
	if (document.visibilityState === 'visible') {
		/* Voltar do segundo plano NAO reata a sentinela liberada: e preciso
		   pedir de novo. Sem isto, uma unica troca de app desligaria o modo
		   leitura pelo resto da sessao. */
		avaliar();
		return;
	}
	/* Oculto: o navegador ja soltou. Zeramos a referencia para o `pedir` de
	   volta funcionar, e nao chamamos `release()` — chamar depois de o
	   navegador ter soltado lanca por nada. */
	_sentinela = null;
}

/** Liga o modo leitura. Idempotente — chamada mais de uma vez nao acumula. */
export function ligar() {
	if (_ligado || !haSuporte()) {
		return;
	}
	_ligado = true;
	_timer = setInterval(avaliar, INTERVALO_MS);
	document.addEventListener('visibilitychange', aoTrocarDeVisibilidade);
	avaliar();
}

/** Desliga e solta o lock — troca de personagem, saida do mapa, teste. */
export function desligar() {
	if (!_ligado) {
		return;
	}
	_ligado = false;
	if (_timer !== null) {
		clearInterval(_timer);
		_timer = null;
	}
	document.removeEventListener('visibilitychange', aoTrocarDeVisibilidade);
	void soltar();
}

/** Segurando o lock AGORA? Usada pelas provas — o estado nao e observavel. */
export function estaAcesa() {
	return _sentinela !== null;
}

export default { ligar, desligar, estaAcesa, haSuporte };
