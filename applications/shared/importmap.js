// applications/shared/importmap.js
(function () {
	var script = document.currentScript || document.querySelector('script[src*="shared/importmap.js"]');
	if (!script) return;

	var projectRoot = script.dataset.projectRoot;
	if (!projectRoot) {
		var splitPoint = script.dataset.projectRootSplit || '/applications/';
		projectRoot = new URL(window.location.href).pathname.split(splitPoint)[0] + '/';
	}
	var xhr = new XMLHttpRequest();
	xhr.open('GET', projectRoot + 'aliases.json', false);
	xhr.send(null);
	var aliases = JSON.parse(xhr.responseText);

	var imports = { 'src/': projectRoot + 'src/' };
	aliases.dirs.forEach(function (d) {
		imports[d + '/'] = projectRoot + 'src/' + d + '/';
	});
	Object.keys(aliases.packages).forEach(function (k) {
		imports[k] = projectRoot + aliases.packages[k];
	});

	var s = document.createElement('script');
	s.type = 'importmap';
	s.textContent = JSON.stringify({ imports: imports });
	script.after(s);
})();
