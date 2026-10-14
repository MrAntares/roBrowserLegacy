import { WebSocketServer } from 'ws';
import net from 'net';
import { alvoPermitido, descreverAlvos, lerAlvos } from './wsproxyAlvos.js';
import { compressaoDoAmbiente } from './wsproxyCompressao.js';

// Parse command line arguments
const args = {};
for (let i = 2; i < process.argv.length; i++) {
	const arg = process.argv[i];
	if (arg.startsWith('-')) {
		const key = arg.replace(/^-+/, '');
		const val = process.argv[i + 1];
		if (val && !val.startsWith('-')) {
			args[key] = val;
			i++;
		} else {
			args[key] = true;
		}
	}
}

const port = parseInt(args.p || args.port || process.env.PORT || '5999', 10);
/*
 * A PONTE ESCUTA SO EM LOOPBACK (08/09/2026) — medido em producao.
 *
 * Ate hoje ela subia sem `host`, e o padrao do `ws` e escutar em TODAS as
 * interfaces. Conferido na VPS com `ss -ltnp`: `*:5999`, enquanto as seis
 * portas do jogo apareciam certinhas em `127.0.0.1`. Quem impedia o mundo de
 * alcancar a ponte era so o firewall da maquina (`ufw`, `deny incoming`) —
 * **uma protecao que mora fora deste repositorio e some numa recriacao de VPS
 * sem nada avisar**.
 *
 * Fechar em loopback e seguro porque quem fala com ela e o `cloudflared`, na
 * MESMA maquina: o `/etc/cloudflared/config.yml` de producao aponta os tres
 * hostnames para `http://127.0.0.1:5999`, `:8000` e `:8889`. O tunel e conexao
 * de SAIDA — nao existe ninguem legitimo chegando por outra interface.
 *
 * `WSPROXY_HOST` continua permitindo abrir, para quem precisar servir a ponte
 * na rede local (um celular de verdade apontando para o PC de desenvolvimento,
 * por exemplo). O PADRAO e que mudou: era aberto, agora e fechado.
 */
const host = process.env.WSPROXY_HOST ?? '127.0.0.1';
const redirectStr = args.r || args.redirect || '';
/*
 * `Object.create(null)`, E NAO `{}` (08/09/2026) — REPRODUZIDO, nao suposto.
 *
 * Este mapa e consultado com uma chave que vem CRUA da URL do WebSocket
 * (`redirects[target]`, no handler de conexao). Com um objeto comum, chave
 * nenhuma esta vazia: `redirects['constructor']` desce pela cadeia de
 * prototipo e devolve a funcao `Object` — que e truthy. O codigo entao faz
 * `target = redirects[target]` e, na linha seguinte, `target.split(':')`.
 * Funcao nao tem `.split`.
 *
 * O `TypeError` acontece DENTRO de um listener de evento, e listener de evento
 * nao tem quem o contenha: **o processo da ponte morre**. Como toda pessoa que
 * joga entra por aqui, todo mundo cai junto — e nada religa a ponte.
 *
 * Medido em 08/09/2026, na configuracao de producao (`WSPROXY_ALVOS` definida,
 * sem `-r`): um WebSocket para `/constructor` derruba a ponte com codigo 1,
 * enquanto o controle (um destino legitimo) a mantem viva. Vale igual para
 * `__proto__`, `toString`, `valueOf` e qualquer nome de `Object.prototype`.
 *
 * Um objeto sem prototipo nao tem chave herdada nenhuma: `redirects[qualquer]`
 * so e truthy se alguem o TIVER posto ali, que e o que a linha sempre quis
 * dizer. As outras duas camadas (o try/catch do handler e o gancho de ultimo
 * caso, mais abaixo) existem porque uma linha nao pode ser a unica defesa de
 * um processo do qual todo mundo depende.
 */
const redirects = Object.create(null);

if (redirectStr) {
	redirectStr.split(',').forEach(pair => {
		const [src, dest] = pair.split('=');
		if (src && dest) {
			redirects[src.trim()] = dest.trim();
		}
	});
}

/*
 * A LISTA DE DESTINOS PERMITIDOS (D-540).
 *
 * Esta ponte conecta a QUALQUER `host:porta` que o cliente pedir na URL do
 * WebSocket — o que é conveniente numa máquina de desenvolvimento e é um
 * PROXY TCP ABERTO no instante em que ela fica exposta na internet: qualquer
 * pessoa com a URL poderia alcançar serviços da rede onde ela roda.
 *
 * Como a v0 pública põe esta ponte atrás de um túnel, a lista deixou de ser
 * opcional. O padrão são as três portas do próprio jogo em `127.0.0.1`;
 * `WSPROXY_ALVOS` (separados por vírgula) substitui a lista quando for
 * preciso outra coisa, e `WSPROXY_ABERTO=1` volta ao comportamento antigo —
 * com aviso alto, porque quem liga isso precisa saber o que está ligando.
 */
const ALVOS_PADRAO = ['127.0.0.1:6900', '127.0.0.1:6121', '127.0.0.1:5121'];
const aberto = process.env.WSPROXY_ABERTO === '1';
// C4 do multiprocesso (07/10/2026): uma entrada pode ser uma FAIXA de portas
// (`127.0.0.1:5121-5124`), os map-servers de um servidor dividido. A regra e o
// teto moram em `wsproxyAlvos.js`.
const alvosPermitidos = lerAlvos(process.env.WSPROXY_ALVOS ?? ALVOS_PADRAO.join(','));

/* ===========================================================================
 * OS TRES TETOS DE CONEXAO (11/09/2026).
 *
 * A ponte ja limitava o TAMANHO do que passa (o `maxPayload` de 256 KiB, mais
 * abaixo) e o DESTINO (a lista de D-540, logo acima). O que ela nunca limitou
 * foi a QUANTIDADE: cada WebSocket aceito abre um socket TCP novo para uma
 * porta do jogo, e nada contava quantos existiam ao mesmo tempo, nem com que
 * velocidade chegavam, nem quantos vinham da mesma origem.
 *
 * Dois estragos saem dai, e **nenhum precisa de defeito nenhum** — bastam
 * conexoes bem-comportadas, em quantidade:
 *
 * - **o teto do servidor de jogo vira a arma.** Ele aceita 4096 conexoes por
 *   porta; quem enche esse numero atraves da ponte faz o servidor recusar TODO
 *   jogador legitimo que chegar depois. A defesa dele passa a ser o ataque, e
 *   o jogo fica "no ar" e inutilizavel — a mesma cara da queda que motivou o
 *   gancho de ultimo caso no fim deste arquivo.
 * - **os descritores de arquivo da ponte acabam** (`EMFILE`). Cada conexao
 *   custa DOIS: o socket do WebSocket e o socket TCP para o jogo. Quando a
 *   ponte bate o limite do sistema, ninguem entra — ela e o caminho unico de
 *   todo mundo, e nada a religa.
 *
 * E segurar uma vaga e barato para quem ataca. O servidor de jogo promove um
 * socket do prazo de saudacao (30 s) para o prazo de ocio (600 s) assim que UM
 * pacote plausivel atravessa: um pacote a cada dez minutos mantem a vaga viva.
 * Quem quiser ocupar o teto nao precisa nem manter trafego.
 *
 * ---------------------------------------------------------------------------
 * O QUE UM JOGADOR DE VERDADE FAZ — e por que estes numeros nunca o alcancam
 * ---------------------------------------------------------------------------
 * O roBrowser abre UMA conexao por vez, em serie: login (6900), que ele fecha
 * ao receber a lista de personagens; char (6121), que ele fecha ao entrar no
 * mapa; e mapa (5121), a unica que fica de pe enquanto ele joga. No regime
 * normal, portanto, **um jogador segura UMA conexao**; no instante da troca
 * ele segura duas, porque a nova abre antes de a antiga fechar. Um F5 repete
 * as tres. Uma sessao inteira de uma hora produz um punhado de conexoes novas,
 * e nao dezenas por segundo.
 *
 * Os numeros abaixo foram escolhidos uma ordem de grandeza acima desse
 * comportamento, DE PROPOSITO: o objetivo nao e apertar o jogador legitimo, e
 * cortar o laco. Todos entram por variavel de ambiente porque o dono precisa
 * poder reafinar sem mexer em codigo — o primeiro sinal de que um deles esta
 * apertado demais e um jogador reclamando, e nessa hora a resposta certa e
 * subir o numero, nao abrir um editor.
 * ========================================================================= */

/**
 * Le um TETO do ambiente, com o padrao como rede.
 *
 * O cuidado que parece exagero e o que impede o pior modo de falha desta
 * secao inteira: `parseInt('meia duzia')` devolve `NaN`, e **toda comparacao
 * com `NaN` e falsa** — `vivas >= NaN` nunca e verdade. Um teto escrito errado
 * no ambiente nao viraria um teto apertado nem um erro alto: viraria um teto
 * DESLIGADO, em silencio, exatamente na peca cujo trabalho e nao deixar isso
 * acontecer. Entao lixo volta ao padrao, e com uma linha dizendo que voltou.
 *
 * `0` e a excecao deliberada: ele DESLIGA o teto, e o desligamento e dito em
 * voz alta. Ele existe porque a hipotese mais provavel de um teto novo dar
 * errado e ele recusar quem nao devia, de madrugada — e nessa hora o dono
 * precisa de um interruptor que nao passe por editar, testar e publicar.
 */
function tetoDoAmbiente(nome, padrao) {
	const cru = process.env[nome];
	if (cru === undefined || cru === '') return padrao;
	const numero = Number.parseInt(cru, 10);
	if (!Number.isFinite(numero) || numero < 0) {
		console.log(`[wsProxy] ATENCAO: ${nome}="${cru}" nao e numero — usando o padrao ${padrao}.`);
		return padrao;
	}
	if (numero === 0) {
		console.log(`[wsProxy] ATENCAO: ${nome}=0 — este teto esta DESLIGADO.`);
		return Infinity;
	}
	return numero;
}

/** Le uma DURACAO do ambiente. Aqui o zero nao desliga nada: ele so quebraria. */
function duracaoDoAmbiente(nome, padrao) {
	const cru = process.env[nome];
	if (cru === undefined || cru === '') return padrao;
	const numero = Number.parseInt(cru, 10);
	if (!Number.isFinite(numero) || numero <= 0) {
		console.log(`[wsProxy] ATENCAO: ${nome}="${cru}" nao e duracao positiva — usando o padrao ${padrao}.`);
		return padrao;
	}
	return numero;
}

/**
 * QUANTAS CONEXOES A PONTE SEGURA AO MESMO TEMPO, somando todo mundo.
 *
 * **Numero NOSSO, e a conta e dupla.** Pelo lado do jogo: 512 e um oitavo das
 * 4096 que o servidor aceita por porta, entao a ponte sozinha nao tem como
 * encher o teto dele — que e o estrago principal desta rodada. Pelo lado do
 * jogador: com uma conexao por pessoa no regime normal, 512 cabe umas 500
 * pessoas simultaneas, muito acima da populacao do alfa; quando o jogo passar
 * disso, este e o numero que sobe, e ele sobe sozinho.
 *
 * **O caveat que fica dito, porque nao foi medido:** a 2 descritores por
 * conexao, 512 dao ~1024 descritores, que e justamente o `LimitNOFILE` mole
 * de praxe. Se o supervisor de producao nao o levantar, o `EMFILE` e este teto
 * chegam JUNTOS, e ai ele nao esta protegendo de nada — o conserto e
 * `LimitNOFILE=65535` na unidade do servico, e ai 512 vira folga pura. O
 * limite real da VPS nao foi conferido nesta rodada: esta declarado, e nao
 * suposto.
 */
const TETO_TOTAL_DE_CONEXOES = tetoDoAmbiente('WSPROXY_TETO_DE_CONEXOES', 512);

/**
 * QUANTAS CONEXOES UM MESMO ENDERECO SEGURA AO MESMO TEMPO.
 *
 * **Numero NOSSO, e ele e generoso de proposito.** Um jogador segura uma, duas
 * na troca de servidor: 32 e dezesseis pessoas atras do mesmo endereco.
 *
 * A razao de ser tao folgado tem nome: **CGNAT**. Operadora de celular
 * brasileira poe muito assinante atras de um IPv4 so, e casa, escritorio,
 * faculdade e lan house compartilham endereco do mesmo jeito. Um numero
 * apertado aqui recusa gente REAL e chega ao dono com a cara de um defeito
 * qualquer ("nao consigo entrar"), que e o modo de falha mais caro que um
 * teto pode ter. Mesmo assim, 32 corta em trinta vezes a origem que tentar
 * segurar mil vagas.
 *
 * **Se alguem legitimo for recusado, ESTE e o primeiro numero a subir.**
 */
const TETO_DE_CONEXOES_POR_IP = tetoDoAmbiente('WSPROXY_TETO_POR_IP', 32);

/**
 * QUANTAS CONEXOES NOVAS UM ENDERECO ABRE POR JANELA, e o tamanho da janela.
 *
 * **Numeros NOSSOS.** O teto de simultaneas nao ve o abuso de vida curta:
 * abrir e fechar em laco nunca segura vaga nenhuma e mesmo assim custa, a cada
 * volta, um `accept`, um aperto de mao de WebSocket, um `connect` TCP contra o
 * jogo e uma sessao no servidor de jogo por um instante. Quem so conta
 * simultaneas nao enxerga isso; este teto conta a VELOCIDADE.
 *
 * A conta: entrar no jogo custa tres conexoes. 30 por 10 s sao dez entradas
 * completas em dez segundos, vindas do mesmo endereco. Nenhum dedo humano faz
 * isso — um laco faz, e um F5 nervoso (tres entradas em dez segundos) passa
 * longe do limite.
 *
 * **So conexao ACEITA entra na contagem da janela.** Duas consequencias, as
 * duas desejadas: a origem recusada nao prolonga o proprio castigo (parou de
 * martelar, volta a ser atendida na janela seguinte), e a memoria fica
 * limitada — quem esta sendo recusado para de somar marcas aqui.
 */
const NOVAS_CONEXOES_POR_JANELA = tetoDoAmbiente('WSPROXY_NOVAS_POR_JANELA', 30);
const JANELA_DE_NOVAS_MS = duracaoDoAmbiente('WSPROXY_JANELA_DE_NOVAS_MS', 10_000);

/**
 * De quanto em quanto tempo a faxina passa nos mapas por endereco.
 *
 * Sem ela, `novasPorIp` guarda uma chave por endereco que ja conectou um dia —
 * pouca memoria cada, sem teto nenhum no total. A faxina e barata (ela so
 * percorre o que existe) e roda com `unref`, para nao ser ela a segurar o
 * processo vivo.
 */
const VARREDURA_MS = duracaoDoAmbiente('WSPROXY_VARREDURA_MS', 60_000);

/**
 * Quanto silencio re-arma o aviso de recusa (ver `avisoDeRecusa`).
 *
 * Cinco minutos: um incidente novo depois de cinco minutos de paz merece a
 * primeira linha de novo, senao a escalada por decada esconde o SEGUNDO
 * incidente atras do primeiro.
 */
const REARMAR_AVISO_MS = duracaoDoAmbiente('WSPROXY_REARMAR_AVISO_MS', 300_000);

/**
 * `1013 Try Again Later` — o codigo de fechamento da recusa por lotacao.
 *
 * Ele existe no registro da IANA com exatamente este sentido ("o servidor esta
 * sobrecarregado, tente de novo"), e e o unico que diz ao cliente bem-educado
 * para esperar em vez de reabrir na hora. Recusar com `1000` (normal) faria
 * todo cliente tratar a recusa como fim de sessao e reconectar imediatamente —
 * o teto viraria um gerador de laco, que e o que ele existe para cortar.
 */
const CODIGO_DE_RECUSA = 1013;

/**
 * DEVEMOS ACREDITAR NO CABECALHO QUE DIZ QUEM E O CLIENTE?
 *
 * O padrao responde sozinho, e a regra e consistente nos dois sentidos:
 *
 * - **escutando em loopback** (o arranjo de producao): a unica coisa que
 *   alcanca esta porta e um processo da MESMA maquina, e esse processo e o
 *   `cloudflared`. O cabecalho que chega foi escrito por ele, e a Cloudflare
 *   sobrescreve `CF-Connecting-IP` em tudo que passa por ela — entao ele vale.
 * - **escutando aberto** (`WSPROXY_HOST=0.0.0.0`, o caso do celular de verdade
 *   apontando para o PC de desenvolvimento): um cliente qualquer alcanca a
 *   porta direto e pode ESCREVER o cabecalho que quiser, trocando de "endereco"
 *   a cada conexao e passando por cima do teto por IP. Ali o `remoteAddress` e
 *   a verdade, e e ele que vale — que por sorte tambem e o endereco certo.
 *
 * `WSPROXY_CONFIAR_CABECALHO_DE_IP=1|0` forca os dois lados, para o dia em que
 * o arranjo nao for nenhum dos dois.
 */
const confiarNoCabecalhoDeIp =
	process.env.WSPROXY_CONFIAR_CABECALHO_DE_IP === '1' ? true
	: process.env.WSPROXY_CONFIAR_CABECALHO_DE_IP === '0' ? false
	: (host === '127.0.0.1' || host === 'localhost' || host === '::1');

/** `Infinity` nao e uma palavra que se ponha num log de producao. */
function porExtenso(numero) {
	return numero === Infinity ? 'DESLIGADO' : String(numero);
}

/**
 * Cabecalho HTTP pode chegar como texto ou como lista (o Node junta repetidos).
 * Quando ha mais de um, o que vale e o ULTIMO — pelo mesmo motivo do
 * `x-forwarded-for` em `ipDoCliente`: o ultimo e o que o salto mais proximo
 * escreveu, e e o unico que o cliente nao tem como forjar.
 */
function ultimoValorDoCabecalho(valor) {
	if (Array.isArray(valor)) return valor.length > 0 ? String(valor[valor.length - 1]).trim() : '';
	if (typeof valor === 'string') return valor.trim();
	return '';
}

/**
 * O ENDERECO DO CLIENTE, ATRAS DE UM TUNEL.
 *
 * `req.socket.remoteAddress` e o endereco de quem abriu ESTE socket — e em
 * producao quem abre e o `cloudflared`, na mesma maquina. Sem olhar cabecalho,
 * portanto, todo jogador do mundo chega como `127.0.0.1` e um teto "por IP"
 * nao separa ninguem de ninguem.
 *
 * A ordem e: `cf-connecting-ip` (o que a Cloudflare escreve, e que ela
 * sobrescreve em tudo que atravessa a rede dela), depois o ULTIMO elemento do
 * `x-forwarded-for`, depois o endereco do socket.
 *
 * **O ULTIMO do `x-forwarded-for`, e nao o primeiro** — e isto e seguranca, nao
 * gosto. O cabecalho e uma lista em que cada salto ANEXA o que viu, e o cliente
 * controla o comeco dela: quem mandar `X-Forwarded-For: 1.2.3.4` faz o tunel
 * anexar o endereco real DEPOIS do valor inventado. Ler o primeiro elemento
 * seria ler exatamente o campo que o atacante escreve, e trocar de identidade a
 * cada conexao derrubaria o teto por IP inteiro. O ultimo e o que o salto mais
 * proximo escreveu.
 */
/**
 * O IP DO JOGADOR PARA O SERVIDOR (H23, auditoria 2 de 22/09/2026).
 *
 * O servidor so ve esta ponte, e a ponte abre todo socket a partir da propria
 * maquina: para ele todo jogador era `127.0.0.1`, e a tranca de senha tinha
 * de ser por CONTA — qualquer estranho mantinha a conta de outra pessoa
 * trancada errando a senha dela. Com esta linha a ponte diz quem e o jogador,
 * no formato do PROXY protocol v1 (o do HAProxy), e o servidor tranca por IP,
 * como o rAthena.
 *
 * **DESLIGADA POR PADRAO, e a ordem de deploy e a razao:** o servidor antigo
 * nao entende a linha e nao responde a quem abre com ela. Primeiro sobe o
 * servidor que a le (ele so a aceita vinda da propria maquina); so depois esta
 * ponte roda com `WSPROXY_DECLARAR_IP=1`.
 */
const declararIpAoServidor = process.env.WSPROXY_DECLARAR_IP === '1';

const IPV4_DA_LINHA = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

/** A linha `PROXY` para este jogador, ou a `UNKNOWN` quando nao se sabe quem e. */
function linhaProxy(ip, portaDoDestino) {
	if (IPV4_DA_LINHA.test(ip)) return `PROXY TCP4 ${ip} 127.0.0.1 0 ${portaDoDestino}\r\n`;
	if (ip.includes(':') && /^[0-9a-fA-F:.]{2,45}$/.test(ip)) return `PROXY TCP6 ${ip} ::1 0 ${portaDoDestino}\r\n`;
	return 'PROXY UNKNOWN\r\n';
}

function ipDoCliente(req) {
	const cabecalhos = (req && req.headers) || {};
	if (confiarNoCabecalhoDeIp) {
		const daCloudflare = ultimoValorDoCabecalho(cabecalhos['cf-connecting-ip']);
		if (daCloudflare) return normalizarIp(daCloudflare);
		const encaminhado = ultimoValorDoCabecalho(cabecalhos['x-forwarded-for']);
		if (encaminhado) {
			const saltos = encaminhado.split(',').map(p => p.trim()).filter(Boolean);
			if (saltos.length > 0) return normalizarIp(saltos[saltos.length - 1]);
		}
	}
	const doSocket = req && req.socket && req.socket.remoteAddress;
	return doSocket ? normalizarIp(doSocket) : 'desconhecido';
}

/**
 * `::ffff:203.0.113.7` e `203.0.113.7` sao a MESMA pessoa.
 *
 * O Node entrega a forma IPv6-mapeada quando o socket e de pilha dupla, e sem
 * normalizar o mesmo cliente contaria duas vezes em duas chaves — o teto por
 * IP dobraria sozinho, em silencio, para metade dos clientes.
 */
function normalizarIp(ip) {
	const limpo = String(ip).trim();
	return limpo.startsWith('::ffff:') ? limpo.slice('::ffff:'.length) : limpo;
}

/**
 * ESTE ENDERECO SEPARA UMA PESSOA DA OUTRA?
 *
 * Loopback aqui quer dizer "chegou pelo tunel e o tunel nao disse quem era".
 * Ver `reservarVaga` para o que fazemos com essa resposta — e por que a
 * resposta honesta e desligar os tetos por IP em vez de aplica-los.
 */
function ehEnderecoIndistinguivel(ip) {
	return ip === '127.0.0.1' || ip === '::1' || ip === 'localhost' || ip === 'desconhecido';
}

/* ---------------------------------------------------------------------------
 * A CONTABILIDADE.
 *
 * Tres estruturas, e todas as tres tem quem as esvazie: contabilidade que
 * vaza e pior que contabilidade nenhuma. Uma que nunca decrementa transforma o
 * teto numa queda LENTA — a ponte vai recusando cada vez mais gente a medida
 * que o dia passa, e o sintoma (ninguem entra) chega horas depois da causa,
 * apontando para qualquer lugar menos para aqui.
 * ------------------------------------------------------------------------ */
let conexoesVivas = 0;
/** endereco -> quantas conexoes vivas. A chave SAI quando chega a zero. */
const conexoesPorIp = new Map();
/** endereco -> instantes das conexoes ACEITAS dentro da janela. */
const novasPorIp = new Map();
/** motivo -> quantas recusas, para o aviso por decada. */
const recusasPorMotivo = new Map();
const proximaMarcaDeAviso = new Map();
const ultimaRecusaEm = new Map();

/**
 * A frase de log desta recusa — ou `null`, que e o caso da esmagadora maioria.
 *
 * **E o idioma do aviso por decada do `freio-de-pedido.ts`**, do repositorio do
 * servidor, com DUAS diferencas deliberadas:
 *
 * - **a primeira recusa SEMPRE sai.** La a marca inicial e 20, porque as
 *   primeiras recusas dele sao ruido normal (dois toques rapidos numa janela).
 *   Aqui nao ha recusa benigna: bater um destes tetos ja e o incidente. Depois
 *   da primeira, a marca sobe por decada (1, 10, 100, 1.000) — um ataque de
 *   milhoes de tentativas cabe em meia duzia de linhas.
 * - **a chave e o MOTIVO, e nao a origem.** Chavear por endereco daria uma
 *   linha por endereco, e uma botnet com mil origens viraria mil linhas: a
 *   defesa contra enxurrada de log seria, ela mesma, a enxurrada. O endereco
 *   vai no texto da linha que sai, como amostra.
 *
 * A contagem NAO zera quando uma conexao passa (mesma razao de la: abuso lento
 * ficaria invisivel por construcao). Quem a zera e o silencio — ver a faxina.
 */
function avisoDeRecusa(motivo, detalhe) {
	const quantas = (recusasPorMotivo.get(motivo) ?? 0) + 1;
	recusasPorMotivo.set(motivo, quantas);
	ultimaRecusaEm.set(motivo, Date.now());
	const marca = proximaMarcaDeAviso.get(motivo) ?? 1;
	if (quantas < marca) return null;
	proximaMarcaDeAviso.set(motivo, marca * 10);
	return `[wsProxy] RECUSADO ${motivo} (${quantas}a vez) — ${detalhe}`;
}

/**
 * O aviso de que os tetos por endereco estao INERTES.
 *
 * Uma vez por processo, e nunca mais: ele descreve uma condicao do arranjo, e
 * nao um evento. Repeti-lo por conexao seria a enxurrada que o resto desta
 * secao evita.
 */
let jaAvisouDoEnderecoCego = false;
function avisarDoEnderecoCego(ip) {
	if (jaAvisouDoEnderecoCego) return;
	jaAvisouDoEnderecoCego = true;
	console.log(`[wsProxy] ATENCAO: o cliente chega como ${ip} — endereco indistinguivel.`);
	console.log('[wsProxy] Os tetos POR IP e de RAJADA ficam INERTES; so o teto total protege.');
	console.log('[wsProxy] Em producao isso quer dizer que o tunel nao esta passando CF-Connecting-IP.');
}

/**
 * Esta conexao entra? E, se entrar, como a vaga volta depois.
 *
 * **A DEGRADACAO HONESTA, que e a parte desta funcao que mais importa:** quando
 * o endereco nao distingue ninguem (todo mundo chegando como `127.0.0.1`
 * porque o tunel nao disse quem era), os tetos por IP sao **desligados**, e nao
 * aplicados. A razao e que um teto "por IP" sobre uma chave unica nao e um
 * teto por IP: e um teto GLOBAL bem mais baixo, disfarcado — com 32 por IP, o
 * 33o jogador do dia seria recusado, e a protecao teria virado a queda. Nessa
 * situacao quem segura a ponte e o teto total, e so ele; a linha de aviso
 * existe para o dono saber que esta nesse regime, e o conserto e fazer o
 * `CF-Connecting-IP` chegar, nao apertar numero nenhum.
 */
function reservarVaga(req) {
	const ip = ipDoCliente(req);
	const agora = Date.now();

	if (conexoesVivas >= TETO_TOTAL_DE_CONEXOES) {
		return {
			aceita: false,
			motivo: 'teto total',
			aviso: avisoDeRecusa('teto total', `${conexoesVivas} conexoes vivas, teto ${porExtenso(TETO_TOTAL_DE_CONEXOES)} (ultima de ${ip})`),
		};
	}

	const distinguivel = !ehEnderecoIndistinguivel(ip);
	if (!distinguivel) avisarDoEnderecoCego(ip);

	if (distinguivel) {
		const vivasDoIp = conexoesPorIp.get(ip) ?? 0;
		if (vivasDoIp >= TETO_DE_CONEXOES_POR_IP) {
			return {
				aceita: false,
				motivo: 'por IP',
				aviso: avisoDeRecusa('por IP', `${ip} ja segura ${vivasDoIp}, teto ${porExtenso(TETO_DE_CONEXOES_POR_IP)}`),
			};
		}

		const recentes = (novasPorIp.get(ip) ?? []).filter(quando => agora - quando < JANELA_DE_NOVAS_MS);
		if (recentes.length >= NOVAS_CONEXOES_POR_JANELA) {
			// A janela podada volta ao mapa mesmo na recusa: e o que faz o castigo
			// ir passando sozinho conforme os instantes velhos saem da janela.
			novasPorIp.set(ip, recentes);
			return {
				aceita: false,
				motivo: 'rajada',
				aviso: avisoDeRecusa('rajada', `${ip} abriu ${recentes.length} conexoes em ${JANELA_DE_NOVAS_MS} ms, teto ${porExtenso(NOVAS_CONEXOES_POR_JANELA)}`),
			};
		}

		recentes.push(agora);
		novasPorIp.set(ip, recentes);
		conexoesPorIp.set(ip, vivasDoIp + 1);
	}

	conexoesVivas += 1;

	/*
	 * A LIBERACAO E UM FECHAMENTO, E ELA CORRE UMA VEZ SO.
	 *
	 * Quem a chama sao os eventos `close` e `error` do WebSocket, e os dois
	 * disparam na mesma conexao com frequencia — um erro de socket vira erro E
	 * fecha. Decrementar duas vezes seria pior do que nao decrementar: o
	 * contador andaria para BAIXO sozinho ate ficar negativo, e ai o teto some
	 * sem nada avisar. O `liberada` e o que garante o "exatamente uma vez", e
	 * ele e por conexao porque e uma variavel do fecho, e nao um mapa que
	 * alguem precise limpar depois.
	 */
	let liberada = false;
	const liberar = () => {
		if (liberada) return;
		liberada = true;
		conexoesVivas -= 1;
		if (!distinguivel) return;
		const restantes = (conexoesPorIp.get(ip) ?? 1) - 1;
		if (restantes <= 0) conexoesPorIp.delete(ip);
		else conexoesPorIp.set(ip, restantes);
	};

	return { aceita: true, ip, liberar };
}

/*
 * A FAXINA.
 *
 * Ela faz duas coisas, e as duas sao sobre nao guardar para sempre o que so
 * interessava por um instante: tira do `novasPorIp` os enderecos cuja janela
 * esvaziou, e ESQUECE o motivo de recusa que passou `REARMAR_AVISO_MS` em
 * silencio — e esquecer e como o aviso se re-arma, porque a proxima recusa
 * volta a ser a primeira e sai no log na hora. Enquanto o ataque estiver em
 * curso ele renova o instante a cada recusa e nada e esquecido, que e o que
 * mantem a escalada por decada valendo durante o incidente.
 *
 * `unref` porque quem deve segurar este processo vivo e o servidor, nunca o
 * temporizador da faxina.
 */
const faxina = setInterval(() => {
	const agora = Date.now();
	for (const [ip, marcas] of [...novasPorIp]) {
		const recentes = marcas.filter(quando => agora - quando < JANELA_DE_NOVAS_MS);
		if (recentes.length === 0) novasPorIp.delete(ip);
		else novasPorIp.set(ip, recentes);
	}
	for (const [motivo, quando] of [...ultimaRecusaEm]) {
		if (agora - quando <= REARMAR_AVISO_MS) continue;
		ultimaRecusaEm.delete(motivo);
		recusasPorMotivo.delete(motivo);
		proximaMarcaDeAviso.delete(motivo);
	}
}, VARREDURA_MS);
faxina.unref();

if (host !== '127.0.0.1' && host !== 'localhost') {
	// Quem abre precisa VER que abriu. A linha e o unico aviso que existe entre
	// "so o tunel alcanca" e "a internet alcanca, se o firewall deixar".
	console.log(`[wsProxy] ATENCAO: escutando em ${host} — fora de loopback. Confira o firewall.`);
}
if (aberto) {
	console.log('[wsProxy] ATENCAO: WSPROXY_ABERTO=1 — a ponte aceita QUALQUER destino.');
	console.log('[wsProxy] Nao exponha esta ponte na internet assim.');
} else {
	console.log('[wsProxy] destinos permitidos:', descreverAlvos(alvosPermitidos).join(', '));
}
console.log(
	`[wsProxy] tetos de conexao: ${porExtenso(TETO_TOTAL_DE_CONEXOES)} no total, ` +
	`${porExtenso(TETO_DE_CONEXOES_POR_IP)} por IP, ` +
	`${porExtenso(NOVAS_CONEXOES_POR_JANELA)} novas por ${JANELA_DE_NOVAS_MS} ms por IP` +
	`${confiarNoCabecalhoDeIp ? '' : ' (ignorando cabecalho de IP)'}`,
);
if (Object.keys(redirects).length > 0) {
	console.log('[wsProxy] Configured redirects:', redirects);
}

/**
 * O TETO DE FRAME (27/08/2026, auditoria).
 *
 * O padrao do `ws` e **100 MiB por mensagem**, e esta ponte fica atras de um
 * tunel publico. Um cliente pode abrir a conexao e mandar um unico frame de
 * 100 MiB, que o processo monta INTEIRO em memoria antes de o `on('message')`
 * sequer rodar — nada aqui teria como recusar depois.
 *
 * O maior pacote do protocolo do RO nao chega perto disso: os variaveis
 * declaram o comprimento em 2 bytes, entao o teto natural e 64 KiB. 256 KiB
 * deixa folga de 4x para qualquer coisa que o cliente mande em rajada, e ainda
 * assim e 400x menor que o padrao.
 */
const TETO_DE_FRAME = 256 * 1024;


/*
 * A COMPRESSAO DO FIO (`permessage-deflate`, D-2374): DESLIGADA por padrao,
 * `RAG_WS_DEFLATE=1` liga. O porque (o ganho medido, o custo aqui, a duvida
 * sobre a Cloudflare) mora em `wsproxyCompressao.js`. Valor que nao e 0 nem 1
 * derruba a subida com o motivo — antes de escutar, e nao depois.
 */
const COMPRESSAO = compressaoDoAmbiente(process.env.RAG_WS_DEFLATE);

const wss = new WebSocketServer({ port, host, maxPayload: TETO_DE_FRAME, perMessageDeflate: COMPRESSAO });

/*
 * "Listening on" SO QUANDO ESCUTA (10/09/2026).
 *
 * A linha era impressa no topo do arquivo, antes ate de o servidor ser
 * criado — e o `listen` e assincrono. Quem esperava por ela (o
 * `tests/wsproxy-nao-morre.test.js`) conectava numa porta que as vezes ainda
 * nao escutava: medido, uma em tres conexoes feitas no instante da linha deu
 * `ECONNREFUSED`, e o teste reprovou tres vezes seguidas com a ponte perfeita.
 * Em producao a mentira era a mesma com outra cara: porta ocupada imprimia
 * "Listening on" e morria logo em seguida.
 */
wss.on('listening', () => {
	console.log(`[wsProxy] Listening on ${host}:${port} (compressao ${COMPRESSAO ? 'ligada' : 'desligada'})`);
});

/*
 * O HANDLER INTEIRO NUMA GUARDA (08/09/2026).
 *
 * Uma excecao dentro de um listener de evento nao tem quem a contenha: ela
 * sobe como excecao nao tratada e MATA O PROCESSO. Numa ponte pela qual todo
 * jogador passa, isso quer dizer que qualquer defeito no tratamento de UMA
 * conexao derruba TODAS — e foi exatamente esse o caminho do `/constructor`.
 *
 * A guarda inverte o custo: o pedido esquisito perde a conexao dele, e nao o
 * jogo inteiro. E o mesmo idioma do `try/catch` por handler que o servidor de
 * jogo ja usa (`servidor/transporte.ts`, ~395).
 */
wss.on('connection', (ws, req) => {
	try {
		aceitarConexao(ws, req);
	} catch (erro) {
		console.error(`[wsProxy] conexao recusada por excecao (${req && req.url}): ${erro && erro.message}`);
		try {
			ws.close();
		} catch {
			/* fechar ja fechado nao e problema de ninguem */
		}
	}
});

/**
 * Texto de origem duvidosa cabe num log; texto de origem duvidosa INTEIRO, nao.
 *
 * A URL vem do cliente e o Node a aceita ate a casa dos quilobytes. Escrever
 * isso no log a cada recusa seria uma enxurrada pelo tamanho, depois de todo o
 * cuidado acima com a enxurrada pela quantidade.
 */
function recortar(texto, limite = 80) {
	const bruto = String(texto);
	return bruto.length <= limite ? bruto : `${bruto.slice(0, limite)}...`;
}

function aceitarConexao(ws, req) {
	/*
	 * A CONTABILIDADE VEM ANTES DE QUALQUER OUTRA COISA.
	 *
	 * Ela e a primeira linha da funcao de proposito, e nao por arrumacao: tudo
	 * o que esta abaixo custa alguma coisa — analisar a URL, escrever linha de
	 * log por conexao, abrir um socket TCP contra o jogo —, e uma enxurrada
	 * recusada aqui em cima nao paga nada disso. Em particular ela nao produz
	 * uma linha de log por conexao: as unicas linhas que uma enxurrada gera sao
	 * as do aviso por decada.
	 */
	const vaga = reservarVaga(req);
	if (!vaga.aceita) {
		if (vaga.aviso) console.log(vaga.aviso);
		ws.close(CODIGO_DE_RECUSA, `ponte no limite: ${vaga.motivo}`);
		return;
	}

	/*
	 * E A DEVOLUCAO DA VAGA E REGISTRADA NA LINHA SEGUINTE, antes de existir
	 * qualquer caminho que possa sair desta funcao.
	 *
	 * E isso que torna o "exatamente uma vez" verdadeiro sem ninguem precisar
	 * lembrar dele nos `return` daqui para baixo: formato invalido e destino
	 * fora da lista FECHAM o WebSocket, e fechar dispara o `close`; uma excecao
	 * no meio do caminho cai na guarda do `wss.on('connection')`, que tambem
	 * fecha. Nao ha saida desta funcao que nao passe por um `close`, e por isso
	 * nao ha saida que vaze uma vaga.
	 *
	 * O dia em que houver uma, o sintoma nao vai parecer com a causa: o teto
	 * vira uma queda LENTA, em que a ponte recusa cada vez mais gente conforme
	 * o dia passa e nada aponta para aqui.
	 */
	ws.on('close', vaga.liberar);
	ws.on('error', vaga.liberar);

	// O endereco RESOLVIDO, e nao o do socket: atras do tunel o socket e sempre
	// o `cloudflared`, e um log que nomeia a ponte em vez do jogador nao serve
	// para investigar coisa nenhuma.
	const from = vaga.ip;
	let target = req.url.slice(1); // Remove leading slash

	// Apply redirects
	if (redirects[target]) {
		console.log(`[wsProxy] Redirecting ${target} -> ${redirects[target]}`);
		target = redirects[target];
	}

	console.log(`[wsProxy] Connection request from ${from} to ${target}`);

	const parts = target.split(':');
	if (parts.length !== 2) {
		// Pelo aviso por decada, como as recusas de lotacao: um scanner batendo
		// em caminho invalido e a mesma enxurrada de log com outra cara.
		const aviso = avisoDeRecusa('formato de destino invalido', `"${recortar(target)}" (de ${from})`);
		if (aviso) console.log(aviso);
		ws.close();
		return;
	}

	const [host, portStr] = parts;
	const targetPort = parseInt(portStr, 10);

	// A tranca de D-540: destino fora da lista é recusado ANTES de qualquer
	// socket ser aberto. O log diz o que foi pedido — quem administra precisa
	// ver a tentativa; quem tentou não recebe nada além do fechamento.
	if (!aberto && !alvoPermitido(alvosPermitidos, host, targetPort)) {
		const aviso = avisoDeRecusa('destino fora da lista', `${recortar(`${host}:${targetPort}`)} (de ${from})`);
		if (aviso) console.log(aviso);
		ws.close();
		return;
	}

	const tcp = net.connect(targetPort, host, () => {
		console.log(`[wsProxy] Connected to target ${host}:${targetPort}`);
	});

	tcp.setNoDelay(true);
	// H23: a primeira coisa que o servidor le e quem e o jogador. Escrita
	// antes de qualquer mensagem do WebSocket — o socket preserva a ordem.
	if (declararIpAoServidor) tcp.write(linhaProxy(from, targetPort));

	/*
	 * BACKPRESSURE NAS DUAS DIRECOES (27/08/2026, auditoria).
	 *
	 * Os dois repasses eram `write`/`send` incondicionais. Cada lado tem um
	 * jeito de encher:
	 *
	 * - **servidor -> cliente**: um cliente entra no mapa pelo tunel e para de
	 *   ler o proprio socket (aba minimizada com rede ruim, ou de proposito). O
	 *   servidor continua empurrando posicao e entidades a cada tique, e
	 *   `ws.send` enfileira em `bufferedAmount` — memoria do processo da ponte,
	 *   sem teto.
	 * - **cliente -> servidor**: `tcp.write` devolve `false` quando o buffer do
	 *   socket encheu, e ninguem olhava.
	 *
	 * O idioma do Node para isso e `pause()`/`resume()`: parar de LER a origem
	 * enquanto o destino nao vaza. Assim a pressao volta para quem a criou, em
	 * vez de virar memoria aqui.
	 */
	ws.on('message', message => {
		if (!tcp.writable) return;
		// `write` devolve false quando o buffer encheu: para de ler o WS ate o
		// socket TCP drenar.
		if (!tcp.write(message)) {
			ws.pause();
			tcp.once('drain', () => ws.resume());
		}
	});

	tcp.on('data', data => {
		if (ws.readyState !== ws.OPEN) return;
		ws.send(data);
		/*
		 * `ws.send` nao tem valor de retorno util; o sinal e `bufferedAmount`.
		 * Passou do teto, para de ler o TCP e so volta quando drenar — o
		 * `setTimeout` e a unica forma, porque o `ws` nao emite evento de
		 * drenagem por conexao.
		 */
		if (ws.bufferedAmount > TETO_DE_FRAME) {
			tcp.pause();
			const esperarDrenar = () => {
				if (ws.readyState !== ws.OPEN) return; // caiu: nao ha o que retomar
				if (ws.bufferedAmount > TETO_DE_FRAME) setTimeout(esperarDrenar, 50);
				else tcp.resume();
			};
			setTimeout(esperarDrenar, 50);
		}
	});

	/*
	 * O PING QUE MANTEM O CANO AQUECIDO (D-1505, 15/09/2026).
	 *
	 * ------------------------------------------------------------------
	 * A CICATRIZ
	 * ------------------------------------------------------------------
	 * Relato de varios jogadores, ha semanas: *"disconnect do nada, cerca de 5
	 * minutos depois de trocar de aba"*. A auditoria mediu os quatro saltos
	 * entre o navegador e o jogo e achou esta ponte **completamente muda**: sem
	 * `ping`, sem `pong`, sem `socket.setTimeout`, sem `setKeepAlive`.
	 *
	 * **O `ws` do Node nao manda ping sozinho** — nao ha heartbeat embutido. E
	 * como ninguem mandava por ele, a UNICA coisa que mantinha a conexao viva
	 * era o keepalive do proprio jogo, vindo do navegador. No instante em que
	 * ele para — aba congelada pelo Energy Saver do Chrome, que congela o grupo
	 * de contexto (e os Web Workers dele) depois de ~5 min oculto — **o cano
	 * inteiro fica mudo nas duas direcoes**, e o primeiro intermediario com
	 * regra de ociosidade ganha.
	 *
	 * Entre o navegador e esta ponte ha DOIS saltos da Cloudflare (a borda e o
	 * tunel), e **nenhum dos dois tem prazo declarado em lugar nenhum do
	 * repositorio** — o que existir esta no painel. Nao da para consertar o que
	 * nao se ve; da para nao depender dele.
	 *
	 * ------------------------------------------------------------------
	 * POR QUE PING DE WEBSOCKET, E DAQUI
	 * ------------------------------------------------------------------
	 * O frame de ping e do PROTOCOLO, e nao do jogo: ele nao passa pelo
	 * `onmessage` do cliente, nao vira pacote, nao custa nada ao jogo — e a
	 * resposta e automatica em todo navegador. E ele nasce **no lado
	 * servidor**, que e a metade do cano que NUNCA congela. Uma aba dormindo
	 * deixa de falar; esta ponte nao.
	 *
	 * 30 s e o intervalo, e ele e escolhido por ser folgadamente menor que o
	 * menor prazo plausivel de um intermediario (a Cloudflare documenta ~100 s
	 * de ociosidade para WebSocket em alguns planos). Dobrar seria apertado;
	 * metade seria trafego a toa.
	 *
	 * **Isto NAO ressuscita o jogador.** Se a aba congelou, o jogo dela parou de
	 * qualquer jeito. O que o ping compra e que a CONEXAO sobreviva ate ele
	 * voltar — e o que o jogador sente e a diferenca entre "voltei e continuei"
	 * e "voltei e tinha caido".
	 */
	const PING_MS = 30_000;
	const relogioDePing = setInterval(() => {
		if (ws.readyState !== ws.OPEN) return;
		// `ws.ping()` lanca se o socket fechar entre o `readyState` e a escrita;
		// uma ponte nao pode morrer por causa do proprio keepalive.
		try {
			ws.ping();
		} catch {
			/* o `close` que vem a seguir limpa o relogio */
		}
	}, PING_MS);
	// Nunca segurar o processo de pe por causa de um relogio de keepalive.
	relogioDePing.unref?.();

	const cleanup = () => {
		clearInterval(relogioDePing);
		tcp.end();
		ws.close();
		console.log(`[wsProxy] Connection closed for ${target}`);
	};

	ws.on('close', cleanup);
	ws.on('error', cleanup);
	tcp.on('close', cleanup);
	tcp.on('error', err => {
		console.error(`[wsProxy] TCP Error for ${target}:`, err.message);
		cleanup();
	});
}

/*
 * O GANCHO DE ULTIMO CASO (08/09/2026) — o mesmo que o servidor de jogo ganhou
 * em D-1191, e pela mesma razao.
 *
 * A ponte e um ponto unico de falha: ela nao guarda estado, mas TODO mundo
 * passa por ela, e quando ela morre ninguem consegue nem entrar. Ficar de pe
 * com um erro registrado e sempre melhor do que sair calada — e sair calada e
 * literalmente o que acontecia, porque o supervisor de producao nao vigiava a
 * saida desta peca.
 */
process.on('uncaughtException', (erro) => {
	console.error(`[wsProxy] QUEDA EVITADA (uncaughtException): ${erro && erro.message}`);
	console.error(erro && erro.stack ? erro.stack : '(sem pilha)');
});
process.on('unhandledRejection', (erro) => {
	console.error(`[wsProxy] QUEDA EVITADA (unhandledRejection): ${erro && erro.message ? erro.message : String(erro)}`);
});
