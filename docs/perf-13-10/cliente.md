# D-2374 — O cliente na leva de desempenho de 13/10/2026

**Branch:** `perf/13-10` do `ragidle-client` (base `a3ebe0fe`). **Reversível:** sim, cada parte é
um commit independente e nenhuma mexe em formato de pacote, save ou protocolo.

## O motivo

O servidor reenvia a ficha inteira (`enviarAtributos`, `servidor/mapa/servidor-mapa.ts`: uns vinte
`ZC_PAR_CHANGE` mais os `ZC_COUPLESTATUS`) a cada **ficha suja do tique** — buff que entra ou sai,
equipamento, item, renascimento. Quase sempre com os mesmos números. O roBrowser foi escrito para o
rAthena, que só manda o parâmetro quando ele muda, e trata cada pacote como novidade:

1. **Defeito visível (e tráfego para o servidor).** O `case CLEVEL` de `onParameterChange`
   (`src/Engine/MapEngine/Main.js`) mandava um `CZ_PET_ACT` de "subi de nível" a cada reenvio — o
   servidor **difunde** o gesto do pet ao mapa. O `HP` em perigo tinha guarda (10 s); a **morte**
   não tinha, e com o personagem morto cada reenvio repetia o "morri".
2. **Trabalho de DOM jogado fora.** O `Equipment.onLevelUp` reanexava o botão de level up ao
   `document.body` a cada reenvio do nível; `BasicInfo.update` e `WinStats.update` reescreviam todo
   `textContent`/estilo com o mesmo valor (mutação real: troca o nó de texto, invalida estilo e
   acorda os `MutationObserver` da raiz — o do auto-preenchimento do `GUIComponent` e o da
   tradução); `EntityLife.update()` redimensionava e repintava o canvas da barra de vida com o
   mesmo HP (vale também para todo mob a cada `ZC_NOTIFY_MONSTER_HP`).
3. **A compressão da ponte se perdeu.** `e762c75c` (03/10) ligava `permessage-deflate` no
   `wsproxy.js`; o merge com estratégia `ours` da integração de 08/10 (`995acd56`) levou o arquivo
   sem ela.

## O que mudou

| parte | classe | o que |
|---|---|---|
| a) pet no CLEVEL e na morte | **corrige defeito** (muda o que o mapa vê: o pet para de comemorar nível que não veio) | `Engine/MapEngine/falaDoPetNaFicha.js` (puro): `petComemoraONivel(anterior, novo)` só com `novo > anterior` (anterior numérico); `petLamentaAMorte(hpAnterior, hpNovo)` só na passagem para HP ≤ 1 (o `-1` de "sem informação" conta como vivo: entrar já morto ainda lamenta). `Main.js` lê o valor de antes do pacote e pergunta a eles |
| b) botão de level up | **EXATA** salvo a posição do botão entre os irmãos do `body` | `UI/anexarAoCorpoSeSolto.js`: só anexa quando o botão está fora do `body` (o jogador clicou nele, a janela foi retirada). `EquipmentCommon.onLevelUp` (chamado no CLEVEL) e `SkillListCommon.onLevelUp` (no JOBLEVEL) usam o ajudante. Nota: com `PACKETVER 20211103` a janela de Habilidades é a `SkillListV2`, com `nuncaAbre` (D-1671), então o `SkillList.onLevelUp` do JOBLEVEL **já era** um no-op em produção; quem reanexava a cada reenvio era o do Equipamento, no CLEVEL |
| c) janelas nativas | **EXATA** | `UI/escreverSeMudou.js`: `escreverTexto`, `escreverEstilo`, `escreverTitulo` comparam com o que **já está no DOM** (não com um memo do último pedido) e só escrevem o que mudou. "Igual" é estrito: um único filho de texto com o mesmo conteúdo; o estilo pela forma serializada, com `urlComoOLido` para o `url("...")` que o navegador devolve. `BasicInfoCommon.update`/`updateBar` e `WinStatsCommon.setText`/`setUpVisibility` passam por eles; a ordem das escritas e dos `Client.loadFile` não mudou |
| c) barra de vida | **EXATA** | `EntityLife.update()` guarda as entradas do último desenho (tipo, HP visível, máximos, SP, AP, fome) e o tamanho do canvas (a quarta classe só muda a altura, que já é comparada); mesmas entradas → o bitmap no canvas já é o que seria desenhado, pula o redesenho (o `display` volta a `true` como antes). Só esse método escreve no canvas (o Grupo só lê com `drawImage`). `contextlost`/`contextrestored` derrubam o memo |
| d) compressão da ponte | **desligada por padrão** (`RAG_WS_DEFLATE`) | `wsproxyCompressao.js`: `1` liga (deflate nível 1, contexto mantido, o do número medido em `e762c75c`: 155 → 60 KB/s), `0`/ausente desliga, outro valor **derruba a subida** dizendo qual. `wsproxy.js` passa o resultado em `perMessageDeflate` e diz na linha "Listening on" se está ligada |

### Por que a compressão entra desligada

- Não sabemos se o túnel da Cloudflare (`cloudflared` → borda) repassa a extensão ao navegador. Se
  não repassar, ligar não economiza nada no fio do jogador e só gasta CPU na ponte.
- O custo é da ponte (outro processo, outro núcleo — não a thread do jogo), mas é custo: zlib por
  mensagem e ~256 KiB por conexão (janela 15, memLevel 8), ~125 MiB com 500 conexões.
- A rede **não** é o gargalo de hoje (108 KB/s no total, diagnóstico de 13/10).
- O teste prova que, ligada, o navegador recebe os bytes intactos e menos da metade passa pelo
  socket. Para ligar em produção: `RAG_WS_DEFLATE=1` no ambiente da ponte e conferir no
  DevTools (aba Network → WS → cabeçalho `Sec-WebSocket-Extensions` da resposta) se a extensão
  chegou ao navegador através da Cloudflare.

## Alternativas descartadas

- **Guardar no `Main.js` "o nível não mudou → pula tudo"** (janela, aura, carrinho). Descartado: a
  janela pode ter sido redesenhada (troca de mapa) e precisar do valor de novo; comparar com o DOM
  é o que torna o pulo exato. O `aura.load` ficou chamado (é barato e idempotente).
- **Memo do último valor pedido em `BasicInfo.update`.** Descartado pelo mesmo motivo, e pela
  corrida da barra vazia com um `Client.loadFile` ainda carregando: comparar com o DOM não tem
  estado próprio.
- **Ligar a compressão por padrão, como `e762c75c`.** Descartado pelos três motivos acima.
- **`ChangeCart.onLevelUp`** (só Mercador com carrinho, ~10 `querySelector` por reenvio) e o
  **`PartyFriends.updateMemberLife`** do próprio HP ficaram como estão: pouco custo, e o
  primeiro reescreve `display` em ida e volta (none → '') que pediria um memo próprio.

## As provas

| teste | o que conta | antes → depois |
|---|---|---|
| `tests/ui/fichaRepetidaNoMain.test.js` | `CZ_PET_ACT` saindo do `Main.js` real (janelas em duplo) | 5 reenvios de CLEVEL igual: 5 → 0; morto + 3 reenvios de HP 0: 4 → 1 |
| `tests/ui/falaDoPetNaFicha.test.js` | as bordas das duas perguntas puras | — |
| `tests/ui/anexarAoCorpoSeSolto.test.js` | `appendChild` no body | 5 reenvios: 5 → 1 |
| `tests/ui/escreverSeMudou.test.js` | registros de `MutationObserver`; oráculo de 1000 passos contra a escrita crua | escrita igual: 1 → 0 cada |
| `tests/ui/fichaRepetidaNasJanelas.test.js` | mutações na raiz da janela real num reenvio da ficha, e atribuições de estilo (o jsdom não registra mutação de estilo igual) | BasicInfo 17 mutações + 15 estilos → 0; WinStats 16 + 8 → 0 |
| `tests/renderer/vidaSemRedesenho.test.js` | redimensionamentos do canvas; oráculo de 600 passos (PC, mob, pet) contra o caminho que redesenha sempre | 6 updates iguais: 6 → 1 |
| `tests/wsproxy-comprime.test.js` | bytes no socket com a ponte de verdade | padrão: fio inteiro; `=1`: < metade; `=sim`: não sobe |

Bateria de mutação: `tests/mutantes/perf-13-10.config.mjs` (em memória, **50/50 mortos**) e seis
mutantes do disco (`wsproxy.js` ×4, os dois `onLevelUp`, que o processo filho e o teste por texto
leem do disco; rodados por cópia com restauração em `finally`, **6/6 mortos**). Total **56/56**.
A primeira passada deixou 7 vivos, e cada um apontou um buraco no TESTE: o jsdom não registra
mutação para estilo reescrito igual (daí `tests/ui/contarEscritasDeEstilo.js`, que conta no
setter), faltava o caso "primeiro filho certo e outro depois", faltava o canvas redimensionado
na largura, e a comparação da "quarta classe" no memo da barra era redundante com a da altura
(saiu do código).
