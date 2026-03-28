'use strict';

function pastel_colour(seed) {
		let baseRed = 0;
		let baseGreen = 0;
		let baseBlue = 0;

		let rand_1 = Math.abs(Math.sin(seed++) * 10000) % 256;
		let rand_2 = Math.abs(Math.sin(seed++) * 10000) % 256;
		let rand_3 = Math.abs(Math.sin(seed++) * 10000) % 256;

		//build colour
		let red = Math.round((rand_1 + baseRed) / 2);
		let green = Math.round((rand_2 + baseGreen) / 2);
		let blue = Math.round((rand_3 + baseBlue) / 2);

		return { red: red, green: green, blue: blue };
	}
export default function (aid) {
		let rv = pastel_colour(aid);

		rv.style = 'rgb(' + rv.red + ', ' + rv.green + ', ' + rv.blue + ')';
		return rv;
	};