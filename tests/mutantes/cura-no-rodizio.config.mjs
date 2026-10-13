// Mutacao somente na memoria do Vitest: nunca altera o cliente servido pelo Vite.
// A cura no rodizio do Bot (D-2325, 13/10/2026): a Cura e o Santuario aceitos no ataque aparecem no rodizio, com o
// aviso de contra quem saem.
// Uso: RAG_MUTANTE_CURA_RODIZIO=<nome> npx vitest run --config tests/mutantes/cura-no-rodizio.config.mjs
// Todos: for m in filtroAntigo semAceita semAvisoNasOutras semAvisoNaLinha avisoTrocado semMapaDoAviso; do ...; done
import base from '../../vite.config.js';

const ALVO = 'src/UI/Components/BotMenu/editorDoRodizio.js';
const mutantes = {
	// a Cura volta ao rodizio e fica DUAS vezes no menu (o cartao do Jhow, bug #12, e o rodizio; juncao de 13/10)
	filtroAntigo: [
		'const outras = skills.filter(s => s.aceita && !s.suporte && !naLista.has(s.skillId));',
		"const outras = skills.filter(s => s.aceita && s.suporte !== 'buff' && !naLista.has(s.skillId));"
	],
	// o que o servidor recusa entra no rodizio
	semAceita: [
		'const outras = skills.filter(s => s.aceita && !s.suporte && !naLista.has(s.skillId));',
		'const outras = skills.filter(s => !s.suporte && !naLista.has(s.skillId));'
	],
	// as outras sem o aviso
	semAvisoNasOutras: ["\t\tconst soContra = avisoSoContra(s);\n\t\tif (soContra) {\n\t\t\tconst textos", "\t\tconst soContra = avisoSoContra(s);\n\t\tif (false) {\n\t\t\tconst textos"],
	// a linha do rodizio sem o aviso
	semAvisoNaLinha: ["\t\tif (soContra) {\n\t\t\tdetalhe.appendChild(criar('span', 'bm-rodizio-so-contra', soContra));\n\t\t}", ''],
	// o Santuario diz so morto-vivo (o Demonio some)
	avisoTrocado: ["\timpuro: 'Só contra morto-vivo e Demônio'", "\timpuro: 'Só contra morto-vivo'"],
	// o aviso ignora o servidor e sai em toda skill aceita
	semMapaDoAviso: ['\treturn (s && AVISO_SO_CONTRA[s.soContra]) || null;', "\treturn s ? 'Só contra morto-vivo' : null;"]
};
const mutante = mutantes[process.env.RAG_MUTANTE_CURA_RODIZIO];
if (!mutante) throw new Error(`Escolha RAG_MUTANTE_CURA_RODIZIO: ${Object.keys(mutantes).join(', ')}.`);

export default {
	...base,
	plugins: [
		{
			name: 'cura-no-rodizio-somente-em-memoria',
			enforce: 'pre',
			transform(codigo, id) {
				if (!id.replaceAll('\\', '/').endsWith(ALVO)) return null;
				const texto = codigo.replace(/\r\n/g, '\n');
				if (texto.split(mutante[0]).length !== 2) throw new Error('Mutante nao casa exatamente uma vez.');
				return texto.replace(mutante[0], mutante[1]);
			}
		}
	],
	test: { ...base.test, include: ['tests/ui/curaNoRodizioDoBot.test.js'] }
};
