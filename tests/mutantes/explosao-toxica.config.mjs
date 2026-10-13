// Mutacao somente na memoria do Vitest: nunca altera o cliente servido pelo Vite.
//
// A EXPLOSAO TOXICA (D-2326, pedido do dono de 13/10/2026). Cada mutante e um jeito de o cliente voltar a esconder o
// motivo: a causa 200 sem texto (o generico "Nao foi possivel usar a habilidade."), o texto errado, ou o status do Bot
// que perde o "nenhuma habilidade pega neste alvo" (ou o espalha para outro codigo).
//
//   RAG_MUTANTE_EXPLOSAO=<nome> npx vitest run --config tests/mutantes/explosao-toxica.config.mjs
//
// Todos de uma vez (bash), contando o mutante que NAO casa como invalido:
//   for m in causaSemTexto causaTrocada textoGeral fraseIgnoraDetalhe explicacaoIgnoraDetalhe detalheSemCodigo; do
//     RAG_MUTANTE_EXPLOSAO=$m npx vitest run --config tests/mutantes/explosao-toxica.config.mjs > /tmp/m.log 2>&1;
//     if grep -q "nao casa" /tmp/m.log; then echo "$m INVALIDO"; elif grep -q "Tests .*failed" /tmp/m.log; then echo "$m morto"; else echo "$m SOBREVIVEU"; fi; done
import base from '../../vite.config.js';

const FALHA = 'src/Engine/MapEngine/textoDaFalhaDeSkill.js';
const STATUS = 'src/UI/Components/BotMenu/estadoDoBot.js';

const mutantes = {
	// a causa 200 cai no generico (o comportamento de antes)
	causaSemTexto: [FALHA, '\t\tcase CAUSA_ALVO_COM_HP_ALTO:\n\t\t\treturn TEXTO_ALVO_COM_HP_ALTO;\n', ''],
	// a causa nossa colide com outra
	causaTrocada: [FALHA, 'export const CAUSA_ALVO_COM_HP_ALTO = 200;', 'export const CAUSA_ALVO_COM_HP_ALTO = 76;'],
	// o texto do motivo vira o generico
	textoGeral: [FALHA, "export const TEXTO_ALVO_COM_HP_ALTO = 'Explosão Tóxica: o alvo precisa estar com 3/4 do HP ou menos.';", "export const TEXTO_ALVO_COM_HP_ALTO = 'Não foi possível usar a habilidade.';"],
	// a frase curta ignora o detalhe
	fraseIgnoraDetalhe: [STATUS, '\tconst refinada = porDetalhe(FRASE_POR_DETALHE, status);', '\tconst refinada = undefined;'],
	// a explicacao ignora o detalhe
	explicacaoIgnoraDetalhe: [STATUS, '\tconst refinada = porDetalhe(EXPLICACAO_POR_DETALHE, status);', '\tconst refinada = undefined;'],
	// o detalhe vale em qualquer codigo
	detalheSemCodigo: [STATUS, "\treturn status.detalhe ? tabela[status.codigo + ':' + status.detalhe] : undefined;", "\treturn status.detalhe ? tabela['sem-acao-viavel:' + status.detalhe] : undefined;"]
};
const mutante = mutantes[process.env.RAG_MUTANTE_EXPLOSAO];
if (!mutante) throw new Error(`Escolha RAG_MUTANTE_EXPLOSAO: ${Object.keys(mutantes).join(', ')}.`);

export default {
	...base,
	plugins: [
		{
			name: 'explosao-toxica-somente-em-memoria',
			enforce: 'pre',
			transform(codigo, id) {
				if (!id.replaceAll('\\', '/').endsWith(mutante[0])) return null;
				const normalizado = codigo.replaceAll('\r\n', '\n');
				if (normalizado.split(mutante[1]).length !== 2) throw new Error('Mutante nao casa exatamente uma vez.');
				return normalizado.replace(mutante[1], mutante[2]);
			}
		}
	],
	test: { ...base.test, include: ['tests/ui/explosaoToxica.test.js'] }
};

export const NOMES = Object.keys(mutantes);
