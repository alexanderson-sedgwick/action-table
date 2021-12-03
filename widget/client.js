/**
 * The Angular controller for managing the Action Table
 * @class module:WidgetComponents.ActionTableController
 */
api.controller = function($scope, $http, spModal, SPGlideAjax) {

	/**
	 * Identitifies the localStorage key used for saving and recovering the current state
	 * of the table's rendering.
	 * @memberof ActionTableController
	 * @type {String}
	 * @alias stateKey
	 * @private
	 */
	var stateKey = "actiontable:state:" + $scope.options.id,
		loading = localStorage.getItem(stateKey),
	/**
	 * Time to wait to allow typing to continue before updating the corpus.
	 * @property {Number} filterInterval
	 * @memberof ActionTableController
	 * @default 200
	 * 
	 * @private
	 */
		filterInterval = 200,
		fieldTracking = {},
		fieldList = [],
		mapDataFields,
		clearFault,
		endReload,
		filtering,
		mapFields,
		saveState,
		sortData,
		setIcons,
		refresh,
		visible,
		timing,
		fillin,
		fault,
		x;

	/**
	 * Save an encoded value of the scope's state value to give persistence to the table's
	 * rendering.
	 * @method module:WidgetComponents.ActionTableController#saveState
	 * @private
	 */
	saveState = function() {
		localStorage.setItem(stateKey, JSON.stringify($scope.state));
	};
	/**
	 * Updates the icons for various objects for cached rendering purposes
	 * @method module:WidgetComponents.ActionTableController#setIcons
	 */
	setIcons = function() {
		if($scope.columns) {
			var column;
			for(x=0; x<$scope.columns.length; x++) {
				column = $scope.columns[x];
				if(column && !column.no_sort) {
					if(column.field === $scope.state.order) {
						if($scope.state.above === 1) {
							column.sort_icon = "fa fa-sort-alpha-asc";
						} else {
							column.sort_icon = "fa fa-sort-alpha-desc";
						}
					} else {
						column.sort_icon = "fa fa-sort";
					}
				}
			}
		}
	};
	/**
	 * Sorting function used to sort the data.rows array based on the current state values.
	 * @method module:WidgetComponents.ActionTableController#sortData
	 * @param a
	 * @param b
	 */
	sortData = function(a, b) {
		if($scope.state.order) {
			if(a && b) {
				var cA = a[$scope.state.order],
					cB = b[$scope.state.order];
				if(cA > cB) {
					return $scope.state.above;
				} else if(cA < cB) {
					return $scope.state.below;
				}
			} else if(a && !b) {
				return $scope.state.above;
			} else if(!a && b) {
				return $scope.state.below;
			}
			return 0;
		}
	};
	/**
	 * 
	 * @method module:WidgetComponents.ActionTableController#visible
	 * @param {Object} row
	 */
	visible = function(row) {
		return !$scope.state.searching || (row && typeof(row.$search) === "string" && row.$search.indexOf($scope.state.searching) !== -1);
	};
	/**
	 * Timed function used to balance user typing with when to fire updating the results.
	 * @method module:WidgetComponents.ActionTableController#filtering
	 * @private
	 */
	filtering = function() {
		var now = Date.now();
		if(timing && timing < now) {
			// Maintain case insensitive search but don't mutate the user input
			$scope.state.searching = $scope.state.search.toLowerCase();
			$scope.state.page = 0;
			$scope.filterIcon = "fa-filter";
			$scope.loadCorpus();
			$scope.update();
			timing = null;
			saveState();
		} else {
			setTimeout(filtering, filterInterval);
		}
	};
	/**
	 * Used to keep the data up to date if a refresh interval has been specified.
	 * @method module:WidgetComponents.ActionTableController#refresh
	 * @private
	 */
	refresh = function() {
		if(!isNaN($scope.options.refresh_interval) && 60000 <= $scope.options.refresh_interval) {
			$scope.reloadData();
			setTimeout(refresh, $scope.options.refresh_interval);
		}
	};
	/**
	 * Waits 1 second to reset the reload icon to give the visual impact time.
	 * @method module:WidgetComponents.ActionTableController#endReload
	 * @private
	 */
	endReload = function() {
		setTimeout(function() {
			$scope.reloadIcon = "fa-refresh";
			$scope.update();
		}, 1000);
	};
	/**
	 * Use template filling to create a new object whose values mimic the fill object but
	 * with templates completed based on the row. Due to the regular expressions in volved
	 * and the number of search/replacements that can be triggered here, this method should
	 * be used sparingly.
	 * @method module:WidgetComponents.ActionTableController#fillin
	 * @param {Object} fill Object whose values are to be completed
	 * @param {Object} row Source for values
	 */
	fillin = function(fill, row) {
		var keys = Object.keys(fill),
			result = {},
			i;
		for(i=0; i<keys.length; i++) {
			result[keys[i]] = $scope.completeTemplate(row, fill[keys[i]]);
		}
		return result;
	};
	/**
	 * Internal method for displaying an error that was encountered.
	 * @method module:WidgetComponents.ActionTableController#fault
	 * @private
	 * @param {Error} error That occurred and should be displayed
	 */
	fault = function(error) {
		var message = "STSTable: Data Request from ";
		if($scope.options.data_source == "ajax") {
			message += "Client Script[" + $scope.options.script + "." + $scope.options.script_method + "]: ";
		} else if($scope.options.data_source == "snapi") {
			message += "Service-Now API Endpoint[" + $scope.options.endpoint + "]: ";
		} else {
			"Unknown Source: ";
		}
		console.error(message, $scope.error);
		$scope.error = error;
		$scope.update();
	};
	/**
	 * Internal method for clearing an error that had been encountered if one such error exists.
	 * @method module:WidgetComponents.ActionTableController#clearFault
	 * @private
	 */
	clearFault = function() {
		if($scope.error) {
			$scope.error = null;
			$scope.update();
		}
	};
	/**
	 * Updates the fieldTracking & fieldList properties.
	 * @method module:WidgetComponents.ActionTableController#mapDataFields
	 */
	mapDataFields = function() {
		var i;

		fieldList.splice(0);
		if($scope.data.rows && $scope.data.rows.length) {
			for(i=0; i<$scope.data.rows.length; i++) {
				mapFields($scope.data.rows[i]);
			}
		}

		fieldList.push.apply(fieldList, Object.keys(fieldTracking));
	};
	/**
	 * Checks the object keys to ensure that all fields have a RegExp mapping in the `fieldTracking`
	 * object.
	 * @method module:WidgetComponents.ActionTableController#mapFields
	 * @param {Object} row
	 */
	mapFields = function(row) {
		var keys = Object.keys(row),
			i;
		for(i=0; i<keys.length; i++) {
			if(!fieldTracking[keys[i]]) {
				fieldTracking[keys[i]] = new RegExp("\\{\\{" + keys[i] + "\\}\\}", "ig");
			}
		}
	};

	// Initialize local data for table management
	try {
		$scope.columns = JSON.parse($scope.options.columns);
	} catch(parseException) {
		console.error("Action Table: Failed to parse column specifications:", parseException, $scope.options.columns);
		$scope.error = parseException;
	}
	try {
		$scope.actions = JSON.parse($scope.options.actions);
	} catch(parseException) {
		console.error("Action Table: Failed to parse action specifications:", parseException, $scope.options.actions);
		$scope.error = parseException;
	}

	if($scope.data.error) {
		/**
		 * Handles displaying an error to the widget.
		 * 
		 * Generally set by calling the private function `fault`.
		 * @memberof module:WidgetComponents.ActionTableController
		 * @type {Object}
		 * @alias error
		 * 
		 */
		$scope.error = new Error($scope.data.error);
	}
	/**
	 * 
	 * The displayed icon in the filter to give feedback to the user.
	 * @memberof module:WidgetComponents.ActionTableController
	 * @type {String}
	 * @alias filterIcon
	 */
	$scope.filterIcon = "fa-filter";
	/**
	 * The displayed icon for reloading data to give feedback to the user.
	 * @memberof module:WidgetComponents.ActionTableController
	 * @type {String}
	 * @alias reloadIcon
	 */
	$scope.reloadIcon = "fa-refresh";
	/**
	 * Each element contained here is an element that is valid after the rows have been
	 * filtered by search and sort criteria.
	 * @memberof module:WidgetComponents.ActionTableController
	 * @type {Array}
	 * @alias corpus
	 */
	$scope.corpus = [];
	/**
	 * Each element contained here is a row to render on the page. This is pared down to
	 * only the rows that should render based on the current page and sourced from the
	 * corpus array to follow search and sort criteria and drive a faster rendering.
	 * @memberof module:WidgetComponents.ActionTableController
	 * @type {Array}
	 * @alias render
	 * 
	 */
	$scope.render = [];
	/**
	 * Doubles as a page count and rendering array for ng-repeat.
	 * @memberof module:WidgetComponents.ActionTableController
	 * @type {Array}
	 * @alias pages
	 */
	$scope.pages = [];

	// Attempt to recover the previous state of the table, if any
	if(loading) {
		try {
			/**
			 * Holds the stateful data for the widget that should be tracked and
			 * reloaded on refresh. This is specifically accomplished by calls
			 * to `saveState` in combination with a `$watch` specification.
			 * @memberof module:WidgetComponents.ActionTableController
			 * @type {State}
			 * @link State
			 * @alias state
			 */
			$scope.state = JSON.parse(loading);
		} catch(loadException) {
			console.error("ActionTable: State Loading Error: ", loadException);
			$scope.state = {};
		}
	} else {
		$scope.state = {};
	}
	if($scope.state.page === undefined) {
		$scope.state.page = 0;
	}
	if($scope.state.search === undefined) {
		$scope.state.search = "";
	}
	if(!isNaN($scope.options.per_page) && $scope.options.per_page > 0) {
		$scope.state.size = $scope.options.per_page;
	} else if(isNaN($scope.state.size)) {
		$scope.state.size = 20;
	}
	$scope.state.per_page = $scope.state.size.toString();
	if($scope.state.above === undefined) {
		$scope.state.above = -1;
	}
	if($scope.state.below === undefined) {
		$scope.state.below = -1 * $scope.state.above;
	}

	// Cache regular expressions for quick template replacements based on the row's field values
	mapDataFields();

	// When the search string changes, trigger the filtering function to eventually update the rendered values
	$scope.$watch("state.search", function() {
		if(!timing) {
			$scope.filterIcon = "fa-spinner fa-pulse";
			$scope.update();
			filtering();
		}
		timing = Date.now() + 2 * filterInterval;
	});

	// Watch for changes to the size string, likely by the corner select, to push the value into the state and update
	$scope.$watch("state.per_page", function() {
		$scope.state.size = parseInt($scope.state.per_page);
		$scope.loadCorpus();
		saveState();
	});

	/**
	 * Change the direction of sorting or the column to sort by.
	 * 
	 * Calling on the currently sorted column toggles the sort direction.
	 * 
	 * Changing to a new column does NOT change the sort direction.
	 * @method module:WidgetComponents.ActionTableController#reorder
	 * @param {Column} column 
	 */
	$scope.reorder = function(column) {
		if(column) {
			if($scope.state.order === column.field) {
				$scope.state.below *= -1;
				$scope.state.above *= -1;
			} else {
				$scope.state.order = column.field;
			}
			$scope.loadCorpus();
			saveState();
			setIcons();
		}
	};

	/**
	 * Retrieves data from the server if necessary.
	 * 
	 * This is essesntially a stepping method for AJAX sourced data as the other 2 sources
	 * (server script, and table) would already be populated here by the server initialization.
	 * 
	 * The SPGlideAjax is heavily favored for the ability to create new configurable data sources
	 * without modifying the widget or its supporting pieces while also keeping the creating of
	 * the data in a more traditionally understood form, Script Includes, instead of passing the
	 * data through a more web traditional method such as an API, where Scripted APIs may get
	 * heavier. Though support for such a process should be added and would also be handled here.
	 * @method module:WidgetComponents.ActionTableController#loadData
	 */
	$scope.loadData = function() {
		var request;
		
		clearFault();
		switch($scope.options.data_source) {
			case "ajax":
				request = new SPGlideAjax($scope.options.script);
				request.addParam("sysparm_name", $scope.options.script_method);
				request.addParam("query", $scope.options.query);
				request.getXMLAnswer($scope.receiveData);
				break;
			case "snapi":
				if($scope.options.endpoint) {
					if($scope.options.endpoint[0] !== "/") {
						$scope.options.endpoint = "/" + $scope.options.endpoint;
					}
					$http.get($scope.options.endpoint + "?query=" + $scope.options.query)
					.then(function(response) {
						if(response.status === 200) {
							$scope.receiveData(response.data.result);
						} else {
							fault(new Error("Malformed request for endpoint data - HTTP" + response.status + ": " + response.statusText));
						}
					}, fault);
				} else {
					fault(new Error("No 'endpoint' option is defined"));
				}
				break;
			case "server":
			case "table":
				$scope.prepareData();
				break;
			default:
				console.error("Unknown Data Source (data_source) option specified for STSTable widget[" + $scope.options.id + "]: ", $scope);
				$scope.error = {
					"message": "Unknown Data Source (data_source) option specified for widget.",
					"options": $scope.options
				};
		}
	};

	/**
	 * Called for receiving the text portion of a request for data. All text is assumed to be a JSON
	 * object with the general format:
	 * ```
	 * {
	 *     "rows": [{
	 *         Object 1 Data...
	 *     }, {
	 *         Object 2 Data...
	 *     }, {
	 *         ...
	 *     {, 
	 *         Object N Data...
	 *     }]
	 * }
	 * ```
	 * 
	 * An object is used to allow for other information to be present on the API call for use later.
	 * @method module:WidgetComponents.ActionTableController#receiveData
	 * @param {String} response 
	 */
	$scope.receiveData = function(response) {
		var loading;
		if(response) {
			if(typeof(response) === "string") {
				try {
					loading = JSON.parse(response);
				} catch(parseException) {
					fault(parseException);
				}
			} else {
				loading = response;
			}
			if(loading && loading.rows instanceof Array) {
				$scope.data.rows.splice(0);
				$scope.data.rows.push.apply($scope.data.rows, loading.rows);
				$scope.data.loaded = Date.now();
				$scope.prepareData();
			} else {
				fault(new Error("Receive malformed data, must return a Object JSON with a \"rows\" property that contains the array to load"));
			}
		} else {
			fault(new Error("Failed to receive any data"));
		}
	};


	/**
	 * Essentially prepares the data received from the server.
	 * 
	 * This primarily involves setting the `$search` property for easy lower cased
	 * string index checks for filtering based on the columns and `options.filterable`.
	 * 
	 * Additionally, the data objectis emitted on the root scope for other widgets to
	 * consume if needed under the event "ststable:data:[ID]" where "[ID]" is the table's
	 * ID specified in options. This allows another widget on the same page as the table
	 * to implement something akin to `$scope.$on("ststable:data:[ID]", $scope.processAPIData)`
	 * to receive the data and perform any needed actions.
	 * @method module:WidgetComponents.ActionTableController#prepareData
	 */
	$scope.prepareData = function() {
		var column,
			load,
			row,
			c,
			i;

		if($scope.data.rows) {
			for(i=0; i<$scope.data.rows.length; i++) {
				row = $scope.data.rows[i];
				row.$search = "";
				// Ensure that the visible columns are searchable
				if($scope.options.filterable && $scope.options.filterable.length) {
					// Add additional columns that are flagged as filterable in the instance options
					load = $scope.columns.concat($scope.options.filterable);
				} else {
					load = $scope.columns;
				}
				for(c=0; c<load.length; c++) {
					column = load[c];
					if(typeof(row[column.field]) === "string") {
						// Map to lower case; Filter is meant to be case insensitive
						row.$search += " :: " + row[column.field].toLowerCase();
					} else 
					if(typeof(row[column.field]) === "object") {
						// Handle Field Descriptor data
						if(row[column.field].display) {
							row.$search += " :: " + row[column.field].display.toLowerCase();
						}
					} else {
						// Direct Value
						row.$search += " :: " + row[column.field];
					}
				}
			}
			$scope.corpus.sort(sortData);
		}

		mapDataFields();
		$scope.$root.$emit("ststable:data:" + $scope.options.id, $scope.data);
		$scope.loadCorpus();
	};

	/**
	 * Filter and sort the general data received from the server.
	 * 
	 * This serves as our cache for paging through the data set.
	 * @method module:WidgetComponents.ActionTableController#loadCorpus
	 */
	$scope.loadCorpus = function() {
		$scope.corpus.splice(0);
		$scope.pages.splice(0);
		var row,
			i;

		if($scope.data.rows) {
			for(i=0; i<$scope.data.rows.length; i++) {
				row = $scope.data.rows[i];
				if(visible(row)) {
					$scope.corpus.push(row);
				}
			}
			$scope.corpus.sort(sortData);
		}

		$scope.pageCount = $scope.corpus.length/$scope.state.size;
		for(i=0; i<$scope.pageCount; i++) {
			$scope.pages.push(i + 1);
		}

		$scope.loadRender();
	};

	/**
	 * Load data from the `corpus` to the `render` array for the current page being viewed.
	 * @method module:WidgetComponents.ActionTableController#loadRender
	 */
	$scope.loadRender = function() {
		$scope.render.splice(0);

		var start = $scope.state.page * $scope.state.size,
			end = start + $scope.state.size,
			row,
			i;

		for(i=start; i<end && i<$scope.corpus.length; i++) {
			row = $scope.corpus[i];
			if(row) {
				$scope.render.push(row);
			}
		}

		$scope.update();
	};

	/**
	 * Sets the page and updates the `render` array for display via the `loadRender` method.
	 * @method module:WidgetComponents.ActionTableController#toPage
	 * @param {Number} page 
	 */
	$scope.toPage = function(page) {
		$scope.state.page = page - 1;
		$scope.loadRender();
		saveState();
	};

	/**
	 * 
	 * @method module:WidgetComponents.ActionTableController#getPageClasses
	 * @param {Number} page 
	 * @returns {String}
	 */
	$scope.getPageClasses = function(page) {
		if(page -1 === $scope.state.page) {
			return "btn-primary";
		} else {
			return "btn-default";
		}
	};

	/**
	 * Check if an action is visible based on its `condition` object.
	 * 
	 * No condition object indicates it is always visible.
	 * 
	 * Condition checking is managed with the `checkConditions` function.
	 * @method module:WidgetComponents.ActionTableController#actionVisible
	 * @param {Object} row 
	 * @param {Object} action 
	 * @return {Boolean}
	 */
	$scope.actionVisible = function(row, action) {
		if(action.condition) {
			return $scope.checkCondition(row, action.condition);
		}
		return true;
	};

	/**
	 * Process an action object for a row.
	 * @method module:WidgetComponents.ActionTableController#processAction
	 * @param {Object} row 
	 * @param {Object} action 
	 */
	$scope.processAction = function(row, process) {
		var buffer,
			keys,
			i;

		switch(process.action) {
			case "link":
				buffer = $scope.completeTemplate(row, process.perform);
				if(buffer[0] !== "/") {
					buffer = "/" + buffer;
				}
				location = buffer;
				break;
			case "newlink":
				buffer = $scope.completeTemplate(row, process.perform);
				if(buffer[0] !== "/") {
					buffer = "/" + buffer;
				}
				window.open(buffer, "_blank");
				break;
			case "form-modal":
				process = fillin(process, row);
				console.log("FilledIn: ", process);
				spModal.open({
					"shared": $scope.state,
					"value": process,
					"title": process.title,
					"widget": "widget-form",
					"widgetInput": process
				}).then(function (/* button */) {
					// User clicked "OK" - example; button = {"label":"OK","primary":true,"focus":true}
				}, function(/* error */) {
					// User clicked "Cancel", The close button on the dialog, or clicked outside the box
				});
				break;
			case "ajax-call":
				process = fillin(process, row);
				keys = Object.keys(process);
				buffer = new SPGlideAjax(process.ajax_class);
				buffer.addParam("sysparm_name", process.ajax_method);
				for(i=0; i<keys.length; i++) {
					buffer.addParam(keys[i], process[keys[i]]);
				}
				buffer.getXMLAnswer(function(/* response */) {
					if(process.new_url && process.new_url[0] !== "/") {
						process.new_url = "/" + process.new_url;
					}
					switch(process.ajax_complete) {
						case "redirect":
							location = process.new_url;
							break;
						case "newwindow":
							window.open(process.new_url, "_blank");
							break;
					}
				});
				break;
		}
	};

	/**
	 * Get the string to display for the value in row under the column's field value.
	 * @method module:WidgetComponents.ActionTableController#renderValue
	 * @param {Object} row Of data from which to get the value to render.
	 * @param {Object} column Describing what data should be rendered.
	 * @return {String} To place in the table
	 */
	$scope.renderValue = function(row, column) {
		var point = row[column.field],
			formatting,
			buffer,
			value;

		buffer = typeof(point);
		if(buffer === "object") {
			formatting = point.type || column.formatting || buffer;
			value = point.display;
		} else {
			formatting = column.formatting || buffer;
			value = point;
		}

		switch(formatting) {
			case "time":
				buffer = new Date(value);
				return buffer.toLocaleDateString() + " " + buffer.toLocaleTimeString();
			case "date":
				buffer = new Date(value);
				return buffer.toLocaleDateString();
		}
		// Contain runaway decimal point values
		if(typeof(value) === "number" && value%1) {
			value = value.toFixed(3);
		}
		return value;
	};

	/**
	 * Using a Modal, show the status text for the row.
	 * @method module:WidgetComponents.ActionTableController#viewStatusWarning
	 * @param {Object} row 
	 */
	$scope.viewStatusWarning = function(row) {
		spModal.confirm(row.$status_text);
	};

	/**
	 * Performs basic token replacement in a string based on the values in the row object using "{{...}}" for replacement
	 * indicators.
	 * 
	 * Due to service-now template processing, using "${...}" fails without oerly complicated syntax, for example
	 * an option value of "My name is ${name}" simply displays as "My name is name" and looking at the option value
	 * received to the widget, the value of that option will also be "My name is name" because Sevice-Now's templating
	 * has already altered the value.
	 * 
	 * Additionally note that the replacement handling is managed with cached regular expressions generated at the start
	 * of this controller.
	 * @method module:WidgetComponents.ActionTableController#completeTemplate
	 * @param {Object} row 
	 * @param {String} template 
	 * @returns {String} 
	 */
	$scope.completeTemplate = function(row, template) {
		for(var i=0; i<fieldList.length; i++) {
			template = template.replace(fieldTracking[fieldList[i]], row[fieldList[i]] || "");
		}
		return template;
	};

	/**
	 * Every field in the condition that is defined must match the corresponding field value in the row, or the
	 * check fails.
	 * @method module:WidgetComponents.ActionTableController#checkCondition
	 * @param {Object} row 
	 * @param {Object} condition
	 * @returns {Boolean} 
	 */
	$scope.checkCondition = function(row, condition) {
		for(var i=0; i<fieldList.length; i++) {
			if(condition[fieldList[i]] !== undefined && condition[fieldList[i]] !== row[fieldList[i]] && (!row[fieldList[i]] || row[fieldList[i]].value !== condition[fieldList[i]])) {
				return false;
			}
		}
		return true;
	};

	/**
	 * Get a new array of data from the server and apply it to the current state and render.
	 * @method module:WidgetComponents.ActionTableController#reloadData
	 */
	$scope.reloadData = function() {
		var success,
			failure;

		if($scope.options.data_source == "ajax") {
			$scope.loadData();
		} else {
			success = function(response) {
				$scope.data.rows.splice(0);
				$scope.data.rows.push.apply($scope.data.rows, response.data.rows);
				$scope.data.loaded = response.data.loaded;
				$scope.loadData();
				endReload();
			};
			failure = function(error) {
				$scope.error = error;
				endReload();
			};

			$scope.reloadIcon = "fa-refresh fa-spin";
			$scope.update();

			$scope.server.get()
			.then(success, failure);
		}
	};

	/**
	 * 
	 * @method module:WidgetComponents.ActionTableController#getLastUpdateDisplay
	 * @returns {String} 0
	 */
	$scope.getLastUpdateDisplay = function() {
		var date = new Date($scope.data.loaded);
		return date.toLocaleDateString() + " " + date.toLocaleTimeString();
	};

	/**
	 * Forces a re-rendering of AngularJS bindings
	 * @method module:WidgetComponents.ActionTableController#update
	 */
	$scope.update = function() {
		try {
			$scope.$digest();
		} catch(updateException) {
			// Generally just a digest exception from a current update cycle
		}
	};

	// Initialize Corpus for rendering based on the loaded state
	if(!isNaN($scope.options.refresh_interval) && $scope.options.refresh_interval) {
		setTimeout(refresh, $scope.options.refresh_interval);
	}
	$scope.loadData();
	setIcons();
};
