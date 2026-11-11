import { createDBLoadPlan } from 'DB/Bootstrap/DBLoadPlan.js';

export function createDBBootstrap(DB, context) {
	const {
		Client,
		JobId,
		LuaModuleLoader,
		MemoryManager,
		NaviLinkDistanceTable,
		NaviLinkTable,
		NaviMapTable,
		NaviMobTable,
		NaviNpcDistanceTable,
		NaviNpcTable,
		clearNavigationMobIndex,
		resetLoadedMapNames,
		resetClientData,
		invalidateLuaRuntime,
		startLua
	} = context;
	const plan = createDBLoadPlan(DB, context);
	let mountPalettes;
	let mountPalettesProbe = null;
	let generation = 0;
	let lazyGeneration = 0;
	function createTracker(current, update, complete, isActive = () => true) {
		let count = 0;
		let index = 0;
		let sealed = false;
		let completed = false;
		function maybeComplete() {
			if (!completed && sealed && index === count && current === generation && isActive()) {
				completed = true;
				complete();
			}
		}
		return {
			step() {
				count++;
				let done = false;
				return () => {
					if (done || current !== generation || !isActive()) return;
					done = true;
					index++;
					update(index, count);
					maybeComplete();
				};
			},
			seal() {
				sealed = true;
				maybeComplete();
			}
		};
	}
	return class DBBootstrap {
		static init() {
			const current = ++generation;
			lazyGeneration++;
			if (invalidateLuaRuntime) invalidateLuaRuntime();
			if (Client.invalidateDBFiles) Client.invalidateDBFiles();
			DB.isLoaded = false;
			DB.count = 0;
			DB.index = 0;

			// The client loaded after a server switch may be another archive: ask
			// it again, and drop the previous answer the file cache keeps by name.
			// A request still on its way would land in the file cache under that
			// name: it is dropped once it lands instead.
			LuaModuleLoader.clearCache();
			mountPalettes = undefined;
			if (mountPalettesProbe) {
				mountPalettesProbe.stale = true;
			} else {
				MemoryManager.remove(null, DB.getBodyPalPath(JobId.PIG_CREATOR, 1, 0));
			}

			// The navigation tables are only loaded for newer clients, so a client
			// that skips them must not keep the previous one's.
			for (const table of [
				NaviMapTable,
				NaviMobTable,
				NaviNpcTable,
				NaviLinkTable,
				NaviLinkDistanceTable,
				NaviNpcDistanceTable
			]) {
				table.length = 0;
			}
			clearNavigationMobIndex();
			if (resetLoadedMapNames) resetLoadedMapNames();
			if (resetClientData) resetClientData();

			const tracker = createTracker(
				current,
				(index, count) => {
					if (DB.onProgress) DB.onProgress(index, count);
				},
				() => {
					if (DB.onReady) DB.onReady();
				}
			);
			plan.loadInitial(
				() => tracker.step(),
				() => current === generation
			);
			tracker.seal();
		}

		static async lazyInit() {
			const current = generation;
			const currentLazy = ++lazyGeneration;
			console.log('Loading DB files...');
			const started = await startLua();
			if (started === false || current !== generation || currentLazy !== lazyGeneration) return;
			DB.index = 0;
			DB.count = 0;
			const tracker = createTracker(
				current,
				(index, count) => {
					DB.index = index;
					DB.count = count;
					if (DB.onProgress) DB.onProgress(index, count);
				},
				() => {
					DB.isLoaded = true;
					MemoryManager.forceClean(null, /\.(lub|lua|txt|csv|bson)$/i);
				},
				() => currentLazy === lazyGeneration
			);
			plan.loadLazy(
				() => {
					DB.count++;
					return tracker.step();
				},
				() => current === generation && currentLazy === lazyGeneration
			);
			tracker.seal();
		}

		static hasMountPalettes(onAnswer) {
			if (mountPalettes === undefined) {
				const sentinel = DB.getBodyPalPath(JobId.PIG_CREATOR, 1, 0);
				if (!mountPalettesProbe) {
					mountPalettesProbe = { stale: false };
				}
				const probe = mountPalettesProbe;
				const answer = present => {
					if (probe === mountPalettesProbe) {
						mountPalettesProbe = null;
						if (probe.stale) {
							// It answered for the previous client: onAnswer asks this one.
							MemoryManager.remove(null, sentinel);
						} else {
							mountPalettes = present;
						}
					}
					onAnswer();
				};
				Client.loadFile(
					sentinel,
					() => answer(true),
					() => answer(false)
				);
			}
			return mountPalettes;
		}
	};
}
