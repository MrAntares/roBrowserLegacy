import TextEncoding from 'Utils/CodepageManager.js';
import { createDBLoadContext } from 'DB/Loaders/DBLoadContext.js';
import WeaponTable from 'DB/Items/WeaponTable.js';
import WeaponHitSoundTable from 'DB/Items/WeaponHitSoundTable.js';
import WeaponTypeExpansion from 'DB/Items/WeaponTypeExpansion.js';

const userStringDecoder = TextEncoding;

export function loadWeaponTable(filename, callback, onEnd) {
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

				// create required functions in context
				ctx.AddWeaponName = (weaponID, weaponName) => {
					const decoded_weaponName =
						weaponName && weaponName.length > 0 ? userStringDecoder.decode(weaponName) : '';
					WeaponTable[weaponID] = decoded_weaponName;
					return 1;
				};

				ctx.AddWeaponHitSound = (weaponID, soundFile) => {
					const decoded_soundFile =
						soundFile && soundFile.length > 0 ? userStringDecoder.decode(soundFile) : '';
					WeaponHitSoundTable[weaponID] = decoded_soundFile;
					return 1;
				};

				ctx.AddExpansionWeapon = (weaponID, expansionWeaponID) => {
					WeaponTypeExpansion[weaponID] = expansionWeaponID;
					return 1;
				};

				// mount file
				lua.mountFile('weapontable.lub', buffer);

				// execute file
				await lua.doFile('weapontable.lub');

				// create and execute our own main function
				lua.doStringSync(`  
						function main_weapontable()  
							-- Process WeaponNameTable  
							if type(WeaponNameTable) == "table" then  
								for weaponID, weaponName in pairs(WeaponNameTable) do  
									result, msg = AddWeaponName(weaponID, weaponName)  
									if not result then  
										return false, msg  
									end  
								end  
							end  
							
							-- Process WeaponHitWaveNameTable  (seems like gravity is still using the hardcoded sound files)
							-- uncomment this if you want to use the custom sound files
							--if type(WeaponHitWaveNameTable) == "table" then  
							--	for weaponID, soundFile in pairs(WeaponHitWaveNameTable) do  
							--		result, msg = AddWeaponHitSound(weaponID, soundFile)  
							--		if not result then  
							--			return false, msg  
							--		end  
							--	end  
							--end  

							-- Process WeaponTypeExpansionTable
							if type(Expansion_Weapon_IDs) == "table" then  
								for weaponID, expansionWeaponID in pairs(Expansion_Weapon_IDs) do  
									result, msg = AddExpansionWeapon(weaponID, expansionWeaponID)  
									if not result then  
										return false, msg  
									end  
								end  
							end  
							
							return true, "success"  
						end  
						main_weapontable()  
					`);
			} catch (error) {
				console.error('[loadWeaponTable] Error: ', error);
			} finally {
				// release file from memory
				lua.unmountFile('weapontable.lub');

				// call onEnd
				onEnd();
			}
		},
		onEnd
	);
}
