/**
 * A FALA DO NPC E ESCAPADA INTEIRA, MENOS AS TAGS DO RO (12/10/2026, auditoria
 * anti-exploit). Ate aqui so o conteudo de `<ITEM>`/`<NAVI>` era escapado; o
 * texto fora delas ia cru para o `innerHTML` da caixa de dialogo.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { textoDoNpcEmHtml } from '../../src/UI/Components/NpcBox/textoDoNpc.js';

describe('a fala do NPC em HTML (12/10/2026)', () => {
	it('o HTML fora das tags do RO chega como texto', () => {
		const html = textoDoNpcEmHtml('Ola <img src=x onerror=alert(1)> & "ate" logo');
		expect(html).not.toContain('<img');
		expect(html).toBe('Ola &lt;img src=x onerror=alert(1)&gt; &amp; &quot;ate&quot; logo');
	});

	it('o link de item continua um span, com o nome e o id escapados', () => {
		expect(textoDoNpcEmHtml('Leve <ITEM>Pocao <b><INFO>501</INFO></ITEM> agora')).toBe(
			'Leve <span class="item-link" data-item-id="501">Pocao &lt;b&gt;</span> agora',
		);
		expect(textoDoNpcEmHtml('<ITEMLINK>Faca<INFO>1201</INFO></ITEMLINK>')).toBe(
			'<span class="item-link" data-item-id="1201">Faca</span>',
		);
	});

	it('o link de navegacao continua um span, com a aspa escapada', () => {
		expect(textoDoNpcEmHtml('Va a <NAVI>Prontera"x<INFO>prontera,150,180</INFO></NAVI>.')).toBe(
			'Va a <span class="navi-link" data-navi-info="prontera,150,180" data-navi-name="Prontera&quot;x">Prontera&quot;x</span>.',
		);
	});

	it('a cor do RO continua virando span, e o texto entre as tags e escapado', () => {
		expect(textoDoNpcEmHtml('^FF0000<script>^000000 e <ITEM>A<INFO>1</INFO></ITEM><i>')).toBe(
			'<span style="color:#FF0000">&lt;script&gt;<span style="color:#000000"> e <span class="item-link" data-item-id="1">A</span>&lt;i&gt;',
		);
	});

	it('vazio e nao-texto', () => {
		expect(textoDoNpcEmHtml('')).toBe('');
		expect(textoDoNpcEmHtml(undefined)).toBe('');
		expect(textoDoNpcEmHtml(42)).toBe('42');
	});

	it('a caixa de dialogo passa as duas escritas em innerHTML pelo modulo', () => {
		const fonte = readFileSync('src/UI/Components/NpcBox/NpcBox.js', 'utf8');
		const escritas = fonte.match(/\.innerHTML = [^;]+;/g) ?? [];
		const daFala = escritas.filter((e) => /text|traducao/.test(e));
		expect(daFala).toEqual(['.innerHTML = textoDoNpcEmHtml(text);', '.innerHTML = textoDoNpcEmHtml(achado.traducao);']);
	});
});
