/**
 * O ESTADO QUE ATRAVESSA A TROCA (27/08/2026, auditoria C).
 *
 * Quatro achados com a mesma raiz: o cliente NAO recarrega a pagina ao trocar
 * de mapa nem de personagem, entao todo estado de modulo sobrevive — e cada
 * consumidor foi escrito supondo o contrario, ou supondo que outra pessoa
 * limpava.
 *
 * - M6 a boneca 3D da Mochila parava em toda troca de mapa;
 * - M7 o botao de caca mostrava o rotulo do mapa ANTERIOR;
 * - M8 `cleanGameUI()` nao limpava nenhum componente RAGIDLE;
 * - M9 a viagem pendente do Mapa de Caca ficava armada para sempre.
 *
 * Tres deles tinham uma RAZAO ESCRITA que os protegia, e as tres estavam
 * caducadas ou testando a condicao errada. Por isso estes casos existem: prosa
 * nao reprova.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const NL = String.fromCharCode(10);

/**
 * Tira comentario do fonte ANTES de medir (27/08/2026).
 *
 * Sem isto, todo caso que le o fonte mede a PROSA. Medido: a primeira versao do
 * caso da Mochila procurava `Renderer.render(renderBoneco)` no corpo do
 * `onAppend` — e o comentario que explica o conserto cita essa mesma expressao.
 * O controle positivo, removendo o codigo, deixou o caso VERDE.
 *
 * Escrito a mao e sem regex de proposito: as barras de escape ja se perderam
 * tres vezes hoje no caminho ate o arquivo.
 */
function semComentarios(fonte) {
	let saida = '';
	let i = 0;
	while (i < fonte.length) {
		const dois = fonte.slice(i, i + 2);
		if (dois === '/*') {
			const fim = fonte.indexOf('*/', i + 2);
			i = fim === -1 ? fonte.length : fim + 2;
			continue;
		}
		if (dois === '//') {
			const fim = fonte.indexOf(NL, i);
			i = fim === -1 ? fonte.length : fim;
			continue;
		}
		saida += fonte[i];
		i++;
	}
	return saida;
}

const mocks = vi.hoisted(() => ({
	enviados: [],
	hooks: [],
	avisos: [],
	desenhando: []
}));

vi.mock('Network/NetworkManager.js', () => ({
	default: {
		sendPacket: (p) => mocks.enviados.push(p),
		hookPacket: (_pkt, cb) => mocks.hooks.push(cb)
	}
}));
vi.mock('Renderer/Renderer.js', () => ({ default: { render: vi.fn(), stop: vi.fn(), vsync: [] } }));
vi.mock('UI/UIManager.js', () => ({
	default: { showErrorBox: vi.fn(), addComponent: (c) => c }
}));
vi.mock('UI/Components/ChatBox/ChatBox.js', () => ({
	default: {
		addText: (t) => mocks.avisos.push(t),
		TYPE: { ERROR: 1 },
		FILTER: { PUBLIC_LOG: 1 }
	}
}));

/*
 * O contexto do mapa saiu da janela "Idle" (IdleConfig, retirada em
 * 07/10/2026) para `UI/contextoDoMapa.js`, alimentado pelo `ZC_RAGIDLE_BOT`
 * que o BotMenu recebe. A regra do M7 e a mesma: na troca de mapa o contexto
 * fica OBSOLETO ate a resposta do mapa novo, e quem le recebe `null`.
 */
const contextoDoMapa = await import('UI/contextoDoMapa.js');

describe('M7: o rotulo do botao de caca nao pode vir do mapa anterior', () => {
	beforeEach(() => {
		contextoDoMapa.esquecer();
		contextoDoMapa.receberDoServidor({ ehCidade: false }, false);
	});

	it('a troca de mapa marca o contexto como OBSOLETO: quem le recebe null, e nao o mapa anterior', () => {
		expect(contextoDoMapa.contextoDoMapa()).toEqual({ ehCidade: false });
		contextoDoMapa.marcarObsoleto();
		expect(contextoDoMapa.contextoDoMapa(), 'a troca nao marcou o contexto').toBeNull();
	});

	it('a resposta LIMPA a marca', () => {
		contextoDoMapa.marcarObsoleto();
		contextoDoMapa.receberDoServidor({ ehCidade: true }, false);
		expect(contextoDoMapa.contextoDoMapa(), 'a marca ficou pendurada depois da resposta').toEqual({ ehCidade: true });
	});

	it('quem marca a troca de mapa e o BotMenu, a cada append', async () => {
		const fs = await import('node:fs');
		const fonte = semComentarios(fs.readFileSync('src/UI/Components/BotMenu/BotMenu.js', 'utf8'));
		const inicio = fonte.indexOf('BotMenu.onAppend = function');
		expect(inicio, 'onAppend sumiu').toBeGreaterThan(-1);
		expect(fonte.slice(inicio, fonte.indexOf(NL + '}', inicio))).toContain('marcarObsoleto()');
	});

	it('a guarda do botao olha a marca, e nao so a ausencia', async () => {
		/*
		 * `syncLabel` mora num closure do HuntButtonIdle. A medida possivel e
		 * ler o fonte — o mesmo idioma que o servidor usa para estado em
		 * closure.
		 */
		const fs = await import('node:fs');
		const fonte = semComentarios(fs.readFileSync('src/UI/Components/HuntButtonIdle/HuntButtonIdle.js', 'utf8'));
		const inicio = fonte.indexOf('function syncLabel()');
		expect(inicio, 'syncLabel sumiu').toBeGreaterThan(-1);
		const corpo = fonte.slice(inicio, fonte.indexOf(NL + '}', inicio));
		/* `contextoDoMapa()` devolve null tambem quando o contexto e do mapa
		   anterior (obsoleto): a guarda que le a funcao olha a marca. */
		expect(corpo, 'a guarda voltou a testar so a ausencia de contexto').toContain('if (!contextoDoMapa())');
	});
});

describe('M8: a troca de personagem esquece o anterior', () => {
	it('a troca de personagem esquece o contexto e o estado do Bot', () => {
		contextoDoMapa.receberDoServidor({ ehCidade: false }, true);
		expect(contextoDoMapa.botLigado()).toBe(true);

		contextoDoMapa.esquecer();

		expect(contextoDoMapa.contextoDoMapa()).toBeNull();
		expect(contextoDoMapa.botLigado()).toBe(false);
	});

	it('`cleanGameUI` CHAMA a limpeza dos tres modulos RAGIDLE', async () => {
		/*
		 * A lista de `cleanGameUI` tinha OITO componentes, todos nativos. Sem
		 * este caso, alguem reordena o arquivo e a chamada some sem nada
		 * reprovar — que e exatamente como o defeito nasceu.
		 */
		const fs = await import('node:fs');
		const fonte = semComentarios(fs.readFileSync('src/Engine/MapEngine.js', 'utf8'));
		const inicio = fonte.indexOf('function cleanGameUI()');
		expect(inicio, 'cleanGameUI sumiu').toBeGreaterThan(-1);
		const corpo = fonte.slice(inicio, fonte.indexOf(NL + '}', inicio));
		expect(corpo, 'cleanGameUI voltou a ignorar os componentes RAGIDLE').toContain(
			'limparEstadoDoPersonagem'
		);
		for (const modulo of ['BotMenu', 'MissoesIdle', 'HuntMap']) {
			expect(corpo, `${modulo} saiu da limpeza`).toContain(modulo);
		}
	});
});

describe('M6/M9: o par que faltava', () => {
	it('M6: a Mochila REARMA a boneca no append, e nao so no toggle', async () => {
		/*
		 * `Renderer.render(renderBoneco)` so era chamado no `toggle()`, e o laco
		 * e derrubado em toda troca de mapa por duas vias (`Renderer.stop()` sem
		 * argumento em `MapRenderer.setMap`, e o `onRemove` daqui). A janela
		 * voltava aberta com a boneca PARADA.
		 */
		const fs = await import('node:fs');
		const fonte = semComentarios(fs.readFileSync('src/UI/Components/MochilaIdle/MochilaIdle.js', 'utf8'));
		const inicio = fonte.indexOf('MochilaIdle.onAppend = function onAppend()');
		expect(inicio, 'onAppend sumiu').toBeGreaterThan(-1);
		const corpo = fonte.slice(inicio, fonte.indexOf(NL + '};', inicio));
		// A FORMA, e nao a expressao solta: `if (isOpen())` seguido do render.
		const guarda = corpo.indexOf('if (isOpen())');
		expect(guarda, 'o rearme voltou a nao ser condicionado a janela aberta').toBeGreaterThan(-1);
		const depoisDaGuarda = corpo.slice(guarda, guarda + 200);
		expect(depoisDaGuarda, 'o append voltou a nao rearmar a boneca').toContain(
			'Renderer.render(renderBoneco)'
		);
	});

	it('M9: a viagem pendente e desarmada ANTES de qualquer `return`', async () => {
		/*
		 * Os dois `return` de resposta ilegivel ficavam antes do consumo da
		 * flag, que e de modulo e nao e zerada no `onRemove`. Ela ficava armada
		 * para sempre, e o estrago aparecia muito depois: o jogador abre o Mapa
		 * de Caca pela primeira vez e e TELEPORTADO, com a janela fechando na
		 * cara dele.
		 */
		const fs = await import('node:fs');
		const fonte = semComentarios(fs.readFileSync('src/UI/Components/HuntMap/HuntMap.js', 'utf8'));
		const inicio = fonte.indexOf('function onCatalogReceived(pkt)');
		expect(inicio, 'onCatalogReceived sumiu').toBeGreaterThan(-1);
		const corpo = fonte.slice(inicio, fonte.indexOf(NL + '}', inicio));

		const desarme = corpo.indexOf('_pendingAutoTravel = false;');
		const primeiroReturn = corpo.indexOf('return;');
		expect(desarme, 'o desarme sumiu').toBeGreaterThan(-1);
		expect(primeiroReturn, 'nao achei os returns antecipados').toBeGreaterThan(-1);
		expect(
			desarme,
			'o desarme voltou a ficar DEPOIS de um `return` antecipado — a flag fica armada para sempre'
		).toBeLessThan(primeiroReturn);
	});
});
