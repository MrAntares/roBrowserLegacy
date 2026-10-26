## Test Topology (`tests/`)

| Directory / file | Coverage / responsibility |
| ---------------- | ------------------------- |
| `controls/` | Gameplay command processing behavior and performance. |
| `core/` | Client file caching and storage, Lua module loading, and performance probes. |
| `db/` | Database lookups, constants, equipment and skill metadata, and related merge behavior. |
| `engine/` | Login, character, and map engine behavior, including guild, inventory, equipment, pets, and messages. |
| `fixtures/` | Shared synthetic test data and fixture documentation. |
| `loaders/` | Binary asset loaders and format behavior; `.wat`/JavaScript decoder parity tests. |
| `network/` | Packet registration and individual packet handler behavior. |
| `renderer/` | Rendering, entity, map, effects, frame pacing, and `GR2/` actor/model integration. |
| `ui/` | UI components and interactions, including chat, inventory, guild, storage, and navigation-related behavior. |
| `util/` | Shared utility behavior: binary I/O, encoding, pathfinding, checksums, textures, and related helpers. |
| `bench/` | Benchmarks for palette conversion, sprite compilation and frames, and Targa processing. |
| `setup.js` | Shared Vitest environment setup, including canvas and local-storage mocks. |

| Directory | Files Name |
| --- | --- |
| `bench/`| `paletteConvert.bench.js`, `spriteCompile.bench.js`, `spriteFrame.bench.js`, `targa.bench.js` |
| `controls/`| `ProcessCommand.perf.test.js`, `ProcessCommand.test.js` |
| `core/`| `FileManager.cacheReject.test.js`, `FileSystem.storedNames.test.js`, `LuaModuleLoader.test.js`, `PerfProbe.test.js` |
| `db/`| `BodyPalPath.test.js`, `Emotions.test.js`, `EmotionsConst.test.js`, `EquipmentLocation.test.js`, `IsShield.test.js`, `ItemType.test.js`, `JobConst.test.js`, `SkillAction.test.js`, `SkillConst.test.js`, `SkillTreeMerge.test.js`, `StatusConst.test.js`, `TownInfo.test.js`, `WeaponType.test.js` |
| `engine/`| `CharEngine.reload.test.js`, `LoginEngine.ban.test.js`, `MapEngine.Guild.test.js`, `MapEngine.Item.Equip.test.js`, `MapEngine.Item.inventory.test.js`, `MapEngine.Pet.test.js`, `MapEngine.PrivateMessage.test.js`, `OffhandWeapon.test.js` |
| `fixtures/`| `defaultAIfs.js`, `guildMembers.js`, `README.md` |
| `loaders/`| `Action.test.js`, `Altitude.test.js`, `GameFile.test.js`, `GameFileDecrypt.test.js`, `GR2Loader.test.js`, `Ground.test.js`, `MapLoader.test.js`, `Model.test.js`, `paletteConvert.parity.test.js`, `Sprite.test.js`, `spriteCompile.parity.test.js`, `spriteFrame.parity.test.js`, `Str.test.js`, `Targa.parity.test.js`, `Targa.test.js`, `World.test.js` |
| `network/`| `CashShopBuyResult.test.js`, `ChangeGuild.test.js`, `GuildBanList.test.js`, `PacketRegister.test.js`, `PcCashPointItemList.test.js` |
| `renderer/`| `Altitude.test.js`, `EntityBodyPalette.test.js`, `EntityDisplay.test.js`, `EntityManager.culling.test.js`, `EntityWeaponExpansion.test.js`, `FramePacer.test.js`, `MapRenderer.test.js`, `OccluderFade.test.js`, `Renderer.cursor.test.js`, `SpriteBatch.test.js`, `StrEffectFallback.test.js`, `GR2/actorAction.test.js`, `GR2/gr2Banks.test.js`, `GR2/gr2Entity.test.js`, `GR2/gr2Pack.test.js`, `GR2/gr2World.test.js` |
| `ui/`| `Background.fadeTakeover.test.js`, `Background.transition.test.js`, `CartItems.altTransfer.test.js`, `CartItems.drop.test.js`, `CashShop.search.test.js`, `CashShop.tabs.test.js`, `ChatBox.colorCodes.test.js`, `ChatBox.enterKey.test.js`, `ChatBox.itemLinks.test.js`, `ChatBox.multiline.test.js`, `ChatBox.paste.test.js`, `ChatBox.tabClick.test.js`, `ChatBox.tabs.test.js`, `ChatBox.whisper.test.js`, `ChatBoxSettings.allOn.test.js`, `CursorManager.test.js`, `Equipment.cartButton.test.js`, `GrfViewer.mapPreview.test.js`, `GUIComponent.test.js`, `GUIComponentLazyImages.test.js`, `Guild.affordances.test.js`, `Guild.disband.test.js`, `Guild.emblem.test.js`, `Guild.info.test.js`, `Guild.members.test.js`, `Guild.notice.test.js`, `Guild.position.test.js`, `Guild.skills.test.js`, `GuildCompanion.test.js`, `InventoryCommon.reduce.test.js`, `JoystickInputService.test.js`, `JoystickUIRenderer.test.js`, `PartyFriendsCommon.test.js`, `PvPTimerBanner.test.js`, `Quest.missionHuntChat.test.js`, `Rodex.toggle.test.js`, `SkillDescription.jobLines.test.js`, `SkillListV2.test.js`, `SlotMachine.loadGuard.test.js`, `Storage.search.test.js`, `StorageFilter.test.js`, `UIManager.errorBox.test.js`, `WhenDrawn.test.js`, `WorldMapParty.test.js`, `WriteRodex.characterInfo.test.js` |
| `util/`| `Base62.test.js`, `BinaryReader.test.js`, `BinaryWriter.test.js`, `CodepageManager.test.js`, `colors.test.js`, `CRC32.test.js`, `Executable.test.js`, `HTMLEntity.test.js`, `Inflate.test.js`, `partyColors.test.js`, `PathFinding.test.js`, `Queue.test.js`, `Struct.test.js`, `Texture.test.js` |
| `setup.js`| `setup.js` |