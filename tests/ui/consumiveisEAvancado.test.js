/**
 * AS ABAS CONSUMIVEIS E AVANCADO do menu do Bot (decisoes D3-C1 e D4-A3 do dono, 08/10/2026):
 *  - edicao pura do bloco `consumiveis` (pocoes de velocidade e Asa de Mosca com gatilhos opcionais);
 *  - as explicacoes de cada status em frase de jogador (nunca id ou termo interno);
 *  - a COSTURA na janela real: as abas so com a capacidade; Consumiveis suja o RASCUNHO; Avancado so le e se
 *    atualiza sozinho enquanto a aba esta aberta.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
	CONSUMIVEIS_PADRAO,
	FAIXAS_PADRAO,
	alternarBuff,
	alternarGatilho,
	definirGatilho,
	definirReserva,
	faixasDasCapacidades,
	lerConsumiveis,
	ligarAsa,
	ligarBuffs
} from 'UI/Components/BotMenu/edicaoDeConsumiveis.js';
import { EXPLICACAO_DO_STATUS, FRASE_DO_STATUS, explicacaoDoStatus, fraseDoStatus } from 'UI/Components/BotMenu/estadoDoBot.js';
import { duracaoPorExtenso } from 'UI/Components/BotMenu/editorDeConsumiveis.js';

vi.mock('Network/NetworkManager.js', () => ({
	default: { sendPacket: vi.fn(), hookPacket: vi.fn() }
}));
vi.mock('Renderer/Renderer.js', () => ({ default: { render: vi.fn(), stop: vi.fn(), width: 1280, height: 720 } }));
vi.mock('UI/UIManager.js', () => ({ default: { showErrorBox: vi.fn(), addComponent: c => c } }));
vi.mock('DB/DBManager.js', () => ({ default: { getItemInfo: () => ({ identifiedDisplayName: 'Unknown Item' }) } }));
vi.mock('UI/itemNaTela.js', () => ({ aplicarIconeDoItem: (img, id) => img.setAttribute('src', '/ragidle/item/' + id + '.png') }));

const html = readFileSync(join(__dirname, '..', '..', 'src', 'UI', 'Components', 'BotMenu', 'BotMenu.html'), 'utf8');

function congelar(o) {
	if (o && typeof o === 'object') {
		Object.values(o).forEach(congelar);
		Object.freeze(o);
	}
	return o;
}

describe('edicao dos consumiveis (pura)', () => {
	it('servidor velho sem o bloco le o padrao desligado; nada muta a recebida', () => {
		const c = congelar({ v: 1 });
		expect(lerConsumiveis(c)).toEqual({ buffs: { ligado: false, itens: [] }, asa: { ligada: false, semAlvoPorSegundos: 10, cercadoPor: 0, hpAbaixoDe: 0, reserva: 0 } });
		expect(CONSUMIVEIS_PADRAO.asa.semAlvoPorSegundos).toBe(10);
		const nova = ligarAsa(ligarBuffs(c, true), true);
		expect(nova.consumiveis.buffs.ligado).toBe(true);
		expect(nova.consumiveis.asa.ligada).toBe(true);
		// Os dois interruptores sao INDEPENDENTES.
		expect(lerConsumiveis(ligarBuffs(c, true)).asa.ligada).toBe(false);
		expect(lerConsumiveis(ligarAsa(c, true)).buffs.ligado).toBe(false);
	});

	it('o bloco incompleto completa campo a campo e descarta lixo na lista', () => {
		expect(lerConsumiveis({ consumiveis: { buffs: { itens: [645, 'x', 1.5] }, asa: { hpAbaixoDe: 40 } } })).toEqual({
			buffs: { ligado: false, itens: [645] },
			asa: { ligada: false, semAlvoPorSegundos: 10, cercadoPor: 0, hpAbaixoDe: 40, reserva: 0 }
		});
	});

	it('pocoes: escolher e tirar; o teto; sem pocao o interruptor se desliga sozinho', () => {
		let c = alternarBuff({ v: 1 }, 645, 2);
		c = alternarBuff(c, 656, 2);
		expect(lerConsumiveis(c).buffs.itens).toEqual([645, 656]);
		expect(alternarBuff(c, 657, 2), 'passou do teto').toBe(c);
		c = ligarBuffs(c, true);
		c = alternarBuff(alternarBuff(c, 645, 2), 656, 2);
		expect(lerConsumiveis(c).buffs).toEqual({ ligado: false, itens: [] });
	});

	it('a ordem da lista e a da escolha (a prioridade do Bot)', () => {
		const c = alternarBuff(alternarBuff(alternarBuff({ v: 1 }, 657), 645), 656);
		expect(lerConsumiveis(c).buffs.itens).toEqual([657, 645, 656]);
	});

	it('asa: ligar sem gatilho nenhum devolve o de ociosidade ao padrao (a recusa do servidor vira dica)', () => {
		let c = { v: 1, consumiveis: { buffs: { ligado: false, itens: [] }, asa: { ligada: false, semAlvoPorSegundos: 0, cercadoPor: 0, hpAbaixoDe: 0, reserva: 0 } } };
		c = ligarAsa(c, true);
		expect(lerConsumiveis(c).asa).toMatchObject({ ligada: true, semAlvoPorSegundos: 10 });
		// Com outro gatilho ja ligado, nao mexe no de ociosidade.
		const so = ligarAsa({ v: 1, consumiveis: { buffs: { ligado: false, itens: [] }, asa: { ligada: false, semAlvoPorSegundos: 0, cercadoPor: 0, hpAbaixoDe: 30, reserva: 0 } } }, true);
		expect(lerConsumiveis(so).asa).toMatchObject({ ligada: true, semAlvoPorSegundos: 0, hpAbaixoDe: 30 });
	});

	it('gatilhos: a caixa liga com o valor padrao e desliga com 0; o numero respeita a faixa; 0 digitado desliga', () => {
		let c = alternarGatilho({ v: 1 }, 'hpAbaixoDe');
		expect(lerConsumiveis(c).asa.hpAbaixoDe).toBe(30);
		c = alternarGatilho(c, 'hpAbaixoDe');
		expect(lerConsumiveis(c).asa.hpAbaixoDe).toBe(0);
		expect(lerConsumiveis(alternarGatilho({ v: 1 }, 'cercadoPor')).asa.cercadoPor).toBe(3);
		expect(lerConsumiveis(alternarGatilho({ v: 1, consumiveis: { asa: { semAlvoPorSegundos: 0 } } }, 'semAlvoPorSegundos')).asa.semAlvoPorSegundos).toBe(10);
		expect(lerConsumiveis(definirGatilho({ v: 1 }, 'hpAbaixoDe', 500)).asa.hpAbaixoDe).toBe(FAIXAS_PADRAO.asaHpMaximo);
		expect(lerConsumiveis(definirGatilho({ v: 1 }, 'hpAbaixoDe', 1)).asa.hpAbaixoDe).toBe(FAIXAS_PADRAO.asaHpMinimo);
		expect(lerConsumiveis(definirGatilho({ v: 1 }, 'cercadoPor', 99)).asa.cercadoPor).toBe(FAIXAS_PADRAO.asaCercadoMaximo);
		expect(lerConsumiveis(definirGatilho({ v: 1 }, 'semAlvoPorSegundos', 1)).asa.semAlvoPorSegundos).toBe(FAIXAS_PADRAO.asaSemAlvoMinimo);
		expect(lerConsumiveis(definirGatilho(alternarGatilho({ v: 1 }, 'hpAbaixoDe'), 'hpAbaixoDe', 0)).asa.hpAbaixoDe).toBe(0);
		expect(lerConsumiveis(definirGatilho(alternarGatilho({ v: 1 }, 'hpAbaixoDe'), 'hpAbaixoDe', 'abc')).asa.hpAbaixoDe).toBe(0);
		const c0 = congelar({ v: 1 });
		expect(alternarGatilho(c0, 'inexistente')).toBe(c0);
		expect(definirGatilho(c0, 'inexistente', 5)).toBe(c0);
	});

	it('a reserva: 0 a 99, arredondada', () => {
		expect(lerConsumiveis(definirReserva({ v: 1 }, 7.6)).asa.reserva).toBe(8);
		expect(lerConsumiveis(definirReserva({ v: 1 }, 500)).asa.reserva).toBe(FAIXAS_PADRAO.asaReservaMaxima);
		expect(lerConsumiveis(definirReserva({ v: 1 }, -3)).asa.reserva).toBe(0);
		expect(lerConsumiveis(definirReserva({ v: 1 }, 'x')).asa.reserva).toBe(0);
	});

	it('as faixas do servidor valem sobre as de fabrica', () => {
		expect(faixasDasCapacidades({ asaHpMaximo: 60, buffsDeItem: 3 })).toMatchObject({ asaHpMaximo: 60, buffsDeItem: 3, asaHpMinimo: FAIXAS_PADRAO.asaHpMinimo });
		expect(faixasDasCapacidades(undefined)).toEqual(FAIXAS_PADRAO);
		expect(lerConsumiveis(definirGatilho({ v: 1 }, 'hpAbaixoDe', 90, faixasDasCapacidades({ asaHpMaximo: 60 }))).asa.hpAbaixoDe).toBe(60);
	});
});

describe('as frases do Avancado', () => {
	it('toda frase curta tem a explicacao, e nenhuma explicacao fala de id, codigo ou arquitetura', () => {
		for (const codigo of Object.keys(FRASE_DO_STATUS)) {
			expect(EXPLICACAO_DO_STATUS[codigo], 'sem explicacao: ' + codigo).toBeTruthy();
		}
		for (const [codigo, texto] of Object.entries(EXPLICACAO_DO_STATUS)) {
			expect(texto, codigo).not.toMatch(/\bID\b|planner|gateway|executor|snapshot|servidor|\b[a-z]+-[a-z]+-[a-z]+\b/i);
		}
	});

	it('o alvo e o detalhe entram na explicacao; sem status cai no controle manual; codigo desconhecido, na falha', () => {
		expect(explicacaoDoStatus({ codigo: 'atacando', alvo: { nome: 'Poring', especie: 1002 } })).toBe('O Bot está lutando contra Poring.');
		expect(explicacaoDoStatus({ codigo: 'indo-ate-alvo', alvo: null })).toBe('O Bot escolheu o alvo e está andando até ele.');
		expect(explicacaoDoStatus({ codigo: 'armazem-indisponivel', alvo: null, detalhe: 'sem-kafra' })).toContain(': sem Kafra na cidade');
		expect(explicacaoDoStatus(null)).toBe(EXPLICACAO_DO_STATUS['controle-manual']);
		expect(explicacaoDoStatus({ codigo: 'nao-existe', alvo: null })).toBe(EXPLICACAO_DO_STATUS['falha-operacional']);
		expect(fraseDoStatus({ codigo: 'usando-asa-de-mosca', alvo: null })).toBe('Usando Asa de Mosca');
		expect(fraseDoStatus({ codigo: 'mantendo-pocao-de-velocidade', alvo: null })).toBe('Bebendo poção de velocidade');
	});

	it('a duracao por extenso', () => {
		expect(duracaoPorExtenso(35_000)).toBe('35 s');
		expect(duracaoPorExtenso(250_000)).toBe('4 min 10 s');
		expect(duracaoPorExtenso(3_900_000)).toBe('1 h 05 min');
		expect(duracaoPorExtenso(-5)).toBe('0 s');
	});
});

describe('a costura das abas Consumiveis e Avancado na janela real', () => {
	afterEach(() => {
		vi.useRealTimers();
	});

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
		const chamada = Network.hookPacket.mock.calls.at(-1);
		const receber = d => chamada[1]({ json: JSON.stringify(d) });
		const desde = Network.sendPacket.mock.calls.length;
		const enviados = () => Network.sendPacket.mock.calls.slice(desde).map(c => JSON.parse(c[0].json));
		return { BotMenu, Network, receber, enviados };
	}
	const status = (secoes, extra = {}) => ({
		v: 1,
		tipo: 'status',
		requestId: null,
		personagemId: 7,
		mapa: 'prt_fild08',
		ok: true,
		erro: null,
		problemas: [],
		revisao: 4,
		config: {
			v: 1,
			cacar: true,
			raioDePercepcao: 12,
			especiesVetadas: [],
			modoDeAtaque: 'skills-e-basico',
			skills: { geral: [], porSkill: {}, porMonstro: {} },
			postura: { tipo: 'tank', fallbackMelee: false },
			consumiveis: { buffs: { ligado: false, itens: [] }, asa: { ligada: false, semAlvoPorSegundos: 10, cercadoPor: 0, hpAbaixoDe: 0, reserva: 0 } }
		},
		ligado: false,
		situacao: 'desligado',
		status: { codigo: 'controle-manual', alvo: null },
		statusRevision: 0,
		capacidades: { contrato: 1, versaoDaConfig: 1, limites: { buffsDeItem: 6, asaHpMinimo: 5, asaHpMaximo: 80, asaCercadoMinimo: 2, asaCercadoMaximo: 10, asaSemAlvoMinimo: 3, asaSemAlvoMaximo: 20, asaReservaMaxima: 99 }, secoes },
		monstros: [],
		skills: [],
		pocoes: [],
		consumiveis: {
			buffs: [
				{ itemId: 645, nome: 'Poção de Concentração', quantidade: 3, serve: true, motivo: null, ativo: false },
				{ itemId: 656, nome: 'Poção do Despertar', quantidade: 2, serve: false, motivo: 'nivel', ativo: false },
				{ itemId: 657, nome: 'Poção da Fúria', quantidade: 0, serve: true, motivo: null, ativo: true }
			],
			asa: { quantidade: 4, vip: false }
		},
		diagnostico: null,
		...extra
	});
	const abas = host => [...host.querySelectorAll('.bm-abas .ri-tab')].map(b => b.textContent);
	const irPara = (host, nome) => [...host.querySelectorAll('.bm-abas .ri-tab')].find(b => b.textContent === nome).click();

	it('sem a capacidade as abas nao aparecem; com ela entram na ordem do menu', async () => {
		const { BotMenu, receber } = await montar();
		receber(status(['cacada']));
		expect(abas(BotMenu._host)).not.toContain('Consumíveis');
		expect(abas(BotMenu._host)).not.toContain('Avançado');
		receber(status(['cacada', 'ataque', 'consumiveis', 'avancado', 'perfis'], { statusRevision: 1 }));
		const nomes = abas(BotMenu._host);
		expect(nomes).toEqual(expect.arrayContaining(['Consumíveis', 'Avançado']));
		expect(nomes.indexOf('Consumíveis')).toBeLessThan(nomes.indexOf('Perfis'));
		expect(nomes.at(-1), 'o Avançado fecha a barra').toBe('Avançado');
	});

	it('Consumiveis mostra as pocoes com nome, icone, quantidade e o motivo; o aviso VIP aparece sem o passe', async () => {
		const { BotMenu, receber } = await montar();
		receber(status(['cacada', 'consumiveis']));
		irPara(BotMenu._host, 'Consumíveis');
		const lis = [...BotMenu._host.querySelectorAll('.bm-buffs-lista .bm-buff')];
		expect(lis.map(l => l.querySelector('.bm-item-nome').textContent)).toEqual(['Poção de Concentração', 'Poção do Despertar', 'Poção da Fúria']);
		expect(lis[0].querySelector('.bm-item-icone').getAttribute('src')).toBe('/ragidle/item/645.png');
		expect(lis[0].querySelector('.bm-quantidade').textContent).toBe('x3');
		expect(lis[1].querySelector('.bm-buff-nota').textContent).toBe('Não serve: seu nível ainda não permite');
		expect(lis[1].classList.contains('is-indisponivel')).toBe(true);
		expect(lis[2].querySelector('.bm-buff-nota').textContent).toBe('Ativa agora');
		expect(BotMenu._host.querySelector('.bm-asa-quantidade').textContent).toBe('4');
		expect(BotMenu._host.querySelector('.bm-asa-sem-vip').hidden).toBe(false);
		// Controle: com o passe o aviso some.
		receber(status(['cacada', 'consumiveis'], { statusRevision: 1, consumiveis: { buffs: [], asa: { quantidade: 4, vip: true } } }));
		expect(BotMenu._host.querySelector('.bm-asa-sem-vip').hidden).toBe(true);
		expect(BotMenu._host.querySelector('.bm-buffs-vazio').hidden).toBe(false);
	});

	it('escolher pocao, ligar a asa e ajustar os gatilhos sujam o RASCUNHO; nada vai ao servidor ate o Salvar', async () => {
		const { BotMenu, Network, receber, enviados } = await montar();
		receber(status(['cacada', 'consumiveis']));
		irPara(BotMenu._host, 'Consumíveis');
		const host = BotMenu._host;
		const antes = Network.sendPacket.mock.calls.length;
		const escolher = host.querySelector('.bm-buff[data-item="645"] .bm-buff-escolher');
		escolher.checked = true;
		escolher.dispatchEvent(new Event('change'));
		const ligado = host.querySelector('.bm-buffs-ligado');
		expect(ligado.disabled).toBe(false);
		ligado.checked = true;
		ligado.dispatchEvent(new Event('change'));
		const asa = host.querySelector('.bm-asa-ligada');
		asa.checked = true;
		asa.dispatchEvent(new Event('change'));
		const caixaHp = host.querySelector('.bm-gatilho-hp input[type="checkbox"]');
		caixaHp.checked = true;
		caixaHp.dispatchEvent(new Event('change'));
		const numeroHp = host.querySelector('.bm-gatilho-hp input[type="number"]');
		expect([numeroHp.min, numeroHp.max, numeroHp.disabled, numeroHp.value]).toEqual(['5', '80', false, '30']);
		numeroHp.value = '45';
		numeroHp.dispatchEvent(new Event('change'));
		const reserva = host.querySelector('.bm-asa-reserva');
		reserva.value = '2';
		reserva.dispatchEvent(new Event('change'));
		expect(Network.sendPacket.mock.calls.length).toBe(antes);
		const edit = BotMenu._estado.estado().editConfig.consumiveis;
		expect(edit).toEqual({ buffs: { ligado: true, itens: [645] }, asa: { ligada: true, semAlvoPorSegundos: 10, cercadoPor: 0, hpAbaixoDe: 45, reserva: 2 } });
		host.querySelector('.bm-aplicar').click();
		const pedido = enviados().at(-1);
		expect(pedido.verbo).toBe('aplicar');
		expect(pedido.config.consumiveis).toEqual(edit);
		// O gatilho desmarcado fica desligado e o numero acompanha.
		const outro = host.querySelector('.bm-gatilho-cercado input[type="number"]');
		expect(outro.disabled).toBe(true);
	});

	it('sem pocao escolhida o interruptor das pocoes fica desabilitado', async () => {
		const { BotMenu, receber } = await montar();
		receber(status(['cacada', 'consumiveis']));
		irPara(BotMenu._host, 'Consumíveis');
		expect(BotMenu._host.querySelector('.bm-buffs-ligado').disabled).toBe(true);
	});

	it('Avancado mostra o status em frase e a explicacao, e os contadores da sessao; ao abrir pede o diagnostico', async () => {
		const { BotMenu, receber, enviados } = await montar();
		receber(status(['cacada', 'avancado'], { ligado: true, situacao: 'ativo', status: { codigo: 'sem-alvo-valido', alvo: null } }));
		BotMenu._host.querySelector('.bm-window').classList.add('is-open');
		irPara(BotMenu._host, 'Avançado');
		const host = BotMenu._host;
		expect(host.querySelector('.bm-diag-status').textContent).toBe('Sem alvo válido');
		expect(host.querySelector('.bm-diag-explicacao').textContent).toContain('Nenhum monstro ao alcance serve agora');
		expect(host.querySelector('.bm-diag-sessao').hidden, 'sem diagnostico recebido a sessao fica escondida').toBe(true);
		const pedidos = enviados().filter(p => p.verbo === 'pedir');
		expect(pedidos.length, 'a aba nao pediu o diagnostico ao abrir').toBeGreaterThan(0);
		// A resposta ao pedir traz o diagnostico.
		receber({
			...status(['cacada', 'avancado'], { ligado: true, situacao: 'ativo' }),
			tipo: 'resposta',
			requestId: pedidos.at(-1).requestId,
			status: { codigo: 'coletando', alvo: null },
			statusRevision: 1,
			diagnostico: { status: { codigo: 'atacando', alvo: { nome: 'Poring', especie: 1002 } }, sessao: { desdeMs: 250_000, abates: 12, pocoes: 3, flechas: 1, asas: 2, buffs: 4 } }
		});
		expect(host.querySelector('.bm-diag-sessao').hidden).toBe(false);
		expect(host.querySelector('.bm-diag-status').textContent).toBe('Atacando Poring');
		expect(host.querySelector('.bm-diag-explicacao').textContent).toBe('O Bot está lutando contra Poring.');
		expect(host.querySelector('.bm-diag-tempo').textContent).toBe('Ligado há 4 min 10 s');
		expect(['abates', 'pocoes', 'flechas', 'asas', 'buffs'].map(k => host.querySelector('.bm-diag-' + k).textContent)).toEqual(['12', '3', '1', '2', '4']);
		// Desligado: o tempo diz "Bot desligado" (um pedido NOVO: o anterior ja foi respondido).
		BotMenu._estado.pedirEstado();
		receber({
			...status(['cacada', 'avancado']),
			tipo: 'resposta',
			requestId: enviados().filter(p => p.verbo === 'pedir').at(-1).requestId,
			statusRevision: 2,
			diagnostico: { status: { codigo: 'controle-manual', alvo: null }, sessao: { desdeMs: null, abates: 0, pocoes: 0, flechas: 0, asas: 0, buffs: 0 } }
		});
		expect(host.querySelector('.bm-diag-tempo').textContent).toBe('Bot desligado');
	});

	it('o Avancado se atualiza sozinho a cada 5 s SO enquanto a aba esta aberta E a janela tambem', async () => {
		vi.useFakeTimers();
		const { BotMenu, receber, enviados } = await montar();
		const janela = BotMenu._host.querySelector('.bm-window');
		const pedidos = () => enviados().filter(p => p.verbo === 'pedir').length;
		const redesenhar = n => receber(status(['cacada', 'avancado'], { statusRevision: n }));
		// 1. Janela aberta numa OUTRA aba (Cacada): nada e pedido.
		janela.classList.add('is-open');
		redesenhar(0);
		const base = pedidos();
		vi.advanceTimersByTime(20_000);
		expect(pedidos(), 'pediu fora da aba Avancado').toBe(base);
		// 2. Na aba Avancado, mas com a JANELA fechada: nada e pedido.
		irPara(BotMenu._host, 'Avançado');
		const comAba = pedidos();
		expect(comAba, 'a aba nao pediu o diagnostico ao abrir').toBe(base + 1);
		janela.classList.remove('is-open');
		redesenhar(1);
		vi.advanceTimersByTime(20_000);
		expect(pedidos(), 'pediu com a janela fechada').toBe(comAba);
		// 3. Janela aberta de novo na aba: pede ao abrir e a cada 5 s.
		janela.classList.add('is-open');
		redesenhar(2);
		const aoAbrir = pedidos();
		expect(aoAbrir).toBe(comAba + 1);
		vi.advanceTimersByTime(5_000);
		expect(pedidos()).toBe(aoAbrir + 1);
		vi.advanceTimersByTime(10_000);
		expect(pedidos()).toBe(aoAbrir + 3);
		// 4. Saindo da aba, para.
		irPara(BotMenu._host, 'Caçada');
		vi.advanceTimersByTime(30_000);
		expect(pedidos(), 'seguiu pedindo com a aba fechada').toBe(aoAbrir + 3);
	});
});
