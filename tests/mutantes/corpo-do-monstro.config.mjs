// Mutacao somente na memoria do Vitest: nunca altera o cliente servido pelo Vite.
// O tempo do corpo do monstro morto (bug #9 de 13/10/2026).
// Uso: RAG_MUTANTE_CORPO=<nome> npx vitest run --config tests/mutantes/corpo-do-monstro.config.mjs
// O ramo do VT.DEAD em Entity.js e vigiado pelo portao de fonte do mesmo teste (le o disco).
import base from '../../vite.config.js';

const ALVO = 'src/Renderer/Entity/tempoDoCorpo.js';
const mutantes = {
	monstroComOsCinco: ['return ehMonstro ? FADE_DO_CORPO_DO_MONSTRO_MS : FADE_DO_CORPO_DO_ROBROWSER_MS;', 'return FADE_DO_CORPO_DO_ROBROWSER_MS;'],
	todosComUmEMeio: ['return ehMonstro ? FADE_DO_CORPO_DO_MONSTRO_MS : FADE_DO_CORPO_DO_ROBROWSER_MS;', 'return FADE_DO_CORPO_DO_MONSTRO_MS;'],
	jogadorSome: ['if (ehJogador || ehWug) {', 'if (ehWug) {'],
	wugSome: ['if (ehJogador || ehWug) {', 'if (ehJogador) {'],
	fadeVoltaACinco: ['export const FADE_DO_CORPO_DO_MONSTRO_MS = 1500;', 'export const FADE_DO_CORPO_DO_MONSTRO_MS = 5000;']
};
const mutante = mutantes[process.env.RAG_MUTANTE_CORPO];
if (!mutante) throw new Error(`Escolha RAG_MUTANTE_CORPO: ${Object.keys(mutantes).join(', ')}.`);

export default {
	...base,
	plugins: [
		{
			name: 'corpo-do-monstro-somente-em-memoria',
			enforce: 'pre',
			transform(codigo, id) {
				if (!id.replaceAll('\\', '/').endsWith(ALVO)) return null;
				const texto = codigo.replace(/\r\n/g, '\n');
				if (texto.split(mutante[0]).length !== 2) throw new Error('Mutante nao casa exatamente uma vez.');
				return texto.replace(mutante[0], mutante[1]);
			}
		}
	],
	test: { ...base.test, include: ['tests/renderer/corpoDoMonstroSomeLogo.test.js'] }
};
