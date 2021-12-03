/** @module ScriptIncludes */
var ActionTableScriptAPI = Class.create();
/**
 * Contains assistive methods for working with the ActionTable widget and acts as
 * an anchor point for leveraging server-side data with script includes while not
 * using the SPGlideAJAX functionality.
 * 
 * Note that ActionTable supports pulling data from a client callable script include
 * as well as leveraging the REST API (Though authentication may pose issues with REST).
 * 
 * Extending this class instead of AbstractAjaxProcessor is not necessary from a
 * functionality perspective, but does help to track or imply why that script
 * exists.
 * @class module:ScriptIncludes.ActionTableScriptAPI
 */
ActionTableScriptAPI.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	"type": "ActionTableScriptAPI",
	"getFieldDescription": ActionTableScriptAPI.getFieldDescription,
	"finishQuery": ActionTableScriptAPI.finishQuery,
	"toJSON": ActionTableScriptAPI.toJSON
});

/**
 * Takes a general query and flushes out the record data with field descriptors.
 * @method module:ScriptIncludes.ActionTableScriptAPI#finishQuery
 * @static
 * @param {GlideRecord} queried That has the search parameters entered and `query()`
 * 		has been called.
 * @return {Array} With 
 */
ActionTableScriptAPI.finishQuery = function(queried) {
	var result = [],
		build,
		keys,
		key,
		i;

	if(queried.next()) {
		keys = Object.keys(queried);
		do {
			build = {};
			for(i=0; i<keys.length; i++) {
				key = keys[i];
				build[key] = ActionTableScriptAPI.getFieldDescription(queried, key);
			}
			result.push(build);
		} while(queried.next());
	}

	return result;
};


/**
 * Retrieve the value for the field along with additional descriptive information about the field
 * in an object to add to the row data.
 * 
 * This does create somewhat of a duplication of data as this extra data will be the same across
 * several rows.
 * @method module:ScriptIncludes.ActionTableScriptAPI#getFieldDescription
 * @static
 * @param {GlideRecord} record 
 * @param {String} name 
 * @returns {Object} With properties; display_value, value, type, label
 */
ActionTableScriptAPI.getFieldDescription = function(record, name) {
	var element = record.getElement(name),
		field = {};

	field.display_value = record.getDisplayValue(name);
	field.value = record.getValue(name);
	if(record) {
		field.type = element.getED().getInternalType();
		field.label = element.getLabel();
	}
	field.display = field.display_value;
	field.descriptive = true;

	return field;
};

/**
 * Convert a GlideRecord's data to JSON.
 * 
 * This method does _NOT_ use `getFieldDescription` as that isn't the expected mode for
 * the ActionTable widget. If looking for more flushed out data, use the `finishQuery`
 * method instead.
 * @method module:ScriptIncludes.ActionTableScriptAPI#toJSON
 * @static
 * @param {GlideRecord} record 
 * @return {Object}
 */
ActionTableScriptAPI.toJSON = function (record, raw) {
	raw = raw || {};
	var keys = Object.keys(record),
		json = {},
		i;

	json.$search = "";
	if (typeof (record.getValue) === "function") {
		for (i = 0; i < keys.length; i++) {
			json[keys[i]] = raw[keys[i]] ? record.getValue(keys[i]) : record.getDisplayValue(keys[i]);
		}
	} else {
		for (i = 0; i < keys.length; i++) {
			json[keys[i]] = record[keys[i]];
		}
	}

	return json;
};

/**
 * Pull general data from a table.
 * @method module:ScriptIncludes.ActionTableScriptAPI#getTableData
 * @param {String} table To query
 * @param {String} query Encoded Query to pass into the query.
 * @param {Number} [page_size] Optional limiter for number of rows to retrieve.
 * @param {Number} [page] Optional offset for getting a specific page of data.
 * @return {Array} Of records.
 */
ActionTableScriptAPI.prototype.getTableData = ActionTableScriptAPI.getTableData = function (table, query, page_size, page) {
	var search = new GlideRecord(table),
		offset = page * page_size,
		result = [],
		i;

	search.addEncodedQuery(query);
	search.query();
	if (search.hasNext()) {
		for (i = 0; i < offset; i++) {
			search.next();
		}
		while (search.next()) {
			result.push(ActionTableScriptAPI.toJSON(search));
		}
	}

	return result;
};

/**
 * Returns non-persistent random data; If a page is requested twice, the data will not be the same.
 * 
 * Uses page_size to gauge the amount of data to generate.
 * @method module:ScriptIncludes.ActionTableScriptAPI#generateExampleData
 * @static
 * @param {String} filter 
 * @param {Number} page_size Defaults to 30
 * @return {Array} Length either 5 * page_size or 30 of semi-random.
 */
ActionTableScriptAPI.generateExampleData = function (filter, page_size) {
	var result = [],
		amount;

	if(page_size) {
		amount = page_size * 10;
	} else {
		amount = 30;
	}

	for (var i = 0; i < amount; i++) {
		result.push(ActionTableScriptAPI.toJSON({
			"name": "Name Test " + i,
			"short_description": "Short Description " + i,
			"sys_id": "abcd_" + i,
			"state": Math.random() < .3 ? "inactive" : "active"
		}));
	}

	return result;
};

/**
 * Returns non-persistent random data; If a page is requested twice, the data will not be the same.
 * 
 * Uses page_size to gauge the amount of data to generate.
 * @method module:ScriptIncludes.ActionTableScriptAPI#getExampleData
 * @param {String} filter 
 * @param {Number} page_size Defaults to 30
 * @return {Array} Length either 5 * page_size or 30 of semi-random.
 */
ActionTableScriptAPI.prototype.getExampleData = function(filter, page_size) {
	page_size = page_size || this.getParameter("page_size");
	filter = filter || this.getParameter("filter");
	return JSON.stringify({
		"rows": ActionTableScriptAPI.generateExampleData(filter, page_size)
	});
};
