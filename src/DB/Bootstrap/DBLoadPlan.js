export function createDBLoadPlan(DB, context) {
	const {
		mergeAchievements,
		Configs,
		Ez2streffect,
		mergeAccessoryNames,
		legacyItemRows,
		setJokeRow,
		setLegacyMapMusic,
		setLegacyMapName,
		setMapAlias,
		mergeMonsterNames,
		MsgEmotionCSV,
		MsgStringTable,
		setMessageRow,
		mergeSkillIds,
		NaviLinkDistanceTable,
		NaviLinkTable,
		NaviMapTable,
		NaviMobTable,
		NaviNpcDistanceTable,
		NaviNpcTable,
		Network,
		PACKET,
		PACKETVER,
		PrivateAirship,
		mergeRandomOptions,
		ReputeGroup,
		ReputeInfo,
		mergeRobeNames,
		setScreamRow,
		parseBuyingStoreItem,
		fillNaviTable,
		getSystemAliases,
		loadAttendanceFile,
		loadBSONFile,
		loadCSV,
		loadCashShopBanner,
		loadEnchantListFile,
		loadFontFromClient,
		loadHatEffectInfo,
		loadItemDBTable,
		loadItemInfo,
		loadItemReformFile,
		loadLaphineSysFile,
		loadLaphineUpgFile,
		loadLuaTable,
		loadLuaValue,
		loadMapTbl,
		loadMoveInfoTable,
		loadPetEvolution,
		loadPetInfo,
		loadPrivateAirship,
		loadQuestInfo,
		loadSignBoardData,
		loadSignBoardList,
		loadSkillInfoList,
		loadSkillTreeView,
		loadStateIconInfo,
		loadTable,
		loadTitleTable,
		loadTownInfoFile,
		loadWeaponTable,
		loadWorldMapInfo,
		loadXMLFile,
		mergeEz2Effects,
		ownerNames,
		parseFogEntry,
		parseIndoorEntry,
		parseQuestEntry,
		parseLegacySkillDescription,
		setPetTalkTable,
		setSkillDescription,
		tryLoadLuaAliases,
		getUserCharpage,
		userCharpage
	} = context;
	const resolveUserCharpage = getUserCharpage ?? userCharpage;
	function loadLazy(onLoad, isCurrent) {
		const guard =
			callback =>
			(...args) => {
				if (isCurrent() && callback) return callback(...args);
			};

		loadFontFromClient('System/Font/');

		const guardedLoadTable = (file, separator, size, row, done, useCharPage) =>
			loadTable(file, separator, size, guard(row), guard(done), useCharPage);
		const guardedLoadCSV = (file, target, key, value, done) =>
			loadCSV(file, target, key, value, guard(done), isCurrent);
		const guardedLoadXMLFile = (file, callback, done) => loadXMLFile(file, guard(callback), guard(done));
		const guardedLoadBSONFile = (file, target, done) => loadBSONFile(file, target, guard(done), isCurrent);

		// Loading TXT Tables
		guardedLoadTable(
			'data/mp3nametable.txt',
			'#',
			2,
			function (_index, key, val) {
				setLegacyMapMusic(_index, key, val);
			},
			onLoad()
		);
		guardedLoadTable(
			'data/mapnametable.txt',
			'#',
			2,
			function (_index, key, val) {
				setLegacyMapName(_index, key, val);
			},
			onLoad(),
			true
		);
		if (PACKETVER.value >= 20230302) {
			guardedLoadCSV('data/msgstringtable.csv', MsgStringTable, 0, 1, onLoad());
		} else {
			guardedLoadTable(
				'data/msgstringtable.txt',
				'#',
				1,
				(_index, val) => {
					setMessageRow(_index, val);
				},
				onLoad(),
				true
			);
		}

		guardedLoadTable(
			'data/resnametable.txt',
			'#',
			2,
			function (_index, key, val) {
				setMapAlias(_index, key, val);
			},
			onLoad()
		);
		// CSV Tables - Client Date is not sure since when they were added
		if (PACKETVER.value >= 20230302) {
			guardedLoadCSV('data/simplemsg/msg_emotion.csv', MsgEmotionCSV, 0, 2, onLoad());
		}
		// TODO: load these load files by PACKETVER
		if (Configs.get('loadLua')) {
			// Item
			let iteminfoNames = [];
			const customII = Configs.get('customItemInfo', []);

			const guardedLoadItemInfo = (file, callback, done) => loadItemInfo(file, guard(callback), guard(done));
			if (Array.isArray(customII) && customII.length > 0) {
				// add custom client info table
				iteminfoNames = iteminfoNames.concat(customII);
				tryLoadLuaAliases(guardedLoadItemInfo, iteminfoNames, null, onLoad(), true);
			} else {
				iteminfoNames = iteminfoNames.concat(getSystemAliases('System/itemInfo.lub'));
				tryLoadLuaAliases(guardedLoadItemInfo, iteminfoNames, null, onLoad());
			}

			loadLuaTable(
				[DB.LUA_PATH + 'datainfo/accessoryid.lub', DB.LUA_PATH + 'datainfo/accname.lub'],
				'AccNameTable',
				mergeAccessoryNames,
				onLoad(),
				null,
				false
			);
			loadLuaTable(
				[DB.LUA_PATH + 'datainfo/spriterobeid.lub', DB.LUA_PATH + 'datainfo/spriterobename.lub'],
				'RobeNameTable',
				mergeRobeNames,
				onLoad(),
				null,
				false
			);

			if (PACKETVER.value >= 20141008) {
				const onMonsterEnd = onLoad();
				loadLuaTable(
					[DB.LUA_PATH + 'datainfo/npcidentity.lub', DB.LUA_PATH + 'datainfo/jobname.lub'],
					'JobNameTable',
					mergeMonsterNames,
					function (success) {
						if (!success) {
							onMonsterEnd();
							return;
						}
						loadPetInfo(DB.LUA_PATH + 'datainfo/petinfo.lub', null, function () {
							tryLoadLuaAliases(
								loadPetEvolution,
								getSystemAliases('System/PetEvolutionCln.lub'),
								null,
								onMonsterEnd
							);
						});
					},
					null,
					false
				);
			} else {
				loadLuaTable(
					[DB.LUA_PATH + 'datainfo/npcidentity.lub', DB.LUA_PATH + 'datainfo/jobname.lub'],
					'JobNameTable',
					mergeMonsterNames,
					onLoad(),
					null,
					false
				);
			}

			loadLuaTable(
				[DB.LUA_PATH + 'datainfo/enumvar.lub', DB.LUA_PATH + 'datainfo/addrandomoptionnametable.lub'],
				'NameTable_VAR',
				mergeRandomOptions,
				onLoad()
			);
			loadItemDBTable(DB.LUA_PATH + 'ItemDBNameTbl.lub', null, onLoad());

			// Weapon tables
			loadWeaponTable(DB.LUA_PATH + 'datainfo/weapontable.lub', null, onLoad());

			// Title tables
			if (PACKETVER.value >= 20170208) {
				loadTitleTable(DB.LUA_PATH + 'datainfo/titletable.lub', null, onLoad());
			}

			// Skill - load skillid.lub to populate SKID, then load description
			const onSkillEnd = onLoad();
			loadLuaValue(DB.LUA_PATH + 'skillinfoz/skillid.lub', 'SKID', json => {
				mergeSkillIds(json);
				// Load description - skillid.lub is re-executed harmlessly (Lua just repopulates globals)
				loadLuaTable(
					[DB.LUA_PATH + 'skillinfoz/skillid.lub', DB.LUA_PATH + 'skillinfoz/skilldescript.lub'],
					'SKILL_DESCRIPT',
					_json => {
						setSkillDescription(_json);
					},
					() => {
						// Calls after skillids and descs been populated
						loadSkillInfoList(DB.LUA_PATH + 'skillinfoz/skillinfolist.lub', null, () => {
							loadSkillTreeView(DB.LUA_PATH + 'skillinfoz/skilltreeview.lub', null, () => {
								// Load ez2streffect, PACKETVER unknown when the while has been added, tied to default PACKETVER of rathena for 4th job
								if (PACKETVER.value >= 20211103) {
									guardedLoadBSONFile(
										'data/contentdata/effectdata/ez2streffect.bson',
										Ez2streffect,
										() => {
											Promise.all([
												import('DB/Effects/EffectTable.js'),
												import('DB/Skills/SkillEffect.js')
											])
												.then(([EffectTable, SkillEffect]) => {
													if (!isCurrent()) return;
													mergeEz2Effects(
														EffectTable.default,
														SkillEffect.default,
														Ez2streffect
													);
												})
												.catch(error => console.error('[DB] Failed to merge effects:', error))
												.finally(onSkillEnd);
										}
									);
									return;
								}
								// Skill Lua finished
								onSkillEnd();
							});
						});
					}
				);
			});

			// Status
			loadStateIconInfo(DB.LUA_PATH + 'stateicon/', null, onLoad(), resolveUserCharpage);

			// Legacy Navigation
			if (PACKETVER.value >= 20111010) {
				loadLuaValue(
					DB.LUA_PATH + 'navigation/navi_map_krpri.lub',
					'Navi_Map',
					function (json) {
						fillNaviTable(NaviMapTable, json);
					},
					onLoad()
				);
				loadLuaValue(
					DB.LUA_PATH + 'navigation/navi_mob_krpri.lub',
					'Navi_Mob',
					function (json) {
						fillNaviTable(NaviMobTable, json);
					},
					onLoad()
				);
				loadLuaValue(
					DB.LUA_PATH + 'navigation/navi_npc_krpri.lub',
					'Navi_Npc',
					function (json) {
						fillNaviTable(NaviNpcTable, json);
					},
					onLoad()
				);
				loadLuaValue(
					DB.LUA_PATH + 'navigation/navi_link_krpri.lub',
					'Navi_Link',
					function (json) {
						fillNaviTable(NaviLinkTable, json);
					},
					onLoad()
				);
				loadLuaValue(
					DB.LUA_PATH + 'navigation/navi_linkdistance_krpri.lub',
					'Navi_Distance',
					function (json) {
						fillNaviTable(NaviLinkDistanceTable, json);
					},
					onLoad()
				);
				loadLuaValue(
					DB.LUA_PATH + 'navigation/navi_npcdistance_krpri.lub',
					'Navi_NpcDistance',
					function (json) {
						fillNaviTable(NaviNpcDistanceTable, json);
					},
					onLoad()
				);
			}

			// HatEffect
			if (PACKETVER.value >= 20150507) {
				loadHatEffectInfo(DB.LUA_PATH, onLoad());
			}

			// LaphineSys
			if (PACKETVER.value >= 20160601) {
				loadLaphineSysFile(DB.LUA_PATH + 'datainfo/lapineddukddakbox.lub', null, onLoad());
			}

			// LaphineUpg
			if (PACKETVER.value >= 20170726) {
				loadLaphineUpgFile(DB.LUA_PATH + 'datainfo/lapineupgradebox.lub', null, onLoad());
			}

			// ItemReform
			if (PACKETVER.value >= 20200916) {
				loadItemReformFile(DB.LUA_PATH + 'ItemReform/ItemReformSystem.lub', null, onLoad());
			}

			// EnchantList
			if (PACKETVER.value >= 20211103) {
				loadEnchantListFile(DB.LUA_PATH + 'Enchant/EnchantList', onLoad());
			}

			// MapName
			if (Configs.get('enableMapName') /*PACKETVER.value >= 20190605*/) {
				// We allow this feature to be enabled on any version due to popular demand
				tryLoadLuaAliases(loadMapTbl, getSystemAliases('System/mapInfo.lub'), null, onLoad());
			}

			// EntitySignBoard
			const onSignBoardEnd = onLoad();
			loadSignBoardList(DB.LUA_PATH + 'SignBoardList.lub', null, () => {
				// this is not official, its a translation file
				loadSignBoardData('SystemEN/Sign_Data.lub', null, onSignBoardEnd);
			});

			// CheckAttendance
			if (Configs.get('enableCheckAttendance') && PACKETVER.value >= 20180307) {
				loadAttendanceFile('System/CheckAttendance.lub', null, onLoad());
			}

			// Quest
			const onQuestEnd = onLoad();
			tryLoadLuaAliases(loadQuestInfo, getSystemAliases('System/OngoingQuestInfoList.lub'), null, () => {
				// this is not official, its a translation file
				loadQuestInfo('SystemEN/OngoingQuests.lub', null, onQuestEnd);
			});

			// TODO: System/RecommendedQuests.lub

			// Achievements
			if (Configs.get('enableAchievements') && PACKETVER.value >= 20150513) {
				loadLuaValue('System/achievement_list.lub', 'achievement_tbl', mergeAchievements, onLoad());
			}

			// Cash Shop Banner - implemented early 2018
			if (Configs.get('enableCashShop') && PACKETVER.value >= 20180000) {
				loadCashShopBanner(DB.LUA_PATH + 'datainfo/tb_cashshop_banner.lub', null, onLoad());
			}
		} else {
			// Item
			guardedLoadTable(
				'data/num2itemdisplaynametable.txt',
				'#',
				2,
				legacyItemRows.unidentifiedDisplayName,
				onLoad(),
				true
			);
			guardedLoadTable(
				'data/num2itemresnametable.txt',
				'#',
				2,
				legacyItemRows.unidentifiedResourceName,
				onLoad()
			);
			guardedLoadTable(
				'data/num2itemdesctable.txt',
				'#',
				2,
				legacyItemRows.unidentifiedDescriptionName,
				onLoad(),
				true
			);
			guardedLoadTable(
				'data/idnum2itemdisplaynametable.txt',
				'#',
				2,
				legacyItemRows.identifiedDisplayName,
				onLoad(),
				true
			);
			guardedLoadTable(
				'data/idnum2itemresnametable.txt',
				'#',
				2,
				legacyItemRows.identifiedResourceName,
				onLoad()
			);
			guardedLoadTable(
				'data/idnum2itemdesctable.txt',
				'#',
				2,
				legacyItemRows.identifiedDescriptionName,
				onLoad(),
				true
			);
			guardedLoadTable('data/itemslotcounttable.txt', '#', 2, legacyItemRows.slotCount, onLoad());

			// Skill
			guardedLoadTable('data/skilldesctable.txt', '#', 2, parseLegacySkillDescription, onLoad(), true);
			// TODO: data/skillnametable.txt	- ?
			// TODO: data/skilltreeview.txt	- Replaces DB/Skills/SkillTreeView.js
			// TODO: data/leveluseskillspamount.txt	- Replaces DB/Skills/SkillInfo.js -> SkillInfo.SpAmount

			// Quest
			guardedLoadTable('data/questid2display.txt', '#', 6, parseQuestEntry, onLoad(), true);
		}

		// Load ItemMoveInfo and attach to ItemTable
		if (PACKETVER.value >= 20150422) {
			loadMoveInfoTable(resolveUserCharpage, onLoad());
		}

		// WoldMap
		loadWorldMapInfo(DB.LUA_PATH + 'worldviewdata/', onLoad());
		// Private Airship: where a flight may start and land, and what pays for it.
		// Cleared first, so a server without the file never keeps the last one's.
		PrivateAirship.reset();
		if (PACKETVER.value >= 20180321) {
			tryLoadLuaAliases(
				loadPrivateAirship,
				['System/PrivateAirplane_True.lub', ...getSystemAliases('System/PrivateAirplane.lub')],
				null,
				onLoad()
			);
		}

		// Town Info
		const onTownInfoEnd = onLoad();
		loadTownInfoFile('System/Towninfo.lub', null, () => {
			// this is not official, its a translation file
			loadTownInfoFile('SystemEN/Towninfo.lub', null, onTownInfoEnd);
		});

		// Forging/Creation
		guardedLoadTable('data/metalprocessitemlist.txt', '#', 2, legacyItemRows.processitemlist, onLoad(), true);

		// Card
		guardedLoadTable('data/num2cardillustnametable.txt', '#', 2, legacyItemRows.illustResourcesName, onLoad());
		guardedLoadTable('data/cardprefixnametable.txt', '#', 2, legacyItemRows.prefixName, onLoad(), true);
		guardedLoadTable('data/cardpostfixnametable.txt', '#', 1, legacyItemRows.isPostfix, onLoad(), true);

		// EtcMapData
		guardedLoadTable('data/fogparametertable.txt', '#', 5, parseFogEntry, onLoad());
		guardedLoadTable('data/indoorrswtable.txt', '#', 1, parseIndoorEntry, onLoad());

		// Frost/Scream
		guardedLoadTable('data/ba_frostjoke.txt', '\t', 1, setJokeRow, onLoad(), true);
		guardedLoadTable('data/dc_scream.txt', '\t', 1, setScreamRow, onLoad(), true);

		// Tips
		// TODO: /tipoftheday.txt
		// TODO: /GuildTip.txt

		guardedLoadXMLFile(
			'data/pettalktable.xml',
			function (json) {
				setPetTalkTable(json['monster_talk_table']);
			},
			onLoad()
		);

		if (PACKETVER.value >= 20100427) {
			guardedLoadTable('data/buyingstoreitemlist.txt', '#', 1, parseBuyingStoreItem, onLoad());
		}

		// Reputation
		if (PACKETVER.value >= 20220330) {
			guardedLoadBSONFile('data/contentdata/repute/reputegroupdata.bson', ReputeGroup, function () {});
			guardedLoadBSONFile('data/contentdata/repute/reputeinfodata.bson', ReputeInfo, function () {});
		}

		Network.hookPacket(PACKET.ZC.ACK_REQNAME_BYGID, ownerNames.onUpdateOwnerName);
		Network.hookPacket(PACKET.ZC.ACK_REQNAME_BYGID2, ownerNames.onUpdateOwnerName);

		const onAIDriverLoaded = onLoad();
		import('Core/AIDriver.js')
			.then(module => {
				if (isCurrent()) return module.default.initAI(onAIDriverLoaded, isCurrent);
			})
			.catch(error => {
				console.error('[DB] Failed to initialize AI:', error);
				onAIDriverLoaded();
			});
	}
	return { loadLazy };
}
