# Action Table

A configurable table widget designed to pull data from scripts or tables and provide an instance option way to configure conditional buttons for each row.

GitHub Repository: [https://github.com/alexanderson-sedgwick/action-table](https://github.com/alexanderson-sedgwick/action-table)

Documentation: [https://alexanderson-sedgwick.github.io/action-table/](https://alexanderson-sedgwick.github.io/action-table/)

# Quick Setup

The easiest way to setup data for the table while keeping your update set contained is with a client callable script include.

## Create the Script Include

1. In your instance start a new Script Include ( /sys_script_include.do?sys_id=-1 )
2. Enable "Client Callable"
3. Setup the method that will return the data to return a JSON string of the array
4. Setup any methods you wish to be called from buttons on the table (if any)

## Configure the Widget Instance

1. Set the Data source as "Client Callable Script"
2. For "Client Script to Call" enter the name of the script you created
3. For "Script Method for Data" enter the name of the method from the script that returns the data
4. For "Columns JSON" enter a JSON array of objects describing a "label" and a "field". The label is displayed in the header and the field is the field from the returned data objects to be displayed in the cell. As an example;
```
[
    {
        "label": "Name",
        "field": "name"
    },
    {
        "label": "Short Description",
        "field": "short_description"
    }
]
```
5. For the "Actions JSON" enter JSON describing the action that can be provided to a row. These may have simple conditions mapping a field name to a specific value where the action is only visible when all parts of the condition object match. As an example;
```
[
    {
        "label": "Activate {{name}}",
        "field": "name",
        "action": "link",
		"title": "Activate {{name}}",
        "classes": "btn btn-success",
        "perform": "/incident.do?sys_id=-1&test={{sys_id}}",
        "condition": {
            "state": "inactive"
        }
    },
    {
        "label": "Deactivate {{name}}",
        "field": "name",
        "action": "link",
		"title": "Deactivate {{name}}",
        "classes": "btn btn-warning",
        "perform": "/incident.do?sys_id=-1&test={{sys_id}}",
        "condition": {
            "state": "active"
        }
    }
]
```
6. Fill out any other options as desired (See their help text). They are not required.

# Additional Actions

The action object has a few set fields that the widget uses to display the data and each `action` has additional fields that it uses. Each field that's used is usually updated with template replacements, thus in the above examples, `{{name}}` is replaced with the name field from the object for that row, and the `{{sys_id}}` value for the url allows creaiton of specific links.

Each object has a few key values specific to rendering the button:
+ `icon` With classes specifically for rendering an icon. This will generally follow font-awesome 4.7 or another glyph set included on your portal
+ `label` For the displayed text
+ `title` Used for hover text (HTML title property) on the button
+ `condition` Optional object describing values that have to match for the action to display
+ `action` Indicating how interactions with this action should process.

The `action` field describes what kind of action is taken when the button is pressed and has a few options:
+ `link` or `newlink` go to a URL. `newlink` doing so in a new window or tab. Example:
```
{
	"label": "Activate {{name}}",
	"action": "link",
	"title": "Activate {{name}}",
	"classes": "btn btn-success",
	"perform": "/incident.do?sys_id=-1&test={{sys_id}}",
	"condition": {
		"state": "inactive"
	}
}
```
+ `form-modal` opens a modal on the page with a form view. Every key's value is filled in for the object passed to the modal. This action also uses several specific extra key values; `table`, `sys_id`, and `view` to specify the form to open. These values are template completed before being invoked. Example:
```
{
	"label": "",
	"title": "{{name}}",
	"action": "form-modal",
	"classes": "btn btn-primary",
	"icon": "fa fa-info-circle",
	"table": "sys_user",
	"sys_id": "{{sys_id}}",
	"view": "default"
}
```
+ `ajax-call` makes an AJAX call similar to a GlideAjax call. This action also fills out the key values for all keys on the object and then passes each key as a parameter in the AJAX call. The `ajax_class` is used to initialize the SPGlideAjax instance and `ajax_method` is specifically added as the `"sysparm_name"` parameter of the AJAX call. Both keys can also be specified specifically as a key:value pair on the row's data that can be completed for a more dynamic AJAX call. Additionally, a `ajax_complete` key is used for a switch case that can be either `redirect` or `newwindow` and will use the `new_url` key to open or redirect once a response is received. However, as a note, deeply nested data will NOT get replacements. Example:
```
{
	"label": "Call AJAX",
	"title": "Activate {{name}}",
	"classes": "btn btn-success",
	"action": "ajax",
	"ajax_method": "ClientCallableScript",
	"ajax_method": "ScriptFunction",
	"some_data_for_the_function": "{{sys_id}}",
	"quick_note": {
		"this_will_NOT_be_replaced": "{{name}}"
	}
}
```
