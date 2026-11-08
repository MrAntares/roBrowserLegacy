import Network from 'Network/NetworkManager.js';
import PACKET from 'Network/PacketStructure.js';
import PACKETVER from 'Network/PacketVerManager.js';

export const ownerNameState = { CNameTable: {}, UpdateOwnerName: {}, _nameCallbacks: {}, _nameCallbackTimers: {} };

export function createOwnerNameResolver(DB) {
	function onUpdateOwnerName(pkt) {
		DB.CNameTable[pkt.GID] = pkt.CName;
		DB._resolveNameCallbacks(pkt.GID, pkt.CName);
		DB.UpdateOwnerName[pkt.GID] = pkt;
	}
	class OwnerNameResolver {
		static getNameByGID(GID, ttl = 8000) {
			// Already have a real name cached — resolve immediately
			if (DB.CNameTable[GID] && DB.CNameTable[GID] !== 'Unknown') {
				return Promise.resolve(DB.CNameTable[GID]);
			}

			// Already requested (pending 'Unknown') — don't re-send, just
			// return a promise that piggybacks on the existing in-flight request
			if (DB.CNameTable[GID] === 'Unknown') {
				return new Promise(resolve => {
					if (!DB._nameCallbacks[GID]) {
						DB._nameCallbacks[GID] = [];
					}
					DB._nameCallbacks[GID].push(resolve);
				});
			}

			// New request — send to server
			let pkt;
			if (PACKETVER.value >= 20180307) {
				pkt = new PACKET.CZ.REQNAME_BYGID2();
			} else {
				pkt = new PACKET.CZ.REQNAME_BYGID();
			}
			pkt.GID = GID;
			Network.sendPacket(pkt);
			DB.CNameTable[pkt.GID] = 'Unknown';

			// Arm a TTL timer so callbacks are never leaked if the server is silent
			DB._nameCallbackTimers[GID] = setTimeout(() => {
				// Only act if the entry hasn't already been resolved by the server
				if (DB._nameCallbacks[GID]) {
					// Clear the 'Unknown' sentinel so the next caller can retry
					delete DB.CNameTable[GID];
					DB._resolveNameCallbacks(GID, 'Unknown');
				}
				delete DB._nameCallbackTimers[GID];
			}, ttl);

			return new Promise(resolve => {
				if (!DB._nameCallbacks[GID]) {
					DB._nameCallbacks[GID] = [];
				}
				DB._nameCallbacks[GID].push(resolve);
			});
		}

		static _resolveNameCallbacks(GID, name) {
			// Cancel the TTL timer if the server replied before it fired
			if (DB._nameCallbackTimers[GID]) {
				clearTimeout(DB._nameCallbackTimers[GID]);
				delete DB._nameCallbackTimers[GID];
			}
			const callbacks = DB._nameCallbacks[GID];
			if (callbacks) {
				delete DB._nameCallbacks[GID];
				for (const cb of callbacks) {
					cb(name);
				}
			}
		}
	}
	return { onUpdateOwnerName, OwnerNameResolver };
}
