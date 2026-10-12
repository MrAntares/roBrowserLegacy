# Pacotes do bloco 5 (auditoria de skills de 2a classe) no cliente

O bloco 5 da auditoria de skills de 2a classe (servidor, 25-28/09/2026) ligou
varios comportamentos novos que chegam ao roBrowser por pacote. Os testes do
servidor provam o que SAI no fio; este documento prova, lendo o codigo do
cliente (`ragidle-client`, branch `feat/modo-classico`), se o roBrowser TRATA
e DESENHA cada um. Repo do servidor usado so como referencia de leitura:
`rag-idle-master/.claude/worktrees/modo-classico` (branch `feat/modo-classico`
do repo `rag-idle`, NAO editado).

Nenhum pacote deste bloco tem teste de rede dedicado hoje (`tests/` nao tem
pasta `network`), exceto o consertado no item 3, que ganhou teste novo.

## Tabela resumida

| item | pacote | tratador (arquivo:linha) | ja funcionava? | conserto (commit) |
|---|---|---|---|---|
| 1. WZ_ESTIMATION (Sense) | `ZC_MONSTER_INFO` 0x018c (sai, 29 bytes) | `src/Engine/MapEngine/Skill.js:871` (`onSense`) + hookPacket `Skill.js:925`; parser `src/Network/PacketStructure.js:6577-6598`; UI `src/UI/Components/Sense/Sense.js` (`setWindow`, 118-173) | Sim | Nenhum necessario |
| 2. AL_WARP (Warp Portal) | `ZC_WARPLIST` 0x0abe (sai, variavel) + `CZ_SELECT_WARPPOINT` 0x011b (entra, 20 bytes) | `src/Engine/MapEngine/Skill.js:420` (`onTeleportList`) + hookPacket `Skill.js:911-912`; parser `PacketStructure.js:5794-5807` (WARPLIST2); resposta `PacketStructure.js:958-971`; UI `src/UI/Components/NpcMenu/NpcMenu.js` | Sim | Nenhum necessario |
| 3. RG_GRAFFITI | `ZC_SKILL_ENTRY5` com `unt`/`job` = `UNT_GRAFFITI` 0xb0 (176) | `src/Engine/MapEngine/Entity.js` (`onSkillAppear`, hookPacket ja existente) | **Nao** (`SkillUnit[UNT_GRAFFITI] = EF_NONE`, `DB/Skills/SkillUnit.js:59`, TODO do proprio roBrowser; `pkt.msg` era lido e descartado) | `35c7c7e5` — `entity.dialog.set(pkt.msg)` reaproveitado; teste `tests/ui/graffitiDesenhaTexto.test.js` (4 casos) |
| 4. AM_CANNIBALIZE / AM_SPHEREMINE | `ZC_NOTIFY_STANDENTRY11` (entrada), `ZC_NOTIFY_ACT` (golpe), saida por `VANISH`/duracao — o MESMO caminho de qualquer mob | `src/Engine/MapEngine/Entity.js:3217` (hookPacket generico `onEntitySpam`); sprite por `src/DB/DBManager.js` `getBodyPath` (1210-1313, fallback `MonsterTable[1001]`) | Sim (generico; os mobIds usados sao mobs reais do RO — Mandragora/Hydra/Flora/Parasite/Geographer e Marine Sphere 1142) | Nenhum necessario |
| 5. Homunculo | `ZC_NOTIFY_STANDENTRY11` + `ZC_CHANGESTATE_HOMUN` 0x0230 (`PACKET.ZC.CHANGESTATE_MER`) + `ZC_PROPERTY_HOMUN` 0x022e, NESSA ORDEM | `src/Engine/MapEngine/Homun.js:205` (`onHomunInformationUpdate`, arma `Session.homunId` na linha 212) + `Homun.js:75` (`onHomunInformation`, guarda `if (!Session.homunId) return` na linha 78); hookPacket `PacketRegister.js:316` (0x22e) e `:318` (0x230); UI `src/UI/Components/HomunInformations/HomunInformations.js` (`setInformations`, 276-393) | Sim, DESDE QUE a ordem seja STANDENTRY11 -> CHANGESTATE_HOMUN -> PROPERTY_HOMUN. O cliente exige a entidade JA existir (`EntityManager.get(pkt.GID)`, `Homun.js:206-208`) antes do CHANGESTATE_HOMUN, senao a janela nunca abre, em silencio. O servidor MANDA nessa ordem exata e documenta a dependencia (`servidor/homunculo.ts:52-56` e `servidor/mapa/servidor-mapa.ts` em torno da linha 18009-18057, `apresentarHomunculo`) | Nenhum necessario (ordem do servidor ja e a exigida) |
| 6. SA_REVERSEORCISH | bit `OPTION_ORCISH` 0x800 num pacote de troca de estado (`ZC_STATE_CHANGE3` ou equivalente) | `src/Engine/MapEngine/Entity.js` (`onEntityOptionChange`, ~2722-2740, `entity.effectState = pkt.effectState`) dispara o setter `src/Renderer/Entity/EntityState.js:483-491` (`updateEffectState`, testa `StatusState.EffectState.ORCISH` = `StatusState.js:45`) que liga `this.isOrcish`; sprite trocado em `src/Renderer/Entity/EntityView.js:622` (`UpdateHead`) | Sim (generico para qualquer entidade, nao so o proprio jogador) | Nenhum necessario |
| 7. SA_AUTOSPELL | `ZC_AUTOSPELLLIST` 0x01cd (sai, 30 bytes, 7x skillId) + `CZ_SELECTAUTOSPELL` 0x01ce (entra, 6 bytes) | `src/Engine/MapEngine/Skill.js:353` (`onAutoSpellList`) + hookPacket `Skill.js:908-909`; parser `PacketStructure.js:6960-6971`; resposta `PacketStructure.js:1919-1930`; UI reaproveitada `src/UI/Components/ItemSelection/ItemSelection.js` (mesmo componente do warp point) | Sim | Nenhum necessario |
| 8. SA_ABRACADABRA | `ZC_AUTORUN_SKILL` 0x0147 (sai, 39 bytes) | `src/Engine/MapEngine/Skill.js:290` (`onAutoCastSkill`, chama `SkillWindow.getUI().useSkill(pkt.data)`) + hookPacket `Skill.js:905`; parser `PacketStructure.js:6103-6114`; uso em `src/UI/Components/SkillList/SkillListCommon.js:1087-1098` (auto-executa se `TYPE.SELF`, abre mira se `TYPE.TARGET`) | Sim | Nenhum necessario |

## Detalhe por item

### 1. WZ_ESTIMATION (Sense) — ja funcionava
`ZC_MONSTER_INFO` (0x018c) tem parser completo em `PacketStructure.js:6577-6598`
lendo os 9 campos na ordem do servidor (classe, nivel, tamanho, hp, def, raca,
mdef, elemento, e as 9 resistencias elementais em 1 byte cada). `Skill.js:925`
registra `onSense` (`Skill.js:871-874`), que chama `Sense.append()` e
`Sense.setWindow(pkt)`. `UI/Components/Sense/Sense.js:118-173` desenha o
sprite do monstro, nome, tamanho, nivel, raca, hp, def/mdef, elemento textual
e as 9 resistencias coloridas (verde/vermelho conforme acima/abaixo de 100).
Nao ha teste automatizado cobrindo, mas o codigo bate campo a campo com o que
o servidor manda.

### 2. AL_WARP (Warp Portal) — ja funcionava
`ZC_WARPLIST`/`WARPLIST2` (0x0abe, variavel) e lido em `PacketStructure.js:5794-5807`,
calculando quantos blocos de 16 bytes cabem no restante do pacote — compativel
com o formato variavel que o servidor usa. `Skill.js:911-912` registra
`onTeleportList` (`Skill.js:420-443`) para as duas variantes (0x011c e 0x0abe).
O handler monta um `NpcMenu` com os nomes dos mapas traduzidos + item "Cancel"
(linha 438) e, na escolha, monta `CZ_SELECT_WARPPOINT` com o `skillId` que o
PROPRIO pacote do servidor trouxe (`pkt.SKID`, que para AL_WARP e 27) e o nome
do mapa escolhido (`PacketStructure.js:958-971`, 20 bytes: skillId u16 + mapa
texto 16). O ESC e o botao Cancel do `NpcMenu` mandam `mapName = 'cancel'`.

### 3. RG_GRAFFITI — NAO funcionava, CONSERTADO (commit `35c7c7e5`)
O servidor planta a unidade com `unt = UNT_GRAFFITI` (0xb0/176) dentro do
`ZC_SKILL_ENTRY5`, que ja tinha parser (`PacketStructure.js`, campo `job` = o
unit type e `msg` = o texto do grafite) e hookPacket (`Entity.js`, `onSkillAppear`
-> `EntityManager` via `Network.hookPacket(PACKET.ZC.SKILL_ENTRY5, onSkillAppear)`).
O problema: `DB/Skills/SkillUnit.js:59` mapeia `SkillUnit[UNT_GRAFFITI] = EF_NONE`
(um `// Todo` deixado pelo roBrowser original, nao uma regressao deste bloco),
e a guarda de `EffectManager.spamSkillZone` (`if (!(effectId in EffectDB)) return;`)
retornava ANTES de criar qualquer `Entity` — nenhum sprite, nenhum efeito,
NADA na tela, e `pkt.msg` (o texto digitado pelo jogador) nunca chegava a
lugar nenhum.

Conserto em `src/Engine/MapEngine/Entity.js`, dentro de `onSkillAppear`: para
`pkt.job === SkillUnitConst.UNT_GRAFFITI` com `pkt.msg` presente, cria (ou
reaproveita, se o AID ja existir) uma `Entity` na posicao do grafite e chama
`entity.dialog.set(pkt.msg)` — o MESMO balao de fala que o proprio arquivo ja
usa em 5 outros pontos (linhas 1131, 1151, 1627, 1823, 2071) para mostrar o
nome de uma skill acima do personagem. Nao mexe em `EF_NONE` nem no
`spamSkillZone` generico (que continua no-op para este unit type, como
antes). A remocao usa o caminho normal de `onSkillDisapear`/`entity.remove()`,
sem mudanca nenhuma.

Teste novo, `tests/ui/graffitiDesenhaTexto.test.js` (4 casos, todos verdes):
cria a entidade e escreve `pkt.msg` no balao; `SKILL_DISAPPEAR` limpa o
balao; outro unit type sem `msg` (UNT_FIREWALL) nao cria nada; um segundo
`SKILL_ENTRY5` com o mesmo AID reusa a entidade (nao duplica).

### 4. AM_CANNIBALIZE / AM_SPHEREMINE — ja funcionava
O servidor documenta (`servidor/mapa/invocacao-no-fio.ts`, cabecalho do
modulo) que o invocado entra como um `ZC_NOTIFY_STANDENTRY11` comum — o MESMO
pacote de qualquer mob nascendo — com um `mobId` real do `mob_db` (Mandragora/
Hydra/Flora/Parasite/Geographer para AM_CANNIBALIZE por nivel, Marine Sphere
1142 para AM_SPHEREMINE; ver `combat/skills.ts` e `game/invocacao-do-alquimista.ts`
no repo do servidor). No cliente, `Entity.js:3217` registra o hookPacket
generico (`onEntitySpam`) para `STANDENTRY11`, sem nenhum `if` que distinga
invocacao de spawn normal. O sprite e resolvido so pelo numero do mob
(`DB/DBManager.js` `getBodyPath`, 1210-1313): `'data/sprite/monster/' +
(MonsterTable[id] || MonsterTable[1001]).toLowerCase()` — com fallback
gracioso pro Poring se o id nao existisse, nunca falha silenciosa total.
Como os mobIds usados sao monstros vanilla do RO, ja tem entrada em qualquer
`MonsterTable` completa — o desenho ja funciona sem case especial.

### 5. Homunculo — ja funcionava, ordem confirmada no servidor
`Homun.js:205` (`onHomunInformationUpdate`, hookPacket do 0x0230/`CHANGESTATE_MER`
em `PacketRegister.js:318`) so arma `Session.homunId = pkt.GID` (linha 212)
SE `EntityManager.get(pkt.GID)` ja retornar uma entidade (guarda `if (entity)`,
linha 206-208) — ou seja, o cliente exige que a ENTIDADE (STANDENTRY11) ja
exista antes do `ZC_CHANGESTATE_HOMUN`. E `Homun.js:75` (`onHomunInformation`,
hookPacket do 0x022e em `PacketRegister.js:316`) tem a guarda
`if (!Session.homunId) return;` na linha 78, que pula `HomunInformations.setInformations`
e `startAI()` se `Session.homunId` nao estiver armado ainda.

Isso poderia ter sido um bug de ordem se o servidor mandasse fora de
sequencia — mas o servidor JA documenta e JA garante a ordem certa:
`servidor/homunculo.ts:52-56` diz explicitamente "apresentacao
(`apresentarHomunculo`): `ZC_NOTIFY_STANDENTRY11` + `ZC_CHANGESTATE_HOMUN` +
`ZC_PROPERTY_HOMUN` — os TRES, nesta ordem", e `servidor/mapa/servidor-mapa.ts`
(func `apresentarHomunculo`, em torno da linha 18009-18057) manda o
`STANDENTRY11` primeiro, DEPOIS `ZC_CHANGESTATE_HOMUN` (linha 18057), DEPOIS
`ZC_PROPERTY_HOMUN`. Ou seja, a pre-condicao implicita do cliente ja e
satisfeita pelo servidor. A UI (`HomunInformations.js:276-393`,
`setInformations`) desenha nivel, hp/sp em barra, fome (`nFullness`) e
intimidade (`nRelationship`) a partir do pacote 0x022e. Enquadramento: o
enunciado original desta tarefa citava "73 bytes no fio" para o 0x022e base,
mas isso e de uma variante mais nova (`PROPERTY_HOMUN3`); o 0x022e classico
declara `.size = 71` (`PacketStructure.js:7798`) e os campos nomeados somam
exatamente 69 + 2 (opcode) = 71 — sem sobra, sem furo, nada a consertar.

### 6. SA_REVERSEORCISH — ja funcionava (confirmado)
`StatusState.js:45` define `ORCISH: 0x00000800`. `Entity.js` (`onEntityOptionChange`,
~2722-2740) le o `option`/`effectState` de QUALQUER entidade pelo AID do
pacote e atribui a `entity.effectState`, o que dispara o setter
`EntityState.js` (`updateEffectState`, 483-491): testa o bit `ORCISH` e liga
`this.isOrcish`. `EntityView.js:622` (`UpdateHead`) usa `this.isOrcish` para
escolher o sprite da cabeca de orc. E generico — nao ha checagem de "sou eu
mesmo" nesse trecho, entao qualquer entidade com o bit ligado ganha a cabeca.

### 7. SA_AUTOSPELL — ja funcionava
`ZC_AUTOSPELLLIST` (0x01cd, e a variante `0xafb`/AUTOSPELLLIST2) tem parser em
`PacketStructure.js:6960-6971` (7x `readLong`) e hookPacket em `Skill.js:908-909`
apontando para `onAutoSpellList` (`Skill.js:353-368`), que abre o MESMO
componente generico `ItemSelection` (`UI/Components/ItemSelection/ItemSelection.js`)
usado pelo warp point e pela identificacao de item — popula com os 7 skillIds
(`ItemSelection.setList(pkt.SKID, true)`) e, na escolha, monta e manda
`CZ_SELECTAUTOSPELL` (`PacketStructure.js:1919-1930`) com o `SKID` escolhido.

### 8. SA_ABRACADABRA — ja funcionava
`ZC_AUTORUN_SKILL` (0x0147) tem parser em `PacketStructure.js:6103-6114`
(skillId, tipo, nivel, sp, alcance, nome, evoluivel — bate campo a campo com o
servidor) e hookPacket em `Skill.js:905` apontando para `onAutoCastSkill`
(`Skill.js:290-292`), que chama `SkillWindow.getUI().useSkill(pkt.data)`. Essa
funcao (`SkillListCommon.js:1087-1098`) auto-executa a skill se ela for
`TYPE.SELF`, ou abre a mira de alvo (`SkillTargetSelection.set`) se for
`TYPE.TARGET` — exatamente o comportamento esperado do Abracadabra (a skill
sorteada fica pronta pra usar, como se o jogador tivesse acabado de clicar
nela).

## Pendente e por que

- Nenhum item do bloco 5 ficou sem tratador. So o item 3 (RG_GRAFFITI) estava
  quebrado e foi consertado nesta sessao.
- Nao ha pasta `tests/network` dedicada a parser/hookPacket de
  `PacketStructure.js`/`PacketRegister.js` no repo — os itens 1, 2, 5, 6, 7 e
  8 foram verificados so por leitura de codigo (parser + hookPacket + UI
  batendo campo a campo com o que o servidor manda), sem teste automatizado
  novo, porque nao havia comportamento ERRADO para cobrir e escrever um teste
  so de regressao para cada um seria um trabalho separado, fora do escopo
  desta auditoria (achar o que quebra e consertar o que quebra). Se o dono
  quiser blindagem permanente contra regressao futura nesses 6 pacotes, e um
  proximo passo natural, seguindo o padrao ja usado em `tests/ui/*.test.js`
  (mock de `Network.hookPacket`/`sendPacket`, pacote fake, checa a chamada).
- O item 5 (Homunculo) depende de uma ordem de pacotes que HOJE o servidor
  garante e documenta — mas essa dependencia e IMPLICITA no cliente (falha
  em silencio se a ordem for violada, sem log nenhum). Nao mexi no cliente
  porque a ordem de hoje ja e a exigida; fica registrado aqui como um ponto
  fragil caso algum ponto futuro do servidor mande `ZC_CHANGESTATE_HOMUN`
  antes do `STANDENTRY11`.
