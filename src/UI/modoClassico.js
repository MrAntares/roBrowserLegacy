/**
 * O MODO CLASSICO (24/09/2026, ordem do dono) E O UNICO MODO (07/10/2026,
 * Novo Bot V5).
 *
 * Ate 07/10 este modulo era um INTERRUPTOR (`modoClassicoLigado`, lido de
 * `ROConfig.modoClassico`) que escondia a interface do idle: o botao "Ataque
 * auto", a janela "Idle", o "Dormir", a economia de energia, a rotacao de
 * skills e o tutorial da caca automatica. Com o novo Bot, essa interface foi
 * RETIRADA do cliente, e o interruptor saiu junto: `modoClassicoLigado` e
 * `esconderNoModoClassico` nao existem mais, e nao ha `modoClassico` no
 * `Config.js`. O combate e sempre o do Modo Classico.
 *
 * O que sobra daqui e a regra do golpe em quem anda, que vale SEMPRE e mora em
 * `Engine/MapEngine/apanharAndando.js` (quem a usa e o `Entity.js`). Este
 * arquivo so a reexporta, para nao haver uma segunda copia.
 *
 * This file is part of the ragidle fork of ROBrowser.
 */
export { apanharInterrompeACaminhada } from '../Engine/MapEngine/apanharAndando.js';
