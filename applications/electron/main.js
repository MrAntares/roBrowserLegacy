import { app, BrowserWindow } from 'electron';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import process from 'node:process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.commandLine.appendSwitch('enable-webgl');
app.commandLine.appendSwitch('ignore-gpu-blacklist');
app.commandLine.appendSwitch('disable-raf-throttling');

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
		win.loadFile(path.join(__dirname, 'index.html'));
	}
}

app.whenReady().then(createWindow);

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
