/**
 * O MODO DESCANSO / ECONOMIA DE ENERGIA VOLTOU PARA O BOT NOVO (bug #10 de
 * 13/10/2026, decisao do dono: "sim, trazer de volta").
 *
 * Substitui `economiaSoASaida`, que provava a AUSENCIA do pedido, da opcao e da
 * tela preta (retirados em 07/10/2026, D-1931). Agora cobra o contrario: o
 * `ZC_RAGIDLE_ECONOMIA` tem UM dono que abre a tela preta com `ativa:true`, fecha
 * com `ativa:false` e volta pelo boot com `expulso:true`; a opcao esta nas
 * Configuracoes de Video; a tela preta existe e nao usa travessao.
 *
 * `MapEngine.js` nao carrega em jsdom; o fio e cobrado no fonte SEM comentario.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

function semComentario(texto) {
	return texto.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}

const MOTOR = semComentario(readFileSync('src/Engine/MapEngine.js', 'utf8'));
const UI_BRUTO = readFileSync('src/UI/UIManager.js', 'utf8');
const UI = semComentario(UI_BRUTO);

function corpoDe(fonte, assinatura) {
	const i = fonte.indexOf(assinatura);
	expect(i, assinatura).toBeGreaterThan(-1);
	return fonte.slice(i, fonte.indexOf('\n}', i));
}

describe('o dono do ZC_RAGIDLE_ECONOMIA', () => {
	it('um gancho, um dono', () => {
		expect(MOTOR.match(/hookPacket\(PACKET\.ZC\.RAGIDLE_ECONOMIA,/g)).toHaveLength(1);
		expect(MOTOR).toMatch(/Network\.hookPacket\(PACKET\.ZC\.RAGIDLE_ECONOMIA, onEconomiaRecebida\);/);
	});

	it('`ativa:true` abre a tela preta com o tempo restante (e marca a morte), sem mandar `sair` sozinho', () => {
		const corpo = corpoDe(MOTOR, 'function onEconomiaRecebida(pkt)');
		const ativa = corpo.slice(corpo.indexOf('corpo.ativa === true'), corpo.indexOf('fecharTelaDaEconomia();'));
		expect(ativa).toMatch(/abrirTelaDaEconomia\(Number\(corpo\.restanteMs\) \|\| 0\)/);
		expect(ativa).toMatch(/corpo\.morreu === true/);
		expect(ativa).not.toMatch(/acao: 'sair'/);
	});

	it('`ativa:false` (ack do sair ou recusa sem-bot) fecha a tela', () => {
		const corpo = corpoDe(MOTOR, 'function onEconomiaRecebida(pkt)');
		expect(corpo).toContain('fecharTelaDaEconomia();');
	});

	it('`expulso:true` (o teto venceu) ainda volta pelo boot', () => {
		const corpo = corpoDe(MOTOR, 'function onEconomiaRecebida(pkt)');
		expect(corpo).toMatch(/corpo\.expulso === true\) \{\s*import\('Engine\/GameEngine\.js'\)\.then\(m => m\.default\.reload\(\)\);/);
	});

	it('o clique em "Voltar a jogar" manda `sair` e fecha a tela na hora', () => {
		const corpo = corpoDe(MOTOR, 'function sairDaEconomiaDeEnergia()');
		expect(corpo).toMatch(/acao: 'sair'/);
		expect(corpo).toMatch(/Network\.sendPacket\(pkt\)/);
		expect(corpo).toMatch(/fecharTelaDaEconomia\(\)/);
	});
});

describe('a tela preta e a opcao voltaram', () => {
	it('a tela preta da economia existe e e o casco compartilhado com o Dormir', () => {
		expect(UI).toMatch(/static showEconomiaDeEnergia\(restanteMs, onVoltar\)/);
		const i = UI.indexOf('static showEconomiaDeEnergia(');
		expect(UI.slice(i, i + 600)).toMatch(/_telaPretaDeEspera\(/);
	});

	it('os textos novos do jogador nao usam travessao (regra do dono)', () => {
		const i = UI_BRUTO.indexOf('static showEconomiaDeEnergia(');
		const fim = UI_BRUTO.indexOf('Prompt a message to the user', i);
		const textos = [...UI_BRUTO.slice(i, fim).matchAll(/(['"`])((?:\\.|(?!\1).)*)\1/g)].map(m => m[2]).join('\n');
		expect(textos).not.toMatch(/[—–]/);
		expect(textos).toContain('O Bot parou');
	});

	it('a opcao esta nas Configuracoes de Video, nasce ligada e grava a preferencia', () => {
		expect(readFileSync('src/Preferences/Graphics.js', 'utf8')).toMatch(/economiaDeEnergiaAutomatica: true,/);
		expect(readFileSync('src/UI/Components/GraphicsOption/GraphicsOption.html', 'utf8')).toContain('class="economia-automatica"');
		const js = readFileSync('src/UI/Components/GraphicsOption/GraphicsOption.js', 'utf8');
		expect(js).toContain("bindChange('.economia-automatica', onToggleEconomiaAutomatica);");
		expect(js).toContain('GraphicsSettings.economiaDeEnergiaAutomatica = !!this.checked;');
	});

	it('o interruptor do Modo Classico nao volta junto (o Bot novo e o unico modo)', () => {
		expect(MOTOR).not.toMatch(/modoClassicoLigado/);
		expect(semComentario(readFileSync('src/UI/Components/GraphicsOption/GraphicsOption.js', 'utf8'))).not.toMatch(/modoClassicoLigado/);
	});
});
