/**
 * UI/Components/BotMenu/editorDeSkills.js
 *
 * O DESENHO do editor de skills da aba Ataque (Fase 6, 07/10/2026). Recebe a
 * config do rascunho, as skills que o servidor mandou (com `aceita`) e os
 * monstros do mapa, e desenha; toda mudanca passa por `editar(fn)` com as
 * funcoes puras de `edicaoDeSkills.js`. Nada aqui decide combate: o servidor
 * valida a config e o classico executa.
 *
 * This file is part of the ragidle fork of ROBrowser.
 */
import {
	adicionarSkill,
	definirEscopoDaSkill,
	definirNivel,
	definirSkillAtiva,
	herdarGeral,
	lerLista,
	listaEfetiva,
	moverSkill,
	removerSkill,
	usarListaPropria
} from './edicaoDeSkills.js';

const MOTIVO = Object.freeze({
	desligada: 'desligada',
	'fora do escopo': 'fora do escopo deste monstro'
});

/** As caixas "Só nestes monstros" abertas sobrevivem ao redesenho de cada clique. */
const _escoposAbertos = new Set();

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

/**
 * @param {Element} raiz a secao Ataque
 * @param {{config: object, skills: Array|null, monstros: Array, escopo: 'geral'|number, teto: {geral: number, porMonstro: number}}} dados
 * @param {(fn: (c: object) => object) => void} editar
 * @param {(escopo: 'geral'|number) => void} trocarEscopo
 */
export function desenharEditorDeSkills(raiz, dados, editar, trocarEscopo) {
	const caixa = raiz.querySelector('.bm-skills');
	const aviso = raiz.querySelector('.bm-indisponivel');
	const temSkills = Array.isArray(dados.skills);
	caixa.hidden = !temSkills;
	if (aviso) {
		aviso.hidden = temSkills;
	}
	if (!temSkills) {
		return;
	}
	const { config, skills, monstros } = dados;
	const nomeDaSkill = new Map(skills.map(s => [s.skillId, s.nome]));
	const aprendido = new Map(skills.map(s => [s.skillId, s.aprendido]));
	const nomeDoMonstro = new Map((monstros || []).map(m => [m.especie, m.nome]));
	for (const chave of Object.keys(config.skills.porMonstro)) {
		if (!nomeDoMonstro.has(Number(chave))) {
			nomeDoMonstro.set(Number(chave), '#' + chave);
		}
	}
	const escopo = dados.escopo !== 'geral' && nomeDoMonstro.has(dados.escopo) ? dados.escopo : 'geral';

	// O ESCOPO: a lista geral ou a de um monstro do mapa (ou com regra salva).
	const seletor = caixa.querySelector('.bm-escopo');
	seletor.innerHTML = '';
	const geral = criar('option', '', 'Todos os monstros (lista geral)');
	geral.value = 'geral';
	seletor.appendChild(geral);
	for (const [especie, nome] of [...nomeDoMonstro].sort((a, b) => String(a[1]).localeCompare(String(b[1])))) {
		const o = criar('option', '', nome + (config.skills.porMonstro[String(especie)] ? ' (lista própria)' : ''));
		o.value = String(especie);
		seletor.appendChild(o);
	}
	seletor.value = String(escopo);
	seletor.onchange = () => trocarEscopo(seletor.value === 'geral' ? 'geral' : Number(seletor.value));

	const propria = caixa.querySelector('.bm-propria');
	const usarPropria = caixa.querySelector('.bm-usar-propria');
	propria.hidden = escopo === 'geral';
	const temPropria = escopo !== 'geral' && lerLista(config, escopo) !== null;
	usarPropria.checked = temPropria;
	usarPropria.onchange = () => editar(c => (usarPropria.checked ? usarListaPropria(c, escopo) : herdarGeral(c, escopo)));

	// A LISTA: a editavel (geral ou propria) ou, herdando, a efetiva da especie so para ler.
	const editavel = escopo === 'geral' || temPropria;
	const lista = caixa.querySelector('.bm-lista-skills');
	lista.innerHTML = '';
	const entradas = escopo === 'geral' ? config.skills.geral : listaEfetiva(config, escopo);
	const dica = caixa.querySelector('.bm-herda');
	dica.hidden = editavel;
	entradas.forEach((e, i) => {
		const li = criar('li', 'bm-skill');
		li.setAttribute('data-skill', String(e.skillId));
		const regra = config.skills.porSkill[String(e.skillId)] || { ativa: true, especies: null };
		const filtrada = escopo === 'geral' ? null : e.filtrada;
		li.classList.toggle('is-filtrada', !!filtrada || regra.ativa === false);
		const nome = criar('span', 'bm-skill-nome', nomeDaSkill.get(e.skillId) || '#' + e.skillId);
		nome.setAttribute('translate', 'no');
		li.appendChild(nome);
		if (filtrada) {
			li.appendChild(criar('span', 'bm-skill-motivo', MOTIVO[filtrada] || filtrada));
		}
		if (editavel) {
			const nivel = criar('select', 'bm-skill-nivel');
			nivel.setAttribute('aria-label', 'Nível de uso');
			const max = aprendido.get(e.skillId) || 0;
			const opt = criar('option', '', 'Aprendido');
			opt.value = 'aprendido';
			nivel.appendChild(opt);
			for (let n = 1; n <= max; n++) {
				const o = criar('option', '', 'Nv ' + n);
				o.value = String(n);
				nivel.appendChild(o);
			}
			nivel.value = String(e.nivel);
			nivel.onchange = () =>
				editar(c => definirNivel(c, escopo, e.skillId, nivel.value === 'aprendido' ? 'aprendido' : Number(nivel.value)));
			li.appendChild(nivel);
			const ativa = criar('input', 'bm-skill-ativa');
			ativa.type = 'checkbox';
			ativa.checked = regra.ativa !== false;
			ativa.title = 'Ativa (vale para todas as listas)';
			ativa.setAttribute('aria-label', ativa.title);
			ativa.onchange = () => editar(c => definirSkillAtiva(c, e.skillId, ativa.checked));
			li.appendChild(ativa);
			li.appendChild(botao('bm-sobe', '↑', 'Mover para cima', () => editar(c => moverSkill(c, escopo, e.skillId, -1)), i === 0));
			li.appendChild(
				botao('bm-desce', '↓', 'Descer', () => editar(c => moverSkill(c, escopo, e.skillId, 1)), i === entradas.length - 1)
			);
			li.appendChild(botao('bm-remove', '×', 'Remover', () => editar(c => removerSkill(c, escopo, e.skillId))));
			if (escopo === 'geral' && (monstros || []).length > 0) {
				li.appendChild(desenharEscopoDaSkill(e.skillId, regra, monstros, editar));
			}
		}
		lista.appendChild(li);
	});

	// ADICIONAR: so as skills que o Bot aceita e que ainda nao estao na lista.
	const adicionar = caixa.querySelector('.bm-adicionar');
	adicionar.hidden = !editavel;
	const nova = caixa.querySelector('.bm-nova-skill');
	const naLista = new Set((lerLista(config, escopo) || []).map(e => e.skillId));
	const teto = escopo === 'geral' ? dados.teto.geral : dados.teto.porMonstro;
	nova.innerHTML = '';
	for (const s of skills) {
		if (s.aceita && !naLista.has(s.skillId)) {
			const o = criar('option', '', s.nome);
			o.value = String(s.skillId);
			nova.appendChild(o);
		}
	}
	const add = caixa.querySelector('.bm-add');
	add.disabled = nova.options.length === 0 || naLista.size >= teto;
	add.onclick = e => {
		e.stopImmediatePropagation();
		if (nova.value) {
			editar(c => adicionarSkill(c, escopo, Number(nova.value), teto));
		}
	};

	// As que o personagem tem e o Bot ainda nao usa, com o motivo (nunca fingir execucao).
	const fora = skills.filter(s => !s.aceita).map(s => s.nome);
	const naoAceitas = caixa.querySelector('.bm-nao-aceitas');
	naoAceitas.textContent = fora.length
		? 'O Bot ainda não usa sozinho: ' + fora.join(', ') + '. Você continua podendo usá-las na mão.'
		: '';
}

function desenharEscopoDaSkill(skillId, regra, monstros, editar) {
	const det = criar('details', 'bm-skill-escopo');
	const resumo = criar(
		'summary',
		'',
		regra.especies === null ? 'Em todos os monstros' : 'Só em ' + regra.especies.length + ' monstro(s)'
	);
	det.appendChild(resumo);
	det.open = _escoposAbertos.has(skillId);
	det.addEventListener('toggle', () => (det.open ? _escoposAbertos.add(skillId) : _escoposAbertos.delete(skillId)));
	const todos = criar('label', 'bm-linha');
	const cTodos = criar('input');
	cTodos.type = 'checkbox';
	cTodos.checked = regra.especies === null;
	cTodos.onchange = () => editar(c => definirEscopoDaSkill(c, skillId, cTodos.checked ? null : []));
	todos.appendChild(cTodos);
	todos.appendChild(criar('span', '', 'Todos'));
	det.appendChild(todos);
	for (const m of monstros) {
		const l = criar('label', 'bm-linha');
		const cx = criar('input');
		cx.type = 'checkbox';
		cx.disabled = regra.especies === null;
		cx.checked = regra.especies !== null && regra.especies.includes(m.especie);
		cx.onchange = () =>
			editar(c => {
				const atual = (c.skills.porSkill[String(skillId)] || {}).especies || [];
				const prox = cx.checked ? [...new Set([...atual, m.especie])] : atual.filter(x => x !== m.especie);
				return definirEscopoDaSkill(c, skillId, prox);
			});
		l.appendChild(cx);
		const n = criar('span', '', m.nome);
		n.setAttribute('translate', 'no');
		l.appendChild(n);
		det.appendChild(l);
	}
	return det;
}
