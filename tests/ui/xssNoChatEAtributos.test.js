/**
 * XSS remoto jogador-contra-jogador (D-1308).
 *
 * Uma auditoria provou varios caminhos fonte->sink em que o texto CRU de outro
 * jogador (fala, sussurro, nome de personagem, assunto de correio, dialogo de
 * NPC) chegava a `innerHTML`/atributo sem escapar e rodava JavaScript no
 * navegador da vitima. Estes testes provam a NEUTRALIZACAO: nome/mensagem com
 * `<img src=x onerror=...>`, com `"><script>` e com o literal
 * `<span class="nickname-link">` saem como TEXTO (nenhum elemento injetado),
 * enquanto um link de item LEGITIMO do servidor continua clicavel.
 *
 * A regra do conserto e uma so: ESCAPAR PRIMEIRO, TRANSFORMAR DEPOIS. O texto
 * do jogador nunca decide se ele e HTML.
 */

import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { escaparHtml } from 'Utils/escaparHtml.js';
import { renderFalaSegura, spanDeLinkDeItem, spanDeNickname } from 'UI/Components/ChatBox/textoSeguroDoChat.js';

/** Injeta um HTML e devolve o <div> para inspecao. */
function desenhar(html) {
	const div = document.createElement('div');
	div.innerHTML = html;
	return div;
}

/** As tres cargas que a tarefa manda provar, em nome/mensagem/assunto. */
const CARGA_IMG = '<img src=x onerror="window.__xss_provado = true">';
const CARGA_SCRIPT = '"><script>window.__xss_provado = true</script>';
const CARGA_NICK = '<span class="nickname-link" data-nickname="x">clique</span>';

describe('escaparHtml — o escapador unico (Utils/escaparHtml.js)', () => {
	it('escapa os CINCO caracteres, inclusive as aspas', () => {
		expect(escaparHtml(`& < > " '`)).toBe('&amp; &lt; &gt; &quot; &#39;');
	});

	it('trata null/undefined/numero sem quebrar', () => {
		expect(escaparHtml(null)).toBe('');
		expect(escaparHtml(undefined)).toBe('');
		expect(escaparHtml(42)).toBe('42');
	});

	it('fecha a FUGA DE ATRIBUTO — era o furo do round-trip por textContent', () => {
		// O padrao de Rodex (`sender="..."`), PartyFriends (`data-tooltip="..."`)
		// e NpcBox (`data-navi-info="..."`): um valor de jogador dentro de um
		// atributo entre aspas duplas.
		const nome = 'a"><img src=x onerror="window.__xss_provado = true">';
		const div = desenhar(`<span sender="${escaparHtml(nome)}">x</span>`);
		expect(div.querySelector('img')).toBeNull();
		// O atributo guarda o valor ORIGINAL (o navegador desfaz as entidades),
		// entao quem le `getAttribute('sender')` continua recebendo o nome certo.
		expect(div.firstChild.getAttribute('sender')).toBe(nome);
	});
});

describe('spanDeLinkDeItem — link de item seguro', () => {
	it('um link LEGITIMO do servidor continua clicavel', () => {
		const link = '<ITEM>Red Potion<INFO>501</INFO></ITEM>';
		const div = desenhar(spanDeLinkDeItem(link, { cor: '#FFFF63', cursor: true }));
		const span = div.querySelector('.item-link');
		expect(span).not.toBeNull();
		expect(span.textContent).toBe('<Red Potion>');
		// O clique reabre a ficha por `data-item`: tem que guardar a etiqueta CRUA.
		expect(span.dataset.item).toBe(link);
	});

	it('o NOME do item (formato <ITEM>) nao vira HTML', () => {
		const link = `<ITEM>${CARGA_IMG}<INFO>501</INFO></ITEM>`;
		const div = desenhar(spanDeLinkDeItem(link));
		expect(div.querySelector('img')).toBeNull();
		expect(div.querySelector('.item-link')).not.toBeNull();
	});

	it('uma aspa no nome nao escapa do atributo data-item', () => {
		const link = '<ITEM>a"><img src=x onerror="window.__xss_provado = true"><INFO>1</INFO></ITEM>';
		const div = desenhar(spanDeLinkDeItem(link));
		expect(div.querySelector('img')).toBeNull();
	});
});

describe('renderFalaSegura — a fala do jogador', () => {
	it('<img onerror> DIGITADO sai como texto', () => {
		const div = desenhar(renderFalaSegura(CARGA_IMG, seg => escaparHtml(seg)));
		expect(div.querySelector('img')).toBeNull();
		expect(div.textContent).toContain('<img');
	});

	it('"><script> DIGITADO sai como texto', () => {
		const div = desenhar(renderFalaSegura(`Fulano : ${CARGA_SCRIPT}`, seg => escaparHtml(seg)));
		expect(div.querySelector('script')).toBeNull();
		expect(div.textContent).toContain('<script>');
	});

	it('o literal <span class="nickname-link"> DIGITADO nao vira link — sai como texto', () => {
		// Este era o gatilho do override: digitar isto ligava o innerHTML cru.
		const div = desenhar(renderFalaSegura(CARGA_NICK, seg => escaparHtml(seg)));
		expect(div.querySelector('.nickname-link')).toBeNull();
		expect(div.textContent).toContain('nickname-link');
	});

	it('link LEGITIMO expande E o <img> em volta continua escapado', () => {
		const fala = `oi <ITEM>Red Potion<INFO>501</INFO></ITEM> ${CARGA_IMG}`;
		const div = desenhar(renderFalaSegura(fala, seg => escaparHtml(seg)));
		expect(div.querySelectorAll('.item-link').length).toBe(1);
		expect(div.querySelector('img')).toBeNull();
	});
});

describe('spanDeNickname — apelido clicavel do sussurro', () => {
	it('monta o link a partir do NOME, escapando atributo e texto', () => {
		const nome = `mau"><img src=x onerror="window.__xss_provado = true">`;
		const div = desenhar(spanDeNickname(nome));
		expect(div.querySelector('img')).toBeNull();
		const link = div.querySelector('.nickname-link');
		expect(link).not.toBeNull();
		// O clique responde por `data-nickname`: tem que guardar o nome original.
		expect(link.getAttribute('data-nickname')).toBe(nome);
		expect(link.textContent).toBe(nome);
	});
});

/* ─────────────────────────────────────────────────────────────────────────
   LIGACAO (D-1308): prova que cada sink foi REESCRITO para passar pelo
   escapador/renderizador seguro. Le o fonte, como linkDeItemNoChat.test.js.
   ───────────────────────────────────────────────────────────────────────── */

const ler = caminho => fs.readFileSync(caminho, 'utf8');

describe('os sinks foram reescritos', () => {
	it('ChatBox.addText NAO liga override a partir do texto', () => {
		const js = ler('src/UI/Components/ChatBox/ChatBox.js');
		// O gatilho antigo (dentro do replace de item) e o sniff de nickname
		// sumiram; o render passa por renderFalaSegura.
		expect(js).not.toMatch(/override = true;/);
		expect(js).not.toContain('class="nickname-link"/.test');
		expect(js).toContain("import { renderFalaSegura } from './textoSeguroDoChat.js'");
		expect(js).toContain('renderFalaSegura(textoDaLinha');
		// ...e textoDaLinha e o texto do proprio jogador, intocado, ou a linha do servidor traduzida.
		expect(js).toContain('doJogador ? msg.text : linhaNoIdioma(msg.text)');
	});

	it('WhisperBox.addText escapa e nao tem mais o ramo override', () => {
		const js = ler('src/UI/Components/WhisperBox/WhisperBox.js');
		expect(js).toContain('renderFalaSegura(text');
		expect(js).not.toMatch(/let override = false;/);
	});

	it('PrivateMessage monta o apelido do NOME e o corpo escapado', () => {
		const js = ler('src/Engine/MapEngine/PrivateMessage.js');
		expect(js).toContain('spanDeNickname(pkt.sender)');
		expect(js).toContain('spanDeNickname(user)');
		expect(js).toContain('renderFalaSegura(msg');
		// O nickname-link cru (com data-nickname="pkt.sender") nao existe mais.
		expect(js).not.toContain('data-nickname="\' +');
	});

	it('Rodex escapa titulo e remetente (inclusive no atributo sender)', () => {
		const js = ler('src/UI/Components/Rodex/Rodex.js');
		expect(js).toContain('escaparHtml(title)');
		expect(js).toContain('sender="${escaparHtml(sender)}"');
		expect(js).not.toContain('sender="${sender}"');
	});

	it('Mail escapa remetente e assunto', () => {
		const js = ler('src/UI/Components/Mail/Mail.js');
		expect(js).toContain('escaparHtml(from_name)');
		expect(js).toContain('escaparHtml(Mail.list.mailList[i].FromName)');
		expect(js).toContain('escaparHtml(header)');
		expect(js).toContain('escaparHtml(Mail.list.mailList[i].HEADER)');
	});

	it('NpcBox escapa os atributos e nomes do dialogo', () => {
		// Desde 12/10/2026 a fala inteira passa por `textoDoNpc.js` (o texto fora
		// das tags tambem e escapado; portao `textoDoNpcEscapado.test.js`).
		const js = ler('src/UI/Components/NpcBox/textoDoNpc.js');
		expect(js).toContain('escaparHtml(naviInfo)');
		expect(js).toContain('escaparHtml(itemId)');
		expect(js).toContain('escaparHtml(itemName)');
	});

	it('PartyFriends: o _escapeHTML agora escapa aspas (contexto de atributo)', () => {
		const js = ler('src/UI/Components/PartyFriends/PartyFriendsCommon.js');
		expect(js).toMatch(/_escapeHTML[\s\S]*?replace\(\/"\/g, '&quot;'\)/);
	});

	it('DBManager escapa o nome do dono da arma forjada', () => {
		const js = ler('src/DB/DBManager.js');
		expect(js).toContain('escaparHtml(DB.CNameTable[GID])');
	});
});
