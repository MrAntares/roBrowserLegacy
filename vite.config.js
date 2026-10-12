import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import uiCssHmrPlugin from './vite/csshotreload.plugin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isDocker = process.env.RO_PROXY_TARGET === 'docker';

/*
 * AS DUAS PORTAS SAO SOBRESCRITIVEIS POR AMBIENTE (rodada da Jornada de
 * Midgard, 16/09/2026).
 *
 * Duas sessoes de trabalho no mesmo computador nao conseguiam subir duas
 * pilhas: o `remoteClientTarget` e o `webTarget` estavam cravados em 8000 e
 * 8888, entao a segunda pilha pedia asset a pilha da primeira e as duas
 * mediam sujo. Deslocar so a porta do vite (`--port`) nao resolve, porque o
 * que vaza sao os ALVOS do proxy, e nao a porta de escuta.
 *
 * O padrao continua sendo o canonico (8000/8888): quem nao define nada nao ve
 * diferenca — inclusive o remedio de 8010 -> 8000 (07/09/2026, D-<merge
 * `0dc3f43f`>) continua valendo, porque e exatamente o valor padrao de hoje.
 * Quem serve os assets e o `npm run oraculo:assets`, e ele escuta na **8000**
 * (`PORTAS_DO_DEV.assets`, `scripts/lib/stack-de-dev.ts`).
 */
const portaDeAssets = process.env.RAG_PORTA_ASSETS ?? '8000';
const portaDeWeb = process.env.RAG_PORTA_WEB ?? '8888';
const webTarget = isDocker ? 'http://rathena-web:8888' : `http://127.0.0.1:${portaDeWeb}`;
const remoteClientTarget = isDocker
	? 'http://remote-client-php:80'
	: `http://127.0.0.1:${portaDeAssets}`;
  
const _proxy = {  
	'/get': {  
		target: webTarget,  
		changeOrigin: true,  
		secure: false,  
		ws: false  
	},  
	'/emblem': {  
		target: webTarget,  
		changeOrigin: true,  
		secure: false,  
		ws: false  
	},  
	'/userconfig': {  
		target: webTarget,  
		changeOrigin: true,  
		secure: false,  
		ws: false  
	}  
};  
  
// Ragnarok Classic Idle / oráculo M0: este proxy era criado SÓ quando RO_PROXY_TARGET=docker,
// embora o alvo de fora do Docker já estivesse calculado logo acima
// (`remoteClientTarget` → 127.0.0.1:8000). Sem ele, rodando o vite no host,
// `/remote-client/...` cai no servidor estático do próprio vite e devolve 404
// para todo asset. Com ele, o cliente pede o caminho relativo de sempre e não
// precisa de CORS nem de URL absoluta na config.
_proxy['/remote-client'] = {
	target: remoteClientTarget,
	changeOrigin: true,
	secure: false,
	rewrite: path => path.replace(/^\/remote-client/, '')
};

// Ragnarok Classic Idle: o EMBLEMA de guilda (D-350) e HTTP na porta 8888 do servidor de
// jogo -- e o cliente servido por http chama /emblem/* na PROPRIA ORIGEM
// (Guild.js so usa o webserverAddress em file://). Sem este proxy, o upload
// pela janela da guilda devolve 404 do proprio vite.
_proxy['/emblem'] = {
	target: 'http://127.0.0.1:7888',
	changeOrigin: true,
	secure: false
};

/*
 * Ragnarok Classic Idle (15/09/2026): O RELATO DE FPS E DE ERRO NO DEV.
 *
 * `UI/enderecoDoBalcao.js` monta a rota com o `cadastroUrl` da config — que em
 * producao aponta para `api.roclassicidle.com.br` e no `npm run dev` NAO
 * EXISTE, entao o caminho fica relativo (`/analytics/desempenho`) e bate no
 * proprio vite, que devolve 404. O `.catch` do cliente engole, e o relato
 * some em silencio.
 *
 * E o MESMO modo de falha que `enderecoDoBalcao.js` documenta ter acontecido
 * em producao ("nenhum erro de jogador chegou ao servidor desde 09/09/2026"),
 * so que do lado de ca. Este proxy o fecha: no dev o relato chega ao balcao.
 *
 * 8889 e `PORTA_DE_CADASTRO` (`servidor/index.ts`), e o balcao so sobe com as
 * contas ligadas — ou seja, `npm run dev:publico` / `npm run dev -- --lan
 * --publico`. Sem ele o proxy simplesmente nao encontra ninguem, que e o
 * mesmo 404 de antes e nao piora nada.
 */
_proxy['/analytics'] = {
	target: 'http://127.0.0.1:8889',
	changeOrigin: true,
	secure: false
};

export default defineConfig({
	/**
	 * A RAIZ REDIRECIONA PARA O JOGO (03/09/2026).
	 *
	 * O `npm run dev` do Ragnarok Classic Idle imprime a URL completa
	 * (`/applications/pwa/index.html`), mas quem digita so `127.0.0.1:3000` — ou
	 * deixa o navegador completar do historico — cai na RAIZ, e a raiz devolvia
	 * **404**: este projeto nao tem `index.html` no topo, so
	 * `applications/<app>/index.html`.
	 *
	 * Um 404 na raiz de um servidor de desenvolvimento e armadilha: ele parece
	 * 'o jogo nao subiu' quando as quatro pecas estao no ar. O dono caiu nela em
	 * 03/09/2026 e reportou 'abriu e nao funcionou' — com a pilha inteira de pe.
	 *
	 * O redirecionamento e 302 (temporario) de proposito: ele e conveniencia de
	 * desenvolvimento, e nao rota do produto — cache permanente de 301 no
	 * navegador do dono seria pior que o 404.
	 */
	plugins: [
		uiCssHmrPlugin(),
		{
			name: 'ragidle-raiz-vai-para-o-jogo',
			apply: 'serve',
			configureServer(server) {
				server.middlewares.use((req, res, next) => {
					const url = req.url ?? '/';
					if (url === '/' || url === '/index.html') {
						res.writeHead(302, { Location: '/applications/pwa/index.html' });
						res.end();
						return;
					}
					next();
				});
			},
		},
	],
	root: './',
	base: './',
	resolve: {
		alias: {
			App: path.resolve(__dirname, './src/App'),
			Audio: path.resolve(__dirname, './src/Audio'),
			Controls: path.resolve(__dirname, './src/Controls'),
			Core: path.resolve(__dirname, './src/Core'),
			DB: path.resolve(__dirname, './src/DB'),
			Engine: path.resolve(__dirname, './src/Engine'),
			Loaders: path.resolve(__dirname, './src/Loaders'),
			Network: path.resolve(__dirname, './src/Network'),
			Plugins: path.resolve(__dirname, './src/Plugins'),
			Preferences: path.resolve(__dirname, './src/Preferences'),
			Renderer: path.resolve(__dirname, './src/Renderer'),
			UI: path.resolve(__dirname, './src/UI'),
			Utils: path.resolve(__dirname, './src/Utils'),
			Vendors: path.resolve(__dirname, './src/Vendors')
		}
	},
	optimizeDeps: {  
		include: ['bson', 'lodash', 'rijndael-js'],
		/*
		 * A VARREDURA DE DEPENDENCIAS NAO ENTRA EM `.claude/` (08/10/2026).
		 *
		 * Sem `entries`, o vite procura TODO `.html` debaixo da raiz para
		 * pre-empacotar as dependencias - e as worktrees de agente moram em
		 * `.claude/worktrees/`, cada uma com uma copia inteira do cliente (210
		 * paginas). Medido nesta maquina com 26 delas, duas vezes: o vite chegou
		 * a ~3 GB e nao respondeu a primeira pagina em 240 s (o `page.goto` da
		 * `prove:e2e` estourava os 60 s; o `npm run dev` sobe este mesmo vite
		 * nesta mesma raiz); com a varredura fora de `.claude/`, 200 em 1,6 s e
		 * em 14 s, com ~0,5 GB. Os padroes sao os de sempre (todo `.html`)
		 * menos o que nao e deste checkout.
		 */
		entries: ['**/*.html', '!**/.claude/**', '!**/node_modules/**', '!dist/**']
	},
	test: {
		environment: 'jsdom',
		include: ['tests/**/*.test.js'],
		/*
		 * TETO DE 20 s, e nao os 5 s default do vitest (10/09/2026).
		 *
		 * Medido nesta maquina numa corrida da suite inteira: 103 arquivos,
		 * 961 testes, `import 34.83s` — a maior fatia do tempo e o PRIMEIRO
		 * import de cada arquivo, que arrasta meio cliente (jsdom + os
		 * módulos de UI + Vendors) antes de o primeiro `it` rodar. Casos que
		 * passam em ~1 s sozinhos estouram 5 s quando pagam essa entrada com
		 * a maquina disputada.
		 *
		 * O sintoma é traicoeiro: o caso que reprova MUDA de corrida para
		 * corrida (foi `abaSobreviveAoF5` numa, `wsproxy-nao-morre` noutra),
		 * porque quem paga o import e quem chegou primeiro. Isso reprovava o
		 * portao de deploy do cliente por RELOGIO, e nao por regra.
		 *
		 * 20 s e folgado para o import e ainda finito: um teste de verdade
		 * pendurado continua morrendo, so que sem levar junto o vizinho que
		 * apenas demorou a carregar.
		 */
		testTimeout: 20_000,
		coverage: {  
			provider: 'v8',  
			reporter: ['text', 'html'],  
			include: ['src/**/*.js'],  
			exclude: ['src/Vendors/**']  
		}
	},
	build: {
		sourcemap: false, // Saves RAM
		minify: false, // Makes the build run much faster
		outDir: 'dist/Web',
		rollupOptions: {
			input: {
				main: path.resolve(__dirname, 'index.html')
			}
		}
	},
	server: {
		host: isDocker ? '0.0.0.0' : 'localhost', 
		port: 3000,
		open: !isDocker,
		cors: true,  
		// O vigia tambem fica longe das worktrees de agente (ver `optimizeDeps.entries`).
		watch: {
			ignored: ['**/.claude/**'],
			...(isDocker && {
				usePolling: true,
				interval: 1000
			})
		},
		proxy: _proxy
	}	
});
