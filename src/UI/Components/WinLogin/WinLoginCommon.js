/**
 * WinLoginCommon.js
 *
 * Create a common login window for the game.
 *
 * @author AoShinHo
 */

import Configs from 'Core/Configs.js';
import Preferences from 'Core/Preferences.js';
import KEYS from 'Controls/KeyEventHandler.js';
import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import { montarOfertaNaEntrada, sincronizar as sincronizarOferta } from './ofertaNaEntrada.js';
import { enderecoDoCadastro } from 'UI/enderecoDoCadastro.js';
import { montarCadastroNaEntrada } from './cadastroNaEntrada.js';
import { montarEsqueciASenha } from './esqueciASenha.js';
import { montarEntradaSocial } from './entradaSocial.js';
import IdiomaIdle from 'UI/Components/IdiomaIdle/IdiomaIdle.js';
import cadastroHtml from './cadastroNaEntrada.html?raw';
import cadastroCss from './cadastroNaEntrada.css?raw';
import esqueciHtml from './esqueciASenha.html?raw';
import esqueciCss from './esqueciASenha.css?raw';
import 'UI/Elements/Elements.js';

export function createWinLogin({ name, htmlText, cssText }) {
	// A janela de cadastro (23/09/2026) e a de "esqueci minha senha"
	// (08/10/2026) vem junto em toda versao do login.
	const Component = new GUIComponent(name, `${cssText}\n${cadastroCss}\n${esqueciCss}`);
	Component.render = () => htmlText + cadastroHtml + esqueciHtml;
	Component.needFocus = false;

	const _preferences = Preferences.get('WinLogin', { saveID: true, ID: '' }, 1.0);

	let _inputUsername;
	let _inputPassword;
	let _buttonSave;
	let _cadastro = null;
	let _esqueci = null;

	Component.init = function init() {
		// SEM this.draggable() de proposito (19/08/2026): GUIComponent#
		// _fixPositionOverflow() so roda pra componente draggable, e ela le
		// Renderer.width/height (UI/ClampToViewport.js) -- que ainda estao no
		// default "0" aqui, porque o WinLogin aparece ANTES do Renderer.init()
		// (a cena 3D so comeca depois do login). Com WIDTH=HEIGHT=0 o clamp
		// achava que a janela sempre estourava a viewport e reescrevia
		// left/top pra "0px" -- prendia a janela no canto superior esquerdo
		// TODA vez, mascarado ate agora porque a V2 antiga nao tinha fundo/
		// botao visivel (bitmap ausente no GRF) pra alguem notar a posicao
		// errada. A pele nao arruma o bug do outro lado (Renderer/
		// ClampToViewport sao codigo de motor, fora do escopo desta tela) --
		// so evita disparar esse caminho aqui, perdendo so o arrastar (que
		// esta janela nunca precisou).
		const root = this.getRoot();
		// Save element references
		_inputUsername = root.querySelector('.user');
		_inputPassword = root.querySelector('.pass');
		_buttonSave = root.querySelector('.save');

		// Preserve typed credentials when positioning the caret or using autofill.
		for (const input of [_inputUsername, _inputPassword]) {
			input.addEventListener('mousedown', event => event.stopImmediatePropagation());
		}

		// Save button toggle
		_buttonSave.addEventListener('click', event => {
			toggleSaveButton();
			event.stopImmediatePropagation();
		});

		// Connect / Signup / Exit
		root.querySelector('.signup').addEventListener('click', signup);
		root.querySelector('.connect').addEventListener('click', connect);
		root.querySelector('.exit').addEventListener('click', exit);

		_cadastro = montarCadastroNaEntrada(root, {
			aoEntrar(usuario, senha) {
				_inputUsername.value = usuario;
				Component.onConnectionRequest(usuario, senha);
			}
		});

		// ESQUECI MINHA SENHA (08/10/2026): o codigo vai por e-mail, a senha
		// troca e o jogador entra direto com a nova. So o template que tem o
		// link (`.forgot`) o oferece.
		_esqueci = montarEsqueciASenha(root, {
			aoEntrar(usuario, senha) {
				_inputUsername.value = usuario;
				Component.onConnectionRequest(usuario, senha);
			}
		});
		const forgot = root.querySelector('.forgot');
		if (forgot && _esqueci) {
			forgot.addEventListener('click', event => {
				event.stopImmediatePropagation();
				if (_cadastro) _cadastro.fechar();
				_esqueci.abrir(_inputUsername.value);
			});
		}

		// ENTRAR COM GOOGLE OU DISCORD (10/10/2026): a conta sem senha entra pelo
		// provedor, e volta aqui com o passe de entrada (D-1379).
		montarEntradaSocial(root, {
			avisar: texto => UIManager.showMessageBox(texto, 'ok')
		});

		// A OFERTA DE INSTALACAO (D-945, 06/09/2026). A casca cala o banner do
		// proprio navegador (`preventDefault` no `beforeinstallprompt`, D-933) e
		// a unica oferta que sobrava morava DEPOIS do login, dentro das
		// Configuracoes -- entao quem abria no celular e olhava a tela de entrada
		// nunca soube que o jogo instala. A linha nasce escondida e so aparece
		// quando ha o que fazer; a regra esta em UI/ofertaDeInstalacao.js.
		montarOfertaNaEntrada(this);

		// Replay Upload, only present on the UI versions supporting replays
		const replayUpload = root.querySelector('.replay-upload');
		const replayButton = root.querySelector('.replay');

		if (!replayUpload || !replayButton) {
			return;
		}

		replayButton.addEventListener('click', () => {
			replayUpload.click();
		});
		replayUpload.addEventListener('change', function () {
			if (!this.files || !this.files.length) {
				return;
			}

			const file = this.files[0];
			this.value = ''; // reset so we can select same file again

			if (!file.name || !file.name.toLowerCase().endsWith('.rrf')) {
				UIManager.showMessageBox('Please select a Ragnarok replay file (.rrf).', 'ok');
				return;
			}

			loadReplay(file);
		});
	};

	Component.onAppend = function onAppend() {
		// O jogo em ingles (D-1929): o botao do idioma flutua sobre QUALQUER
		// versao da tela de login (a classica e a moderna), enquanto ela estiver.
		IdiomaIdle.mostrarAtalho();
		_inputUsername.value = _preferences.saveID ? _preferences.ID : '';
		_inputPassword.value = '';

		// Pele RAGIDLE (19/08/2026): o checkbox "manter conectado" era um
		// bitmap do cliente (chk_saveon/off.bmp) que a ROLatam GRF deste fork
		// tem, mas pintava a palavra "manter" direto no pixel. Virou marcacao
		// de classe + texto de verdade em WinLoginV2.html/css -- o ESTADO
		// (_preferences.saveID) continua exatamente o mesmo.
		_buttonSave.classList.toggle('is-checked', _preferences.saveID);
		_buttonSave.setAttribute('aria-pressed', String(_preferences.saveID));

		if (_preferences.ID.length) {
			_inputPassword.focus();
		} else {
			_inputUsername.focus();
		}

		// O estado da oferta muda entre uma aparicao e outra da tela (o
		// navegador pode ter oferecido a instalacao no meio do caminho, ou o
		// jogador pode ter instalado e voltado).
		sincronizarOferta(this.getRoot());

		Component.placeOnTop();
	};

	Component.onKeyDown = function onKeyDown(event) {
		if (this._host.style.display === 'none') return true;

		// A janela aberta por cima do login (cadastro ou esqueci a senha) fica
		// com o Enter, o Esc e o Tab.
		let aberta = null;
		if (_esqueci !== null && _esqueci.aberta()) aberta = _esqueci;
		else if (_cadastro !== null && _cadastro.aberta()) aberta = _cadastro;

		switch (event.which) {
			case KEYS.ENTER:
				if (this._shadow.activeElement?.tagName === 'BUTTON') {
					return true;
				}
				if (aberta) aberta.enviar();
				else connect();
				event.stopImmediatePropagation();
				return false;
			case KEYS.ESCAPE:
				if (aberta) aberta.fechar();
				else exit();
				event.stopImmediatePropagation();
				return false;
			case KEYS.TAB: {
				// Com uma janela aberta, o Tab gira so dentro dela.
				const escopo = aberta ? aberta.janela : this.getRoot();
				const controls = [...escopo.querySelectorAll('input:not([type="file"]), button')].filter(
					el => !el.disabled && el.getClientRects().length
				);
				const index = controls.indexOf(this._shadow.activeElement);
				const target = controls[(index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length];
				target.focus();
				event.preventDefault();
				event.stopImmediatePropagation();
				return false;
			}
		}
		return true;
	};

	function toggleSaveButton() {
		_preferences.saveID = !_preferences.saveID;
		_buttonSave.classList.toggle('is-checked', _preferences.saveID);
		_buttonSave.setAttribute('aria-pressed', String(_preferences.saveID));
	}

	function exit() {
		Component.onExitRequest();
		return false;
	}

	function connect() {
		const user = _inputUsername.value;
		const pass = _inputPassword.value;
		if (_preferences.saveID) {
			_preferences.saveID = true;
			_preferences.ID = user;
		} else {
			_preferences.saveID = false;
			_preferences.ID = '';
		}
		_preferences.save();
		Component.onConnectionRequest(user, pass);
		return false;
	}

	async function loadReplay(file) {
		try {
			// Loaded on demand, the replay stack pulls in the whole map engine
			const { default: ReplayPlayer } = await import('Engine/Replay/ReplayPlayer.js');
			const replay = new ReplayPlayer();

			await replay.load(file);
			Component.remove();
			replay.start();
		} catch (err) {
			console.error('[Replay] Error loading replay', err);
			UIManager.showMessageBox(`Could not load the replay file.\n${err.message || err}`, 'ok');
		}
	}

	function signup() {
		// A janela de cadastro mora nesta tela (ver `cadastroNaEntrada.js`).
		if (_cadastro) {
			_cadastro.abrir();
			return;
		}
		// Reserva: um template sem a janela vai ao site com o cadastro aberto
		// (ver `UI/enderecoDoCadastro.js`).
		const url = enderecoDoCadastro(
			Configs.get('registrationweb'),
			Configs.get('codigoDeIndicacao'),
			window.location
		);
		if (url) {
			window.location.assign(url);
		} else {
			UIManager.showPromptBox(
				'No registration URL was provided.\nIf this server uses simplified registration, then input your new:\n - Username followed by _M for Male and _F for Female account (Eg: MyUser_M)\n - Password.',
				'ok',
				'cancel',
				null,
				null
			);
		}
	}

	/**
	 * LEMBRA o usuario de quem entrou sem passar por esta tela (a entrada
	 * pos-cadastro, D-1379), do mesmo jeito que `connect` lembra quem digita:
	 * so com "salvar ID" ligado. Serve tambem para a tela vir PREENCHIDA quando
	 * aquela entrada falha e o jogador precisa digitar a senha.
	 *
	 * Mexe no `_preferences` desta instancia, e nao so no disco: ele foi lido
	 * quando o modulo carregou, e e dele que o `onAppend` tira o ID.
	 *
	 * @param {string} usuario
	 */
	Component.lembrarUsuario = function lembrarUsuario(usuario) {
		if (!_preferences.saveID || typeof usuario !== 'string') return;
		_preferences.ID = usuario;
		_preferences.save();
	};

	Component.onConnectionRequest = function onConnectionRequest() {};
	Component.onExitRequest = function onExitRequest() {};

	Component.onRemove = function onRemove() {
		IdiomaIdle.esconderAtalho();
	};

	return UIManager.addComponent(Component);
}
