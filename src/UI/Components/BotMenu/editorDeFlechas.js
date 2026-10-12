/**
 * UI/Components/BotMenu/editorDeFlechas.js
 *
 * O DESENHO da aba Flechas do menu do Bot (Fase 7, 07/10/2026), no padrao de
 * `editorDeManutencao.js`: recebe a config do rascunho e o que o servidor
 * mandou (municoes da mochila, situacao VIP, flecha da mao) e desenha; toda
 * mudanca passa por `editar(fn)` com as funcoes puras de `edicaoDeFlechas.js`.
 *
 * Sem VIP a secao continua visivel e explica que a escolha elemental e
 * beneficio VIP (o servidor confere na hora; o cliente nao habilita nada).
 *
 * Fase 11 (mockup do dono, 08/10/2026): o cartao mora dentro de Ataque, com a
 * chave ON/OFF, o "Modo de uso" em dois radios (Melhor disponivel / Flecha
 * fixa) e a lista da flecha fixa com o icone do item. O icone vem por
 * `dados.iconeDoItem(img, itemId)` (a janela passa o de `UI/itemNaTela.js`;
 * o teste roda sem o banco do cliente).
 *
 * This file is part of the ragidle fork of ROBrowser.
 */
import { alternarPermitida, definirModoDeFlecha, definirRegraDoMonstro, lerFlechas, ligarFlechas } from './edicaoDeFlechas.js';

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

function opcao(valor, texto) {
	const o = criar('option', '', texto);
	o.value = valor;
	return o;
}

/**
 * @param {Element} raiz a secao Flechas
 * @param {{config: object, municoes: Array|null, municao: {vip: boolean, manual: number|null, tetoAutomatico: number}|null,
 *          monstros: Array, tetoPermitidas: number, tetoMonstros: number, nomeDoItem?: (id: number) => string|null,
 *          iconeDoItem?: (img: HTMLImageElement, id: number) => void}} dados
 * @param {(fn: (c: object) => object) => void} editar
 * @param {() => void} retomar o verbo "retomar-municao" (comando imediato, fora do Aplicar)
 */
export function desenharFlechas(raiz, dados, editar, retomar) {
	const f = lerFlechas(dados.config);
	const municoes = dados.municoes || [];
	const sit = dados.municao || { vip: false, manual: null, tetoAutomatico: 4 };
	const nomeDe = id => {
		const m = municoes.find(x => x.itemId === id);
		return (m && m.nome) || (dados.nomeDoItem && dados.nomeDoItem(id)) || '#' + id;
	};

	raiz.querySelector('.bm-flechas-vip').hidden = sit.vip;
	const ligada = raiz.querySelector('.bm-flechas-ligada');
	ligada.checked = f.ligada;
	ligada.onchange = () => editar(c => ligarFlechas(c, ligada.checked));
	const icone = (img, id) => {
		if (!img) {
			return;
		}
		if (img.getAttribute('data-item') === String(id)) {
			return;
		}
		img.setAttribute('data-item', String(id));
		img.style.display = '';
		if (dados.iconeDoItem) {
			dados.iconeDoItem(img, id);
		}
	};

	// A flecha vestida a mao suspende a escolha do Bot ate "Retomar automatico".
	const manual = raiz.querySelector('.bm-flechas-manual');
	manual.hidden = sit.manual === null || sit.manual === undefined;
	if (!manual.hidden) {
		raiz.querySelector('.bm-flechas-manual-nome').textContent = nomeDe(sit.manual);
	}
	const btnRetomar = raiz.querySelector('.bm-retomar-municao');
	btnRetomar.onclick = e => {
		e.stopImmediatePropagation();
		retomar();
	};

	// MODO DE USO: "Melhor disponivel" (automatico) ou "Flecha fixa" (uma da mochila; a fixa salva
	// sem estoque continua listada). Escolher uma flecha na lista ja e escolher o modo fixo.
	const auto = raiz.querySelector('.bm-flechas-auto');
	const fixaRadio = raiz.querySelector('.bm-flechas-fixa-radio');
	const selFixa = raiz.querySelector('.bm-flechas-fixa');
	auto.closest('.bm-opcao').querySelector('small').textContent =
		'Usa a melhor flecha conforme a fraqueza do monstro, até ' + sit.tetoAutomatico + 'z (recomendado).';
	const fixas = new Set(municoes.map(m => m.itemId));
	if (f.fixa !== null) {
		fixas.add(f.fixa);
	}
	selFixa.innerHTML = '';
	for (const id of fixas) {
		selFixa.appendChild(opcao(String(id), nomeDe(id)));
	}
	const vestida = municoes.find(m => m.vestida);
	const escolhida = f.fixa !== null ? f.fixa : vestida ? vestida.itemId : fixas.size ? [...fixas][0] : null;
	if (escolhida !== null) {
		selFixa.value = String(escolhida);
		icone(raiz.querySelector('.bm-flechas-fixa-icone'), escolhida);
	}
	const ehFixa = f.modo === 'fixa' && f.fixa !== null;
	auto.checked = !ehFixa;
	fixaRadio.checked = ehFixa;
	fixaRadio.disabled = fixas.size === 0;
	selFixa.disabled = fixas.size === 0;
	auto.onchange = () => editar(c => definirModoDeFlecha(c, 'automatico'));
	fixaRadio.onchange = () => {
		const id = Number(selFixa.value);
		if (id) {
			editar(c => definirModoDeFlecha(c, 'fixa', id));
		}
	};
	selFixa.onchange = () => {
		const id = Number(selFixa.value);
		editar(c => definirModoDeFlecha(c, 'fixa', id));
	};

	// PERMITIDAS: vazia = todas ate o teto; marcada = so as marcadas.
	const ul = raiz.querySelector('.bm-flechas-permitidas');
	ul.innerHTML = '';
	for (const m of municoes) {
		const li = criar('li', 'bm-item bm-flecha');
		li.setAttribute('data-item', String(m.itemId));
		const caixa = criar('input', 'bm-flecha-permitida');
		caixa.type = 'checkbox';
		caixa.checked = f.permitidas.includes(m.itemId);
		caixa.disabled = !caixa.checked && f.permitidas.length >= dados.tetoPermitidas;
		caixa.setAttribute('aria-label', 'Permitir ' + m.nome);
		caixa.onchange = () => editar(c => alternarPermitida(c, m.itemId, dados.tetoPermitidas));
		li.appendChild(caixa);
		const img = criar('img', 'bm-item-icone');
		img.alt = '';
		icone(img, m.itemId);
		li.appendChild(img);
		const n = criar('span', 'bm-item-nome', m.nome);
		n.setAttribute('translate', 'no');
		li.appendChild(n);
		li.appendChild(criar('span', 'bm-quantidade', m.quantidade + ' un. · ' + m.preco + 'z'));
		if (m.preco > sit.tetoAutomatico) {
			li.appendChild(criar('span', 'bm-tipo bm-tipo--especial', 'Só fixa'));
		}
		if (m.vestida) {
			li.appendChild(criar('span', 'bm-tipo bm-tipo--vestida', 'Equipada'));
		}
		ul.appendChild(li);
	}
	raiz.querySelector('.bm-sem-flecha').hidden = municoes.length > 0;

	// POR MONSTRO: herdar, automatico ou fixa, por especie do mapa.
	const ol = raiz.querySelector('.bm-flechas-monstros');
	ol.innerHTML = '';
	const especies = new Map((dados.monstros || []).map(x => [x.especie, x.nome]));
	for (const chave of Object.keys(f.porMonstro)) {
		if (!especies.has(Number(chave))) {
			especies.set(Number(chave), '#' + chave);
		}
	}
	for (const [especie, nome] of especies) {
		const li = criar('li', 'bm-item bm-flecha-monstro');
		li.setAttribute('data-especie', String(especie));
		const n = criar('span', 'bm-item-nome', nome);
		n.setAttribute('translate', 'no');
		li.appendChild(n);
		const sel = criar('select', 'bm-flecha-regra');
		sel.setAttribute('aria-label', 'Flecha contra ' + nome);
		sel.appendChild(opcao('herdar', 'Como o geral'));
		sel.appendChild(opcao('automatico', 'Automático'));
		const regra = f.porMonstro[String(especie)] || null;
		const ids = new Set(municoes.map(m => m.itemId));
		if (regra && regra.modo === 'fixa') {
			ids.add(regra.fixa);
		}
		for (const id of ids) {
			sel.appendChild(opcao('fixa:' + id, 'Sempre ' + nomeDe(id)));
		}
		sel.value = regra === null ? 'herdar' : regra.modo === 'automatico' ? 'automatico' : 'fixa:' + regra.fixa;
		sel.onchange = () => {
			const v = sel.value;
			const nova = v === 'herdar' ? null : v === 'automatico' ? { modo: 'automatico' } : { modo: 'fixa', fixa: Number(v.slice(5)) };
			editar(c => definirRegraDoMonstro(c, especie, nova, dados.tetoMonstros));
		};
		li.appendChild(sel);
		ol.appendChild(li);
	}
}
