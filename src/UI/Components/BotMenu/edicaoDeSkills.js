/**
 * UI/Components/BotMenu/edicaoDeSkills.js
 *
 * A EDICAO DAS LISTAS DE SKILLS DO BOT (Fase 6, 07/10/2026), sem DOM: funcoes
 * puras sobre a config v1 (`servidor/bot/config-do-bot.ts`). A janela so
 * desenha e chama estas funcoes dentro de `estado.editar(...)`.
 *
 * Semantica (04 secao 2), a mesma do servidor:
 * - Geral: lista ordenada padrao;
 * - Por Skill: `ativa` e escopo de especies (null = todas) - filtra as DUAS listas;
 * - Por Monstro: herdar a Geral OU lista propria (vazia = nenhuma skill para a especie);
 * - remover e persistente: nada aqui repovoa lista.
 *
 * This file is part of the ragidle fork of ROBrowser.
 */

/** A lista de um escopo: 'geral' ou a especie (numero) com lista propria. */
function lerLista(config, escopo) {
	if (escopo === 'geral') {
		return config.skills.geral;
	}
	const regra = config.skills.porMonstro[String(escopo)];
	return regra && regra.herdar === false ? regra.lista : null;
}

function comLista(config, escopo, lista) {
	if (escopo === 'geral') {
		return { ...config, skills: { ...config.skills, geral: lista } };
	}
	return {
		...config,
		skills: { ...config.skills, porMonstro: { ...config.skills.porMonstro, [String(escopo)]: { herdar: false, lista } } }
	};
}

export function adicionarSkill(config, escopo, skillId, teto) {
	const lista = lerLista(config, escopo) || [];
	if (lista.some(e => e.skillId === skillId) || (typeof teto === 'number' && lista.length >= teto)) {
		return config;
	}
	return comLista(config, escopo, [...lista, { skillId, nivel: 'aprendido' }]);
}

export function removerSkill(config, escopo, skillId) {
	const lista = lerLista(config, escopo) || [];
	return comLista(
		config,
		escopo,
		lista.filter(e => e.skillId !== skillId)
	);
}

/** Sobe (-1) ou desce (+1) uma entrada; nos extremos nada muda. */
export function moverSkill(config, escopo, skillId, delta) {
	const lista = [...(lerLista(config, escopo) || [])];
	const i = lista.findIndex(e => e.skillId === skillId);
	const j = i + delta;
	if (i < 0 || j < 0 || j >= lista.length) {
		return config;
	}
	[lista[i], lista[j]] = [lista[j], lista[i]];
	return comLista(config, escopo, lista);
}

/** `nivel`: 'aprendido' ou inteiro (o servidor valida contra o aprendido). */
export function definirNivel(config, escopo, skillId, nivel) {
	const lista = lerLista(config, escopo) || [];
	return comLista(
		config,
		escopo,
		lista.map(e => (e.skillId === skillId ? { ...e, nivel } : e))
	);
}

export function definirSkillAtiva(config, skillId, ativa) {
	const atual = config.skills.porSkill[String(skillId)] || { ativa: true, especies: null };
	return {
		...config,
		skills: { ...config.skills, porSkill: { ...config.skills.porSkill, [String(skillId)]: { ...atual, ativa } } }
	};
}

/** Escopo Por Skill: `especies` null = todas; lista = so estas. */
export function definirEscopoDaSkill(config, skillId, especies) {
	const atual = config.skills.porSkill[String(skillId)] || { ativa: true, especies: null };
	return {
		...config,
		skills: { ...config.skills, porSkill: { ...config.skills.porSkill, [String(skillId)]: { ...atual, especies } } }
	};
}

/** Por Monstro: lista propria (comecando VAZIA, nunca copiada em silencio) ou de volta a Geral. */
export function usarListaPropria(config, especie) {
	if (lerLista(config, especie) !== null) {
		return config;
	}
	return comLista(config, especie, []);
}

export function herdarGeral(config, especie) {
	const porMonstro = { ...config.skills.porMonstro };
	delete porMonstro[String(especie)];
	return { ...config, skills: { ...config.skills, porMonstro } };
}

/**
 * A lista EFETIVA de uma especie, como o servidor a calcula (para a tela
 * mostrar o que vai valer e o que foi filtrado, com o motivo).
 */
export function listaEfetiva(config, especie) {
	const propria = lerLista(config, especie);
	const base = propria !== null ? propria : config.skills.geral;
	return base.map(e => {
		const r = config.skills.porSkill[String(e.skillId)];
		let filtrada = null;
		if (r && r.ativa === false) {
			filtrada = 'desligada';
		} else if (r && Array.isArray(r.especies) && !r.especies.includes(especie)) {
			filtrada = 'fora do escopo';
		}
		return { ...e, filtrada };
	});
}

export { lerLista };
