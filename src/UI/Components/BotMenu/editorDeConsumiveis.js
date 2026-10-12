/**
 * UI/Components/BotMenu/editorDeConsumiveis.js
 *
 * O DESENHO das abas Consumiveis e Avancado do menu do Bot (decisoes D3-C1 e D4-A3 do dono, 08/10/2026), no
 * padrao de `editorDeManutencao.js`. Consumiveis edita o RASCUNHO (Aplicar confirma): as pocoes de velocidade
 * que o Bot mantem e a Asa de Mosca automatica. Avancado so LE: o que o Bot esta fazendo e os contadores da
 * sessao, com a explicacao em frase de jogador (nunca id ou termo interno).
 *
 * This file is part of the ragidle fork of ROBrowser.
 */
import {
	MOTIVO_DA_POCAO,
	alternarBuff,
	alternarGatilho,
	definirGatilho,
	definirReserva,
	faixasDasCapacidades,
	lerConsumiveis,
	ligarAsa,
	ligarBuffs
} from './edicaoDeConsumiveis.js';
import { explicacaoDoStatus, fraseDoStatus } from './estadoDoBot.js';

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

function ligarNumero(input, valor, aoMudar) {
	if (input.ownerDocument.activeElement !== input) {
		input.value = String(valor);
	}
	input.onchange = () => aoMudar(input.value);
}

/** Os tres gatilhos da asa: a chave da config, a caixa e o numero da tela. */
const GATILHOS = Object.freeze([
	{ campo: 'semAlvoPorSegundos', classe: 'sem-alvo', min: 'asaSemAlvoMinimo', max: 'asaSemAlvoMaximo' },
	{ campo: 'cercadoPor', classe: 'cercado', min: 'asaCercadoMinimo', max: 'asaCercadoMaximo' },
	{ campo: 'hpAbaixoDe', classe: 'hp', min: 'asaHpMinimo', max: 'asaHpMaximo' }
]);

/**
 * @param {Element} raiz a secao Consumiveis
 * @param {{config: object, consumiveis: {buffs: Array, asa: {quantidade: number, vip: boolean}}|null, limites: object,
 *          iconeDoItem?: (img: HTMLImageElement, id: number) => void}} dados
 * @param {(fn: (c: object) => object) => void} editar
 */
export function desenharConsumiveis(raiz, dados, editar) {
	const k = lerConsumiveis(dados.config);
	const faixas = faixasDasCapacidades(dados.limites);
	const menu = dados.consumiveis || { buffs: [], asa: { quantidade: 0, vip: false } };

	// ---- POCOES DE VELOCIDADE
	const ligadoBuffs = raiz.querySelector('.bm-buffs-ligado');
	ligadoBuffs.checked = k.buffs.ligado;
	ligadoBuffs.disabled = k.buffs.itens.length === 0;
	ligadoBuffs.onchange = () => editar(c => ligarBuffs(c, ligadoBuffs.checked));
	const ul = raiz.querySelector('.bm-buffs-lista');
	ul.innerHTML = '';
	for (const b of menu.buffs) {
		const escolhida = k.buffs.itens.includes(b.itemId);
		const li = criar('li', 'bm-item bm-buff' + (b.serve ? '' : ' is-indisponivel'));
		li.setAttribute('data-item', String(b.itemId));
		const caixa = criar('input', 'bm-buff-escolher');
		caixa.type = 'checkbox';
		caixa.checked = escolhida;
		caixa.setAttribute('aria-label', 'Manter ' + b.nome);
		caixa.onchange = () => editar(c => alternarBuff(c, b.itemId, faixas.buffsDeItem));
		li.appendChild(caixa);
		const img = criar('img', 'bm-item-icone');
		img.alt = '';
		img.setAttribute('aria-hidden', 'true');
		if (dados.iconeDoItem) {
			dados.iconeDoItem(img, b.itemId);
		}
		li.appendChild(img);
		const nome = criar('span', 'bm-item-nome', b.nome);
		nome.setAttribute('translate', 'no');
		li.appendChild(nome);
		li.appendChild(criar('span', 'bm-quantidade' + (b.quantidade === 0 ? ' is-vazio' : ''), 'x' + b.quantidade));
		const nota = !b.serve ? 'Não serve: ' + (MOTIVO_DA_POCAO[b.motivo] || 'não pode usar') : b.ativo ? 'Ativa agora' : b.quantidade === 0 ? 'Acabou' : '';
		if (nota) {
			li.appendChild(criar('span', 'bm-tipo bm-buff-nota', nota));
		}
		ul.appendChild(li);
	}
	raiz.querySelector('.bm-buffs-vazio').hidden = menu.buffs.length > 0;

	// ---- ASA DE MOSCA
	raiz.querySelector('.bm-asa-quantidade').textContent = String(menu.asa.quantidade);
	raiz.querySelector('.bm-asa-sem-vip').hidden = menu.asa.vip;
	const ligada = raiz.querySelector('.bm-asa-ligada');
	ligada.checked = k.asa.ligada;
	ligada.onchange = () => editar(c => ligarAsa(c, ligada.checked));
	for (const g of GATILHOS) {
		const linha = raiz.querySelector('.bm-gatilho-' + g.classe);
		const caixa = linha.querySelector('input[type="checkbox"]');
		const numero = linha.querySelector('input[type="number"]');
		caixa.checked = k.asa[g.campo] > 0;
		caixa.onchange = () => editar(c => alternarGatilho(c, g.campo));
		numero.min = String(faixas[g.min]);
		numero.max = String(faixas[g.max]);
		numero.disabled = k.asa[g.campo] === 0;
		ligarNumero(numero, k.asa[g.campo] > 0 ? k.asa[g.campo] : '', v => editar(c => definirGatilho(c, g.campo, v, faixas)));
	}
	const reserva = raiz.querySelector('.bm-asa-reserva');
	reserva.max = String(faixas.asaReservaMaxima);
	ligarNumero(reserva, k.asa.reserva, v => editar(c => definirReserva(c, v, faixas)));
}

/** Segundos em "1 h 05 min" / "4 min 10 s" / "35 s". */
export function duracaoPorExtenso(ms) {
	const total = Math.max(0, Math.floor(ms / 1000));
	const h = Math.floor(total / 3600);
	const min = Math.floor((total % 3600) / 60);
	const s = total % 60;
	if (h > 0) {
		return h + ' h ' + String(min).padStart(2, '0') + ' min';
	}
	if (min > 0) {
		return min + ' min ' + String(s).padStart(2, '0') + ' s';
	}
	return s + ' s';
}

/**
 * @param {Element} raiz a secao Avancado
 * @param {{status: object|null, diagnostico: {status: object, sessao: object}|null, ligado: boolean}} dados
 */
export function desenharAvancado(raiz, dados) {
	const d = dados.diagnostico;
	const status = d ? d.status : dados.status;
	raiz.querySelector('.bm-diag-status').textContent = fraseDoStatus(status);
	raiz.querySelector('.bm-diag-explicacao').textContent = explicacaoDoStatus(status);
	const s = d ? d.sessao : null;
	raiz.querySelector('.bm-diag-sessao').hidden = s === null;
	raiz.querySelector('.bm-diag-aguardando').hidden = s !== null;
	if (s === null) {
		return;
	}
	raiz.querySelector('.bm-diag-tempo').textContent = s.desdeMs === null ? 'Bot desligado' : 'Ligado há ' + duracaoPorExtenso(s.desdeMs);
	for (const [chave, valor] of [
		['abates', s.abates],
		['pocoes', s.pocoes],
		['flechas', s.flechas],
		['asas', s.asas],
		['buffs', s.buffs]
	]) {
		raiz.querySelector('.bm-diag-' + chave).textContent = String(valor);
	}
}
