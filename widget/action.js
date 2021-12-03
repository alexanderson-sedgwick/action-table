/** @module Specifications */
/**
 * Describes options to present to the user on the table to take an
 * action on a specific row.
 * 
 * This exists only for documentation purposes and is not actually
 * defined in the instance.
 * @class
 */
class Action {
	constructor() {
		/**
		 * With classes specifically for rendering an icon. This will generally follow font-awesome 4.7 or another glyph set included on your portal
		 * @type {String}
		 */
		this.icon;
		/**
		 * For the displayed text
		 * @type {String}
		 */
		this.label;
		/**
		 * Used for hover text (HTML title property) on the button
		 * @type {String}
		 */
		this.title;
		/**
		 * Indicating how interactions with this action should process.
		 * 
		 * Specific actions that are available:
		 * + `link` or `newlink` go to a URL. `newlink` doing so in a new window or tab
		 * + `form-modal` opens a modal on the page with a form view. Every key's value
		 * 		is filled in for the object passed to the modal. This action also uses several
		 * 		specific extra key values; `table`, `sys_id`, and `view` to specify the form to
		 * 		open. These values are template completed before being invoked.
		 * + `ajax-call` makes an AJAX call similar to a GlideAjax call. This action also fills
		 * 		out the key values for all keys on the object and then passes each key as a parameter
		 * 		in the AJAX call. The `tbl_class` is used to initialize the SPGlideAjax instance and
		 * `tbl_method` is specifically added as the `"sysparm_name"` parameter of the AJAX call.
		 * 		Both keys can also be specified specifically as a key:value pair on the row's data that
		 * 		can be completed for a more dynamic AJAX call. Additionally, a `tbl_complete` key is used
		 * 		for a switch case that can be either `redirect` or `newwindow` and will use the `new_url`
		 * 		key to open or redirect once a response is received. However, as a note, deeply nested
		 * 		data will NOT get replacements.
		 * @type {String}
		 */
		this.action;
		/**
		 * Optional object describing values that have to match for the action to display
		 * @type {Object}
		 */
		this.condition;
		/**
		 * Only for the `link` or `newlink` action, this specifies the URL. Template tokens here
		 * are replaced by the data rows' values.
		 * @type {String}
		 */
		this.perform;
		/**
		 * Only for the `form-modal` action. Specifies the table against which the form should open.
		 * @type {String}
		 */
		this.table;
		/**
		 * Only for the `form-modal` action. Specifies the sys_id of the record to open in the form.
		 * @type {String}
		 */
		this.sys_id;
		/**
		 * Only for the `form-modal` action. Specifies the view to use for the record in the modal.
		 * @type {String}
		 */
		this.view;
		/**
		 * Only for the `ajax-call` action. Specifies the class on which to initialize the GlideAjax.
		 * @type {String}
		 */
		this.ajax_class;
		/**
		 * Only for the `ajax-call` action. Specifies the method to invoke on the Script Include.
		 * @type {String}
		 */
		this.ajax_method;
		/**
		 * Only for the `ajax-call` action. Optional specification of an action to take once the call is
		 * complete.
		 * 
		 * Possible values:
		 * + `redirect`
		 * + `newwindow`
		 * @type {String}
		 */
		this.ajax_complete;
	}
}
