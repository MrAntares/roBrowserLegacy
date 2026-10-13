// Mutacao somente na memoria do Vitest: nunca altera o cliente servido pelo Vite.
// A dica em portugues do icone das pocoes de ASPD (D-1989).
// Uso: RAG_MUTANTE_POCAO=<nome> npx vitest run --config tests/mutantes/pocao-de-aspd-icone.config.mjs
import base from '../../vite.config.js';

const ALVO = 'src/DB/Status/StatusInfoPtBr.js';
const mutantes = {
	semConcentracao: ["\t'Concentration Potion': 'Poção da Concentração',\n", ''],
	semFuria: ["\t'Berserk Potion': 'Poção da Fúria Selvagem',\n", ''],
	despertarTrocado: ["'Awakening Potion': 'Poção do Despertar'", "'Awakening Potion': 'Poção da Concentração'"],
	efeitoEmIngles: ["\t'Increases ASPD': 'Aumenta a velocidade de ataque'\n", '']
};
const mutante = mutantes[process.env.RAG_MUTANTE_POCAO];
if (!mutante) throw new Error(`Escolha RAG_MUTANTE_POCAO: ${Object.keys(mutantes).join(', ')}.`);

export default {
	...base,
	plugins: [
		{
			name: 'pocao-de-aspd-somente-em-memoria',
			enforce: 'pre',
			transform(codigo, id) {
				if (!id.replaceAll('\\', '/').endsWith(ALVO)) return null;
				const texto = codigo.replace(/\r\n/g, '\n');
				if (texto.split(mutante[0]).length !== 2) throw new Error('Mutante nao casa exatamente uma vez.');
				return texto.replace(mutante[0], mutante[1]);
			}
		}
	],
	test: { ...base.test, include: ['tests/ui/pocaoDeAspdIcone.test.js'] }
};
