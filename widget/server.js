/**
 * The Angular controller for managing the Action Table
 * @class module:WidgetComponents.ActionTableServerScript
 */
(function() {
	var buffer,
		i;

	/**
	 * Object created by Service-Now and passed to the Widget controller on initialization.
	 * @property data
	 * @type Object
	 */

	/**
	 * Track when the data was retrieved
	 * @property data.loaded
	 * @type Number
	 */
	data.loaded = Date.now();

	// Level Set Options
	if(options.refresh_interval) {
		options.refresh_interval = parseInt(options.refresh_interval);
		if(isNaN(options.refresh_interval) || options.refresh_interval < 60000) {
			options.refresh_interval = 60000;
		}
	}

	if(options.filterable) {
		options.filterable = options.filterable.split(",");
		for(i=0; i<options.filterable.length; i++) {
			options.filterable[i] = options.filterable[i].trim();
		}
	} else {
		options.filterable = [];
	}

	if(options.per_page) {
		options.per_page = parseInt(options.per_page);
	}

	// Retrieve rows based on options
	try {
		switch(options.data_source) {
			/**
			 * Contains the row data for the table
			 * @property data.rows
			 * @type Array
			 */
			case "table":
				data.rows = STSTableScriptAPI.getTableData(options.table, options.query);
				break;
			case "server":
				if(typeof(STSTableScriptAPI[options.script_method]) == "function") {
					data.rows = STSTableScriptAPI[options.script_method](options.query);
				} else {
					buffer = "Action Table: Script Method \"" + options.script_method + "\" does not exist for Script STSTableScriptAPI";
					gs.error(buffer);
					throw new Error(buffer);
				}
				break;
			case "snapi":
			case "ajax":
				// Handled Client Side
				data.rows = [];
				break;
			default:
				gs.error("Action Table: Unknown Data Source: " + options.data_source);
		}
	} catch(sourceException) {
		/**
		 * Message from an error while building the data for the table
		 * @property data.error
		 * @type String
		 */
		data.error = sourceException.message || "Generic Error occurred";
		gs.error(sourceException);
	}
})();
