/** @module WidgetComponents */
/**
 * The Angular controller for managing the Action Table
 * @class module:WidgetComponents.ActionTableServerScript
 */

/**
 * Object created by Service-Now and passed to the Widget controller on initialization.
 * @memberof module:WidgetComponents.ActionTableServerScript
 * @typedef {Object} data
 * @property {Number} loaded Timestamp for when the data was retrieved
 * @property {Array} rows Contains the row data for the table
 * @property {Object} error Message from an error while building the data for the table.
 * @property {String} error.message The message to display for the error.
 */

/**
 * Object created by Service-Now and passed to the Widget controller on initialization.
 * @memberof module:WidgetComponents.ActionTableServerScript
 * @typedef {Object} options
 * @property {String} filterable Comma seperated list of fields that should be added
 * 		to the $search property of objects for easy filtering.
 * @property {Number} per_page Forces the table to show a set number of rows per page
 * 		of data and hides the per_page selector on the table.
 * @property {Number} refresh_interval Milliseconds to wait between pulling data
 * 		from the server again.
 * @property {String} data_source Indicating where/how to retrieve data.
 */
(function() {
	var buffer,
		i;


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
			case "table":
				data.rows = ActionTableScriptAPI.getTableData(options.table, options.query);
				break;
			case "server":
				if(typeof(ActionTableScriptAPI[options.script_method]) == "function") {
					data.rows = ActionTableScriptAPI[options.script_method](options.query);
				} else {
					buffer = "Action Table: Script Method \"" + options.script_method + "\" does not exist for Script ActionTableScriptAPI";
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
		data.error = {
			"message": sourceException.message || "Generic Error occurred"
		};
		gs.error(sourceException);
	}
})();
