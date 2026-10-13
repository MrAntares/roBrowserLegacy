// A bateria do ABATE PROPRIO na Analise de Caca (D-2322, 13/10/2026 - pedido do
// dono: "Analise contando monstros que nao estou cacando"). Mutacao somente na
// memoria do Vitest: nunca altera o cliente servido pelo Vite.
//
//   RAG_MUTANTE_ABATE=<id> npx vitest run --config tests/mutantes/abate-proprio.config.mjs
//
// Cada mutante tem de MATAR pelo menos um caso de
// `tests/ui/analiseContaSoOAbateProprio.test.js`.
import base from '../../vite.config.js';

const ENTITY = 'src/Engine/MapEngine/Entity.js';
const mutantes = {
	// ninguem ouve o ZC_RAGIDLE_ABATE: a Analise para de contar
	semGancho: [ENTITY, 'Network.hookPacket(PACKET.ZC.RAGIDLE_ABATE, onAbateProprio);', ''],
	// o defeito de volta: o VANISH de morte (de todo mob do mapa) volta a contar
	vanishVoltaAContar: [
		ENTITY,
		'if (pkt.type === Entity.VT.DEAD) {',
		"if (pkt.type === Entity.VT.DEAD) { if (entity.objecttype === Entity.TYPE_MOB && Session.Entity) registrarAbate(Session.Entity.GID, DB.getMonsterName(entity.job), entity.job);"
	],
	// o nome distinto do homonimo (D-1870) some: a tabela do cliente diz so o nome base
	semNomeDoServidor: [ENTITY, 'const nome = doServidor || DB.getMonsterName(pkt.mobId);', 'const nome = DB.getMonsterName(pkt.mobId);'],
	// sem entidade, o nome de reserva some (o bicho fora da vista vira balde)
	semReserva: [ENTITY, 'const nome = doServidor || DB.getMonsterName(pkt.mobId);', "const nome = doServidor;"],
	// o "Unknown" da tabela vira uma linha no ranking
	semBalde: [ENTITY, "nome === 'Unknown' ? '' : nome, pkt.mobId);", 'nome, pkt.mobId);'],
	// o avatar recebe o GID no lugar do id do monstro
	idErrado: [ENTITY, "nome === 'Unknown' ? '' : nome, pkt.mobId);", "nome === 'Unknown' ? '' : nome, pkt.GID);"]
};
const mutante = mutantes[process.env.RAG_MUTANTE_ABATE];
if (!mutante) throw new Error('Escolha RAG_MUTANTE_ABATE: ' + Object.keys(mutantes).join(', ') + '.');

export default {
	...base,
	plugins: [{
		name: 'abate-proprio-somente-em-memoria',
		enforce: 'pre',
		transform(codigo, id) {
			if (!id.replaceAll('\\', '/').endsWith(mutante[0])) return null;
			if (codigo.split(mutante[1]).length !== 2) throw new Error('Mutante nao casa exatamente uma vez.');
			return codigo.replace(mutante[1], mutante[2]);
		}
	}],
	test: { ...base.test, include: ['tests/ui/analiseContaSoOAbateProprio.test.js'] }
};
