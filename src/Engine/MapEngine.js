/**
 * Engine/MapEngine.js
 *
 * Map Engine
 * Manage Map server
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

import DB from 'DB/DBManager.js';
import Configs from 'Core/Configs.js';
import SoundManager from 'Audio/SoundManager.js';
import BGM from 'Audio/BGM.js';
import Events from 'Core/Events.js';
import Session from 'Engine/SessionStorage.js';
import Network from 'Network/NetworkManager.js';
import Reconexao from 'Network/reconexao.js';
import BackgroundTicker from 'Network/BackgroundTicker.js';
import { criarVigiaDeSilencio } from 'Network/vigiaDeSilencio.js';
import PACKETVER from 'Network/PacketVerManager.js';
import PACKET from 'Network/PacketStructure.js';
import Renderer from 'Renderer/Renderer.js';
import Camera from 'Renderer/Camera.js';
import MapRenderer from 'Renderer/MapRenderer.js';
import EntityManager from 'Renderer/EntityManager.js';
import Entity from 'Renderer/Entity/Entity.js';
import Altitude from 'Renderer/Map/Altitude.js';
import MapControl from 'Controls/MapControl.js';
import Mouse from 'Controls/MouseEventHandler.js';
import KEYS from 'Controls/KeyEventHandler.js';
import UIManager from 'UI/UIManager.js';
import EffectManager from 'Renderer/EffectManager.js';
import Escape from 'UI/Components/Escape/Escape.js';
import PilhaDeJanelas from 'UI/pilhaDeJanelas.js'; // RAGIDLE: o dono do ESC e do voltar do Android (D-931)
import { avisarAoAbrir } from 'UI/aberturaNaPilha.js'; // a tarefa 25: o onAppend embrulhado UMA vez
import ChatBox from 'UI/Components/ChatBox/ChatBox.js';
// ChatBoxSettings saiu em 20/08/2026: era o painel de filtros POR ABA das
// abas dinamicas do chat, que morreram com os tres canais fixos (Global /
// Trade / Farm — ver o cabecalho de UI/Components/ChatBox/ChatBox.js). Sem
// filtro por aba para configurar, o painel so poderia mentir sobre o que
// controla, e ainda daria ao jogador um jeito de furar a regra de o log
// automatico da caca nunca cair na conversa.
import StatusConst from 'DB/Status/StatusState.js';
import CheckAttendance from 'UI/Components/CheckAttendance/CheckAttendance.js';
import WinStats from 'UI/Components/WinStats/WinStats.js';
import Inventory from 'UI/Components/Inventory/Inventory.js';
import Storage from 'UI/Components/Storage/Storage.js';
import CartItems from 'UI/Components/CartItems/CartItems.js';
import Vending from 'UI/Components/Vending/Vending.js';
import VendingReport from 'UI/Components/VendingReport/VendingReport.js';
import ChangeCart from 'UI/Components/ChangeCart/ChangeCart.js';
import CartDecoration from 'UI/Components/CartDecoration/CartDecoration.js';
import ShortCut from 'UI/Components/ShortCut/ShortCut.js';
import Equipment from 'UI/Components/Equipment/Equipment.js';
import SwitchEquip from 'UI/Components/SwitchEquip/SwitchEquip.js';
import ShortCuts from 'UI/Components/ShortCuts/ShortCuts.js';
import StatusIcons from 'UI/Components/StatusIcons/StatusIcons.js';
import ChatRoomCreate from 'UI/Components/ChatRoomCreate/ChatRoomCreate.js';
import Emoticons from 'UI/Components/Emoticons/Emoticons.js';
import FPS from 'UI/Components/FPS/FPS.js';
import PartyFriends from 'UI/Components/PartyFriends/PartyFriends.js';
import NpcStore from 'UI/Components/NpcStore/NpcStore.js';
import Guild from 'UI/Components/Guild/Guild.js';
import WorldMap from 'UI/Components/WorldMap/WorldMap.js';
import SkillListMH from 'UI/Components/SkillListMH/SkillListMH.js';
import MobileUI from 'UI/Components/MobileUI/MobileUI.js';
import { decidirNoFimDaCaminhada } from 'Engine/MapEngine/alcanceNoFimDaCaminhada.js';
import { fimDaCaminhadaEhDoPedido, TEXTO_FORA_DO_ALCANCE } from 'Engine/MapEngine/confirmacaoDaCaminhada.js';
import { descartarPedidoGuardado } from 'Engine/MapEngine/pedidoGuardado.js';
import CashShop from 'UI/Components/CashShop/CashShop.js';
import Bank from 'UI/Components/Bank/Bank.js';
import ItemReform from 'UI/Components/ItemReform/ItemReform.js';
import LaphineSys from 'UI/Components/LaphineSys/LaphineSys.js';
import LaphineUpg from 'UI/Components/LaphineUpg/LaphineUpg.js';
import Rodex from 'UI/Components/Rodex/Rodex.js';
import RodexIcon from 'UI/Components/Rodex/RodexIcon.js';
// RAGIDLE: so pelo __ragidleDebug da prova do Correio (ver mais abaixo) — o
// motor ja usa a ReadRodex por dentro de Engine/MapEngine/Rodex.js.
import ReadRodex from 'UI/Components/Rodex/ReadRodex.js';
import Roulette from 'UI/Components/Roulette/Roulette.js';
import PCGoldTimer from 'UI/Components/PCGoldTimer/PCGoldTimer.js';
import Refine from 'UI/Components/Refine/Refine.js';
import Reputation from 'UI/Components/Reputation/Reputation.js';
import PetInformations from 'UI/Components/PetInformations/PetInformations.js';
import HomunInformations from 'UI/Components/HomunInformations/HomunInformations.js';
import MapName from 'UI/Components/MapName/MapName.js';
import Announce from 'UI/Components/Announce/Announce.js';
import Navigation from 'UI/Components/Navigation/Navigation.js';
import CaptchaUpload from 'UI/Components/Captcha/CaptchaUpload.js';
import CaptchaSelector from 'UI/Components/Captcha/CaptchaSelector.js';
import CaptchaAnswer from 'UI/Components/Captcha/CaptchaAnswer.js';
import CaptchaPreview from 'UI/Components/Captcha/CaptchaPreview.js';
import Clan from 'UI/Components/Clan/Clan.js';
import WhisperBox from 'UI/Components/WhisperBox/WhisperBox.js';
import PluginManager from 'Plugins/PluginManager.js';
import SignboardManager from 'Renderer/SignboardManager.js';
import PvPTimer from 'UI/Components/PvPTimer/PvPTimer.js';
import PvPCount from 'UI/Components/PvPCount/PvPCount.js';
import BasicInfo from 'UI/Components/BasicInfo/BasicInfo.js';
import MiniMap from 'UI/Components/MiniMap/MiniMap.js';
import SkillList from 'UI/Components/SkillList/SkillList.js';
import Quest from 'UI/Components/Quest/Quest.js';
import PlayerViewEquip from 'UI/Components/PlayerViewEquip/PlayerViewEquip.js';
import JoystickUI from 'UI/Components/JoystickUI/JoystickUI.js';
import CashShopIcon from 'UI/Components/CashShopIcon/CashShopIcon.js';
import Achievement from 'UI/Components/Achievement/Achievement.js';
import HuntMap from 'UI/Components/HuntMap/HuntMap.js'; // RAGIDLE: "Mapa de Caça"
import ClassChangeNotice from 'UI/Components/ClassChangeNotice/ClassChangeNotice.js'; // RAGIDLE: aviso de evolução de classe
import MissoesIdle from 'UI/Components/MissoesIdle/MissoesIdle.js'; // RAGIDLE: janela de Missões (D-551)
import PasseIdle from 'UI/Components/PasseIdle/PasseIdle.js'; // RAGIDLE: janela do Passe (D-813)
import CodexIdle from 'UI/Components/CodexIdle/CodexIdle.js'; // RAGIDLE: janela do Codex (D-851)
import TutorialIdle from 'UI/Components/TutorialIdle/TutorialIdle.js'; // RAGIDLE: a camada guiada do tutorial (frente D da Jornada)
import VotoIdle from 'UI/Components/VotoIdle/VotoIdle.js'; // RAGIDLE: janela de Voto (D-1159)
import PresencaIdle from 'UI/Components/PresencaIdle/PresencaIdle.js'; // RAGIDLE: janela de presenca (D-1162)
import IndicacaoIdle from 'UI/Components/IndicacaoIdle/IndicacaoIdle.js'; // RAGIDLE: Indique & Ganhe (D-1164)
import TrocaIdle from 'UI/Components/TrocaIdle/TrocaIdle.js'; // RAGIDLE: a janela "Trade" do menu (02/10/2026)
import BotMenu from 'UI/Components/BotMenu/BotMenu.js'; // RAGIDLE: o menu do Bot novo (07/10/2026)
import RankingIdle from 'UI/Components/RankingIdle/RankingIdle.js'; // RAGIDLE: o Ranking (09/09/2026)
import AmigosIdle from 'UI/Components/AmigosIdle/AmigosIdle.js'; // RAGIDLE: a janela Amigos (05/10/2026)
import PainelComandoIdle from 'UI/Components/PainelComandoIdle/PainelComandoIdle.js'; // RAGIDLE: o painel de comando (D-1563)
import { medidorDePing } from 'Network/medidorDePing.js'; // RAGIDLE: o ping real (23/09/2026)
import TemporadaIdle from 'UI/Components/TemporadaIdle/TemporadaIdle.js'; // RAGIDLE: a janela da Temporada (Season 1, 21/09/2026)
import RoShop from 'UI/Components/RoShop/RoShop.js'; // RAGIDLE: o RO Shop (22/09/2026) - a loja de RO Cash que substitui a CashShop nativa como caminho de compra
import DoacaoIdle from 'UI/Components/DoacaoIdle/DoacaoIdle.js'; // RAGIDLE: a doacao via PIX (23/09/2026) - o "Recarregar" do RO Shop a abre
import PartyHud from 'UI/Components/PartyHud/PartyHud.js'; // RAGIDLE: a HUD de party (09/09/2026)
import PlacarMvpIdle from 'UI/Components/PlacarMvpIdle/PlacarMvpIdle.js'; // RAGIDLE: o placar ao vivo do MVP (D-1533)
import BoasVindasIdle from 'UI/Components/BoasVindasIdle/BoasVindasIdle.js'; // RAGIDLE: caixa de boas-vindas (D-968)
import LFGIdle from 'UI/Components/LFGIdle/LFGIdle.js'; // RAGIDLE: janela de Procurar Grupo (D-634)
import GrupoIdle from 'UI/Components/GrupoIdle/GrupoIdle.js'; // RAGIDLE: janela de Grupo (D-960)
import PortaDoGrupo from 'UI/Components/portaDoGrupo.js'; // RAGIDLE: qual das duas janelas de grupo abre (D-984)
import MissoesTrackerIdle from 'UI/Components/MissoesTrackerIdle/MissoesTrackerIdle.js'; // RAGIDLE: tracker estilo Origin (D-601)
import AdminPanel from 'UI/Components/AdminPanel/AdminPanel.js'; // RAGIDLE: "Painel de admin"
import IdleSkills from 'UI/Components/IdleSkills/IdleSkills.js'; // RAGIDLE: "Skills de {classe}"
import BasicInfoIdle from 'UI/Components/BasicInfoIdle/BasicInfoIdle.js'; // RAGIDLE: "Informações básicas"
import StatusIdle from 'UI/Components/StatusIdle/StatusIdle.js'; // RAGIDLE: "Status"
import MochilaIdle from 'UI/Components/MochilaIdle/MochilaIdle.js'; // RAGIDLE: "Mochila" (inventario + equipamento numa janela so)
// RAGIDLE: a "Capsula de zeny (topo)" (UI/Components/TopBarIdle) foi APAGADA
// em 20/08/2026, a pedido do dono: o contador de moedas mudou para o canto
// superior esquerdo, dentro do painel do personagem (a faixa ".bi-moeda" de
// UI/Components/BasicInfoIdle). Nenhuma fonte de dado mudou de lugar junto —
// os dois liam o MESMO Session.zeny, entao o que sumiu foi a segunda leitura,
// nao o dado.
// RAGIDLE (07/10/2026, Novo Bot V5): a janela "Idle" (IdleConfig), o botao
// "Ataque auto" (CombatCornerIdle) e a DockIdle aposentada foram RETIRADOS do
// cliente. A hotbar nativa ShortCut e a unica barra de skills; o automatico
// novo e o menu do Bot (BotMenu), e o contexto do mapa mora em
// UI/contextoDoMapa.js.
import DeathWindow from 'UI/Components/DeathWindow/DeathWindow.js'; // RAGIDLE: "Você morreu"
import TopMenuIdle from 'UI/Components/TopMenuIdle/TopMenuIdle.js'; // RAGIDLE: "Menu superior direito (constelação)"
import { agendarRedeDaHud } from 'Engine/redeDaHud.js'; // RAGIDLE: a HUD que a entrada interrompida deixava de fora (05/10/2026)
import { relatarErro } from 'UI/relatoDeErro.js';
// RAGIDLE (D-2055): a medida por fase do carregamento do mapa, relatada DEPOIS do estou-pronto
import { aoEstouProntoEnviado, marcarEntradaAceita, marcarPedidoDeEntrada } from 'Renderer/relatoDoCarregamento.js';
import { temPersonagemNoMundo } from 'Controls/guardaDoMundo.js'; // RAGIDLE (D-2055, A2): andar exige personagem
import CorreioIdle from 'UI/Components/CorreioIdle/CorreioIdle.js'; // RAGIDLE: "Correio" (a caixa do sistema, D-366)
import HuntAnalyzer from 'UI/Components/HuntAnalyzer/HuntAnalyzer.js'; // RAGIDLE: "Hunt Analyzer" (a leitura da cacada em curso)
import { religarAtalhosParaUiNova, religarAtalhoDoBasicInfo } from 'UI/atalhos-da-ui-nova.js'; // RAGIDLE: Alt+A/E/S/Q/U/V -> janelas novas
import HuntButtonIdle from 'UI/Components/HuntButtonIdle/HuntButtonIdle.js'; // RAGIDLE: "Botão de caça contextual (abaixo do minimapa)"

import MainEngine from './MapEngine/Main.js';
import MapStateEngine from './MapEngine/MapState.js';
import NPCEngine from './MapEngine/NPC.js';
import EntityEngine from './MapEngine/Entity.js';
import ItemEngine from './MapEngine/Item.js';
import MailEngine from './MapEngine/Mail.js';
import PrivateMessageEngine from './MapEngine/PrivateMessage.js';
import StorageEngine from './MapEngine/Storage.js';
import GroupEngine from './MapEngine/Group.js';
import GuildEngine from './MapEngine/Guild.js';
import SkillEngine from './MapEngine/Skill.js';
import ChatRoomEngine from './MapEngine/ChatRoom.js';
import PetEngine from './MapEngine/Pet.js';
import HomunEngine from './MapEngine/Homun.js';
import MercenaryEngine from './MapEngine/Mercenary.js';
import StoreEngine from './MapEngine/Store.js';
import TradeEngine from './MapEngine/Trade.js';
import FriendsEngine from './MapEngine/Friends.js';
import UIOpenEngine from './MapEngine/UIOpen.js';
import QuestEngine from './MapEngine/Quest.js';
import RodexEngine from './MapEngine/Rodex.js';
import RouletteEngine from './MapEngine/Roulette.js';
import PCGoldTimerEngine from './MapEngine/PCGoldTimer.js';
import CaptchaEngine from './MapEngine/Captcha.js';
import ClanEngine from './MapEngine/Clan.js';
import CashShopEngine from './MapEngine/CashShop.js';
import BankEngine from './MapEngine/Bank.js';
import AchievementEngine from './MapEngine/Achievement.js';
import RagidleRelatorioEngine from './MapEngine/RagidleRelatorio.js';
import RagidleCashEngine from './MapEngine/RagidleCash.js';
import RagidleConfirmarEngine from './MapEngine/RagidleConfirmar.js'; // RAGIDLE: janela de confirmacao do `#` destrutivo
import EscalaDaHud from 'UI/escalaDaHud.js'; // RAGIDLE: a HUD diminui junto com a janela (D-934)
import HudVertical from 'UI/hudVertical.js'; // RAGIDLE: a HUD vertical do celular em pe (D-939)
import TelaAcesaNoFarm from 'UI/telaAcesaNoFarm.js'; // RAGIDLE: o modo leitura — a tela nao apaga no farm

/**
 * @type {string} mapname
 */
let _mapName = '';

/**
 * @type {number|null} raw ip/port passed to init() — os MESMOS argumentos
 * que uma reconexao (Network/reconexao.js) precisa para re-entrar
 * (MapEngine.init de novo, o mesmo caminho ja reentrante do onServerChange).
 * Privados ate o R12 (14/09/2026): expor via `MapEngine.servidorAtual`.
 */
let _ip = null;
let _port = null;

/**
 * @type {boolean} is initialized
 */
let _isInitialised = false;

let _exiting = false;
let _exitTimer = null;

let snCounter = 0;
let chatLines = 0;

const packetMap = new Map();
/**
 * @namespace MapEngine
 */
class MapEngine {
	/**
	 * @type {boolean} do we need to update UI versions?
	 */
	static needsUIVerUpdate = false;

	/**
	 * O endereco do servidor de mapa ATUAL (R12, 14/09/2026) — `null` antes da
	 * primeira entrada. Getter, e nao propriedade solta: `_ip`/`_port`/
	 * `_mapName` continuam privados ao modulo, so' a LEITURA e' publica.
	 */
	static get servidorAtual() {
		return _ip !== null ? { ip: _ip, port: _port, mapName: _mapName } : null;
	}

	/**
	 * A desmontagem da sessao de mapa para quem leva ao login sem passar pelo
	 * logout (H07, auditoria 2 de 22/09/2026): `GameEngine.reload()`. O corpo
	 * e o mesmo do logout — ver `desmontarSessaoDeMapa`.
	 */
	static desmontarSessao() {
		desmontarSessaoDeMapa();
	}

	/**
	 * Connect to Map Server
	 *
	 * @param {number} ip
	 * @param {number} port
	 * @param {string} mapName
	 * @param {function} [aoFalhar] - R12 (14/09/2026): quando fornecida, e'
	 *   chamada no lugar de `UIManager.showErrorBox` se o connect falhar —
	 *   e' assim que Network/reconexao.js tenta de novo sem reabrir a caixa
	 *   de erro generica a cada tentativa. Omitida, o comportamento e' o de
	 *   sempre.
	 * @return {Socket} o socket criado (Network.connect ja o devolve
	 *   sincronamente) — a reconexao guarda essa referencia para poder
	 *   fechar explicitamente uma tentativa que fique pendurada.
	 */
	static init(ip, port, mapName, aoFalhar) {
		_mapName = mapName;
		_ip = ip;
		_port = port;
		_exiting = false;
		_exitTimer = null;
		// A espera pelo servidor de mapa comeca aqui (D-2055): a medida a fecha
		// no `ZC_ACCEPT_ENTER`. So um numero gravado - e mesmo assim protegido.
		try {
			marcarPedidoDeEntrada();
		} catch (_e) {
			/* medir nao e caminho critico */
		}

		// Connect to char server
		const forceAddress = Configs.get('forceUseAddress');
		const server_info = Configs.getServer();
		const current_ip = forceAddress ? server_info.address : Network.utils.longToIP(ip);
		const socket = Network.connect(
			current_ip,
			port,
			success => {
				/*
				 * FORCA O RECARREGAMENTO — mas nunca por cima de um carregamento
				 * EM CURSO (16/09/2026, a tela preta depois da economia).
				 *
				 * Com a aba oculta o carregamento do mapa so anda com um quadro, e
				 * a aba oculta nao da quadro: a primeira reconexao deixa
				 * `MapRenderer.loading` em `true` ate a aba voltar. Se a conexao
				 * nova cair de novo ainda oculta (a borda de D-1509), a segunda
				 * reconexao zerava o nome aqui, e o `setMap` dela voltava cedo por
				 * causa do `loading` — sem repor o nome. Na volta da aba o
				 * carregamento terminava com o nome VAZIO, o `Navigation` lancava
				 * dentro da transicao e o veu preto do `Background` ficava opaco
				 * para sempre: so o cursor na tela. Medido por
				 * `scripts/diag-tela-preta-da-economia.ts --quedas=2`.
				 *
				 * O pedido que chega durante o carregamento nao se perde: o
				 * `setMap` o guarda e o atende no fim (`MapRenderer.mapaPendente`).
				 */
				if (!MapRenderer.loading) {
					MapRenderer.currentMap = '';
				}

				// Fail to connect...
				if (!success) {
					if (typeof aoFalhar === 'function') {
						aoFalhar();
					} else {
						UIManager.showErrorBox(DB.getMessage(1));
					}
					return;
				}

				// Success, try to login.
				let pkt;
				if (PACKETVER.value >= 20180307) {
					pkt = new PACKET.CZ.ENTER2();
				} else {
					pkt = new PACKET.CZ.ENTER();
				}
				pkt.AID = Session.AID;
				pkt.GID = Session.GID;
				pkt.AuthCode = Session.AuthCode;
				pkt.clientTime = Date.now();
				pkt.Sex = Session.Sex;
				Network.sendPacket(pkt);

				// Server send back AID
				Network.read(fp => {
					// PACKETVER < 20070521: the map-server prefixes the stream with a raw
					// 4-byte account id (no packet header) before the first real packet.
					// It must be consumed even when TCP coalesces it with following packets;
					// the previous fp.length === 4 check only worked when the AID arrived in
					// its own segment, otherwise the parser read the AID as an opcode and
					// desynced the whole stream.
					if (PACKETVER.value < 20070521) {
						Session.AID = fp.readLong();
						Session.Entity.GID = Session.AID;
					}
				});

				const hbt = new PACKET.CZ.HBT();
				const is_sec_hbt = Configs.get('sec_HBT', null);

				// Ping
				let ping;
				const SP = Session.ping;

				if (PACKETVER.value >= 20180307) {
					ping = new PACKET.CZ.REQUEST_TIME2();
				} else {
					ping = new PACKET.CZ.REQUEST_TIME();
				}
				const startTick = Date.now();

				/*
				 * A VIGIA DE SILENCIO (lacuna 1 da auditoria da reconexao,
				 * 24/09/2026) — uma por conexao de mapa. Ela confere no MESMO
				 * relogio do keepalive, e nao num timer proprio, porque e esse
				 * relogio que ja sobrevive a aba escondida (o Worker do
				 * BackgroundTicker) e que ja dispara na volta da aba: a conexao
				 * que morreu calada com o jogador fora e descoberta no instante
				 * em que ele volta, sem mais um `visibilitychange` para cuidar.
				 * Ver `Network/vigiaDeSilencio.js` para o porque dos prazos.
				 */
				const vigiaDeSilencio = criarVigiaDeSilencio();

				// Shared by Network.setPing's own setInterval AND BackgroundTicker
				// below, so there is exactly one place that builds/sends the
				// keepalive. Duplicate calls in the same ~second are harmless:
				// the server only reads a timestamp off the packet.
				const sendKeepAlive = () => {
					// A conexao morreu sem fechar: derruba pelo caminho de uma
					// queda de verdade, e a reconexao automatica assume. O
					// keepalive nao sai — nao ha para onde mandar. Em try/catch
					// porque este corpo roda num Worker tick e no setInterval,
					// e um erro aqui nao pode calar o keepalive de uma conexao
					// que esta viva.
					try {
						if (vigiaDeSilencio.conferir(Network.ultimoRecebidoEm, Date.now()) && Network.derrubarPorSilencio()) {
							console.warn('[Network] conexao de mapa calada ha tempo demais; derrubada para reconectar');
							return;
						}
					} catch (err) {
						console.error('[Network] vigia de silencio falhou', err);
					}

					if (is_sec_hbt) {
						Network.sendPacket(hbt);
					}

					ping.clientTime = Date.now() - startTick;

					if (!SP.returned && SP.pingTime) {
						console.warn('[Network] The server did not answer the previous PING!');
					}
					SP.pingTime = ping.clientTime;
					SP.returned = false;

					Network.sendPacket(ping);
					// RAGIDLE (23/09/2026): o relogio do medidor de ping.
					medidorDePing.enviou(Date.now());
				};

				Network.setPing(sendKeepAlive);
				// RAGIDLE (23/09/2026): a PRIMEIRA medida de ping sai logo, e nao
				// depois dos 10 s do intervalo - a HUD mostrava "— ms" ate la.
				// Em `setTimeout` e com try/catch: nada disto pode tocar a
				// entrada no mapa (o aviso de D-993).
				setTimeout(() => {
					try {
						sendKeepAlive();
					} catch (err) {
						console.error('[ping] primeira medida falhou', err);
					}
				}, 1500);

				// Background tabs throttle setInterval to ~once/min and rAF to
				// ~0fps, starving the setPing above. BackgroundTicker runs the
				// same keepalive from a Web Worker (not throttled by visibility)
				// and also fires it immediately when the tab regains focus, so
				// the map-server's own resync-on-gap logic kicks in promptly.
				BackgroundTicker.start(sendKeepAlive);

				Session.Playing = true;

				/*
				 * R12 (14/09/2026): ARMA (ou re-arma) a reconexao automatica
				 * assim que o SOCKET fica de pe — antes mesmo da confirmacao
				 * do personagem (ZC_ACCEPT_ENTER*, ver onConnectionAccepted).
				 * Se o socket cair ANTES dessa confirmacao, ainda queremos
				 * tentar de novo com o mesmo endereco.
				 */
				Reconexao.armar(ip, port, mapName);
			},
			true
		);

		// Select UI version when needed
		if (MapEngine.needsUIVerUpdate || !_isInitialised) {
			if (PACKETVER.value < 20200520) {
				BasicInfo.selectUIVersion();
			}
			MiniMap.selectUIVersion();
			SkillList.selectUIVersion();
			Quest.selectUIVersion();
			Equipment.selectUIVersion();
			PlayerViewEquip.selectUIVersion();
			WinStats.selectUIVersion();
			Inventory.selectUIVersion();
			Storage.selectUIVersion();
			PartyFriends.selectUIVersion();
			NpcStore.selectUIVersion(); // loja versionada (V2 moderna, 01/09/2026)
		}

		// Do not hook multiple time
		if (!_isInitialised) {
			_isInitialised = true;

			MapControl.init();
			MapControl.onRequestWalk = onRequestWalk;
			MapControl.onRequestStopWalk = onRequestStopWalk;
			MapControl.onRequestDropItem = onDropItem;

			// Hook packets
			Network.hookPacket(PACKET.ZC.AID, onReceiveAccountID);
			Network.hookPacket(PACKET.ZC.ACCEPT_ENTER, onConnectionAccepted);
			Network.hookPacket(PACKET.ZC.ACCEPT_ENTER2, onConnectionAccepted);
			Network.hookPacket(PACKET.ZC.ACCEPT_ENTER3, onConnectionAccepted);
			Network.hookPacket(PACKET.ZC.NPCACK_MAPMOVE, onMapChange);
			Network.hookPacket(PACKET.ZC.NPCACK_SERVERMOVE, onServerChange);
			Network.hookPacket(PACKET.ZC.NPCACK_SERVERMOVE2, onServerChange);
			Network.hookPacket(PACKET.ZC.ACCEPT_QUIT, onExitSuccess);
			Network.hookPacket(PACKET.ZC.REFUSE_QUIT, onExitFail);
			Network.hookPacket(PACKET.ZC.RESTART_ACK, onRestartAnswer);
			Network.hookPacket(PACKET.ZC.ACK_REQ_DISCONNECT, onDisconnectAnswer);
			Network.hookPacket(PACKET.ZC.NOTIFY_TIME, onPong);
			Network.hookPacket(PACKET.ZC.PING_LIVE, onPingLive);
			Network.hookPacket(PACKET.ZC.CONFIG_NOTIFY, onConfigNotify);
			Network.hookPacket(PACKET.ZC.CONFIG_NOTIFY2, onConfigNotify);
			Network.hookPacket(PACKET.ZC.CONFIG_NOTIFY3, onConfigNotify);
			Network.hookPacket(PACKET.ZC.CONFIG_NOTIFY4, onConfigNotify);
			Network.hookPacket(PACKET.ZC.CONFIG, onConfig);
			Network.hookPacket(PACKET.ZC.REFUSE_ENTER, onConnectionRefused);
			// O "DORMIR" (D-1381): so dispara para quem esta dormindo — nao
			// muda em nada o caminho normal de entrada. Ver o cabecalho de
			// onSonoRecebido, abaixo.
			Network.hookPacket(PACKET.ZC.RAGIDLE_SONO, onSonoRecebido);
			// A ECONOMIA DE ENERGIA SAIU (07/10/2026); o gancho fica so para
			// encerrar uma sessao antiga - ver o cabecalho de onEconomiaRecebida.
			Network.hookPacket(PACKET.ZC.RAGIDLE_ECONOMIA, onEconomiaRecebida);

			// hook reassembly packets and map the responses
			for (let i = 1; i <= 42; i++) {
				const id = String(i).padStart(2, '0');

				const ZC = PACKET.ZC[`REASSEMBLY_AUTH${id}`];
				const CZ = PACKET.CZ[`REASSEMBLY_AUTH${id}`];

				packetMap.set(ZC, CZ);
				Network.hookPacket(ZC, onReassemblyAuth);
			}

			// Extend controller
			MainEngine();
			MapStateEngine();
			NPCEngine();
			EntityEngine();
			ItemEngine();
			MailEngine();
			PrivateMessageEngine();
			StorageEngine();
			GroupEngine.init();
			GuildEngine.init();
			SkillEngine();
			ChatRoomEngine();
			PetEngine();
			HomunEngine();
			MercenaryEngine();
			StoreEngine();
			TradeEngine();
			FriendsEngine.init();
			UIOpenEngine();
			QuestEngine();
			RodexEngine();
			RouletteEngine();
			PCGoldTimerEngine();
			CaptchaEngine();
			ClanEngine();
			if (Configs.get('enableCashShop')) {
				CashShopEngine();
			}

			if (Configs.get('enableAchievements') && PACKETVER.value >= 20150513) {
				AchievementEngine();
			}

			if (Configs.get('enableBank')) {
				BankEngine.init();
			}

			// RAGIDLE: the unattended-session return report (0x0ffc) — always
			// on; the packet only ever arrives when the server has one to tell.
			RagidleRelatorioEngine.init();
			RagidleCashEngine.init();
			RagidleConfirmarEngine.init();

			// RAGIDLE (dev only): expose internals so the server repo's probes
			// (Playwright, e.g. sonda-m15-avatar) can inspect entity state from
			// the outside. Gated on `development` — never ships in a real build.
			if (Configs.get('development')) {
				window.__ragidleDebug = {
					Session: Session,
					EntityManager: EntityManager,
					Camera: Camera,
					// RAGIDLE: acrescentados 07/09/2026 pela prova em jogo da
					// janela de refino (`scripts/fotografar-refino.ts`), que
					// precisa CLICAR num NPC sem andar ate ele.
					//
					// Ela tentava `await import('/src/Network/...')` e caía numa
					// armadilha do vite em desenvolvimento: o import dinamico
					// puxa uma SEGUNDA instancia do modulo (com `?t=` de HMR na
					// dependencia), e a segunda `PacketVerManager` nasce sem o
					// `versions` que a primeira ja tinha preenchido —
					// `TypeError: Cannot set properties of undefined`. Expor as
					// instancias VIVAS resolve na raiz: a prova usa as mesmas
					// que o jogo usa, e nao uma copia.
					Network: Network,
					PACKET: PACKET,
					// RAGIDLE: acrescentado 19/08/2026 pra prova Playwright da
					// MochilaIdle (janela unica de inventario + equipamento) —
					// injetar itens sinteticos e vestir uma peca pelo caminho
					// REAL (Inventory.getUI().setItems([...]),
					// Equipment.getUI().equip(...)) sem precisar de um NPC/
					// servidor de verdade so pra fotografar a janela.
					Inventory: Inventory,
					// RAGIDLE: acrescentado 30/09/2026 pela `prove:carrinho` (D-1848):
					// ler a carga do carrinho pelo ITID, que a janela nao desenha.
					CartItems: CartItems,
					Equipment: Equipment,
					DB: DB,
					MochilaIdle: MochilaIdle,
					// RAGIDLE: acrescentado 20/08/2026 pra prova Playwright do
					// Correio (gauntlet item 3) -- inspecionar o estado REAL do
					// correio (Rodex.list veio do servidor; RodexIcon apendado
					// = 0x09e7 com "mostrar 1") sem fisgar pacote nenhum, e
					// alimentar a ReadRodex nativa pelo MESMO caminho do 0x09eb
					// pra fotografar a tela de ANEXO -- que hoje nenhuma fonte
					// do servidor consegue produzir (ver o relatorio da tarefa).
					Rodex: Rodex,
					ReadRodex: ReadRodex,
					RodexIcon: RodexIcon,
					CorreioIdle: CorreioIdle,
					// RAGIDLE: acrescentado 24/08/2026 pro roteiro de fotos do
					// fluxo de Missoes (D-551/D-555) — falar com um NPC pelo
					// caminho REAL (CZ_CONTACTNPC) sem depender de acertar o
					// sprite no canvas: o jogador nasce longe do Mestre e a
					// caca de cliques as cegas nao e um roteiro, e loteria.
					// RAGIDLE: acrescentado 27/08/2026 pra sonda dos ATALHOS —
					// inspecionar qual onShortCut esta instalado em cada
					// componente nativo (UIManager.getComponent(nome)) sem
					// depender de teclado sintetico acertar o roteamento.
					UIManager: UIManager,
					// RAGIDLE (25/08): o roteiro de fotos do executor le o estado
					// da janela de missoes para saber quando a ativa concluiu.
					MissoesIdle: MissoesIdle,
					PasseIdle: PasseIdle,
					TemporadaIdle: TemporadaIdle,
					RoShop: RoShop,
					DoacaoIdle: DoacaoIdle,
					CodexIdle: CodexIdle,
					VotoIdle: VotoIdle,
					PresencaIdle: PresencaIdle,
					IndicacaoIdle: IndicacaoIdle,
					TrocaIdle: TrocaIdle,
					BotMenu: BotMenu,
					RankingIdle: RankingIdle,
					AmigosIdle: AmigosIdle,
					PartyHud: PartyHud,
					// RAGIDLE (D-968): a caixa de boas-vindas. A prova de tela
					// precisa reabri-la sem relogar — a trava de "uma vez por
					// entrada" é justamente o que impede repetir a medida.
					BoasVindasIdle: BoasVindasIdle,
					LFGIdle: LFGIdle,
					GrupoIdle: GrupoIdle
				};
			}

			// Prepare UI
			Escape.prepare();
			PvPTimer.prepare();
			PvPCount.prepare();
			Inventory.getUI().prepare();
			CartItems.prepare();
			Vending.prepare();
			ChangeCart.prepare();
			Equipment.getUI().prepare();
			ShortCuts.prepare();
			ShortCut.prepare();
			ChatRoomCreate.prepare();
			Emoticons.prepare();
			FPS.prepare();
			PartyFriends.getUI().prepare();
			StatusIcons.prepare();
			ChatBox.prepare();
			Guild.prepare();
			WorldMap.prepare();
			SkillListMH.homunculus.prepare();
			SkillListMH.mercenary.prepare();
			Rodex.prepare();
			RodexIcon.prepare();
			Roulette.prepare();
			PCGoldTimer.prepare();
			Navigation.prepare();
			CaptchaUpload.prepare();
			CaptchaSelector.prepare();
			CaptchaAnswer.prepare();
			CaptchaPreview.prepare();
			Clan.prepare();
			HuntMap.prepare(); // RAGIDLE: "Mapa de Caça"
			AdminPanel.prepare(); // RAGIDLE: "Painel de admin"
			IdleSkills.prepare(); // RAGIDLE: "Skills de {classe}"
			ClassChangeNotice.prepare(); // RAGIDLE: aviso de evolução de classe (D-410)
			MissoesIdle.prepare(); // RAGIDLE: janela de Missões (D-551) — sem dependência de ordem: só escuta 0x0fed
			PasseIdle.prepare(); // RAGIDLE: janela do Passe (D-813) — idem, só escuta 0x0fe5
			CodexIdle.prepare(); // RAGIDLE: janela do Codex (D-851) — idem, só escuta 0x0fe3
			TutorialIdle.prepare(); // RAGIDLE: a camada guiada do tutorial - idem, só escuta 0x0fdf
			VotoIdle.prepare(); // RAGIDLE: janela de Voto (D-1159) — idem, só escuta 0x0fd5
			PresencaIdle.prepare(); // RAGIDLE: janela de presenca (D-1162) — escuta 0x0fde e abre sozinha quando o servidor manda
			IndicacaoIdle.prepare(); // RAGIDLE: Indique & Ganhe (D-1164) — escuta 0x0fdc
			TrocaIdle.prepare(); // RAGIDLE: a janela "Trade" (02/10/2026) - escuta 0x0fb3
			BotMenu.prepare(); // RAGIDLE: o menu do Bot novo (07/10/2026) - escuta 0x0fb1
			BotMenu.lerMochila = () => Inventory.getUI().list || []; // RAGIDLE: o Armazem do Bot escolhe da mochila (sem ID digitado)
			RankingIdle.prepare(); // RAGIDLE: o Ranking — escuta 0x0fca
			AmigosIdle.prepare(); // RAGIDLE: a janela Amigos (05/10/2026) - ouve Friends.js/Group.js, nenhum pacote proprio
			PainelComandoIdle.prepare(); // RAGIDLE: o painel de comando — escuta 0x0fbc e abre SOZINHO quando o servidor manda (D-1563)
			TemporadaIdle.prepare(); // RAGIDLE: a janela da Temporada (Season 1) - idem, so escuta 0x0fbb
			RoShop.prepare(); // RAGIDLE: o RO Shop (22/09/2026) - idem, so escuta 0x0fb8
			DoacaoIdle.prepare(); // RAGIDLE: a doacao via PIX (23/09/2026) - NAO fisga pacote: o RoShop.js e o dono do 0x0fb8 e repassa o que tem tipo 'doacao'
			PartyHud.prepare(); // RAGIDLE: a HUD de party — NAO fisga pacote (ver o cabecalho)
			ligarAcessorioDaHud('placar do MVP', () => PlacarMvpIdle.prepare()); // RAGIDLE: escuta 0x0fbd (D-1533)
			BoasVindasIdle.prepare(); // RAGIDLE: caixa de boas-vindas (D-968) — não escuta pacote nenhum: a lista de cartazes é do cliente
			LFGIdle.prepare(); // RAGIDLE: janela de Procurar Grupo (D-634) — idem: só escuta 0x0fe9/0x0fe8
			GrupoIdle.prepare(); // RAGIDLE: janela de Grupo (D-960) — idem: só escuta 0x0fcc

			BasicInfoIdle.prepare(); // RAGIDLE: "Informações básicas"
			StatusIdle.prepare(); // RAGIDLE: "Status"
			MochilaIdle.prepare(); // RAGIDLE: "Mochila" — depois de Inventory.getUI()/Equipment.getUI() (linhas acima, secao "Prepare UI"): precisa dos dois _host nativos ja existentes pra esconde-los em MochilaIdle.onAppend()
			DeathWindow.prepare(); // RAGIDLE: "Você morreu"
			CorreioIdle.prepare(); // RAGIDLE: "Correio" — DEPOIS de Rodex.prepare()/RodexIcon.prepare() (linhas acima): CorreioIdle.onAppend() esconde os _host nativos de Rodex/ReadRodex/RodexIcon, e os tres precisam ja existir. O ReadRodex e a excecao: ele so ganha _host quando o motor o apenda no primeiro 0x09eb, e por isso CorreioIdle tambem reconfere no tique
			HuntAnalyzer.prepare(); // RAGIDLE: "Hunt Analyzer" — ANTES de TopMenuIdle.prepare(): o menu le isRagIdleWindowOpen(HuntAnalyzer, '.ha-window') no proprio tique de estado, e isso exige a shadow DOM ja pronta. Nao esconde nativo nenhum (e tela nova), entao nao depende de mais ninguem
			TopMenuIdle.prepare(); // RAGIDLE: "Menu superior direito (constelação)" — chama IdleSkills.toggle()/BotMenu.toggle() (RAGIDLE, ja preparados acima) e Guild.toggle()/PartyFriends.toggle() (nativos, ja preparados bem antes deste bloco); a shadow DOM de todos precisa existir antes do proprio prepare() de TopMenuIdle so por padrao do arquivo, nao por uso direto do DOM deles
			HuntButtonIdle.prepare(); // RAGIDLE: "Botão de caça contextual" — le o contexto do mapa (UI/contextoDoMapa.js) e chama HuntMap.toggle()/HuntMap.travelToCity(); tambem esconde AdminPanel.getRoot() ".ap-button", por isso fica depois de HuntMap.prepare()/AdminPanel.prepare() acima (precisa da shadow DOM dos dois ja pronta)
			religarAtalhosParaUiNova(); // RAGIDLE (27/08/2026): Alt+A/E/S/Q/U/V abrem as janelas NOVAS — depois de TODO prepare(), porque getComponent lanca para quem ainda nao existe. Ver o porque da delegacao (Preferences persistida) em UI/atalhos-da-ui-nova.js

			if (Configs.get('enableMapName')) {
				MapName.prepare();
			}

			if (Configs.get('enableCashShop')) {
				CashShopIcon.prepare();
				CashShop.prepare();
			}

			if (Configs.get('enableBank')) {
				Bank.prepare();
			}

			if (PACKETVER.value >= 20090617) {
				WhisperBox.prepare();
				WhisperBox.init();
			}

			if (PACKETVER.value >= 20141016) {
				VendingReport.prepare();
			}

			if (PACKETVER.value >= 20160601) {
				LaphineSys.prepare();
			}

			if (PACKETVER.value >= 20170726) {
				LaphineUpg.prepare();
			}

			if (Configs.get('enableRefineUI') && PACKETVER.value >= 20161012) {
				Refine.prepare();
			}

			if (PACKETVER.value >= 20170208) {
				SwitchEquip.prepare();
				SwitchEquip.onAddSwitchEquip = onAddSwitchEquip;
				SwitchEquip.onRemoveSwitchEquip = onRemoveSwitchEquip;
			}

			if (Configs.get('enableCheckAttendance') && PACKETVER.value >= 20180307) {
				CheckAttendance.prepare();
			}

			if (PACKETVER.value >= 20200916) {
				ItemReform.prepare();
			}

			if (PACKETVER.value >= 20220330) {
				Reputation.prepare();
			}

			if (Configs.get('enableAchievements') && PACKETVER.value >= 20150513) {
				Achievement.prepare();
			}

			// Bind UI
			PetInformations.onConfigUpdate = onConfigUpdate;
			HomunInformations.onConfigUpdate = onConfigUpdate;
			Escape.onExitRequest = onExitRequest;
			Escape.onCharSelectionRequest = onRestartRequest;
			Escape.onReturnSavePointRequest = onReturnSavePointRequest;
			Escape.onResurectionRequest = onResurectionRequest;
			ChatBox.onRequestTalk = onRequestTalk;
			WhisperBox.onRequestTalk = onRequestTalk;
		}

		// Init selected UIs when needed
		if (MapEngine.needsUIVerUpdate || !_isInitialised) {
			// Prepare UIs
			MiniMap.getUI().prepare();
			SkillList.getUI().prepare();
			if (PACKETVER.value < 20200520) {
				BasicInfo.getUI().prepare();
			}
			Equipment.getUI().prepare();
			Quest.getUI().prepare();
			WinStats.getUI().prepare();
			PartyFriends.selectUIVersion();

			// Bind UIs
			WinStats.getUI().onRequestUpdate = onRequestStatUpdate;
			Equipment.getUI().onUnEquip = onUnEquip;
			Equipment.getUI().onConfigUpdate = onConfigUpdate;
			Equipment.getUI().onEquipItem = onEquipItem;
			Equipment.getUI().onRemoveOption = onRemoveOption;
			Inventory.getUI().onUseItem = onUseItem;
			Inventory.getUI().onEquipItem = onEquipItem;

			// Avoid zone server change init
			MapEngine.needsUIVerUpdate = false;
		}

		return socket;
	}
}

/**
 * Pong from server
 * TODO: check the time ?
 */
function onPong(pkt) {
	const SP = Session.ping;

	SP.returned = true;
	// RAGIDLE (23/09/2026): o `pongTime` era zerado a mao e o ping saia
	// negativo. Agora e o tempo REAL de ida e volta (`medidorDePing.js`).
	const rtt = medidorDePing.respondeu(Date.now());
	SP.pongTime = SP.pingTime + (rtt ?? 0);
	SP.value = rtt ?? 0;

	Session.serverTick = pkt.time + SP.value / 2; // Adjust with half ping
}

/**
 * Ping from server?
 */
function onPingLive(pkt) {
	const pong_pkt = new PACKET.CZ.PING_LIVE();
	Network.sendPacket(pong_pkt);
}

/**
 * Receive user config from server
 *
 * @param {object} pkt - PACKET_ZC_CONFIG
 */
function onConfig(pkt) {
	switch (pkt.Config) {
		case 0:
			Equipment.getUI().setEquipConfig(pkt.Value);
			ChatBox.addText(DB.getMessage(1358 + (pkt.Value ? 1 : 0)), ChatBox.TYPE.INFO, ChatBox.FILTER.PUBLIC_LOG);
			break;
		case 1:
			Session.Entity.call_flag = pkt.Value;
			ChatBox.addText(DB.getMessage(2978 + (pkt.Value ? 0 : 1)), ChatBox.TYPE.INFO, ChatBox.FILTER.PUBLIC_LOG);
			break;
		case 2:
			PetInformations.setFeedConfig(pkt.Value);
			ChatBox.addText(DB.getMessage(2579 + (pkt.Value ? 0 : 1)), ChatBox.TYPE.INFO, ChatBox.FILTER.PUBLIC_LOG);
			break;
		case 3:
			HomunInformations.setFeedConfig(pkt.Value);
			ChatBox.addText(DB.getMessage(3282 + (pkt.Value ? 0 : 1)), ChatBox.TYPE.INFO, ChatBox.FILTER.PUBLIC_LOG);
			break;
		case 5:
			Equipment.getUI().setCostumeConfig(pkt.Value);
			break;
		default:
			console.error('[PACKET_ZC_CONFIG] Unknown Config Type %d (value:%d)', pkt.Config, pkt.Value);
	}
}

/**
 * Show some system configs
 *
 * @param {object} pkt - PACKET_ZC_CONFIG_NOTIFY
 */
function onConfigNotify(pkt) {
	if (typeof pkt.show_eq_flag !== 'undefined') {
		Equipment.getUI().setEquipConfig(pkt.show_eq_flag);
		ChatBox.addText(DB.getMessage(1358 + (pkt.show_eq_flag ? 1 : 0)), ChatBox.TYPE.INFO, ChatBox.FILTER.PUBLIC_LOG);
	}
	if (typeof pkt.pet_autofeeding_flag !== 'undefined') {
		PetInformations.setFeedConfig(pkt.pet_autofeeding_flag);
		ChatBox.addText(
			DB.getMessage(2579 + (pkt.pet_autofeeding_flag ? 0 : 1)),
			ChatBox.TYPE.INFO,
			ChatBox.FILTER.PUBLIC_LOG
		);
	}
	if (typeof pkt.call_flag !== 'undefined') {
		Session.Entity.call_flag = pkt.call_flag;
		ChatBox.addText(DB.getMessage(2978 + (pkt.call_flag ? 0 : 1)), ChatBox.TYPE.INFO, ChatBox.FILTER.PUBLIC_LOG);
	}
	if (typeof pkt.homunculus_autofeeding_flag !== 'undefined') {
		HomunInformations.setFeedConfig(pkt.homunculus_autofeeding_flag);
		ChatBox.addText(
			DB.getMessage(3282 + (pkt.homunculus_autofeeding_flag ? 0 : 1)),
			ChatBox.TYPE.INFO,
			ChatBox.FILTER.PUBLIC_LOG
		);
	}
}

/**
 * Server update our account id
 *
 * @param {object} pkt - PACKET.ZC.AID
 */
function onReceiveAccountID(pkt) {
	Session.AID = pkt.AID;
	Session.Entity.GID = pkt.AID;
}

/**
 * Map accept us to enter the map
 *
 * @param {object} pkt - PACKET.ZC.ACCEPT_ENTER
 */
function onConnectionAccepted(pkt) {
	// R12 (14/09/2026): entrada confirmada — se isto era uma reconexao em
	// curso, zera a escalada e avisa "reconectado"; se nao, e' um no-op
	// seguro (ver Reconexao.aoEntrarComSucesso).
	Reconexao.aoEntrarComSucesso();
	// D-2055: o fim da espera pelo servidor de mapa (a medida da entrada).
	try {
		marcarEntradaAceita();
	} catch (_e) {
		/* medir nao e caminho critico */
	}

	Session.Entity.onWalkEnd = onWalkEnd;

	if ('sex' in pkt && pkt.sex < 2) {
		Session.Entity.sex = pkt.sex;
	}

	// Reset
	Session.petId = 0;
	Session.hasParty = false;
	Session.isPartyLeader = false;
	/* RAGIDLE (D-984): a porta do grupo anota que a verdade voltou a zero.
	   Sem isto, a memória de party do personagem ANTERIOR atravessaria a troca
	   (nada aqui recarrega a página) e o primeiro grupo do personagem novo não
	   seria uma mudança para ela — a janela de Grupo não abriria sozinha. */
	PortaDoGrupo.sincronizar();
	Session.hasGuild = false;
	Session.guildRight = 0;

	Session.homunId = 0;

	// clevel is already populated by Entity.set() in the Player constructor

	Session.mapState = {
		property: 0,
		type: 0,
		flag: 0,
		isPVPZone: false,
		isAgitZone: false,
		isPVP: false,
		isGVG: false,
		isSiege: false,
		isNoLockOn: false,
		showPVPCounter: false,
		showBFCounter: false,
		isBattleField: false
	};

	if (PACKETVER.value >= 20200520) {
		BasicInfo.selectUIVersionWithJob(DB.getJobClass(Session.Entity.job));
		BasicInfo.getUI().prepare();
		// RAGIDLE (27/08/2026): a selecao POR CLASSE acabou de TROCAR o
		// componente e o alias — o religamento do boot morreu com o objeto
		// antigo (medido pela sonda: Alt+V voltava ao onShortCut nativo).
		// Religa de novo sobre o componente que valera daqui em diante.
		religarAtalhoDoBasicInfo();
	}

	BasicInfo.getUI().update('blvl', Session.Entity.clevel);
	BasicInfo.getUI().update('jlvl', Session.Entity.joblevel);
	BasicInfo.getUI().update('zeny', Session.Entity.money);
	BasicInfo.getUI().update('name', Session.Entity.display.name);
	BasicInfo.getUI().update('job', Session.Entity.job);

	// Fix http://forum.robrowser.com/?topic=32177.0
	onMapChange({
		xPos: pkt.PosDir[0],
		yPos: pkt.PosDir[1],
		mapName: _mapName
	}, true);
}

/**
 * onConnectionRefused
 *
 * @param {object} pkt - PACKET.ZC.REFUSE_ENTER
 */
function onConnectionRefused(pkt) {
	/*
	 * R12 (14/09/2026): uma recusa DURANTE um ciclo de reconexao quer dizer
	 * que a sessao (AuthCode) nao vale mais — nao adianta insistir no mesmo
	 * endereco. `aoSerRecusado()` so' age (e devolve true) quando havia um
	 * ciclo em curso; fora disso o comportamento e' o de sempre.
	 */
	if (Reconexao.aoSerRecusado()) {
		return;
	}
	UIManager.showErrorBox(DB.getMessage(9)); // MSI_ACCESS_DENIED = Rejected from Server.
}

/**
 * O TEXTO DA RECUSA, por codigo (D-1383, 13/09/2026 — o relato do grupo de
 * teste: a contagem de 5s terminava e o jogo so CONTINUAVA, sem sinal
 * nenhum de que o "iniciar" tinha sido recusado). `amostra-insuficiente` e a
 * mais provavel: a amostra do servidor reseta em TODO mapa novo (D-1381),
 * mas a "Duracao" que o Hunt Analyzer mostra e da CACADA inteira e pode
 * atravessar varios mapas de caca sem resetar — os dois relogios medem
 * coisas diferentes de proposito, e essa diferenca e o que engana o botao
 * quando o jogador troca de mapa de caca no meio da sessao.
 */
const TEXTO_DA_RECUSA_DE_SONO = {
	// 28/09/2026: o sono GASTA os 10 minutos (item 4b do backlog de seguranca de
	// 23/09) - quem acorda caca de novo antes de dormir de novo.
	'amostra-insuficiente':
		'Ainda não são 10 minutos de caça NESTE mapa — trocar de mapa reinicia a contagem, e depois de acordar é preciso caçar 10 minutos de novo.',
	// 28/09/2026: morto nao dorme (item 4a do backlog de seguranca de 23/09).
	morto: 'Não dá para dormir morto — volte à caçada primeiro.',
	'nivel-do-mapa': 'Este mapa não é elegível para o "Dormir" — precisa estar pelo menos 1 nível abaixo do seu.',
	// RAGIDLE (30/09/2026, ordem do dono): praca nunca dorme - o tempo dela e contado por dia.
	praca: 'Nas Praças não dá para dormir: o tempo delas é contado por dia. Durma num mapa de caça.',
	'sem-mundo': 'Não foi possível iniciar o sono agora — você não está numa caçada.',
	// RAGIDLE (24/09/2026, ordem do dono): um sono por conta.
	'outro-personagem-dormindo': 'Só um personagem por conta pode dormir por vez.'
};

/**
 * O tempo que `onSonoRecebido` espera pela resposta do "acordar" antes de
 * desistir do resumo e reconectar do mesmo jeito (D-1387). So dispara se a
 * resposta se perder de verdade (rede caiu entre o clique e o pacote voltar)
 * — o caminho normal responde em milissegundos, no MESMO socket.
 */
const MS_DE_ESPERA_PELO_ACORDAR = 8000;

/** A janela "Dormindo.../Acordando..." hoje aberta, se houver (D-1387). */
let _janelaDoSonoAtiva = null;
/**
 * Ja resolvemos o "acordar" desta rodada — pelo ack do servidor ou pelo teto
 * de seguranca, o que chegar primeiro? Evita reagir duas vezes se a resposta
 * chegar atrasada, depois do teto ja ter fechado a janela e reconectado.
 */
let _acordarResolvido = false;

/**
 * onSonoRecebido (D-1381, 13/09/2026 — taxas de EXP em D-1386, resumo do
 * "acordar" em D-1387) — o "Dormir".
 *
 * O servidor responde ao MESMO `CZ_ENTER2` que dispara `onConnectionAccepted`
 * com `ZC_RAGIDLE_SONO{dormindo:true, restanteMs, taxaExpBasePorMs,
 * taxaExpClassePorMs}` em vez de `ZC_ACCEPT_ENTER2`, quando o personagem
 * ainda esta dormindo. Isto so chega para quem esta dormindo — o caminho
 * normal (accept/refuse) nunca muda.
 *
 * `UIManager.showDormindo` e a MESMA janela (`WinPopup` clonada) que
 * `showErrorBox` usa para o boot inteiro — a unica comprovada a renderizar
 * aqui, antes de `MapEngine` ter entrado em mundo nenhum.
 *
 * Uma RECUSA (`dormindo:false` com `recusa`) tambem tem tela. A resposta ao
 * "acordar" bem-sucedido tambem manda `dormindo:false`, mas SEM `recusa` — e
 * o ramo novo (D-1387): fecha a janela de espera, mostra o RESUMO do que foi
 * ganho, e SO NO "Continuar" do resumo reconecta. O relato do Jhow no grupo
 * de teste ("ficou meio bugado na hora de voltar... aparece essa mensagem")
 * era exatamente a corrida entre o close do servidor e o reload do cliente —
 * o reload saia ANTES de esperar esta resposta, entao o dialogo generico de
 * "Disconnected from Server" (`NetworkManager.js`) as vezes ganhava a corrida
 * e aparecia por cima. `Network.onDisconnect` suprime esse dialogo soh para
 * este close deliberado; `LoginEngine.init` reassume o dele proprio assim que
 * o boot volta a tela de login, entao nao precisa ser desfeito aqui.
 */
/**
 * VOLTAR AO MUNDO DEPOIS DO SONO — SEM PEDIR LOGIN DE NOVO (D-1485, 15/09/2026).
 *
 * ---------------------------------------------------------------------------
 * O RELATO, E ONDE ESTAVA A CULPA
 * ---------------------------------------------------------------------------
 * Dono: *"quando o player clicasse em 'acordar agora', que nao precisasse
 * refazer o login/senha"*.
 *
 * O caminho antigo chamava `GameEngine.reload()`, que derruba a sessao inteira
 * ate a LISTA DE SERVIDORES — e dali o proximo passo e a tela de usuario e
 * senha. Era o CLIENTE que fazia isso: **o `conexao.encerrar()` do lado do
 * servidor e deliberado e esta certo**. O comentario dele diz o porque — quem
 * dormiu SAIU do mundo no `iniciar`, entao reentrar no meio do mesmo socket
 * duplicaria a sequencia de entrada; fechar faz o cliente refazer o MESMO
 * `CZ_ENTER2` que a entrada normal usa.
 *
 * E esse pacote **nao precisa de senha**: ele leva `AID`/`GID`/`AuthCode`, que
 * moram em `Session` (memoria), e o passe do servidor vale por uma janela
 * deslizante de 15 minutos (`servidor/validade-do-passe.ts`) — uma reconexao
 * imediata cai folgada dentro dela. O servidor ate remove sozinho a sessao
 * anterior do mesmo personagem ("um personagem, uma sessao"): este caminho foi
 * desenhado para reconexao.
 *
 * ---------------------------------------------------------------------------
 * POR QUE `MapEngine.init` E NAO UMA PECA NOVA
 * ---------------------------------------------------------------------------
 * O merge de 15/09 trouxe a reconexao automatica, e com ela o getter
 * `MapEngine.servidorAtual` — que estava **sem um unico chamador**, nasceu para
 * a R12 e ficou esperando. E exatamente a alca que faltava aqui, e reusa-la faz
 * o "acordar" percorrer o MESMO caminho que uma queda de conexao ja percorre, e
 * que dois testes ja vigiam (`reconexaoAutomatica`, `reconexaoTransporte`).
 *
 * O `reload()` continua existindo como ULTIMO recurso: sem endereco guardado,
 * ou se a reentrada falhar de verdade (passe vencido, servidor fora do ar), a
 * tela de login e a resposta honesta.
 */
function voltarAoMundoDepoisDoSono() {
	const aoBoot = () => {
		import('Engine/GameEngine.js').then(m => m.default.reload());
	};
	const servidor = MapEngine.servidorAtual;
	if (!servidor) {
		aoBoot();
		return;
	}
	MapEngine.init(servidor.ip, servidor.port, servidor.mapName, aoBoot);
}

function onSonoRecebido(pkt) {
	let corpo;
	try {
		corpo = JSON.parse(pkt.json);
	} catch {
		return;
	}
	if (!corpo) {
		return;
	}

	if (corpo.dormindo === true) {
		_acordarResolvido = false;
		/*
		 * RECONECTAR DORMINDO (F10, auditoria de 22/09/2026). Quem volta
		 * dormindo recebe esta resposta e NUNCA o `ACCEPT_ENTER` — o personagem
		 * nao esta no mundo. Sem avisar a reconexao, o watchdog fechava o socket,
		 * ela tentava de novo ate 12x, e cada volta somava uma tela preta por
		 * cima da anterior. Esta resposta E a entrada bem-sucedida de quem dorme.
		 */
		Reconexao.aoEntrarComSucesso();
		if (_janelaDoSonoAtiva) {
			_janelaDoSonoAtiva.remove();
			_janelaDoSonoAtiva = null;
		}
		const taxas = {
			expBasePorMs: Number(corpo.taxaExpBasePorMs) || 0,
			expClassePorMs: Number(corpo.taxaExpClassePorMs) || 0
		};
		_janelaDoSonoAtiva = UIManager.showDormindo(corpo.restanteMs || 0, taxas, () => {
			const acordar = new PACKET.CZ.RAGIDLE_SONO_ACAO();
			acordar.json = JSON.stringify({ acao: 'acordar' });
			/*
			 * A PORTA DO FECHAMENTO DELIBERADO, e nao a do logout (F09,
			 * auditoria de 22/09/2026). D-1485 trocou a atribuicao crua por
			 * `Reconexao.cancelar()` achando que os dois calavam o dialogo de
			 * "Disconnected from Server" — e `cancelar()` deixa o gancho NULL,
			 * que e exatamente o que abre o dialogo (`NetworkManager.onClose`).
			 * O servidor fecha o socket logo depois do resumo, e o OK da caixa
			 * mandava ao login. A porta certa e do proprio modulo da
			 * reconexao, e deixa um gancho no-op; quem rearma continua sendo o
			 * `Reconexao.armar()` que roda quando o socket novo abre.
			 */
			Reconexao.cancelarParaFechamentoDeliberado();
			Network.sendPacket(acordar);
			setTimeout(() => {
				if (_acordarResolvido) return;
				_acordarResolvido = true;
				if (_janelaDoSonoAtiva) {
					_janelaDoSonoAtiva.remove();
					_janelaDoSonoAtiva = null;
				}
				// O teto de seguranca: a resposta se perdeu. Mesmo aqui a volta e
				// pelo mundo, e nao pelo login — so a falha DELA cai no boot.
				voltarAoMundoDepoisDoSono();
			}, MS_DE_ESPERA_PELO_ACORDAR);
		});
		return;
	}

	// dormindo === false a partir daqui.
	if (corpo.recusa) {
		let texto = TEXTO_DA_RECUSA_DE_SONO[corpo.recusa] || 'Não foi possível iniciar o sono agora.';
		// Quem ja dorme na conta, pelo nome (24/09/2026).
		if (corpo.recusa === 'outro-personagem-dormindo' && corpo.outroPersonagem) {
			texto += ` "${String(corpo.outroPersonagem)}" já está dormindo — acorde-o antes.`;
		}
		UIManager.showMessageBox(texto, 'ok');
		return;
	}

	// O ACK do "acordar": fecha a janela de espera e mostra o resumo.
	if (_acordarResolvido) return; // o teto de seguranca ja resolveu isto
	_acordarResolvido = true;
	if (_janelaDoSonoAtiva) {
		_janelaDoSonoAtiva.remove();
		_janelaDoSonoAtiva = null;
	}
	const resumo = {
		expBase: Number(corpo.expBase) || 0,
		expClasse: Number(corpo.expClasse) || 0,
		tempoDormidoMs: Number(corpo.tempoDormidoMs) || 0
	};
	UIManager.showResumoDoSono(resumo, voltarAoMundoDepoisDoSono);
}

/* ---------------- A ECONOMIA DE ENERGIA: SO A SAIDA (07/10/2026) ---------------- */

/**
 * A ECONOMIA DE ENERGIA SAIU DO CLIENTE (07/10/2026, Novo Bot V5). O combate e
 * o do Modo Classico, o personagem nao joga sozinho, e o servidor ja RECUSA o
 * `entrar`. Sairam: o pedido automatico na aba escondida
 * (`visibilitychange`), a opcao nas Configuracoes de Video e a tela preta.
 *
 * O que FICA e o dono do `ZC_RAGIDLE_ECONOMIA` (hookPacket: um dono por
 * opcode), so para nao deixar ninguem preso numa sessao de economia aberta
 * ANTES da retirada: se o servidor disser `ativa:true`, o cliente pede a saida
 * na hora (o mesmo `sair` que o antigo "Voltar a jogar" mandava); se disser
 * `expulso:true` (o personagem ja saiu do mundo e o socket vai fechar), volta
 * pelo boot, como antes.
 */
function onEconomiaRecebida(pkt) {
	let corpo;
	try {
		corpo = JSON.parse(pkt.json);
	} catch {
		return;
	}
	if (!corpo) {
		return;
	}

	if (corpo.ativa === true) {
		const sair = new PACKET.CZ.RAGIDLE_ECONOMIA_ACAO();
		sair.json = JSON.stringify({ acao: 'sair' });
		Network.sendPacket(sair);
		return;
	}

	if (corpo.expulso === true) {
		import('Engine/GameEngine.js').then(m => m.default.reload());
	}
}

/**
 * Changing map, loading new map
 *
 * @param {object} pkt - PACKET.ZC.NPCACK_MAPMOVE
 */
/**
 * RAGIDLE (09/09/2026): liga um acessorio da HUD sem deixar que ele derrube
 * o resto da entrada no mapa.
 *
 * MEDIDO, e nao suposto. `onMapChange` e um handler de ~460 linhas, e os tres
 * `ligar()` (escala, HUD vertical, modo leitura) ficam no MEIO dele. Depois
 * deles, no MESMO bloco, ainda rodam:
 *
 *   - `CheckAttendance.append()` — a janela de presenca diaria (D-1162);
 *   - `PluginManager.init()`;
 *   - `Network.sendPacket(CZ.NOTIFY_ACTORINIT)` — o estou-pronto ao servidor;
 *   - o anuncio de taxas e a lista da loja de cash.
 *
 * Uma excecao em qualquer um dos tres levava tudo isso junto, em silencio.
 *
 * E A PROVA NAO VIA. `npm run prove:e2e` sai 9/9 mesmo com o modulo do modo
 * leitura lancando de proposito — conferido nas duas direcoes em 09/09/2026 —
 * porque os nove passos dela terminam ANTES desta linha: a UI de jogo ja
 * apareceu e o servidor ja sabe do personagem pelo MAPMOVE. "O jogador entra"
 * e verdade e nao e o bastante.
 *
 * O `catch` NAO engole: ele registra no console com o nome de quem falhou.
 * Acessorio de HUD nao e razao para o jogo nao comecar; e razao para um erro
 * legivel.
 */
function ligarAcessorioDaHud(nome, ligar) {
	try {
		ligar();
	} catch (erro) {
		console.error('[hud] ' + nome + ' falhou ao ligar — o jogo segue sem ele:', erro);
	}
}

/**
 * @param {boolean} [ehEntradaNoMundo] `true` só quando quem chama é
 *   `onConnectionAccepted` — login OU RECONEXÃO (`ZC_ACCEPT_ENTER2`/`ENTER3`).
 *   `false`/ausente é o caminho comum, o hook de `ZC_NPCACK_MAPMOVE`
 *   (teleporte dentro da MESMA conexão — Asa de Mosca, viagem por menu).
 */
function onMapChange(pkt, ehEntradaNoMundo) {
	// C47 (C-1): o pedido de skill guardado e do mapa de antes (x,y velhos).
	descartarPedidoGuardado(Session);
	MapRenderer.onLoad = () => {
		/*
		 * O ESTOU-PRONTO SAI MESMO QUE ALGO ANTES DELE LANCE (F28, auditoria de
		 * 22/09/2026 — a familia do aviso D-993). O `CZ_NOTIFY_ACTORINIT`
		 * completa a entrada no mapa, e ele sai la embaixo, depois de dezenas de
		 * chamadas RAGIDLE. Uma excecao em qualquer uma delas e o pacote nunca
		 * saia: o servidor ficava com `carregandoMapa` e o tique parava de
		 * dirigir o jogador — mapa vazio e caca parada.
		 *
		 * A rede de seguranca e agendada ANTES de tudo. No caminho normal o
		 * pacote sai no MESMO ponto de sempre e a rede, quando dispara, ve que
		 * ja saiu e nao faz nada. Envolver as ~600 linhas num `try/finally`
		 * teria o mesmo efeito com um diff de reindentacao do handler inteiro.
		 */
		let estouProntoSaiu = false;
		const estouPronto = () => {
			if (estouProntoSaiu) return;
			estouProntoSaiu = true;
			Network.sendPacket(new PACKET.CZ.NOTIFY_ACTORINIT());
			// D-2055: DEPOIS do pacote, fecha a medida do carregamento; o envio
			// do relato sai noutro `setTimeout`, nunca nesta volta.
			try {
				aoEstouProntoEnviado();
			} catch (_e) {
				/* medir nao e caminho critico */
			}
		};
		setTimeout(estouPronto, 0);
		/*
		 * A REDE DA HUD (05/10/2026, os botoes "Caçar"/"Retornar" que sumiam na
		 * Floresta Encantada 2 e so voltavam relogando). Mesmo desenho da rede
		 * acima: agendada ANTES da lista de `append()`, roda depois dela e, no
		 * caminho normal, ve todos ativos e nao faz nada. Se algo na lista lancar,
		 * ela anexa os controles que o jogador nao tem como reabrir e RELATA o que
		 * parou a lista. O porque inteiro esta em `Engine/redeDaHud.js`.
		 */
		agendarRedeDaHud([BasicInfoIdle, DeathWindow, MissoesTrackerIdle, TopMenuIdle, HuntButtonIdle], {
			relatar: relatarErro
		});
		/*
		 * RAGIDLE (B1, 06/09/2026) — A SEGUNDA LIMPEZA, E ELA E O CONSERTO.
		 *
		 * Reporte do playtest: *"essa prova de vocacao (...) ta levando pra
		 * Prontera com os mobs"*. A pista que fechou o diagnostico foi do
		 * proprio dono: *"quando eu dei ctrl f5 (sem cache) (...) desbugou"* —
		 * recarregar conserta estado do CLIENTE, e so dele.
		 *
		 * `MapRenderer.setMap` ja limpa as entidades, mas no COMECO do
		 * carregamento, e o mapa parseia num worker por SEGUNDOS. Nessa janela a
		 * rede segue sendo processada: todo pacote de entidade do mapa VELHO
		 * ainda em voo quando o `viajar` rodou — os mobs que o jogador estava
		 * batendo, os passos deles, os que nasceram no mesmo tique — chega
		 * DEPOIS daquela limpeza, entra no EntityManager e sobrevive para o mapa
		 * novo. Por isso o defeito so aparece quando a viagem acontece NO MEIO
		 * DA LUTA, que e exatamente o que a Prova de Vocacao faz: o primeiro
		 * passo dela e `{ tipo: 'travel', mapa: 'prontera' }`.
		 *
		 * Aqui e o instante CERTO por construcao: o servidor so desce o lote do
		 * mapa novo depois de receber o `CZ_NOTIFY_ACTORINIT`, que sai no fim
		 * desta funcao. Entao o que estiver no EntityManager agora e resto do
		 * mapa anterior, e nada de legitimo e perdido.
		 *
		 * A limpeza do comeco FICA: e ela que apaga a tela enquanto a arte do
		 * carregamento sobe. As duas juntas fecham a janela inteira.
		 */
		EntityManager.free();

		Session.Entity.set({
			PosDir: [pkt.xPos, pkt.yPos, 0],
			// Use Session.AID rather than Session.Entity.GID here:
			// EntityManager removes Session.Entity during map transition, which
			// triggers Entity.clean() and sets this.GID = -1. Reading the GID
			// back from the entity at this point would produce -1.
			// Session.AID (account ID) equals the player's entity GID on the
			// map server and is never mutated by entity cleanup.
			GID: Session.AID
		});
		EntityManager.add(Session.Entity);
		if (Session.Entity.effectState & StatusConst.EffectState.FALCON) {
			if (!Session.Entity.falcon) {
				Session.Entity.falcon = new Entity();
			}

			Session.Entity.falcon.set({
				objecttype: Session.Entity.falcon.constructor.TYPE_FALCON,
				GID: Session.Entity.GID + '_FALCON',
				PosDir: [Session.Entity.position[0], Session.Entity.position[1], 0],
				job: Session.Entity._job + '_FALCON',
				speed: Math.max(Session.Entity.walk.speed - 50, 1),
				name: '',
				hp: -1,
				maxhp: -1,
				hideShadow: true
			});
			EntityManager.add(Session.Entity.falcon);
		}
		if (Session.Entity.effectState & StatusConst.EffectState.WUG) {
			if (!Session.Entity.wug) {
				Session.Entity.wug = new Entity();
			}

			Session.Entity.wug.set({
				objecttype: Session.Entity.wug.constructor.TYPE_WUG,
				GID: Session.Entity.GID + '_WUG',
				PosDir: [Session.Entity.position[0], Session.Entity.position[1], 0],
				job: Session.Entity._job + '_WUG',
				speed: Math.max(Session.Entity.walk.speed - 50, 1),
				name: '',
				hp: -1,
				maxhp: -1
			});
			EntityManager.add(Session.Entity.wug);
		}
		// free and load aura so it loads in new map
		Session.Entity.aura.free();
		Session.Entity.aura.load(EffectManager);

		// Spawn all signboards for the current map
		const mapName = MapRenderer.currentMap.replace('.gat', '').toLowerCase();
		const signboards = DB.getAllSignboardsForMap(mapName);

		if (signboards) {
			for (const x in signboards) {
				for (const y in signboards[x]) {
					const signboardData = signboards[x][y];
					SignboardManager.add(parseInt(x), parseInt(y), signboardData);
				}
			}
		}

		// Initialize camera
		Camera.setTarget(Session.Entity);
		Camera.init();

		// Add Game UI
		MiniMap.getUI().append();
		MiniMap.getUI().setMap(MapRenderer.currentMap);
		if (Configs.get('enableMapName')) {
			MapName.setMap(MapRenderer.currentMap);
			MapName.append();
		}
		// O chat atravessa a troca de mapa (ver `MapRenderer.setMap`): ele so e
		// anexado de novo quando saiu — a entrada no jogo. Anexar um host que ja
		// esta na pagina o MOVE, e mover tira o foco do campo e fecha o teclado.
		if (!ChatBox.__active) ChatBox.append();
		BasicInfo.getUI().append();
		Escape.append();
		Inventory.getUI().append();
		CartItems.append();
		Vending.append();
		ChangeCart.append();
		CartDecoration.append();
		Equipment.getUI().append();
		ShortCuts.append();
		StatusIcons.append();
		ShortCut.append();
		ChatRoomCreate.append();
		Emoticons.append();
		SkillList.getUI().append();
		FPS.append();
		PartyFriends.getUI().append();
		Guild.append();
		WorldMap.append();
		SkillListMH.homunculus.append();
		SkillListMH.mercenary.append();
		MobileUI.append();
		JoystickUI.append();
		Navigation.append();
		/*
		 * A ROLETA SAIU DA HUD (D-1480, 15/09/2026 — pedido do dono: *"esse
		 * icone de poring premiado que esta na HUD, remova isso tambem"*).
		 *
		 * `Roulette.append()` nao desenhava so a janela: ela cria um BOTAO
		 * SOLTO em `document.body` (`addRouletteIcon`), com a arte
		 * `RoulletteIcon.bmp` — a caixa de porings do RO — e posicao cravada em
		 * pixel de DESKTOP (`top: 74px; right: 145px`). Num celular de 402px
		 * isso cai em cima do cartao de missoes, que e onde o dono o
		 * fotografou.
		 *
		 * E ela e um BOTAO MORTO neste jogo: a roleta fala `REQ_OPEN_ROULETTE`,
		 * `REQ_GENERATE_ROULETTE` e `RECV_ROULETTE_ITEM`, e o servidor deste
		 * projeto nao conhece NENHUM desses pacotes (conferido em
		 * `servidor/protocolo/pacotes-mapa.ts`: zero ocorrencias de ROULETTE —
		 * as citacoes de "roleta" que existem la sao a do PET, outro assunto).
		 * Clicar abria uma janela que pedia ao servidor algo que ele nunca
		 * responde.
		 *
		 * O componente FICA no repositorio, intocado: se um dia a roleta for
		 * servida, volta com uma linha. O que sai e so a montagem dela na HUD.
		 */
		if (Configs.get('enableAchievements') && PACKETVER.value >= 20150513) {
			Achievement.append();
		}

		if (Session.PCGoldTimer) {
			PCGoldTimer.append();
		}

		WinStats.getUI().append();

		Quest.getUI().append();

		// RAGIDLE: "Mapa de Caça" floating button — always visible on the map,
		// same unconditional append() as ChatBox/Escape/etc above.
		HuntMap.append();


		// RAGIDLE (D-410): o aviso de evolução de classe. Ele nasce ESCONDIDO —
		// quem o mostra é o servidor, mandando ZC_RAGIDLE_MUDANCA_DE_CLASSE com
		// pelo menos um destino. Anexar sempre é o mesmo padrão do HuntMap.
		ClassChangeNotice.append();
		MissoesIdle.append(); // RAGIDLE: janela de Missões (D-551)
		PasseIdle.append(); // RAGIDLE: janela do Passe (D-813)
		TemporadaIdle.append(); // RAGIDLE: a janela da Temporada (Season 1, 21/09/2026)
		RoShop.append(); // RAGIDLE: o RO Shop (22/09/2026) - anexado sempre, como as vizinhas; abre por toggle()
		DoacaoIdle.append(); // RAGIDLE: a doacao via PIX (23/09/2026) - idem; abre pelo "Recarregar" do RO Shop
		CodexIdle.append(); // RAGIDLE: janela do Codex (D-851)
		// RAGIDLE (D-1159): a janela de Voto. Anexada SEMPRE, como as vizinhas —
		// o aviso da entrada chega pelo pacote e precisa de um host de pé.
		VotoIdle.append(); // RAGIDLE: janela de Voto (D-1159)
		PresencaIdle.append(); // RAGIDLE: janela de presenca (D-1162)
		IndicacaoIdle.append(); // RAGIDLE: Indique & Ganhe (D-1164)
		TrocaIdle.append(); // RAGIDLE: a janela "Trade" (02/10/2026) - anexada sempre, fechada
		BotMenu.append(); // RAGIDLE: o menu do Bot novo (07/10/2026) - anexada sempre, fechada; pede o estado ao servidor
		RankingIdle.append(); // RAGIDLE: o Ranking
		AmigosIdle.append(); // RAGIDLE: a janela Amigos (05/10/2026) - anexada sempre, fechada
		PartyHud.append(); // RAGIDLE: a HUD de party
		/*
		 * RAGIDLE (D-968): a CAIXA DE BOAS-VINDAS — o cartaz que abre sozinho
		 * ao entrar (hoje, o convite do Discord). Anexada por ÚLTIMO entre as
		 * janelas: o `append()` termina com `focus()`, e ser a última a deixa
		 * no topo da pilha de foco. Quem decide se ela aparece é o `onAppend`
		 * DELA (a trava de "uma vez por entrada" mora no componente).
		 */
		BoasVindasIdle.append();
		LFGIdle.append(); // RAGIDLE: janela de Procurar Grupo (D-634)
		GrupoIdle.append(); // RAGIDLE: janela de Grupo (D-960)
		// RAGIDLE: o tracker ancora ABAIXO do BasicInfoIdle por medição — vem
		// DEPOIS dele no append para o primeiro syncPosition já achar o host.
		MissoesTrackerIdle.append();
		/*
		 * RAGIDLE: o contexto do mapa (cidade ou caca) NAO e mais sondado aqui
		 * (07/10/2026): a janela "Idle" que perguntava (`IdleConfig.sondarMapa`)
		 * foi retirada, e quem marca o contexto como obsoleto e pede o estado
		 * novo e o `BotMenu.append()` acima (ver UI/contextoDoMapa.js).
		 * O parametro `ehEntradaNoMundo` de `onMapChange` fica, sem leitor.
		 */

		// RAGIDLE: "Painel de admin" floating button — same unconditional
		// append() as HuntMap right above; AdminPanel.onAppend()
		// (UI/Components/AdminPanel/AdminPanel.js) hides the whole component
		// again for every account except the owner's (Session.AID ===
		// 2000000).
		AdminPanel.append();

		// RAGIDLE: "Skills de {classe}" floating button — same unconditional
		// append() as HuntMap/AdminPanel right above.
		IdleSkills.append();

		// RAGIDLE: "Informações básicas" — always-visible HUD replacing the
		// native BasicInfo window visually (BasicInfoIdle.onAppend() hides
		// BasicInfo.getUI()._host; see BasicInfoIdle.js file header). Must be
		// appended AFTER BasicInfo.getUI().append() above so there's a native
		// window instance to hide.
		BasicInfoIdle.append();

		// RAGIDLE: "Status" — window only, no floating button of its own
		// (opened from BasicInfoIdle's icon grid). Gets its data from its own
		// server packet (ZC_RAGIDLE_FICHA, see StatusIdle.js file header), not
		// from the native WinStats window, so append order relative to
		// WinStats doesn't matter.
		StatusIdle.append();

		// RAGIDLE: "Mochila" — janela unica de inventario + equipamento
		// (MochilaIdle.js). Precisa vir DEPOIS de Inventory.getUI().append()/
		// Equipment.getUI().append() acima (linhas 759/764): e so ali que os
		// dois _host nativos entram no DOM, e MochilaIdle.onAppend() precisa
		// deles existindo pra esconder (display:none reversivel, mesma
		// tecnica de BasicInfoIdle.js pra BasicInfo).
		MochilaIdle.append();

		// RAGIDLE: "Você morreu" — full-screen overlay, hidden until
		// Session.Entity.life.hp reaches 0 (see DeathWindow.js).
		DeathWindow.append();

		// RAGIDLE: "Correio" — a caixa do sistema (servidor: caixa.ts, D-366)
		// no design system oficial. Esconde os TRES nativos do RODEX
		// (Rodex/ReadRodex/RodexIcon) de forma reversivel em
		// CorreioIdle.onAppend(), entao precisa vir DEPOIS de Rodex.prepare()/
		// RodexIcon.prepare() (secao "Prepare UI" acima) — e antes de
		// TopMenuIdle.append(), que le CorreioIdle.temNaoLidas() no proprio
		// onAppend() para acender o ponto de nao-lida do icone de Correio.
		CorreioIdle.append();

		// RAGIDLE: "Hunt Analyzer" — a leitura da cacada em curso (exp/hora,
		// abates/hora, ranking, itens). Vem ANTES de TopMenuIdle.append()
		// porque o menu consulta o estado de abertura dela para acender o aro
		// do botao. Ela nasce FECHADA: o registro que a alimenta
		// (registroDaCaca.js) acumula desde o primeiro abate, esteja a janela
		// aberta ou nao, entao nao ha nada a perder mantendo-a escondida.
		HuntAnalyzer.append();

		// RAGIDLE: "Menu superior direito (constelação)" — duas fileiras de
		// botoes circulares abaixo do minimapa (TopMenuIdle.js/.css).
		// Funcionais chamam IdleSkills.toggle()/BotMenu.toggle()
		// (RAGIDLE) e Guild.toggle()/PartyFriends.toggle() (nativos, metodo
		// publico ja existente nos dois, nenhum alias novo precisou ser
		// criado). needFocus=false — ordem de append aqui nao afeta
		// z-index.
		TopMenuIdle.append();

		// RAGIDLE: "Botão de caça contextual" — fixo logo abaixo do minimapa
		// (HuntButtonIdle.js/.css); precisa vir DEPOIS de BotMenu.append() e de
		// HuntMap.append()/AdminPanel.append() acima, so por clareza de leitura
		// (a leitura do contexto do mapa e o esconderijo de AdminPanel ".ap-button" nao dependem de ORDEM de
		// append, so da shadow DOM ja existir — garantida no prepare()).
		HuntButtonIdle.append();

		/*
		 * RAGIDLE: a CAMADA GUIADA DO TUTORIAL (frente D da Jornada de Midgard).
		 *
		 * Por ULTIMO de propósito: ela mede o `getBoundingClientRect()` dos
		 * controles dos outros componentes (o `.tm-fab` do TopMenuIdle, o
		 * `.hb-cacar` do HuntButtonIdle, o `.mt-ativa` do rastreador), e um
		 * alvo que ainda não entrou no DOM mede 0x0: e exatamente o
		 * sintoma de "leque fechado" que ela trata como "o alvo sumiu". Ela se
		 * recupera sozinha no tique seguinte, mas nascer medindo certo é de
		 * graça.
		 *
		 * Ela nasce ESCONDIDA: quem a acende é o servidor, mandando
		 * ZC_RAGIDLE_TUTORIAL com estado 'em-andamento'. Anexar sempre é o
		 * mesmo padrão do HuntMap/DeathWindow acima.
		 */
		TutorialIdle.append();

		/*
		 * A PILHA DE JANELAS (D-931) — o dono do ESC e do voltar do Android.
		 *
		 * DEPOIS de todos os `append()` de propósito: o registro embrulha o
		 * `toggle()` de cada janela, e embrulhar antes de a shadow DOM existir
		 * pegaria uma função que ainda não fecha nada.
		 *
		 * O `seletor` é o elemento que ganha e perde `is-open` — as nove janelas
		 * Idle têm a MESMA forma, e é ela que deixa a pilha se manter sem que
		 * nenhuma delas precise saber que a pilha existe.
		 *
		 * QUEM CONVIVE E QUEM SUBSTITUI (a tabela que o dono pediu):
		 *   - as nove Idle CONVIVEM entre si. São painéis independentes, e o
		 *     jogador abre Mochila e Skills lado a lado de propósito;
		 *   - a morte (`DeathWindow`) é DECISÃO: cobre tudo, e o ESC não a tira
		 *     da tela — a única saída é o botão "Voltar para a cidade";
		 *   - troca, venda e refino são DECISÃO pela mesma razão: tem alguém do
		 *     outro lado esperando resposta. A loja de NPC SAIU desta linha por
		 *     ordem do dono (D-1363, 13/09/2026): o ESC a fecha, como fecha as Idle.
		 */
		for (const [nome, componente, seletor] of [
			['personagem', StatusIdle, '.st-window'],
			['mochila', MochilaIdle, '.mo-window'],
			['skills', IdleSkills, '.is-window'],
			['caca', HuntMap, '.hm-window'],
			['codex', CodexIdle, '.cx-window'],
			['presenca', PresencaIdle, '.pr-window'],
			['indicacao', IndicacaoIdle, '.in-window'],
			// 02/10/2026 - a janela "Trade": toggle() + `.tr-window`/`is-open`, a forma das outras.
			['troca', TrocaIdle, '.tr-window'],
			// 07/10/2026 - o menu do Bot novo: toggle() + `.bm-window`/`is-open`, a forma das outras.
			['bot', BotMenu, '.bm-window'],
			['ranking', RankingIdle, '.rk-window'],
			// 05/10/2026 - a janela Amigos: toggle() + `.am-window`/`is-open`, a forma das outras.
			['amigos', AmigosIdle, '.am-window'],
			['painel-de-comando', PainelComandoIdle, '.pc-window'],
			['correio', CorreioIdle, '.co-window'],
			['missoes', MissoesIdle, '.mi-window'],
			['passe', PasseIdle, '.pi-window'],
			['temporada', TemporadaIdle, '.te-window'],
			['roshop', RoShop, '.rs-window'],
			['doacao', DoacaoIdle, '.dc-window'],
			['voto', VotoIdle, '.vi-window'],
			['analise', HuntAnalyzer, '.ha-window'],
			/*
			 * O PAINEL DE ADMIN entrou em 08/09/2026. Ele tem a mesma forma das
			 * outras (`.ap-window` + `is-open` + `toggle()`) e só não estava
			 * aqui porque só a conta dona o vê — e o que não entra na pilha não
			 * ganha a moldura de painel de tela cheia de D-932.
			 *
			 * MEDIDO em 393x852 antes disto (`scripts/diag-mobile-portrait.ts`):
			 * o Admin nascia em `7,166 380x742` e **transbordava 56px por
			 * baixo** — a última linha de botões ficava fora da tela. Em 412x915
			 * eram 58px. Registrado, ele passa pela mesma regra das outras onze.
			 */
			['admin', AdminPanel, '.ap-window'],
		]) {
			PilhaDeJanelas.registrar({ nome, componente, seletor });
		}

		/*
		 * A LOJA DE CASH é NATIVA do roBrowser, e por isso ficou de fora da
		 * pilha até 08/09/2026 — ela não usa `is-open` num `.xx-window`: ela é
		 * inserida e REMOVIDA do DOM, e o estado se lê em `CashShop.ui`.
		 *
		 * O preço de ficar de fora é medido: em 393x852 ela abria com **723px
		 * de largura numa tela de 393** e transbordava 330px para a direita —
		 * as abas "Aluguel"/"Equipamento" e metade da grade de itens ficavam
		 * fora do mundo, e o título saía cortado ("Loja de Cas..."). Ela é um
		 * item do menu do celular, então isso é um destino inalcançável.
		 *
		 * A marca `.ri-janela` que o registro põe no host é o que a regra de
		 * painel de D-932 lê. As duas funções abaixo existem porque a forma
		 * dela é outra — e é exatamente para isso que `registrar()` aceita
		 * `estaAberta` e `fechar` declarados.
		 */
		PilhaDeJanelas.registrar({
			nome: 'cash',
			componente: CashShop,
			estaAberta: () => !!(CashShop.ui && CashShop.ui.is(':visible')),
			/* `toggle()` e não `remove()`: fechar a loja de cash AVISA o
			   servidor (`CZ_CASH_SHOP_CLOSE`). Arrancá-la do DOM deixaria o
			   servidor achando que o jogador ainda está na loja. */
			fechar: () => CashShop.toggle(),
		});

		/*
		 * E ELA PRECISA AVISAR A PILHA POR FORA DO EMBRULHO (08/09/2026).
		 *
		 * O embrulho de `registrar()` compara o "aberta?" ANTES e DEPOIS de
		 * `toggle()`. Isso funciona para as janelas que abrem no mesmo quadro —
		 * e a loja de cash não é uma delas: `toggle()` só MANDA O PACOTE
		 * (`CZ_SE_CASHSHOP_OPEN2`), e a janela nasce quando o servidor
		 * responde. No instante em que o embrulho olha, ela ainda está
		 * fechada, então `aoAbrir('cash')` nunca era chamado.
		 *
		 * A consequência era invisível e específica: a regra de UMA JANELA POR
		 * VEZ do celular não disparava para ela. Medido em 393x852 — com a
		 * janela "Votar" aberta antes, **28 controles da loja** respondiam
		 * `div.vi-*` no `elementFromPoint`. O jogador via a loja e tocava no
		 * Votar.
		 *
		 * `onAppend` é o ponto em que ela ENTRA na tela, seja qual for o
		 * caminho — é lá que a pilha fica sabendo.
		 */
		/* UMA VEZ por componente (a tarefa 25, D-1361): este bloco roda a cada
		   mapa carregado (`MapRenderer.onLoad`), e o embrulho que estava escrito
		   aqui se aninhava — cada troca de mapa somava um `aoAbrir('cash')`, e
		   cada um empilha uma entrada no historico do voltar. */
		avisarAoAbrir(CashShop, () => PilhaDeJanelas.aoAbrir('cash'));

		/*
		 * A LOJA DE NPC (a tarefa 25, D-1361). Ela e DECISAO na tabela do dono,
		 * no topo deste bloco ("troca, venda, refino e loja de NPC"), e ficou
		 * fora da pilha enquanto fechava sozinha a cada compra — que era, no
		 * celular em pe, o que tirava o jogador de uma janela de 460px numa tela
		 * de 393. Agora que ela fica aberta, o registro e o que a encaixa (a marca
		 * `ri-janela` de D-932) e o que diz a pilha quando ela esta na tela.
		 *
		 * `prepare()` ANTES do registro: o host so nasce ali (GUIComponent), e a
		 * marca vai no host. A versao e a eleita no boot do mapa
		 * (`NpcStore.selectUIVersion`).
		 */
		const lojaDoNpc = NpcStore.getUI();
		if (typeof lojaDoNpc.prepare === 'function') {
			lojaDoNpc.prepare();
		}
		// JANELA, e nao DECISAO, por ordem do dono (D-1363, 13/09/2026): o ESC e
		// o voltar do Android fecham a loja, como fecham as Idle. Do outro lado da
		// loja do NPC nao ha ninguem esperando resposta, e fechar manda o 0x09D4,
		// que encerra a negociacao no servidor (D-1361).
		PilhaDeJanelas.registrar({
			nome: 'loja',
			componente: lojaDoNpc,
			tipo: PilhaDeJanelas.TIPO.JANELA,
			estaAberta: () => !!(lojaDoNpc._host && lojaDoNpc._host.isConnected),
			fechar: () => lojaDoNpc.remove(),
		});
		avisarAoAbrir(lojaDoNpc, () => PilhaDeJanelas.aoAbrir('loja'));

		/*
		 * O CARRINHO DO MERCADOR (D-1848, 30/09/2026). Ele e a janela NATIVA do
		 * roBrowser — nao usa `is-open`: aberto e o host no documento sem
		 * `display:none` — e por isso entra com a leitura e o fechamento
		 * declarados, como a loja de cash. Registrado, ele ganha o que uma
		 * janela precisa no celular: a marca `ri-janela` (painel de tela cheia,
		 * D-932), o corpo encaixado ate a barra de atalhos (o `seletor`, D-941),
		 * o ESC e o voltar do Android, e a regra de uma janela por vez. O
		 * `CartItems.toggle()` (a porta da Mochila e o Alt+W) e embrulhado pelo
		 * registro, e e isso que avisa a pilha.
		 */
		PilhaDeJanelas.registrar({
			nome: 'carrinho',
			componente: CartItems,
			seletor: '#cartitems',
			estaAberta: () => CartItems.estaAberto(),
			fechar: () => CartItems.fechar(),
		});

		/* A PONTE de volta do carrinho para a Mochila (D-1848): o botao
		   "Mochila" do rodape do carrinho, o caminho do celular, onde abrir uma
		   janela fecha a outra. Mora aqui pela razao das outras pontes: so o
		   MapEngine conhece as duas, e a Mochila ja importa o carrinho. */
		// E a recusa do carrinho que chega do servidor aparece na Mochila aberta.
		CartItems.avisarNaMochila = texto => MochilaIdle.avisar(texto);
		CartItems.aoPedirMochila = () => {
			const mochila = MochilaIdle._shadow && MochilaIdle._shadow.querySelector('.mo-window');
			if (!(mochila && mochila.classList.contains('is-open'))) {
				MochilaIdle.toggle();
			}
		};

		/* O LFG não usa `toggle()`: ele tem `abrir()`/`fechar()` próprios, por
		   causa da corrida de troca de mapa que já derrubou o `is-open` dele por
		   baixo dos panos (ver o cabeçalho de LFGIdle.js). Então ele entra com o
		   fechamento declarado, e não pelo embrulho. */
		PilhaDeJanelas.registrar({
			nome: 'lfg',
			componente: LFGIdle,
			seletor: '.lfg-window',
			fechar: () => LFGIdle.fechar(),
		});

		/* A janela de GRUPO (D-960) tem o mesmo arranjo do LFG, e pela mesma
		   razao: ela nao usa `toggle()` no ESC porque `fechar()` tambem
		   DESINSCREVE do empurrao do servidor — fechar pelo embrulho deixaria
		   o servidor montando estado para uma janela que ninguem esta vendo. */
		PilhaDeJanelas.registrar({
			nome: 'grupo',
			componente: GrupoIdle,
			seletor: '.gi-window',
			fechar: () => GrupoIdle.fechar(),
		});

		/* A PONTE entre as duas janelas de grupo (D-960). Ela mora aqui, e nao
		   num import cruzado entre os dois componentes: o `MapEngine` ja
		   conhece os dois, e um import de um componente de UI dentro de outro
		   prenderia a ordem de carga de um a do outro.

		   O botao "Abrir o Localizador" da janela de Grupo e a materializacao
		   do pedido do dono de que os DOIS caminhos de entrada convivam. */
		GrupoIdle.aoPedirLocalizador = () => {
			GrupoIdle.fechar();
			LFGIdle.abrir();
		};

		/* A IRMÃ dela (D-984): "me leve até o líder".

		   O corpo mora no Localizador porque é lá que `{acao:'teleportar'}`
		   sempre morou, e é lá que o RESULTADO desse pacote sabe ser lido (o
		   'teleportar' está em `ACOES_QUE_FECHAM`). A janela de Grupo só oferece
		   o botão; nenhuma linha dela monta pacote de LFG. */
		GrupoIdle.aoPedirTeleporte = () => {
			LFGIdle.teleportarParaOLider();
		};

		/* A PONTE do RO Shop para a Temporada (22/09/2026, D-RS-04): o botao
		   "Ir para Temporada" SO NAVEGA - fecha a loja e abre a janela da
		   Temporada que ja existe. Caixas, Passe e VIP nao moram no RO Shop, e
		   nenhuma linha dele monta pacote da Temporada. Mora aqui pela mesma
		   razao das pontes acima: so o MapEngine conhece as duas janelas. */
		/* As PONTES da doacao via PIX (23/09/2026): o "Recarregar" do RO Shop
		   ABRE a janela de doacao (sem fechar a loja - no celular em pe a
		   pilha fecha a de baixo sozinha, uma janela por vez), e as mensagens
		   `tipo: 'doacao'` que o RoShop.js recebe no 0x0fb8 vao para ela. */
		RoShop.aoAbrirDoacao = () => DoacaoIdle.abrir();
		TemporadaIdle.aoAbrirDoacao = () => DoacaoIdle.abrir();
		RoShop.aoDoacao = dados => DoacaoIdle.receber(dados);

		RoShop.aoIrParaTemporada = () => {
			if (RoShop.estaAberta()) {
				RoShop.toggle();
			}
			const temporada = TemporadaIdle._shadow && TemporadaIdle._shadow.querySelector('.te-window');
			if (!(temporada && temporada.classList.contains('is-open'))) {
				TemporadaIdle.toggle();
			}
		};

		/*
		 * A PORTA DO GRUPO (D-984) — qual das duas janelas o item "Grupo" abre,
		 * e quem troca de janela quando a party muda.
		 *
		 * A ligação mora aqui pela MESMA razão das duas pontes acima: só o
		 * `MapEngine` conhece as duas janelas, e um import cruzado entre
		 * componentes de UI prenderia a ordem de carga de um à do outro — de
		 * quebra, é o que deixa `portaDoGrupo.js` ser provado sem subir
		 * Renderer, Network e o GRF inteiro.
		 *
		 * `estaAberta` lê a flag de MÓDULO das duas janelas, e NÃO a classe
		 * `is-open`: as duas registram por escrito que o `is-open` já sumiu por
		 * baixo dos panos numa troca de mapa (a sonda de 03/09/2026, no
		 * cabeçalho de `LFGIdle.onAppend`). `componente`/`seletor` são para o
		 * aro do menu, que aí sim quer saber o que está PINTADO na tela.
		 */
		PortaDoGrupo.ligar({
			localizador: {
				componente: LFGIdle,
				seletor: '.lfg-window',
				abrir: () => LFGIdle.abrir(),
				fechar: () => LFGIdle.fechar(),
				estaAberta: () => LFGIdle.estavaAberta,
			},
			grupo: {
				componente: GrupoIdle,
				seletor: '.gi-window',
				abrir: () => GrupoIdle.abrir(),
				fechar: () => GrupoIdle.fechar(),
				estaAberta: () => GrupoIdle.estavaAberta,
			},
			// A HUD DE PARTY (09/09/2026): a porta e o unico lugar que sabe QUANDO a
			// composicao muda, e a HUD precisa disso para pedir o painel — a inscricao
			// no empurrao morre quando a janela fecha.
			hud: PartyHud,
		});

		/* A MORTE é decisão: o ESC não a fecha, e ela também não deixa o ESC
		   vazar para as janelas de baixo. Isso já era verdade por dentro do
		   `Escape.onKeyDown`; aqui a regra passa a ser do sistema, e não de um
		   `if` escondido num componente. */
		PilhaDeJanelas.registrar({
			nome: 'morte',
			componente: DeathWindow,
			tipo: PilhaDeJanelas.TIPO.DECISAO,
			estaAberta: () => DeathWindow.aMorteEstaNaTela(),
			fechar: () => {},
		});

		/* O TUTORIAL é DECISÃO pela mesma razão da morte: enquanto ele está na
		   tela há um passo a cumprir, e o ESC não pode fazê-lo sumir nem vazar
		   para as janelas de baixo (fechar a janela de Missões por baixo do
		   tutorial deixaria a etapa apontando para o vazio). A saída é
		   explícita, com o dedo no botão: "Pular tutorial", que está SEMPRE
		   visível no balão. */
		PilhaDeJanelas.registrar({
			nome: 'tutorial',
			componente: TutorialIdle,
			tipo: PilhaDeJanelas.TIPO.DECISAO,
			estaAberta: () => TutorialIdle.estaNaTela(),
			fechar: () => {},
		});

		PilhaDeJanelas.ligar();

		/* D-934: e a escala da HUD, ligada DEPOIS do registro — ela varre os
		   hosts e precisa que todos ja existam. */
		ligarAcessorioDaHud('escala da HUD', EscalaDaHud.ligar);

		/* D-939: a HUD vertical do celular em pe — mesma razao de ordem: ela
		   carimba `ri-vertical` no root interno de cada shadow, entao todos
		   os hosts precisam ja existir. */
		ligarAcessorioDaHud('HUD vertical', HudVertical.ligar);

		/*
		 * O MODO LEITURA (09/09/2026, pedido do dono): a tela nao apaga
		 * enquanto o personagem esta em farm automatico.
		 *
		 * Ligado AQUI, e nao num componente de desenho (o antigo
		 * `CombatCornerIdle`, retirado em 07/10/2026): componente sai de cena
		 * na troca de mapa, e o wake lock nao pode piscar a cada viagem. Este e o
		 * mesmo lugar onde a escala e a HUD vertical se ligam — o que vive
		 * enquanto a sessao vive mora aqui.
		 */
		ligarAcessorioDaHud('modo leitura', TelaAcesaNoFarm.ligar);

		/*
		 * RAGIDLE: "INTERFACE PRONTA": o gancho de entrada do tutorial guiado.
		 *
		 * Aqui, e não em `onConnectionAccepted`, porque o que a camada precisa
		 * não é "entrei na zona": é a HUD montada, escalada e com a marca do
		 * celular em pé já carimbada. Ela mede o `getBoundingClientRect()` dos
		 * controles, e antes de `EscalaDaHud.ligar()`/`HudVertical.ligar()` as
		 * caixas ainda não são as finais.
		 *
		 * Rodar em TODA troca de mapa é o desenho, e não um descuido: a etapa
		 * mora no servidor, então este ponto é também a RECUPERAÇÃO depois de
		 * morte, viagem e reconexão. Quem decide se o tutorial começa é o
		 * SERVIDOR, e o cliente so pergunta, e desenha o que vier.
		 */
		TutorialIdle.interfacePronta();

		if (Configs.get('enableCashShop')) {
			/*
			 * O ICONE SOLTO DA LOJA DE CASH SAIU DA TELA (I5, 31/08/2026 — pedido
			 * do dono: "mudar o botao atual da loja de cash para o RO Shop").
			 *
			 * Ele era um BMP de 43x45 SEM ROTULO, flutuando ao lado do minimapa,
			 * enquanto o menu ja trazia um item "RO Shop" desabilitado como "em
			 * breve". O pedido junta as duas pontas: a porta virou o item rotulado
			 * do menu (TopMenuIdle, `data-action="roshop"`), e ele se aposenta.
			 *
			 * O `prepare()` fica: o componente continua carregado e a janela que
			 * ele abre e a MESMA (`CashShop` nativa). Se o dono quiser o icone de
			 * volta, e esta linha — nao um componente para reescrever.
			 */
			// CashShopIcon.append();
		}

		// RAGIDLE (07/09/2026): so abre a janela de presenca se HA evento — o
		// servidor paga a presenca por correio e nao manda o 0x0ae2; sem a
		// guarda, cada carregamento de mapa (a Asa de Mosca inclusive) imprimia
		// "Nao ha evento de presenca no momento." no chat.
		if (Configs.get('enableCheckAttendance') && PACKETVER.value >= 20180307 && CheckAttendance.temEvento()) {
			CheckAttendance.append();
		}

		// Reload plugins
		PluginManager.init();

		// Map loaded
		estouPronto();

		// D-1533: o placar do MVP e acessorio de HUD — depois do estou-pronto, e
		// isolado (D-993): uma excecao nele nao pode segurar a entrada no mapa.
		ligarAcessorioDaHud('placar do MVP', () => PlacarMvpIdle.append());

		// Rates Info
		if (Session.ratesInfo) {
			Announce.append();
			Announce.set(Session.ratesInfo, '#FFFF00', true);
		}

		// Request cash shop items
		if (PACKETVER.value >= 20130320 && Session.requestCashShop) {
			Network.sendPacket(new PACKET.CZ.PC_CASH_POINT_ITEMLIST());
			Session.requestCashShop = false;
		}

		// send request blocking play cancel
		if (PACKETVER.value >= 20130320) {
			Network.sendPacket(new PACKET.CZ.BLOCKING_PLAY_CANCEL());
		}
	};

	MapRenderer.setMap(pkt.mapName);
}

/**
 * Change zone server
 *
 * @param {object} pkt - PACKET.ZC.NPCACK_SERVERMOVE
 */
function onServerChange(pkt) {
	MapEngine.init(pkt.addr.ip, pkt.addr.port, pkt.mapName);
}

/**
 * Resets the per-character UI state shared by the exit and restart flows.
 * Components that were never prepared have no root element to clean.
 */
function cleanGameUI() {
	WhisperBox.clearAll();

	const tasks = [
		[BasicInfo, 'remove'],
		[PlayerViewEquip, 'remove'],
		[StatusIcons, 'clean'],
		[ChatBox, 'clean'],
		[ShortCut, 'clean'],
		[Quest, 'clean'],
		[PartyFriends, 'clean'],
		[CashShop, 'clean']
	];

	for (const [target, method] of tasks) {
		const component = typeof target.getUI === 'function' ? target.getUI() : target;

		if (component && component.__loaded && typeof component[method] === 'function') {
			component[method]();
		}
	}

	/*
	 * OS COMPONENTES RAGIDLE TAMBEM ESQUECEM (27/08/2026, auditoria C).
	 * Voltar ao menu de personagem nao recarrega a pagina; cada modulo abaixo
	 * limpa o proprio estado antes de a proxima ficha ser anexada.
	 */
	/*
	 * DE TRES PARA DOZE (28/08/2026, queixa do Jhow: *"quando troca de
	 * personagem esta ficando com as informacoes do personagem anterior"*).
	 *
	 * A lista nasceu com tres em 27/08 e nove componentes RAGIDLE com estado de
	 * personagem ficaram de fora — inclusive os DOIS mais visiveis: a janela de
	 * Status (`StatusIdle.ficha`) e a de habilidades (`IdleSkills.serverData`),
	 * que sao literalmente "as informacoes do personagem" da queixa.
	 *
	 * O modo de falha e sempre o mesmo, e nao e o dado em si: sao os caches de
	 * "o que eu ja desenhei" (`_sig*`, `_last*`). Enquanto a assinatura nao
	 * muda, o componente NAO redesenha — entao a assinatura do personagem
	 * anterior segura a tela dele no lugar.
	 *
	 * Uma lista escrita a mao que precisa crescer junto com uma pasta e uma
	 * divida esperando acontecer, e ela aconteceu em um dia. O portao
	 * `limpeza-da-troca-de-personagem.test.ts` (repo do servidor) le esta lista
	 * e a pasta de componentes, e reprova quando as duas divergem.
	 */
	for (const modulo of [
		MissoesIdle,
		HuntMap,
		IdleSkills,
		StatusIdle,
		LFGIdle,
		GrupoIdle,
		CorreioIdle,
		HuntAnalyzer,
		HuntButtonIdle,
		MissoesTrackerIdle,
		MochilaIdle,
		PasseIdle,
		TemporadaIdle,
		RoShop,
		DoacaoIdle,
		CodexIdle,
		TutorialIdle,
		PresencaIdle,
		IndicacaoIdle,
		TrocaIdle,
		RankingIdle,
		BotMenu,
		PainelComandoIdle,
		AmigosIdle,
		PartyHud,
		PlacarMvpIdle,
		VotoIdle,
		BoasVindasIdle,
		TopMenuIdle
	]) {
		if (typeof modulo.limparEstadoDoPersonagem === 'function') {
			modulo.limparEstadoDoPersonagem();
		}
	}
}

/**
 * Ask the server to disconnect
 */
function onExitRequest() {
	/*
	 * RAGIDLE (25/08/2026): o pacote virou o 0x018a (CZ_REQ_DISCONNECT), que
	 * e o que o servidor daqui responde — com a MESMA tranca de logout do
	 * "Selecionar Personagem" (clif_parse_QuitGame, clif.cpp:11448-11462).
	 * O 0x0082 (REQUEST_QUIT) que saia daqui e pre-2004: ninguem respondia,
	 * e o timer abaixo fechava o jogo na marra 1 s depois — inclusive em
	 * combate, furando a tranca inteira.
	 *
	 * O timer FICA, como rede de seguranca para servidor morto: com o
	 * servidor vivo a resposta chega em milissegundos, e tanto o "pode"
	 * (onDisconnectAnswer result 0) quanto o "espere" (result 1, que agora
	 * LIMPA o timer) chegam antes dele.
	 */
	const pkt = new PACKET.CZ.REQ_DISCONNECT();
	pkt.type = 0;
	Network.sendPacket(pkt);

	// Wait a second, if no answer from the server, then close it.
	_exitTimer = Events.setTimeout(() => {
		_exitTimer = null;
		onExitSuccess();
	}, 1000);
}

/**
 * Server don't want us to disconnect yet
 *
 * @param {object} pkt - PACKET.ZC.REFUSE_QUIT
 */
function onExitFail(pkt) {
	// Mesma razao do result 1 em onDisconnectAnswer: recusa e resposta, e o
	// timer de "sem resposta" nao pode fechar o jogo por cima dela.
	if (_exitTimer !== null) {
		Events.clearTimeout(_exitTimer);
		_exitTimer = null;
	}
	ChatBox.addText(DB.getMessage(502), ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG);
}

/**
 * A DESMONTAGEM DA SESSAO DE MAPA, UMA SO (H07, auditoria 2 de 22/09/2026).
 *
 * Morava inteira dentro de `onExitSuccess`, e o logout era a unica porta para o
 * login que a fazia. A reconexao que desiste (inclusive a manutencao e o
 * `@kick`), o OK do `showErrorBox`, o `expulso` da economia e o `aoBoot` do
 * sono chamam so `GameEngine.reload()`: na tela de login o modo leitura seguia
 * segurando a tela acesa, a tela preta da economia (z-index 2000000) ficava por
 * cima de tudo, e a HUD de party voltava com o grupo do personagem anterior.
 * Hoje `GameEngine.reload()` chama esta mesma funcao quando ha sessao
 * (`MapEngine.desmontarSessao`), e uma porta nova para o login a herda.
 *
 * `Session.Playing` e a marca de que ha sessao, e ela cai PRIMEIRO: o logout
 * desmonta aqui e depois recarrega, e a recarga nao desmonta de novo; e uma
 * excecao no meio nao faz a proxima recarga tentar outra vez. `cleanGameUI` vem
 * por ultimo pelo mesmo motivo — e o passo que toca dezenas de componentes, o
 * que mais pode lancar, e nada acima pode depender dele.
 */
function desmontarSessaoDeMapa() {
	Session.Playing = false;

	/*
	 * O MODO LEITURA SOLTA AQUI (09/09/2026).
	 *
	 * Voltar ao login e o caminho em que a condicao dele deixa de existir sem
	 * nunca virar falsa: o servidor para de mandar o estado do Bot, entao
	 * `botLigado` congela no ultimo valor e o relogio do modulo seguiria
	 * renovando o lock numa tela de login. Trocar de MAPA nao passa por aqui,
	 * e e proposital — o lock nao pode piscar a cada viagem.
	 */
	TelaAcesaNoFarm.desligar();
	BackgroundTicker.stop();
	// A tela do sono e a outra tela preta crua em `document.body`: uma reconexao
	// que desiste com ela aberta a deixaria por cima do login.
	if (_janelaDoSonoAtiva) {
		_janelaDoSonoAtiva.remove();
		_janelaDoSonoAtiva = null;
	}
	GuildEngine.guild_id = 0;
	Session.Achievement = null;
	cleanGameUI();
}

/**
 * Server accept to disconnect us
 *
 * @param {object} pkt - PACKET.ZC.REFUSE_QUIT
 */
function onExitSuccess() {
	if (_exiting) {
		return;
	}
	_exiting = true;

	if (_exitTimer !== null) {
		Events.clearTimeout(_exitTimer);
		_exitTimer = null;
	}

	if (PACKETVER.value >= 20170315 && Session.WebToken) {
		ShortCut.saveToServer();
	}

	desmontarSessaoDeMapa();
	Mouse.intersect = false;
	UIManager.removeComponents();
	// R12 (14/09/2026): logout voluntario cancela qualquer ciclo de
	// reconexao em curso (rede de seguranca explicita — `Network.close()`
	// logo abaixo ja impede o proprio `onDisconnect` de disparar, ver
	// NetworkManager.js).
	Reconexao.cancelar();
	Network.close();
	Renderer.stop();
	MapRenderer.free();
	SoundManager.stop();
	BGM.stop();
	import('Engine/GameEngine.js').then(m => m.default.reload());
}

/**
 * Try to return to char-server
 */
function onRestartRequest() {
	const pkt = new PACKET.CZ.RESTART();
	pkt.type = 1;
	Network.sendPacket(pkt);
}

/**
 * Go back to save point request
 */
function onReturnSavePointRequest() {
	const pkt = new PACKET.CZ.RESTART();
	pkt.type = 0;
	Network.sendPacket(pkt);
}

/**
 * Resurection feature
 */
function onResurectionRequest() {
	const pkt = new PACKET.CZ.STANDING_RESURRECTION();
	Network.sendPacket(pkt);
}

/**
 * Does the server want you to return to char-server ?
 *
 * @param {object} pkt - PACKET.ZC.RESTART_ACK
 */
function onRestartAnswer(pkt) {
	if (!pkt.type) {
		// Have to wait 10sec
		ChatBox.addText(DB.getMessage(502), ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG);
	} else {
		GuildEngine.guild_id = 0;
		cleanGameUI();
		Session.Achievement = null;
		Mouse.intersect = false;
		MapRenderer.free();
		Renderer.stop();
		// R12 (14/09/2026): voltar ao char-select e' saida voluntaria da
		// fase de mapa, mesma razao de onExitSuccess acima.
		Reconexao.cancelar();
		onRestart();
	}
}

/**
 * Response from server to disconnect
 * @param pkt - {object}
 */
function onDisconnectAnswer(pkt) {
	switch (pkt.result) {
		// Disconnect
		case 0:
			Renderer.stop();
			onExitSuccess();
			break;

		case 1:
			/*
			 * RAGIDLE (25/08/2026): a recusa LIMPA o timer de "sem resposta".
			 * Sem isto a tranca do servidor era teatro: o "espere 10 s"
			 * aparecia no chat e 1 s depois o timer de onExitRequest fechava o
			 * jogo do mesmo jeito. Recusa E resposta — o timer so existe para
			 * o servidor que nao respondeu nada.
			 */
			if (_exitTimer !== null) {
				Events.clearTimeout(_exitTimer);
				_exitTimer = null;
			}
			// Have to wait 10 sec
			ChatBox.addText(DB.getMessage(502), ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG);
			break;

		default:
	}
}

/**
 * ChatBox talk
 *
 * @param {string} user
 * @param {string} text
 * @param {number} target
 */
function onRequestTalk(user, text, target) {
	let pkt;
	const flag_party = text[0] === '%' || KEYS.CTRL;
	const flag_guild =
		text[0] === '$' ||
		(KEYS.ALT &&
			!(
				KEYS[0] ||
				KEYS[1] ||
				KEYS[2] ||
				KEYS[3] ||
				KEYS[4] ||
				KEYS[5] ||
				KEYS[6] ||
				KEYS[7] ||
				KEYS[8] ||
				KEYS[9]
			));

	text = text.replace(/^(\$|%)/, '');

	// Private messages
	if (user && user.length) {
		pkt = new PACKET.CZ.WHISPER();
		pkt.receiver = user;
		pkt.msg = text;
		Network.sendPacket(pkt);
		ChatBox.PrivateMessageStorage.nick = user;
		ChatBox.PrivateMessageStorage.msg = text;
		return;
	}

	// Set off/on flags
	if (flag_party) {
		target = (target & ~ChatBox.TYPE.PARTY) | (~target & ChatBox.TYPE.PARTY);
	}

	if (flag_guild) {
		target = (target & ~ChatBox.TYPE.GUILD) | (~target & ChatBox.TYPE.GUILD);
	}

	// Get packet
	if (target & ChatBox.TYPE.PARTY) {
		pkt = new PACKET.CZ.REQUEST_CHAT_PARTY();
	} else if (target & ChatBox.TYPE.GUILD) {
		pkt = new PACKET.CZ.GUILD_CHAT();
	} else if (target & ChatBox.TYPE.CLAN) {
		pkt = new PACKET.CZ.CLAN_CHAT();
	} else {
		pkt = new PACKET.CZ.REQUEST_CHAT();
		chatLines++;
	}

	// send packet
	pkt.msg = Session.Entity.display.name + ' : ' + text;
	Network.sendPacket(pkt);

	//Super Novice Chant
	if (chatLines > 7 && DB.isSuperNovice(Session.Entity._job)) {
		if (Math.floor((BasicInfo.getUI().base_exp / BasicInfo.getUI().base_exp_next) * 1000.0) % 100 == 0) {
			if (text == DB.getMessage(790)) {
				snCounter = 1;
			} else if (
				snCounter == 1 &&
				text == DB.getMessage(791) + ' ' + Session.Entity.display.name + ' ' + DB.getMessage(792)
			) {
				snCounter = 2;
			} else if (snCounter == 2 && text == DB.getMessage(793)) {
				snCounter = 3;
			} else if (snCounter == 3) {
				snCounter = 0;
				pkt = new PACKET.CZ.CHOPOKGI();
				Network.sendPacket(pkt);
			} else {
				snCounter = 0;
			}
		}
	}
}

/**
 * Remove cart/peco/falcon
 */
function onRemoveOption() {
	const pkt = new PACKET.CZ.REQ_CARTOFF();
	Network.sendPacket(pkt);
}

/**
 * @type {number} walk timer
 */
let _walkTimer = null;

/**
 * @type {number} Last delay to walk
 */
let _walkLastTick = 0;

/**
 * Ask to move
 */
function onRequestWalk() {
	Events.clearTimeout(_walkTimer);

	// D-2055 (A2): o toque na selecao de personagem chegava aqui sem personagem.
	if (!temPersonagemNoMundo(Session)) {
		return;
	}

	// If siting, update direction
	if (Session.Entity.action === Session.Entity.ACTION.SIT || KEYS.SHIFT) {
		Session.Entity.lookTo(Mouse.world.x, Mouse.world.y);

		let pkt;
		if (PACKETVER.value >= 20180307) {
			pkt = new PACKET.CZ.CHANGE_DIRECTION2();
		} else {
			pkt = new PACKET.CZ.CHANGE_DIRECTION();
		}
		pkt.headDir = Session.Entity.headDir;
		pkt.dir = Session.Entity.direction;
		Network.sendPacket(pkt);
		return;
	}

	walkIntervalProcess();
}

/**
 * Stop moving
 */
function onRequestStopWalk() {
	Events.clearTimeout(_walkTimer);
}

/**
 * Moving function
 */
function walkIntervalProcess() {
	// D-2055 (A2): o andar que atravessou a volta a selecao para aqui, em vez
	// de ler a posicao de um personagem que ja nao existe.
	if (!temPersonagemNoMundo(Session)) {
		Events.clearTimeout(_walkTimer);
		_walkTimer = null;
		return;
	}

	// setTimeout isn't accurate, so reduce the value
	// to avoid possible errors.
	if (_walkLastTick + 200 > Renderer.tick) {
		return;
	}

	const isWalkable = Mouse.world.x > -1 && Mouse.world.y > -1;
	const isCurrentPos =
		Math.round(Session.Entity.position[0]) === Mouse.world.x &&
		Math.round(Session.Entity.position[1]) === Mouse.world.y;

	if (isWalkable && !isCurrentPos) {
		let pkt;
		if (PACKETVER.value >= 20180307) {
			pkt = new PACKET.CZ.REQUEST_MOVE2();
		} else {
			pkt = new PACKET.CZ.REQUEST_MOVE();
		}
		if (!checkFreeCell(Mouse.world.x, Mouse.world.y, 9, pkt.dest)) {
			pkt.dest[0] = Mouse.world.x;
			pkt.dest[1] = Mouse.world.y;
		}

		Network.sendPacket(pkt);
	}

	Events.clearTimeout(_walkTimer);
	_walkTimer = Events.setTimeout(walkIntervalProcess, 500);
	_walkLastTick = +Renderer.tick;
}

/**
 * Search free cells around a position
 *
 * @param {number} x
 * @param {number} y
 * @param {number} range
 * @param {array} out
 */
function checkFreeCell(x, y, range, out) {
	let _x, _y, r;
	const d_x = Session.Entity.position[0] < x ? -1 : 1;
	const d_y = Session.Entity.position[1] < y ? -1 : 1;

	// Search possible positions
	for (r = 0; r <= range; ++r) {
		for (_x = -r; _x <= r; ++_x) {
			for (_y = -r; _y <= r; ++_y) {
				if (isFreeCell(x + _x * d_x, y + _y * d_y)) {
					out[0] = x + _x * d_x;
					out[1] = y + _y * d_y;
					return true;
				}
			}
		}
	}

	return false;
}

/**
 * Does a cell is free (walkable, and no entity on)
 *
 * @param {number} x
 * @param {number} y
 * @param {returns} is free
 */
function isFreeCell(x, y) {
	if (!(Altitude.getCellType(x, y) & Altitude.TYPE.WALKABLE)) {
		return false;
	}

	let free = true;

	EntityManager.forEach(function (entity) {
		if (
			entity.objecttype != entity.constructor.TYPE_EFFECT &&
			entity.objecttype != entity.constructor.TYPE_UNIT &&
			entity.objecttype != entity.constructor.TYPE_TRAP &&
			Math.round(entity.position[0]) === x &&
			Math.round(entity.position[1]) === y
		) {
			free = false;
			return false;
		}

		return true;
	});

	return free;
}

/**
 * If the character moved to attack, once it finished to move ask to attack
 */
function onWalkEnd() {
	// C47: a caminhada que terminou e mais velha que o pedido guardado (o
	// servidor ainda nao confirmou a dele) - ver confirmacaoDaCaminhada.js.
	if (!fimDaCaminhadaEhDoPedido(Session)) {
		return;
	}
	// No action to do ?
	if (Session.moveAction) {
		// Not sure why, but there is a synchronization error with the
		// server when moving to attack (wrong position).
		// So wait 50ms to be sure we are at the correct position before
		// performing an action
		Events.setTimeout(() => {
			if (Session.moveAction) {
				/*
				 * Lote 5 (resto do C23): a skill guardada re-confere o alcance
				 * com a regua da fonte onde o boneco PAROU (rAthena
				 * battle_check_range, unit.cpp:2362 e :2695) - ver
				 * alcanceNoFimDaCaminhada.js.
				 */
				const pendente = Session.moveActionAlcance;
				if (pendente && pendente.pacote === Session.moveAction && Session.Entity) {
					const decisao = decidirNoFimDaCaminhada({
						pos: Session.Entity.position,
						alvo: pendente.alvo(),
						alcance: pendente.alcance,
						repeticoes: pendente.repeticoes
					});
					if (decisao === 'andar') {
						pendente.repeticoes++;
						if (pendente.andar()) {
							return;
						}
					}
					if (decisao !== 'soltar') {
						Session.moveAction = null;
						Session.moveActionAlcance = null;
						Session.moveActionEspera = null;
						// C47 (C-2): desistir avisa, como a C19 (o `andar()` que nao
						// coube no teto ja avisou por conta propria).
						if (decisao === 'desistir') {
							ChatBox.addText(TEXTO_FORA_DO_ALCANCE, ChatBox.TYPE.ERROR, ChatBox.FILTER.SKILL_FAIL);
						}
						return;
					}
				}
				Network.sendPacket(Session.moveAction);
				Session.moveAction = null;
				Session.moveActionAlcance = null;
				Session.moveActionEspera = null;
			}
		}, 50);
	}
}

/**
 * Ask server to update status
 *
 * @param {number} id
 * @param {number} amount
 */
function onRequestStatUpdate(id, amount) {
	const pkt = new PACKET.CZ.STATUS_CHANGE();
	pkt.statusID = id;
	pkt.changeAmount = amount;

	Network.sendPacket(pkt);
}

/**
 * Drop item to the floor
 *
 * @param {number} index in inventory
 * @param {number} count to drop
 */
function onDropItem(index, count) {
	if (count) {
		let pkt;
		if (PACKETVER.value >= 20180307) {
			pkt = new PACKET.CZ.ITEM_THROW2();
		} else {
			pkt = new PACKET.CZ.ITEM_THROW();
		}
		pkt.Index = index;
		pkt.count = count;
		Network.sendPacket(pkt);
	}
}

/**
 * Use an item
 *
 * @param {number} item's index
 */
function onUseItem(index) {
	// Items are not usable when Laphine Synthesis, Upgrade, ItemReform UI is open (if they are available at all)
	if (
		(LaphineSys.__loaded && LaphineSys.__active && LaphineSys.ui.is(':visible')) ||
		(LaphineUpg.__loaded && LaphineUpg.__active && LaphineUpg.ui.is(':visible')) ||
		(ItemReform.__loaded && ItemReform.__active && ItemReform.ui.is(':visible'))
	) {
		return false;
	}

	let pkt;
	if (PACKETVER.value >= 20180307) {
		// not sure - this date is when the shuffle packets stoped
		pkt = new PACKET.CZ.USE_ITEM2();
	} else {
		pkt = new PACKET.CZ.USE_ITEM();
	}
	pkt.index = index;
	pkt.AID = Session.Entity.GID;
	Network.sendPacket(pkt);
}

/**
 * Equip item
 *
 * @param {number} item's index
 * @param {number} where to equip
 */
function onEquipItem(index, location) {
	const pkt = new PACKET.CZ.REQ_WEAR_EQUIP();
	pkt.index = index;
	pkt.wearLocation = location;
	Network.sendPacket(pkt);
}

/**
 * Take off an equip
 *
 * @param {number} index to unequip
 */
function onUnEquip(index) {
	const pkt = new PACKET.CZ.REQ_TAKEOFF_EQUIP();
	pkt.index = index;
	Network.sendPacket(pkt);
}

/**
 * Add Switch Equip
 */
function onAddSwitchEquip(index, location) {
	const pkt = new PACKET.CZ.REQ_WEAR_SWITCHEQUIP_ADD();
	pkt.index = index;
	pkt.wearLocation = location;
	Network.sendPacket(pkt);
}

/**
 * Remove Switch Equip
 */
function onRemoveSwitchEquip(index) {
	const pkt = new PACKET.CZ.REQ_WEAR_SWITCHEQUIP_REMOVE();
	pkt.index = index;
	Network.sendPacket(pkt);
}

/**
 * Update config
 *
 * @param {number} config id (only type:0 is supported - equip)
 * @param {number} val
 */
function onConfigUpdate(type, val) {
	const pkt = new PACKET.CZ.CONFIG();
	pkt.Config = type;
	pkt.Value = val;
	Network.sendPacket(pkt);
}

/**
 * Go back from map-server to char-server
 */
function onRestart() {
	import('Engine/CharEngine.js').then(m => m.default.reload());
}

/**
 * Reply to reassembly auth packet
 * @param {object} pkt - packet
 */
function onReassemblyAuth(pkt) {
	for (const [ZC, CZ] of packetMap.entries()) {
		if (pkt instanceof ZC) {
			console.warn(`Reassembly Auth ${ZC.id} => ${CZ.id}`);
			Network.sendPacket(new CZ());
			return;
		}
	}
}

/**
 * Export
 */
export default MapEngine;
