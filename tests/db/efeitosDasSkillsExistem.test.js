import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/*
 * V7 (07/10/2026): AS 15 SKILLS COM EFEITO/SOM QUEBRADO NO CLIENTE.
 *
 * `EffectManager.spam` e `spamSkillZone` voltam EM SILENCIO quando a chave nao existe
 * no EffectTable: a skill ficava sem efeito e sem som e ninguem via. Este portao le o
 * FONTE (o EffectTable importa o renderizador inteiro, o vitest nao o carrega) e exige,
 * para cada uma das 15:
 *   1. toda chave que SkillEffect.js/SkillUnit.js cita EXISTE no EffectTable.js;
 *   2. todo .wav e todo STR/SPR desses efeitos esta na lista de arquivos CONFERIDOS no
 *      GRF (tests/fixtures/assets-das-skills-verificados.json, feita com tools/grf).
 * O GRF nao mora neste repo, entao a conferencia de EXISTENCIA e contra essa lista:
 * apontar para outro arquivo reprova ate alguem conferi-lo no GRF e acrescenta-lo.
 */
const EFEITO = readFileSync('src/DB/Skills/SkillEffect.js', 'latin1').replace(/\r\n/g, '\n');
const UNIDADE = readFileSync('src/DB/Skills/SkillUnit.js', 'latin1').replace(/\r\n/g, '\n');
const CONST = readFileSync('src/DB/Effects/EffectConst.js', 'latin1').replace(/\r\n/g, '\n');
const TABELA = readFileSync('src/DB/Effects/EffectTable.js', 'latin1').replace(/\r\n/g, '\n');
const VERIFICADOS = new Set(
	JSON.parse(readFileSync('tests/fixtures/assets-das-skills-verificados.json', 'utf8')).arquivos.map(a =>
		a.toLowerCase()
	)
);

// skill -> unidade de chao que o servidor manda (SkillUnitConst), quando ha
const SKILLS = {
	AM_POTIONPITCHER: null,
	CR_SHRINK: null,
	MO_BALKYOUNG: null,
	MO_COMBOFINISH: null,
	RG_CLOSECONFINE: null,
	SA_DELUGE: 'UNT_DELUGE',
	SA_VIOLENTGALE: 'UNT_VIOLENTGALE',
	SA_LANDPROTECTOR: 'UNT_LANDPROTECTOR',
	SA_VOLCANO: 'UNT_VOLCANO',
	TF_SPRINKLESAND: null,
	HT_ANKLESNARE: 'UNT_ANKLESNARE',
	RG_GRAFFITI: 'UNT_GRAFFITI',
	HT_SHOCKWAVE: 'UNT_SHOCKWAVE',
	SA_ELEMENTWIND: null,
	SA_LIGHTNINGLOADER: null
};

// Unidade que e EF_NONE DE PROPOSITO: o grafite e um balao de fala (Entity.js onSkillAppear)
const SEM_EFEITO_DE_PROPOSITO = new Set(['UNT_GRAFFITI']);

const CHAVES_DA_TABELA = new Set(
	[...TABELA.matchAll(/^\t(?:'([^']+)'|([A-Za-z_]\w*|\d+)):\s*\[/gm)].map(m => m[1] ?? m[2])
);

function entradaDa(chave) {
	const i = TABELA.search(new RegExp(String.raw`^	(?:'${chave}'|${chave}):\s*\[`, 'm'));
	if (i < 0) return '';
	const j = TABELA.indexOf('\n\t],', i);
	return TABELA.slice(i, j < 0 ? undefined : j);
}

/** Chaves (numero ou texto) citadas no lado direito de SkillEffect[SK.NOME]. */
function chavesDoEfeito(nome) {
	const m = EFEITO.match(new RegExp(String.raw`^SkillEffect\[SK\.${nome}\] = (\{.*\});`, 'm'));
	expect(m, `${nome} sem entrada no SkillEffect.js`).not.toBeNull();
	const chaves = [];
	for (const campo of m[1].matchAll(/(\w*[Ee]ffectId\w*):\s*(\[[^\]]*\]|[^,}]+)/g)) {
		for (const v of campo[2].matchAll(/'([^']+)'|(\d+)/g)) chaves.push(v[1] ?? v[2]);
	}
	return chaves;
}

function chaveDaUnidade(unt) {
	const m = UNIDADE.match(new RegExp(String.raw`SkillUnit\[SU\.${unt}\] = (.+);`));
	expect(m, `${unt} sem entrada no SkillUnit.js`).not.toBeNull();
	const ec = m[1].match(/^EC\.(\w+)/);
	if (ec) {
		const c = CONST.match(new RegExp(String.raw`(?:^|\W)${ec[1]}:\s*(-?\d+)`, 'm'));
		expect(c, `${ec[1]} sem valor no EffectConst.js`).not.toBeNull();
		return { nome: ec[1], chave: c[1] };
	}
	return { nome: m[1], chave: m[1].replace(/['"]/g, '') };
}

describe('as 15 skills: toda chave de efeito resolve no EffectTable', () => {
	for (const [skill, unt] of Object.entries(SKILLS)) {
		it(`${skill}: SkillEffect nao cita chave inexistente`, () => {
			for (const chave of chavesDoEfeito(skill)) {
				expect(CHAVES_DA_TABELA.has(chave), `${skill} cita a chave '${chave}', que nao existe no EffectTable`).toBe(true);
			}
		});
		if (unt) {
			it(`${skill}: a unidade ${unt} resolve (ou e EF_NONE de proposito)`, () => {
				const { nome, chave } = chaveDaUnidade(unt);
				if (nome === 'EF_NONE') {
					expect(SEM_EFEITO_DE_PROPOSITO.has(unt), `${unt} e EF_NONE sem estar na lista de proposito`).toBe(true);
					return;
				}
				expect(CHAVES_DA_TABELA.has(chave), `${unt} aponta '${chave}', que nao existe no EffectTable`).toBe(true);
			});
		}
	}
});

describe('as 15 skills: os arquivos dos efeitos existem no GRF (lista conferida)', () => {
	const chaves = new Set();
	for (const [skill, unt] of Object.entries(SKILLS)) {
		chavesDoEfeito(skill).forEach(c => CHAVES_DA_TABELA.has(c) && chaves.add(c));
		if (unt) {
			const { nome, chave } = chaveDaUnidade(unt);
			if (nome !== 'EF_NONE' && CHAVES_DA_TABELA.has(chave)) chaves.add(chave);
		}
	}

	for (const chave of chaves) {
		it(`efeito ${chave}: wav, STR e SPR estao na lista conferida`, () => {
			const texto = entradaDa(chave);
			expect(texto, `entrada ${chave} vazia`).not.toBe('');
			// um bloco por parte do efeito: cada `{ ... }` de nivel 2
			for (const parte of texto.split(/\n\t\t\{/).slice(1)) {
				const tipo = (parte.match(/type:\s*'(\w+)'/) || [])[1];
				const arq = (parte.match(/\bfile:\s*'([^']+)'/) || [])[1];
				const wav = (parte.match(/\bwav:\s*'([^']+)'/) || [])[1];
				if (wav && !/%d/.test(wav)) {
					expect(VERIFICADOS.has(`data/wav/${wav}.wav`.toLowerCase()), `efeito ${chave}: wav 'data/wav/${wav}.wav' nao conferido no GRF`).toBe(true);
				}
				if (tipo === 'STR' && arq && !/%d/.test(arq)) {
					expect(VERIFICADOS.has(`data/texture/effect/${arq}.str`.toLowerCase()), `efeito ${chave}: STR '${arq}' nao conferido no GRF`).toBe(true);
				}
				if (tipo === 'SPR' && arq) {
					const pasta = '\u00c0\u00cc\u00c6\u00d1\u00c6\u00ae';
					expect(VERIFICADOS.has(`data/sprite/${pasta}/${arq}.spr`.toLowerCase()), `efeito ${chave}: SPR '${arq}' nao conferido no GRF`).toBe(true);
				}
			}
		});
	}

	it('o conjunto de efeitos conferido nao esta vazio (o portao nao pode passar no vazio)', () => {
		expect(chaves.size).toBeGreaterThanOrEqual(7);
	});
});

/*
 * V7 (07/10): AS 11 SKILLS SEM ARTE ORIGINAL GANHAM UMA ANIMACAO APROXIMADA (decisao do dono).
 * O EF original dessas skills nao existe no EffectTable nem nos GRFs; cada uma reaproveita
 * o efeito parecido que JA funciona. Aqui: cada uma tem de citar as chaves esperadas, que tem
 * de existir no EffectTable e NAO ser vazias (`[{}]`), com a marca APROXIMACAO no comentario.
 * Os arquivos (wav/STR/SPR) dessas chaves sao conferidos pelo describe acima (lista conferida).
 */
const APROXIMADAS = {
	AM_POTIONPITCHER: ['312'],
	CR_SHRINK: ['1'],
	MO_BALKYOUNG: ['263', '1'],
	TF_SPRINKLESAND: ['308', '147'],
	MO_COMBOFINISH: ['quake', '1'],
	RG_CLOSECONFINE: ['604', '276'],
	SA_DELUGE: ['240', '256'],
	SA_VOLCANO: ['239', '255'],
	SA_VIOLENTGALE: ['241', '257'],
	SA_LANDPROTECTOR: ['242', '258']
};

describe('as skills sem arte original: animacao aproximada reaproveita efeito existente', () => {
	for (const [skill, esperadas] of Object.entries(APROXIMADAS)) {
		it(`${skill}: cita ${esperadas.join(' + ')}, todas existem e nao estao vazias`, () => {
			const chaves = chavesDoEfeito(skill);
			for (const e of esperadas) {
				expect(chaves, `${skill} nao cita o efeito ${e}`).toContain(e);
				expect(CHAVES_DA_TABELA.has(e), `efeito ${e} nao existe no EffectTable`).toBe(true);
				const corpo = entradaDa(e);
				expect(corpo.replace(/\s+/g, ''), `efeito ${e} esta vazio`).not.toMatch(/^[^:]+:\[\{\}\]/);
				expect(corpo.length, `efeito ${e} sem conteudo`).toBeGreaterThan(60);
			}
		});
		it(`${skill}: a linha de cima marca a APROXIMACAO do dono`, () => {
			const linhas = EFEITO.split('\n');
			const i = linhas.findIndex(l => l.startsWith(`SkillEffect[SK.${skill}] =`));
			expect(i).toBeGreaterThan(0);
			expect(linhas[i - 1]).toMatch(/^\/\/ V7 \(07\/10\): APROXIMACAO do dono; o original EF_\w+ \(id \d+\) nao tem arte/);
		});
	}
});

/*
 * D18 (07/10): 14 DAS 20 SKILLS COM SkillEffect VAZIO GANHAM ANIMACAO APROXIMADA (decisao do dono).
 * Mesmo criterio do V7-ASSETS2: reaproveitar efeito existente e coerente (tema/elemento/classe).
 * As outras 6 ficam vazias de proposito (efeito ja vem de outro lugar, ou nao ha parecido).
 */
const APROXIMADAS_D18 = {
	AM_CALLHOMUN: ['304'],
	AM_CANNIBALIZE: ['147'],
	AM_RESURRECTHOMUN: ['77', '140'],
	AM_SPHEREMINE: ['51'],
	MO_BLADESTOP: ['11'],
	MO_BODYRELOCATION: ['304'],
	MO_CALLSPIRITS: ['263'],
	MO_KITRANSLATION: ['312'],
	PR_REDEMPTIO: ['77', '140'],
	RG_CLEANER: ['16'],
	SA_ABRACADABRA: ['234'],
	SA_AUTOSPELL: ['234'],
	TF_BACKSLIDING: ['16'],
	WZ_ESTIMATION: ['234']
};
const VAZIAS_D18 = ['AL_TELEPORT', 'BD_ADAPTATION', 'KN_AUTOCOUNTER', 'MG_SIGHT', 'WZ_SIGHTBLASTER', 'RG_FLAGGRAFFITI'];

describe('D18: skills antes vazias ganham animacao aproximada com efeito existente', () => {
	for (const [skill, esperadas] of Object.entries(APROXIMADAS_D18)) {
		it(`${skill}: cita ${esperadas.join(' + ')}, existem, nao vazias e com arquivos conferidos`, () => {
			const chaves = chavesDoEfeito(skill);
			for (const e of esperadas) {
				expect(chaves, `${skill} nao cita o efeito ${e}`).toContain(e);
				expect(CHAVES_DA_TABELA.has(e), `efeito ${e} nao existe no EffectTable`).toBe(true);
				const corpo = entradaDa(e);
				expect(corpo.replace(/\s+/g, ''), `efeito ${e} esta vazio`).not.toMatch(/^[^:]+:\[\{\}\]/);
				expect(corpo.length, `efeito ${e} sem conteudo`).toBeGreaterThan(60);
				for (const parte of corpo.split(/\n\t\t\{/).slice(1)) {
					const tipo = (parte.match(/type:\s*'(\w+)'/) || [])[1];
					const arq = (parte.match(/\bfile:\s*'([^']+)'/) || [])[1];
					const wav = (parte.match(/\bwav:\s*'([^']+)'/) || [])[1];
					if (wav && !/%d/.test(wav)) {
						expect(VERIFICADOS.has(`data/wav/${wav}.wav`.toLowerCase()), `efeito ${e}: wav '${wav}' nao conferido no GRF`).toBe(true);
					}
					if (tipo === 'STR' && arq && !/%d/.test(arq)) {
						expect(VERIFICADOS.has(`data/texture/effect/${arq}.str`.toLowerCase()), `efeito ${e}: STR '${arq}' nao conferido no GRF`).toBe(true);
					}
				}
			}
		});
		it(`${skill}: a linha de cima marca a APROXIMACAO D18 e diz qual efeito reutiliza`, () => {
			const linhas = EFEITO.split('\n');
			const i = linhas.findIndex(l => l.startsWith(`SkillEffect[SK.${skill}] =`));
			expect(i).toBeGreaterThan(0);
			expect(linhas[i - 1]).toMatch(new RegExp(String.raw`^// D18 \(07/10\): APROXIMACAO do dono; ${skill} estava vazio .* usa (o|os) efeitos? ${esperadas[0]}\b`));
		});
	}

	for (const skill of VAZIAS_D18) {
		it(`${skill}: segue sem effectId e explica por que no comentario`, () => {
			const m = EFEITO.match(new RegExp(String.raw`^SkillEffect\[SK\.${skill}\] = (\{[^;]*\});`, 'm'));
			expect(m, `${skill} sem entrada`).not.toBeNull();
			expect(m[1].replace(/\/\*[\s\S]*?\*\//g, '')).not.toMatch(/[Ee]ffectId\s*:/);
			const linhas = EFEITO.split('\n');
			const i = linhas.findIndex(l => l.startsWith(`SkillEffect[SK.${skill}] =`));
			const acima = linhas.slice(Math.max(0, i - 3), i).join('\n');
			expect(acima).toMatch(/D18 \(07\/10\): FICA /);
		});
	}
});
