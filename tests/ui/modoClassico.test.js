/**
 * O MODO CLASSICO E O UNICO MODO (07/10/2026, Novo Bot V5).
 *
 * Ate 07/10 o modo classico era um INTERRUPTOR (`modoClassicoLigado`, lido de
 * `ROConfig.modoClassico`) que escondia a interface do idle. Com o Bot novo a
 * interface foi RETIRADA do cliente, e o interruptor saiu junto. Este teste
 * prova a AUSENCIA: nenhuma chave, nenhum chamador, nenhum `modoClassico` no
 * `Config.js`, e os ramos classicos valendo SEMPRE (o golpe em quem anda e a
 * caminhada sem adiantamento).
 *
 * O caminho do ataque original NAO foi tocado: clicar num mob manda o
 * `CZ_REQUEST_ACT` com `action = 7` (EntityControl.onFocus).
 */
import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import * as modoClassico from '../../src/UI/modoClassico.js';

const raiz = join(__dirname, '..', '..');
const ler = p => readFileSync(join(raiz, p), 'utf8');

/** O codigo, sem os comentarios que NARRAM a retirada. */
function semComentario(texto) {
	return texto.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '').replace(/[ \t]\/\/.*$/gm, '');
}

/** Todo .js/.html de `src/` (sem os vendors). */
function fontesDoCliente(dir = join(raiz, 'src'), acc = []) {
	for (const nome of readdirSync(dir)) {
		const caminho = join(dir, nome);
		if (statSync(caminho).isDirectory()) {
			if (nome === 'Vendors') continue;
			fontesDoCliente(caminho, acc);
		} else if (/\.(js|html)$/.test(nome)) {
			acc.push(caminho);
		}
	}
	return acc;
}

describe('o interruptor do modo classico NAO existe mais', () => {
	it('o modulo nao exporta a chave nem o esconderijo', () => {
		expect(modoClassico.modoClassicoLigado).toBeUndefined();
		expect(modoClassico.esconderNoModoClassico).toBeUndefined();
		expect(typeof modoClassico.apanharInterrompeACaminhada).toBe('function');
	});

	it('nenhum arquivo de src/ chama a chave ou o esconderijo', () => {
		const culpados = fontesDoCliente().filter(f =>
			/modoClassicoLigado|esconderNoModoClassico/.test(semComentario(readFileSync(f, 'utf8')))
		);
		expect(culpados).toEqual([]);
	});

	it('o Config.js de producao nao tem mais `modoClassico`', () => {
		expect(semComentario(ler('applications/pwa/Config.js'))).not.toMatch(/\bmodoClassico\b/);
	});

	it('a ROConfig nao religa nada: `modoClassico: false` nao muda o golpe em quem anda', () => {
		const ACTION = { WALK: 1, IDLE: 0 };
		globalThis.window.ROConfig = { modoClassico: false };
		try {
			expect(modoClassico.apanharInterrompeACaminhada({ ACTION, action: ACTION.WALK, walk: { index: 2, total: 8 } })).toBe(
				false
			);
		} finally {
			delete globalThis.window.ROConfig;
		}
	});

	it('o ataque original do roBrowser segue intacto: clique no mob manda a acao 7', () => {
		expect(ler('src/Controls/EntityControl.js')).toMatch(/pkt\.action\s*=\s*7/);
	});
});

describe('a interface do idle saiu do cliente', () => {
	it('as pastas da janela "Idle", do "Ataque auto" e da Dock nao existem', () => {
		for (const pasta of ['IdleConfig', 'CombatCornerIdle', 'DockIdle']) {
			expect(existsSync(join(raiz, 'src', 'UI', 'Components', pasta)), pasta).toBe(false);
		}
	});

	it('nenhum arquivo de src/ importa um dos tres', () => {
		const culpados = fontesDoCliente().filter(f =>
			/from ['"][^'"]*(IdleConfig|CombatCornerIdle|DockIdle)\//.test(readFileSync(f, 'utf8'))
		);
		expect(culpados).toEqual([]);
	});

	it('o menu nao tem mais o item "Idle"; a Analise de caca aparece (sem esconderijo)', () => {
		const html = ler('src/UI/Components/TopMenuIdle/TopMenuIdle.html').replace(/<!--[\s\S]*?-->/g, '');
		expect(html).not.toMatch(/data-action="config"/);
		expect(html).toMatch(/data-action="analyzer"/);
		const js = semComentario(ler('src/UI/Components/TopMenuIdle/TopMenuIdle.js'));
		expect(js).not.toMatch(/case 'config':/);
		expect(js).toMatch(/case 'analyzer':/);
	});

	it('a rotacao de skills sumiu da janela de Habilidades (o aprender/esquecer/barra ficam)', () => {
		const js = semComentario(ler('src/UI/Components/IdleSkills/IdleSkills.js'));
		expect(js).not.toMatch(/RAGIDLE_PRIORIZAR/);
		expect(js).not.toMatch(/data-skill-rotacao|is-btn-rotacao|is-no-selo--rotacao/);
		expect(js).toMatch(/function sendEsquecer\(/);
		expect(js).toMatch(/data-skill-atalho/);
	});

	it('o tutorial da caca automatica fica desligado de vez, sem flag', () => {
		const js = semComentario(ler('src/UI/Components/TutorialIdle/TutorialIdle.js'));
		const pronta = js.slice(js.indexOf('TutorialIdle.interfacePronta = function'));
		expect(pronta.slice(0, pronta.indexOf('};'))).not.toMatch(/pedirAoServidor/);
		expect(js).toMatch(/function onTutorialRecebido\(\) \{\s*\}/);
		expect(js).not.toMatch(/getComponent\('IdleConfig'\)|'IdleConfig'/);
	});
});

describe('apanhar andando nao congela o boneco (vale sempre)', () => {
	const ACTION = { WALK: 1, IDLE: 0 };
	it('andando com rota viva, o golpe NAO toca o HURT', () => {
		expect(modoClassico.apanharInterrompeACaminhada({ ACTION, action: ACTION.WALK, walk: { index: 2, total: 8 } })).toBe(false);
	});
	it('parado, ou no fim da rota, o golpe toca o HURT como sempre', () => {
		expect(modoClassico.apanharInterrompeACaminhada({ ACTION, action: ACTION.IDLE, walk: { index: 0, total: 0 } })).toBe(true);
		expect(modoClassico.apanharInterrompeACaminhada({ ACTION, action: ACTION.WALK, walk: { index: 8, total: 8 } })).toBe(true);
		expect(modoClassico.apanharInterrompeACaminhada({ ACTION, action: ACTION.IDLE, walk: { index: 2, total: 8 } })).toBe(true);
	});
	it('o golpe recebido consulta a decisao antes do HURT', () => {
		const fonte = ler('src/Engine/MapEngine/Entity.js');
		expect(fonte).toMatch(/dstEntity\.action !== dstEntity\.ACTION\.DIE && apanharInterrompeACaminhada\(dstEntity\)/);
	});
});

describe('a tela anda como no roBrowser puro (sempre)', () => {
	it('a caminhada nova nao e adiantada pela latencia: devolve o agora, sem ler o serverTick', () => {
		const fonte = semComentario(ler('src/Renderer/Entity/EntityWalk.js'));
		const i = fonte.indexOf('function computeWalkStartTick');
		expect(i).toBeGreaterThan(-1);
		const corpo = fonte.slice(i, fonte.indexOf('\n}', i));
		expect(corpo).toMatch(/return nowTick;/);
		expect(corpo).not.toMatch(/serverTick/);
	});
	it('quem sai da tela continua andando: os dois descartes chamam o walk antes de pular o desenho', () => {
		const fonte = ler('src/Renderer/EntityManager.js');
		for (const contador of ['descartadosPorDistancia++', 'descartadosPorTela++']) {
			const i = fonte.indexOf(contador);
			expect(i, contador).toBeGreaterThan(0);
			const ate = fonte.indexOf('continue;', i);
			expect(fonte.slice(i, ate), contador).toMatch(/seguirAndandoSemDesenhar\(_list\[i\]\)/);
		}
		const helper = fonte.slice(fonte.indexOf('function seguirAndandoSemDesenhar'));
		expect(helper.slice(0, 220)).toMatch(/entity\.walk\.total > 0/);
		expect(helper.slice(0, 220)).toMatch(/entity\.walkProcess\(\);/);
	});
});
