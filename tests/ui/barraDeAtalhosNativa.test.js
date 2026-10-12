import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

const mapEngine = fs.readFileSync('src/Engine/MapEngine.js', 'utf8');
const skillEngine = fs.readFileSync('src/Engine/MapEngine/Skill.js', 'utf8');
const shortcut = fs.readFileSync('src/UI/Components/ShortCut/ShortCut.js', 'utf8');
const shortcutHtml = fs.readFileSync('src/UI/Components/ShortCut/ShortCut.html', 'utf8');
const shortcutCss = fs.readFileSync('src/UI/Components/ShortCut/ShortCut.css', 'utf8');
const idleSkills = fs.readFileSync('src/UI/Components/IdleSkills/IdleSkills.js', 'utf8');
const idleSkillsCss = fs.readFileSync('src/UI/Components/IdleSkills/IdleSkills.css', 'utf8');

describe('barra de atalhos nativa como unica hotbar', () => {
	it('continua preparando e anexando a ShortCut original', () => {
		expect(mapEngine).toContain('ShortCut.prepare();');
		expect(mapEngine).toContain('ShortCut.append();');
	});

	it('nao registra nem alimenta a antiga DockIdle', () => {
		expect(mapEngine).not.toMatch(/import DockIdle|DockIdle\.(prepare|append)\(\)/);
		expect(skillEngine).not.toMatch(/import DockIdle|DockIdle\.onSkillDelay/);
	});

	it('mantem uma aba visivel para reabrir a barra depois de fecha-la', () => {
		expect(shortcutHtml).toContain('class="reopen"');
		expect(shortcutHtml).toContain('Abrir barra de atalhos');
		expect(shortcut).toContain("reopenBtn.addEventListener('click', onReopen)");
		expect(shortcut).toContain("classList.toggle('is-collapsed', collapsed)");
		expect(shortcutCss).toContain(':host(.is-collapsed) #ShortCut .reopen');
	});

	it('permite que F12 reabra uma linha mesmo antes da lista do servidor', () => {
		expect(shortcut).toContain('getAvailableRowCount() + 1');
		expect(shortcut).toContain('_rowCount > 0 ? _rowCount : MAX_ROW_COUNT');
		expect(shortcut).not.toContain("ShortCut._host.style.height = '0px'");
	});

	it('nasce maior no centro inferior e pode ser movida', () => {
		expect(shortcut).toContain('const ROW_HEIGHT = 42');
		expect(shortcut).toContain("this.draggable(root.querySelector('#ShortCut'))");
		expect(shortcut).toContain('ShortCut.onDragEnd = function persistDragPosition()');
		expect(shortcut).toContain('_preferences.x');
		expect(shortcut).toContain('_preferences.y');
		// A preferencia antiga (1.0) trazia x/y do desenho de topo-centro e
		// venceria a ancora nova — ver o comentario do Preferences.get.
		expect(shortcut).toMatch(/^\t1\.1$/m);
		/*
		 * D-929 (05/09/2026): os DOIS numeros deste desenho continuam sendo 368
		 * e 184 — mudou a expressao que os carrega, e nao a medida.
		 *
		 * A barra tinha `width: 368px` cravado e transbordava 8px numa tela de
		 * 360 (a resolucao minima suportada). Ela passou a ser
		 * `min(368px, calc(100vw - 16px))`, e a centralizacao passou a usar a
		 * MESMA metade (`min(184px, calc(50vw - 8px))`) para largura e posicao
		 * nunca divergirem. Em qualquer tela >= 384px de largura — 1920 e 1366
		 * inclusas — o `min()` resolve exatamente para 368 e 184, e o computado
		 * e identico ao de antes.
		 *
		 * O portao continua fixando o desenho: se alguem trocar o 368 ou o 184
		 * por outro numero, ele reprova igual. O que ele NAO pode mais fazer e
		 * exigir a forma literal `368px` solta, porque essa forma era
		 * justamente o defeito.
		 */
		expect(shortcutCss).toContain('width: min(368px, calc(100vw - 16px))');
		expect(shortcutCss).toContain('bottom: 20px');
		expect(shortcutCss).toContain('left: calc(50% - min(184px, calc(50vw - 8px)))');
		expect(shortcutCss).toContain('width: 32px');
		expect(shortcutCss).toContain('background: var(--window-fill)');
		expect(shortcutCss).toContain('border: var(--window-frame)');
		expect(shortcutCss).not.toContain('background: var(--surface-dark-glass)');
	});

	it('o antigo "Ataque auto" (CombatCornerIdle) saiu com o Novo Bot V5 (07/10/2026)', () => {
		expect(fs.existsSync('src/UI/Components/CombatCornerIdle')).toBe(false);
		expect(mapEngine).not.toMatch(/import CombatCornerIdle|CombatCornerIdle\.(prepare|append)\(\)/);
	});

	it('aceita habilidades aprendidas arrastadas da arvore nova', () => {
		expect(idleSkills).toContain("import SkillInfo from 'DB/Skills/SkillInfo.js'");
		expect(idleSkills).toContain('draggable="');
		expect(idleSkills).toContain("b.addEventListener('dragstart', onSkillDragStart)");
		expect(idleSkills).toContain("from: 'IdleSkills'");
		expect(shortcut).toContain("case 'IdleSkills':");
		// O arraste da barra tem de ser registrado DEPOIS do "mousedown"
		// delegado que cala o slot ocupado, senao mover um icone move a barra.
		expect(shortcut.indexOf("this.draggable(root.querySelector('#ShortCut'))")).toBeGreaterThan(
			shortcut.indexOf("if (e.target.closest('.icon'))")
		);
		expect(shortcutCss).toContain('.is-drop-target');
		expect(idleSkillsCss).toContain(".is-no-icone[draggable='true']");
	});
});
