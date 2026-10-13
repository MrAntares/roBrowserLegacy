// Mutacao somente na memoria do Vitest: nunca altera o cliente servido pelo Vite.
//
// A QUANTIA QUE SAI DA JANELA DO BANCO (12/10/2026, anti-exploit; D-2307). Cada
// mutante e um jeito de a janela voltar a mandar ao cofre um pedido que o
// servidor conta como sinal para a sentinela (quantia <= 0 ou acima do saldo),
// ou de recusar o pedido honesto. Dois alvos: a regra (`quantiaDoBanco.js`) e a
// costura na janela (`Bank.js`), ambos alcancados pelo jsdom.
//
//   RAG_MUTANTE_BANCO=<nome> npx vitest run --config tests/mutantes/quantia-do-banco.config.mjs
//
// Todos de uma vez (bash), contando o mutante que NAO casa como invalido, e
// nao como morto (o transform lanca e a corrida reprova pelos dois motivos):
//   for m in $(node -e "process.env.RAG_MUTANTE_BANCO='saldoIlegivelPassa';import('./tests/mutantes/quantia-do-banco.config.mjs').then(c=>console.log(c.NOMES.join(' ')))"); do
//     RAG_MUTANTE_BANCO=$m npx vitest run --config tests/mutantes/quantia-do-banco.config.mjs > /tmp/m.log 2>&1;
//     if grep -q "nao casa" /tmp/m.log; then echo "$m INVALIDO"; elif grep -q "Tests .*failed" /tmp/m.log; then echo "$m morto"; else echo "$m SOBREVIVEU"; fi; done
import base from '../../vite.config.js';

const REGRA = 'src/UI/Components/Bank/quantiaDoBanco.js';
const JANELA = 'src/UI/Components/Bank/Bank.js';

const mutantes = {
	// o MAX volta a aceitar saldo ilegivel (o pacote com 0/NaN)
	saldoIlegivelPassa: [REGRA, '\treturn Number.isInteger(valor) && valor >= 0;', '\treturn true;'],
	// fracao conta como saldo
	fracaoPassa: [REGRA, '\treturn Number.isInteger(valor) && valor >= 0;', "\treturn typeof valor === 'number' && valor >= 0;"],
	// negativo conta como saldo
	negativoPassa: [REGRA, '\treturn Number.isInteger(valor) && valor >= 0;', '\treturn Number.isInteger(valor);'],
	// so o cofre e conferido
	maoSemConferir: [REGRA, '\tif (!saldoLegivel(zenyNaMao) || !saldoLegivel(saldoNoCofre)) {', '\tif (!saldoLegivel(saldoNoCofre)) {'],
	// so a mao e conferida
	cofreSemConferir: [REGRA, '\tif (!saldoLegivel(zenyNaMao) || !saldoLegivel(saldoNoCofre)) {', '\tif (!saldoLegivel(zenyNaMao)) {'],
	// o deposito sai do cofre (origem trocada)
	origemTrocada: [REGRA, '\tconst origem = deposito ? zenyNaMao : saldoNoCofre;', '\tconst origem = deposito ? saldoNoCofre : zenyNaMao;'],
	// o espaco e medido do lado errado
	destinoTrocado: [REGRA, '\tconst destino = deposito ? saldoNoCofre : zenyNaMao;', '\tconst destino = deposito ? zenyNaMao : saldoNoCofre;'],
	// o MAX com saldo zero manda zero
	maxSemSaldoManda: [REGRA, '\t\tif (origem <= 0) {\n\t\t\treturn { recusa: RECUSA.SEM_SALDO };\n\t\t}\n', ''],
	// o MAX esquece o teto do outro lado
	maxSemTeto: [REGRA, '\t\treturn { quantia: Math.min(origem, espaco) };', '\t\treturn { quantia: origem };'],
	// o MAX com o outro lado cheio manda mesmo assim
	maxComOutroCheio: [REGRA, '\t\tif (espaco <= 0) {\n\t\t\treturn { recusa: deposito ? RECUSA.ESTOURA_O_COFRE : RECUSA.ESTOURA_A_MAO };\n\t\t}\n\t\treturn', '\t\treturn'],
	// os estouros trocam de aviso
	estourosTrocados: [REGRA, '\t\treturn { recusa: deposito ? RECUSA.ESTOURA_O_COFRE : RECUSA.ESTOURA_A_MAO };\n\t}\n\treturn { quantia: pedido };', '\t\treturn { recusa: deposito ? RECUSA.ESTOURA_A_MAO : RECUSA.ESTOURA_O_COFRE };\n\t}\n\treturn { quantia: pedido };'],
	// os estouros do MAX trocam de aviso
	estourosDoMaxTrocados: [REGRA, '\t\t\treturn { recusa: deposito ? RECUSA.ESTOURA_O_COFRE : RECUSA.ESTOURA_A_MAO };\n\t\t}\n\t\treturn { quantia', '\t\t\treturn { recusa: deposito ? RECUSA.ESTOURA_A_MAO : RECUSA.ESTOURA_O_COFRE };\n\t\t}\n\t\treturn { quantia'],
	// o digitado acima do saldo sai (a suspeita volta)
	acimaDoSaldoSai: [REGRA, '\tif (pedido > origem) {\n\t\treturn { recusa: RECUSA.ACIMA_DO_SALDO };\n\t}\n', ''],
	// o saldo exato passa a ser recusado
	saldoExatoRecusado: [REGRA, '\tif (pedido > origem) {', '\tif (pedido >= origem) {'],
	// o digitado que estoura o outro lado sai
	digitadoEstouraSai: [REGRA, '\tif (pedido > espaco) {', '\tif (false) {'],
	// o espaco exato passa a ser recusado
	espacoExatoRecusado: [REGRA, '\tif (pedido > espaco) {', '\tif (pedido >= espaco) {'],
	// o zero digitado sai (a quase-prova volta)
	zeroSai: [REGRA, '\tif (!maximo && pedido <= 0) {', '\tif (!maximo && pedido < 0) {'],
	// o digitado acima do teto vira outro aviso
	semTeto: [REGRA, '\tif (!maximo && pedido > TETO_DE_ZENY) {', '\tif (false) {'],
	// o campo vazio vira letra
	vazioViraLetra: [REGRA, "\tif (texto === '' || texto === undefined || texto === null) {", '\tif (false) {'],
	// letra passa
	letraPassa: [REGRA, '(texto !== ENTRADA_MAXIMA && !/^\\d+$/.test(texto))', '(false)'],
	// o numero do +/- vira letra
	numeroViraLetra: [REGRA, "\tconst texto = typeof entrada === 'number' ? String(entrada) : entrada;", '\tconst texto = entrada;'],
	// a janela volta a ler o saldo do texto (o numero nunca e guardado)
	janelaNaoGuardaOSaldo: [JANELA, '\t_saldoNoCofre = bankMoney;\n', ''],
	// fechar a janela nao esquece o saldo
	naoEsqueceAoFechar: [JANELA, '\t_preferences.save();\n\t_saldoNoCofre = null;\n', '\t_preferences.save();\n'],
	// a recusa manda o pacote mesmo assim
	recusaManda: [JANELA, "\tif ('recusa' in decisao) {", '\tif (false) {'],
	// o pacote leva a entrada crua, e nao a quantia aprovada
	pacoteComEntradaCrua: [JANELA, '\tpkt.money = decisao.quantia;', '\tpkt.money = entrada;'],
	// o saque vira deposito
	operacaoTrocada: [JANELA, '\tpedirAoCofre(SACAR, value);', '\tpedirAoCofre(DEPOSITAR, value);'],
	// a recusa nao avisa
	recusaMuda: [JANELA, '\t\tconst aviso = AVISO_DA_RECUSA[decisao.recusa];', '\t\tconst aviso = undefined;'],
	// a recusa nao limpa o campo
	recusaNaoLimpa: [JANELA, "\t\tinput.value = '';\n\t\treturn;", '\t\treturn;'],
	// o acima do saldo do saque avisa como o deposito
	avisoDoSaqueTrocado: [JANELA, '(operacao === DEPOSITAR ? [2780, 2456] : [2786, 2455])', '[2780, 2456]'],
	// o MAX sem saldo do saque volta ao aviso antigo
	semSaldoDoSaqueAntigo: [JANELA, '(operacao === DEPOSITAR ? [2785, 2770] : [2786, 2455])', '[2785, 2770]']
};
const mutante = mutantes[process.env.RAG_MUTANTE_BANCO];
if (!mutante) throw new Error(`Escolha RAG_MUTANTE_BANCO: ${Object.keys(mutantes).join(', ')}.`);

export default {
	...base,
	plugins: [
		{
			name: 'quantia-do-banco-somente-em-memoria',
			enforce: 'pre',
			transform(codigo, id) {
				if (!id.replaceAll('\\', '/').endsWith(mutante[0])) return null;
				const normalizado = codigo.replaceAll('\r\n', '\n');
				if (normalizado.split(mutante[1]).length !== 2) throw new Error('Mutante nao casa exatamente uma vez.');
				return normalizado.replace(mutante[1], mutante[2]);
			}
		}
	],
	test: { ...base.test, include: ['tests/ui/quantiaDoBanco.test.js'] }
};

export const NOMES = Object.keys(mutantes);
