/**
 * UI/Components/BotMenu/editorDoRodizio.js
 *
 * O RODIZIO da secao Ataque (ajustes do dono, 09/10/2026): o jogador ve de cara quais habilidades o Bot usa e
 * em que ordem (o Bot faz 1, 2, 3, 1, 2, 3 na ordem da lista geral, pulando a que esta em recarga), e liga ou
 * desliga cada uma. Desligar e `skills.porSkill[id].ativa = false`: a posicao na lista fica, e religar devolve
 * a skill ao mesmo lugar. Abaixo, as outras habilidades que o Bot sabe usar, com o "Usar" que as poe no fim.
 *
 * So desenho: toda mudanca passa por `editar(fn)` com as funcoes puras de `edicaoDeSkills.js` (a mesma
 * semantica do servidor). Nivel fixo, escopo por skill e lista por monstro ficam no Avancado da secao.
 *
 * This file is part of the ragidle fork of ROBrowser.
 */
import { adicionarSkill, definirSkillAtiva, moverSkill, removerSkill } from './edicaoDeSkills.js';

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

function icone(chave) {
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

/**
 * @param {Element} raiz o `.bm-rodizio-caixa` da secao Ataque
 * @param {{config: object, skills: Array|null, teto: number}} dados
 * @param {(fn: (c: object) => object) => void} editar
 */
export function desenharRodizio(raiz, dados, editar) {
	const temSkills = Array.isArray(dados.skills);
	raiz.hidden = !temSkills;
	const ol = raiz.querySelector('.bm-rodizio');
	const fora = raiz.querySelector('.bm-rodizio-fora');
	ol.innerHTML = '';
	fora.innerHTML = '';
	if (!temSkills) {
		return;
	}
	const { config, skills } = dados;
	const porId = new Map(skills.map(s => [s.skillId, s]));
	const geral = config.skills.geral || [];
	const porSkill = config.skills.porSkill || {};

	geral.forEach((e, i) => {
		const s = porId.get(e.skillId) || null;
		const nome = s ? s.nome : '#' + e.skillId;
		const regra = porSkill[String(e.skillId)] || { ativa: true, especies: null };
		const ativa = regra.ativa !== false;
		const li = criar('li', 'bm-rodizio-item' + (ativa ? '' : ' is-desligada'));
		li.setAttribute('data-skill', String(e.skillId));
		li.appendChild(criar('span', 'bm-rodizio-ordem', String(i + 1)));
		li.appendChild(icone(s && s.chave));
		const textos = criar('span', 'bm-rodizio-textos');
		const n = criar('b', 'bm-rodizio-nome', nome);
		n.setAttribute('translate', 'no');
		textos.appendChild(n);
		const detalhe = criar('small', 'bm-rodizio-detalhe');
		const aprendido = s ? s.aprendido : null;
		detalhe.appendChild(
			criar('span', '', e.nivel === 'aprendido' ? 'Nv. ' + (aprendido === null ? '?' : aprendido) : 'Nv. ' + e.nivel + ' fixo')
		);
		if (Array.isArray(regra.especies)) {
			detalhe.appendChild(criar('span', '', 'Só em ' + regra.especies.length + ' monstro(s)'));
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
		caixa.onchange = () => editar(c => definirSkillAtiva(c, e.skillId, caixa.checked));
		chave.appendChild(caixa);
		const trilho = criar('span', 'bm-interruptor-trilho');
		trilho.setAttribute('aria-hidden', 'true');
		chave.appendChild(trilho);
		li.appendChild(chave);

		const acoes = criar('span', 'bm-rodizio-acoes');
		acoes.appendChild(botao('bm-sobe', '↑', 'Mover para cima', () => editar(c => moverSkill(c, 'geral', e.skillId, -1)), i === 0));
		acoes.appendChild(
			botao('bm-desce', '↓', 'Descer', () => editar(c => moverSkill(c, 'geral', e.skillId, 1)), i === geral.length - 1)
		);
		acoes.appendChild(botao('bm-remove', '×', 'Tirar do rodízio', () => editar(c => removerSkill(c, 'geral', e.skillId))));
		li.appendChild(acoes);
		ol.appendChild(li);
	});
	raiz.querySelector('.bm-rodizio-vazio').hidden = geral.length > 0;

	// AS DE FORA: as que o Bot sabe usar sozinho e ainda nao estao no rodizio.
	const naLista = new Set(geral.map(e => e.skillId));
	const outras = skills.filter(s => s.aceita && !s.suporte && !naLista.has(s.skillId));
	for (const s of outras) {
		const li = criar('li', 'bm-rodizio-fora-item');
		li.setAttribute('data-skill', String(s.skillId));
		li.appendChild(icone(s.chave));
		const n = criar('span', 'bm-rodizio-nome', s.nome);
		n.setAttribute('translate', 'no');
		li.appendChild(n);
		li.appendChild(
			botao(
				'bm-rodizio-usar',
				'+ Usar',
				'Pôr ' + s.nome + ' no rodízio',
				() => editar(c => adicionarSkill(c, 'geral', s.skillId, dados.teto)),
				geral.length >= dados.teto
			)
		);
		fora.appendChild(li);
	}
	raiz.querySelector('.bm-rodizio-outras').hidden = outras.length === 0;

	// As que o personagem tem e o Bot ainda nao usa sozinho, com o motivo (nunca fingir execucao).
	const naoUsa = skills.filter(s => !s.aceita && !s.suporte).map(s => s.nome);
	const aviso = raiz.querySelector('.bm-rodizio-nao-aceitas');
	aviso.hidden = naoUsa.length === 0;
	aviso.textContent = naoUsa.length
		? 'O Bot ainda não usa sozinho: ' + naoUsa.join(', ') + '. Você continua podendo usá-las na mão.'
		: '';
}
