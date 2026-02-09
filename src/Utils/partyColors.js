define(function ()
{
	'use strict';

	function pastel_colour(seed)
	{
		var baseRed = 0;
		var baseGreen = 0;
		var baseBlue = 0;

		var rand_1 = Math.abs(Math.sin(seed++) * 10000) % 256;
		var rand_2 = Math.abs(Math.sin(seed++) * 10000) % 256;
		var rand_3 = Math.abs(Math.sin(seed++) * 10000) % 256;

		//build colour
		var red = Math.round((rand_1 + baseRed) / 2);
		var green = Math.round((rand_2 + baseGreen) / 2);
		var blue = Math.round((rand_3 + baseBlue) / 2);

		return { red: red, green: green, blue: blue };
	}

	return function (aid)
	{
		var rv = pastel_colour(aid);

		rv.style = 'rgb(' + rv.red + ', ' + rv.green + ', ' + rv.blue + ')';
		return rv;
	};
});
