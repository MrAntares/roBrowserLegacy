/**
 * UI/Components/BotMenu/editorPorSkill.js
 *
 * O "Por habilidade" do Avancado da secao Ataque (Fase 11, mockup do dono de 08/10/2026; no Avancado
 * recolhido desde os ajustes do dono de 09/10/2026, o liga/desliga mora no rodizio da frente):
 * um cartao por habilidade ofensiva que o Bot aceita, com o icone real
 * (`/ragidle/skills/<AEGIS>.png`), o nivel aprendido, a chave "Habilidade
 * ativada", o nivel de uso (- / +) na lista geral, o escopo de alvos (todos
 * ou so os monstros escolhidos) e as fichas dos monstros com o avatar.
 *
 * So desenho: toda mudanca passa por `editar(fn)` com as funcoes puras de
 * `edicaoDeSkills.js`, a mesma semantica do servidor (`ativa` e `especies`
 * filtram as DUAS listas; o nivel e o da entrada na lista geral).
 *
 * This file is part of the ragidle fork of ROBrowser.
 */
import { adicionarSkill, definirEscopoDaSkill, definirNivel, definirSkillAtiva, lerLista } from './edicaoDeSkills.js';

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

function imagem(classe, src) {
	const img = criar('img', classe);
	img.alt = '';
	img.loading = 'lazy';
	img.src = src;
	img.onerror = () => {
		img.style.visibility = 'hidden';
	};
	return img;
}

function botao(classe, texto, titulo, aoClicar, desligado) {
	const b = criar('button', classe, texto);
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
 * @param {Element} raiz o `.bm-por-skill`
 * @param {{config: object, skills: Array|null, monstros: Array, tetoGeral?: number}} dados
 * @param {(fn: (c: object) => object) => void} editar
 */
export function desenharPorSkill(raiz, dados, editar) {
	raiz.innerHTML = '';
	const { config, monstros } = dados;
	const ofensivas = (dados.skills || []).filter(s => s.aceita && !s.suporte);
	if (ofensivas.length === 0) {
		raiz.appendChild(
			criar(
				'p',
				'bm-dica bm-ps-vazio',
				Array.isArray(dados.skills)
					? 'Nenhuma habilidade de ataque que o Bot use sozinho. O Bot luta com o ataque básico.'
					: 'Habilidades automáticas ainda não estão disponíveis neste servidor.'
			)
		);
		return;
	}
	const geral = lerLista(config, 'geral') || [];
	const posicao = new Map(geral.map((e, i) => [e.skillId, i]));
	// Primeiro as da lista geral, na ordem dela; depois as demais.
	ofensivas.sort((a, b) => (posicao.get(a.skillId) ?? 1e9) - (posicao.get(b.skillId) ?? 1e9));
	const nomeDoMonstro = new Map((monstros || []).map(m => [m.especie, m.nome]));
	for (const s of ofensivas) {
		raiz.appendChild(cartaoDaSkill(s, config, geral, nomeDoMonstro, monstros || [], editar, dados.tetoGeral));
	}
}

function cartaoDaSkill(s, config, geral, nomeDoMonstro, monstros, editar, tetoGeral) {
	const regra = config.skills.porSkill[String(s.skillId)] || { ativa: true, especies: null };
	const entrada = geral.find(e => e.skillId === s.skillId) || null;
	const cartao = criar('article', 'bm-ps-cartao');
	cartao.setAttribute('data-skill', String(s.skillId));
	cartao.classList.toggle('is-desligada', regra.ativa === false);

	// CABECA: icone, nome, nivel aprendido, etiquetas e a chave "Habilidade ativada".
	const cabeca = criar('div', 'bm-ps-cabeca');
	cabeca.appendChild(imagem('bm-ps-icone', '/ragidle/skills/' + encodeURIComponent(s.chave || '') + '.png'));
	const textos = criar('div', 'bm-ps-textos');
	const linhaNome = criar('div', 'bm-ps-linha-nome');
	const nome = criar('b', 'bm-ps-nome', s.nome);
	nome.setAttribute('translate', 'no');
	linhaNome.appendChild(nome);
	linhaNome.appendChild(criar('span', 'bm-ps-nv', 'Nv. ' + s.aprendido));
	textos.appendChild(linhaNome);
	const etiquetas = criar('div', 'bm-ps-etiquetas');
	etiquetas.appendChild(criar('span', 'bm-etiqueta', 'Ataque'));
	etiquetas.appendChild(
		criar('span', 'bm-etiqueta' + (entrada ? ' bm-etiqueta--ok' : ''), entrada ? 'No rodízio (' + (geral.indexOf(entrada) + 1) + 'º)' : 'Fora do rodízio')
	);
	textos.appendChild(etiquetas);
	cabeca.appendChild(textos);
	const chave = criar('label', 'bm-chave bm-ps-chave');
	chave.title = 'Habilidade ativada';
	const caixa = criar('input', 'bm-ps-ativa');
	caixa.type = 'checkbox';
	caixa.checked = regra.ativa !== false;
	caixa.setAttribute('aria-label', 'Habilidade ativada: ' + s.nome);
	caixa.onchange = () => editar(c => definirSkillAtiva(c, s.skillId, caixa.checked));
	chave.appendChild(caixa);
	const trilho = criar('span', 'bm-chave-trilho');
	trilho.setAttribute('aria-hidden', 'true');
	trilho.appendChild(criar('span', 'bm-chave-texto'));
	chave.appendChild(trilho);
	cabeca.appendChild(chave);
	cartao.appendChild(cabeca);

	// NIVEL DE USO (o da entrada na lista geral) ou o convite para entrar nela.
	const corpo = criar('div', 'bm-ps-corpo');
	const blocoNivel = criar('div', 'bm-ps-bloco');
	blocoNivel.appendChild(criar('span', 'bm-rotulo', 'Nível de uso'));
	if (entrada) {
		const max = s.aprendido || 1;
		const atual = entrada.nivel === 'aprendido' ? max : Math.min(max, Number(entrada.nivel) || max);
		const passo = criar('div', 'bm-passo');
		const fixar = n => editar(c => definirNivel(c, 'geral', s.skillId, n >= max ? 'aprendido' : n));
		passo.appendChild(botao('bm-passo-menos', '−', 'Diminuir o nível', () => fixar(atual - 1), atual <= 1));
		const valor = criar('output', 'bm-passo-valor', String(atual));
		valor.setAttribute('aria-label', 'Nível de uso');
		passo.appendChild(valor);
		passo.appendChild(botao('bm-passo-mais', '+', 'Aumentar o nível', () => fixar(atual + 1), atual >= max));
		blocoNivel.appendChild(passo);
		blocoNivel.appendChild(
			criar('small', 'bm-dica', entrada.nivel === 'aprendido' ? 'Acompanha o nível aprendido.' : 'Nível fixo.')
		);
	} else {
		const teto = typeof tetoGeral === 'number' ? tetoGeral : 3;
		blocoNivel.appendChild(
			botao(
				'ri-btn ri-btn--sec bm-ps-incluir',
				'Pôr no rodízio',
				'Pôr ' + s.nome + ' no rodízio',
				() => editar(c => adicionarSkill(c, 'geral', s.skillId, teto)),
				geral.length >= teto
			)
		);
	}
	corpo.appendChild(blocoNivel);

	// ESCOPO DE ALVOS: todos ou so os monstros escolhidos (com as fichas).
	const blocoAlvo = criar('div', 'bm-ps-bloco bm-ps-alvos');
	blocoAlvo.appendChild(criar('span', 'bm-rotulo', 'Usar em'));
	const grupo = 'bm-ps-escopo-' + s.skillId;
	const todos = radio(grupo, 'Todos os alvos de combate', regra.especies === null, () =>
		editar(c => definirEscopoDaSkill(c, s.skillId, null))
	);
	const alguns = radio(grupo, 'Monstros selecionados', regra.especies !== null, () =>
		editar(c => definirEscopoDaSkill(c, s.skillId, []))
	);
	todos.classList.add('bm-ps-todos');
	alguns.classList.add('bm-ps-alguns');
	blocoAlvo.appendChild(todos);
	blocoAlvo.appendChild(alguns);
	if (regra.especies !== null) {
		const fichas = criar('ul', 'bm-chips');
		for (const especie of regra.especies) {
			const nomeM = nomeDoMonstro.get(especie) || '#' + especie;
			const li = criar('li', 'bm-chip');
			li.setAttribute('data-especie', String(especie));
			li.appendChild(imagem('bm-chip-avatar', '/ragidle/mobs/' + especie + '.png'));
			const n = criar('span', '', nomeM);
			n.setAttribute('translate', 'no');
			li.appendChild(n);
			li.appendChild(
				botao('bm-chip-tirar', '×', 'Tirar ' + nomeM, () =>
					editar(c => {
						const atual = (c.skills.porSkill[String(s.skillId)] || {}).especies || [];
						return definirEscopoDaSkill(
							c,
							s.skillId,
							atual.filter(x => x !== especie)
						);
					})
				)
			);
			fichas.appendChild(li);
		}
		const faltam = monstros.filter(m => !regra.especies.includes(m.especie));
		const li = criar('li', 'bm-chip bm-chip--add');
		const sel = criar('select', 'bm-ps-add-monstro');
		sel.setAttribute('aria-label', 'Adicionar monstro para ' + s.nome);
		const primeira = criar('option', '', '+ Adicionar monstros');
		primeira.value = '';
		sel.appendChild(primeira);
		for (const m of faltam) {
			const o = criar('option', '', m.nome);
			o.value = String(m.especie);
			sel.appendChild(o);
		}
		sel.disabled = faltam.length === 0;
		sel.onchange = () => {
			const especie = Number(sel.value);
			if (especie) {
				editar(c => {
					const atual = (c.skills.porSkill[String(s.skillId)] || {}).especies || [];
					return definirEscopoDaSkill(c, s.skillId, [...new Set([...atual, especie])]);
				});
			}
		};
		li.appendChild(sel);
		fichas.appendChild(li);
		blocoAlvo.appendChild(fichas);
		if (regra.especies.length === 0) {
			blocoAlvo.appendChild(criar('small', 'bm-dica bm-aviso', 'Nenhum monstro escolhido: o Bot não usa esta habilidade.'));
		}
	}
	corpo.appendChild(blocoAlvo);
	cartao.appendChild(corpo);
	return cartao;
}

function radio(grupo, texto, marcado, aoMarcar) {
	const l = criar('label', 'bm-linha bm-ps-radio');
	const r = criar('input');
	r.type = 'radio';
	r.name = grupo;
	r.checked = marcado;
	r.onchange = () => {
		if (r.checked) {
			aoMarcar();
		}
	};
	l.appendChild(r);
	l.appendChild(criar('span', '', texto));
	return l;
}
