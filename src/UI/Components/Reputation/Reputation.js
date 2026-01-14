/**
 * UI/Components/Reputation/Reputation.js
 *
 * Display Reputation
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 */
define(function(require)
{
	'use strict';


	/**
	 * Dependencies
	 */
	var DB                   = require('DB/DBManager');
	var Network				 = require('Network/NetworkManager');
	var PACKET				 = require('Network/PacketStructure');
	var Client               = require('Core/Client');
	var Preferences          = require('Core/Preferences');
	var UIManager            = require('UI/UIManager');
	var UIComponent          = require('UI/UIComponent');
	var htmlText             = require('text!./Reputation.html');
	var cssText              = require('text!./Reputation.css');


	/**
	 * Create Component
	 */
	var Reputation = new UIComponent( 'Reputation', htmlText, cssText );


	/**
	 * @var {Preferences} Window preferences
	 */
	var _preferences = Preferences.get('Reputation', {
		x:        400,
		y:        200,
		show:     true,
	}, 1.0);


	/**
	 * @var Reputation UI
	 * Store Background Images Data
	 */
	let bg, bg_highlight, indicator_empty, indicator_blue, indicator_red;


	/**
	 * @var Reputation UI
	 * Store Pagination Data
	 */
	Reputation.page = {
		current: 0,
		perPage: 8,
		reputeIds: []
	};


	/**
	 * @var Reputation UI
	 * Store ReputeID and Points
	 */
	Reputation.reputeState = {
		// reputeId: points
	};


	/**
	 * @var Reputation UI
	 * Store Variables for Highlighted ReputeID
	 */
	Reputation.highlight = {
		reputeId: null,
		active: false,
		consumed: false
	};


	/**
	 * Initialize component
	 */
	Reputation.init = function init() {

		// Store our image assets
		Client.loadFile(DB.INTERFACE_PATH + 'reputation/bg_info.bmp', d => bg = d);
		Client.loadFile(DB.INTERFACE_PATH + 'reputation/bg_highlight.bmp', d => bg_highlight = d);
		Client.loadFile(DB.INTERFACE_PATH + 'reputation/light_empty.bmp', d => indicator_empty = d);
		Client.loadFile(DB.INTERFACE_PATH + 'reputation/light_blue.bmp', d => indicator_blue = d);
		Client.loadFile(DB.INTERFACE_PATH + 'reputation/light_red.bmp', d => indicator_red = d);

		// Binds
		this.draggable(this.ui);

		this.ui.find('.base').mousedown(stopPropagation);
		this.ui.find('.close').click(onClose);
		this.ui.find('.big_btn_close').click(onClose);

		const paginator = Reputation.ui.find('.paginator');

		paginator.find('.page_prev').on('click', () => {
			if (Reputation.page.current > 0) {
				renderReputePage(Reputation.page.current - 1);
			}
		});

		paginator.find('.page_next').on('click', () => {
			const maxPage = Math.ceil(
				Reputation.page.reputeIds.length / Reputation.page.perPage
			);

			if (Reputation.page.current < maxPage - 1) {
				renderReputePage(Reputation.page.current + 1);
			}
		});
	};


	/**
	 * Called when the component is appended to the body.
	 * Initializes the reputation system by building the group selector,
	 * binding group selector events and rendering the default view.
	 */
	Reputation.onAppend = function onAppend() {
		buildGroupSelector();
		bindGroupSelector();
		bindSearch();
		buildAllReputeEntries(); // Build all entries once
		filterByGroup('all');   // Default group
    };


	/**
	 * Once remove from body, save user preferences
	 */
	Reputation.onRemove = function onRemove() {
		// Save preferences
		_preferences.show   =  this.ui.is(':visible');
		_preferences.y      =  parseInt(this.ui.css('top'), 10);
		_preferences.x      =  parseInt(this.ui.css('left'), 10);
		_preferences.save();
	};


	/**
	 * Request to toggle open/close reputation
	 */
	Reputation.toggle = function toggle() {
		const selector = Reputation.ui.find('#repute_groups');
		const searchInput = Reputation.ui.find('.rep_group_searchbar');
		const isVisible = Reputation.ui.is(':visible');

		if (isVisible) {
			Reputation.ui.hide();
			return;
		}

		// Reset
		selector.val('all');
		searchInput.val('');
		filterByGroup('all');

		// Reset paging explicitly
		Reputation.page.current = 0;

		Reputation.ui.show();
	};


	/**
	 * Build the group selector based on the ReputeGroupTable in DB
	 * Append a new <option> element for each group in the table
	 * The option element will have the class 'repute_group_<groupIndex>'
	 * The option element will have the value '<groupIndex>'
	 * The option element will have the text content '<group.Name>'
	 */
	function buildGroupSelector() {
		let groupSelector = Reputation.ui.find('#repute_groups');
		let ReputeGroupTable = DB.getReputeGroup();

		Object.entries(ReputeGroupTable).forEach(([groupIndex, group]) => {
			const option = document.createElement('option');
		    option.className = 'repute_group_' +  groupIndex;
		    option.value = groupIndex;
		    option.textContent = group.Name;
		    groupSelector.append(option);
		});
	};


	/**
	 * Bind the group selector with the reputation page
	 * 
	 * When the group selector changes, it will update the total points display
	 * and re-render the reputation entries for the selected group
	 */
	function bindGroupSelector() {
		Reputation.ui.find('#repute_groups').on('change', function () {
			const selectedGroup = this.value;
			updateGroupTotalPoints(selectedGroup);
			Reputation.ui.find('.rep_group_searchbar').val('');
			filterByGroup(selectedGroup);
		});
	};


	/**
	 * Bind search functionality to the input field and button
	 *
	 * Listens for the enter key on the search input field and performs a search
	 * when the enter key is pressed. Listens for a click on the search button and
	 * performs a search when the button is clicked.
	 *
	 */
	function bindSearch() {
		const input = Reputation.ui.find('.rep_group_searchbar');
		const button = Reputation.ui.find('.search');

		// Enter key
		input.on('keydown', function (e) {
			if (e.key === 'Enter') {
				performSearch(this.value.trim());
			}
		});

		// Button click
		button.on('click', function () {
			performSearch(input.val().trim());
		});
	};


	/**
	 * Build all reputation entries once
	 *
	 * Empties the content container and re-renders all reputation entries
	 * using the createReputationEntry function. It also updates the UI state
	 * of each entry with the current points value.
	 *
	 * @return {void}
	 */
	function buildAllReputeEntries() {
		const content = Reputation.ui.find('.content');
		const reputeIds = Object.keys(DB.getReputeInfo()).map(Number);
		Reputation.page.reputeIds = reputeIds;

		content.empty();
		reputeIds.forEach(reputeId => {
			const info = DB.getReputeData(reputeId);
			if (!info) return;
			const points = Reputation.reputeState?.[reputeId] || 0;
			const entry = createReputeEntry(reputeId, info);
			entry.dataset.visible = isReputeVisible(info, points) ? 'true' : 'false';
			content.append(entry);
			updateReputeUI(reputeId, points);
		});
	};


	/**
	 * Update the total points display for a given group id
	 * @param {string} groupId - The ID of the group to update (or 'all' for all entries)
	 */
	function updateGroupTotalPoints(groupId) {
		const wrapper = Reputation.ui.find('.rep_group_total_points_wrapper');
		const indicator = wrapper.find('.rep_indicator');
		const pointsValue = wrapper.find('.rep_group_total_points_value');

		if (groupId === 'all') {
			wrapper.hide();
			return;
		}

		wrapper.show();

		// Get all repute IDs in this group
		let reputeIds = DB.getReputeGroupList(groupId);

		// Convert to array
		if (reputeIds && typeof reputeIds === 'object') {
			reputeIds = Object.values(reputeIds);
		}

		if (!reputeIds || !reputeIds.length) {
			indicator.css('background-image', `url(${indicator_empty})`);
			pointsValue.text('0');
			return;
		}

		// Add Total Points
		let totalPoints = 0;
		reputeIds.forEach(reputeId => {
			totalPoints += Reputation.reputeState?.[reputeId] || 0;
		});

		// Update indicator
		if (totalPoints > 0) {
			indicator.css('background-image', `url(${indicator_blue})`);
		} else if (totalPoints < 0) {
		indicator.css('background-image', `url(${indicator_red})`);
		} else {
			indicator.css('background-image', `url(${indicator_empty})`);
		}

		pointsValue.text(`${totalPoints} P`);
	};


	/**
	 * Checks if a reputation entry is visible based on the info.Invisible value and the current points value
	 * @param {object} info - The reputation entry info object
	 * @param {number} points - The current points value of the reputation entry
	 * @returns {boolean} True if the reputation entry is visible, false otherwise
	 */
	function isReputeVisible(info, points) {
		switch (info.Invisible) {
			case 'VISIBLE_FALSE':
				return false;
			case 'VISIBLE_EXIST':
				return points !== 0;
			case 'VISIBLE_TRUE':
			default:
				return true;
		}
	};


	/**
	 * Filters the reputation entries based on the given group ID
	 * If the group ID is 'all', shows all entries
	 * If the group ID is not 'all', shows only the entries that belong to the group and updates the total points wrapper
	 * @param {string} groupId - The ID of the group to filter by
	 */
	function filterByGroup(groupId) {
		const items = Reputation.ui.find('.rep_group_wrapper');
		const totalWrapper = Reputation.ui.find('.rep_group_total_points_wrapper');

		if (groupId === 'all') {
			items.each(function () {
				const el = this;
				const reputeId = Number(el.dataset.reputeId);
				const info = DB.getReputeData(reputeId);
				const points = Reputation.reputeState?.[reputeId] || 0;
				el.dataset.visible = isReputeVisible(info, points) ? 'true' : 'false';
			});
			totalWrapper.hide();
		} else {
			const groupList = Object.values(DB.getReputeGroupList(groupId) || {});
			items.each(function () {
				const el = this;
				const reputeId = Number(el.dataset.reputeId);
				const info = DB.getReputeData(reputeId);
				const points = Reputation.reputeState?.[reputeId] || 0;
				el.dataset.visible = groupList.includes(reputeId) && isReputeVisible(info, points) ? 'true' : 'false';
			});
			updateGroupTotalPoints(groupId);
			totalWrapper.show();
		}

		const visibleIds = items.filter((i, el) => el.dataset.visible === 'true')
                        .map((i, el) => Number(el.dataset.reputeId))
                        .get(); // convert jQuery object to array
		Reputation.page.reputeIds = visibleIds;
		Reputation.page.current = 0;
		renderReputePage(0);
	};


	/**
	 * Update the reputation pager UI.
	 * 
	 * This function is called after the reputation entries have been updated.
	 * It updates the pager UI to reflect the current page and total number of pages.
	 */
	function updateReputePager() {
		const total = Reputation.page.reputeIds.length;
		const perPage = Reputation.page.perPage;
		
		const totalPages = Math.max(1, Math.ceil(total / perPage));
		const current = Reputation.page.current + 1;
		
		const paginator = Reputation.ui.find('.paginator');
		const prevBtn = paginator.find('.page_prev');
		const nextBtn = paginator.find('.page_next');
		const text = paginator.find('.page_text');
		
		text.text(`${current} / ${totalPages}`);
		prevBtn.css('visibility', current === 1 ? 'hidden' : 'visible');
		nextBtn.css('visibility', current === totalPages ? 'hidden' : 'visible');

		if (totalPages === 1) prevBtn.add(nextBtn).css('visibility', 'hidden');
	};


	/**
	 * Render a page of reputation entries based on current page index.
	 * 
	 * Hides all entries first, then shows only visible entries within the current page.
	 * Updates the pager afterwards.
	 * 
	 * @param {number} pageIndex - current page index (starts from 0)
	 */
	function renderReputePage(pageIndex) {
		const { perPage } = Reputation.page;
		const items = Reputation.ui.find('.rep_group_wrapper');

		Reputation.page.current = pageIndex;

		items.hide();

		// Filter only visible entries according to Invisible property
		const visibleItems = items.filter((i, el) => el.dataset.visible === 'true');

		const start = pageIndex * perPage;
		const end = start + perPage;

		const pageItems = visibleItems.slice(start, end);
		pageItems.show();

		// Show Highlight
		if (Reputation.highlight.active && !Reputation.highlight.consumed) {
			pageItems.each(function () {
				const el = this;
				const id = Number(el.dataset.reputeId);

				if (id === Reputation.highlight.reputeId) {
					el.style.backgroundImage = `url(${bg_highlight})`;

					// Consume Highlight
					Reputation.highlight.consumed = true;
					Reputation.highlight.active = false;
				}
			});
		} else {
			clearHighlights();
		}

		updateReputePager();
	};


	/**
	 * Create a reputation entry element from given info
	 * @param {number} reputeId - reputation id
	 * @param {object} info - reputation info
	 * @returns {HTMLDivElement} created element
	 */
	function createReputeEntry(reputeId, info) {

		const wrapper = document.createElement('div');
		wrapper.className = 'rep_group_wrapper';
		wrapper.dataset.reputeId = reputeId;
		wrapper.style.backgroundImage = `url(` + bg + `)`;

		// Name
		const name = document.createElement('div');
		name.className = 'rep_group_name';
		name.textContent = info.Name;
		wrapper.appendChild(name);

		// Indicators
		const indicatorWrapper = document.createElement('div');
		indicatorWrapper.className = 'rep_group_indicator_wrapper';

		const indicatorCount = info.MaxPoint_Positive / 1000;

		for (let i = 1; i <= indicatorCount; i++) {
			const indicator = document.createElement('div');
			indicator.className = `rep_group_indicator indicator_${i}`;
			indicator.dataset.index = i;
			indicator.style.backgroundImage = `url(${indicator_empty})`;
			indicatorWrapper.appendChild(indicator);
		}

		wrapper.appendChild(indicatorWrapper);

		// Progress bar
		const progress = document.createElement('div');
		progress.className = 'rep_group_progess_bar';
		wrapper.appendChild(progress);

		// Points
		const points = document.createElement('div');
		points.className = 'rep_id_points';
		points.textContent = '0 / 1000';
		wrapper.appendChild(points);

		return wrapper;
	};


	/**
	 * Update the UI of a specific Repute entry
	 * @param {string} reputeId - The ID of the Repute entry to update
	 * @param {number} points - The points to update the UI with
	 */
	function updateReputeUI(reputeId, points) {
		const wrapper = Reputation.ui.find(
			`.rep_group_wrapper[data-repute-id="${reputeId}"]`
		);

		if (!wrapper.length) return;

		const indicators = wrapper.find('.rep_group_indicator');
		const absPoints = Math.abs(points);
		const fullIndicators = Math.floor(absPoints / 1000);
		const remainder = absPoints % 1000;

		// Update indicators
		indicators.each(function (index) {
			this.style.backgroundImage = index < fullIndicators
				? points >= 0 ? `url(${indicator_blue})` : `url(${indicator_red})`
				: `url(${indicator_empty})`;
		});

		// Update points text
		wrapper.find('.rep_id_points').text(`${remainder} / 1000`);

		// Update progress bar
		const progress = wrapper.find('.rep_group_progess_bar');
		const percent = (remainder / 1000) * 100;

		// Choose color based on positive/negative
		const fillColor = points >= 0 ? '#7b95ce' : '#f60206';

		progress.css(
			'background-image',
			`linear-gradient(
				to right,
				${fillColor} 0%,
				${fillColor} ${percent}%,
				transparent ${percent}%
			)`
		);
	};


	/**
	 * Perform search on the reputation entries based on the given query.
	 * If the query is empty, reset the search and show all entries.
	 * Otherwise, filter the entries based on whether the entry name matches the query (case-insensitive) and whether the entry is visible.
	 * @param {string} query - The search query to filter the reputation entries with
	 */
	function performSearch(query) {
		const items = Reputation.ui.find('.rep_group_wrapper');
		const totalWrapper = Reputation.ui.find('.rep_group_total_points_wrapper');
		const groupSelector = Reputation.ui.find('#repute_groups');

		if (!query) {
			groupSelector.val('all');
			totalWrapper.hide();
			filterByGroup('all');
			return;
		}

		const lowerQuery = query.toLowerCase();
		//totalWrapper.hide();

		let visibleIds = [];
		items.each(function () {
			const el = this;
			const reputeId = Number(el.dataset.reputeId);
			const info = DB.getReputeData(reputeId);
			const points = Reputation.reputeState?.[reputeId] || 0;

			const matches = info?.Name.toLowerCase().includes(lowerQuery);
			const show = matches && isReputeVisible(info, points);
			el.dataset.visible = show ? 'true' : 'false';
			if (show) visibleIds.push(reputeId);
		});

		Reputation.page.reputeIds = visibleIds;
		Reputation.page.current = 0;
		renderReputePage(0);
	};


	/**
	 * Closing window
	 */
	function onClose() {
		Reputation.ui.hide();
	};


	/**
	 * Stop event propagation
	 */
	function stopPropagation( event ) {
		event.stopImmediatePropagation();
		return false;
	};


	/**
	 * Packet received from server
	 * Initializes the Reputation UI
	 * Store the initial values received from the server and update UI
	 * If UI is open, update UI
	 * @param {object} pkt - PACKET.ZC.REPUTE_INFO
	 */
	function onReputeInfo(pkt) {

		if (!Reputation.__active) {
			Reputation.append();
			Reputation.ui.hide();
		}

		// Get currently selected group
		const selectedGroup = Reputation.ui.find('#repute_groups').val();

		// Track which groups need updating
		let updateSelectedGroup = false;

		pkt.reputeInfo.forEach(entry => {
			// Update individual UI
			Reputation.reputeState[entry.type] = entry.points;
			updateReputeUI(entry.type, entry.points);

			// Check if the repute ID belongs to the currently selected group
			if (selectedGroup && selectedGroup !== 'all') {
				const reputeList = Object.values(DB.getReputeGroupList(selectedGroup) || {});
				if (reputeList.includes(entry.type)) {
					updateSelectedGroup = true;
				}
			}
		});

		// Update total points only if relevant
		if (updateSelectedGroup) {
			updateGroupTotalPoints(selectedGroup);
		}
	};


	/**
	 * Sets up Highlight, selects the given group,
	 * and filters the reputation entries normally
	 *
	 * @param {object} pkt - PACKET.ZC.REPUTE_OPEN
	 */
	function onReputeOpen(pkt) {
		const groupId = pkt.table === 0 ? 'all' : pkt.table;
		const highlightId = pkt.type || null;

		// setup highlight
		Reputation.highlight.reputeId = highlightId;
		Reputation.highlight.active = !!highlightId;
		Reputation.highlight.consumed = false;

		// select group
		Reputation.ui.find('#repute_groups').val(groupId);

		// filter normally
		filterByGroup(groupId);

		Reputation.ui.show();
	};


	/**
	 * Clears all highlight effects from the reputation entries.
	 * This function is called when the reputation window is opened.
	 * It resets the background image and removes the highlight property from all entries.
	 */
	function clearHighlights() {
		Reputation.ui.find('.rep_group_wrapper').each(function () {
			this.style.backgroundImage = `url(${bg})`;
			this.dataset.highlight = 'false';
		});
	};


	/**
	 * Packet Hooks to functions
	 */
	Network.hookPacket(PACKET.ZC.REPUTE_INFO, onReputeInfo);
	Network.hookPacket(PACKET.ZC_REPUTE_OPEN, onReputeOpen);


	/**
	 * Create component and export it
	 */
	return UIManager.addComponent(Reputation);
});
