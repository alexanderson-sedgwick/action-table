function SPGlideAjax($http) {
	/** @module AngularProviders */

	/**
	 * A simplified version of GlideAJAX for use within the Service Portal.
	 *
	 * This specifically implements getAnswer and getXMLAnswer with some modernization
	 * for Promise support through Angular's $http service.
	 * @class module:AngularProviders.SPGlideAjax
	 * @param {$http} $http
	 * @example
	 * // Script Include
	 * var Example = Class.create();
	 * Example.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	 * 	"type": "Example",
	 * 	"functionA": function() {
	 * 		return this.getParameter("a");
	 * 	}
	 * });
	 * 
	 * // Client Script
	 * function _controller($scope, SPGlideAjax) {
	 *	var ga = new SPGlideAjax("Example");
	 *	ga.addParam("sysparm_name", "functionA");
	 *	ga.addParam("a", 9);
	 *	// (This will print "9" as a warning to the browser's console)
	 *	ga.getXMLAnswer(console.warn);
	 *}
	 */

	/**
	 * Static space reference for quick replacement.
	 * @type {RegExp}
	 * @memberof module:AngularProviders.SPGlideAjax
	 * @instance
	 * @private
	 */
	var regexSpace = / /g;

	/**
	 * Service-Now's GlideAjax works with form data strings instead of JSON,
	 * so this is used to convert the parameters to the appropriate format.
	 * @method module:AngularProviders.SPGlideAjax#serializeToForm
	 * @priavte
	 * @param {Object} data The object to parse into form data. The values off the object
	 * 		should be easily represented as strings or issues may occur.
	 * @return {String} Form data string of the data in the passed object
	 */
	var serializeToForm = function(data) {
		var keys = Object.keys(data),
			encoding = [],
			x;

		for (x = 0; x < keys.length; x++) {
			encoding.push(encodeURIComponent(keys[x]) + "=" + encodeURIComponent(data[keys[x]] ? data[keys[x]].toString() : ""));
		}

		return encoding.join("&").replace(regexSpace, "+");
	};

	/**
	 * General options to use with all $HTTP calls
	 * @type {Object}
	 * @memberof module:AngularProviders.SPGlideAjax
	 * @instance
	 * @private
	 */
	var generalOptions = {
		"headers": {
			"content-type": "application/x-www-form-urlencoded; charset=utf-8"
		}
	};

	// The actual class constructor returned by the Factory declaration in Angular
	return function(processor) {
		var factory = this,
			parameters = {};
		parameters.sysparm_processor = processor;
		parameters.sysparm_scope = "global";
		parameters.sysparm_want_session_messages = "true";

		/**
		 * Uses the parameters object to handle processing.
		 *
		 * If the sysparm_name property is missing, a warning is sent to the
		 * console for developer awareness.
		 * @method module:AngularProviders.SPGlideAjax#getAnswer
		 * @param {Function} callback Takes callback(answer, error) and resolves appropriately
		 * 		the same as the returned promise.
		 * @return {Promise} The promise resolves with the answer XML element on
		 * 		success or an Error object on failure.
		 */
		this.getAnswer = function(callback) {
			if (!parameters.sysparm_name) {
				console.warn("GlideAJAX call with no sysparm_name defined; Call addParam('sysparm_name', '[ScriptInclude Method Name]') prior to calling getXMLAnswer");
			}

			return $http.post("/xmlhttp.do", serializeToForm(parameters), generalOptions)
			.then(function(response) {
				var el = $(response.data),
					answer;
				if (el && el.length >= 2 && el[1].getAttribute) {
					answer = el[1];
					if (callback) {
						callback(answer);
					}
					return answer;
				} else {
					if (callback) {
						callback(null);
					}
					return null;
				}
			});
		};

		/**
		 * Sets a parameter for a pending AJAX request.
		 * @method module:AngularProviders.SPGlideAjax#addParam
		 * @param {String} field The name of the field to be passed.
		 * @param {String} value The value to be passed for that field.
		 */
		this.addParam = function(field, value) {
			parameters[field] = value;
		};

		/**
		 * Get the answer property from the returned XML.
		 * @method module:AngularProviders.SPGlideAjax#getXMLAnswer
		 * @param {Function} callback Takes callback(answer, error) and resolves appropriately
		 * 		the same as the returned promise.
		 * @return {Promise} Resolves on success with the answer string and on failure
		 * 		throws to the catch chain.
		 */
		this.getXMLAnswer = function(callback) {
			return factory.getAnswer()
			.then(function(answer) {
				if (answer && answer.getAttribute) {
					answer = answer.getAttribute("answer");
				} else {
					answer = null;
				}
				if (!answer) {
					answer = null;
				}
				if (callback) {
					callback(answer);
				}
			}, callback);
		};
	};
}
