/**
 * tests/fixtures/guildMembers.js
 *
 * Member-list rows shaped like the wire, so a test does not have to invent
 * them and a live injection can use the same shapes.
 *
 * The field names are the ones ZC_MEMBERMGR_INFO parses into - Guild.setMembers
 * reads CurrentState for the online state, MemberExp for the contribution and
 * LastLogin for the sub-line - so a row built here exercises the same paths a
 * real packet does.
 */

/**
 * One member, with everything the row renderer touches.
 *
 * @param {number} i - index, used to make each row distinguishable
 * @param {object} over - fields to override
 * @return {object}
 */
export function member(i, over = {}) {
	return {
		AID: 2000000 + i,
		GID: 150000 + i,
		CharName: `Member-${i}`,
		GPositionID: i % 6,
		Job: 0,
		Class: 0,
		Sex: 1,
		HeadType: 0,
		HeadPalette: 0,
		Level: 1 + i * 3,
		CurrentState: i % 2, // odd indices online, so order is visible
		Memo: '',
		MemberExp: i * 137000,
		LastLogin: 1758000000 - i * 86400,
		...over
	};
}

/**
 * A roster alternating offline / online, named so a reorder is legible:
 * off-0, ON-1, off-2, ON-3...
 *
 * @param {number} n
 * @return {Array}
 */
export function alternating(n = 8) {
	return Array.from({ length: n }, (_, i) => member(i, { CharName: `${i % 2 ? 'ON' : 'off'}-${i}` }));
}

/**
 * Everyone online, or nobody - the two cases where the sort has nothing to do
 * and must leave the order alone.
 *
 * @param {number} n
 * @param {boolean} online
 * @return {Array}
 */
export function uniform(n = 4, online = true) {
	return Array.from({ length: n }, (_, i) => member(i, { CurrentState: online ? 1 : 0 }));
}

/**
 * The rows that have bitten before, each one a documented edge:
 *   - a name long enough to need the ellipsis
 *   - the 0x7FFFFFFF contribution sentinel, which turns the text blue
 *   - a zero timestamp, which would render as 1970 without a guard
 *   - an empty name, which the client replaces with msgstring 581
 *
 * @return {Array}
 */
export function edgeCases() {
	return [
		member(0, { CharName: 'AVeryLongCharacterName', CurrentState: 1 }),
		member(1, { MemberExp: 0x7fffffff, CurrentState: 0 }),
		member(2, { LastLogin: 0, CurrentState: 1 }),
		member(3, { CharName: '', CurrentState: 0 })
	];
}
