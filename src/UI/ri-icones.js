/**
 * UI/ri-icones.js
 *
 * Set unico de glifos do "Ragnarok Idle Design System" (DS oficial do dono,
 * fornecido em 18/08/2026 — SUBSTITUI a rodada anterior deste modulo, que
 * usava SVG preenchido com gradiente azul + acento dourado desenhado a mao.
 * Regra do DS, textual: "No emoji, and no hand-drawn SVG illustration
 * anywhere in this system."
 *
 * Cada chave deste objeto e uma STRING de SVG pronta pra virar innerHTML —
 * nunca um componente React/Vue, nunca DOM criado em JS.
 *
 * Receita de GLIFO (o DS e claro: o premio nao vem do glifo, vem do
 * TRATAMENTO em volta dele — ver ".ri-disc"/".ri-glass" em cada CSS de
 * componente):
 *   - estilo Lucide (MIT) — path data incorporado INLINE aqui, sem CDN nem
 *     dependencia de rede (o cliente roda local, sem internet em runtime);
 *   - stroke 2, stroke-linecap/stroke-linejoin round, fill NENHUM;
 *   - cor = currentColor — quem injeta controla a cor via CSS "color" no
 *     elemento pai (".ri-disc", ".ri-glass" etc.), nunca um valor fixo aqui;
 *   - viewBox "0 0 24 24" em todos, sem width/height fixo no proprio <svg>
 *     (o tamanho e 45% do diametro do disco/orbe que envolve o icone — essa
 *     conta mora no CSS de cada componente, nunca aqui).
 * Onde o path exato de um icone Lucide nao era conhecido de cor, o glifo foi
 * desenhado no MESMO idioma (2px, round, geometrico, sem detalhe barroco) —
 * marcado com comentario "(idioma Lucide)" nesses casos.
 *
 * Nomes OFICIAIS por item (extraidos do showcase ui_kits/game_hud/
 * BottomBar.jsx pelo dono, 19/08/2026 — complemento ao pivo de icones):
 * user (personagem), scroll-text (skills), backpack (inventario), shirt
 * (equipamento), shield (guilda), users (grupo), store (loja), menu (menu).
 * O showcase generico usa "sparkles" pro slot central deles, mas o NOSSO
 * central e "Caça" (feature real do jogo, nao o exemplo generico do DS) —
 * pra esse e os outros que o DS nao nomeia, a escolha ficou por conta deste
 * fork: map (caca), zap (auto — "swords ou zap", ambos aceitos pelo DS),
 * coins (zeny), settings (config, fora do escopo nomeado do DS).
 *
 * Uso tipico (ver DockIdle.js/TopMenuIdle.js/CombatCornerIdle.js/
 * BasicInfoIdle.js/TopBarIdle.js): o .html de cada componente troca o
 * <svg>...</svg> antigo por um marcador HTML "<!--RI_ICONE:chave-->", e o
 * render() do componente troca esse marcador pela string deste modulo antes
 * de devolver o innerHTML — ids/data-attrs/listeners de fora do <svg> nunca
 * mudam de lugar.
 *
 * ATUALIZACAO 19/08/2026 — o proprio design system OFICIAL marca o glifo
 * Lucide acima como "substituicao sinalizada": o conjunto real deveria vir
 * da arte convertida do cliente. Investigado (ver scripts/icones-de-menu.ts
 * em rag-idle-master): o GRF tem um set de glifo puro pronto pra isso,
 * `ro_menu_icon/<nome>_1.bmp` (36x36, chibi, fundo magenta, SEM caixa nem
 * texto pintado). 9 das 19 chaves usadas por este fork tinham candidato
 * aprovavel; essas 9 agora chamam `artReal(chave, <o mesmo svg de antes>)`
 * — o SVG antigo fica como RESERVA (usado se o PNG faltar, ver `onerror` em
 * `artReal`). As outras chaves continuam 100% Lucide, por dois motivos
 * possiveis (documentado key a key abaixo): o unico candidato do GRF tinha
 * letra pintada em pixel (guilda="G", zeny="Z" — o DS proibe texto dentro
 * do glifo), ou nao existe candidato nenhum pro conceito (loja, roshop,
 * troca, leilao, eventos, passe, menu, admin, grafico).
 *
 * ATUALIZACAO 01/09/2026 (onda de icones, emenda [DONO-1] assinada) — o dono
 * entregou um conjunto de 18 ilustracoes proprias para os botoes de
 * NAVEGACAO, e a regra de iconografia foi emendada: ARTE ILUSTRADA nos
 * discos de navegacao; traco Lucide continua em todo o resto (slots da
 * boneca, setas, controles dentro de janela, zeny/cash). As chaves de
 * navegacao agora chamam `arteUi(nome, <o mesmo glifo de antes>)`, que
 * resolve para `public/ragidle/ui-icons/<nome>.webp` (gerados por
 * vite/converter-ui-icons.mjs; de-para completo em docs/ui/mapa-icones.md).
 * A cadeia de reserva continua a mesma: se o WebP faltar, o onerror troca
 * pelo glifo vetorial embutido — o botao NUNCA fica vazio.
 * `auto` segue com a arte do GRF (o conjunto novo nao cobre o conceito).
 *
 * Todo <svg> daqui sai com aria-hidden="true": o glifo e DECORATIVO por
 * contrato — quem carrega nome acessivel e estado e o BOTAO em volta
 * (title/aria-label/aria-expanded, ver TopMenuIdle.js), nunca o desenho.
 *
 * @author RagIdle
 */

const svg = inner =>
	`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;

/**
 * Arte REAL do cliente (GRF, pasta ro_menu_icon -- ver
 * scripts/icones-de-menu.ts no rag-idle-master, que gerou os PNGs em
 * public/ragidle/dock-icons/<chave>.png) embrulhada num <svg> com <image>
 * em vez de <img> solto -- de PROPOSITO: e o unico jeito de reusar o
 * dimensionamento que ja existe em CSS sem tocar em NENHUM arquivo de CSS
 * (a regra e "nao toque em Common.css", e o dimensionamento -- 45% do disco
 * em ".ri-disc svg"/".ri-glass svg", 20x20 fixo em ".dk-icon-wrap svg" --
 * mira o seletor "svg", nao "img"). O <image> e um retangulo raster dentro
 * do proprio SVG: o navegador escala exatamente como escalaria um <img>.
 *
 * SEM "image-rendering:pixelated" aqui, de proposito: a regra 4 do
 * CLAUDE.md (rag-idle-master) manda pixelated pra AMPLIACAO por numero
 * inteiro (ex.: sprite 24x24 mostrado a 48px). Aqui e o CONTRARIO -- a arte
 * nasce 36x36 e todo consumidor de hoje mostra ela MENOR (20 a 52px,
 * nenhum maior que a origem) -- e pixelated (nearest-neighbor) em
 * REDUCAO produz serrilhado, nao nitidez. Testado nos dois modos
 * (gauntlet 19/08/2026, mockup com Common.css real + Playwright
 * deviceScaleFactor 3): a reducao suave (padrao do navegador) ficou nitida
 * em TODOS os tamanhos reais do fork (20/26/27/42/52px); pixelated ficou
 * pior. Se um consumidor futuro passar a exibir esta arte AMPLIADA alem de
 * 36px, ele precisa da mesma regra 4 (pixelated + inteiro) que qualquer
 * outro PNG do cliente -- não é o caso de nenhum consumidor hoje.
 */
const artReal = (chave, glifoDeReserva) =>
	`<svg viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><image href="/ragidle/dock-icons/${chave}.png" width="24" height="24" preserveAspectRatio="xMidYMid meet" onerror='this.closest("svg").outerHTML=${JSON.stringify(glifoDeReserva)}'/></svg>`;

/**
 * Arte ILUSTRADA do dono (onda de icones 01/09/2026, emenda [DONO-1]) --
 * `public/ragidle/ui-icons/<nome>.webp`, os 18 icones de navegacao gerados
 * por vite/converter-ui-icons.mjs a partir dos originais 1024x1024 (recorte
 * na caixa alfa, lado maior 128px; de-para em docs/ui/mapa-icones.md).
 *
 * Mesmo embrulho <svg><image> de artReal, e pelos mesmos motivos (o CSS
 * dimensiona "svg", nao "img"). Duas diferencas de proposito:
 *
 * - class="ri-arte" no <svg>: a ilustracao ocupa 62% do disco em vez dos 45%
 *   do traco Lucide (ver ".ri-disc svg.ri-arte" em Common.css) -- 45% foi
 *   calibrado pra traco fino de 2px e afogaria a arte.
 * - O WebP NAO e quadrado (o recorte preserva a proporcao de cada desenho,
 *   0,59 a 1,61): preserveAspectRatio="xMidYMid meet" centraliza e encaixa
 *   dentro da caixa quadrada sem esticar.
 *
 * A reserva e a mesma cadeia de artReal: WebP faltou -> glifo vetorial
 * embutido no lugar, botao nunca fica vazio.
 */
const arteUi = (nome, glifoDeReserva) =>
	`<svg viewBox="0 0 24 24" class="ri-arte" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><image href="/ragidle/ui-icons/${nome}.webp" width="24" height="24" preserveAspectRatio="xMidYMid meet" onerror='this.closest("svg").outerHTML=${JSON.stringify(glifoDeReserva)}'/></svg>`;

const RiIcones = {
	// ── Personagem — arte ILUSTRADA (retrato do aventureiro) com reserva
	// Lucide "User" (path oficial) se o WebP faltar. ─────────────────────────
	personagem: arteUi('personagem', svg('<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>')),

	// ── Skills — arte ILUSTRADA (grimorio sobre estrela arcana) com reserva
	// Lucide "ScrollText" (idioma Lucide — pergaminho com linhas de
	// texto e uma ponta enrolada, path exato nao lembrado de cor). ─────────
	skills: arteUi(
		'skills',
		svg(
			'<path d="M15.5 3H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7.5z"/><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M9 13h6M9 17h4"/>'
		)
	),

	// ── Inventario / Mochila — arte ILUSTRADA (a mochila de couro que o dono
	// entregou avulsa em 01/09, [DONO-3]) com reserva Lucide "Backpack"
	// (idioma Lucide, desenhado do zero no mesmo idioma). ────────────────────
	inventario: arteUi(
		'inventario',
		svg(
			'<path d="M6 20V10a6 6 0 0 1 12 0v10"/><path d="M6 20a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2"/><path d="M9 4.4a3 3 0 0 1 6 0"/><rect x="9" y="13" width="6" height="5" rx="1"/>'
		)
	),

	// ── Caca — arte ILUSTRADA (escudo com espadas cruzadas) com reserva
	// Lucide "Map" (era o conceito do glifo antigo; a silhueta nova e outra
	// mas a reserva so aparece por instantes de falha). ─────────────────────
	caca: arteUi('caca', svg('<path d="M9 3 3 6v15l6-3 6 3 6-3V3l-6 3-6-3z"/><path d="M9 3v15M15 6v15"/>')),

	// ── Config (o botao "Idle" da HUD, abre IdleConfig) — arte ILUSTRADA
	// (engrenagens; o dono cravou em [DONO-4]: a engrenagem e do IDLE) com
	// reserva Lucide "Settings" (idioma Lucide, engrenagem simplificada pra
	// continuar legivel em 12-15px). O ARQUIVO chama idle.webp — o nome da
	// chave e anterior a decisao e os consumidores ja a citam; renomear chave
	// e mexer em todo HTML por causa de um apelido. ──────────────────────────
	config: arteUi(
		'idle',
		svg(
			'<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2.5 12h3M18.5 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/>'
		)
	),

	// ── Sistema (a janela do ESC: video, audio, atalhos, trocar personagem,
	// sair) — Lucide "SlidersHorizontal". ────────────────────────────────────
	//
	// ICONE PROPRIO, e nao o `config` (15/09/2026, pedido do dono: *"crie um
	// icone especificamente para essas configuracoes"*). Os dois sao "ajuste",
	// e por isso a distincao tem de ser VISUAL e nao so textual: a ENGRENAGEM
	// e do idle — o dono cravou isso em [DONO-4], e ela ja nomeia o botao ao
	// lado. Reusar a engrenagem aqui poria dois itens com a mesma cara no
	// mesmo leque, e o jogador teria de ler o rotulo para saber qual e qual —
	// que e exatamente o defeito que a fusao "Config + Menu" tinha criado.
	//
	// Controles deslizantes dizem "ajustar o APARELHO" (volume, qualidade),
	// enquanto a engrenagem diz "ajustar o JOGO". A leitura sobrevive a 12px,
	// que e o teste que importa num disco de menu.
	sistema: svg(
		'<path d="M4 8h10M18 8h2M4 16h4M12 16h8"/><circle cx="16" cy="8" r="2"/><circle cx="10" cy="16" r="2"/>'
	),

	// ── Menu — Lucide "Menu". ────────────────────────────────────────────────
	menu: svg('<path d="M4 6h16M4 12h16M4 18h16"/>'),

	// ── Guilda — Lucide "Shield" (path oficial; era "Flag" na rodada
	// anterior — o showcase nomeia "shield" pra Guilda, "shirt" ficou livre
	// pra Equipamento, ver acima). REPROVADO um candidato real (investigacao
	// 19/08/2026, GRF ro_menu_icon/guild_1.bmp -- estandarte com asas): tem a
	// letra "G" pintada em pixel dentro do bmp, e o design system exige
	// "glifo puro, sem texto" (redesign/design-system-oficial.md); ver
	// scripts/icones-de-menu.ts pro resto da investigacao. A arte ILUSTRADA
	// (01/09) resolve o impasse: o brasao proprio do escudo azul nao e letra.──
	guilda: arteUi('guilda', svg('<path d="M12 2 20 5v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V5z"/>')),

	// ── Grupo — arte ILUSTRADA (dupla chibi ARMADA — o par desarmado e o
	// `amigos` abaixo) com reserva Lucide "Users". ───────────────────────────
	grupo: arteUi(
		'grupo',
		svg(
			'<circle cx="9" cy="8" r="3"/><path d="M2 21c0-3.9 3.1-6 7-6s7 2.1 7 6"/><circle cx="17.2" cy="8.6" r="2.4"/><path d="M15.6 15.2c2.7.4 4.6 2.2 4.6 5.8"/>'
		)
	),

	// ── Amigos — chave NOVA da onda de 01/09 ([DONO-5]): ate entao o botao
	// Amigos desenhava o MESMO icone do Grupo — dois rotulos, uma figura. A
	// arte ilustrada tem o par DESARMADO para Amigos e o armado para Grupo.
	// Reserva Lucide "Heart-Handshake" simplificado (idioma Lucide). ─────────
	amigos: arteUi(
		'amigos',
		svg(
			'<circle cx="8" cy="8.5" r="3"/><path d="M1.5 21c0-3.6 2.9-5.5 6.5-5.5"/><circle cx="16" cy="8.5" r="3"/><path d="M12.2 21c.6-3.3 3.2-5.5 6.3-5.5 1.4 0 2.7.4 3.7 1.1"/>'
		)
	),

	// ── Correio — arte REAL, mas NAO de ro_menu_icon: o candidato de la
	// (mail_1.bmp) foi convertido e OLHADO, e tem a palavra "RODEX" pintada em
	// pixel dentro do glifo -- a MESMA reprovacao de guild_1 ("G") e bank_1
	// ("Z"), porque o design system exige glifo puro, sem texto. O envelope
	// limpo veio do rodexsystem (icon_status_mail_received.bmp, 24x24), que e
	// a arte que a propria lista de correio nativa usa por linha
	// (Rodex.js:174). Reserva Lucide "Mail" se o PNG faltar. ──────────────
	// A arte ILUSTRADA (01/09) e o envelope com selo de cera. O PNG do
	// rodexsystem continua em dock-icons/ porque a LISTA do CorreioIdle usa
	// os dois estados dele por linha (CorreioIdle.js) — aqui era so o botao.
	correio: arteUi(
		'correio',
		svg('<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="m3 6.5 9 6.5 9-6.5"/>')
	),

	// ── Missões — (idioma Lucide, "ListChecks": lista com marcas de feito).
	// Sem candidato em ro_menu_icon: o conceito "missão/quest" do cliente
	// (quest_1.bmp) tem ponto de exclamação PINTADO no glifo, a mesma
	// reprovação de guilda="G"/zeny="Z" (o DS proíbe texto/símbolo tipográfico
	// dentro do glifo) — fica 100% Lucide. ──────────────────────────────────
	// Desde 01/09 tem arte ILUSTRADA (prancheta com marcas de feito) — o
	// ponto de exclamacao que reprovava o candidato do GRF nao existe nela.
	missoes: arteUi(
		'missoes',
		svg(
			'<path d="m3 6.5 1.8 1.8L8.3 4.8"/><path d="m3 16.5 1.8 1.8 3.5-3.5"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>'
		)
	),

	// ── Codex (D-851) — (idioma Lucide, "BookOpen": livro aberto). Sem
	// candidato em ro_menu_icon: o conceito nao existe no cliente oficial (o
	// Codex e mecanica NOSSA), entao fica 100% Lucide, como loja/roshop/troca.
	//
	// PARENTESCO DECLARADO com `skills`, que tambem e livro: aquele resolve
	// para a ARTE REAL do cliente (um grimorio chibi com emblema, colorido) e
	// so cai em pergaminho vetorial se o PNG faltar — as duas silhuetas nao se
	// confundem na tela, e os dois botoes moram em lugares diferentes (cluster
	// e leque). Se um dia o `skills` perder o PNG, o par fica ambiguo: e o
	// ponto em que este glifo precisa mudar.
	// RAGIDLE (D-1164): Indique & Ganhe — arte ILUSTRADA desde 08/09/2026 (o
	// dono entregou o PNG: dois aventureiros de mao dada, um apresentando o
	// outro). Reserva Lucide "user-plus", o traco que estava aqui ate hoje.
	indicacao: arteUi(
		'indicacao',
		svg(
			'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/>'
		)
	),
	// RAGIDLE (D-1162): a presenca mensal — arte ILUSTRADA desde 08/09/2026 (o
	// dono entregou o PNG: o pergaminho de calendario com a gema azul).
	// Reserva Lucide "calendar-check", o traco que estava aqui ate hoje — e
	// que continua sendo o conceito (calendario + visto) se o WebP faltar.
	presenca: arteUi(
		'presenca',
		svg(
			'<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/>'
		)
	),
	codex: arteUi(
		'codex',
		svg(
			'<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>'
		)
	),

	// ── Loja — arte ILUSTRADA (barraca de madeira) com reserva Lucide
	// "Store". ───────────────────────────────────────────────────────────────
	loja: arteUi(
		'loja',
		svg(
			'<path d="M3 9 4 4h16l1 5"/><path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9"/><path d="M3 9h18"/><path d="M9 20v-5a3 3 0 0 1 6 0v5"/>'
		)
	),

	// ── RO Shop — arte ILUSTRADA (cristal iridescente) com reserva Lucide
	// "Gem". ─────────────────────────────────────────────────────────────────
	roshop: arteUi('ro-shop', svg('<path d="M6 3h12l3 6-9 12L3 9z"/><path d="M3 9h18M9 3l3 6 3-6M9 9l3 12 3-12"/>')),

	// ── Troca — arte ILUSTRADA (setas de mao dupla) com reserva Lucide
	// "Repeat". O ARQUIVO chama trade.webp (nome que o dono deu a arte). ─────
	troca: arteUi(
		'trade',
		svg('<path d="M17 2l4 4-4 4"/><path d="M3 6h18"/><path d="M7 22l-4-4 4-4"/><path d="M21 18H3"/>')
	),

	// ── Leilao — arte ILUSTRADA (martelo de leiloeiro) com reserva no idioma
	// Lucide (desenhado do zero, "Gavel" nao lembrado de cor). ───────────────
	leilao: arteUi(
		'leilao',
		svg('<path d="M17.5 3.5l3 3-4.5 4.5-3-3z"/><path d="M13 8l-9 9"/><path d="M9 12l3 3"/><path d="M4 20h9"/>')
	),

	// ── Recompensas — arte ILUSTRADA (bau de tesouro com gemas) com reserva
	// Lucide "Gift". ─────────────────────────────────────────────────────────
	recompensas: arteUi(
		'recompensas',
		svg(
			'<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7"/><path d="M12 8C9.5 3.5 5.5 4.5 5.5 7c0 1.5 2.5 1 6.5 1zM12 8c2.5-4.5 6.5-3.5 6.5-1 0 1.5-2.5 1-6.5 1z"/>'
		)
	),

	// ── Eventos — arte ILUSTRADA (calendario) com reserva Lucide
	// "Calendar". ────────────────────────────────────────────────────────────
	eventos: arteUi(
		'eventos',
		svg('<rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M16 2.5v4M8 2.5v4M3 10h18"/>')
	),

	// ── Passe — Lucide "Ticket". ─────────────────────────────────────────────
	passe: svg(
		'<path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4z"/><path d="M9 7v10" stroke-dasharray="2 2.4"/>'
	),

	// ── Temporada (Season 1, "Luz & Trevas") — sem candidato no GRF (mecanica
	// NOSSA, como o Codex): idioma Lucide desenhado do zero, o eclipse
	// "lua sobre lua" que já é o vocabulario comum pra luz/trevas em par (o
	// mesmo motivo do roxo de RARE — a tarefa autoriza a metafora). ──────────
	temporada: svg(
		'<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 1 0 0 18c-2.2-1.9-3.6-4.9-3.6-9s1.4-7.1 3.6-9z"/>'
	),

	// ── Voto — arte ILUSTRADA desde 08/09/2026 (a manopla de placas dando o
	// polegar para cima), com reserva Lucide "Vote" (a cédula com o visto).
	//
	// Este bloco dizia, ate hoje, que o botao ficaria em traco puro porque
	// "nao existe icone de votacao no GRF e inventar uma arte so para ele
	// abriria um vocabulario de um item so". O argumento morreu do jeito
	// previsto na propria nota — "a cadeia de reserva e o que existe para o
	// dia em que a arte chegar": o dono entregou o PNG, e a arte deixou de ser
	// de um item so ao chegar no mesmo lote de `presenca` e `indicacao`. ─────
	voto: arteUi(
		'voto',
		svg(
			'<path d="m9 12 2 2 4-4"/><path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/><path d="M2 21h20"/>'
		)
	),

	// ── Auto — arte REAL (ro_menu_icon/battle_1.bmp, espadas cruzadas) com
	// reserva Lucide "Zap" (le "automatico"). ────────────────────────────────
	auto: artReal('auto', svg('<path d="M13 2 3 14h8l-1 8 11-14h-8z"/>')),

	// ── Zeny — Lucide "Coins" (path oficial nomeado pelo showcase — trocou o
	// "Z" estilizado da rodada anterior, o contexto do valor ao lado ja
	// desambigua a moeda). REPROVADO um candidato real (investigacao
	// 19/08/2026, GRF ro_menu_icon/bank_1.bmp -- saco de moedas): tem a
	// letra "Z" pintada em pixel dentro do bmp, mesmo motivo de "guilda"
	// acima -- o design system pede glifo puro. ──────────────────────────────
	zeny: svg('<circle cx="9" cy="9" r="6"/><circle cx="15" cy="15" r="6"/><path d="M9 6.5v5M15 12.5v5"/>'),

	// ── Cash — Lucide "Gem": a moeda PAGA do jogo, e ela precisa ser
	// distinguivel do zeny a um relance, porque as duas ficam lado a lado na
	// mesma faixa. Duas moedas parecidas na mesma linha seriam pior que uma. ──
	cash: svg('<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M11 3 8 9l4 12 4-12-3-6"/><path d="M2 9h20"/>'),

	// ── Grafico — arte ILUSTRADA (barras com seta subindo; o dono confirmou
	// em [DONO-2]: esta chave e a Analise de Caca e mais nada) com reserva
	// Lucide "BarChart3". O ARQUIVO chama analise-de-caca.webp. ──────────────
	grafico: arteUi('analise-de-caca', svg('<path d="M3 3v18h18"/><path d="M7 16v-4M12 16V8M17 16v-7"/>')),

	// ── Admin — (idioma Lucide, "Wrench"). ───────────────────────────────────
	admin: svg('<path d="M14.7 6.3a4 4 0 1 1-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-3-3-3 3z"/>'),

	// ── Pin — Lucide "MapPin" (uso generico). ────────────────────────────────
	pin: svg('<path d="M12 22s7-7.5 7-12a7 7 0 1 0-14 0c0 4.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>'),

	// ── Mais — Lucide "Plus" (uso generico). ─────────────────────────────────
	mais: svg('<path d="M12 5v14M5 12h14"/>'),

	// ── Seta — Lucide "ChevronDown" (idioma Lucide, path oficial). Botao de
	// recolher/expandir da HUD (TopMenuIdle/BasicInfoIdle) -- a DIRECAO muda
	// por rotacao em CSS no proprio componente (var(--dur-fast)), nunca um
	// segundo glifo pra cada sentido. ───────────────────────────────────────
	seta: svg('<path d="M6 9l6 6 6-6"/>'),

	// ── Conversa — Lucide "MessageSquare" (path oficial). O chat MINIMIZADO
	// (05/09/2026, pedido do dono: "que ele minimize totalmente, fica so o
	// icon pequeno pra pessoa retomar o chat") some da tela inteiro, e o unico
	// jeito de voltar e este disco. A seta de recolher nao servia sozinha ali:
	// ela diz "ha algo dobrado aqui", e nao "aqui mora o chat" — com o painel
	// invisivel, quem chega na tela precisa saber o QUE o botao devolve.
	conversa: svg('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'),

	// ── Glifos-fantasma de slot vazio (MochilaIdle, 19/08/2026) — a peca
	// central do alvo "Origin" (redesign/extracao-inventario-origin.md secao
	// 2): um slot de equipamento VAZIO mostra a SILUETA do que falta ali, nao
	// um buraco cinza. Idioma Lucide puro (svg(), currentColor, stroke 2) de
	// PROPOSITO — nao artReal(): a silueta precisa herdar a cor fantasma via
	// CSS "color" (".mo-slot.is-empty" em MochilaIdle.css), e um PNG raster
	// nao recolore por CSS. "slotArmadura"/"slotEscudo" reusam o MESMO path
	// data das reservas Lucide de "equipamento"/"guilda" acima (mesmo
	// vocabulario visual, sem inventar dois desenhos pro mesmo conceito). ────
	// Chapeu (HEAD_TOP) -- copa + ABA que ultrapassa a copa dos dois lados
	// (a aba e o que distingue "chapeu" de "sino": um sino afunila pro alto
	// sem essa faixa saliente) + uma faixa/fita na base da copa, o segundo
	// sinal classico de chapeu. Verificado com foto real (gauntlet
	// 19/08/2026): a v1 (so copa + linha de base do mesmo tamanho) lia como
	// sino de mao a 22px -- corrigido aqui.
	slotChapeu: svg('<path d="M3 16.5h18"/><path d="M7 16c0-5.2 2.1-9.5 5-9.5s5 4.3 5 9.5"/><path d="M8.2 14h7.6"/>'),
	// Oculos (HEAD_MID, RO: cobre os olhos -- Sunglasses/Glasses) -- duas
	// lentes ligadas por ponte, com hastes curtas indo pra fora. Diferente do
	// glifo de acessorio (que e um anel/gema), pra nao repetir leitura com
	// "duas coisas redondas ligadas".
	slotOculos: svg(
		'<circle cx="7.2" cy="12" r="3.1"/><circle cx="16.8" cy="12" r="3.1"/><path d="M10.3 12h3.4M3.6 11 1.8 10.2M20.4 11l1.8-.8"/>'
	),
	// Boca (HEAD_BOTTOM, RO: cobre nariz/boca -- Bandana/Mascara). Curva de
	// sorriso + linha do labio inferior, leitura de "boca" mesmo em 22px.
	slotBoca: svg('<path d="M4.5 12.5c2.6 3 12.4 3 15 0"/><path d="M7.5 13c1.8 1.3 7.2 1.3 9 0"/>'),
	slotArmadura: svg('<path d="M8 3 4 6l2 3 2-1v11a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V8l2 1 2-3-4-3-2 2h-2z"/>'),
	slotArma: svg('<path d="M19 3 21 5 8 18l-3 3-2-2 3-3L19 3z"/><path d="M13 8l3 3"/>'),
	slotEscudo: svg('<path d="M12 2 20 5v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V5z"/>'),
	// Capa (GARMENT) -- silhueta de manto: ombro reto e largo, cintura
	// estreita, barra alargada embaixo (a "ampulheta" e o que le como pano
	// que flutua, nao como roupa colada ao corpo) + broche no colarinho.
	// Verificado com foto real (gauntlet 19/08/2026): a v1 (trapezio unico
	// afunilando de cima a baixo) lia como frasco/pino de boliche -- a
	// cintura estreita no meio e a correcao.
	slotCapa: svg('<path d="M6 5h12l-4 5 4 10H6l4-10z"/><circle cx="12" cy="5" r="1.1"/>'),
	// Sapato/bota (SHOES) -- perna reta + pe angular com bico e salto sem
	// nenhuma curva (so linhas retas, pra nao arredondar pra "frasco" de
	// novo, mesmo erro do slotCapa v1 -- ver nota acima e a foto real que
	// pegou os dois).
	slotSapato: svg('<path d="M9 3h6v8h5l1 3-1 2H5v-3h4z"/>'),
	// Acessorio (ACCESSORY1/2) -- anel (aro) com uma GEMA facetada em cima
	// (duas linhas formando o corte, nao uma curva unica) -- a curva unica
	// da v1 lia como gota d'agua (a "silueta generica" que o briefing
	// reprovou), a faceta reta e o que distingue "joia" de "gota".
	// ── Slot de municao — a flecha (28/08/2026). Ela e a unica peca que o
	// jogador GASTA, e o ladrilho dela e o unico com contador. ────────────────
	slotMunicao: svg('<path d="M4 20 20 4"/><path d="M15 4h5v5"/><path d="M4 20l1.5-4.5L9 14"/>'),

	slotAcessorio: svg('<circle cx="12" cy="15" r="5"/><path d="M9 7h6l-3-4z"/><path d="M9 7 12 10 15 7"/>'),

	// Fantasia/costume (MochilaIdle, 26/08/2026) -- estrela de brilho de 4
	// pontas (idioma Lucide: e a forma central do "sparkles" oficial,
	// SEM os dois acentos pequenos de proposito -- o selo da grade mostra
	// isto a 9px, e a 9px os acentos viram ruido). "Sparkles" aqui NAO
	// conflita com a nota do cabecalho sobre o showcase: la ele foi trocado
	// como icone do slot central do DOCK (que virou "Caça"), nao proibido
	// como conceito -- e "brilho" e exatamente o conceito de peca so-visual.
	fantasia: svg('<path d="M12 3l1.9 7.1L21 12l-7.1 1.9L12 21l-1.9-7.1L3 12l7.1-1.9z"/>'),

	// ── Mapa de Caça redesenhado (D-901, 01/09/2026). Quatro glifos Lucide
	// (paths oficiais "search", "lock", "arrow-right", "map", "x") que a
	// janela usa no chrome: a lupa da busca, o cadeado do mapa trancado, a
	// seta do botao "viajar" de cada linha, o mapa vazio atras da miniatura
	// que falta (era um emoji, proibido pelo design system) e o X que limpa
	// a busca. ────────────────────────────────────────────────────────────
	busca: svg('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'),
	cadeado: svg('<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'),

	// ── Cadeado ABERTO — Lucide "LockOpen" (path oficial). A trava do tamanho
	// do chat (05/09/2026) precisa dos DOIS estados, e girar ou colorir o
	// fechado nao serve: aberto e fechado sao formas diferentes, e e a forma
	// que se le de relance num botao de 26px. O arco sai do lugar em vez de
	// mudar de cor.
	cadeadoAberto: svg('<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>'),

	// ── Os cinco da spec do CHAT (05/09/2026). Ela pede icones Tabler
	// (`ti-send`, `ti-eye-off`, `ti-arrow-back-up`, `ti-alert-triangle`,
	// `ti-package`), e o fork nao tem Tabler nem vai ter: a regra do DS e
	// glifo Lucide INLINE, sem CDN nem dependencia de rede. Os cinco abaixo
	// sao os equivalentes Lucide, no mesmo idioma dos outros 57.
	enviar: svg('<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>'),
	olhoFechado: svg(
		'<path d="M10.7 5.1A9 9 0 0 1 12 5c5 0 9 4.5 9 7a12 12 0 0 1-2.2 3.2"/><path d="M6.6 6.6A12 12 0 0 0 3 12c0 2.5 4 7 9 7a9 9 0 0 0 4.2-1"/><path d="m2 2 20 20"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
	),
	desfazer: svg('<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>'),
	alerta: svg(
		'<path d="m10.3 3.9-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3.1l-8-14a2 2 0 0 0-3.4 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
	),
	pacote: svg(
		'<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
	),
	irPara: svg('<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>'),
	mapaVazio: svg(
		'<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/>'
	),
	fechar: svg('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),

	// ── MVP — a coroa que marca, na LISTA do Mapa de Caça, o mapa que tem
	// chefe (07/09/2026). Arte ILUSTRADA do dono (a mesma coroa que o site usa
	// no pilar "MVP", assets/img/pilares/mvp.webp), convertida pela receita de
	// vite/converter-ui-icons.mjs — recorte na caixa alfa, lado maior 128px.
	// Reserva Lucide "Crown" se o WebP faltar: 25 dos 193 mapas têm MVP, e um
	// selo vazio nesses 25 seria pior que o glífo de traço.
	// ── Favoritos do Atlas (09/09/2026). Lucide "star": a MESMA silhueta nas
	// duas, e o que muda e so o preenchimento. Duas silhuetas diferentes
	// fariam a estrela "pular" ao acender, e o olho leria como outro botao.
	estrela: svg('<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6-5.4-2.8-5.4 2.8 1-6L3.2 9.4l6.1-.9z"/>'),
	estrelaCheia: svg('<path fill="currentColor" d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6-5.4-2.8-5.4 2.8 1-6L3.2 9.4l6.1-.9z"/>'),

	mvp: arteUi('mvp', svg('<path d="M2 6l4 10h12l4-10-6 5-4-7-4 7z"/><path d="M5 20h14"/>')),

	// ── Árvore de habilidades (D-902, 01/09/2026): as setas da plaqueta
	// ◀ n/m ▶ eram glifos de FONTE (viravam emoji em alguns sistemas) e o
	// ✓/✗ dos pré-requisitos idem. Lucide "chevron-left", "chevron-right" e
	// "check". ─────────────────────────────────────────────────────────────
	chevronEsq: svg('<path d="m15 18-6-6 6-6"/>'),
	chevronDir: svg('<path d="m9 18 6-6-6-6"/>'),
	confere: svg('<path d="M20 6 9 17l-5-5"/>'),

	// ── Configuração idle redesenhada (D-915, 01/09/2026). Os glifos do
	// trilho de seções e dos controles: Lucide "crosshair" (Caçada),
	// "swords" (Ataque), "sparkles" (Suporte — buffs), "heart-pulse"
	// (Sobrevivência), "flask-conical" (Consumíveis), "users"/"user" (o
	// segmentado Só eu / Grupo), "arrow-up"/"arrow-down" (reordenar a
	// rotação) e "timer" (duração do buff). Traço 2px, sem preenchimento,
	// como manda o design system. ───────────────────────────────────────────
	alvo: svg(
		'<circle cx="12" cy="12" r="10"/><path d="M22 12h-4"/><path d="M6 12H2"/><path d="M12 6V2"/><path d="M12 22v-4"/>'
	),
	espadas: svg(
		'<path d="m14.5 17.5-11.5-11.5v-3h3l11.5 11.5"/><path d="m13 19 6-6"/><path d="m16 16 4 4"/><path d="m19 21 2-2"/><path d="m14.5 6.5 3.5-3.5h3v3l-3.5 3.5"/><path d="m5 14 4 4"/><path d="m7 17-3 3"/><path d="m3 19 2 2"/>'
	),
	brilhos: svg(
		'<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/>'
	),
	coracao: svg(
		'<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>'
	),
	frasco: svg(
		'<path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/>'
	),
	usuarios: svg(
		'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'
	),
	usuario: svg('<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>'),
	setaCima: svg('<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>'),
	setaBaixo: svg('<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>'),
	relogio: svg('<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'),

	// ── Menu do Bot novo (Fase 11, 08/10/2026): os glifos da barra de secoes, do topo e dos
	// controles do mockup do dono. Lucide (MIT), path oficial, traco 2px. ─────────────────────
	botAlvo: svg('<circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/>'),
	botEspadas: svg('<polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" x2="19" y1="19" y2="13"/><line x1="16" x2="20" y1="16" y2="20"/><line x1="19" x2="21" y1="21" y2="19"/><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/><line x1="5" x2="9" y1="14" y2="18"/><line x1="7" x2="4" y1="17" y2="20"/><line x1="3" x2="5" y1="19" y2="21"/>'),
	botSuporte: svg('<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>'),
	botCoracao: svg('<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>'),
	botColeta: svg('<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>'),
	botGrupo: svg('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),
	botArmazem: svg('<path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/><path d="M6 18h12"/><path d="M6 14h12"/><rect width="12" height="12" x="6" y="10"/>'),
	botPerfil: svg('<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>'),
	botConsumiveis: svg('<path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/>'),
	botAvancado: svg('<line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/>'),
	botLocal: svg('<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>'),
	botAtividade: svg('<path d="M22 12h-4l-3 9L9 3l-6 9H2"/>'),
	botMenos: svg('<path d="M5 12h14"/>'),
	botMais: svg('<path d="M5 12h14"/><path d="M12 5v14"/>'),
	botFechar: svg('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
	botPlay: svg('<polygon points="6 3 20 12 6 21 6 3"/>'),
	botSalvar: svg('<path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/>')
};

export default RiIcones;
