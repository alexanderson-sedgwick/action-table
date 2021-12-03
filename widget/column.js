/**
 * Describes a field from a row data object to render on the table.
 * 
 * This exists only for documentation purposes and is not actually
 * defined in the instance.
 * @memberof Specifications
 */
class Column {
	constructor() {
		/**
		 * Displayed essentially as the header for this column on
		 * the table.
		 * @type {String}
		 */
		this.label;
		/**
		 * To pull the data from on the row data object.
		 * @type {String}
		 */
		this.field;
	}
}