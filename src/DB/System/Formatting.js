export function formatUnixDate(unixTimestamp) {
	const d = new Date(unixTimestamp * 1000);

	return (
		String(d.getMonth() + 1).padStart(2, '0') +
		'/' +
		String(d.getDate()).padStart(2, '0') +
		' ' +
		String(d.getHours()).padStart(2, '0') +
		':' +
		String(d.getMinutes()).padStart(2, '0')
	);
}

export function formatMsgToHtml(msg) {
	let hasOpenSpan = false;

	msg = msg.replace(/\^([0-9a-fA-F]{6})/g, (_, color) => {
		const close = hasOpenSpan ? '</span>' : '';
		hasOpenSpan = true;
		return close + `<span style="color:#${color}">`;
	});

	if (hasOpenSpan) {
		msg += '</span>';
	}
	return msg;
}
