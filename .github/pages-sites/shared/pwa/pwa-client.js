// Registers the page-shell service worker (sw.js) next to the page: scope / on cyro.localhost:6988
// (`wtf robrowser prod --local-grf`), /cyro.live/ on robrowser.suuuper.app.
if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('sw.js');
}
