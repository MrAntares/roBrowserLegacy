/**
 * Preferences/Graphics.js
 *
 * Graphics preferences
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
import Preferences from 'Core/Preferences.js';

const defaultGraphicsSettings = {
	/**
	 * Game size
	 */
	screensize: '800x600',

	/*
	 * Game quality detail
	 * 100: Full
	 */
	quality: 100,

	/**
	 * Do we show official game cursor ?
	 */
	cursor: true,

	/**
	 * Game FPS Limit
	 */
	fpslimit: 120,

	/**
	 * Os NOMES dos jogadores sempre visiveis (28/08/2026, pedido do dono).
	 *
	 * O roBrowser so pede o nome no hover. Ligado, o cliente pede assim que o
	 * jogador entra na vista e desenha nome + guilda direto, como a barra de HP.
	 *
	 * PADRAO LIGADO: e o comportamento do RO oficial, e o dono pediu o toggle
	 * para DESATIVAR — ou seja, ativo e o estado esperado.
	 */
	showPlayerNames: true,

	/**
	 * Performance Mode
	 *
	 * O `viewArea` e o RAIO DE CULLING do cliente: com o modo ligado,
	 * `EntityManager.render` pula toda entidade a mais de `viewArea` celulas do
	 * jogador. Ele NAO tem relacao com o que o servidor manda — e um segundo
	 * corte, por cima do primeiro.
	 *
	 * **14 -> 400 em 31/08/2026.** O 14 vinha do `AREA_SIZE` do rAthena, que era
	 * tambem o corte do servidor. Em 31/08 o servidor passou a difundir o mapa
	 * INTEIRO (`RAIO_DE_DIFUSAO` = `Infinity`, `servidor/mapa/area-de-interesse.ts`),
	 * por ordem do dono — *"TODOS os mobs do mapa devem aparecer"* —, e o 14
	 * daqui virou o gargalo sozinho: o servidor mandava os 132 mobs de um
	 * `prt_fild08` (medido no fio: 223 `STANDENTRY`) e o cliente desenhava so os
	 * de 14 celulas.
	 *
	 * 400 e o LADO do maior mapa servido (400x400), entao nenhum mob do mapa cai
	 * fora. O modo continua existindo para quem precisar dele — o que ele corta
	 * agora e o que esta fora do mapa, ou seja, nada.
	 */
	performanceMode: false,
	viewArea: 400,

	/**
	 * Damage Skin
	 */
	damageSkin: 0,

	/**
	 * Damage Motion Type
	 * 0: Default, 1: Left, 2: Top, 3: Right
	 */
	damageMotion: 0,

	pixelPerfectSprites: false,

	/**
	 * Game Post-Processing
	 */
	bloom: false,
	bloomIntensity: 0.5,

	blur: false,
	blurArea: 14.0,
	blurIntensity: 3.0,

	fxaaEnabled: false,
	fxaaSubpix: 0.25,
	fxaaEdgeThreshold: 0.125,

	vibranceEnabled: false,
	vibrance: 0.15,

	cartoonEnabled: false,
	cartoonPower: 1.5,
	cartoonEdgeSlope: 1.5,

	casEnabled: false,
	casContrast: 0.0,
	casSharpening: 1.0
};

/**
 * Export
 */
const cleanDefaults = JSON.parse(JSON.stringify(defaultGraphicsSettings));
/*
 * VERSAO 1.1 -> 1.2 em 31/08/2026, e o bump E O CONSERTO — nao um detalhe.
 *
 * `Preferences.get` DESCARTA o que esta salvo quando `_version` nao bate
 * (`src/Core/Preferences.js:43`) e regrava os padroes. Sem o bump, quem ja tem
 * `Graphics` no `localStorage` — todo jogador que abriu o jogo alguma vez —
 * continuaria com `viewArea: 14` e com o `performanceMode` que ele mesmo possa
 * ter ligado, e o padrao novo nao alcancaria ninguem.
 *
 * E a mesma licao do cache do bundle, no mesmo dia: **mudar o padrao nao
 * resgata quem ja tem o valor velho gravado**; so mudar a CHAVE alcanca.
 *
 * O preco: as preferencias graficas voltam ao padrao uma vez. E aceitavel — sao
 * opcoes de video, nao progresso — e o dono pediu *"nunca mais"*, que nao se
 * cumpre com um padrao que a maioria dos navegadores ignora.
 */
const GraphicsSettings = Preferences.get('Graphics', defaultGraphicsSettings, 1.2);
GraphicsSettings.defaults = cleanDefaults;

export default GraphicsSettings;
