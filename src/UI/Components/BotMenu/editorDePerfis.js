/**
 * UI/Components/BotMenu/editorDePerfis.js
 *
 * O DESENHO da aba Perfis do menu do Bot (Fase 9, 08/10/2026). Morava em `editorDeArmazem.js`; a secao
 * Armazem saiu do menu nos ajustes do dono de 09/10/2026 e os Perfis ganharam arquivo proprio. Perfis sao
 * verbos IMEDIATOS (salvar a config confirmada, aplicar, renomear, excluir): o servidor confirma cada um;
 * aplicar nunca liga o Bot.
 *
 * This file is part of the ragidle fork of ROBrowser.
 */

const NOME_DA_POSTURA = Object.freeze({
	tank: 'Tanque',
	'melee-dps': 'Dano corpo a corpo',
	'ranged-dps': 'Dano à distância',
	'ranged-buff-ataque': 'Suporte e ataque',
	'ranged-buff': 'Só suporte'
});

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
 * @param {Element} raiz a secao Perfis
 * @param {{perfis: Array, perfilAtivo: string|null, pendente: boolean, nomeMaximo: number}} dados
 * @param {{salvar: (nome: string) => void, aplicar: (nome: string) => void, renomear: (de: string, para: string) => void, excluir: (nome: string) => void}} verbos
 */
export function desenharPerfis(raiz, dados, verbos) {
	const ul = raiz.querySelector('.bm-perfis');
	ul.innerHTML = '';
	for (const p of dados.perfis || []) {
		const li = criar('li', 'bm-item bm-perfil' + (p.nome === dados.perfilAtivo ? ' is-ativo' : ''));
		li.setAttribute('data-perfil', p.nome);
		const n = criar('span', 'bm-item-nome', p.nome);
		n.setAttribute('translate', 'no');
		li.appendChild(n);
		li.appendChild(criar('span', 'bm-tipo', NOME_DA_POSTURA[p.postura] || p.postura));
		li.appendChild(botao('bm-perfil-aplicar', 'Usar', 'Usar este perfil', () => verbos.aplicar(p.nome), dados.pendente));
		li.appendChild(
			botao('bm-perfil-renomear', 'Renomear', 'Renomear', () => {
				const entrada = raiz.querySelector('.bm-perfil-nome');
				const para = entrada.value.trim();
				if (para) {
					entrada.value = '';
					verbos.renomear(p.nome, para);
				}
			}, dados.pendente)
		);
		li.appendChild(botao('bm-remove', '×', 'Excluir perfil', () => verbos.excluir(p.nome), dados.pendente));
		ul.appendChild(li);
	}
	raiz.querySelector('.bm-sem-perfil').hidden = (dados.perfis || []).length > 0;
	const entrada = raiz.querySelector('.bm-perfil-nome');
	entrada.maxLength = dados.nomeMaximo || 24;
	const salvar = raiz.querySelector('.bm-perfil-salvar');
	salvar.disabled = !!dados.pendente;
	salvar.onclick = e => {
		e.stopImmediatePropagation();
		const nome = entrada.value.trim();
		if (nome) {
			entrada.value = '';
			verbos.salvar(nome);
		}
	};
}
