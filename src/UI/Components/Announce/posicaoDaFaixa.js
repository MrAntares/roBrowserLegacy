/**
 * UI/Components/Announce/posicaoDaFaixa.js
 *
 * ONDE A FAIXA DE AVISO FICA NO CELULAR EM PE (bug #1 de 13/10/2026).
 *
 * O relato veio da recusa de encaixar a carta Smokie: a faixa amarela do
 * `Announce` caia SOBRE a barra do topo da HUD vertical (nome, Base Lv, barras)
 * e o botao do menu cobria o fim da primeira linha, entao o texto lia-se
 * "...tem efe[...] jogo e nao pode ser encaixada". A causa e o `top: 40px` de
 * `Announce.css`: ele e a altura do desktop (a faixa de sempre, no alto da tela)
 * e nunca foi reescrito para a HUD vertical, onde a barra do personagem mora de
 * 6 a 76px e o botao do menu fica na ponta direita dela (`UI/Common.css`,
 * D-939).
 *
 * O que decide largura, altura e posicao mora aqui, e nao dentro do
 * `Announce.js`, para ter teste e bateria de mutacao: o numero errado nao
 * quebra nada visivelmente (a faixa so volta a cobrir um pedaco da HUD), e e
 * exatamente o tipo de erro que uma "simplificacao" desfaz calada.
 *
 * O ARRANJO (so na HUD vertical; no desktop nada disto vale):
 *
 *   - **a LARGURA e a da coluna do canto**, a do cartao de missoes (236px, ou o
 *     `min` do CSS em tela estreita). Vale tambem para o banner de conquista,
 *     que no desktop pede a tela inteira: na rodada 1 ele ganhou o vao ate o
 *     trilho (306px em 390) e passou por baixo da coluna de buffs, que mora
 *     encostada no trilho a partir de x=284 (medido em 390x844). A coluna
 *     termina em x=244: 40px antes do buff. Texto que nao cabe QUEBRA em mais
 *     linhas, e a ALTURA acompanha as linhas (o banner pedia 50px fixos, e com
 *     tres linhas o fim do titulo sairia do canvas).
 *   - **o TOPO e MEDIDO contra as pecas da HUD que estao na tela**: cabecalho,
 *     cartao de missoes, aviso de item, placar do MVP, faixa de grupo, cada
 *     icone de buff, botao do menu e trilho, "Auto", botao de caca (e o rotulo
 *     dele), chat, barra de atalhos e o cartao "Voce morreu" (rodada 3, abaixo).
 *     A faixa nasce debaixo do cartao (deixando livre a
 *     fileira de 44px do aviso de item, que nasce ali e dura 3 s) e desce ate
 *     o primeiro lugar onde nao encosta em nenhuma delas. Na rodada 1 o topo
 *     era so "debaixo do cartao" e a faixa escrevia por cima do placar do MVP
 *     (placar em y=260..374, faixa em y=334, medido em 390x844). Numero fixo
 *     nao serve: o placar so existe na luta de MVP, a faixa de grupo so com
 *     party, o cartao cresce com as missoes e o jogador pode ARRASTAR o placar
 *     e a faixa de grupo (D-1565).
 *   - **o topo e REMEDIDO enquanto a faixa vive** (10 s). O placar aparece no
 *     primeiro pacote da luta, um buff acende, o cartao cresce quando as
 *     missoes chegam depois da entrada no mapa: medida unica deixaria a faixa
 *     em cima da peca que chegou depois. As pecas sao de seis componentes com
 *     vida propria e os icones de buff sao nos NOVOS (um `ResizeObserver` nao
 *     os ve), entao a faixa se remede no relogio do jogo a cada 250 ms, so
 *     enquanto esta na tela (quatro medidas por segundo, cada uma com umas
 *     dezenas de leituras de caixa, e uma escrita de variavel).
 *
 * Se a coluna inteira estiver ocupada do cartao ate a barra de atalhos, a faixa
 * nao some (aviso do servidor nao pode deixar de ser lido): vai para o ULTIMO
 * RECURSO, SOBRE o cartao de missoes, rente ao topo dele (rodada 3). Na rodada 2
 * o ultimo recurso era "o lugar que MENOS cobre", e o critico mediu onde isso
 * caia: com o placar do MVP e a faixa de grupo na tela, em altura util abaixo de
 * ~740px (390x664, o iPhone no Safari; 360x640), a faixa ia para y=378, em cima
 * do titulo "GRUPO" e da linha do proprio jogador, justo as pecas da luta. O
 * cartao de missoes e a peca de menos valor durante a luta (o placar do MVP ja o
 * cobre em parte na luta de MVP, `Common.css`, `+176px`), entao e ele que cede.
 * A escolha e por PRIORIDADE, nao por area somada: cobrir 1px da HUD e pior que
 * cobrir o cartao inteiro, e cobrir 1px do cartao "Voce morreu" e pior que
 * cobrir a HUD inteira.
 *
 * A JANELA DE MORTE (rodada 3): o cartao "Voce morreu" (`DeathWindow`, z
 * 2.000.000) e peca que a faixa evita, com a prioridade mais alta. Na rodada 2
 * ele nao era medido, e a faixa (z 50) caia no meio da tela, ATRAS dele, por toda
 * a vida dela: o aviso do servidor com o jogador morto (drop raro, `@kami`,
 * reinicio) nao se lia. Na base ele caia em y=40, acima do cartao, e se lia
 * atraves do veu. Agora a faixa vai para o primeiro lugar livre fora do cartao (o
 * veu de 35% cobre a tela inteira e nao e peca: a faixa se le atraves dele, como
 * na base).
 *
 * A seguranca de borda (entalhe) nao entra aqui: as pecas medidas ja nascem
 * abaixo de `--vr-topo` (= entalhe + 6px), e o `left` e o
 * `--safe-esq + --vr-margem` do CSS.
 */

/** A margem das bordas na HUD vertical (`--vr-margem`, Common.css). */
export const MARGEM = 8;

/** A largura do trilho de botoes redondos da direita (`--vr-trilho-largura`, Common.css). */
export const LARGURA_DO_TRILHO = 60;

/** A largura do cartao de missoes (`min(236px, ...)`, Common.css): a coluna do canto. */
export const LARGURA_DO_CARTAO = 236;

/** O respiro entre a faixa e qualquer peca da HUD (o mesmo vao do `ItemObtain` sob o cartao). */
export const VAO = 4;

/** Uma fileira de aviso de item: o 44px que `#StatusIcons` ja reserva na vertical. */
export const FILEIRA_DO_AVISO_DE_ITEM = 44;

/** De quanto em quanto tempo a faixa se remede enquanto esta na tela. */
export const PASSO_DO_ACOMPANHAMENTO_MS = 250;

/** Nenhuma largura menor que isto: abaixo disso nao cabe palavra, so letra. */
const PISO = 100;

/** A marca que `UI/hudVertical.js` poe no `<html>` quando o celular esta em pe. */
const MARCA_VERTICAL = 'ri-vertical';

/** A variavel que `UI/Common.css` le em `html.ri-vertical #Announce { top }`. */
export const VARIAVEL_DO_TOPO = '--vr-aviso-topo';

/**
 * A classe que `UI/Common.css` le para por um fundo OPACO atras da faixa quando o
 * lugar escolhido fica SOBRE uma peca (o ultimo recurso, sobre o cartao de missoes).
 * O fundo da faixa e meio transparente (`rgba(0,0,0,0.5)`, `Announce.js`): por
 * cima do mundo isso basta, mas por cima do cartao branco as letras escuras dele
 * apareciam por baixo das do aviso ("Missoes" sob "5 minutos", "Primeiros
 * Passos" sob a ultima linha; print da sonda em 390x664, rodada 3).
 */
export const CLASSE_SOBRE_PECA = 'vr-aviso-sobre-peca';

/**
 * O que a faixa pode cobrir quando NAO ha lugar livre na coluna, do que cede
 * primeiro ao que nunca deve ser coberto. Peca sem prioridade e `HUD`.
 *
 *   - `CEDE`: o cartao de missoes, o de menos valor durante a luta;
 *   - `HUD`: as pecas da luta e da moldura (placar, grupo, buffs, botoes, chat...);
 *   - `DECISAO`: o cartao "Voce morreu", a unica coisa a fazer na tela.
 */
export const CEDE = 0;
export const HUD = 1;
export const DECISAO = 2;

/**
 * As pecas da HUD vertical que a faixa nao pode cobrir.
 *
 * `host` e o id do host do componente (`GUIComponent` usa o nome); `dentro` e o
 * que medir dentro do shadow quando o host NAO e a caixa visivel: o host do
 * StatusIcons nao tem tamanho (os icones sao filhos posicionados), o do menu e
 * um ponto sem caixa, o do chat e o da morte cobrem a tela inteira, e o placar,
 * a faixa de grupo e o cartao da morte nascem com a caixa interna escondida
 * (`hidden`, `display: none`) dentro de um host que fica na pagina o tempo todo.
 *
 * O rotulo do botao de caca ("Retornar para Prontera") pende para FORA do host,
 * a esquerda (`HuntButtonIdle.css`, `.ri-vertical .hb-rotulo`, absoluto e sem
 * quebra): em 320 ele vai ate x=203 e a faixa o cobria (critico, rodada 2). Por
 * isso ele e medido a parte.
 */
export const PECAS_DA_HUD = [
	{ nome: 'cabecalho', host: 'BasicInfoIdle' },
	{ nome: 'cartao-de-missoes', host: 'MissoesTrackerIdle', prioridade: CEDE },
	{ nome: 'aviso-de-item', host: 'ItemObtain', dentro: '#ItemObtain' },
	{ nome: 'placar-mvp', host: 'PlacarMvpIdle', dentro: '.pm-placar' },
	{ nome: 'faixa-de-grupo', host: 'PartyHud', dentro: '.ph-hud' },
	{ nome: 'buff', host: 'StatusIcons', dentro: '.state' },
	{ nome: 'menu', host: 'TopMenuIdle', dentro: '.tm-fab, .tm-item' },
	{ nome: 'auto', host: 'CombatCornerIdle' },
	{ nome: 'rotulo-de-caca', host: 'HuntButtonIdle', dentro: '.hb-rotulo' },
	{ nome: 'botao-de-caca', host: 'HuntButtonIdle' },
	{ nome: 'chat', host: 'ChatBox', dentro: '#chatbox' },
	{ nome: 'barra-de-atalhos', host: 'ShortCut' },
	{ nome: 'janela-de-morte', host: 'DeathWindow', dentro: '.dw-card', prioridade: DECISAO }
];

/** As pecas debaixo das quais a coluna da faixa comeca. */
const TOPO_DA_COLUNA = ['cabecalho', 'cartao-de-missoes'];

/**
 * A largura da coluna do canto: a do cartao de missoes (o mesmo `min` do CSS, que
 * deixa 32px para o trilho e as margens).
 *
 * @param {number} larguraDaTela
 * @returns {number}
 */
export function larguraDaColuna(larguraDaTela) {
	return Math.max(PISO, Math.min(LARGURA_DO_CARTAO, larguraDaTela - LARGURA_DO_TRILHO - 32));
}

/**
 * A largura da faixa (`largura`: o canvas fixo, ou `null` para encolher ao
 * texto) e a largura em que o texto QUEBRA (`quebra`).
 *
 * No desktop e no celular deitado devolve o que o `Announce` sempre usou: o
 * pedido do chamador e a tela inteira. Na HUD vertical as duas viram a coluna:
 * o aviso comum quebra na coluna e o banner que pede largura (o de conquista)
 * fica limitado a ela.
 *
 * @param {boolean} naVertical
 * @param {number} larguraDaTela
 * @param {number|null} larguraPedida px, ou `null` se o chamador nao pediu
 * @returns {{ largura: number|null, quebra: number }}
 */
export function medidasDaFaixa(naVertical, larguraDaTela, larguraPedida) {
	if (!naVertical) {
		return { largura: larguraPedida, quebra: larguraDaTela };
	}
	const coluna = larguraDaColuna(larguraDaTela);
	return { largura: larguraPedida ? Math.min(larguraPedida, coluna) : null, quebra: coluna };
}

/**
 * A altura do canvas da faixa.
 *
 * No desktop e a de sempre: a pedida, ou a do texto. Na HUD vertical a pedida
 * vira PISO: a coluna estreita quebra o titulo em mais linhas, e com a altura
 * fixa do banner de conquista (50px) a terceira linha sairia do canvas.
 *
 * @param {boolean} naVertical
 * @param {number|undefined} alturaPedida
 * @param {number} linhas
 * @param {number} tamanhoDaFonte
 * @returns {number}
 */
export function alturaDaFaixa(naVertical, alturaPedida, linhas, tamanhoDaFonte) {
	const doTexto = 10 + (tamanhoDaFonte + 5) * linhas;
	if (!naVertical) {
		return alturaPedida || doTexto;
	}
	return Math.max(alturaPedida || 0, doTexto);
}

/**
 * A HUD vertical (celular em pe) esta valendo agora?
 *
 * Le a MARCA, e nao o `matchMedia`: e a marca que o CSS usa para decidir o
 * arranjo, entao JS e CSS nunca discordam (ela respeita a bandeira de rollout da
 * HUD adaptavel, que `@media` nao conhece).
 *
 * @param {Document} doc
 * @returns {boolean}
 */
export function ehHudVertical(doc) {
	return !!doc && !!doc.documentElement && doc.documentElement.classList.contains(MARCA_VERTICAL);
}

/**
 * A caixa de um elemento na tela, em pixel de viewport, ou `null` se ele nao
 * esta desenhado (sem tamanho, `visibility: hidden` ou transparente de todo).
 *
 * @param {Element|null} el
 * @param {Document} doc
 * @returns {{ x: number, y: number, w: number, h: number }|null}
 */
export function caixaVisivel(el, doc) {
	if (!el) {
		return null;
	}
	const b = el.getBoundingClientRect();
	if (!(b.width > 0 && b.height > 0)) {
		return null;
	}
	const vista = doc && doc.defaultView;
	const estilo = vista && vista.getComputedStyle ? vista.getComputedStyle(el) : null;
	if (estilo && (estilo.visibility === 'hidden' || estilo.opacity === '0')) {
		return null;
	}
	return { x: b.left, y: b.top, w: b.width, h: b.height };
}

/**
 * Mede as pecas da HUD que estao na tela agora. A peca com prioridade propria
 * (o cartao de missoes, o cartao da morte) a leva junto; as outras sao `HUD`.
 *
 * @param {Document} doc
 * @returns {Array<{ nome: string, prioridade?: number, x: number, y: number, w: number, h: number }>}
 */
export function medirPecas(doc) {
	const pecas = [];
	for (const peca of PECAS_DA_HUD) {
		const host = doc.getElementById(peca.host);
		if (!host) {
			continue;
		}
		const alvos = peca.dentro ? (host.shadowRoot || host).querySelectorAll(peca.dentro) : [host];
		for (const alvo of alvos) {
			const caixa = caixaVisivel(alvo, doc);
			if (caixa) {
				pecas.push(
					peca.prioridade === undefined
						? { nome: peca.nome, ...caixa }
						: { nome: peca.nome, prioridade: peca.prioridade, ...caixa }
				);
			}
		}
	}
	return pecas;
}

/**
 * Onde a coluna da faixa comeca: debaixo do cabecalho e do cartao de missoes,
 * com o vao e a fileira livre do aviso de item. `null` se nenhum dos dois esta
 * na tela (a HUD ainda montando): o CSS usa o `calc` de nascenca.
 *
 * @param {Array<{ nome: string, y: number, h: number }>} pecas
 * @returns {number|null}
 */
export function inicioDaColuna(pecas) {
	const bases = pecas.filter(p => TOPO_DA_COLUNA.includes(p.nome)).map(p => p.y + p.h);
	if (bases.length === 0) {
		return null;
	}
	return Math.max(...bases) + VAO + FILEIRA_DO_AVISO_DE_ITEM;
}

/**
 * Quanto da faixa (com o vao em volta) fica sobre as pecas, em px quadrados.
 * Encostar no vao nao conta: so area de verdade.
 *
 * @param {{ x: number, y: number, w: number, h: number }} faixa
 * @param {Array<{ x: number, y: number, w: number, h: number }>} pecas
 * @returns {number}
 */
export function areaCoberta(faixa, pecas) {
	let total = 0;
	for (const p of pecas) {
		const largura = Math.min(faixa.x + faixa.w + VAO, p.x + p.w) - Math.max(faixa.x - VAO, p.x);
		const altura = Math.min(faixa.y + faixa.h + VAO, p.y + p.h) - Math.max(faixa.y - VAO, p.y);
		if (largura > 0 && altura > 0) {
			total += largura * altura;
		}
	}
	return total;
}

/**
 * A prioridade de uma peca: a dela, se for `CEDE` ou `DECISAO`; senao `HUD`.
 *
 * @param {{ prioridade?: number }} peca
 * @returns {number}
 */
function prioridadeDe(peca) {
	return peca.prioridade === CEDE || peca.prioridade === DECISAO ? peca.prioridade : HUD;
}

/**
 * O custo de um lugar: a area coberta (com o vao) de cada prioridade, da mais
 * alta para a mais baixa, `[decisao, hud, cede]`. Um lugar livre custa `[0, 0, 0]`.
 *
 * @param {{ x: number, y: number, w: number, h: number }} faixa
 * @param {Array<{ prioridade?: number, x: number, y: number, w: number, h: number }>} pecas
 * @returns {number[]}
 */
export function custoDoLugar(faixa, pecas) {
	const custo = [0, 0, 0];
	for (const p of pecas) {
		custo[DECISAO - prioridadeDe(p)] += areaCoberta(faixa, [p]);
	}
	return custo;
}

/**
 * `a` custa menos que `b`? Compara na ORDEM das prioridades (e nao pela soma):
 * so a area de uma prioridade mais baixa desempata a de uma mais alta.
 *
 * @param {number[]} a
 * @param {number[]} b
 * @returns {boolean}
 */
export function custaMenos(a, b) {
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) {
			return a[i] < b[i];
		}
	}
	return false;
}

/**
 * O topo da faixa na coluna, em pixel de viewport.
 *
 * Os candidatos sao o comeco da coluna e a borda de baixo (mais o vao) de cada
 * peca que termina abaixo dele: o lugar livre mais alto e sempre um deles. Vale
 * o mais alto que nao cobre nada e cabe acima de `fim` (o pe da tela).
 *
 * Se nenhum esta livre, vale o que custa menos (`custoDoLugar`, na ordem das
 * prioridades) e, no empate, o mais alto. Para o ultimo recurso existir, o
 * TOPO de cada peca que cede (o cartao de missoes) tambem e candidato: a faixa
 * rente ao topo do cartao, logo abaixo do cabecalho, cobre so o cartao. Esse
 * candidato nunca e "livre" (ele esta sobre o cartao), entao so ganha quando
 * nenhum lugar da coluna esta. Se nenhum candidato cabe na tela, o comeco.
 *
 * @param {{ inicio: number, fim: number, esquerda: number, largura: number, altura: number,
 *   pecas: Array<{ prioridade?: number, x: number, y: number, w: number, h: number }> }} medida
 * @returns {number}
 */
export function lugarDaFaixa({ inicio, fim, esquerda, largura, altura, pecas }) {
	const candidatos = [inicio];
	for (const p of pecas) {
		const logoAbaixo = p.y + p.h + VAO;
		if (logoAbaixo > inicio) {
			candidatos.push(logoAbaixo);
		}
		if (prioridadeDe(p) === CEDE) {
			candidatos.push(p.y);
		}
	}
	candidatos.sort((a, b) => a - b);
	let melhor = inicio;
	let menor = null;
	for (const topo of candidatos) {
		if (topo + altura > fim) {
			break;
		}
		const custo = custoDoLugar({ x: esquerda, y: topo, w: largura, h: altura }, pecas);
		if (menor === null || custaMenos(custo, menor)) {
			menor = custo;
			melhor = topo;
		}
	}
	return melhor;
}

/**
 * Mede a faixa e as pecas e publica o `top` dela no host.
 *
 * `converter` leva o pixel de viewport medido para a unidade da HUD (a
 * convencao de `UI/escalaDaHud.js: emUnidadesDaHud`: toda geometria medida que
 * vira `style` passa por la). Sem a faixa desenhada ou sem cabecalho e cartao na
 * tela, a variavel SAI e o CSS usa o `calc` de nascenca.
 *
 * Se o lugar escolhido cobre alguma peca (o ultimo recurso), o host ganha a
 * `CLASSE_SOBRE_PECA` (fundo mais denso); num lugar livre ela sai.
 *
 * @param {HTMLElement} host o host do componente Announce
 * @param {Document} doc
 * @param {(px: number) => number} [converter]
 * @returns {number|null} o `top` publicado, ou `null` se saiu
 */
export function publicarTopo(host, doc, converter = px => px) {
	const faixa = caixaVisivel(host, doc);
	const pecas = medirPecas(doc);
	const inicio = inicioDaColuna(pecas);
	if (!faixa || inicio === null) {
		host.style.removeProperty(VARIAVEL_DO_TOPO);
		host.classList.remove(CLASSE_SOBRE_PECA);
		return null;
	}
	const vista = doc.defaultView;
	const fim = vista && vista.innerHeight > 0 ? vista.innerHeight : Infinity;
	const lugar = lugarDaFaixa({ inicio, fim, esquerda: faixa.x, largura: faixa.w, altura: faixa.h, pecas });
	const custo = custoDoLugar({ x: faixa.x, y: lugar, w: faixa.w, h: faixa.h }, pecas);
	const sobrePeca = custo.some(area => area > 0);
	host.classList.toggle(CLASSE_SOBRE_PECA, sobrePeca);
	const topo = Math.round(converter(lugar));
	host.style.setProperty(VARIAVEL_DO_TOPO, `${topo}px`);
	return topo;
}

/**
 * Posiciona a faixa na HUD vertical e a MANTEM fora das pecas enquanto ela vive.
 *
 * `relogio` e o `Core/Events.js` do jogo (o mesmo que conta a vida da faixa):
 * ele anda com o quadro, entao a aba escondida nao remede nada.
 *
 * @param {HTMLElement} host
 * @param {Document} doc
 * @param {(px: number) => number} converter
 * @param {{ setTimeout: Function, clearTimeout: Function }} relogio
 * @returns {() => void} desliga o acompanhamento (chamar ao tirar a faixa)
 */
export function acompanharNaVertical(host, doc, converter, relogio) {
	publicarTopo(host, doc, converter);
	let pendente = relogio.setTimeout(function remedir() {
		publicarTopo(host, doc, converter);
		pendente = relogio.setTimeout(remedir, PASSO_DO_ACOMPANHAMENTO_MS);
	}, PASSO_DO_ACOMPANHAMENTO_MS);
	return () => relogio.clearTimeout(pendente);
}

/**
 * Tira a variavel do host: a faixa volta ao `top` do `Announce.css` (desktop e
 * celular deitado). Chamada quando a HUD vertical NAO vale: cobre o aparelho que
 * gira com uma faixa ja posicionada.
 *
 * @param {HTMLElement} host
 */
export function soltarDaVertical(host) {
	host.style.removeProperty(VARIAVEL_DO_TOPO);
	host.classList.remove(CLASSE_SOBRE_PECA);
}

export default {
	larguraDaColuna,
	medidasDaFaixa,
	alturaDaFaixa,
	ehHudVertical,
	caixaVisivel,
	medirPecas,
	inicioDaColuna,
	areaCoberta,
	custoDoLugar,
	custaMenos,
	lugarDaFaixa,
	publicarTopo,
	acompanharNaVertical,
	soltarDaVertical
};
