import { createDBFileContext } from './DBLoadContext.js';

export default function loadFontFromClient(fontPath) {
	const { loadFile } = createDBFileContext(true);
	console.log('Loading file "' + fontPath + 'SCDream4.otf"...');
	loadFile(
		fontPath + 'SCDream4.otf',
		function (fontData4) {
			const base64_4 = arrayBufferToBase64(fontData4);
			const fontUrl4 = 'data:font/opentype;base64,' + base64_4;
			console.log('Loading file "' + fontPath + 'SCDream6.otf"...');
			loadFile(
				fontPath + 'SCDream6.otf',
				function (fontData6) {
					const base64_6 = arrayBufferToBase64(fontData6);
					const fontUrl6 = 'data:font/opentype;base64,' + base64_6;

					const style = document.createElement('style');
					style.textContent = `
							@font-face {  
								font-family: 'SCDream';  
								src: url('${fontUrl6}') format('opentype');  
								font-weight: 100; /* Thin */  
								font-style: normal;  
							}  
							
							@font-face {  
								font-family: 'SCDream';  
								src: url('${fontUrl6}') format('opentype');  
								font-weight: 200; /* Extra Light */  
								font-style: normal;  
							}  
							
							@font-face {  
								font-family: 'SCDream';  
								src: url('${fontUrl6}') format('opentype');  
								font-weight: 300; /* Light */  
								font-style: normal;  
							}  											
							@font-face {  
								font-family: 'SCDream';  
								src: url('${fontUrl6}') format('opentype');  
								font-weight: 400; /* Normal */  
								font-style: normal;  
							}  
							
							@font-face {  
								font-family: 'SCDream';  
								src: url('${fontUrl4}') format('opentype');  
								font-weight: 700; /* Bold */  
								font-style: normal;  
							}
								
							@font-face {  
								font-family: 'SCDream';  
								src: url('${fontUrl4}') format('opentype');  
								font-weight: 900; /* Black/Bolder */  
								font-style: normal;  
							}  								
						`;
					document.head.appendChild(style);
				},
				function () {
					console.warn('[loadFontFromClient] - Failed to load client font:', fontPath);
				}
			);
		},
		function () {
			console.warn('[loadFontFromClient] - Failed to load client font:', fontPath);
		}
	);
}

// Helper function to convert ArrayBuffer to base64
function arrayBufferToBase64(buffer) {
	let binary = '';
	const bytes = new Uint8Array(buffer);
	const len = bytes.byteLength;
	for (let i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary);
}
