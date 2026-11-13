// vite/custom-aliases.mjs
import glob from 'glob';
import path from 'path';

export function getCustomAliases(projectRoot) {
	return glob.sync('custom/**/*.js', { cwd: projectRoot }).map(f => {
		const rel = f.slice(7);
		return {
			find: new RegExp(`^${rel.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}$`),
			replacement: path.resolve(projectRoot, f).replace(/\\/g, '/'),
			specifier: rel
		};
	});
}
