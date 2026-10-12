/**
 * UI/Components/MochilaIdle/MochilaIdle.js
 *
 * "Mochila" -- janela UNICA de inventario + equipamento (gauntlet 19/08/2026,
 * redesign/extracao-inventario-origin.md). Substitui visualmente as duas
 * janelas nativas separadas de hoje (Inventory/Equipment) por UMA janela com
 * dois paineis: esquerda "Personagem" (retrato + 10 slots de equipamento em
 * duas colunas), direita "Mochila" (grade de itens em 3 abas + rodape de
 * peso). Mesmo padrao "esconde o host nativo e fala com ele por fora, zero
 * edicao de logica" que BasicInfoIdle.js ja usa pra BasicInfo -- ver a nota
 * la (hideNativeBasicInfo/syncFromNativeState) pro mesmo raciocinio aplicado
 * aqui a DUAS janelas nativas em vez de uma.
 *
 * ── De onde vem cada dado (contrato tecnico, secao 5b do briefing) ───────
 *   - itens da mochila: Inventory.getUI().list (array publico,
 *     InventoryCommon.js:108) -- objetos {index, ITID, count, type,
 *     IsIdentified, IsDamaged, location, ...} ja prontos, sem pacote novo.
 *   - aba de cada item: getItemTab() abaixo e a MESMA regra de
 *     InventoryCommon.js:580-601 (nao exportada de la, por isso duplicada
 *     aqui -- mesmo criterio que CombatCornerIdle.js/IdleSkills.js ja usaram
 *     pra outras funcoes privadas de arquivos irmaos).
 *   - equipar: Inventory.getUI().onEquipItem esta ligado (por
 *     Engine/MapEngine.js:503) ao MESMO handler que Equipment usa -- entao
 *     chamar Inventory.getUI().useItem(item) (a funcao publica que decide
 *     "usar" vs "equipar" pelo item.type, InventoryCommon.js:910-951) e o
 *     caminho real de duplo-clique, identico ao que o dblclick nativo chama.
 *   - tirar: Equipment.getUI().onUnEquip(index) -- injetado em
 *     Engine/MapEngine.js:498, manda CZ_REQ_TAKEOFF_EQUIP de verdade.
 *   - o que esta vestido: NAO da pra ler via Equipment.getUI().checkEquipLoc()
 *     sozinho -- ele so devolve um numero de sprite (wItemSpriteNumber) pra
 *     alimentar o boneco 3D, nao o item inteiro (nome/icone/refino). O
 *     contrato oferece a alternativa: ler o DOM do host nativo ESCONDIDO
 *     (Equipment.equip()/unEquip() continuam escrevendo nesse DOM
 *     normalmente -- esconder o host so tira ele da TELA, o shadow root
 *     continua vivo e atualizado a cada equipar/tirar real). E o que
 *     lerEquipSlot() faz abaixo: acha a <td class="weapon"> etc (mesmas
 *     classes que EquipmentCommon.js:60-84 usa, duplicadas aqui pela mesma
 *     razao de getItemTab), le o icone (background-image do <button>) e o
 *     nome (que ja vem com "+N " de refino, DB.getItemName default) do
 *     ".item"/".itemName" que a propria Equipment ja montou.
 *   - icone da mochila: tenta PRIMEIRO /ragidle/item/<ITID>.png (outro
 *     builder publica esses PNGs em paralelo -- se a pasta nao existir ainda
 *     quando este arquivo carrega, o <img onerror> cai pro caminho antigo,
 *     Client.loadFile(DB.INTERFACE_PATH + 'item/' + resName + '.bmp'), o
 *     MESMO que InventoryCommon.js:761-772 ja usa).
 *   - peso: Session.Entity.weight / Session.Entity.max_weight (Engine/
 *     MapEngine/Main.js:406-417 grava os dois ali, em decimos -- por isso a
 *     divisao por 10 abaixo, mesma conta de BasicInfoIdle.js).
 *   - descricao: ItemInfo.append(); ItemInfo.uid = item.ITID;
 *     ItemInfo.setItem(item) -- a janela de descricao nativa, ja existente,
 *     so aberta por fora (nao e um "menu novo", e a descricao que o proprio
 *     contrato pede pra reusar).
 *
 * ── RODADA 4 (19/08/2026) -- interacao (pedido literal do dono) ──────────
 *   - Arrastar da grade ate um slot equipa (onGradeDragStart/
 *     onPainelEsqDrop abaixo); arrastar de volta (slot -> grade) tira
 *     (onSlotDragStart/onGradeDrop). Contrato global reusado, sem inventar
 *     outro: dragstart escreve window._OBJ_DRAG_ = {type:'item',
 *     from:'Inventory', data:item} e o mesmo JSON em dataTransfer 'Text' --
 *     mesmo molde de InventoryCommon.js:1214-1241 / EquipmentCommon.js:
 *     819-884 (so lidos, nao editados). Isso da interoperar de graca com
 *     Armazem/Carrinho/Correio/Atalhos, que ja leem esse contrato.
 *   - Botao direito abre o ContextMenu generico (ContextMenu.js -- so
 *     lido, nao editado): grade equipavel = Equipar+Detalhes, consumivel =
 *     Usar+Detalhes, sem acao = so Detalhes; slot vestido = Tirar+Detalhes.
 *   - A recusa do servidor (fase 1, peca com refino ou carta nao pode
 *     trocar/tirar -- servidor-mapa.ts ~5789-5860) NAO tem caminho limpo de
 *     observacao pelo cliente: Network.hookPacket() (NetworkManager.js:200-
 *     210) so guarda UM callback por pacote (Packets.list[id].callback = fn,
 *     sobrescreve, nao empilha) -- hookar de novo os ACKs de vestir/tirar
 *     substituiria o handler nativo de Engine/MapEngine/Item.js, que e
 *     exatamente o que a missao pede pra NAO fazer. Duas defesas em vez
 *     disso, nenhuma delas hook: (1) PREDICAO -- o selo "+N" de refino que
 *     esta janela ja desenha em cada slot (syncEquipSlots) espelha a mesma
 *     condicao que o servidor testa (refino>0), entao dá pra avisar ANTES
 *     mesmo da resposta chegar, sem inventar dado novo; (2) FALLBACK por
 *     AUSENCIA DE MUDANCA (a saida que a missao autoriza quando nao ha
 *     observacao limpa) -- depois de um pedido, confere se o indice ainda
 *     esta no mesmo lugar passado um tempo; se sim, avisa de forma honesta
 *     (nao afirma "e refino" quando pode ser carta ou requisito de
 *     classe/nivel). Ver tentarEquipar/tentarTirar/verificarRecusa abaixo.
 *   - RODADA 3 (19/08/2026): a boneca central deixou de ser o retrato de
 *     classe estatico e virou o render AO VIVO do personagem (renderBoneco()
 *     abaixo) -- pedido literal do dono: "deve ficar o personagem real da
 *     pessoa, com os efeitos, com as skins, com o que ela estiver equipada".
 *     Receita copiada dos dois lugares que o motor ja usa pra isso (canvas +
 *     SpriteRenderer, MESMOS numeros de bind2DContext), sem editar nenhum
 *     dos dois:
 *       - EquipmentCommon.js:765-808 (renderEntity())
 *       - PlayerViewEquipCommon.js:502-557 (renderCharacter())
 *     NAO reaproveita o canvas da Equipment nativa: ele nunca e pintado
 *     enquanto ela fica escondida (Renderer.render(renderCharacter) so liga
 *     quando ela fica visivel), e ligar aquele canvas teria efeito colateral
 *     (embute WinStats, mexe em z-index). O laço proprio le Session.Entity a
 *     cada quadro (job/sex/head/paletas/accessory-1-2-3/robe) e liga/desliga
 *     com Renderer.render()/stop() no toggle() da janela, pra nao rodar com
 *     ela fechada. PEDIDO EXTRA do dono (arma tambem, a boneca nativa do RO
 *     so mostra chapeu/capa) foi TENTADO e NAO entrou -- investigado a
 *     fundo (ver o comentario grande em cima de renderBoneco() abaixo): o
 *     motor nao desenha a camada de arma nem na entidade REAL do jogador no
 *     mundo hoje, entao nao e defeito desta janela.
 *   - Raridade/tarja de cor na celula da grade: sem dado real (contrato
 *     confirma), entao nenhuma cor foi inventada.
 *   - "Organizar"/"+"/"Atalho"/Favoritos/Pet/Estatua/Verus/Premium: nao
 *     existem no jogo (servidor manda favorito sempre 0; nao ha cap de
 *     slots) -- nao viraram botao morto, ver secao 5 do briefing.
 *
 * ── FANTASIA (26/08/2026) -- os slots de costume ─────────────────────────
 * Pedido do dono: "ja coloque a opcao de costume no nosso inventario
 * tambem, tanto para equipar como na mochila". O que entrou:
 *   - fileira ".mo-fantasia" com os 4 slots de costume (lista, mascara e a
 *     armadilha do robe em slotsDeFantasia.js), SEMPRE a vista embaixo da
 *     boneca -- a decisao "fileira, nao aba" esta em MochilaIdle.css;
 *   - os ladrilhos sao os MESMOS ".mo-slot" das colunas, dentro do mesmo
 *     ".mo-painel-esq": equipar por arrasto, "x", menu de contexto e tirar
 *     por arrasto valem pra fantasia pelos handlers delegados ja existentes
 *     (o bitmask de data-location faz o resto);
 *   - na grade, item de costume ganha selo de brilho + " — Fantasia" na
 *     dica (eDeFantasia sobre a mascara de vestir do proprio item);
 *   - equipar/tirar NAO precisou de caminho novo: useItem() nativo ja chama
 *     onEquipItem(index, item.location) pra ARMOR, o servidor veste pela
 *     mascara do item, e o ACK (Engine/MapEngine/Item.js:238-291) ja
 *     escreve a celula de costume do host escondido E a aparencia da
 *     entidade (costume por cima do normal) -- a boneca herda de graca.
 *
 * @author RagIdle
 */

import Renderer from 'Renderer/Renderer.js';
import { legendaDeVip } from '../../../DB/Items/exclusivosDeVip.js';
import { linhaDeIdParaAdmin } from '../../../DB/Items/idParaAdmin.js'; // 11/09/2026, D-1331
import Camera from 'Renderer/Camera.js';
import SpriteRenderer from 'Renderer/SpriteRenderer.js';
import Entity from 'Renderer/Entity/Entity.js';
import Preferences from 'Core/Preferences.js';
import Session from 'Engine/SessionStorage.js';
import DB from 'DB/DBManager.js';
import Client from 'Core/Client.js';
import ItemType from 'DB/Items/ItemType.js';
import EquipLocation from 'DB/Items/EquipmentLocation.js';
import UIManager from 'UI/UIManager.js';
import GUIComponent from 'UI/GUIComponent.js';
import Inventory from 'UI/Components/Inventory/Inventory.js';
import { posicaoDaDica } from './posicaoDaDica.js';
import { rotuloDoEspacoEquipado } from './espacoEquipado.js';
import { FANTASIA_SLOTS, eDeFantasia } from './slotsDeFantasia.js';
import Equipment from 'UI/Components/Equipment/Equipment.js';
import ItemInfo from 'UI/Components/ItemInfo/ItemInfo.js';
import ContextMenu from 'UI/Components/ContextMenu/ContextMenu.js';
import RiIcones from 'UI/ri-icones.js';
import { carregarArteDeColecao, itemIconUrl, preferirArtePublicada } from 'Utils/ItemArt.js';
import { escapeHTML, renderRunasHTML } from 'Utils/ItemOptionsView.js';
import Network from 'Network/NetworkManager.js';
import PACKET from 'Network/PacketStructure.js';
import ItemCompare from 'UI/Components/ItemCompare/ItemCompare.js';
import { htmlDaComparacao } from './comparacaoDoItem.js';
import htmlText from './MochilaIdle.html?raw';
import cssText from './MochilaIdle.css?raw';
import { fecharEEsquecer } from '../limpezaDeJanelaIdle.js';
import { abaLembrada, lembrarAba } from '../memoriaDeAba.js';
import { pegar } from 'UI/toqueParaAtalho.js';
import Storage from 'UI/Components/Storage/Storage.js';
import InputBox from 'UI/Components/InputBox/InputBox.js';
import { consumirMotivoRecente } from './recusaDoServidor.js';
import {
	acaoPrincipalDoItem,
	assinaturasDaGrade,
	atualizarQuantidadesNaGrade,
	mascaraDaMunicao,
	municaoVestiuOIndice,
	oQueRefazerNaGrade,
	vestidoEmParaADica
} from './municaoNaMochila.js';
import {
	armazemAberto,
	ehArrastoDoArmazem,
	quantidadeDaRetirada,
	quantidadeDoDeposito,
	quantidadePadraoDaRetirada,
	tetoPeloPeso
} from 'UI/Components/Storage/retiradaDoArmazem.js';
import { pesoDeItem } from 'DB/Items/fichasDeItem.js';
import CartItems from 'UI/Components/CartItems/CartItems.js';
import {
	ehArrastoDoCarrinho,
	pesoLivreDoCarrinho,
	temCarrinho,
	textoDaQuantidadeRecusada
} from 'UI/Components/CartItems/transferenciaDoCarrinho.js';

/**
 * Mantido em sincronia com ":host"/".mo-window"/".mo-frame" em
 * MochilaIdle.css (mesma cicatriz D-341 documentada la e em StatusIdle.css).
 * RODADA 2 (19/08/2026): altura reduzida de 434 -> 344 -- a grade agora
 * renderiza um numero FIXO de celulas (GRADE_CAPACIDADE abaixo) em vez de so
 * as ocupadas, entao o "ar" que sobrava embaixo da lista curta virou grade de
 * verdade; a janela nao precisa mais da altura extra pra disfarcar isso.
 * FANTASIA (26/08/2026): 344 -> 396 -- a fileira de slots de costume entrou
 * embaixo da boneca; a conta inteira da altura nova esta no cabecalho de
 * MochilaIdle.css.
 */
const WINDOW_WIDTH = 578;
const WINDOW_HEIGHT = 396;

/**
 * Reticulo SEMPRE visivel da grade (secao 1 do briefing: "a grade e um
 * reticulo sempre visivel de 5 colunas... o total pode vir do que faz
 * sentido pra area visivel, com rolagem quando passar disso"). 5x6 = 30
 * celulas fecham EXATO em ".mo-grade-host" sem cortar a ultima fileira
 * (306px de miolo = 6x46 + 5x6, ver a conta da altura em MochilaIdle.css --
 * eram 5 linhas ate a janela crescer pra fileira de fantasia); alem disso,
 * ".ri-scroll" rola.
 */
const GRADE_COLS = 5;
const GRADE_LINHAS_VISIVEIS = 6;
const GRADE_CAPACIDADE = GRADE_COLS * GRADE_LINHAS_VISIVEIS;

/**
 * Mesma cadencia de polling que BasicInfoIdle.js/DockIdle.js.
 */
const POLL_INTERVAL_MS = 250;

/**
 * Os 11 slots de equipamento REAIS deste jogo (DB/Items/EquipmentLocation.js)
 * -- SHADOW_* fica de fora (shadow gear nao existe neste jogo).
 *
 * ── A MUNICAO ENTROU EM 28/08/2026 (queixa do dono) ──────────────────────
 * O comentario que estava aqui dizia que "municao nao tem janela aqui", e era
 * verdade: a flecha era o UNICO equipamento sem lugar nenhum na tela. O dono
 * relatou exatamente isso -- *"nao vejo onde a flecha esta equipada, nao
 * mostra a quantidade"*.
 *
 * Ela e o unico slot que mostra CONTADOR, e a razao e do jogo: as outras dez
 * pecas sao unidades e a municao e uma pilha que ACABA. Um arqueiro sem flecha
 * nao ataca (`semMunicaoParaAtacar`, combat/simulate.ts), entao "quantas
 * restam" e informacao de combate, e nao enfeite. Os COSTUME_* SAIRAM desta lista de exclusao em
 * 26/08/2026 (pedido do dono): eles moram em FANTASIA_SLOTS
 * (slotsDeFantasia.js) e desenham na fileira ".mo-fantasia-slots", abaixo da
 * boneca. Coluna esquerda/direita e a MESMA divisao que a Equipment nativa ja
 * usa (col1/col3, ver EquipmentV4.html) -- nao inventada, so espelhada.
 */
const EQUIP_SLOTS = [
	{ location: EquipLocation.HEAD_TOP, cls: 'head_top', label: 'Chapéu', glifo: 'slotChapeu', col: 'esq' },
	{ location: EquipLocation.HEAD_BOTTOM, cls: 'head_bottom', label: 'Boca', glifo: 'slotBoca', col: 'esq' },
	{ location: EquipLocation.WEAPON, cls: 'weapon', label: 'Arma', glifo: 'slotArma', col: 'esq' },
	{ location: EquipLocation.GARMENT, cls: 'garment', label: 'Capa', glifo: 'slotCapa', col: 'esq' },
	{ location: EquipLocation.ACCESSORY1, cls: 'accessory1', label: 'Acessório', glifo: 'slotAcessorio', col: 'esq' },
	{ location: EquipLocation.HEAD_MID, cls: 'head_mid', label: 'Óculos', glifo: 'slotOculos', col: 'dir' },
	{ location: EquipLocation.ARMOR, cls: 'armor', label: 'Armadura', glifo: 'slotArmadura', col: 'dir' },
	{ location: EquipLocation.SHIELD, cls: 'shield', label: 'Escudo', glifo: 'slotEscudo', col: 'dir' },
	{ location: EquipLocation.SHOES, cls: 'shoes', label: 'Sapato', glifo: 'slotSapato', col: 'dir' },
	{ location: EquipLocation.ACCESSORY2, cls: 'accessory2', label: 'Acessório', glifo: 'slotAcessorio', col: 'dir' },
	{ location: EquipLocation.AMMO, cls: 'ammo', label: 'Munição', glifo: 'slotMunicao', col: 'dir', comContador: true }
];

/**
 * Create Component
 */
const MochilaIdle = new GUIComponent('MochilaIdle', cssText);

MochilaIdle.render = () => htmlText;

/**
 * Mesmo modo dos outros flutuantes/janelas RAGIDLE -- ver StatusIdle.js.
 */
MochilaIdle.mouseMode = GUIComponent.MouseMode.CROSS;

/**
 * @var {Preferences} posicao da janela -- centralizada por padrao, igual
 * StatusIdle.js -- e a ABA em que o jogador estava (`aba`, ver
 * memoriaDeAba.js). Versao continua 1.0: somar chave nova aos padroes nao
 * exige subir versao, e subir apagaria a posicao ja salva.
 */
const _preferences = Preferences.get(
	'MochilaIdle',
	{
		x: null,
		y: null,
		aba: null
	},
	1.0
);

/**
 * @var {number|null} handle do polling.
 */
let _pollTimer = null;

/**
 * @var {number} aba ativa (Inventory.getUI().TAB.*) -- estado PROPRIO desta
 * janela, nunca escrito na janela nativa (ela fica intocada, so escondida).
 * Comeca em USABLE, o mesmo padrao default da Inventory nativa
 * (InventoryCommon.js prefDefaults.tab), ou na aba LEMBRADA se o jogador ja
 * escolheu uma (ver abaDePartida() logo abaixo).
 */
let _abaAtiva = null;

/**
 * A aba com que esta janela deve nascer: a que o jogador deixou aberta, ou
 * "Consumiveis".
 *
 * Aqui a aba e NUMERO (os `TAB.*` da Inventory nativa) e a memoria guarda
 * texto, entao a volta passa por `parseInt`. A lista de validas e montada na
 * hora a partir do proprio `TAB` -- escrever `['0','1','2']` aqui amarraria
 * esta janela a valores que sao da Inventory, nao nossos.
 *
 * DOIS chamadores, e o segundo e um conserto: `limparEstadoDoPersonagem`
 * zerava `_abaAtiva` para `null` e ninguem o repunha -- `init()` roda uma vez
 * so por carregamento de pagina, e trocar de personagem nao recarrega a pagina.
 * Depois da troca, `syncGrade()` filtrava a lista por `getItemTab(item) === null`
 * e a mochila abria VAZIA, com nenhuma aba acesa, ate o jogador clicar numa.
 */
function abaDePartida() {
	const TAB = Inventory.getUI().TAB;
	const validas = [TAB.USABLE, TAB.EQUIP, TAB.ETC].map(String);
	return parseInt(abaLembrada(_preferences, String(TAB.USABLE), validas), 10);
}

/**
 * @var {string|null} assinatura da ultima grade desenhada -- evita
 * reconstruir <img> a cada tick de 250ms (reconstruir sempre reiniciaria o
 * onerror/Client.loadFile de cada icone, um flicker real).
 */
let _lastGradeSig = null;

/**
 * @var {string|null} assinatura dos ultimos slots desenhados -- mesmo motivo.
 */
let _lastSlotsSig = null;

/**
 * @var {CanvasRenderingContext2D|null} contexto 2D da boneca ao vivo
 * (".mo-avatar-canvas") -- capturado uma vez em init(), igual ao array _ctx
 * de EquipmentCommon.js.
 */
let _bonecoCtx = null;

/**
 * @var {number|null} indice do item sendo arrastado de um slot DE VOLTA pra
 * grade (tirar por arrastar) -- estado local, nao usa o _OBJ_DRAG_ global
 * porque essa direcao (slot -> nossa propria grade) nao precisa interoperar
 * com Armazem/Carrinho/Correio, so com esta janela.
 */
let _dragUnequipIndex = null;

/**
 * @var {number|null} handle do timeout que esconde o aviso de recusa.
 */
let _avisoTimer = null;

/**
 * Tempo de espera antes de checar se um pedido de equipar/tirar foi
 * recusado pelo servidor, pela FALTA de mudanca (ver cabecalho do arquivo,
 * secao RODADA 4). Maior que POLL_INTERVAL_MS * 2 pra garantir que o
 * proximo tick de sync ja rodou se o pedido tiver sido aceito.
 */
const RECUSA_DELAY_MS = 900;

function _root() {
	return MochilaIdle._shadow || MochilaIdle._host;
}

/**
 * O ponteiro deste aparelho e GROSSO (dedo)? LIDO NA HORA DO EVENTO -- nunca
 * uma vez so no boot, porque a janela pode trocar de aparelho SEM recarregar
 * a pagina (DevTools, um tablet com teclado que liga/desliga o toque). Mesmo
 * criterio que escalaDaHud.js/ChatBox.js ja usam pra essa mesma pergunta --
 * duplicado aqui (em vez de importado) porque a fronteira deste buraco e
 * SOMENTE MochilaIdle.js/.css.
 *
 * Usado pra abrir o MESMO menu do botao direito com um toque simples (ver
 * onClickItemGrade abaixo): no MOUSE um clique simples continua sem fazer
 * nada, o desktop nao muda.
 */
function ehToque() {
	return typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
}

/**
 * One-time setup.
 */
MochilaIdle.init = function init() {
	const root = _root();

	this.draggable(root.querySelector('.mo-topo'));

	root.querySelector('.mo-close').addEventListener('click', onClickClose);

	/*
	 * A PORTA DO CARRINHO (D-1848, 30/09/2026). Ate hoje o carrinho do Mercador
	 * so abria pelo Alt+W nativo — que ninguem conhece e que nao existe no
	 * celular. A porta mora AQUI, e nao no Menu, porque o carrinho e uma
	 * extensao da mochila: e daqui que o jogador tira o que vai por nele, e e
	 * aqui que o RO original tambem o poe (o botao "Cart" da janela de
	 * equipamento, EquipmentCommon.js, que neste fork mora dentro da Mochila).
	 * O Menu tem a grade de colunas contada pelos itens visiveis; um item que
	 * aparece e some por personagem mexeria no desenho dele para todo mundo.
	 * Visivel so para quem TEM carrinho (`syncBotaoDoCarrinho`).
	 */
	const botaoDoCarrinho = root.querySelector('.mo-carrinho');
	if (botaoDoCarrinho) {
		botaoDoCarrinho.addEventListener('click', e => {
			e.stopImmediatePropagation();
			CartItems.toggle();
		});
	}

	// A resposta da comparação de equipamento (08/09/2026) — ver abrirDetalhes.
	Network.hookPacket(PACKET.ZC.RAGIDLE_ITEM, aoChegarComparacao);

	// Boneca ao vivo -- contexto capturado uma vez, o laço em si so liga/
	// desliga no toggle() (ver renderBoneco()/onClickClose/toggle abaixo).
	const bonecoCanvas = root.querySelector('.mo-avatar-canvas');
	if (bonecoCanvas) {
		_bonecoCtx = bonecoCanvas.getContext('2d');
	}

	// Delegacao: os slots/celulas sao reconstruidos por sync*() abaixo, entao
	// os listeners moram no CONTAINER (que nunca e recriado), nao nos
	// elementos filhos (que sao).
	const painelEsq = root.querySelector('.mo-painel-esq');
	painelEsq.addEventListener('click', onClickPainelEsq);
	painelEsq.addEventListener('contextmenu', onContextMenuSlot);
	// Arrastar da grade ATE um slot (equipar) -- alvo e o painel esquerdo.
	painelEsq.addEventListener('dragover', onPainelEsqDragOver);
	painelEsq.addEventListener('dragleave', onPainelEsqDragLeave);
	painelEsq.addEventListener('drop', onPainelEsqDrop);
	// Arrastar um slot OCUPADO pra fora (tirar) -- fonte e o painel esquerdo.
	painelEsq.addEventListener('dragstart', onSlotDragStart);
	painelEsq.addEventListener('dragend', onSlotDragEnd);

	/*
	 * A DICA DE HOVER (pedido do dono, 25/08/2026): passar o mouse num item
	 * mostra o NOME.
	 *
	 * Delegada nos dois containers pelo mesmo motivo dos listeners acima — as
	 * celulas e os slots sao reconstruidos, os containers nao — e por um
	 * segundo, que e o motivo de a dica ser custom em vez do `title` nativo:
	 * `syncGrade` apaga a grade inteira sempre que a mochila muda, e num idle
	 * a mochila muda a cada drop. O tooltip do navegador precisa de ~1 s de
	 * mouse parado SOBRE O MESMO ELEMENTO, e o elemento sob o cursor era
	 * trocado antes disso — durante uma cacada ele praticamente nunca
	 * aparecia. (Nos slots de equipamento, que quase nunca sao reconstruidos,
	 * ele aparecia — e essa e a assimetria que o dono viu.)
	 */
	painelEsq.addEventListener('mouseover', onHoverEntra);
	painelEsq.addEventListener('mouseout', onHoverSai);

	const grade = root.querySelector('.mo-grade');
	grade.addEventListener('mouseover', onHoverEntra);
	grade.addEventListener('mouseout', onHoverSai);
	grade.addEventListener('dblclick', onDblClickItem);
	grade.addEventListener('contextmenu', onContextMenuItem);
	// TOQUE (05/09/2026): um toque simples abre o MESMO menu do botao direito
	// -- so no dedo (ehToque() decide na hora, ver onClickItemGrade abaixo).
	grade.addEventListener('click', onClickItemGrade);
	// Arrastar um item da grade (fonte, contrato global _OBJ_DRAG_).
	grade.addEventListener('dragstart', onGradeDragStart);
	grade.addEventListener('dragend', onGradeDragEnd);
	// Alvo de um slot arrastado de volta (tirar por arrastar).
	grade.addEventListener('dragover', onGradeDragOver);
	grade.addEventListener('drop', onGradeDrop);

	_abaAtiva = abaDePartida();
	renderAbas(root);

	this._host.style.top = Math.max(0, (Renderer.height - WINDOW_HEIGHT) / 2) + 'px';
	this._host.style.left = Math.max(0, (Renderer.width - WINDOW_WIDTH) / 2) + 'px';
};

/**
 * Monta as 3 abas reais (Consumíveis/Equipar/Diversos -- FAV fica de fora,
 * o servidor manda o campo favorito sempre 0, ver cabecalho do arquivo).
 * Estatica: montada uma vez, nunca reconstruida (so ".is-active" muda).
 */
function renderAbas(root) {
	const TAB = Inventory.getUI().TAB;
	const abas = [
		{ tab: TAB.USABLE, label: 'Consumíveis' },
		{ tab: TAB.EQUIP, label: 'Equipar' },
		{ tab: TAB.ETC, label: 'Diversos' }
	];
	const container = root.querySelector('.mo-abas');
	container.innerHTML = abas
		.map(a => `<button type="button" class="mo-aba" data-tab="${a.tab}">${a.label}</button>`)
		.join('');
	container.addEventListener('click', onClickAba);
	syncAbasAtivas(root);
}

function onClickAba(e) {
	const btn = e.target.closest('.mo-aba');
	if (!btn) {
		return;
	}
	e.stopImmediatePropagation();
	_abaAtiva = parseInt(btn.dataset.tab, 10);
	lembrarAba(_preferences, _abaAtiva);
	_lastGradeSig = null; // forca redesenho imediato da grade na troca de aba
	syncAbasAtivas(_root());
	syncGrade();
}

function syncAbasAtivas(root) {
	// Guarda: `limparEstadoDoPersonagem` tambem chama isto, e la o `_root()`
	// pode nao existir -- uma excecao dentro do `cleanGameUI()` derrubaria a
	// troca de personagem inteira.
	if (!root) {
		return;
	}
	root.querySelectorAll('.mo-aba').forEach(btn => {
		btn.classList.toggle('is-active', parseInt(btn.dataset.tab, 10) === _abaAtiva);
	});
}

/**
 * Restaura posicao salva, esconde os DOIS hosts nativos e comeca o polling.
 */
MochilaIdle.onAppend = function onAppend() {
	if (_preferences.x != null && _preferences.y != null) {
		this._host.style.top = Math.min(Math.max(0, _preferences.y), Renderer.height - WINDOW_HEIGHT) + 'px';
		this._host.style.left = Math.min(Math.max(0, _preferences.x), Renderer.width - WINDOW_WIDTH) + 'px';
	}

	hideNativeHosts();
	syncAll();
	startPolling();
	// R14/C2-3 (14/09/2026): pede o estado da trava toda vez que a mochila
	// abre — mesmo padrao de `requestFavoritos` no Mapa de Caca (pedir ao
	// ABRIR a janela relevante, e nao manter um estado presumido).
	pedirTravas();

	/*
	 * A BONECA PRECISA SER REARMADA (27/08/2026, auditoria C).
	 *
	 * `Renderer.render(renderBoneco)` so era chamado no `toggle()`. Mas o laco
	 * e derrubado em TODA troca de mapa, por duas vias: `MapRenderer.setMap`
	 * faz `Renderer.stop()` SEM argumento — que zera a lista inteira de
	 * callbacks — e logo depois `UIManager.removeComponents()`, que dispara o
	 * `onRemove` daqui.
	 *
	 * Como o `onAppend` nao rearmava, a janela voltava aberta e a boneca ficava
	 * PARADA — em toda viagem, em toda morte, em toda troca de personagem. O
	 * unico jeito de trazer de volta era fechar e reabrir a Mochila.
	 *
	 * O `.is-open` sobrevive a troca porque a shadow DOM e reaproveitada
	 * (`GUIComponent.prepare` e guardado por `__loaded`), entao a janela
	 * REALMENTE volta aberta — e e por isso que a condicao abaixo basta.
	 */
	// `isOpen()` ja existe neste arquivo: escrever um segundo teste de janela
	// aberta seria a segunda rota, que e o defeito mais repetido do projeto.
	if (isOpen()) {
		Renderer.render(renderBoneco);
	}
};

MochilaIdle.onRemove = function onRemove() {
	stopPolling();
	savePosition();
	/*
	 * O comentario que estava aqui dizia que ser removido com a janela aberta
	 * "nao deveria acontecer no fluxo normal, so toggle() liga/desliga".
	 * ISSO CADUCOU: `MapRenderer.setMap` chama `UIManager.removeComponents()`
	 * em TODA troca de mapa, com a janela aberta ou nao. O caso chamado de
	 * "defensivo" E o fluxo normal — e foi essa frase que escondeu, por
	 * quanto tempo ninguem sabe, a boneca parada depois de cada viagem.
	 *
	 * Parar aqui continua certo. O que faltava era o par: rearmar no
	 * `onAppend`, logo acima.
	 */
	Renderer.stop(renderBoneco);
};

function savePosition() {
	_preferences.x = parseInt(MochilaIdle._host.style.left, 10) || 0;
	_preferences.y = parseInt(MochilaIdle._host.style.top, 10) || 0;
	_preferences.save();
}

/**
 * Esconde Inventory/Equipment nativos de forma REVERSIVEL (display:none no
 * _host, nunca .remove()) -- MESMA tecnica de BasicInfoIdle.js pra BasicInfo.
 * Chamado no onAppend E em todo tick do polling (defensivo: qualquer clique
 * que ainda chame o toggle() nativo -- ver CombatCornerIdle.js/DockIdle.js,
 * ja redirecionados pra esta janela -- fica revertido em ate 250ms).
 */
function hideNativeHosts() {
	const invUI = Inventory.getUI();
	if (invUI && invUI._host && invUI._host.style.display !== 'none') {
		invUI._host.style.display = 'none';
	}
	const eqUI = Equipment.getUI();
	if (eqUI && eqUI._host && eqUI._host.style.display !== 'none') {
		eqUI._host.style.display = 'none';
	}
}

function startPolling() {
	stopPolling();
	_pollTimer = setInterval(pollTick, POLL_INTERVAL_MS);
}

function stopPolling() {
	if (_pollTimer != null) {
		clearInterval(_pollTimer);
		_pollTimer = null;
	}
}

function pollTick() {
	hideNativeHosts();
	if (isOpen()) {
		syncAll();
	}
}

function syncAll() {
	syncBoneco();
	syncEquipSlots();
	syncGrade();
	syncRodape();
	syncBotaoDoCarrinho();
}

/**
 * O botao "Carrinho" do rodape aparece so para quem TEM carrinho (D-1848). O
 * `hasCart` chega depois da janela (o EFST `ON_PUSH_CART` do lote de entrada)
 * e muda sem relogar (a Kafra aluga, o `@cart` do administrador), por isso o
 * laco de 250 ms confere de novo a cada tique com a janela aberta.
 */
function syncBotaoDoCarrinho() {
	const botao = _root().querySelector('.mo-carrinho');
	if (!botao) {
		return;
	}
	const esconder = !temCarrinho(Session.Entity);
	if (botao.hidden !== esconder) {
		botao.hidden = esconder;
	}
}

function isOpen() {
	const root = _root();
	const win = root && root.querySelector('.mo-window');
	return !!(win && win.classList.contains('is-open'));
}

/**
 * Show/hide -- mesmo mecanismo de janela das outras RAGIDLE (StatusIdle.js:
 * so ".mo-window" troca de classe, o HOST fica sempre no DOM).
 */
MochilaIdle.toggle = function toggle() {
	const root = _root();
	const win = root.querySelector('.mo-window');
	if (win.classList.contains('is-open')) {
		win.classList.remove('is-open');
		savePosition();
		// Desliga o laço da boneca -- nao fica rodando com a janela fechada
		// (Renderer.stop(fn) so tira ESTE callback da lista, nao para o
		// mundo -- ver a nota em Renderer.js).
		Renderer.stop(renderBoneco);
	} else {
		win.classList.add('is-open');
		MochilaIdle.focus();
		syncAll();
		Renderer.render(renderBoneco);
	}
};

function onClickClose(e) {
	e.stopImmediatePropagation();
	MochilaIdle.toggle();
}

/**
 * Boneca ao vivo -- fecho no mesmo molde de EquipmentCommon.js:765-808 /
 * PlayerViewEquipCommon.js:502-557 (a receita ja pesquisada, ver cabecalho
 * do arquivo): uma Entity propria (nunca a de Session.Entity direto -- ela e
 * a entidade REAL do jogador, mexer nela vazaria pro mundo), atualizada a
 * cada quadro com os campos visuais de Session.Entity, desenhada de frente
 * parada (Camera.direction/direction/headDir = 0, ACTION.IDLE).
 *
 * Ligado/desligado por Renderer.render(renderBoneco)/Renderer.stop(
 * renderBoneco) no toggle() da janela (abrir liga, fechar desliga) -- nao
 * fica rodando com a janela fechada.
 *
 * PEDIDO A MAIS do dono (alem do que a boneca nativa do RO mostra): arma e
 * escudo tambem, nao so chapeu/capa/acessorio. TENTADO e INVESTIGADO -- NAO
 * entrou. entity.weapon/entity.shield sincronizam de graca (Engine/
 * MapEngine/Item.js:136-227 ja escreve os dois em Session.Entity a cada
 * vestir/tirar real) e o pipeline de carga funciona (arquivo .spr/.act
 * confirmado carregado, sem erro), mas a camada "weapon" nao desenha NENHUM
 * pixel -- nem nesta boneca, nem na entidade REAL do jogador no mundo 3D
 * (testado direto em Session.Entity.weapon fora desta janela, Novato E
 * Espadachim, pose parada de frente E de costas: os dois ficam de maos
 * vazias). Como o proprio mundo do jogo nao desenha arma na mao do
 * personagem hoje, isso e limite do motor (fora do escopo desta janela —
 * mexer no pipeline de sprite de arma seria "logica nova" e um trabalho bem
 * maior), nao um erro desta boneca. Regra do briefing: "se causar defeito,
 * deixe sem arma em vez de entregar quebrado" -- aqui nem chega a ser
 * defeito visual (nada aparece nem some errado), so nao ha o que mostrar.
 */
const renderBoneco = (function renderBonecoClosure() {
	const _character = new Entity();
	// Cor limpa (sem tingimento de status -- veneno/congelado/etc) -- MESMA
	// tecnica que os dois exemplos usam (_cleanColor), pra boneca de vestir
	// nao herdar o tingimento de combate do personagem real.
	const _cleanColor = new Float32Array([1.0, 1.0, 1.0, 1.0]);
	const _animation = {
		tick: 0,
		frame: 0,
		repeat: true,
		play: true,
		next: false,
		delay: 0,
		save: false
	};

	/* Nome proprio (nao "renderBoneco") so para nao sombrear a const externa
	   de mesmo nome — o lint do fork reprova "no-shadow". */
	return function desenharQuadroDoBoneco() {
		const entity = Session.Entity;
		if (!_bonecoCtx || !entity || !isOpen()) {
			return;
		}

		_character.set({
			GID: (entity.GID != null ? entity.GID : 'mochila') + '_BONECO',
			objecttype: _character.constructor.TYPE_PC,
			job: entity.job,
			sex: entity.sex,
			name: '',
			hideShadow: true,
			head: entity.head,
			headpalette: entity.headpalette,
			bodypalette: entity.bodypalette
		});

		// Os campos visuais da entidade REAL -- e desde 26/08/2026 eles ja
		// INCLUEM a fantasia de graca: Engine/MapEngine/Item.js:246-283
		// escreve accessory/accessory2/accessory3/robe com o viewid de
		// costume por cima do equipamento normal ("costume override regular
		// equips") a cada vestir/tirar, entao copiar os mesmos campos poe a
		// asa/chapeu de fantasia na boneca sem uma linha nova. Arma/escudo
		// NAO entram aqui -- ver o comentario grande acima desta closure
		// (investigado, motor nao desenha a camada de arma nem no mundo real
		// hoje).
		_character.accessory = entity.accessory;
		_character.accessory2 = entity.accessory2;
		_character.accessory3 = entity.accessory3;
		_character.robe = entity.robe;

		_character.effectColor.set(_cleanColor);

		Camera.direction = 0;
		_character.direction = 0;
		_character.headDir = 0;
		_character.action = _character.ACTION.IDLE;
		_character.animation = _animation;

		SpriteRenderer.bind2DContext(_bonecoCtx, 30, 130);
		_bonecoCtx.clearRect(0, 0, _bonecoCtx.canvas.width, _bonecoCtx.canvas.height);
		_character.renderEntity(_bonecoCtx);
	};
})();

/**
 * Nome do personagem (a letra-fallback so aparece atras do canvas enquanto
 * Session.Entity ainda nao tem job valido -- ver ".mo-avatar-fallback" em
 * MochilaIdle.css).
 */
function syncBoneco() {
	const root = _root();
	const entity = Session.Entity;
	if (!entity) {
		return;
	}

	const fallback = root.querySelector('.mo-avatar-fallback');
	const name = (entity.display && entity.display.name) || '';
	if (fallback) {
		fallback.textContent = name ? name.trim().charAt(0).toUpperCase() : '?';
	}
	const nomeEl = root.querySelector('.mo-boneco-nome');
	if (nomeEl) {
		nomeEl.textContent = name || '—';
	}
}

/**
 * Le o que esta vestido direto do DOM ja renderizado do host nativo Equipment
 * (escondido, mas vivo -- ver cabecalho do arquivo) e redesenha as duas
 * colunas de slots MAIS a fileira de fantasia. So reconstroi quando a
 * assinatura (indice de cada item equipado, slot a slot) muda -- ver
 * _lastSlotsSig.
 *
 * FANTASIA (26/08/2026): as celulas de costume moram na tabela #costume do
 * host nativo (EquipmentV3.html:73-100) -- ela e outra ABA la, mas as abas
 * daquela janela so trocam display, o DOM inteiro existe sempre; e
 * Equipment.equip() escreve pela location (getSelectorFromLocation), sem
 * olhar aba ativa. Entao a MESMA leitura por classe funciona -- inclusive a
 * celula do robe, que la se chama '.shadow_garment' (a armadilha inteira
 * esta em slotsDeFantasia.js).
 */
function syncEquipSlots() {
	const equipRoot = Equipment.getUI().getRoot();
	if (!equipRoot) {
		return;
	}

	const estados = [...EQUIP_SLOTS, ...FANTASIA_SLOTS].map(slot => {
		const cell = equipRoot.querySelector('.' + slot.cls);
		const itemDiv = cell ? cell.querySelector('.item') : null;
		return { slot, itemDiv };
	});

	/*
	 * A QUANTIDADE entra na assinatura (28/08/2026). Sem ela, gastar uma flecha
	 * nao redesenhava o contador: o indice do slot nao muda quando a pilha
	 * encolhe, e a comparacao dizia "nada mudou" ate a flecha ACABAR.
	 */
	const sig = estados
		.map(e => {
			if (!e.itemDiv) {
				return '';
			}
			const idx = e.itemDiv.getAttribute('data-index');
			if (!e.slot.comContador) {
				return idx;
			}
			const doInv = Inventory.getUI().getItemByIndex(parseInt(idx, 10));
			return idx + 'x' + String(doInv && doInv.count ? doInv.count : 0);
		})
		.join(',');
	if (sig === _lastSlotsSig) {
		return;
	}
	_lastSlotsSig = sig;

	// Mesma razao da grade: os ladrilhos abaixo sao recriados.
	esconderDica();

	const root = _root();
	const colEsq = root.querySelector('.mo-coluna-esq');
	const colDir = root.querySelector('.mo-coluna-dir');
	const linhaFantasia = root.querySelector('.mo-fantasia-slots');
	colEsq.innerHTML = '';
	colDir.innerHTML = '';
	linhaFantasia.innerHTML = '';

	estados.forEach(({ slot, itemDiv }) => {
		const tile = document.createElement('div');
		tile.className = 'ri-tile mo-slot';
		tile.dataset.location = String(slot.location);

		if (itemDiv) {
			tile.classList.add('is-ocupado');
			// Arrastavel (tirar arrastando pra grade) -- so pecas ocupadas,
			// slot vazio nao tem o que tirar.
			tile.draggable = true;
			tile.dataset.index = itemDiv.getAttribute('data-index') || '';
			const btn = itemDiv.querySelector('button');
			const nameSpan = itemDiv.querySelector('.itemName');
			const nome = nameSpan ? nameSpan.textContent : '';
			const iconUrl = extractUrl(btn && btn.style.backgroundImage);
			const refino = nome.match(/^\+(\d+)\s/);

			tile.dataset.dica = dicaDoItemNoIndice(itemDiv.getAttribute('data-index')) || nome || slot.label;
			/*
			 * O CONTADOR so existe no slot de municao, e o numero sai do
			 * INVENTARIO -- a celula da Equipment nativa nao carrega
			 * quantidade, porque nenhum dos outros dez slots precisa dela.
			 */
			const doInventario = slot.comContador
				? Inventory.getUI().getItemByIndex(parseInt(itemDiv.getAttribute('data-index'), 10))
				: null;
			const quantos = doInventario && doInventario.count ? doInventario.count : 0;
			tile.innerHTML =
				`<img class="mo-slot-icone" alt="" src="${iconUrl || ''}" />` +
				(refino ? `<span class="mo-slot-refino">+${refino[1]}</span>` : '') +
				(quantos > 0 ? `<span class="mo-slot-contador">${quantos}</span>` : '') +
				`<button type="button" class="mo-slot-remover" data-index="${itemDiv.getAttribute('data-index')}" data-dica="Tirar">&times;</button>`;

			/*
			 * O ICONE DO BONECO NAO PODE DEPENDER SO DA COPIA (21/09/2026).
			 *
			 * `iconUrl` acima e o `backgroundImage` que a Equipment nativa ja
			 * tinha escrito -- e ela o escreve de forma ASSINCRONA, entao o
			 * boneco pode ser montado antes. Pior: ate hoje ela o resolvia por
			 * `identifiedResourceName`, que para um id CUSTOM devolve a MACA de
			 * `unknownItem`, e era assim que o visual da Temporada aparecia com
			 * maca NO PERSONAGEM mesmo com o PNG publicado existindo (o dono,
			 * jogando, sobre a Astra Blessing).
			 *
			 * Aqui a arte publicada e pedida pelo ITID, com a copia como
			 * reserva -- a MESMA receita de `setItemIcon` na grade.
			 */
			const doInventario2 = Inventory.getUI().getItemByIndex(
				parseInt(itemDiv.getAttribute('data-index'), 10)
			);
			const imgDoSlot = tile.querySelector('.mo-slot-icone');
			if (imgDoSlot && doInventario2 && doInventario2.ITID) {
				preferirArtePublicada(
					itemIconUrl(doInventario2.ITID),
					url => {
						imgDoSlot.src = url;
					},
					() => {
						if (iconUrl) {
							imgDoSlot.src = iconUrl;
						}
					}
				);
			}
		} else {
			tile.classList.add('is-empty');
			tile.dataset.dica = slot.label + ' (vazio)';
			tile.innerHTML = `<span class="mo-slot-glifo">${RiIcones[slot.glifo] || ''}</span>`;
		}

		// Slot sem "col" e da fileira de fantasia (FANTASIA_SLOTS) -- os
		// ladrilhos sao IDENTICOS e ficam dentro de ".mo-painel-esq", entao
		// todos os gestos delegados la (equipar por arrasto, "x", menu de
		// contexto, tirar por arrasto) valem pra fantasia sem uma linha nova.
		const destino = slot.col === 'esq' ? colEsq : slot.col === 'dir' ? colDir : linhaFantasia;
		destino.appendChild(tile);
	});
}

function extractUrl(backgroundImage) {
	if (!backgroundImage) {
		return '';
	}
	const match = backgroundImage.match(/^url\((['"]?)(.*?)\1\)$/);
	return match ? match[2] : '';
}

/**
 * "x" de tirar -- delegado no container ".mo-painel-esq" (ver init()).
 */
function onClickPainelEsq(e) {
	const btn = e.target.closest('.mo-slot-remover');
	if (btn) {
		e.stopImmediatePropagation();
		const index = parseInt(btn.dataset.index, 10);
		if (!isNaN(index)) {
			tentarTirar(index, btn.closest('.mo-slot'));
		}
		return;
	}

	/*
	 * TOQUE NA PECA VESTIDA = o MESMO menu do botao direito (08/09/2026).
	 *
	 * A peca vestida so tinha DOIS caminhos, e os dois sao de mouse: passar o
	 * cursor (a dica com o selo "Equipado") e o botao direito (Tirar /
	 * Detalhes). No dedo nao existe nenhum dos dois — entao, no celular, o
	 * jogador nao tinha como abrir a ficha do que esta usando. E a mesma
	 * lacuna que D-938 fechou na GRADE, no mesmo arquivo, e que ficou de fora
	 * aqui porque o painel de slots so escutava o "x".
	 *
	 * So no dedo (`ehToque()`, lido na hora do evento): no mouse um clique
	 * simples no slot continua sem fazer nada.
	 */
	if (!ehToque()) {
		return;
	}
	const tile = e.target.closest('.mo-slot');
	if (!tile || !tile.classList.contains('is-ocupado')) {
		return;
	}
	e.preventDefault();
	e.stopImmediatePropagation();
	abrirMenuDoSlot(tile);
}

/**
 * Mesma regra de InventoryCommon.js:580-601 (getItemTab, nao exportada de
 * la) -- ver cabecalho do arquivo.
 */
function getItemTab(item) {
	switch (item.type) {
		case ItemType.HEALING:
		case ItemType.USABLE:
		case ItemType.DELAYCONSUME:
		case ItemType.CASH:
			return Inventory.getUI().TAB.USABLE;

		case ItemType.WEAPON:
		case ItemType.ARMOR:
		case ItemType.SHADOWGEAR:
		case ItemType.PETEGG:
		case ItemType.PETARMOR:
			return Inventory.getUI().TAB.EQUIP;

		default:
		case ItemType.ETC:
		case ItemType.CARD:
		case ItemType.AMMO:
			return Inventory.getUI().TAB.ETC;
	}
}

/**
 * Grade da aba ativa -- fonte real: Inventory.getUI().list (itens equipados
 * NAO aparecem ali, ja saem pra dentro de Equipment quando vestidos, ver
 * InventoryCommon.js:729-732 -- entao a grade nunca duplica um slot).
 *
 * RODADA 2 (19/08/2026, lacuna 1 do briefing): a grade e um RETICULO sempre
 * visivel -- celulas vazias sao desenhadas ate GRADE_CAPACIDADE (ou ate
 * completar a ultima fileira, se a mochila tiver mais itens que isso), nao
 * so as ocupadas. Antes disso a janela so desenhava os itens existentes
 * soltos numa area branca -- lia como lista, nao como mochila.
 */
function syncGrade() {
	const root = _root();
	const lista = Inventory.getUI().list.filter(item => getItemTab(item) === _abaAtiva);

	/*
	 * SO A QUANTIDADE MUDOU -> o numero muda NO LUGAR (05/10/2026, relato das
	 * flechas no celular; ver `municaoNaMochila.js`, item 3). Refazer a grade a
	 * cada flecha disparada trocava a celula debaixo do dedo entre o toque e o
	 * `click`, e o toque se perdia.
	 */
	const sig = assinaturasDaGrade(_abaAtiva, lista);
	const refazer = oQueRefazerNaGrade(_lastGradeSig, sig);
	if (refazer === 'nada') {
		return;
	}
	_lastGradeSig = sig;
	if (refazer === 'quantidade') {
		atualizarQuantidadesNaGrade(root.querySelector('.mo-grade'), lista);
		return;
	}

	// A celula sob o cursor esta prestes a deixar de existir: a dica ancorada
	// nela sai junto. O `mouseover` da celula NOVA a traz de volta no mesmo
	// quadro, sem o jogador mexer o mouse.
	esconderDica();

	const grade = root.querySelector('.mo-grade');
	grade.innerHTML = '';

	// Fecha sempre numa fileira cheia -- se a lista passar da capacidade
	// visivel, a grade cresce em multiplos de GRADE_COLS (nunca corta a
	// ultima fileira no meio) e ".mo-grade-host" (.ri-scroll) rola.
	const totalCelulas = Math.max(GRADE_CAPACIDADE, Math.ceil(lista.length / GRADE_COLS) * GRADE_COLS);

	for (let i = 0; i < totalCelulas; i++) {
		const item = lista[i];
		const cell = document.createElement('div');

		if (!item) {
			cell.className = 'ri-tile mo-item is-empty';
			grade.appendChild(cell);
			continue;
		}

		const it = DB.getItemInfo(item.ITID);

		cell.className = 'ri-tile mo-item';
		cell.dataset.index = String(item.index);
		// SEM `title` aqui de proposito (25/08/2026): o nome vem pela dica de
		// hover, e manter os dois faria o tooltip do navegador aparecer por
		// cima da dica um segundo depois, dizendo a mesma coisa duas vezes.
		// Arrastavel (equipar arrastando ate um slot) -- contrato global
		// _OBJ_DRAG_, ver onGradeDragStart.
		cell.draggable = true;

		// FANTASIA (26/08/2026): item de costume ganha o selo de brilho no
		// canto -- um chapeu de fantasia usa o MESMO icone do chapeu comum, e
		// sem selo o jogador equipa e nao entende por que o atributo nao veio
		// (a peca e so-visual). O criterio e a mascara de vestir do proprio
		// item (eDeFantasia, slotsDeFantasia.js), o mesmo dado que decide em
		// qual slot ela cai -- nada inventado.
		const locationDoItem = 'location' in item ? item.location : item.WearState;
		const eFantasia = eDeFantasia(locationDoItem);
		if (eFantasia) {
			cell.classList.add('is-fantasia');
		}

		if (item.travado) {
			cell.classList.add('is-travado');
		}

		const count = item.count || 1;
		cell.innerHTML =
			'<img class="mo-item-icone" alt="" />' +
			(count > 1 ? `<span class="mo-item-qtd">${count}</span>` : '') +
			(eFantasia ? `<span class="mo-item-fantasia" aria-hidden="true">${RiIcones.fantasia || ''}</span>` : '') +
			(item.travado
				? `<span class="mo-item-trava" aria-hidden="true" title="Travado contra venda">${RiIcones.cadeado || '🔒'}</span>`
				: '');

		const img = cell.querySelector('.mo-item-icone');
		setItemIcon(img, item, it);

		grade.appendChild(cell);
	}
}

/**
 * Icone do item: tenta /ragidle/item/<ITID>.png (outro builder publicando em
 * paralelo, ver cabecalho do arquivo); se faltar, cai pro caminho antigo do
 * cliente (mesmo que InventoryCommon.js ja usa).
 */
function setItemIcon(imgEl, item, it) {
	const resName = item.IsIdentified ? it.identifiedResourceName : it.unidentifiedResourceName;
	imgEl.onerror = () => {
		imgEl.onerror = null;
		Client.loadFile(DB.INTERFACE_PATH + 'item/' + resName + '.bmp', dataURI => {
			imgEl.src = dataURI;
		});
	};
	imgEl.src = `/ragidle/item/${item.ITID}.png`;
}

/**
 * Duplo-clique = usar/equipar, o MESMO Inventory.getUI().useItem(item) que o
 * dblclick nativo chama (InventoryCommon.js:249-254/910-951) -- decide
 * sozinho "usar" (consumivel) vs "pedir pra equipar" (arma/armadura
 * identificada e sem dano) pelo item.type, nenhuma logica nova aqui.
 */
function onDblClickItem(e) {
	const cell = e.target.closest('.mo-item');
	if (!cell) {
		return;
	}
	e.stopImmediatePropagation();
	const index = parseInt(cell.dataset.index, 10);
	const item = Inventory.getUI().getItemByIndex(index);
	if (item) {
		Inventory.getUI().useItem(item);
	}
}

/**
 * Botao direito na grade = MENU (ContextMenu.js generico, so lido, nao
 * editado -- ver cabecalho do arquivo, RODADA 4). Antes o botao direito
 * abria a descricao DIRETO; agora abre o menu, e "Detalhes" e quem abre a
 * descricao (mesma janela ItemInfo de sempre, contrato tecnico secao 5b).
 * Rotulo por aba: equipavel = Equipar, consumivel = Usar, sem acao real
 * (Diversos) = so Detalhes -- getItemTab() acima ja classifica certo.
 *
 * O CORPO foi extraido pra abrirMenuDoItem() (05/09/2026, frente de toque:
 * "sem clique direito e sem arraste obrigatorio"). Este handler so cuida do
 * evento de mouse (preventDefault/stopImmediatePropagation do contextmenu);
 * onClickItemGrade abaixo chama a MESMA funcao pro toque, pra nao existirem
 * duas montagens do mesmo menu envelhecendo em paralelo.
 */
function onContextMenuItem(e) {
	const cell = e.target.closest('.mo-item');
	if (!cell || cell.classList.contains('is-empty')) {
		return;
	}
	e.preventDefault();
	e.stopImmediatePropagation();
	abrirMenuDoItem(cell);
}

/**
 * TOQUE (05/09/2026, D-938 -- "sem clique direito e sem arraste obrigatorio,
 * todo fluxo tem caminho por toque"): um toque simples na celula abre o
 * MESMO menu do botao direito. O dedo nao tem "botao direito", e o
 * `contextmenu` sintetico de toque-longo e inconsistente entre navegadores
 * moveis -- por isso o caminho e um `click` normal, nao um gesto novo.
 *
 * SO no dedo (ehToque() acima, lido na hora do proprio evento): no mouse um
 * clique simples continua sem fazer nada -- dblclick usa/equipa
 * (onDblClickItem), botao direito abre o menu (onContextMenuItem acima),
 * exatamente como antes desta entrega. Isto SOMA um caminho, nao troca.
 */
function onClickItemGrade(e) {
	if (!ehToque()) {
		return;
	}
	const cell = e.target.closest('.mo-item');
	if (!cell || cell.classList.contains('is-empty')) {
		return;
	}
	e.preventDefault();
	e.stopImmediatePropagation();
	abrirMenuDoItem(cell);
}

/**
 * Monta o menu de um item da grade -- chamada pelos DOIS caminhos que abrem o
 * MESMO menu (botao direito no mouse via onContextMenuItem, toque simples no
 * dedo via onClickItemGrade, ambos acima). Uma unica montagem, nunca duas.
 */
function abrirMenuDoItem(cell) {
	const index = parseInt(cell.dataset.index, 10);
	const item = Inventory.getUI().getItemByIndex(index);
	if (!item) {
		return;
	}

	const TAB = Inventory.getUI().TAB;
	const tab = getItemTab(item);

	ContextMenu.remove();
	ContextMenu.append();

	/*
	 * "GUARDAR NO ARMAZEM" (26/09/2026) — o caminho por menu do deposito, que
	 * so existia por arrasto (ver o bloco "O SENTIDO CONTRARIO" em
	 * `retiradaDoArmazem.js`). Aparece so com o armazem aberto, em primeiro
	 * lugar porque e o que a pessoa veio fazer, nos DOIS caminhos (mouse e
	 * toque), como o "Retirar" do outro lado.
	 */
	if (armazemAberto(Storage.getUI())) {
		ContextMenu.addElement('Guardar no armazém', () => pedirDeposito(item));
		ContextMenu.nextGroup();
	}

	/*
	 * "POR NO CARRINHO" (D-1848) — o caminho por menu da guarda no carrinho,
	 * que so existia por arrasto (e o arrasto estava morto, ver
	 * `transferenciaDoCarrinho.js`). Aparece SEMPRE que o personagem tem
	 * carrinho, e nao so com a janela dele aberta: no celular em pe e uma
	 * janela por vez, entao exigir o carrinho aberto tornaria o gesto
	 * impossivel justamente la. Peca vestida nao mora na grade, e o servidor
	 * recusa de todo jeito (`item.equip`).
	 */
	if (temCarrinho(Session.Entity)) {
		ContextMenu.addElement('Pôr no carrinho', () => pedirParaCarrinho(item));
		ContextMenu.nextGroup();
	}

	const acao = acaoPrincipalDoItem(item, tab, TAB, mascaraVestidaDoIndice(String(item.index)));
	if (acao === 'equipar') {
		ContextMenu.addElement('Equipar', () => {
			const location = 'location' in item ? item.location : item.WearState;
			tentarEquipar(item, location);
		});
		ContextMenu.nextGroup();
	} else if (acao === 'equipar-municao') {
		/*
		 * A FLECHA GANHA O "EQUIPAR" DE UM TOQUE (05/10/2026, relato de jogador:
		 * *"poderia ter so uma opcao de 'equipar' igual os equips normais"*). A
		 * municao mora na aba Diversos, e ate aqui so a aba Equipar tinha o
		 * rotulo; no dedo o unico caminho era o duplo toque, que o proprio menu
		 * engolia. O porque inteiro esta em `municaoNaMochila.js`.
		 */
		ContextMenu.addElement('Equipar', () => {
			tentarEquipar(item, mascaraDaMunicao(item));
		});
		ContextMenu.nextGroup();
	} else if (acao === 'usar') {
		ContextMenu.addElement('Usar', () => {
			Inventory.getUI().useItem(item);
		});
		ContextMenu.nextGroup();
	} else if (acao === 'encaixar') {
		/*
		 * "ENCAIXAR EM..." (04/10/2026, relato de 03/10: "nem a opcao de por carta
		 * no item" no celular). O UNICO caminho ate o encaixe era o DUPLO-CLIQUE
		 * (onDblClickItem -> useItem -> onUseCard), e no dedo o toque abre este
		 * menu, que para carta so tinha "Por na barra"/"Detalhes". O item e o
		 * MESMO useItem do duplo-clique: o servidor manda a lista so das pecas
		 * que aceitam a carta (slot livre, tipo certo, guardada) e explica a
		 * recusa quando nao ha nenhuma.
		 *
		 * No dedo a Mochila fecha antes, pelo motivo do "Por na barra" abaixo: ela
		 * e painel de tela cheia (D-932) e a janela de escolha nasceria ATRAS dela.
		 */
		ContextMenu.addElement('Encaixar em…', () => {
			if (ehToque()) {
				MochilaIdle.toggle();
			}
			Inventory.getUI().useItem(item);
		});
		ContextMenu.nextGroup();
	}

	/*
	 * "POR NA BARRA" (05/09/2026, D-938) -- o caminho por TOQUE ate a barra de
	 * atalhos, ver UI/toqueParaAtalho.js pro raciocinio inteiro (pegar-e-por,
	 * nao polifill de arrasto HTML5, que nao existe no toque). O payload e
	 * EXATAMENTE o que onGradeDragStart ja monta pro arrasto nativo (mesmo
	 * `{type:'item', from:'Inventory', data:item}`), so com `rotulo` a mais --
	 * a MESMA chamada DB.getItemName({showItemOptions:false}) que
	 * mostrarDicaItem() ja usa pro nome da dica, sem inventar um segundo
	 * criterio de "nome do item".
	 *
	 * Aparece nos DOIS caminhos (mouse e toque) de proposito: no mouse
	 * continua sendo um atalho legitimo pra quem prefere menu a arrastar, nao
	 * um botao exclusivo de celular.
	 *
	 * SEM filtro por aba de proposito: o `case 'Inventory'` de onDrop em
	 * ShortCut.js (so lido, nao editado) so exige um ITID que resolva de
	 * volta no inventario -- o MESMO `item` que getItemByIndex ja garantiu
	 * aqui em cima. Nenhum dos tres tabs (Consumiveis/Equipar/Diversos) fica
	 * de fora.
	 */
	ContextMenu.addElement('Pôr na barra', () => {
		pegar({
			type: 'item',
			from: 'Inventory',
			data: item,
			rotulo: DB.getItemName(item, { showItemOptions: false })
		});
		/*
		 * NO DEDO, ARMAR FECHA A MOCHILA — e isto nao e conveniencia.
		 *
		 * Em tela estreita esta janela vira PAINEL DE TELA CHEIA (D-932) e
		 * cobre a barra de atalhos. A prova do jogo real reprovou exatamente
		 * aqui: o item foi para a mao, o rotulo mandou "toque num espaco da
		 * barra", e a barra estava DEBAIXO da mochila -- o toque no slot
		 * expirou porque o slot nao recebia evento nenhum. Mandar o jogador
		 * tocar no que ele nao pode ver e pior do que nao ter o caminho.
		 *
		 * So no dedo: no mouse a janela nao cobre a barra, e fechar a mochila
		 * de quem so queria armar um atalho seria tirar da tela o que ele
		 * ainda esta usando.
		 */
		if (ehToque()) {
			MochilaIdle.toggle();
		}
	});
	ContextMenu.nextGroup();

	/*
	 * TRAVA CONTRA VENDA (R14/C2-3, 14/09/2026). So o ROTULO troca (Travar
	 * <-> Destravar); a acao de verdade e' `pedirAlternarTrava`, logo abaixo.
	 *
	 * ESTE COMENTARIO AFIRMAVA O CONTRARIO ATE 18/09/2026, e a frase dele era
	 * uma armadilha: dizia que `pedirAlternarTrava` *"hoje so AVISA (console)
	 * em vez de mandar o pacote"* porque os opcodes colidiriam com um recurso
	 * em producao. Isso descrevia o par ANTIGO (0x0fc7/0x0fc8, que colidia com
	 * o autocompletar de comandos); o par final 0x0fc0/0x0fc1 entrou, a funcao
	 * manda o pacote de verdade, e o cadeado esta fiado ponta a ponta — com
	 * recusa no SERVIDOR (`podeVender`, servidor/itens.ts:1841), nas tres
	 * portas de venda. O comentario ficou para tras e passou a descrever um
	 * mundo que nao existe, com a autoridade de estar datado e assinado.
	 */
	ContextMenu.addElement(item.travado ? 'Destravar' : 'Travar', () => {
		pedirAlternarTrava(item.index);
	});
	ContextMenu.nextGroup();

	ContextMenu.addElement('Detalhes', () => {
		abrirDetalhes(item);
	});
}

/**
 * Por no carrinho (D-1848) — o MESMO pedido do arrasto ate a janela do
 * carrinho (`reqMoveItemToCart`, o `onDrop` de CartItems.js), com a MESMA
 * caixa de quantidade. A pilha abre com o maximo que cabe no peso livre do
 * CARRINHO (a regra R17/C2-6 da retirada do armazem, com o teto de quem
 * recebe), e digitar mais do que cabe AVISA em vez de sumir calado.
 */
function pedirParaCarrinho(item) {
	const total = item.count || 1;
	if (total > 1) {
		const pesoUnit = typeof item.weight === 'number' ? item.weight : pesoDeItem(item.ITID);
		const livre = pesoLivreDoCarrinho(CartItems.info);
		const tetoDoPeso = livre === null ? null : tetoPeloPeso(livre, pesoUnit);
		const padrao = quantidadePadraoDaRetirada(total, tetoDoPeso);

		InputBox.append();
		InputBox.setType('number', false, padrao);
		InputBox.onSubmitRequest = function OnSubmitRequest(count) {
			InputBox.remove();
			const quantos = quantidadeDaRetirada(count, total, tetoDoPeso);
			if (quantos === null) {
				const teto = tetoDoPeso === null ? total : Math.min(total, tetoDoPeso);
				mostrarAviso(textoDaQuantidadeRecusada(teto, 'carrinho'));
				return;
			}
			Inventory.getUI().reqMoveItemToCart(item.index, quantos);
		};
		return;
	}
	Inventory.getUI().reqMoveItemToCart(item.index, 1);
}

/**
 * Guardar no armazem — o MESMO pedido do arrasto (`reqAddItem`, o `onDrop` de
 * StorageCommon.js), com a MESMA caixa de quantidade. A pilha abre preenchida
 * com o total: confirmar direto guarda tudo, que e o gesto mais comum.
 */
function pedirDeposito(item) {
	const total = item.count || 1;
	if (total > 1) {
		InputBox.append();
		InputBox.setType('number', false, total);
		InputBox.onSubmitRequest = function OnSubmitRequest(count) {
			InputBox.remove();
			const quantos = quantidadeDoDeposito(count, total);
			if (quantos !== null) {
				Storage.reqAddItem(item.index, quantos);
			}
		};
		return;
	}
	Storage.reqAddItem(item.index, 1);
}

/**
 * PEDE A TROCA DA TRAVA AO SERVIDOR (R14/C2-3, 14/09/2026).
 *
 * Contrato v1: `CZ_RAGIDLE_TRAVA_ACAO` = 0x0fc0, JSON `{acao:'alternar',
 * slot}`; a resposta e' `ZC_RAGIDLE_TRAVAS` = 0x0fc1, JSON `{v:1, travados:
 * number[], recusa?}`, aplicada via `Inventory.getUI().aplicarTravas(travados)`
 * (InventoryCommon.js) — o handler mora em MapEngine/Item.js, junto dos
 * outros pacotes de inventario, para valer em QUALQUER janela que leia
 * `item.travado` (MochilaIdle, NpcStoreV2/V1), nao so' nesta.
 *
 * O PAR FINAL (0x0fc0/0x0fc1) foi confirmado pelo SENIOR-C depois de a
 * primeira tentativa (0x0fc7/0x0fc8) colidir com
 * `CZ_RAGIDLE_COMANDOS_ACAO`/`ZC_RAGIDLE_COMANDOS` (o autocompletar de
 * comandos do chat, ja em producao) — ver o comentario deles em
 * `Network/PacketStructure.js`.
 */
function pedirAlternarTrava(index) {
	const pkt = new PACKET.CZ.RAGIDLE_TRAVA_ACAO();
	pkt.json = JSON.stringify({ acao: 'alternar', slot: index });
	Network.sendPacket(pkt);
}

/**
 * Pede o estado INTEIRO da trava — chamado ao ABRIR a mochila
 * (`MochilaIdle.onAppend`), mesmo padrao de `requestFavoritos` no Mapa de
 * Caca: pedir ao abrir a janela relevante, nunca presumir estado.
 */
function pedirTravas() {
	const pkt = new PACKET.CZ.RAGIDLE_TRAVA_ACAO();
	pkt.json = JSON.stringify({ acao: 'pedir' });
	Network.sendPacket(pkt);
}

/**
 * Botao direito numa peca VESTIDA = Tirar + Detalhes (secao 2 do pedido).
 * "Detalhes" aqui NAO tem o item completo a mao (so o DOM do host Equipment
 * escondido tem nome/icone, sem ITID -- mesma limitacao documentada no
 * cabecalho do arquivo pra syncEquipSlots) -- entao dispara um contextmenu
 * SINTETICO no proprio <div class="item"> do host nativo escondido, que
 * ainda tem o listener REAL (onEquipmentInfo, EquipmentCommon.js:238-241)
 * escutando -- o mesmo caminho que abriria se a janela nativa estivesse
 * visivel, sem duplicar a logica de achar o item por indice (fica presa no
 * closure _list de la, nunca foi exposta).
 */
function onContextMenuSlot(e) {
	const tile = e.target.closest('.mo-slot');
	if (!tile || !tile.classList.contains('is-ocupado')) {
		return;
	}
	e.preventDefault();
	e.stopImmediatePropagation();
	abrirMenuDoSlot(tile);
}

/**
 * Monta o menu de uma peca VESTIDA -- chamada pelos DOIS caminhos que abrem o
 * MESMO menu (botao direito no mouse, toque simples no dedo). Uma unica
 * montagem, nunca duas -- o mesmo desenho de `abrirMenuDoItem` na grade.
 */
function abrirMenuDoSlot(tile) {
	const index = parseInt(tile.dataset.index, 10);
	if (isNaN(index)) {
		return;
	}

	ContextMenu.remove();
	ContextMenu.append();
	ContextMenu.addElement('Tirar', () => {
		tentarTirar(index, tile);
	});
	ContextMenu.nextGroup();
	ContextMenu.addElement('Detalhes', () => {
		abrirDetalhesEquipado(index);
	});
}

/**
 * Descricao de um item da mochila -- ItemInfo, contrato tecnico secao 5b.
 */
/**
 * O índice cuja comparação está no ar. A resposta chega assíncrona e a ficha
 * pode ter trocado de item no meio — só o payload do índice PEDIDO entra na
 * janela; o resto é resposta órfã e morre calada.
 */
let _indiceComparado = null;

function abrirDetalhes(item) {
	if (ItemInfo.uid === item.ITID) {
		ItemInfo.remove();
		if (ItemCompare.ui) {
			ItemCompare.remove();
		}
		return;
	}
	ItemInfo.append();
	ItemInfo.uid = item.ITID;
	ItemInfo.setItem(item);

	/*
	 * A COMPARAÇÃO COM O EQUIPADO (08/09/2026, pedido do alfa) — só para
	 * EQUIPÁVEL que não está no corpo: comparar a peça vestida com ela mesma
	 * não diz nada, e consumível não tem espaço correspondente.
	 *
	 * Duas metades, duas fontes:
	 *  1. o LADO A LADO usa a estrutura que o cliente já tinha (ItemCompare —
	 *     a ficha do item equipado no espaço correspondente, aberta ao lado);
	 *  2. a DIFERENÇA numérica vem do SERVIDOR (`CZ_RAGIDLE_ITEM_ACAO`), que
	 *     calcula com a mesma régua da janela de status. A janela nunca
	 *     recalcula — duas contas para a mesma pergunta divergem um dia.
	 */
	if (ItemCompare.ui) {
		ItemCompare.remove();
	}
	_indiceComparado = null;
	const vestivel = typeof item.location === 'number' && item.location !== 0;
	const jaNoCorpo = typeof item.WearState === 'number' && item.WearState !== 0;
	if (!vestivel || jaNoCorpo) {
		return;
	}

	const equipado = Equipment.getUI().isInEquipList(item.location);
	if (equipado) {
		ItemCompare.prepare();
		ItemCompare.append();
		ItemCompare.uid = equipado.ITID;
		ItemCompare.setItem(equipado);
	}

	_indiceComparado = item.index;
	const pkt = new PACKET.CZ.RAGIDLE_ITEM_ACAO();
	pkt.json = JSON.stringify({ acao: 'comparar', indice: item.index });
	Network.sendPacket(pkt);
}

/**
 * A resposta do servidor com o veredito da troca — desenhada DENTRO da ficha
 * (ItemInfo.setComparacao), que é onde o jogador está olhando.
 */
function aoChegarComparacao(pkt) {
	let dados;
	try {
		dados = JSON.parse(pkt.json);
	} catch (_erro) {
		return;
	}
	// O bônus do refino (D-1516) volta no MESMO pacote: a ficha decide se
	// ainda é a peça aberta.
	if (dados && dados.acao === 'refino') {
		ItemInfo.receberRefino(dados);
		return;
	}
	if (!dados || dados.acao !== 'comparar' || dados.indice !== _indiceComparado) {
		return;
	}
	if (ItemInfo.uid === -1) {
		return; // a ficha fechou antes de a resposta chegar
	}
	ItemInfo.setComparacao(htmlDaComparacao(dados, escapeHTML));
}

/**
 * Descricao de uma peca VESTIDA -- ver onContextMenuSlot acima pro motivo do
 * evento sintetico (nao ha ITID disponivel por fora do host escondido).
 */
function abrirDetalhesEquipado(index) {
	const equipRoot = Equipment.getUI().getRoot();
	if (!equipRoot) {
		return;
	}
	const itemDiv = equipRoot.querySelector(`.item[data-index="${index}"]`);
	if (!itemDiv) {
		return;
	}
	const evt = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
	itemDiv.dispatchEvent(evt);

	/*
	 * O SELO VAI JUNTO PARA A FICHA (08/09/2026).
	 *
	 * A dica de hover diz "Equipado — Arma", e no dedo nao ha hover: sem isto,
	 * o jogador de celular abre a ficha da peca que esta usando e ela nao diz
	 * que esta em uso. A janela e a MESMA nos dois aparelhos, entao o selo
	 * mora nela e serve aos dois.
	 *
	 * O despacho acima e SINCRONO: quando ele volta, `ItemInfo.setItem` ja
	 * rodou (e ja limpou o selo anterior), e este e o momento de por o novo.
	 */
	const espaco = rotuloDoEspacoEquipado(mascaraVestidaDoIndice(String(index)), EQUIP_SLOTS);
	if (espaco && typeof ItemInfo.setVestido === 'function') {
		ItemInfo.setVestido(`Equipado - ${espaco}`);
	}
}

/**
 * ── Arrastar: grade -> slot (equipar) ─────────────────────────────────────
 * Fonte: dragstart na celula da grade. Escreve o contrato global
 * window._OBJ_DRAG_ = {type:'item', from:'Inventory', data:item} + o mesmo
 * JSON em dataTransfer 'Text' -- MOLDE EXATO de InventoryCommon.js:1214-1241
 * (so lido, nao editado), pra interoperar de graca com Armazem/Carrinho/
 * Correio/Atalhos.
 */
function onGradeDragStart(e) {
	const cell = e.target.closest('.mo-item');
	if (!cell || cell.classList.contains('is-empty')) {
		return;
	}
	const index = parseInt(cell.dataset.index, 10);
	const item = Inventory.getUI().getItemByIndex(index);
	if (!item) {
		return;
	}

	const img = new Image();
	const iconEl = cell.querySelector('.mo-item-icone');
	img.decoding = 'async';
	img.src = (iconEl && iconEl.src) || '';
	e.dataTransfer.setDragImage(img, 12, 12);
	e.dataTransfer.setData(
		'Text',
		JSON.stringify(
			(window._OBJ_DRAG_ = {
				type: 'item',
				from: 'Inventory',
				data: item
			})
		)
	);
}

function onGradeDragEnd() {
	delete window._OBJ_DRAG_;
	limparRealceSlots();
}

/**
 * Alvo: dragover/drop no painel esquerdo. So aceita (preventDefault) no
 * slot cujo bitmask casa com item.location -- nada nos incompativeis (a
 * ausencia do preventDefault ja impede o drop ali, sem precisar de mais
 * nada). Realce visual (".is-drop-alvo") SO no slot valido.
 */
function onPainelEsqDragOver(e) {
	const tile = e.target.closest('.mo-slot');
	const data = window._OBJ_DRAG_;
	if (!tile || !data || data.type !== 'item') {
		return;
	}
	const item = data.data;
	const location = 'location' in item ? item.location : item.WearState;
	const slotLoc = parseInt(tile.dataset.location, 10);
	if (!location || (location & slotLoc) === 0) {
		return;
	}
	e.preventDefault();
	e.stopImmediatePropagation();
	if (!tile.classList.contains('is-drop-alvo')) {
		limparRealceSlots();
		tile.classList.add('is-drop-alvo');
	}
}

function onPainelEsqDragLeave(e) {
	const tile = e.target.closest('.mo-slot');
	if (tile && !tile.contains(e.relatedTarget)) {
		tile.classList.remove('is-drop-alvo');
	}
}

function onPainelEsqDrop(e) {
	const tile = e.target.closest('.mo-slot');
	if (!tile) {
		return;
	}
	e.preventDefault();
	e.stopImmediatePropagation();
	tile.classList.remove('is-drop-alvo');

	let data;
	try {
		data = JSON.parse(e.dataTransfer.getData('Text'));
	} catch (_e) {
		return;
	}
	if (!data || data.type !== 'item') {
		return;
	}
	const item = data.data;
	const location = 'location' in item ? item.location : item.WearState;
	const slotLoc = parseInt(tile.dataset.location, 10);
	if (!location || (location & slotLoc) === 0) {
		return;
	}
	/*
	 * SO O LADO DO SLOT ONDE O ITEM FOI SOLTO (10/09/2026).
	 *
	 * Mandar a mascara inteira deixava o servidor escolher o lado: o acessorio
	 * solto no slot da ESQUERDA ia para o da direita se ele estivesse livre. No
	 * rAthena o lado pedido vence (`pc_equipitem`, pc.cpp:12088-12107: `pos =
	 * req_pos & EQP_ACC`), e e o mesmo caminho que deixa o Assassino por uma
	 * adaga na mao esquerda. Peca que ocupa mais de um slot (arma de duas maos,
	 * chapeu de dois andares) continua inteira: o servidor so estreita acessorio
	 * e arma de mao, e o pedido aqui e sempre um pedaco da propria mascara. O
	 * "Equipar" do menu segue mandando a mascara inteira, e ai o servidor escolhe
	 * o lado livre, como o duplo clique do cliente oficial.
	 */
	tentarEquipar(item, location & slotLoc);
}

/**
 * ── Arrastar: slot -> grade (tirar) ───────────────────────────────────────
 * Fonte: dragstart num slot OCUPADO. Nao usa o _OBJ_DRAG_ global (essa
 * direcao nao precisa interoperar com outras janelas, so com esta grade) --
 * so guarda o indice localmente.
 */
function onSlotDragStart(e) {
	const tile = e.target.closest('.mo-slot');
	if (!tile || !tile.classList.contains('is-ocupado')) {
		return;
	}
	const index = parseInt(tile.dataset.index, 10);
	if (isNaN(index)) {
		return;
	}
	_dragUnequipIndex = index;
	e.dataTransfer.setData('Text', JSON.stringify({ type: 'mochila-tirar', index }));
}

function onSlotDragEnd() {
	_dragUnequipIndex = null;
	limparRealceSlots();
}

function onGradeDragOver(e) {
	if (_dragUnequipIndex == null && !ehArrastoVindoDoArmazem() && !ehArrastoDoCarrinho(window._OBJ_DRAG_)) {
		return;
	}
	e.preventDefault();
	e.stopImmediatePropagation();
}

function onGradeDrop(e) {
	/*
	 * ── Armazem -> grade (retirar), D-991 ─────────────────────────────────
	 * Esta grade E o inventario do jogo, mas a janela NATIVA de inventario --
	 * a unica que o armazem sabia usar como alvo de drop
	 * (InventoryCommon.js:1125) -- fica em `display:none` permanente por
	 * `hideNativeHosts()` aqui deste arquivo. Sem este ramo, arrastar do
	 * armazem para a mochila nao tinha alvo nenhum: o item voltava e o
	 * jogador nao conseguia tirar nada.
	 *
	 * O payload e o contrato global `_OBJ_DRAG_` que StorageCommon.js ja
	 * escreve no `dragstart` dele (`{type:'item', from:'Storage', data:item}`)
	 * -- o MESMO que a janela nativa lia. Nada de novo no fio.
	 */
	if (_dragUnequipIndex == null) {
		/*
		 * ── Carrinho -> grade (tirar), D-1848 ───────────────────────────────
		 * A mesma pedra do armazem: a janela nativa de inventario, o unico
		 * alvo que o carrinho conhecia, fica escondida para sempre. O payload
		 * e o `_OBJ_DRAG_` que o `dragstart` do carrinho escreve.
		 */
		const doCarrinho = itemDoArrastoDoCarrinho(e);
		if (doCarrinho) {
			e.preventDefault();
			e.stopImmediatePropagation();
			CartItems.pedirParaMochila(doCarrinho);
			return;
		}
		const doArmazem = itemDoArrastoDoArmazem(e);
		if (!doArmazem) {
			return;
		}
		e.preventDefault();
		e.stopImmediatePropagation();
		retirarDoArmazem(doArmazem);
		return;
	}

	e.preventDefault();
	e.stopImmediatePropagation();
	const index = _dragUnequipIndex;
	_dragUnequipIndex = null;

	const tile = _root().querySelector(`.mo-slot[data-index="${index}"]`);
	tentarTirar(index, tile);
}

/**
 * O arrasto em curso vem do armazem? Lido do `_OBJ_DRAG_` global porque no
 * `dragover` o `dataTransfer` ainda nao entrega o texto (so no `drop`), e sem
 * o `preventDefault` do dragover o navegador nem dispara o `drop`.
 */
function ehArrastoVindoDoArmazem() {
	return ehArrastoDoArmazem(window._OBJ_DRAG_);
}

/** O item do carrinho que caiu na grade, ou null se o drop foi de outra coisa. */
function itemDoArrastoDoCarrinho(e) {
	let data;
	try {
		data = JSON.parse(e.dataTransfer.getData('Text'));
	} catch (_e) {
		return null;
	}
	return ehArrastoDoCarrinho(data) ? data.data : null;
}

/** O item do armazem que caiu na grade, ou null se o drop foi de outra coisa. */
function itemDoArrastoDoArmazem(e) {
	let data;
	try {
		data = JSON.parse(e.dataTransfer.getData('Text'));
	} catch (_e) {
		return null;
	}
	if (!ehArrastoDoArmazem(data)) {
		return null;
	}
	return data.data;
}

/**
 * Pede a retirada. Pilha de mais de um pergunta quanto, pelo MESMO InputBox
 * que a janela nativa usava para este gesto (InventoryCommon.js:1128-1140).
 *
 * R17/C2-6 (14/09/2026): mesmo conserto de `StorageCommon.js#pedirRetirada`
 * (o outro caminho ate o mesmo gesto — este e' o do arrasto). O campo nasce
 * preenchido com a maior quantidade que cabe no peso restante, e o mesmo
 * teto entra na confirmacao.
 */
function retirarDoArmazem(item) {
	const total = item.count || 1;

	if (total > 1) {
		const pesoUnit = typeof item.weight === 'number' ? item.weight : pesoDeItem(item.ITID);
		const pesoLivre = Session.Entity ? (Session.Entity.max_weight || 0) - (Session.Entity.weight || 0) : 0;
		const tetoDoPeso = tetoPeloPeso(pesoLivre, pesoUnit);
		const padrao = quantidadePadraoDaRetirada(total, tetoDoPeso);

		InputBox.append();
		InputBox.setType('number', false, padrao);
		InputBox.onSubmitRequest = function OnSubmitRequest(count) {
			InputBox.remove();
			const quantos = quantidadeDaRetirada(count, total, tetoDoPeso);
			if (quantos !== null) {
				Storage.reqRemoveItem(item.index, quantos);
			}
		};
		return;
	}

	Storage.reqRemoveItem(item.index, 1);
}

function limparRealceSlots() {
	const root = _root();
	root.querySelectorAll('.mo-slot.is-drop-alvo').forEach(el => el.classList.remove('is-drop-alvo'));
}

/**
 * ── Recusa do servidor (fase 1: peca com refino ou carta nao troca nem
 * tira, servidor-mapa.ts ~5789-5860) -- ver a nota grande no cabecalho do
 * arquivo pro raciocinio completo de por que isso NAO hooka o handler
 * nativo. Duas camadas:
 *   1) PREDICAO: se o selo de refino ("+N", ja desenhado por syncEquipSlots)
 *      aparece na peca que a acao afeta, o servidor SEMPRE recusa -- avisa
 *      na hora, sem esperar rede.
 *   2) FALLBACK por ausencia de mudanca: se nao tinha selo (entao nao dava
 *      pra prever), confere depois de RECUSA_DELAY_MS se o indice mudou de
 *      lugar. Se nao mudou, avisa de forma honesta (pode ser carta, nivel
 *      ou classe -- nao so refino).
 */
/**
 * O NOME mais a DESCRIÇÃO do cliente (28/08/2026, queixa do dono: *"não
 * visualiza detalhes do item ao passar mouse em cima"*).
 *
 * A dica mostrava só o nome. A descrição já existia — `DB.getItemInfo()` a
 * carrega do `itemInfo` do cliente instalado, que é a MESMA fonte que a janela
 * nativa usa. Faltava lê-la aqui.
 *
 * **Cortada em `MAX_LINHAS_DA_DICA`.** Algumas descrições do RO passam de trinta
 * linhas, e uma dica mais alta que a janela deixa de ser dica.
 */
const MAX_LINHAS_DA_DICA = 14;

/**
 * As LINHAS da descrição, prontas pra dica: tira as marcas `^RRGGBB` (não
 * significam nada fora do cliente nativo, viram lixo se ficarem) e corta em
 * `MAX_LINHAS_DA_DICA`. Extraído de `comDescricao()` (31/08/2026, sistema de
 * Runas) para virar HTML estruturado em vez de um texto único com `\n` —
 * `renderCorpoDaDescricao()` abaixo é quem decide, LINHA a LINHA, o que
 * entra (hoje: só ficha "Rótulo: valor").
 */
function descricaoLinhas(item) {
	const id = item.ITID !== undefined ? item.ITID : item.nameid;
	const info = id !== undefined ? DB.getItemInfo(id) : null;
	const bruta = info && info.identifiedDescriptionName ? info.identifiedDescriptionName : '';
	if (!bruta) {
		return [];
	}
	const linhas = String(bruta)
		.replace(/\^[0-9a-fA-F]{6}/g, '')
		.split('\n')
		.map(l => l.trim())
		.filter(l => l.length > 0);
	if (linhas.length === 0) {
		return [];
	}
	const cortadas = linhas.slice(0, MAX_LINHAS_DA_DICA);
	if (linhas.length > MAX_LINHAS_DA_DICA) {
		cortadas.push('...');
	}
	return cortadas;
}

/** Linha de FICHA: "Rótulo curto: valor" — o mesmo formato ("Weight: 10",
 * "Class: Weapon"...) que a descrição nativa do RO já usa; o rótulo tem até
 * 28 caracteres para não confundir uma frase corrida com dois-pontos no meio
 * (ex.: um lore de item) com uma ficha de verdade. */
const RE_LINHA_FICHA = /^([^:]{1,28}):\s(.+)$/;

/**
 * O CORPO da dica rica: SÓ as linhas de ficha (rótulo mudo + valor). O texto
 * corrido — o lore ("Um porrete robusto...") e o destaque ("Indestrutível em
 * batalha.") — SAIU da dica a pedido do dono (31/08/2026, mesma noite da
 * entrega): no hover ele era ruído entre o nome e os números; a descrição
 * completa continua na janela de Detalhes, que é o lugar dela. Todo texto
 * passa por `escapeHTML` (Utils/ItemOptionsView.js) antes do `innerHTML`.
 */
function renderCorpoDaDescricao(linhas) {
	return linhas
		.map(linha => {
			const ficha = linha.match(RE_LINHA_FICHA);
			if (!ficha) {
				return '';
			}
			return (
				'<div class="mo-dica-ficha">' +
				`<span class="mo-dica-rotulo">${escapeHTML(ficha[1])}:</span> ` +
				escapeHTML(ficha[2]) +
				'</div>'
			);
		})
		.join('');
}

/**
 * A dica de TEXTO (reserva) de um item pelo índice do inventário — só
 * usada como `data-dica` de segurança em `syncEquipSlots` (ver ali). O hover
 * DE VERDADE num slot vestido usa `mostrarDicaItem()` (rico, com o item
 * resolvido na hora); isto só entra se o índice não resolver mais no
 * instante do hover (item trocado entre o desenho do slot e o mouse chegar).
 */
/**
 * O ITEM DE UM INDICE -- mochila OU corpo.
 *
 * A PECA VESTIDA NAO ESTA EM `Inventory.list` (`countLabel()` soma
 * `list.length + Equipment.getUI().getNumber()`, InventoryCommon.js: sao duas
 * listas, nao uma). Quem pergunta so ao inventario recebe `null` de tudo o que
 * o jogador esta usando -- e foi assim que a dica do slot caiu no formato de
 * TEXTO simples, sem o selo "Equipado", na sonda de tela de 08/09/2026.
 */
function itemDoIndice(indice) {
	const idx = parseInt(indice, 10);
	const daMochila = Inventory.getUI().getItemByIndex(idx);
	if (daMochila) {
		return daMochila;
	}
	const vestidos = Equipment.getUI().getEquippedList ? Equipment.getUI().getEquippedList() : [];
	return vestidos.find(it => it.index === idx) || null;
}

/**
 * A MASCARA DOS ESPACOS QUE ESTE INDICE OCUPA AGORA, lida dos proprios
 * ladrilhos.
 *
 * O `WearState` do objeto so e confiavel na lista que veio do servidor no
 * login; uma peca vestida DURANTE a sessao chega a `Equipment.equip()` com a
 * mascara de onde ela PODE ir. Os ladrilhos, ao contrario, sao construidos a
 * partir de onde a Equipment nativa REALMENTE pos a peca -- entao a arma de
 * duas maos aparece nos dois ladrilhos e o OU deles e a verdade da tela.
 */
function mascaraVestidaDoIndice(indice) {
	const root = _root();
	if (!root || !indice) {
		return 0;
	}
	let mascara = 0;
	root.querySelectorAll(`.mo-slot.is-ocupado[data-index="${indice}"]`).forEach(tile => {
		mascara |= parseInt(tile.dataset.location, 10) || 0;
	});
	return mascara;
}

function dicaDoItemNoIndice(indice) {
	const item = itemDoIndice(indice);
	if (!item) {
		return '';
	}
	// O MESMO corte da dica rica (31/08/2026): so as linhas de ficha — o texto
	// corrido saiu da dica a pedido do dono, e a reserva nao pode dizer mais
	// que a titular.
	const linhas = descricaoLinhas(item).filter(l => RE_LINHA_FICHA.test(l));
	return linhas.length ? DB.getItemName(item) + '\n' + linhas.join('\n') : DB.getItemName(item);
}

/**
 * A DICA DE HOVER: o que está sob o cursor.
 *
 * Dois formatos, nunca misturados na mesma dica:
 *   - RICO (cabeçalho com arte + nome, corpo da descrição, Runas) para um
 *     item de verdade — grade (`.mo-item`) ou slot VESTIDO
 *     (`.mo-slot.is-ocupado`), os dois casos em que dá pra resolver o objeto
 *     completo por `Inventory.getUI().getItemByIndex()`;
 *   - TEXTO simples (`el.dataset.dica`) para os tooltips que são só rótulo:
 *     slot vazio e o botão "Tirar" — não há item nenhum ali, só uma palavra.
 */
function onHoverEntra(e) {
	const el = e.target.closest('.mo-slot-remover, .mo-item, .mo-slot');
	if (!el) {
		return;
	}

	if (el.classList.contains('mo-item') && !el.classList.contains('is-empty')) {
		const item = Inventory.getUI().getItemByIndex(parseInt(el.dataset.index, 10));
		if (item) {
			mostrarDicaItem(el, item);
			return;
		}
	} else if (el.classList.contains('mo-slot') && el.classList.contains('is-ocupado')) {
		const item = itemDoIndice(el.dataset.index);
		if (item) {
			mostrarDicaItem(el, item, mascaraVestidaDoIndice(el.dataset.index));
			return;
		}
	}

	const texto = el.dataset.dica || '';
	if (!texto) {
		esconderDica();
		return;
	}
	mostrarDicaTexto(el, texto);
}

function onHoverSai(e) {
	const el = e.target.closest('.mo-slot-remover, .mo-item, .mo-slot');
	if (!el) {
		return;
	}
	// `relatedTarget` dentro da MESMA celula (o icone, o contador, o botao
	// de tirar) nao e saida: sem esta guarda a dica pisca ao atravessar os
	// filhos, que e o defeito classico do hover delegado.
	const indo = e.relatedTarget;
	if (indo && el.contains(indo)) {
		return;
	}
	esconderDica();
}

/**
 * A CONTA de onde a dica nasce mora em `posicaoDaDica.js` (medida sem DOM,
 * ver o arquivo); isto só aplica o resultado. Chamada duas vezes por dica
 * rica — ao mostrar (rect da dica sem a arte) e de novo no `onload` da
 * imagem (ver `mostrarDicaItem`), porque o rect pode mudar com ela.
 */
function posicionarDica(alvoEl, dica, janela) {
	const pos = posicaoDaDica(
		alvoEl.getBoundingClientRect(),
		dica.getBoundingClientRect(),
		janela.getBoundingClientRect()
	);
	dica.style.left = pos.left + 'px';
	dica.style.top = pos.top + 'px';
}

/**
 * Mostra a dica RICA — cabeçalho (arte de coleção + nome), corpo da
 * descrição e a cápsula de Runas quando o item tem `Options` (bônus de
 * equipamento com raridade, `Options[i].param`) — ver
 * `Utils/ItemOptionsView.js`, o MESMO módulo que a janela de Detalhes
 * (ItemInfo.js) usa, pro visual não divergir entre os dois.
 *
 * Todo texto vindo do item/DB passa por `escapeHTML` antes de entrar no
 * `innerHTML` (nome, linhas da descrição e o texto de cada runa, dentro de
 * `renderRunasHTML`) — nada aqui é `textContent` mais, então nada disso pode
 * ir cru.
 */
function mostrarDicaItem(alvoEl, item, vestidoEmForcado) {
	const root = _root();
	const dica = root.querySelector('.mo-dica');
	const janela = root.querySelector('.mo-window');
	if (!dica || !janela) {
		return;
	}

	const it = DB.getItemInfo(item.ITID);
	const location = 'location' in item ? item.location : item.WearState;
	// `showItemOptions:false` -- sem isto o nome ganha o sufixo generico
	// "[N Option]" (DBManager.js#getItemName) duplicando a MESMA informacao
	// que a capsula de Runas abaixo ja mostra, com raridade -- mesma decisao
	// que ItemInfo.js ja toma pro titulo da janela de Detalhes.
	const nome = DB.getItemName(item, { showItemOptions: false });
	// A palavra por extenso ao lado do selo (26/08/2026): o selo diz "e
	// especial", a dica diz O QUE e -- criterio identico ao da celula
	// (eDeFantasia sobre a mascara de vestir do item).
	const titulo = eDeFantasia(location) ? nome + ' — Fantasia' : nome;
	// O corpo pode sair VAZIO mesmo com descricao (item so de lore, sem linha
	// "Rotulo: valor") — testar o HTML, e nao `linhas.length`, evita um
	// `.mo-dica-corpo` oco abrindo margem entre o nome e as Runas.
	const corpo = renderCorpoDaDescricao(descricaoLinhas(item));

	/*
	 * O SELO "Equipado" (08/09/2026, pedido do alfa: *"indique claramente
	 * quando o item estiver equipado e em qual espaço"*). A máscara diz os
	 * espaços TOMADOS — a arma de duas mãos sai "Arma (duas mãos)", o chapéu
	 * grande "Chapéu + Óculos" — e a regra mora em `espacoEquipado.js`, onde
	 * dá para medir sem DOM.
	 */
	/*
	 * `WearState`, e NAO o `location` logo acima: `location` e a mascara de onde
	 * o item PODE ser vestido (e o que `eDeFantasia` quer), `WearState` e onde
	 * ele ESTA. Um arco na mochila tem `location = Arma|Escudo` e WearState 0 —
	 * com a mascara errada o selo diria "Equipado" para meia mochila.
	 */
	/*
	 * E o chamador do SLOT quem sabe a verdade (`mascaraVestidaDoIndice`): o
	 * `WearState` do objeto vale para a lista do login, e nao para a peca que
	 * o jogador acabou de vestir nesta sessao.
	 */
	const vestidoEm = vestidoEmParaADica(item, vestidoEmForcado, () => mascaraVestidaDoIndice(String(item.index)));
	const espaco = rotuloDoEspacoEquipado(vestidoEm, EQUIP_SLOTS);

	/*
	 * O SELO "Exclusivo para VIPs" (09/09/2026 — ordem do dono).
	 *
	 * Ele vai DEPOIS do nome e ANTES da descricao: e a primeira coisa que o
	 * jogador le sobre o item, porque e a que muda se ele pode usa-lo. A
	 * recusa de verdade e do servidor; isto existe para ele saber ANTES de
	 * tentar.
	 *
	 * Nao da para pendura-lo na descricao: ela vem do GRF e esta dica so
	 * mostra linhas no formato "Rotulo: valor" (ver `renderCorpoDaDescricao`).
	 */
	const legendaVip = legendaDeVip(item.ITID);
	/*
	 * O ID PARA O ADMINISTRADOR (11/09/2026, D-1331 — pedido do dono).
	 *
	 * Ele vai por ULTIMO, depois da descricao: quem joga nao deve tropecar
	 * nele, e quem o procura sabe onde esta. E o oposto do selo de VIP logo
	 * acima, que vem primeiro porque muda o que o jogador PODE fazer.
	 *
	 * `null` para todo mundo que nao e administrador — quem decide isso e
	 * `idParaAdmin.js`, o unico lugar do fork que pergunta pela Session para
	 * desenhar. Aqui so se renderiza o que ele devolve.
	 */
	const idDoItem = linhaDeIdParaAdmin(item.ITID);
	dica.innerHTML =
		'<div class="mo-dica-cabecalho">' +
		'<div class="ri-tile mo-dica-arte"><img class="mo-dica-arte-img" alt="" /></div>' +
		`<div class="mo-dica-nome">${escapeHTML(titulo)}</div>` +
		'</div>' +
		(espaco ? `<div class="mo-dica-equipado">Equipado - ${escapeHTML(espaco)}</div>` : '') +
		(legendaVip ? `<div class="mo-dica-vip">${escapeHTML(legendaVip)}</div>` : '') +
		(corpo ? `<div class="mo-dica-corpo">${corpo}</div>` : '') +
		renderRunasHTML(item) +
		(idDoItem ? `<div class="mo-dica-id">${escapeHTML(idDoItem)}</div>` : '');

	// Visivel ANTES de medir: `hidden` e `display:none`, e um elemento
	// escondido mede 0x0 — a dica nasceria no canto e so acertaria a posicao
	// no hover seguinte.
	dica.hidden = false;
	posicionarDica(alvoEl, dica, janela);

	// A arte de colecao carrega ASSINCRONA (rede, ou o GRF via
	// Client.loadFile) -- o tooltip ja aparece com a moldura vazia, e o
	// `onload` reposiciona (o rect pode crescer com a imagem). Sem arte
	// nenhuma publicada NEM no GRF, `aoFalhar` cai pro icone pequeno do
	// item -- MESMO fallback que `setItemIcon` ja usa na grade.
	const imgEl = dica.querySelector('.mo-dica-arte-img');
	if (imgEl) {
		imgEl.onload = () => {
			if (!dica.hidden) {
				posicionarDica(alvoEl, dica, janela);
			}
		};
		carregarArteDeColecao(
			item,
			it,
			url => {
				imgEl.src = url;
			},
			() => setItemIcon(imgEl, item, it)
		);
	}
}

/**
 * Mostra a dica de TEXTO simples (slot vazio, botão "Tirar") — sem
 * cabeçalho nem Runas, só `dica.textContent`. Ver `mostrarDicaItem()` pro
 * caso rico.
 */
function mostrarDicaTexto(alvoEl, texto) {
	const root = _root();
	const dica = root.querySelector('.mo-dica');
	const janela = root.querySelector('.mo-window');
	if (!dica || !janela) {
		return;
	}
	dica.textContent = texto;
	dica.hidden = false;
	posicionarDica(alvoEl, dica, janela);
}

function esconderDica() {
	const dica = _root().querySelector('.mo-dica');
	if (dica) {
		dica.hidden = true;
	}
}

/**
 * O aviso da Mochila, para quem esta FORA dela avisar o jogador onde ele tocou
 * (D-1848: a recusa do carrinho que chega do servidor). So com a janela
 * aberta — aviso numa janela fechada e aviso que ninguem ve.
 */
MochilaIdle.avisar = function avisar(msg) {
	if (msg && isOpen()) {
		mostrarAviso(msg);
	}
};

function mostrarAviso(msg) {
	const root = _root();
	const el = root.querySelector('.mo-aviso');
	if (!el) {
		return;
	}
	el.textContent = msg;
	el.hidden = false;
	if (_avisoTimer) {
		clearTimeout(_avisoTimer);
	}
	_avisoTimer = setTimeout(() => {
		el.hidden = true;
		_avisoTimer = null;
	}, 3200);
}

const MSG_REFINO = 'Esta peça está refinada e não pode ser trocada.';
const MSG_FALHA_EQUIPAR = 'Não foi possível equipar essa peça agora.';
const MSG_FALHA_TIRAR = 'Não foi possível tirar essa peça agora.';

/**
 * Equipar: index/location do item de origem (arrastado OU escolhido no
 * menu). Reusa o contrato tecnico -- Equipment.getUI().onEquipItem(index,
 * location), a MESMA chamada que o drop nativo da Equipment ja faz
 * (EquipmentCommon.js:879).
 */
function tentarEquipar(item, location) {
	const root = _root();
	const conflitantes = Array.from(root.querySelectorAll('.mo-slot.is-ocupado')).filter(tile => {
		const loc = parseInt(tile.dataset.location, 10);
		return (loc & location) !== 0;
	});
	const temRefinoNoConflito = conflitantes.some(tile => tile.querySelector('.mo-slot-refino'));

	Equipment.getUI().onEquipItem(item.index, location);

	if (temRefinoNoConflito) {
		mostrarAviso(MSG_REFINO);
		return;
	}
	// A municao vestida NAO sai da mochila: a pergunta da recusa e outra (ver
	// `municaoNaMochila.js`, item 2). Vale para o menu e para o arrasto.
	agendarChecagemDeRecusa({
		tipo: item.type === ItemType.AMMO ? 'equipar-municao' : 'equipar',
		indice: item.index
	});
}

/**
 * Tirar: index do slot equipado. Reusa Equipment.getUI().onUnEquip(index) --
 * o mesmo caminho do "x" do slot e do dblclick nativo (EquipmentCommon.js:
 * 904-906).
 */
function tentarTirar(index, tileEl) {
	const temRefino = !!(tileEl && tileEl.querySelector('.mo-slot-refino'));

	Equipment.getUI().onUnEquip(index);

	if (temRefino) {
		mostrarAviso(MSG_REFINO);
		return;
	}
	agendarChecagemDeRecusa({ tipo: 'tirar', indice: index });
}

function agendarChecagemDeRecusa(ctx) {
	setTimeout(() => verificarRecusa(ctx), RECUSA_DELAY_MS);
}

function verificarRecusa(ctx) {
	if (ctx.tipo === 'equipar') {
		// Se o item AINDA esta na mochila com o mesmo indice, o pedido nao
		// mudou nada -- provavel recusa (nao so refino/carta: nivel/classe
		// tambem passam por aqui, por isso a mensagem generica).
		if (Inventory.getUI().getItemByIndex(ctx.indice)) {
			// O motivo do SERVIDOR, quando ele deu um (04/10/2026, recusaDoServidor.js).
			const motivo = consumirMotivoRecente(Date.now());
			mostrarAviso(motivo ? 'Não foi possível equipar: ' + motivo : MSG_FALHA_EQUIPAR);
		}
	} else if (ctx.tipo === 'equipar-municao') {
		if (!municaoVestiuOIndice(mascaraVestidaDoIndice(String(ctx.indice)))) {
			const motivo = consumirMotivoRecente(Date.now());
			mostrarAviso(motivo ? 'Não foi possível equipar: ' + motivo : MSG_FALHA_EQUIPAR);
		}
	} else if (ctx.tipo === 'tirar') {
		const equipRoot = Equipment.getUI().getRoot();
		if (!equipRoot) {
			return;
		}
		const aindaVestido = !!equipRoot.querySelector(`.item[data-index="${ctx.indice}"]`);
		if (aindaVestido) {
			mostrarAviso(MSG_FALHA_TIRAR);
		}
	}
}

/**
 * Rodape: SO o peso real (Session.Entity.weight/.max_weight, em decimos --
 * ver cabecalho do arquivo). Sem "Organizar"/"+"/"Atalho": nenhum dado real
 * sustenta esses tres (secao 5 do briefing).
 */
function syncRodape() {
	const root = _root();
	const entity = Session.Entity;
	if (!entity) {
		return;
	}
	const peso = Math.floor((entity.weight || 0) / 10);
	const pesoMax = Math.floor((entity.max_weight || 0) / 10);
	const el = root.querySelector('.mo-peso-valor');
	if (!el) {
		return;
	}
	el.textContent = `${peso} / ${pesoMax}`;

	const fracao = pesoMax > 0 ? peso / pesoMax : 0;
	el.classList.toggle('is-critico', fracao >= 1);
	el.classList.toggle('is-aviso', fracao >= 0.8 && fracao < 1);
}

/**
 * A TROCA DE PERSONAGEM ESQUECE A MOCHILA (28/08/2026).
 *
 * Voltar ao menu de personagem NAO recarrega a pagina: `onRestartAnswer` chama
 * `cleanGameUI()` e `onRestart()`, sem `GameEngine.reload()` (o reload so
 * acontece no SAIR). Todo estado de MODULO atravessa a troca — e este arquivo
 * guarda as assinaturas da grade e dos slots, e a aba aberta.
 *
 * As assinaturas seguram o redesenho de proposito (reconstruir os <img> a cada
 * tique daria flicker), e e justamente isso que faz a mochila do anterior
 * ficar na tela. `_dragUnequipIndex` e um arrasto pela metade, que nao pode
 * atravessar para outro personagem.
 *
 * Chamada por `cleanGameUI()` em Engine/MapEngine.js, junto com os outros
 * componentes RAGIDLE. Quem somar estado de personagem aqui soma a linha
 * correspondente ABAIXO, e o portao `limpeza-da-troca-de-personagem.test.ts`
 * (no repo do servidor) reprova se esquecer.
 */
MochilaIdle.limparEstadoDoPersonagem = function limparEstadoDoPersonagem() {
	/*
	 * A ABA VOLTA PARA A DE PARTIDA, e nao para `null` (31/08/2026). Aba nao e
	 * dado de personagem, e `null` nem sequer era o padrao -- era o buraco
	 * descrito em abaDePartida(), que deixava a grade vazia depois da troca.
	 */
	_abaAtiva = abaDePartida();
	syncAbasAtivas(_root());
	_lastGradeSig = null;
	_lastSlotsSig = null;
	_dragUnequipIndex = null;
	/*
	 * ZERAR O DADO NAO BASTA: `GUIComponent.remove()` so DESANEXA o host,
	 * entao o shadow DOM (com `is-open` e o HTML do personagem anterior)
	 * atravessa a troca. Ver `UI/Components/limpezaDeJanelaIdle.js`.
	 */
	fecharEEsquecer(_root(), '.mo-window');
};

/**
 * Create component and export it
 */
export default UIManager.addComponent(MochilaIdle);
