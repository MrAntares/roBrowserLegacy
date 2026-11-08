import Client from 'Core/Client.js';

export function createEmblemLoader(DB) {
	return class EmblemLoader {
		static loadClanEmblem(clanId, callback) {
			Client.loadFile(
				DB.INTERFACE_PATH + 'clan_system/clan_emblem' + clanId.toString().padStart(2, '0') + '.bmp',
				function (dataURI) {
					const img = new Image();
					img.decoding = 'async';
					img.src = dataURI; // String Base64

					// wait image load to call the callback
					img.onload = function () {
						callback(img);
					};
				}
			);
		}

		static loadGroupEmblem(groupId, callback) {
			const extension = [22, 23, 24, 25].includes(groupId) ? 'gif' : 'bmp'; // for some reason 22 ~ 25 group emblem has .gif extension

			Client.loadFile(DB.INTERFACE_PATH + 'group/group_' + groupId + '.' + extension, function (dataURI) {
				const img = new Image();
				img.decoding = 'async';
				img.src = dataURI; // String Base64

				// wait image load to call the callback
				img.onload = function () {
					callback(img);
				};
			});
		}

		static loadMobEmblem(mobType, callback) {
			let monType = '';

			switch (mobType) {
				case 1:
					monType = 'montype_boss.bmp';
					break;
				case 2:
					monType = 'montype_mvp.bmp';
					break;
				default:
					console.error('Unknown mob type:', mobType);
					return;
			}

			Client.loadFile(DB.INTERFACE_PATH + monType, function (dataURI) {
				const img = new Image();
				img.decoding = 'async';
				img.src = dataURI; // String Base64

				// wait image load to call the callback
				img.onload = function () {
					callback(img);
				};
			});
		}
	};
}
