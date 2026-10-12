/**
 * UI/Components/BotMenu/editorDeManutencao.js
 *
 * O DESENHO das abas Sobrevivencia, Suporte e Coleta do menu do Bot (Fase 6,
 * 07/10/2026), no padrao de `editorDeSkills.js`: recebe a config do rascunho e
 * o que o servidor mandou (pocoes, skills com `suporte`) e desenha; toda
 * mudanca passa por `editar(fn)` com as funcoes puras de
 * `edicaoDeManutencao.js`. Nada aqui decide: o servidor valida a config e
 * devolve `problemas` por campo.
 *
 * This file is part of the ragidle fork of ROBrowser.
 */
import {
	LIMIAR_PADRAO_DA_POCAO,
	SENTAR_PADRAO,
	adicionarSuporte,
	candidatosDaColeta,
	definirAtivaDoSuporte,
	definirAutomatico,
	definirDescanso,
	definirDestinoDoSuporte,
	definirLimiarDaCura,
	definirLimiarDePocao,
	definirNivelDoSuporte,
	definirRaioDeColeta,
	deixarDeIgnorar,
	descansoCoerente,
	destinosDaSkill,
	escolherFrasco,
	ignorarItem,
	lerColeta,
	lerSobrevivencia,
	lerSuporte,
	ligarColeta,
	ligarEixo,
	ligarSentar,
	moverSuporte,
	removerSuporte
} from './edicaoDeManutencao.js';
import { desenharSeletorDeItem } from './seletorDeItem.js';

const NOME_DO_TIPO = Object.freeze({ buff: 'Buff', cura: 'Cura' });
const NOME_DO_DESTINO = Object.freeze({ eu: 'Em mim', grupo: 'No grupo' });
const CHAVE_DO_EIXO = Object.freeze({ hp: 'pocoesHp', sp: 'pocoesSp' });

function criar(tag, classe, texto) {
	const e = document.createElement(tag);
	if (classe) {
		e.className = classe;
	}
	if (texto !== undefined) {
		e.textContent = texto;
	}
	return e;
}

function botao(classe, texto, titulo, aoClicar, desligado) {
	const b = criar('button', 'ri-btn ri-btn--sec ' + classe, texto);
	b.type = 'button';
	b.title = titulo;
	b.setAttribute('aria-label', titulo);
	b.disabled = !!desligado;
	b.addEventListener('click', e => {
		e.stopImmediatePropagation();
		aoClicar();
	});
	return b;
}

/** Numero digitado: so vale no `change` (Enter ou sair do campo), para o redesenho nao atropelar a digitacao. */
function ligarNumero(input, valor, aoMudar) {
	if (input.ownerDocument.activeElement !== input) {
		input.value = String(valor);
	}
	input.onchange = () => aoMudar(input.value);
}

function nomeDoItemPor(dados) {
	const daMochila = new Map((dados.pocoes || []).map(p => [p.itemId, p.nome]));
	return id => daMochila.get(id) || (dados.nomeDoItem && dados.nomeDoItem(id)) || '#' + id;
}

/* ================= SOBREVIVENCIA ================= */

/*
 * O ULTIMO VALOR DA BARRA de cada eixo (so desta tela): desligar grava `abaixoDe: 0`, e religar volta ao que o
 * jogador tinha escolhido, e nao a um numero de fabrica. Comeca no padrao do servidor (50).
 */
const _ultimoLimiar = { hp: LIMIAR_PADRAO_DA_POCAO, sp: LIMIAR_PADRAO_DA_POCAO };
const _ultimoSentar = { sentarHpAbaixoDe: SENTAR_PADRAO, sentarSpAbaixoDe: SENTAR_PADRAO };

/** A barra (range): o `input` (arrastar) e o `change` (teclado, soltar) editam; o valor ao lado acompanha. */
function ligarBarra(input, valor, aoMudar) {
	input.value = String(valor);
	input.oninput = () => aoMudar(input.value);
	input.onchange = () => aoMudar(input.value);
}

/**
 * A SOBREVIVENCIA no modelo do menu antigo (ajustes do dono, 09/10/2026; print 4 das referencias). Por eixo:
 * o interruptor (desligado = `abaixoDe: 0`), o Automatico (qualquer pocao compativel do inventario), o frasco
 * escolhido com a quantidade no inventario e a barra "Beber com X% ou menos". O aviso aparece quando o eixo
 * esta ligado sem Automatico e sem frasco: o Bot nao teria o que beber. Logo abaixo, o descanso no mesmo estilo.
 *
 * @param {Element} raiz a secao Sobrevivencia
 * @param {{config: object, pocoes: Array|null, teto: number, nomeDoItem?: (id: number) => string|null}} dados
 * @param {(fn: (c: object) => object) => void} editar
 */
export function desenharSobrevivencia(raiz, dados, editar) {
	const s = lerSobrevivencia(dados.config);
	for (const eixo of ['hp', 'sp']) {
		const bloco = raiz.querySelector('.bm-pocoes[data-eixo="' + eixo + '"]');
		if (bloco) {
			desenharPocoes(bloco, eixo, s[CHAVE_DO_EIXO[eixo]], dados, editar);
		}
	}
	const d = s.descanso;
	for (const [campo, classe] of [
		['sentarHpAbaixoDe', 'sentar-hp'],
		['sentarSpAbaixoDe', 'sentar-sp']
	]) {
		const ligado = d[campo] > 0;
		if (ligado) {
			_ultimoSentar[campo] = d[campo];
		}
		const chave = raiz.querySelector('.bm-' + classe + '-ligado');
		chave.checked = ligado;
		chave.onchange = () => editar(c => ligarSentar(c, campo, chave.checked, _ultimoSentar[campo]));
		const barra = raiz.querySelector('.bm-' + classe);
		barra.disabled = !ligado;
		const valor = ligado ? d[campo] : _ultimoSentar[campo];
		ligarBarra(barra, valor, v => editar(c => definirDescanso(c, campo, v)));
		raiz.querySelector('.bm-' + classe + '-valor').textContent = valor + '%';
	}
	const levantar = raiz.querySelector('.bm-levantar');
	levantar.disabled = d.sentarHpAbaixoDe === 0 && d.sentarSpAbaixoDe === 0;
	ligarBarra(levantar, d.levantarEm, v => editar(c => definirDescanso(c, 'levantarEm', v)));
	raiz.querySelector('.bm-levantar-valor').textContent = d.levantarEm + '%';
	raiz.querySelector('.bm-descanso-aviso').hidden = descansoCoerente(dados.config);
}

function opcao(valor, texto) {
	const o = criar('option', '', texto);
	o.value = valor;
	return o;
}

function desenharPocoes(bloco, eixo, lista, dados, editar) {
	const nome = nomeDoItemPor(dados);
	const doEixo = (dados.pocoes || []).filter(p => p[eixo]);
	const naMochila = new Map((dados.pocoes || []).map(p => [p.itemId, p]));
	const ligado = lista.abaixoDe > 0;
	if (ligado) {
		_ultimoLimiar[eixo] = lista.abaixoDe;
	}

	const chave = bloco.querySelector('.bm-eixo-ligado');
	chave.checked = ligado;
	chave.onchange = () => editar(c => ligarEixo(c, eixo, chave.checked, _ultimoLimiar[eixo]));
	bloco.classList.toggle('is-desligado', !ligado);

	const auto = bloco.querySelector('.bm-eixo-auto');
	auto.checked = lista.auto;
	auto.onchange = () => editar(c => definirAutomatico(c, eixo, auto.checked));

	// O FRASCO: so as pocoes deste eixo, com a quantidade; o salvo que acabou continua na lista (com 0).
	const frasco = bloco.querySelector('.bm-frasco');
	const escolhido = lista.itens.length > 0 ? lista.itens[0] : null;
	frasco.innerHTML = '';
	frasco.appendChild(opcao('', lista.auto ? 'Qualquer poção compatível' : 'Escolha a poção'));
	for (const p of doEixo) {
		frasco.appendChild(opcao(String(p.itemId), p.nome + ' (' + p.quantidade + ' no inventário)'));
	}
	if (escolhido !== null && !doEixo.some(p => p.itemId === escolhido)) {
		frasco.appendChild(opcao(String(escolhido), nome(escolhido) + ' (0 no inventário)'));
	}
	frasco.value = escolhido === null ? '' : String(escolhido);
	frasco.onchange = () => editar(c => escolherFrasco(c, eixo, frasco.value === '' ? null : Number(frasco.value)));

	const semEstoque = lista.itens.length > 0 && !lista.itens.some(id => (naMochila.get(id) || {}).quantidade > 0);
	bloco.querySelector('.bm-sem-frasco').hidden = !(ligado && !lista.auto && lista.itens.length === 0);
	bloco.querySelector('.bm-frasco-acabou').hidden = !(ligado && !lista.auto && semEstoque);

	// A BARRA: o valor do eixo ligado; desligado, o ultimo escolhido, parado.
	const barra = bloco.querySelector('.bm-limiar');
	barra.disabled = !ligado;
	const valor = ligado ? lista.abaixoDe : _ultimoLimiar[eixo];
	ligarBarra(barra, valor, v => editar(c => definirLimiarDePocao(c, eixo, Math.max(1, Number(v)))));
	bloco.querySelector('.bm-limiar-valor').textContent = valor + '%';
}

/* ================= SUPORTE ================= */

/**
 * @param {Element} raiz a secao Suporte
 * @param {{config: object, skills: Array|null, teto: number}} dados
 * @param {(fn: (c: object) => object) => void} editar
 */
export function desenharSuporte(raiz, dados, editar) {
	const deSuporte = (dados.skills || []).filter(s => s.suporte === 'buff' || s.suporte === 'cura');
	const porId = new Map(deSuporte.map(s => [s.skillId, s]));
	const lista = lerSuporte(dados.config);

	// A LISTA, no desenho do rodizio do Ataque (ajustes 2 do dono, 09/10/2026, item 4.5): numerada, icone, liga/desliga
	// por buff, setas de ordem e Tirar. A ordem da lista E a ordem de lancamento.
	const ol = raiz.querySelector('.bm-lista-suporte');
	ol.innerHTML = '';
	lista.forEach((e, i) => {
		const skill = porId.get(e.skillId) || null;
		const tipo = skill ? skill.suporte : e.gatilho === 'hp' ? 'cura' : 'buff';
		const ativa = e.ativa !== false;
		const nome = skill ? skill.nome : '#' + e.skillId;
		const li = criar('li', 'bm-suporte bm-rodizio-item' + (ativa ? '' : ' is-desligada'));
		li.setAttribute('data-indice', String(i));
		li.setAttribute('data-skill', String(e.skillId));
		li.appendChild(criar('span', 'bm-rodizio-ordem', String(i + 1)));
		li.appendChild(iconeDaSkill(skill && skill.chave));
		const textos = criar('span', 'bm-rodizio-textos');
		const n = criar('b', 'bm-rodizio-nome', nome);
		n.setAttribute('translate', 'no');
		textos.appendChild(n);
		const detalhe = criar('small', 'bm-rodizio-detalhe');
		detalhe.appendChild(criar('span', 'bm-tipo bm-tipo--' + tipo, NOME_DO_TIPO[tipo]));

		const destino = criar('select', 'bm-destino');
		destino.setAttribute('aria-label', 'Em quem usar');
		for (const d of destinosDaSkill(skill)) {
			const o = criar('option', '', NOME_DO_DESTINO[d]);
			o.value = d;
			destino.appendChild(o);
		}
		if (![...destino.options].some(o => o.value === e.destino)) {
			// Entrada salva com um destino que a skill nao aceita mais: aparece, e o servidor aponta.
			const o = criar('option', '', NOME_DO_DESTINO[e.destino] || e.destino);
			o.value = e.destino;
			destino.appendChild(o);
		}
		destino.value = e.destino;
		destino.disabled = destino.options.length < 2;
		destino.onchange = () => editar(c => definirDestinoDoSuporte(c, i, destino.value, skill));
		detalhe.appendChild(destino);

		const nivel = criar('select', 'bm-skill-nivel');
		nivel.setAttribute('aria-label', 'Nível de uso');
		const opt = criar('option', '', 'Aprendido');
		opt.value = 'aprendido';
		nivel.appendChild(opt);
		for (let k = 1; k <= ((skill && skill.aprendido) || 0); k++) {
			const o = criar('option', '', 'Nv ' + k);
			o.value = String(k);
			nivel.appendChild(o);
		}
		nivel.value = String(e.nivel);
		nivel.onchange = () =>
			editar(c => definirNivelDoSuporte(c, i, nivel.value === 'aprendido' ? 'aprendido' : Number(nivel.value)));
		detalhe.appendChild(nivel);

		if (tipo === 'cura') {
			const rotulo = criar('label', 'bm-limiar-cura');
			rotulo.appendChild(criar('span', '', 'HP abaixo de'));
			const limiar = criar('input', 'bm-limiar');
			limiar.type = 'number';
			limiar.min = '1';
			limiar.max = '99';
			limiar.step = '1';
			limiar.inputMode = 'numeric';
			ligarNumero(limiar, e.limiar, v => editar(c => definirLimiarDaCura(c, i, v)));
			rotulo.appendChild(limiar);
			rotulo.appendChild(criar('span', '', '%'));
			detalhe.appendChild(rotulo);
		}
		if (!ativa) {
			detalhe.appendChild(criar('span', 'bm-rodizio-off', 'Desligada: o Bot pula esta'));
		}
		textos.appendChild(detalhe);
		li.appendChild(textos);

		const chave = criar('label', 'bm-interruptor bm-rodizio-chave');
		chave.title = ativa ? 'Ligada: o Bot usa esta habilidade' : 'Desligada: o Bot pula esta habilidade';
		const caixa = criar('input', 'bm-rodizio-ativa');
		caixa.type = 'checkbox';
		caixa.checked = ativa;
		caixa.setAttribute('aria-label', 'Usar ' + nome);
		caixa.onchange = () => editar(c => definirAtivaDoSuporte(c, i, caixa.checked));
		chave.appendChild(caixa);
		const trilho = criar('span', 'bm-interruptor-trilho');
		trilho.setAttribute('aria-hidden', 'true');
		chave.appendChild(trilho);
		li.appendChild(chave);

		const acoes = criar('span', 'bm-rodizio-acoes');
		acoes.appendChild(botao('bm-sobe', '↑', 'Mover para cima', () => editar(c => moverSuporte(c, i, -1)), i === 0));
		acoes.appendChild(botao('bm-desce', '↓', 'Descer', () => editar(c => moverSuporte(c, i, 1)), i === lista.length - 1));
		acoes.appendChild(botao('bm-remove', '×', 'Tirar do suporte', () => editar(c => removerSuporte(c, i))));
		li.appendChild(acoes);
		ol.appendChild(li);
	});
	raiz.querySelector('.bm-suporte-vazio').hidden = lista.length > 0 || deSuporte.length === 0;

	// AS DE FORA: as de suporte que o personagem tem e ainda nao estao na lista, com o "+ Usar".
	const fora = raiz.querySelector('.bm-suporte-fora');
	fora.innerHTML = '';
	const naLista = new Set(lista.map(e => e.skillId));
	const outras = deSuporte.filter(s => !naLista.has(s.skillId));
	for (const s of outras) {
		const li = criar('li', 'bm-rodizio-fora-item');
		li.setAttribute('data-skill', String(s.skillId));
		li.appendChild(iconeDaSkill(s.chave));
		const n = criar('span', 'bm-rodizio-nome', s.nome);
		n.setAttribute('translate', 'no');
		li.appendChild(n);
		li.appendChild(criar('span', 'bm-tipo bm-tipo--' + s.suporte, NOME_DO_TIPO[s.suporte]));
		li.appendChild(
			botao(
				'bm-rodizio-usar',
				'+ Usar',
				'Pôr ' + s.nome + ' no suporte',
				() => editar(c => adicionarSuporte(c, s, dados.teto)),
				lista.length >= dados.teto
			)
		);
		fora.appendChild(li);
	}
	raiz.querySelector('.bm-suporte-outras').hidden = outras.length === 0;
	raiz.querySelector('.bm-sem-suporte').hidden = deSuporte.length > 0;
}

function iconeDaSkill(chave) {
	const img = criar('img', 'bm-rodizio-icone');
	img.alt = '';
	img.loading = 'lazy';
	img.setAttribute('aria-hidden', 'true');
	img.src = '/ragidle/skills/' + encodeURIComponent(chave || '') + '.png';
	img.onerror = () => {
		img.style.visibility = 'hidden';
	};
	return img;
}

/* ================= COLETA ================= */

/**
 * @param {Element} raiz a secao Coleta
 * @param {{config: object, teto: number, raioMinimo: number, raioMaximo: number, nomeDoItem?: (id: number) => string|null}} dados
 * @param {(fn: (c: object) => object) => void} editar
 */
export function desenharColeta(raiz, dados, editar) {
	const mochila = () => (dados.mochila ? dados.mochila() : []);
	const c = lerColeta(dados.config);
	const nome = nomeDoItemPor(dados);
	const ligada = raiz.querySelector('.bm-coletar');
	ligada.checked = c.ligada;
	ligada.onchange = () => editar(x => ligarColeta(x, ligada.checked));

	const raio = raiz.querySelector('.bm-raio-coleta');
	raio.min = String(dados.raioMinimo);
	raio.max = String(dados.raioMaximo);
	raio.value = String(c.raio);
	raio.oninput = () => editar(x => definirRaioDeColeta(x, raio.value, dados.raioMinimo, dados.raioMaximo));
	raio.onchange = raio.oninput;
	raio.disabled = !c.ligada;
	raiz.querySelector('.bm-raio-coleta-valor').textContent = String(c.raio);

	const ul = raiz.querySelector('.bm-ignorados');
	ul.innerHTML = '';
	for (const itemId of c.ignorar) {
		const li = criar('li', 'bm-ignorado');
		li.setAttribute('data-item', String(itemId));
		const n = criar('span', 'bm-item-nome', nome(itemId));
		n.setAttribute('translate', 'no');
		n.title = 'Item ' + itemId;
		li.appendChild(n);
		li.appendChild(botao('bm-remove', '×', 'Voltar a coletar', () => editar(x => deixarDeIgnorar(x, itemId))));
		ul.appendChild(li);
	}

	desenharSeletorDeItem(
		raiz.querySelector('.bm-escolher-ignorado'),
		{
			nome: 'coleta-ignorar',
			candidatos: () => candidatosDaColeta(dados.config, mochila(), dados.nomeDoItem),
			cheio: c.ignorar.length >= dados.teto,
			vazio: 'Nenhum item na mochila para ignorar. Pegue o item uma vez para poder escolhê-lo.',
			iconeDoItem: dados.iconeDoItem
		},
		id => editar(x => ignorarItem(x, id, dados.teto))
	);
}
