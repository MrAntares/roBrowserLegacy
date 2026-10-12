// Mutacao somente na memoria do Vitest: nunca altera o arquivo da ponte.
//
// A FAIXA DE DESTINOS DA PONTE (C4 do multiprocesso, 07/10/2026). Cada mutante
// e um jeito de a tranca de D-540 abrir mais do que a lista diz: a faixa que
// vaza uma porta para cada lado, a de outro host que passa, o teto que some,
// a faixa invertida aceita. A ponte de verdade (o processo do teste) le o
// arquivo do disco e nao ve a mutacao: quem mata e a metade pura do teste.
//
//   RAG_MUTANTE_FAIXA=<nome> npx vitest run --config tests/mutantes/faixa-de-alvos.config.mjs
//
// Um mutante MORTO faz a corrida reprovar.
import base from '../../vite.config.js';

const ALVO = 'wsproxyAlvos.js';

export const mutantes = {
	// a faixa vaza uma porta abaixo
	vazaAbaixo: [ALVO, 'portaPedida >= f.de && portaPedida <= f.ate', 'portaPedida >= f.de - 1 && portaPedida <= f.ate'],
	// a faixa vaza uma porta acima
	vazaAcima: [ALVO, 'portaPedida >= f.de && portaPedida <= f.ate', 'portaPedida >= f.de && portaPedida <= f.ate + 1'],
	// a faixa vale para qualquer host
	qualquerHost: [ALVO, 'f.host === host && portaPedida', 'portaPedida'],
	// sem teto: 1-65535 vira proxy aberto no loopback
	semTeto: [ALVO, '\t\tif (ate - de + 1 > MAIOR_FAIXA) {', '\t\tif (false) {'],
	// a faixa invertida passa (e nunca casa: a lista mente)
	invertidaPassa: [ALVO, '\t\tif (ate < de) throw new Error', '\t\tif (false) throw new Error'],
	// a porta zero e acima de 65535 passam
	semLimiteDePorta: [ALVO, '\tif (n < 1 || n > 65535) throw new Error', '\tif (false) throw new Error'],
	// a entrada exata deixa de valer
	exatoIgnorado: [ALVO, '\tif (alvos.exatos.has(`${host}:${portaPedida}`)) return true;', '']
};

const nome = process.env.RAG_MUTANTE_FAIXA;
const mutante = mutantes[nome];
if (nome && !mutante) throw new Error(`Escolha RAG_MUTANTE_FAIXA: ${Object.keys(mutantes).join(', ')}.`);

export default {
	...base,
	plugins: [
		...(mutante
			? [
					{
						name: 'faixa-de-alvos-somente-em-memoria',
						enforce: 'pre',
						transform(codigo, id) {
							if (!id.replaceAll('\\', '/').endsWith(mutante[0])) return null;
							const normalizado = codigo.replaceAll('\r\n', '\n');
							if (normalizado.split(mutante[1]).length !== 2) throw new Error(`Mutante ${nome} nao casa exatamente uma vez.`);
							return normalizado.replace(mutante[1], mutante[2]);
						}
					}
				]
			: [])
	],
	test: { ...base.test, include: ['tests/wsproxy-faixa-de-alvos.test.js'] }
};

// Rodar todos (bash):
//   for m in $(node -e "import('./tests/mutantes/faixa-de-alvos.config.mjs').then(x=>console.log(Object.keys(x.mutantes).join(' ')))"); do
//     RAG_MUTANTE_FAIXA=$m npx vitest run --config tests/mutantes/faixa-de-alvos.config.mjs >/dev/null 2>&1 && echo "SOBREVIVEU $m" || echo "morto $m"; done
