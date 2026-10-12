/*
 * O VITE NAO VARRE AS WORKTREES DE AGENTE (08/10/2026).
 *
 * As worktrees moram em `.claude/worktrees/`, DENTRO da raiz do cliente, e cada
 * uma e uma copia inteira dele. Sem `optimizeDeps.entries`, o vite procura todo
 * `.html` debaixo da raiz: com 26 worktrees nesta maquina ele chegou a ~3 GB e
 * nao respondeu a primeira pagina em 240 s (a `prove:e2e` reprovava no
 * `page.goto`). Este portao segura as duas exclusoes - a da varredura e a do
 * vigia - para a proxima edicao do `vite.config.js` nao as perder calada.
 */
import { describe, expect, it } from 'vitest';
import config from '../../vite.config.js';

/** O que a varredura do vite ve com estes padroes (o `!` exclui, como no tinyglobby). */
function casa(padroes, caminho) {
	const incluem = padroes.filter((p) => !p.startsWith('!'));
	const excluem = padroes.filter((p) => p.startsWith('!')).map((p) => p.slice(1));
	const bate = (p) => new RegExp(paraRegex(p)).test(caminho);
	return incluem.some(bate) && !excluem.some(bate);
}

/** Glob minimo (`**`, `*`) para regex, o bastante para os padroes desta config. */
function paraRegex(glob) {
	let r = '';
	for (let i = 0; i < glob.length; i++) {
		const c = glob[i];
		if (c === '*' && glob[i + 1] === '*') {
			r += '.*';
			i++;
			if (glob[i + 1] === '/') i++;
		} else if (c === '*') r += '[^/]*';
		else if ('.+?^${}()|[]\\'.includes(c)) r += '\\' + c;
		else r += c;
	}
	return '^' + r + '$';
}

describe('o vite fica longe de .claude/', () => {
	it('a varredura de dependencias inclui as paginas do cliente e exclui as worktrees', () => {
		const entradas = config.optimizeDeps.entries;
		expect(Array.isArray(entradas)).toBe(true);
		expect(casa(entradas, 'applications/pwa/index.html')).toBe(true);
		expect(casa(entradas, 'index.html')).toBe(true);
		expect(casa(entradas, '.claude/worktrees/qualquer/applications/pwa/index.html')).toBe(false);
	});

	it('o vigia ignora as worktrees (dentro e fora do Docker)', () => {
		expect(config.server.watch.ignored).toContain('**/.claude/**');
	});
});
