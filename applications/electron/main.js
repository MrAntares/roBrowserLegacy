import { app, BrowserWindow, protocol, net } from 'electron';
import { URL, fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import process from 'node:process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.commandLine.appendSwitch('enable-webgl');
app.commandLine.appendSwitch('ignore-gpu-blacklist');
app.commandLine.appendSwitch('disable-raf-throttling');

const projectRoot = path.resolve(__dirname, '..', '..');

// Register custom protocol so ES modules work without CORS issues.
// file:// blocks <script type="module"> imports; app:// serves them
// with a proper origin.
protocol.registerSchemesAsPrivileged([
	{
		scheme: 'app',
		privileges: {
			standard: true,
			secure: true,
			supportFetchAPI: true,
			corsEnabled: true
		}
	}
]);

function createWindow() {
	const win = new BrowserWindow({
		width: 1024,
		height: 768,
		fullscreen: false,
		frame: true,
		icon: path.join(__dirname, 'icon.png'),
		webPreferences: {
			preload: path.join(__dirname, 'preload.mjs'),
			contextIsolation: true,
			nodeIntegration: false,
			sandbox: false
		}
	});

	if (process.argv.includes('--dev')) {
		process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
		win.loadURL('http://localhost:3000/applications/electron/index.html');
		win.webContents.openDevTools();
	} else {
		win.loadURL('app://resources/app/applications/electron/index.html');
	}
}

app.whenReady().then(() => {
	// Handle app:// requests by mapping to local project files.
	// In packaged builds the app root is inside resources/app/.
	protocol.handle('app', request => {
		const url = new URL(request.url);
		const relativePath = decodeURIComponent(url.pathname);
		const filePath = path.join(projectRoot, relativePath);
		return net.fetch(pathToFileURL(filePath).href);
	});

	createWindow();
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});
