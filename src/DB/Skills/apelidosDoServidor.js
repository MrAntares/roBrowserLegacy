/**
 * DB/Skills/apelidosDoServidor.js
 *
 * N4 da auditoria de tela: o servidor manda o NOME do rAthena e o cliente
 * (roBrowser) grafa alguns nomes diferente em `SkillConst`/`SkillInfo.Name`.
 * Quem monta "nome -> id" pelo nome do cliente nao acha o id e falha calado:
 * a Piada Congelante (BA_FROSTJOKER, id 318) nao ia para a barra de atalhos.
 *
 * Varredura (feita contra db/pre-re/skill_db.yml x SkillConst.js, 1.223
 * skills): o UNICO nome de skill de jogador que diverge e BA_FROSTJOKER. O
 * resto que o servidor tem e o cliente nao (NPC_*, CASH_*, ALL_EQSWITCH...) nao
 * tem id no `SkillInfo` e nao vai a barra. WL_FREEZE_SP/WL_ENDMARK sao dois
 * nomes de cliente para o MESMO id 2232 (3a classe, fora do pre-re): nao e
 * divergencia de nome do servidor, e o teste de contrato os confere.
 *
 * A tabela PT-BR do cliente continua com o nome do CLIENTE: este arquivo so
 * traduz na fronteira com o servidor, nunca renomeia nada do cliente.
 */

/** nome do servidor (rAthena) -> nome do cliente (`SkillInfo.Name`). */
export const APELIDOS_SERVIDOR_PARA_CLIENTE = Object.freeze({
	BA_FROSTJOKER: 'BA_FROSTJOKE'
});

/**
 * Mapa nome -> id numerico a partir do `SkillInfo`, com o nome do cliente E o
 * do servidor apontando para o mesmo id.
 *
 * @param {Object} skillInfo o `SkillInfo` (id numerico -> { Name })
 * @returns {Map<string, number>}
 */
export function montarMapaNomeParaId(skillInfo) {
	const mapa = new Map(
		Object.entries(skillInfo)
			.filter(([, info]) => info && info.Name)
			.map(([numericId, info]) => [info.Name, Number(numericId)])
	);
	for (const [nomeDoServidor, nomeDoCliente] of Object.entries(APELIDOS_SERVIDOR_PARA_CLIENTE)) {
		if (mapa.has(nomeDoCliente) && !mapa.has(nomeDoServidor)) {
			mapa.set(nomeDoServidor, mapa.get(nomeDoCliente));
		}
	}
	return mapa;
}

/**
 * O caminho de volta: id numerico -> nome que o SERVIDOR usa. Parte de um
 * nome do cliente (o de `SkillConst`) e devolve o do servidor quando ha apelido.
 */
export function nomeNoServidor(nomeDoCliente) {
	for (const [nomeDoServidor, nome] of Object.entries(APELIDOS_SERVIDOR_PARA_CLIENTE)) {
		if (nome === nomeDoCliente) {
			return nomeDoServidor;
		}
	}
	return nomeDoCliente;
}
