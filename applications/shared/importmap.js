// applications/shared/importmap.js
import aliases from '../../aliases.json' with { type: 'json' };
(function () {
	var script = document.querySelector('script[src*="shared/importmap.js"]');
	if (!script) {
		return;
	}
	var projectRoot = script.dataset.projectRoot;
	if (!projectRoot) {
		var splitPoint = script.dataset.projectRootSplit || '/applications/';
		var path = new URL(window.location.href).pathname;
		projectRoot = path.split(splitPoint)[0] + '/';
	}
	const imports = { 'src/': `${projectRoot}src/` };
	for (const d of aliases.dirs) imports[`${d}/`] = `${projectRoot}src/${d}/`;
	for (const [pkg, p] of Object.entries(aliases.packages)) imports[pkg] = `${projectRoot}${p}`;

	var s = document.createElement('script');
	s.type = 'importmap';
	s.textContent = JSON.stringify({ imports });
	script.after(s);
})();
