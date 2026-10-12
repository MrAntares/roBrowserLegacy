# Pacotes do homunculo e do mercenario (modo classico) no cliente

O servidor de mapa (`rag-idle-master`, branch `feat/modo-classico`) ganhou o
homunculo (`AM_CALLHOMUN`/`AM_REST`/`AM_RESURRECTHOMUN`, porte "ligar-homunculo",
28/09/2026) e o mercenario (D-358..380, "mercenario-classico"). Este documento
prova, lendo o codigo do cliente (`ragidle-client`, branch `feat/modo-classico`),
se o roBrowser TRATA cada pacote novo e se o layout de bytes bate com o que o
servidor escreve. Repo do servidor usado so como referencia de leitura:
`rag-idle-master/.claude/worktrees/modo-classico` (NAO editado); rAthena de
referencia: `rag-idle-master/Emulador-Serverside Ravena/src/map/clif.cpp`.

O PACKETVER deste projeto e PINADO em `20211103` (D-331) - a autoridade de
QUANTOS BYTES o transporte consome do socket para cada opcode e
`src/Network/Packets/packets2021_len_main.js` (`NetworkManager.js:354`,
`PacketLength.getPacketLength`), e NAO o `.size` que cada struct de
`PacketStructure.js` declara - os dois podem divergir (ver item 3) porque o
parser so precisa ler os campos que usa; o resto do quadro e pulado por um
`fp.seek(offset)` calculado a partir da tabela de enquadramento
(`NetworkManager.js:448`), nao da posicao onde o parser parou de ler.

## Tabela resumida

| item | pacote | tratador (arquivo:linha) | layout bate byte a byte? | estado |
|---|---|---|---|---|
| 1. Entrada em cena (homunculo `tipoDeObjeto=8`, mercenario `=9`) | `ZC_NOTIFY_STANDENTRY11` 0x09ff (sai, variavel) | generico, `src/Engine/MapEngine/Entity.js:123` (`onEntitySpam`) + `entity.objecttype` | Sim - `Entity.TYPE_HOM=8`/`TYPE_MERC=9` (`src/Renderer/Entity/Entity.js:114-115`) batem com `TipoDeObjeto.HOMUNCULO=8`/`MERCENARIO=9` do servidor (`servidor/protocolo/pacotes-mapa.ts:573-574`) | Ja funcionava |
| 2. `ZC_CHANGESTATE_HOMUN` (nome do cliente: `CHANGESTATE_MER`) | 0x0230 (sai, 12 bytes: `tipo`u8+`estado`u8+`GID`u32+`dado`i32) | `src/Engine/MapEngine/Homun.js:205` (`onHomunInformationUpdate`); hookPacket `PacketRegister.js:318` | Sim - `PacketStructure.js:7808-7814` le `type`/`state`/`GID`/`data` na mesma ordem e largura; framing `packets2021_len_main.js:1404` = 12, igual ao `.size` do struct | Ja funcionava (critico: arma `Session.homunId` no `estado===0`, sem isso `ZC_PROPERTY_HOMUN` cai no `if (!Session.homunId) return`) |
| 3. `ZC_PROPERTY_HOMUN` | 0x022e (sai, 73 bytes no fio / 71 no struct) | `src/Engine/MapEngine/Homun.js:75` (`onHomunInformation`); hookPacket `PacketRegister.js:316` | Sim - os 22 campos de `PacketStructure.js:7774-7798` somam 69 + opcode(2) = 71, mas o ENQUADRAMENTO real (`packets2021_len_main.js:1398`) e 73: o servidor sabe disso e manda 2 bytes reservados no fim (`servidor/protocolo/pacotes-mapa.ts:4407`, `reservado: null`) para o `fp.seek` do transporte nao comer os 2 primeiros bytes do PROXIMO pacote | Ja funcionava (o servidor ja tinha achado e resolvido a divergencia struct x framing antes deste porte) |
| 4. `ZC_MER_INIT` | 0x029b (sai, 80 bytes) | `src/Engine/MapEngine/Mercenary.js:27` (`onMercenaryInit`, arma `Session.mercId = pkt.AID`); hookPacket `Mercenary.js:191` | Sim - os 20 campos de `PacketStructure.js:8436-8457` (`AID`u32, 8x`short`, `name`24, `level`, 4x`long` de hp/sp, `ExpireDate`, `faith`, `toal_call_num`, `approval_monster_kill_counter`, `ATKRange`) batem na mesma ordem e largura com `ZC_MER_INIT.campos` do servidor | Ja funcionava |
| 5. `ZC_MER_PAR_CHANGE` (HP/SP/MaxHP/MaxSP) | 0x02a2 (sai, 8 bytes: `param`u16+`value`i32) | `Mercenary.js:93` (`onParameterChange`, casos `0x0`-`0x3`) | Layout do pacote bate (`PacketStructure.js`, framing `packets2021_len_main.js:1737`=8), mas os literais `0x0`-`0x3` NAO sao os `SP_HP`(5)/`SP_MAXHP`(6)/`SP_SP`(7)/`SP_MAXSP`(8) reais do emulador (`map.hpp:499-500`, `clif_mercenary_updatestatus`, `clif.cpp:18250-18261`) | Bug pre-existente do roBrowser upstream, **fora do escopo**: o servidor NUNCA manda HP/SP do mercenario por este pacote hoje (so `SP_MERCKILLS`, ver item 6) - o caminho fica morto e nao afeta o jogo atual. Nao mexi (nao e o que o servidor envia) |
| 6. `ZC_MER_PAR_CHANGE` (abates / fe) | 0x02a2, `atributo: SP_MERCKILLS`(189) - o unico uso real hoje | `Mercenary.js:93` (`onParameterChange`) | Sim, `SP_MERCKILLS=189` do servidor (`servidor/mercenario.ts:348`) bate com `map.hpp:527` e com `StatusProperty.MER_KILLCOUNT=0xbd` (`DB/Status/StatusProperty.js:201`, ja existente) | **Nao funcionava, CONSERTADO** - ver detalhe abaixo |
| 7. `CZ_MER_COMMAND` (demitir mercenario) | 0x029f (entra, 3 bytes: `comando`u8) | `Mercenary.js:148` (`reqDeleteMercenary`, botao da janela) e servidor `servidor/mapa/servidor-mapa.ts:32779` | Layout do pacote bate (`PacketStructure.js:3090-3100`, framing `packets2021_len_main.js:1734`=3) | **DIVERGENCIA NO SERVIDOR** (nao consertada aqui) - ver detalhe abaixo |
| 8. Fome/alimentar do homunculo (`CZ_COMMAND_HOM` 0x022d, `ZC_FEED_HOM`/`FEED_MER` 0x022f) | ainda NAO existe em `feat/modo-classico` | `Homun.js:232` (`reqHomunFeed`/`reqDeleteHomun`, ja prontos) + `Homun.js:115` (`onFeedResult`) | Nao verificavel contra o servidor hoje | **Pendente de merge** - vive em `origin/feat/modo-classico-homunculo-fome` (nao mesclada); achado adicional registrado abaixo para quando ela entrar |
| 9. Skills proprias (`HOSKILLINFO_LIST/UPDATE` 0x235/0x239, `MER_SKILLINFO_LIST/UPDATE` 0x29d/0x29e) | nenhum opcode enviado pelo servidor hoje | `Homun.js:324`/`355`, `Mercenary.js:130`/`195` (hookPacket ja registrado) | N/A | Fora de escopo, declarado pelo proprio servidor (`servidor/homunculo.ts:74-76`: "a arvore do homunculus_db nao e lida") - handler existe e fica mudo, sem efeito colateral |
| 10. Saida de cena (`AM_REST`) | `ZC_NOTIFY_VANISH` 0x0080 (sai, 7 bytes) | generico, `Entity.js:302` (`onEntityVanish`) | Sim - pacote generico ja usado por qualquer entidade | Ja funcionava |

## Detalhe por item

### 1. Entrada em cena - ja funcionava
`ZC_NOTIFY_STANDENTRY11` e o MESMO pacote usado para qualquer mob/PC nascendo
(`Entity.js:123`, `onEntitySpam`, sem nenhum `if` que distinga homunculo ou
mercenario de qualquer outra entidade). O campo que decide a janela que abre
depois e `entity.objecttype`: o cliente define `TYPE_HOM = 8` e `TYPE_MERC = 9`
(`Renderer/Entity/Entity.js:114-115`), e o servidor usa exatamente os mesmos
numeros (`TipoDeObjeto.HOMUNCULO = 8`, `MERCENARIO = 9`,
`servidor/protocolo/pacotes-mapa.ts:568-574`, citando `clif.cpp:378-380`). Os
34 campos do `ZC_NOTIFY_STANDENTRY11.campos` do servidor batem com o parser
generico ja auditado (pacote pre-existente, fora do escopo desta feature).

### 2 e 3. `ZC_CHANGESTATE_HOMUN` + `ZC_PROPERTY_HOMUN` - ja funcionavam
A ORDEM importa e o servidor ja acerta: `apresentarHomunculo`
(`servidor/mapa/servidor-mapa.ts:17997-18096`) manda `STANDENTRY11`, DEPOIS
`ZC_CHANGESTATE_HOMUN` (`estado: 0`, o `SP_ACK`), DEPOIS `ZC_PROPERTY_HOMUN`.
Isso importa porque `Homun.js:205-227` (`onHomunInformationUpdate`, o handler
do 0x0230) so arma `Session.homunId = pkt.GID` quando `entity` ja existe E
`pkt.state === 0`; e `Homun.js:75-108` (`onHomunInformation`, o handler do
0x022e) devolve sem fazer nada enquanto `Session.homunId` estiver zerado
(`if (!Session.homunId) return;`, linha 78). O nome dos pacotes no cliente e
enganoso - `PACKET.ZC.CHANGESTATE_MER`/`PACKET.ZC.PROPERTY_HOMUN` fazem parte
do MESMO arquivo `Homun.js` que os usa de verdade (o roBrowser copiou o
componente do mercenario para comecar o do homunculo, e o nome ficou).

O `ZC_PROPERTY_HOMUN` (0x022e) tem uma armadilha que o SERVIDOR ja resolveu
antes deste porte: o parser (`PacketStructure.js:7774-7798`) declara
`.size = 71`, e os 22 campos somam exatamente isso (69 de conteudo + 2 de
opcode). Mas o ENQUADRAMENTO real deste PACKETVER
(`packets2021_len_main.js:1398`, `length_list[0x022e] = 73`) e quem decide
quantos bytes o `NetworkManager` consome do socket (`NetworkManager.js:354`,
`PacketLength.getPacketLength`) - nao o `.size` do parser. Se o servidor
mandasse so 71 bytes, o `fp.seek(offset)` do transporte (`NetworkManager.js:448`,
calculado com o enquadramento de 73) avancaria 2 bytes ALEM do que foi
escrito, comendo os 2 primeiros bytes do proximo pacote como se fossem deste.
O servidor manda os 2 bytes extras como campo `reservado` zerado
(`servidor/protocolo/pacotes-mapa.ts:4407`, `campo.zeros('reservado', 2)`) -
o parser do cliente nunca le esses 2 bytes (para em `ATKRange`), mas eles
precisam estar no fio para o proximo pacote comecar no lugar certo. Achado
JA CONHECIDO E RESOLVIDO do lado do servidor antes desta conferencia; nao ha
nada para consertar no cliente.

### 4. `ZC_MER_INIT` - ja funcionava
`onMercenaryInit` (`Mercenary.js:27-56`) arma `Session.mercId = pkt.AID` e
preenche a janela (`MercenaryInformations.setInformations`). Os 20 campos do
parser (`PacketStructure.js:8436-8457`) batem campo a campo, na mesma ordem e
largura, com `ZC_MER_INIT.campos` do servidor (`pacotes-mapa.ts:4237-4258`):
`id`(u32)=`AID`, 8 `short` de atributos, `nome`(24)=`name`, `nivel`=`level`,
4 `i32`/`long` de hp/sp, `expiraEm`=`ExpireDate`, `lealdade`=`faith`,
`invocacoes`=`toal_call_num`, `abates`=`approval_monster_kill_counter`,
`alcance`=`ATKRange`. Total 78 + 2 (opcode) = 80, batendo com `.size = 80`
do struct E com o enquadramento (`packets2021_len_main.js:1722`).

### 5 e 6. `ZC_MER_PAR_CHANGE` - abates NAO atualizava a janela, CONSERTADO
`clif_mercenary_updatestatus` (`clif.cpp:18209-18270`) manda o MESMO pacote
0x02a2 para HP, SP, MaxHP, MaxSP E para `SP_MERCKILLS`/`SP_MERCFAITH`
(map.hpp:527: `SP_MERCFLEE=165, SP_MERCKILLS=189, SP_MERCFAITH=190`). O
servidor deste projeto SO usa este pacote para `SP_MERCKILLS`
(`servidor/mapa/servidor-mapa.ts:17832`, dentro de
`creditarAbateAoMercenario`, chamada toda vez que o abate conta para o
mercenario) - nunca para HP/SP do mercenario (esses, quando existirem,
devem ir por outro caminho; nao e o escopo desta auditoria).

O handler `onParameterChange` (`Mercenary.js:93`, ANTES do conserto) so tinha
`case 0x0/0x1/0x2/0x3` (HP/SP/MaxHP/MaxSP com numeros literais, nem sequer os
`SP_HP`(5)/`SP_MAXHP`(6)/`SP_SP`(7)/`SP_MAXSP`(8) reais - outro achado, mas
sem efeito porque o servidor nunca manda esses quatro por este pacote) - e
retornava CEDO se `EntityManager.get(Session.mercId)` nao achasse a entidade.
Quando o servidor mandava `{ atributo: 189, valor: novo.abates }`, o `switch`
caia no vazio: nenhum `case` bate com 189, e a contagem de abates mostrada na
janela (`MercenaryInformations.setKills`, que ja existe e e chamada pelo
`ZC_MER_INIT` no login) NUNCA se atualizava depois de um abate - so voltava a
mostrar o numero certo no proximo relogin/troca de mapa (proximo `ZC_MER_INIT`).

O cliente ja tinha os dois pedacos prontos e nunca ligados:
`StatusProperty.MER_KILLCOUNT = 0xbd` (189) e `MER_FAITH = 0xbe` (190)
(`DB/Status/StatusProperty.js:201-202`), e
`MercenaryInformations.setKills`/`setFaith` (`MercenaryInformations.js:225-252`,
`400-408`). O conserto adiciona duas checagens no INICIO de `onParameterChange`,
antes do `EntityManager.get` (a contagem de abates e a fe nao moram no
`entity.life`, moram so na janela - o mesmo desenho de
`Homun.js:onHomunParameterChange`, que atualiza `HomunInformations` mesmo sem
achar a entidade em cena):

```js
if (pkt.param === StatusProperty.MER_KILLCOUNT) {
	MercenaryInformations.setKills(pkt.value);
	return;
}
if (pkt.param === StatusProperty.MER_FAITH) {
	MercenaryInformations.setFaith(pkt.value);
	return;
}
```

`MER_FAITH` foi ligado junto por simetria de protocolo (mesmo pacote, mesma
familia, metodo `setFaith` ja pronto) mesmo o servidor ainda nao mandando
`SP_MERCFAITH` hoje - fica pronto para quando mandar, sem inventar nenhum
valor novo (so usa constantes e metodos que ja existiam no roBrowser).

Teste novo: `tests/renderer/mercenarioAbatesAtualizaJanela.test.js` (5 casos):
`MER_KILLCOUNT` chama `setKills` mesmo sem entidade em cena; `MER_FAITH` chama
`setFaith` mesmo sem entidade; os valores reais do protocolo sao 189/190 (nao
0/1); controle de que o caso HP antigo (`0x0`) continua funcionando com
entidade presente; controle de que HP sem entidade continua um no-op seguro.

### 7. `CZ_MER_COMMAND` (demitir) - DIVERGENCIA NO SERVIDOR, nao consertada aqui
O layout do pacote bate perfeitamente: `PACKET.CZ.MER_COMMAND`
(`PacketStructure.js:3090-3100`) escreve opcode 0x29f + 1 byte `command`,
igual ao `CZ_MER_COMMAND.campos` do servidor (`pacotes-mapa.ts:4282-4291`,
`campo.u8('comando')`). O problema e de VALOR, nao de layout:

- O rAthena de referencia (`clif_parse_mercenary_action`, `clif.cpp:18355-18366`)
  documenta e implementa: `1 = mercenary information`, `2 = delete`
  (`if (option == 2) mercenary_delete(...)`).
- O cliente (`Mercenary.js:146-154`, `reqDeleteMercenary`, o botao "apagar" da
  janela - codigo do roBrowser upstream, nao escrito por este projeto) manda
  `pkt.command = 2`, exatamente como o rAthena espera.
- O SERVIDOR deste projeto (`servidor/mapa/servidor-mapa.ts:32779-32787`)
  checa `if (comando === 1) dispensarMercenario(...)` - o comentario ao lado
  ainda erra a semantica ("1 = DEMITIR... o 0 e o toggle de seguir"), e o
  pacote `CZ_MER_COMMAND` (`pacotes-mapa.ts:4276-4291`) documenta a mesma
  invencao ("0 = ficar/seguir... 1 = DEMITIR"). Essa recepcao nunca existiu
  no rAthena nem e mandada pelo cliente (`Mercenary.js` so tem o botao de
  apagar, nada de "ficar/seguir" para mercenario).

**Efeito pratico**: quando o jogador clica em "apagar mercenario" na janela,
o cliente manda `comando=2` - e o servidor so reage a `comando===1` - ou
seja, **o botao de demitir mercenario nao faz nada no servidor atual**. Por
regra desta tarefa (nao editar o servidor quando a divergencia e dele contra
o `clif.cpp`), NAO mexi em `servidor-mapa.ts` nem em `pacotes-mapa.ts`. Fica
registrado aqui para o dono decidir: o conserto do lado do servidor e trocar
`comando === 1` por `comando === 2` em `servidor-mapa.ts:32785` (e corrigir o
comentario/doc do pacote).

### 8. Fome/alimentar do homunculo - pendente de merge, achado extra anotado
`servidor/homunculo.ts` (cabecalho, "O QUE CONTINUA FORA") e explicito: em
`feat/modo-classico` "nao ha item de embriao novo nem comando de alimentar" e
"a fome/intimidade nao tiquam". Conferido com `git merge-base --is-ancestor`:
`origin/feat/modo-classico-homunculo` e `origin/feat/modo-classico-mercenario-classico`
JA estao mesclados em `feat/modo-classico`, mas
**`origin/feat/modo-classico-homunculo-fome` NAO esta** - essa branch e quem
adiciona `CZ_COMMAND_HOM` (0x022d, comando de alimentar/apagar) e `ZC_FEED_HOM`
(0x022f, resultado da alimentacao).

O cliente ja tem os DOIS handlers prontos e mudos hoje (`Homun.js:232-247`,
`reqHomunFeed`/`sendHomunFeed`, e `Homun.js:110-127`, `onFeedResult`), entao
nao ha nada a fazer AGORA. Mas a leitura da branch pendente (so leitura, sem
mesclar) encontrou um achado que vai importar quando ela mesclar: o parser
atual do cliente, `PACKET.ZC.FEED_MER` (0x022f,
`PacketStructure.js:7801-7805`), le `cRet`(i8) + `ITID`(u16) e declara
`.size = 5` - mas o ENQUADRAMENTO real deste PACKETVER
(`packets2021_len_main.js:1401`, `length_list[0x022f] = 7`) reserva 7 bytes,
e a branch pendente ja escreve os 7 (`resultado`i8 + `itemId`u32, citando
corretamente `packets_struct.hpp` para `PACKETVER_MAIN_NUM >= 20181121`, que
usa `itemId` de 32 bits). Como o `NetworkManager` avanca pelo enquadramento
(nao pela posicao onde o parser parou - ver a nota do item 3), isso NAO
quebra o pacote seguinte; mas o cliente hoje so leria os 2 bytes BAIXOS do
`itemId` de 32 bits (funciona por acidente para os IDs de item usados no RO
classico, que cabem em 16 bits, mas fica errado se algum dia um id passar de
65535). Registrado para quando essa branch mesclar: ajustar
`PACKET.ZC.FEED_MER` para ler `ITID` como `readULong()` (4 bytes) e
`.size = 7`, com teste dedicado - fora do escopo desta tarefa porque o
pacote nao esta em `feat/modo-classico` hoje.

### 9. Skills proprias do homunculo/mercenario - fora de escopo, declarado
`servidor/homunculo.ts:74-76` e explicito: "as skills PROPRIAS do homunculo
(HLIF_*, HAMI_*, HFLI_*, HVAN_*): a arvore do `homunculus_db` nao e lida".
Nenhum dos opcodes 0x235/0x239/0x29d/0x29e aparece em `servidor/mapa/*.ts` -
so em `tamanhos-do-cliente.ts` (tabela de enquadramento geral, sem uso). Os
handlers do cliente (`Homun.js:324-335`, `Mercenary.js:130-141`) ja existem e
ficam simplesmente sem trafego. Nada a consertar.

### 10. Saida de cena (`AM_REST`) - ja funcionava
`dispensarHomunculo` (`servidor/mapa/servidor-mapa.ts:18104-18112`) manda o
`ZC_NOTIFY_VANISH` generico (0x0080), tratado por `Entity.js:302`
(`onEntityVanish`), que ja para a AI do homunculo/mercenario quando o GID
bate com `Session.homunId`/`Session.mercId` (linhas 324-330). Pacote
pre-existente, sem mudanca necessaria.

## Pendente e por que

- O UNICO conserto de codigo desta auditoria foi o item 6 (`SP_MERCKILLS`/
  `SP_MERCFAITH` em `onParameterChange`), com teste novo em
  `tests/renderer/mercenarioAbatesAtualizaJanela.test.js`.
- O item 7 (`CZ_MER_COMMAND` demitir) e uma divergencia REAL do SERVIDOR
  contra o `clif.cpp` e contra o proprio cliente - nao foi consertada aqui
  por regra desta tarefa (nao editar o servidor). Fica para o dono decidir.
- O item 8 (fome/alimentar) vive numa branch nao mesclada
  (`origin/feat/modo-classico-homunculo-fome`); o achado sobre o tamanho de
  `ZC_FEED_MER` fica registrado para quando ela entrar em `feat/modo-classico`.
- O item 5 dos literais `0x0`-`0x3` de HP/SP/MaxHP/MaxSP em `onParameterChange`
  (que deveriam ser `StatusProperty.HP/MAXHP/SP/MAXSP` = 5/6/7/8) e um bug
  pre-existente do roBrowser upstream sem efeito hoje porque o servidor nunca
  manda esses quatro por este pacote - registrado, nao consertado, para nao
  mexer em codigo que o servidor atual nao exercita.
