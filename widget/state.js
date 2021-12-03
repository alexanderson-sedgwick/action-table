/**
 * Important stateful data for the Widget.
 * 
 * This exists only for documentation purposes and is not actually
 * defined in the instance.
 * @memberof Specifications
 */
class State {
	constructor() {
		/**
		 * Used for filtering a row based on
		 * the values within it.
		 * @type String
		 */
		this.search;
		/**
		 * The current page of the table being rendered.
		 * @type Number
		 */
		this.page;
		/**
		 * The number of rows to display per page.
		 * of the `state.size` value is copied here used for user control of the
		 * paging size. This is later in a $watch statement to handle keeping
		 * size straight when changed this way.
		 * 
		 * Direct modifications to `state.size` after the widget has been created
		 * will NOT currently be reflected back to this value.
		 * @type Number
		 */
		this.size;
		/**
		 * Names the column by which to sort rows
		 * using the field value of the column.
		 * 
		 * If the field does not exist, no ordering is explicitly performed
		 * @type Number
		 */
		this.order;
		/**
		 * Controls the sort ordering and is returned
		 * when `a` is considered to precede `b`.
		 * @type Number
		 */
		this.above;
		/**
		 * Controls the sort ordering and is returned
		 * when `a` is considered to procede `b`.
		 * @type Number
		 */
		this.below;
	}
}
