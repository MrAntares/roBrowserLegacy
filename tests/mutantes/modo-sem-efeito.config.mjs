// Mutacao somente na memoria do Vitest: nunca altera o cliente servido pelo Vite.
// Frente P (13/10/2026): na postura "So suporte" a aba Ataque diz que o modo de ataque nao vale.
// Uso: RAG_MUTANTE_MODO_SEM_EFEITO=<nome> npx vitest run --config tests/mutantes/modo-sem-efeito.config.mjs
// Todos: for m in semAviso semApagar emToda; do RAG_MUTANTE_MODO_SEM_EFEITO=$m npx vitest run --config tests/mutantes/modo-sem-efeito.config.mjs; done
import base from '../../vite.config.js';

const ALVO = 'src/UI/Components/BotMenu/BotMenu.js';
const mutantes = {
	// o aviso nunca aparece
	semAviso: ["\tel('.bm-modo-sem-efeito').hidden = !soSuporte;", "\tel('.bm-modo-sem-efeito').hidden = true;"],
	// o modo de ataque nao fica apagado
	semApagar: ["\tel('.bm-modo').classList.toggle('is-sem-efeito', soSuporte);", ''],
	// o aviso sai em toda postura de apoio (o "Suporte e ataque" ataca)
	emToda: ["\tconst soSuporte = p.tipo === 'ranged-buff';", "\tconst soSuporte = p.tipo.startsWith('ranged-buff');"]
};
const mutante = mutantes[process.env.RAG_MUTANTE_MODO_SEM_EFEITO];
if (!mutante) throw new Error(`Escolha RAG_MUTANTE_MODO_SEM_EFEITO: ${Object.keys(mutantes).join(', ')}.`);

export default {
	...base,
	plugins: [
		{
			name: 'modo-sem-efeito-somente-em-memoria',
			enforce: 'pre',
			transform(codigo, id) {
				if (!id.replaceAll('\\', '/').endsWith(ALVO)) return null;
				const texto = codigo.replace(/\r\n/g, '\n');
				if (texto.split(mutante[0]).length !== 2) throw new Error('Mutante nao casa exatamente uma vez.');
				return texto.replace(mutante[0], mutante[1]);
			}
		}
	],
	test: { ...base.test, include: ['tests/ui/modoSemEfeitoNoSoSuporte.test.js'] }
};
