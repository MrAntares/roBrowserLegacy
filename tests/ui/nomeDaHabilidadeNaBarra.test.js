/**
 * O NOME DA HABILIDADE NA BARRA, NO MESMO IDIOMA DAS JANELAS (01/10/2026).
 *
 * O balao de nivel do slot e a dica do slot diziam "Fire Bolt" (o `SkillName`
 * do `SkillInfo`, a tabela do cliente), enquanto a janela de Habilidades e a
 * Configuracao idle diziam "Lancas de Fogo" (o `nome` que o servidor manda, lido
 * do `skillinfoz1` do GRF). A barra nao tem pacote proprio com o nome: ele
 * chega pelas duas janelas, que o registram aqui — o mesmo caminho do SP por
 * nivel (`lembrarSpPorNivel`, D-1908). A Configuracao idle e sondada a cada
 * entrada no mapa (`IdleConfig.sondarMapa`), entao o nome chega sem o jogador
 * abrir janela nenhuma.
 *
 * As perguntas:
 * 1. O nome que as janelas receberam vira o nome da barra?
 * 2. O servidor sem traducao manda o proprio id ("MG_FIREBOLT") como `nome`:
 *    isso NAO pode tomar o lugar de "Fire Bolt".
 * 3. A barra fica sabendo quando um nome chega (para refazer as dicas), uma
 *    vez por lote, e nao quando nada mudou?
 * 4. As tres leituras da barra (o balao, a dica e a dica refeita) e as duas
 *    janelas que alimentam passam pela mesma memoria?
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import SkillInfo from '../../src/DB/Skills/SkillInfo.js';
import { aoLembrarNomes, lembrarNomesDasHabilidades, nomeLembrado, nomeNaBarra } from '../../src/UI/nivelDeUso.js';

// `process.cwd()`, como nos vizinhos (`barraDeAtalhosNativa.test.js`): o vitest roda na raiz do fork.
const FONTE = p => readFileSync(join(process.cwd(), 'src', ...p.split('/')), 'utf8');

describe('a memoria do nome da habilidade', () => {
	it('o nome que a janela recebeu vira o nome lembrado', () => {
		expect(nomeLembrado('NB_TESTE_A')).toBeNull();
		lembrarNomesDasHabilidades([{ skillId: 'NB_TESTE_A', nome: 'Lanças de Teste' }]);
		expect(nomeLembrado('NB_TESTE_A')).toBe('Lanças de Teste');
	});

	it('o id devolvido como nome (servidor sem traducao) nao e lembrado', () => {
		lembrarNomesDasHabilidades([{ skillId: 'NB_TESTE_B', nome: 'NB_TESTE_B' }]);
		expect(nomeLembrado('NB_TESTE_B')).toBeNull();
		lembrarNomesDasHabilidades([{ skillId: 'NB_TESTE_C', nome: '' }, { skillId: 'NB_TESTE_C' }, null]);
		expect(nomeLembrado('NB_TESTE_C')).toBeNull();
	});

	it('avisa a barra UMA vez por lote com novidade, e nao avisa sem novidade', () => {
		let avisos = 0;
		const parar = aoLembrarNomes(() => {
			avisos++;
		});
		lembrarNomesDasHabilidades([
			{ skillId: 'NB_TESTE_D', nome: 'Um' },
			{ skillId: 'NB_TESTE_E', nome: 'Dois' }
		]);
		expect(avisos).toBe(1);
		lembrarNomesDasHabilidades([{ skillId: 'NB_TESTE_D', nome: 'Um' }]);
		expect(avisos).toBe(1);
		lembrarNomesDasHabilidades([{ skillId: 'NB_TESTE_D', nome: 'Um de novo' }]);
		expect(avisos).toBe(2);
		parar();
		lembrarNomesDasHabilidades([{ skillId: 'NB_TESTE_D', nome: 'Tres' }]);
		expect(avisos).toBe(2);
	});
});

describe('o nome que a barra desenha', () => {
	it('o lembrado vence o da tabela do cliente; sem ele, o da tabela; sem tabela, o id', () => {
		const info = { Name: 'NB_TESTE_F', SkillName: 'Test Bolt' };
		expect(nomeNaBarra(info, 9001)).toBe('Test Bolt');
		lembrarNomesDasHabilidades([{ skillId: 'NB_TESTE_F', nome: 'Raio de Teste' }]);
		expect(nomeNaBarra(info, 9001)).toBe('Raio de Teste');
		expect(nomeNaBarra(undefined, 9001)).toBe('9001');
	});
});

describe('a Piada Congelante (BA_FROSTJOKE do cliente x BA_FROSTJOKER do servidor)', () => {
	it('sem nome lembrado a barra mostra o nome em portugues, e nao o ingles "Unbarring Octave" (V7)', () => {
		const info = Object.values(SkillInfo).find(i => i && i.Name === 'BA_FROSTJOKE');
		expect(info).toBeDefined();
		expect(nomeLembrado('BA_FROSTJOKE')).toBeNull();
		expect(nomeNaBarra(info, info.ID ?? 394)).toBe('Piada Congelante');
	});
});

describe('a costura: quem le e quem alimenta', () => {
	const barra = FONTE('UI/Components/ShortCut/ShortCut.js');

	it('o balao e a dica do slot leem o nome por nomeNaBarra, e nao pelo SkillName cru', () => {
		expect(barra).toMatch(/nome: ID => nomeNaBarra\(SkillInfo\[ID\], ID\)/);
		expect(barra).toMatch(/nome: nomeNaBarra\(info, ID\)/);
		expect(barra).not.toMatch(/nome: info \? info\.SkillName/);
	});

	it('a barra refaz as dicas quando um nome chega', () => {
		expect(barra).toMatch(/aoLembrarNomes\(\(\) => ShortCut\.__loaded && ShortCut\.updateAllTooltips\(\)\)/);
	});

	it('a janela de Habilidades alimenta a memoria (a Configuracao idle saiu em 07/10/2026)', () => {
		expect(FONTE('UI/Components/IdleSkills/IdleSkills.js')).toMatch(/lembrarNomesDasHabilidades\(data\.skills\)/);
	});
});
