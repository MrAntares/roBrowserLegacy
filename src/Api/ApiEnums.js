/**
 * ApiEnums.js
 *
 * Robrowser API enumerations.
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
class ApiEnums {
	/**
	 * @Enum Robrowser type
	 */
	static TYPE = {
		POPUP: 1,
		FRAME: 2,
		INLINE: 3
	};

	/**
	 * @Enum Robrowser Applications
	 */
	static APP = {
		ONLINE: 1,
		MAPVIEWER: 2,
		GRFVIEWER: 3,
		MODELVIEWER: 4,
		STRVIEWER: 5,
		GRANNYMODELVIEWER: 6, //sound weird O_o
		EFFECTVIEWER: 7
	};
}

/**
 * Export
 */
export default ApiEnums;
