// applications/shared/importmap.js
(function () {
	const script = document.currentScript || document.querySelector('script[src*="shared/importmap.js"]');
	if (!script) return;

	let projectRoot = script.dataset.projectRoot;
	if (!projectRoot) {
		const splitPoint = script.dataset.projectRootSplit || '/applications/';
		projectRoot = new URL(window.location.href).pathname.split(splitPoint)[0] + '/';
	}
	const xhr = new XMLHttpRequest();
	xhr.open('GET', `${projectRoot}aliases.json`, false);
	xhr.send(null);
	const aliases = JSON.parse(xhr.responseText);

	const imports = { 'src/': projectRoot + 'src/' };
	aliases.dirs.forEach(function (d) {
		imports[d + '/'] = projectRoot + 'src/' + d + '/';
	});
	Object.keys(aliases.packages).forEach(function (k) {
		imports[k] = projectRoot + aliases.packages[k];
	});

	const s = document.createElement('script');
	s.type = 'importmap';
	s.textContent = JSON.stringify({ imports: imports });
	script.after(s);
})();
