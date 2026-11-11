export function getSystemAliases(basePath) {
	basePath = basePath.replace(/\.(lub|lua)$/i, ''); // Prevents extension been passed

	const suffixes = ['', '_true', '_sak', '_Sakray']; // Priority order
	const extensions = ['.lub', '.lua'];
	const fileList = [];

	for (let s = 0; s < suffixes.length; s++) {
		for (let e = 0; e < extensions.length; e++) {
			fileList.push(basePath + suffixes[s] + extensions[e]);
		}
	}
	return fileList;
}

export function tryLoadLuaAliases(rFunc, files, callBack, onEnd, loadAll = false) {
	const totalFiles = files.length;
	if (totalFiles === 0) {
		if (typeof onEnd === 'function') {
			onEnd();
		}
		return;
	}

	let finishedCount = 0;
	let failedCount = 0;
	const trackedOnEnd = isSuccess => {
		finishedCount++;
		if (!isSuccess) {
			failedCount++;
		}

		if (finishedCount === totalFiles || (isSuccess && !loadAll)) {
			if (failedCount === totalFiles) {
				console.error(
					`[tryLoadLuaAliases] ERROR: All ${totalFiles} tryes to find ${files[0]} failed. Verify your ${files[0]} filename.`
				);
			}
			if (typeof onEnd === 'function') {
				onEnd();
			}
		}
	};

	function tryNext(index) {
		if (index >= totalFiles) {
			return;
		}

		if (
			files[index].indexOf('System/') !== 0 &&
			files[index].indexOf('SystemEN/') !== 0 &&
			files[index].indexOf('System\\') !== 0 &&
			files[index].indexOf('SystemEN\\') !== 0
		) {
			files[index] = 'System/' + files[index];
		}

		rFunc(files[index], callBack, isSuccess => {
			trackedOnEnd(isSuccess); //await last lua parsing
			if ((isSuccess && loadAll) || !isSuccess) {
				tryNext(index + 1);
			}
		});
	}
	tryNext(0);
}
