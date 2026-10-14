/**
 * MONSTROS DO MAPA (segunda rodada dos ajustes do dono, 09/10/2026, item 4.4), na janela real montada no jsdom:
 * a lista traz os monstros do mapa de agora com a caixa MARCADA; desmarcar = ignorar (`especiesVetadas`); o card
 * ignorado ganha a borda vermelha premium (com texto e aria, nao so cor); a troca de mapa atualiza a lista e os
 * vetos de outros mapas ficam gravados e recolhidos, com o jeito de reativar.
 */
import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

vi.mock('Network/NetworkManager.js', () => ({
	default: { sendPacket: vi.fn(), hookPacket: vi.fn() }
}));
vi.mock('Renderer/Renderer.js', () => ({ default: { render: vi.fn(), stop: vi.fn(), width: 1280, height: 720 } }));
vi.mock('UI/UIManager.js', () => ({ default: { showErrorBox: vi.fn(), addComponent: c => c } }));
vi.mock('DB/DBManager.js', () => ({ default: { getItemInfo: () => ({ identifiedDisplayName: 'Unknown Item' }) } }));

const PASTA = join(__dirname, '..', '..', 'src', 'UI', 'Components', 'BotMenu');
const html = readFileSync(join(PASTA, 'BotMenu.html'), 'utf8');
const css = readFileSync(join(PASTA, 'BotMenu.css'), 'utf8');

async function montar() {
	vi.resetModules();
	localStorage.clear();
	const { default: Network } = await import('Network/NetworkManager.js');
	const { default: BotMenu } = await import('UI/Components/BotMenu/BotMenu.js');
	BotMenu._host = document.createElement('div');
	BotMenu._host.innerHTML = html;
	BotMenu._shadow = null;
	BotMenu.draggable = () => {};
	BotMenu.init();
	// D-2385: a janela FECHADA nao desenha (so guarda e suja); estes casos olham a janela aberta.
	BotMenu._host.querySelector('.bm-window').classList.add('is-open');
	const chamada = Network.hookPacket.mock.calls.at(-1);
	const receber = d => chamada[1]({ json: JSON.stringify(d) });
	const desde = Network.sendPacket.mock.calls.length;
	const enviados = () => Network.sendPacket.mock.calls.slice(desde).map(c => JSON.parse(c[0].json));
	return { BotMenu, receber, enviados, host: BotMenu._host };
}

const config = (extra = {}) => ({
	v: 1,
	cacar: true,
	raioDePercepcao: 12,
	especiesVetadas: [],
	modoDeAtaque: 'skills-e-basico',
	skills: { geral: [], porSkill: {}, porMonstro: {} },
	sobrevivencia: {
		pocoesHp: { itens: [], abaixoDe: 50, auto: true },
		pocoesSp: { itens: [], abaixoDe: 50, auto: true },
		descanso: { sentarHpAbaixoDe: 0, sentarSpAbaixoDe: 0, levantarEm: 100 }
	},
	suporte: { lista: [] },
	coleta: { ligada: true, raio: 20, ignorar: [] },
	flechas: { ligada: true, modo: 'automatico', fixa: null, permitidas: [], porMonstro: {} },
	armazem: { ligado: false, cidade: null, pesoAcimaDe: 0, depositar: [], reservas: [], repor: [], tetoDeGasto: 0, voltar: true },
	...extra
});

const TODAS = ['cacada', 'ataque', 'suporte', 'sobrevivencia', 'consumiveis', 'coleta', 'flechas', 'postura', 'armazem', 'perfis', 'avancado'];

function status(monstros, cfg = config(), mapa = 'prt_fild08') {
	return {
		v: 1,
		tipo: 'status',
		requestId: null,
		personagemId: 7,
		mapa,
		contexto: { mapa, rotuloDoMapa: mapa, ehCidade: false },
		ok: true,
		erro: null,
		problemas: [],
		revisao: 0,
		config: cfg,
		ligado: false,
		situacao: 'desligado',
		status: { codigo: 'controle-manual', alvo: null },
		statusRevision: 0,
		capacidades: { contrato: 1, versaoDaConfig: 1, limites: { raioDeColetaMinimo: 1, raioDeColetaMaximo: 20 }, secoes: TODAS },
		monstros,
		skills: [],
		pocoes: [],
		municoes: [],
		municao: { vip: true, manual: null, tetoAutomatico: 4 },
		consumiveis: { buffs: [], asa: { quantidade: 0, vip: true } }
	};
}

const NO_CAMPO = [
	{ especie: 1002, nome: 'Poring', noMapa: true },
	{ especie: 1113, nome: 'Drops', noMapa: true },
	{ especie: 1004, nome: 'Hornet', noMapa: true }
];

const cartao = (host, especie) => host.querySelector('.bm-monstros:not(.bm-monstros-outros) [data-especie="' + especie + '"]');

function ultimoAplicar(enviados) {
	const a = enviados().filter(e => e.verbo === 'aplicar').at(-1);
	expect(a, 'nenhum aplicar foi enviado').toBeTruthy();
	return a;
}

describe('4.4 Monstros do mapa', () => {
	it('o titulo e "Monstros do mapa" e todos os monstros do mapa chegam com a caixa MARCADA (ninguem ignorado)', async () => {
		const { host, receber } = await montar();
		receber(status(NO_CAMPO));
		expect(host.querySelector('[data-secao="cacada"] .bm-bloco .bm-rotulo').textContent).toBe('Monstros do mapa');
		const cartoes = [...host.querySelectorAll('.bm-monstros:not(.bm-monstros-outros) .bm-monstro')];
		expect(cartoes.map(c => c.getAttribute('data-especie')).sort()).toEqual(['1002', '1004', '1113']);
		for (const c of cartoes) {
			expect(c.getAttribute('role')).toBe('checkbox');
			expect(c.getAttribute('aria-checked')).toBe('true');
			expect(c.querySelector('input[type=checkbox]').checked).toBe(true);
			expect(c.classList.contains('is-ignorado')).toBe(false);
			expect(c.querySelector('.bm-monstro-estado')).toBeNull();
		}
		expect(host.querySelector('.bm-outros-mapas').hidden).toBe(true);
	});

	it('o gesto e INVERSO: desmarcar ignora (vai para especiesVetadas no Salvar); marcar de novo tira do veto', async () => {
		const { host, receber, enviados } = await montar();
		receber(status(NO_CAMPO));
		cartao(host, 1002).click();
		host.querySelector('.bm-aplicar').click();
		expect(ultimoAplicar(enviados).config.especiesVetadas).toEqual([1002]);
	});

	it('marcar de novo um card ignorado tira o veto do payload', async () => {
		const { host, receber, enviados } = await montar();
		receber(status(NO_CAMPO, config({ especiesVetadas: [1002] })));
		expect(cartao(host, 1002).getAttribute('aria-checked')).toBe('false');
		cartao(host, 1002).click();
		expect(cartao(host, 1002).getAttribute('aria-checked')).toBe('true');
		host.querySelector('.bm-aplicar').click();
		expect(ultimoAplicar(enviados).config.especiesVetadas).toEqual([]);
	});

	it('o card DESMARCADO ganha a borda vermelha premium, o texto "Ignorado" e aria-checked=false; os outros ficam como estavam', async () => {
		const { host, receber } = await montar();
		receber(status(NO_CAMPO));
		cartao(host, 1113).click();
		const ign = cartao(host, 1113);
		expect(ign.classList.contains('is-ignorado')).toBe(true);
		expect(ign.getAttribute('aria-checked')).toBe('false');
		expect(ign.querySelector('input[type=checkbox]').checked).toBe(false);
		expect(ign.querySelector('.bm-monstro-estado').textContent).toBe('Ignorado');
		expect(cartao(host, 1002).classList.contains('is-ignorado')).toBe(false);
		// A borda vem do vermelho do design system (token), nunca de uma cor solta.
		const regra = css.match(/#BotMenu \.bm-monstro\.is-ignorado \{[^}]*\}/);
		expect(regra, 'sem a regra do card ignorado').toBeTruthy();
		expect(regra[0]).toMatch(/border-color:\s*var\(--red-600\)/);
		expect(regra[0]).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
		expect(regra[0]).not.toMatch(/rgba?\(/);
	});

	it('a troca de mapa atualiza a lista; o veto de um monstro que nao esta no mapa continua gravado e aparece recolhido', async () => {
		const { host, receber, enviados } = await montar();
		receber(status(NO_CAMPO, config({ especiesVetadas: [1002] })));
		expect(cartao(host, 1002).classList.contains('is-ignorado')).toBe(true);
		// Outro mapa: so Zumbi e Esqueleto; o Poring vetado vem com noMapa=false.
		const outro = [
			{ especie: 1015, nome: 'Zombie', noMapa: true },
			{ especie: 1076, nome: 'Skeleton', noMapa: true },
			{ especie: 1002, nome: 'Poring', noMapa: false }
		];
		receber(status(outro, config({ especiesVetadas: [1002] }), 'gef_dun00'));
		const principais = [...host.querySelectorAll('.bm-monstros:not(.bm-monstros-outros) .bm-monstro')].map(c => c.getAttribute('data-especie'));
		expect(principais.sort()).toEqual(['1015', '1076']);
		const det = host.querySelector('.bm-outros-mapas');
		expect(det.hidden).toBe(false);
		expect(det.querySelector('summary').textContent).toMatch(/Ignorados em outros mapas \(1\)/);
		const reativar = det.querySelector('[data-especie="1002"]');
		expect(reativar.textContent).toMatch(/Reativar/);
		// O veto segue no payload: nada se perde com a troca de mapa (ignorar o Zumbi soma ao Poring de antes).
		cartao(host, 1015).click();
		host.querySelector('.bm-aplicar').click();
		expect(ultimoAplicar(enviados).config.especiesVetadas.sort()).toEqual([1002, 1015]);
	});

	it('Reativar, no recolhido de outros mapas, tira so aquele veto', async () => {
		const { host, receber, enviados } = await montar();
		receber(status([{ especie: 1015, nome: 'Zombie', noMapa: true }, { especie: 1002, nome: 'Poring', noMapa: false }], config({ especiesVetadas: [1002, 1076] }), 'gef_dun00'));
		host.querySelector('.bm-outros-mapas [data-especie="1002"]').click();
		host.querySelector('.bm-aplicar').click();
		expect(ultimoAplicar(enviados).config.especiesVetadas).toEqual([1076]);
	});

	it('config antiga sem noMapa no servidor segue valendo: a lista inteira vale como do mapa e o formato gravado nao muda', async () => {
		const { host, receber, enviados } = await montar();
		receber(status([{ especie: 1002, nome: 'Poring' }, { especie: 1113, nome: 'Drops' }], config({ especiesVetadas: [1113] })));
		expect(cartao(host, 1113).classList.contains('is-ignorado')).toBe(true);
		expect(cartao(host, 1002).classList.contains('is-ignorado')).toBe(false);
		cartao(host, 1002).click();
		host.querySelector('.bm-aplicar').click();
		const v = ultimoAplicar(enviados).config.especiesVetadas;
		expect(v.sort()).toEqual([1002, 1113]);
		expect(v.every(Number.isInteger)).toBe(true);
	});

	it('o teclado faz o mesmo gesto: Espaco no card desmarca', async () => {
		const { host, receber, enviados } = await montar();
		receber(status(NO_CAMPO));
		cartao(host, 1004).dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
		host.querySelector('.bm-aplicar').click();
		expect(ultimoAplicar(enviados).config.especiesVetadas).toEqual([1004]);
	});
});

describe('bug #16 (13/10/2026): o ignorado que e copia de praca mostra o nome e a imagem da original', () => {
	it('a copia [EXP] vetada noutro mapa aparece com o nome dela e a imagem da especie original (avatar); sem avatar, a propria', async () => {
		const { host, receber } = await montar();
		receber(
			status(
				[
					...NO_CAMPO,
					{ especie: 31150, nome: '[EXP] Dryad', noMapa: false, avatar: 1291 },
					{ especie: 31001, nome: '[ZENY] Santa Poring', noMapa: false }
				],
				config({ especiesVetadas: [31150, 31001] })
			)
		);
		const fora = especie => host.querySelector('.bm-monstros-outros [data-especie="' + especie + '"]');
		expect(fora(31150).textContent).toContain('[EXP] Dryad');
		expect(fora(31150).textContent).not.toContain('#31150');
		expect(fora(31150).querySelector('img').getAttribute('src')).toBe('/ragidle/mobs/1291.png');
		expect(fora(31001).textContent).toContain('[ZENY] Santa Poring');
		expect(fora(31001).querySelector('img').getAttribute('src')).toBe('/ragidle/mobs/31001.png');
		// O card do mapa de agora segue com a imagem da propria especie.
		expect(cartao(host, 1002).querySelector('img').getAttribute('src')).toBe('/ragidle/mobs/1002.png');
	});
});
