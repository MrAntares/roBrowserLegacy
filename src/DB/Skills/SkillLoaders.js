import TextEncoding from 'Utils/CodepageManager.js';
import { createDBLoadContext } from 'DB/Loaders/DBLoadContext.js';
import JobId from 'DB/Jobs/JobConst.js';
import SKID from './SkillConst.js';
import SkillInfo from './SkillInfo.js';
import SkillTreeView from './SkillTreeView.js';
import { resetSkillTree, keepBuiltInSkills } from './SkillTreeMerge.js';

export function createSkillLoaders(DB, userCharpage) {
	const userStringDecoder = TextEncoding;
	function loadSkillInfoList(filename, callback, onEnd) {
		const { lua, loadFile, guard } = createDBLoadContext();
		callback = guard(callback);
		onEnd = guard(onEnd);

		loadFile(
			filename,
			async function (file) {
				try {
					console.log('Loading file "' + filename + '"...');

					// check if file is ArrayBuffer and convert to Uint8Array if necessary
					const buffer = file instanceof ArrayBuffer ? new Uint8Array(file) : file;

					// get context, a proxy. It will be used to interact with lua conveniently
					const ctx = lua.ctx;

					// Create automatic JT_ mappings
					const jobIdWithJT = { ...JobId };
					for (const [key, value] of Object.entries(JobId)) {
						jobIdWithJT[`JT_${key}`] = value;
					}
					ctx.JOBID = jobIdWithJT;
					await lua.doString(`
						if JOBID then
							__JOBID_ORIGINAL = JOBID
							JOBID = setmetatable({}, {
								__index = function(t, k)
									local id = __JOBID_ORIGINAL[k]
									return id ~= nil and id or 0
								end
							})
						end
					`);

					// create required functions in context
					ctx.AddSkillInfo = (
						skillId,
						resName,
						skillName,
						maxLv,
						spAmount,
						bSeperateLv,
						attackRange,
						skillScale
					) => {
						// Convert to format expected by SkillInfo.js
						const toArray = v => {
							if (Array.isArray(v)) {
								return v;
							}
							if (typeof v === 'object' && v !== null) {
								return Object.keys(v)
									.map(Number)
									.sort((a, b) => a - b)
									.map(k => v[k]);
							}
							return [];
						};
						SkillInfo[skillId] = {
							Name: userStringDecoder.decode(resName),
							SkillName: userStringDecoder.decode(skillName, userCharpage),
							MaxLv: maxLv,
							SpAmount: toArray(spAmount),
							bSeperateLv: bSeperateLv,
							AttackRange: toArray(attackRange),
							SkillScale: skillScale,
							NeedSkillList: {},
							_NeedSkillList: []
						};

						return 1;
					};

					ctx.AddSkillRequirement = (skillId, requiredSkillId, requiredLevel) => {
						SkillInfo[skillId]._NeedSkillList.push([requiredSkillId, requiredLevel]);
						return 1;
					};

					ctx.AddJobSkillRequirement = (skillId, jobId, requiredSkillId, requiredLevel) => {
						if (!SkillInfo[skillId].NeedSkillList[jobId]) {
							SkillInfo[skillId].NeedSkillList[jobId] = [];
						}
						SkillInfo[skillId].NeedSkillList[jobId].push([requiredSkillId, requiredLevel]);
						return 1;
					};

					ctx.SKID = SKID;
					await lua.doString(`
						if SKID then
							__SKID_ORIGINAL = SKID 

							SKID = setmetatable({}, {
								__index = function(t, k)
								local id = __SKID_ORIGINAL[k]
								return id ~= nil and id or 0 
								end
							})
						end
					`);

					// mount file
					lua.mountFile('skillinfolist.lub', buffer);

					// execute file
					await lua.doFile('skillinfolist.lub');

					// create and execute our own main function
					lua.doStringSync(`  
						function main_skillInfoList()  
							if not SKILL_INFO_LIST then  
								return false, "Error: SKILL_INFO_LIST is nil or not a table"  
							end  
						
							for skillId, skillData in pairs(SKILL_INFO_LIST) do 
								local resName = skillData[1] or "" 
								local skillName = skillData.SkillName or ""  
								local maxLv = skillData.MaxLv or 1  
								local spAmount = skillData.SpAmount or {}  
								local bSeperateLv = skillData.bSeperateLv or false  
								local attackRange = skillData.AttackRange or {}  
								local skillScale = skillData.SkillScale or {}  

								result, msg = AddSkillInfo(skillId, resName, skillName, maxLv, spAmount, bSeperateLv, attackRange, skillScale)  
								if not result then  
									return false, msg  
								end
								
								if skillData._NeedSkillList then  
									for _, req in ipairs(skillData._NeedSkillList) do  
										if req[1] and req[2] then  
											AddSkillRequirement(skillId, req[1], req[2])  
										end  
									end  
								end  
								
								if skillData.NeedSkillList then  
									for jobId, reqList in pairs(skillData.NeedSkillList) do  
										if reqList then  
											for _, req in ipairs(reqList) do  
												if req[1] and req[2] then  
													AddJobSkillRequirement(skillId, jobId, req[1], req[2])  
												end  
											end  
										end  
									end  
								end 

							end  
							return true, "good"  
							end
						main_skillInfoList()  
					`);
				} catch (error) {
					console.error('[loadSkillInfoList] Error: ', error);
				} finally {
					// release file from memory
					lua.unmountFile('skillinfolist.lub');
					// call onEnd
					onEnd();
				}
			},
			onEnd
		);
	}

	function loadSkillTreeView(filename, callback, onEnd) {
		const { lua, loadFile, guard } = createDBLoadContext();
		callback = guard(callback);
		onEnd = guard(onEnd);

		// First load jobinheritlist.lub
		loadFile(
			DB.LUA_PATH + 'skillinfoz/jobinheritlist.lub',
			async function (file) {
				try {
					console.log(`Loading file "${DB.LUA_PATH}skillinfoz/jobinheritlist.lub"...`);
					const buffer = file instanceof ArrayBuffer ? new Uint8Array(file) : file;

					// Mount and execute jobinheritlist.lub
					lua.mountFile('jobinheritlist.lub', buffer);
					await lua.doFile('jobinheritlist.lub');

					// Now load skilltreeview.lub
					loadSkillTreeViewData(filename, callback, onEnd);
				} catch (error) {
					console.error('[loadSkillTreeView - jobinheritlist] Error: ', error);
					onEnd();
				}
			},
			onEnd
		);
	}

	function loadSkillTreeViewData(filename, callback, onEnd) {
		const { lua, loadFile, guard } = createDBLoadContext();
		callback = guard(callback);
		onEnd = guard(onEnd);

		// Start from the built-in layout every time, so a second client loaded
		// after a server switch never inherits the first one's placements.
		resetSkillTree(SkillTreeView);
		const fileJobs = new Set();
		loadFile(
			filename,
			async function (file) {
				try {
					console.log('Loading file "' + filename + '"...');
					const buffer = file instanceof ArrayBuffer ? new Uint8Array(file) : file;
					const ctx = lua.ctx;
					// Create automatic JT_ mappings
					const jobIdWithJT = { ...JobId };
					for (const [key, value] of Object.entries(JobId)) {
						jobIdWithJT[`JT_${key}`] = value;
					}
					ctx.JOBID = jobIdWithJT;

					// Function to add skill tree data using job hierarchy from jobinheritlist.lub
					ctx.AddSkillTreeView = function (jobId, beforeJob) {
						// Calculate list and beforeJob from inheritance chain
						let list = 1;
						// TODO: Find another way to do that
						if (jobId === JobId.NOVICE) {
							list = 1;
						} else if (
							jobId < JobId.KNIGHT ||
							jobId === JobId.TAEKWON ||
							(jobId >= JobId.SUPERNOVICE && jobId <= JobId.NINJA) ||
							jobId == JobId.DO_SUMMONER ||
							jobId == JobId.DRUID
						) {
							list = 1;
						} else if (
							jobId < JobId.NOVICE_H ||
							jobId == JobId.STAR ||
							jobId == JobId.LINKER ||
							(jobId >= JobId.KAGEROU && jobId <= JobId.REBELLION) ||
							jobId == JobId.SUPERNOVICE2 ||
							jobId == JobId.SPIRIT_HANDLER ||
							jobId == JobId.KARNOS
						) {
							list = 2;
						} else if (
							(jobId <= JobId.THIEF_H && jobId >= JobId.NOVICE_H) ||
							(jobId >= JobId.NOVICE_B && jobId <= JobId.THIEF_B) ||
							jobId == JobId.DO_SUMMONER_B ||
							jobId == JobId.NINJA_B ||
							jobId == JobId.TAEKWON_B ||
							jobId == JobId.GUNSLINGER_B
						) {
							list = 1;
						} else if (
							jobId < JobId.RUNE_KNIGHT ||
							(jobId >= JobId.KNIGHT_B && jobId <= JobId.DANCER_B) ||
							(jobId >= JobId.KAGEROU_B && jobId <= JobId.REBELLION_B)
						) {
							list = 2;
						} else if (
							jobId < JobId.DRAGON_KNIGHT ||
							jobId == JobId.STAR_EMPEROR ||
							jobId == JobId.SOUL_REAPER ||
							(jobId >= JobId.RUNE_KNIGHT_B && jobId <= JobId.SHADOW_CHASER_B) ||
							jobId === JobId.EMPEROR_B ||
							jobId === JobId.REAPER_B ||
							jobId == JobId.ALITEA
						) {
							list = 3;
						} else if (
							jobId <= JobId.TROUVERE ||
							(jobId >= JobId.SKY_EMPEROR && jobId <= JobId.HYPER_NOVICE)
						) {
							list = 4;
						} else {
							list = 1;
							console.error(`[loadSkillTreeViewData] Failed to find inherith list job: (${jobId})`);
						}
						// Create the skill tree entry
						const entry = {
							list: list,
							beforeJob: beforeJob
						};

						// Remember the job, so skills this file leaves out can be
						// put back once it has been read (see below).
						fileJobs.add(jobId);
						SkillTreeView[jobId] = entry;
						return 1;
					};

					ctx.AddSkillToJob = function (jobId, pos, skillId) {
						if (SkillTreeView[jobId]) {
							SkillTreeView[jobId][skillId] = Number(pos);
						}
						return 1;
					};

					lua.doStringSync(`
						JobSkillTab = {}
					
						function JobSkillTab.ChangeSkillTabName(in_job, in_1sttab, in_2ndtab, in_3rdtab, in_4thtab)
							local tbl = {
								job = in_job,
								TabName1st = in_1sttab,
								TabName2nd = in_2ndtab,
								TabName3rd = in_3rdtab,
								TabName4th = in_4thtab
							}
							JobSkillTab[#JobSkillTab + 1] = tbl
							return true
						end
					`);

					ctx.SKID = SKID;
					await lua.doString(`
						if SKID then
							__SKID_ORIGINAL = SKID 

							SKID = setmetatable({}, {
								__index = function(t, k)
								local id = __SKID_ORIGINAL[k]
								return id ~= nil and id or 0 
								end
							})
						end
					`);

					lua.mountFile('skilltreeview.lub', buffer);
					await lua.doFile('skilltreeview.lub');

					lua.doStringSync(`    
						function main_skillTreeView()    
							if not SKILL_TREEVIEW_FOR_JOB then    
								return false, "Error: SKILL_TREEVIEW_FOR_JOB is nil or not a table"    
							end    
					
							for jobId, skillData in pairs(SKILL_TREEVIEW_FOR_JOB) do      
								local beforeJob = JOB_INHERIT_LIST[jobId] or nil  
								result, msg = AddSkillTreeView(jobId, beforeJob)      
								if not result then      
									return false, msg      
								end   
								
								for pos, skillId in pairs(skillData) do    
									result, msg = AddSkillToJob(jobId, pos, skillId)    
									if not result then    
										return false, msg    
									end    
								end  
							end    
							return true, "good"    
						end    
						
						main_skillTreeView()    
					`);

					// The client's file places only what that client version knew.
					// A skill the server has since added -- the newest 4th-job
					// skills are in no official skilltreeview.lub -- would otherwise
					// fall to the Etc tab, where it cannot be learned. Keep the
					// built-in position for any skill the file does not place, or
					// the next free slot when the file has taken that one.
					keepBuiltInSkills(SkillTreeView, fileJobs);
				} catch (error) {
					console.error('[loadSkillTreeView] Error: ', error);
				} finally {
					lua.unmountFile('skilltreeview.lub');
					lua.unmountFile('jobinheritlist.lub');
					onEnd();
				}
			},
			onEnd
		);
	}
	return { loadSkillInfoList, loadSkillTreeView };
}
