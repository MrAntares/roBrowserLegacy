/**
 * UI/Components/CodexIdle/codexAoVivo.js
 *
 * O CODEX AO VIVO (D-1986, 05/10/2026) - a metade do cliente, pura.
 *
 * Relato dos jogadores: *"Nao contabiliza no codex (mesmo matando, o numero
 * fica igual), so atualiza e contabiliza quando desloga e loga novamente."*
 * Duas causas, e esta e a do cliente: as missoes de cada capitulo da Jornada
 * ficavam guardadas em `CodexIdle.missoesPorCapitulo`, e `pedirCapitulo` NAO
 * repedia um capitulo ja guardado - o indice so zerava na troca de
 * personagem. Reabrir a janela, trocar de aba ou de capitulo mostrava o
 * numero do PRIMEIRO pedido da sessao.
 *
 * A outra causa e do servidor (o retrato so descia a pedido). Com a janela
 * aberta ele agora empurra um PARCIAL `v: 3` com so as pecas que mudaram
 * (`servidor/codex-ao-vivo.ts`, no repositorio do jogo); este modulo sabe
 * aplica-lo. A janela continua sem calcular nada: cada peca do parcial chega
 * pronta, no MESMO formato da peca do retrato inteiro, e so troca de lugar.
 *
 * D-1991 (05/10/2026): o parcial tambem troca CAMPOS (`campos` e
 * `jornada.campos`: o saldo de pontos, os eixos, a novidade...), e o pedido
 * de capitulo responde com um parcial `capitulo: <id>` que traz todas as
 * missoes dele sem o envelope de 34 KB. O servidor so manda as duas coisas a
 * quem declarou `porCampo: true` na abertura - o cliente da D-1986 nao
 * declara e segue recebendo o retrato inteiro nesses casos.
 */

/** A versao do parcial no fio (o retrato inteiro e `v: 2`). */
export const VERSAO_DO_PARCIAL_DO_CODEX = 3;

export function ehParcialDoCodex(dados) {
	return !!dados && dados.v === VERSAO_DO_PARCIAL_DO_CODEX;
}

/**
 * O pedido que a janela manda ao ABRIR: o retrato inteiro, e ao vivo dai em
 * diante. `porCampo` (D-1991) diz ao servidor que esta janela sabe aplicar os
 * `campos` do parcial e a carga de capitulo por parcial.
 */
export function pedidoDeAbertura() {
	return { acao: 'pedir', aberta: true, porCampo: true };
}

/**
 * O parcial e a CARGA de um capitulo (a resposta ao verbo `capitulo`, D-1991)?
 * Devolve o id do capitulo, ou `null`.
 */
export function capituloCarregadoPeloParcial(dados) {
	return ehParcialDoCodex(dados) && typeof dados.capitulo === 'string' && dados.capitulo ? dados.capitulo : null;
}

/** Os campos trocados de um objeto (D-1991): so os que vieram, o resto fica. */
function comCampos(objeto, campos) {
	if (!campos || typeof campos !== 'object') {
		return objeto;
	}
	return { ...objeto, ...campos };
}

/** O pedido que a janela manda ao FECHAR: o servidor para de empurrar. */
export function pedidoDeFechamento() {
	return { acao: 'fechar' };
}

/** Troca, por `id`, as pecas de `lista` que vieram em `novas`. As outras ficam. */
function trocarPorId(lista, novas) {
	if (!Array.isArray(lista) || !Array.isArray(novas) || novas.length === 0) {
		return lista;
	}
	const porId = new Map();
	for (const n of novas) {
		if (n && n.id != null) {
			porId.set(n.id, n);
		}
	}
	return lista.map(item => (item && porId.has(item.id) ? porId.get(item.id) : item));
}

/**
 * Aplica um parcial sobre o retrato e o indice de capitulos.
 *
 * Devolve objetos NOVOS (o retrato de antes fica intacto). Sem retrato
 * inteiro ainda, o parcial nao tem sobre o que cair e e ignorado: o inteiro
 * esta a caminho (o `pedir` da abertura).
 *
 * A missao da Jornada so e trocada no capitulo que a janela JA tem guardado -
 * o parcial nunca cria um capitulo meio carregado no indice (a varredura por
 * especie le "tem a chave" como "o capitulo inteiro chegou").
 *
 * @returns {{estado: object|null, missoesPorCapitulo: object}}
 */
export function aplicarParcialDoCodex(estado, parcial, missoesPorCapitulo) {
	const indice = missoesPorCapitulo || {};
	if (!estado || !ehParcialDoCodex(parcial)) {
		return { estado, missoesPorCapitulo: indice };
	}
	const novo = { ...comCampos(estado, parcial.campos), missoes: trocarPorId(estado.missoes, parcial.missoes) };
	if (parcial.desafios) {
		novo.desafios = parcial.desafios;
	}
	const jp = parcial.jornada;
	let novoIndice = indice;
	if (jp && estado.jornada) {
		novo.jornada = {
			...comCampos(estado.jornada, jp.campos),
			capitulos: trocarPorId(estado.jornada.capitulos, jp.capitulos)
		};
		const porCapitulo = {};
		for (const m of Array.isArray(jp.missoes) ? jp.missoes : []) {
			const cap = m && m.capitulo;
			if (cap && Object.prototype.hasOwnProperty.call(indice, cap)) {
				(porCapitulo[cap] = porCapitulo[cap] || []).push(m);
			}
		}
		const caps = Object.keys(porCapitulo);
		if (caps.length > 0) {
			novoIndice = { ...indice };
			for (const cap of caps) {
				novoIndice[cap] = trocarPorId(indice[cap], porCapitulo[cap]);
			}
		}
	}
	return { estado: novo, missoesPorCapitulo: novoIndice };
}

/**
 * O capitulo precisa ser PEDIDO de novo?
 *
 * - `forcar` (abrir o capitulo, voltar a aba, reabrir a janela): SEMPRE, para
 *   o numero da tela ser o de agora - o que ja esta guardado desenha enquanto
 *   a resposta nao chega;
 * - sem `forcar` (a varredura por especie): so o que ainda nao chegou.
 */
export function precisaPedirCapitulo(id, missoesPorCapitulo, forcar) {
	if (!id) {
		return false;
	}
	if (forcar) {
		return true;
	}
	return !Object.prototype.hasOwnProperty.call(missoesPorCapitulo || {}, id);
}

/**
 * AS PAGINAS DE UM CAPITULO (achado da sonda de tela da D-1986).
 *
 * O servidor corta as missoes de um capitulo pesado em paginas (`parte`/
 * `partes`, 16/09/2026 - o `u16` do pacote), e a janela GUARDAVA so a ultima:
 * cada pagina substituia a lista do capitulo. Em Prontera (92 missoes, mais
 * de uma pagina) as missoes dos campos - `prt_fild08`, o Poring - moram na primeira
 * pagina e nunca apareciam; quem cacava ali via o capitulo "parado".
 *
 * A primeira pagina (ou o corpo sem `parte`) RECOMECA a lista; as seguintes
 * SOMAM a ela (por `id`, a repetida troca de lugar).
 */
export function juntarPaginaDoCapitulo(atual, novas, parte) {
	const lista = Array.isArray(novas) ? novas : [];
	if (!(Number(parte) > 1) || !Array.isArray(atual)) {
		return lista.slice();
	}
	const porId = new Map(lista.map(m => [m && m.id, m]));
	const juntas = atual.map(m => (m && porId.has(m.id) ? porId.get(m.id) : m));
	const ja = new Set(atual.map(m => m && m.id));
	for (const m of lista) {
		if (!ja.has(m && m.id)) {
			juntas.push(m);
		}
	}
	return juntas;
}
