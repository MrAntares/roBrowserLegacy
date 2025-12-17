/**
 * Renderer/EntityView.js
 *
 * Manage Entity files (attachments) to load once a view change
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */
define(function( require )
{
	'use strict';


	// Load dependencies
	var Client        = require('Core/Client');
	var DB            = require('DB/DBManager');
	var ShadowTable   = require('DB/Monsters/ShadowTable');
	var MountTable    = require('DB/Jobs/MountTable');
	var AllMountTable = require('DB/Jobs/AllMountTable');
	var EntityAction  = require('./EntityAction');


	/**
	 * Files to display a view
	 *
	 * @param {optional|string} sprite path
	 * @param {optional|string} action path
	 * @param {optional|string} palette path
	 */
	function ViewFiles( spr, act, pal )
	{
		this.spr  = spr || null;
		this.act  = act || null;
		this.pal  = pal || null;
		this.size = 1.0;
	}


	/**
	 * View structure
	 */
	function View()
	{
		this.body       = new ViewFiles();
		this.head       = new ViewFiles();
		this.weapon     = new ViewFiles();
		this.weapon_trail     = new ViewFiles();
		this.shield     = new ViewFiles();
		this.accessory  = new ViewFiles();
		this.accessory2 = new ViewFiles();
		this.accessory3 = new ViewFiles();
		this.robe       = new ViewFiles();
		this.shadow     = new ViewFiles('data/sprite/shadow.spr', 'data/sprite/shadow.act');

		this.cart     = [];
		//Super novice
		this.cart[0] = 	new ViewFiles(DB.getCartPath(0)+'.spr', DB.getCartPath(0)+'.act');

		this.cart[1] = new ViewFiles(DB.getCartPath(1)+'.spr', DB.getCartPath(1)+'.act');
		this.cart[2] = 	new ViewFiles(DB.getCartPath(2)+'.spr', DB.getCartPath(2)+'.act');
		this.cart[3] = 	new ViewFiles(DB.getCartPath(3)+'.spr', DB.getCartPath(3)+'.act');
		this.cart[4] = 	new ViewFiles(DB.getCartPath(4)+'.spr', DB.getCartPath(4)+'.act');
		this.cart[5] = 	new ViewFiles(DB.getCartPath(5)+'.spr', DB.getCartPath(5)+'.act');
		this.cart[6] = 	new ViewFiles(DB.getCartPath(6)+'.spr', DB.getCartPath(6)+'.act');
		this.cart[7] = 	new ViewFiles(DB.getCartPath(7)+'.spr', DB.getCartPath(7)+'.act');
		this.cart[8] = 	new ViewFiles(DB.getCartPath(8)+'.spr', DB.getCartPath(8)+'.act');
		this.cart[9] = 	new ViewFiles(DB.getCartPath(9)+'.spr', DB.getCartPath(9)+'.act');
		this.cart[10] =	new ViewFiles(DB.getCartPath(10)+'.spr', DB.getCartPath(10)+'.act');
		this.cart[11] =	new ViewFiles(DB.getCartPath(11)+'.spr', DB.getCartPath(11)+'.act');
		this.cart[12] =	new ViewFiles(DB.getCartPath(12)+'.spr', DB.getCartPath(12)+'.act');
		this.cart[13] =	new ViewFiles(DB.getCartPath(13)+'.spr', DB.getCartPath(13)+'.act');

		this.cart_shadow     = new ViewFiles('data/sprite/shadow.spr', 'data/sprite/shadow.act');
	}


	/**
	 * If changing sex, all files have to be reload
	 * (not used in game but can be used in a next update or in offline mode)
	 *
	 * @param {number} sex (mal/female)
	 */
	function UpdateSex( sex )
	{
		// Not defined yet, no update others
		if (this._sex === -1) {
			this._sex = sex;
			return;
		}

		// Update other elements
		this._sex        = sex;
		this.job         = this._job;  // will update body, body palette, weapon, shield
		this.head        = this._head; // will update hair color
		this.accessory   = this._accessory;
		this.accessory2  = this._accessory2;
		this.accessory3  = this._accessory3;
		this.robe        = this._robe;
	}


	/**
	 * Updating job
	 *
	 * @param {number} job id
	 */
	function UpdateBody( job )
	{
		var baseJob, path;
		var Entity;

		if (job < 0) {
			return;
		}

		// Avoid fuck*ng errors with mounts !
		// Sometimes the server send us the job of the mount sprite instead
		// of the base sprite + effect to have the mount.
		for (baseJob in MountTable) {
			if (MountTable[baseJob] === job) {
				this.costume = job;
				job          = baseJob;
				break;
			}
		}

		for (baseJob in AllMountTable) {
			if (AllMountTable[baseJob] === job) {
				this.costume = job;
				job          = baseJob;
				break;
			}
		}

		// Clothes keep the old job in memory
		// and show the costum if used
		this._job = job;
		this._body = job;
		if (this.costume) 
			job = this.costume;

		// Resize character
		this.xSize = this.ySize = DB.isBaby(job) ? 4 : 5;

		this.files.shadow.size = job in ShadowTable ? ShadowTable[job] : 1.0;
		path = this.isAdmin ? DB.getAdminPath(this._sex) : DB.getBodyPath(job, this._sex, this._body);
		Entity                 = this.constructor;

		// Define Object type based on its id
		if (this.objecttype === Entity.TYPE_UNKNOWN) {
			var objecttype = (
				job < 45   ? Entity.TYPE_PC   :
				job < 46   ? Entity.TYPE_WARP :
				job < 1000 ? Entity.TYPE_NPC  :
				job < 1000 ? Entity.TYPE_NPC2 :
				job < 4000 ? Entity.TYPE_MOB  :
				job < 4000 ? Entity.TYPE_NPC_ABR :
				job < 4000 ? Entity.TYPE_NPC_BIONIC :
				job < 6000 ? Entity.TYPE_PC   :
				job < 7000 ? Entity.TYPE_HOM  :
				             Entity.TYPE_MERC
			);

			// Clean up action frames
			if (objecttype !== this.objecttype) {
				this.objecttype = objecttype;
				EntityAction.call(this);
			}
		}

		// Invisible sprites
		if (job === 111 || job === 139 || job === 45) {
			this.files.body.spr = null;
			this.files.body.act = null;
			return;
		}

		// granny model not supported yet :(
		// Display a poring instead
		if (path === null || path.match(/\.gr2$/i)) {

			if(path.match(/aguardian90_8\.gr2$/i)){
				path = DB.getBodyPath( 1276, this._sex );
			} else if(path.match(/empelium90_0\.gr2$/i)){
				path = DB.getBodyPath( 2080, this._sex );
			} else if(path.match(/guildflag90_1\.gr2$/i)){
				path = DB.getBodyPath( 1911, this._sex );
			} else if(path.match(/kguardian90_7\.gr2$/i)){
				path = DB.getBodyPath( 2691, this._sex );
			} else if(path.match(/sguardian90_9\.gr2$/i)){
				path = DB.getBodyPath( 1163, this._sex );
			} else if(path.match(/treasurebox_2\.gr2$/i)){
				path = DB.getBodyPath( 1191, this._sex );
			} else {
				path = DB.getBodyPath( 1002, this._sex );
			}
		}

		// Loading
		Client.loadFile(path + '.act');
		Client.loadFile(path + '.spr', function(){
			this.files.body.spr = path + '.spr';
			this.files.body.act = path + '.act';

			// Update linked attachments
			this.bodypalette = this._bodypalette;
			this.weapon      = this._weapon;
			this.shield      = this._shield;

		}.bind(this), null, {
			to_rgba: this.objecttype !== Entity.TYPE_PC
		});
	}

	/**
	 * Updating BodyStyle
	 *
	 * @param {number} BodyStyle id
	 */
	function UpdateBodyStyle( job )
	{
		var baseJob, path;
		var Entity;

		if (job < 0) {
			return;
		}

		this._body = job;

		// Avoid fuck*ng errors with mounts !
		// Sometimes the server send us the job of the mount sprite instead
		// of the base sprite + effect to have the mount.
		for (baseJob in MountTable) {
			if (MountTable[baseJob] === this.job) {
				this.costume = this.job;
				job          = baseJob;
				break;
			}
		}

		for (baseJob in AllMountTable) {
			if (AllMountTable[baseJob] === this.job) {
				this.costume = this.job;
				job          = baseJob;
				break;
			}
		}

		// Clothes keep the old job in memory
		// and show the costum if used
		if (this.costume) 
			job = this.costume;

		// Resize character
		this.xSize = this.ySize = DB.isBaby(this.job) ? 4 : 5;

		this.files.shadow.size = job in ShadowTable ? ShadowTable[job] : 1.0;
		path = this.isAdmin ? DB.getAdminPath(this._sex) : DB.getBodyPath(job, this._sex, this._body);
		Entity                 = this.constructor;

		// Loading
		Client.loadFile(path + '.act');
		Client.loadFile(path + '.spr', function(){
			this.files.body.spr = path + '.spr';
			this.files.body.act = path + '.act';

			// Update linked attachments
			this.bodypalette = this._bodypalette;
			this.weapon      = this._weapon;
			this.shield      = this._shield;

		}.bind(this), null, {
			to_rgba: this.objecttype !== Entity.TYPE_PC
		});
	}

	/**
	 * Update body palette
	 *
	 * @param {number} body palette number
	 */
	function UpdateBodyPalette( pal )
	{
		this._bodypalette = pal;

		// Internal palette
		if (pal <= 0) {
			this.files.body.pal = null;
			return;
		}

		// Wait body to be loaded
		if (this._job === -1) {
			return;
		}

		this.files.body.pal = DB.getBodyPalPath( this._job, this._bodypalette, this._sex);
	}


	/**
	 * Update head
	 *
	 * @param {number} head index
	 */
	function UpdateHead( head)
	{
		var path;

		if (head < 0) {
			return;
		}

		this._head  = head;
		path        = DB.getHeadPath( head, this.job, this._sex, this.isOrcish);

		Client.loadFile(path + '.act');
		Client.loadFile(path + '.spr', function(){
			this.files.head.spr = path + '.spr';
			this.files.head.act = path + '.act';
			this.files.head.pal = null;
			this.headpalette    = this._headpalette;
		}.bind(this));
	}


	/**
	 * Update head palette
	 *
	 * @param {number} palette id
	 */
	function UpdateHeadPalette( pal )
	{
		this._headpalette = pal;

		// Using internal palette stored in sprite
		if (pal <= 0) {
			this.files.head.pal = null;
			return;
		}

		// Wait head to load before
		if (this._head === -1) {
			return;
		}
		this.files.head.pal = DB.getHeadPalPath( this._head, this._headpalette, this.job, this._sex);
	}


	/**
	 * Update Generic function to load hats, weapons and shields
	 *
	 * @param {string} type - weapon / shield / etc
	 * @param {string} method from DB to get path
	 * @param {function} callback if fail
	 */
	function UpdateGeneric( type, func, fallback )
	{
		return function (val) {
			var path;
			var _this = this;
			var _val  = val;

			// Nothing to load
			if (val <= 0) {
				this['_'+type] = 0;
				return;
			}

			// Find file path
			switch (type) {
				case 'weapon':
				case 'shield':
				case 'robe':
					path  = DB[func]( val, this.job, this._sex );
					break;

				default:
					path  = DB[func]( val, this._sex );
					break;
			}

			// No path found, remove current files used
			if (!path) {
				this.files[type].spr = null;
				this.files[type].act = null;
				this.files[type].pal = null;

				// Load weapon sound
				if (type === 'weapon') {
					this.sound.attackFile = DB.getWeaponSound( val );
				}

				return;
			}

			function LoadView( path, final ) {
				Client.loadFile(path + '.act');
				Client.loadFile(path + '.spr', function(){
					_this['_'+type] = _val;
					_this.files[type].spr = path + '.spr';
					_this.files[type].act = path + '.act';

					// Load weapon sound
					if (type === 'weapon') {
						_this.attackFile = DB.getWeaponSound( _val );

						//Load weapon trail effect
						const trail_file = DB.getWeaponTrail(_val, _this.job, _this._sex);
						if(trail_file){
							Client.loadFile(trail_file + '.act');
							Client.loadFile(trail_file + '.spr', function(){
								_this.files['weapon_trail'].spr = trail_file + '.spr';
								_this.files['weapon_trail'].act = trail_file + '.act';
							});
						}
					}
				},

				// if weapon isn't loaded, try to load the default sprite for the weapon type
				function(){
					if (fallback && !final) {
						_val = DB[fallback](val);
						path = DB[func]( _val, _this.job, _this._sex );
						if (path) {
							LoadView( path, true );
						}
					}

				// The generic just used : weapon, shield, accessory.
				// This sprites don't use external palettes, so compile it now to rgba.
				}, {to_rgba:true});
			}

			// Start loading view
			LoadView(path);
		};
	}


	/**
	 * Hooking, export
	 */
	return function Init()
	{
		this.files = new View();

		Object.defineProperty(this, 'sex', {
			get: function(){ return this._sex; },
			set: UpdateSex
		});

		Object.defineProperty(this, 'job', {
			get: function(){ return this.costume || this._job; },
			set: UpdateBody
		});
		this._body = this._job;
		Object.defineProperty(this, 'body', {
			get: function(){ return this._body; },
			set: UpdateBodyStyle
		});

		Object.defineProperty(this, 'bodypalette', {
			get: function(){ return this._bodypalette; },
			set: UpdateBodyPalette
		});

		Object.defineProperty(this, 'head', {
			get: function(){ return this._head; },
			set: UpdateHead
		});

		Object.defineProperty(this, 'headpalette', {
			get: function(){ return this._headpalette; },
			set: UpdateHeadPalette
		});

		Object.defineProperty(this, 'weapon', {
			get: function(){ return this._weapon; },
			set: UpdateGeneric('weapon', 'getWeaponPath', 'getWeaponViewID')
		});

		Object.defineProperty(this, 'shield', {
			get: function(){ return this._shield; },
			set: UpdateGeneric('shield', 'getShieldPath')
		});

		Object.defineProperty(this, 'accessory', {
			get: function(){ return this._accessory; },
			set: UpdateGeneric('accessory', 'getHatPath')
		});

		Object.defineProperty(this, 'accessory2', {
			get: function(){ return this._accessory2; },
			set: UpdateGeneric('accessory2', 'getHatPath')
		});

		Object.defineProperty(this, 'accessory3', {
			get: function(){ return this._accessory3; },
			set: UpdateGeneric('accessory3', 'getHatPath')
		});

		Object.defineProperty(this, 'robe', {
			get: function(){ return this._robe; },
			set: UpdateGeneric('robe', 'getRobePath')
		});
	};
});
