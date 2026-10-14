/**
 * UI/Components/ChatBox/marcaNoNome.js
 *
 * A MARCA NO NOME DE QUEM FALA (25/09/2026, dois pedidos do dono):
 *
 * - VIP: *"o icone do RO Cash + cor no nome do player para os players VIPs"*,
 *   como o outro idle faz com um diamante antes do nome;
 * - GM: *"faca tambem uma marca de GM + cor 'vermelho escuro' para
 *   identificar os Administradores"*.
 *
 * QUEM E O QUE e o servidor que diz, com os mesmos `ehVip` e `ehAdministrador`
 * que ele usa em tudo. Tudo desce no MESMO pacote, a lista de GM
 * (`ZC_RAGIDLE_ADMINS`, 0x0fd0): `admins` e `vips` sao CONTAS - a chave que a
 * fala global e a de grupo ja levam como GID - e `nomesAdmin`/`nomesVip` sao
 * nomes e apelidos, para os dois canais que nao levam conta (o sussurro traz
 * so o nome; a guilda, so o texto "Nome : fala").
 *
 * UMA MARCA DE GM SO. A tag "[GM]" de 07/09 e 24/09 trocava a ETIQUETA DO
 * CANAL ("[Global]" virava "[GM]") e pintava a linha inteira de amarelo, e so
 * na fala global. Ela virou ESTA marca: o mesmo "GM", o mesmo `TYPE.ADMIN` e a
 * mesma `Session.AdminList`, so que ao lado do NOME - como a do VIP - e em
 * todo canal com fala de jogador, em vermelho escuro como o dono pediu. A
 * etiqueta volta a dizer o canal, e a FALA inteira fica na cor do nome
 * (`classeDaLinha`) - para o GM e para o VIP. Linha de admin que NAO e fala (o texto de
 * quest, que usa `TYPE.ADMIN` so pela cor) continua como era:
 * `linhaDeAdminSemNome`.
 *
 * Quem e as duas coisas mostra a de GM (pedido do dono): e a informacao de
 * PODER, e a que o jogador precisa ler primeiro.
 *
 * Isto e COSMETICO: nada que um GM ou um VIP pode FAZER e decidido aqui.
 *
 * Puro de proposito: sem `Session`, sem DOM, sem `ChatBox` (que nao sobe no
 * jsdom). Quem chama passa as listas da sessao e os bits de tipo.
 */

/**
 * O PNG do RO Cash - o MESMO do RO Shop e da doacao (`ASSET.roCash`,
 * `RoShop/formatoDoRoShop.js`). Escrito aqui e NAO importado de proposito: o
 * ChatBox sobe em quase todo teste de UI, e puxar o grafo do RO Shop junto
 * atrasou a carga o bastante para um import tardio estourar depois do fim do
 * ambiente (medido em `f1-barraClassicaDeSkillsNuncaAbre`: 1 erro com o
 * import, 0 sem). O teste `marcaNoNome.test.js` confere que os dois caminhos
 * sao o mesmo, entao eles nao divergem calados.
 */
export const ICONE_DO_VIP = '/ragidle/shop/icons/shop-icon-ro-cash.png';

function listaDeNumeros(v) {
	return Array.isArray(v) ? v.filter(x => typeof x === 'number') : [];
}

function listaDeNomes(v) {
	return Array.isArray(v) ? v.filter(n => typeof n === 'string' && n !== '') : [];
}

/**
 * As marcas do corpo JSON do 0x0fd0 (a lista de contas de admin continua sendo
 * lida por `onAdminList`, como sempre). Servidor antigo (sem os campos) ou lixo
 * viram listas vazias: ninguem ganha marca por engano.
 *
 * @param {object|null|undefined} dados - o JSON ja lido
 * @returns {{vips: number[], nomesVip: string[], nomesAdmin: string[]}}
 */
export function lerMarcasDoChat(dados) {
	const d = dados || {};
	return {
		vips: listaDeNumeros(d.vips),
		nomesVip: listaDeNomes(d.nomesVip),
		nomesAdmin: listaDeNomes(d.nomesAdmin)
	};
}

/**
 * A DIFERENCA das marcas (D-2372 do servidor, 13/10/2026). Os outros conectados
 * recebiam a lista INTEIRA de VIPs a cada VIP que entrava no mundo; agora o
 * servidor manda so quem entrou e quem saiu (`{delta: 1, vipsMais, vipsMenos,
 * nomesVipMais, ...}`, campo ausente = vazio), e os administradores sempre
 * inteiros (`onAdminList` le `admins` como antes).
 *
 * Tira os `Menos`, poe os `Mais` e REORDENA como o servidor ordena a lista
 * inteira (`marcasDoChat`: contas em ordem numerica, nomes em `sort()`): as
 * listas daqui ficam iguais as que a lista inteira daria. Puro: devolve listas
 * novas e nao mexe nas que recebeu.
 *
 * @param {{vips: number[], nomesVip: string[], nomesAdmin: string[]}} atuais - as da sessao
 * @param {object|null|undefined} dados - o JSON ja lido, com `delta: 1`
 * @returns {{vips: number[], nomesVip: string[], nomesAdmin: string[]}}
 */
export function aplicarDeltaDasMarcas(atuais, dados) {
	const d = dados || {};
	const a = atuais || {};
	const aplicar = (lista, mais, menos) => {
		const tirar = new Set(menos);
		const conjunto = new Set((Array.isArray(lista) ? lista : []).filter(x => !tirar.has(x)));
		for (const x of mais) conjunto.add(x);
		return [...conjunto];
	};
	return {
		vips: aplicar(a.vips, listaDeNumeros(d.vipsMais), listaDeNumeros(d.vipsMenos)).sort((x, y) => x - y),
		nomesVip: aplicar(a.nomesVip, listaDeNomes(d.nomesVipMais), listaDeNomes(d.nomesVipMenos)).sort(),
		nomesAdmin: aplicar(a.nomesAdmin, listaDeNomes(d.nomesAdminMais), listaDeNomes(d.nomesAdminMenos)).sort()
	};
}

/**
 * A conta que falou esta na lista? Serve a fala global (`pkt.GID`), a de
 * grupo (`pkt.AID`) e o eco da propria fala (`Session.AID`).
 */
export function contaNaLista(conta, lista) {
	return Array.isArray(lista) && lista.indexOf(conta) > -1;
}

/** O nome que falou esta na lista? Serve o sussurro e a guilda. */
export function nomeNaLista(nome, lista) {
	return typeof nome === 'string' && nome !== '' && Array.isArray(lista) && lista.indexOf(nome) > -1;
}

/**
 * O nome no comeco de uma linha "Nome : fala". O MESMO recorte que o
 * `highlightMessage` (ChatBox.js) usa para pintar o nome: se os dois
 * discordassem, a guilda marcaria um nome e pintaria outro.
 */
export const PREFIXO_DO_NOME = /^(\s*[^\n:]{1,24}?)\s:\s/;

export function nomeDaLinha(texto) {
	if (typeof texto !== 'string') return '';
	const m = PREFIXO_DO_NOME.exec(texto);
	return m ? m[1].trim() : '';
}

/**
 * Qual marca o nome leva: 'gm', 'vip' ou null. O GM vence (pedido do dono).
 */
export function marcaDaFala(ehAdmin, ehVip) {
	if (ehAdmin) return 'gm';
	if (ehVip) return 'vip';
	return null;
}

/**
 * A marca a partir dos bits de tipo da linha (`ChatBox.TYPE`), que e o que o
 * ChatBox tem na hora de desenhar. `TYPE` e passado para este modulo nao
 * importar o ChatBox.
 */
export function marcaDoTipo(colorType, TYPE) {
	return marcaDaFala(!!(colorType & TYPE.ADMIN), !!(colorType & TYPE.VIP));
}

/** Os tipos que sao FALA de jogador - os que tem "Nome : " no comeco. */
export function tiposDeFala(TYPE) {
	return TYPE.PUBLIC | TYPE.PARTY | TYPE.GUILD | TYPE.PRIVATE | TYPE.CLAN;
}

/**
 * A linha e de ADMIN mas NAO e fala (o texto de quest usa `TYPE.ADMIN` so pela
 * cor amarela)? Essa continua com a etiqueta "[GM]" e o amarelo de sempre. Na
 * FALA a marca de GM mora no nome, e a etiqueta e a cor voltam a ser do canal.
 */
export function linhaDeAdminSemNome(colorType, TYPE) {
	return !!(colorType & TYPE.ADMIN) && !(colorType & tiposDeFala(TYPE));
}

/**
 * A COR DA LINHA INTEIRA, e nao so do nome (25/09/2026, segundo pedido do
 * dono depois de ver no jogo): *"ate mesmo o texto do que o Administrador (GM)
 * digitar, que fique na mesma cor do nome dele"* - e o mesmo para o VIP. A
 * classe devolvida pinta a linha com o MESMO token do nome
 * (`--chat-text-name-gm` / `--chat-text-name-vip`), entao nome e fala nunca
 * divergem. So FALA de jogador ganha classe: a linha de admin que nao e fala
 * (o texto de quest) segue amarela por `getColorForType`.
 *
 * @returns {'cb-linha-gm'|'cb-linha-vip'|''}
 */
export function classeDaLinha(colorType, TYPE) {
	if (!(colorType & tiposDeFala(TYPE))) return '';
	const marca = marcaDoTipo(colorType, TYPE);
	if (marca === 'gm') return 'cb-linha-gm';
	if (marca === 'vip') return 'cb-linha-vip';
	return '';
}

/**
 * Os bits de tipo de uma marca, para quem monta a linha com a marca ja
 * decidida (o sussurro, que decide pelo nome): com eles o ChatBox pinta a
 * linha como pinta a da fala global.
 */
export function bitsDaMarca(marca, TYPE) {
	if (marca === 'gm') return TYPE.ADMIN;
	if (marca === 'vip') return TYPE.VIP;
	return 0;
}

/**
 * O icone do VIP. `alt="VIP"` e o que sobra se a imagem nao carregar, e o que o
 * leitor de tela le - a cor sozinha nunca e o unico sinal (spec do chat, 10).
 */
export function htmlDoIconeDeVip() {
	return `<img class="cb-vip-icone" src="${ICONE_DO_VIP}" alt="VIP" title="VIP" draggable="false">`;
}

/** A marca de GM: o texto "GM" num selo vermelho escuro (a cor e do CSS). */
export function htmlDoSeloDeGm() {
	return '<span class="cb-gm-selo" title="Administrador">GM</span>';
}

/**
 * O nome da fala ja ESCAPADO (quem chama escapa; aqui nada e escapado de novo),
 * com a marca antes. Sem marca e exatamente o span de sempre.
 */
export function htmlDoNomeDaFala(nomeEscapado, marca) {
	if (marca === 'gm') return `${htmlDoSeloDeGm()}<span class="cb-name cb-name-gm">${nomeEscapado}</span>`;
	if (marca === 'vip') return `${htmlDoIconeDeVip()}<span class="cb-name cb-name-vip">${nomeEscapado}</span>`;
	return `<span class="cb-name">${nomeEscapado}</span>`;
}

/**
 * O mesmo desenho em volta de um HTML ja montado com seguranca (o apelido
 * clicavel do sussurro, `spanDeNickname`). Sem marca, devolve o HTML intacto.
 */
export function comMarcaNoNome(htmlDoNome, marca) {
	if (marca === 'gm') return `${htmlDoSeloDeGm()}<span class="cb-name-gm">${htmlDoNome}</span>`;
	if (marca === 'vip') return `${htmlDoIconeDeVip()}<span class="cb-name-vip">${htmlDoNome}</span>`;
	return htmlDoNome;
}
