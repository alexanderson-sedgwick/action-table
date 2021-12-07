/**
 * Represents an entry of information to display on the table.
 * 
 * This piece serves to document special properties of a row that the widget uses.
 * 
 * This exists only for documentation purposes and is not actually
 * defined in the instance.
 * @memberof Specifications
 */
class Row {
	constructor() {
		/**
		 * When set, an icon is prefixed to this row that when clicked will display
		 * an alert with this text, or when the user hovers over the prefixed icon.
		 * @type {String}
		 */
		this.$status_text;
		/**
		 * The CSS class string to apply to the prefixed button as a whole.
		 * 
		 * This can usually be left blank but can be useful for styling the status icon
		 * to a button, or otherwise calling out the interactability of the piece.
		 * @type {String}
		 */
		this.$status_class;
		/**
		 * The CSS classes to render the icon for the status. These should usually be
		 * FontAwesome 4.7 classes ( https://fontawesome.com/v4.7/ ) such as "fas fa-exclamation-triangle"
		 * but may include glyphs from other added glyph sets, which is why this is left
		 * as an open ended string.
		 * @type {String}
		 */
		this.$status_icon;
	}
}
