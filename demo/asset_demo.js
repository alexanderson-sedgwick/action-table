/** @module ScriptIncludes */
ActionTableDemoAssets = Class.create();
/**
 * Demo script include for getting asset data.
 * @class module:ScriptIncludes.ActionTableDemoAssets
 */
ActionTableDemoAssets.prototype = Object.extendsObject(ActionTableScriptAPI, {
    "type": "ActionTableDemoAssets",
	/**
	 * Get assets for the current user.
	 * @method module:ScriptIncludes.ActionTableDemoAssets#getMyAssets
	 * @returns {String} JSON for the array of assets
	 */
	"getMyAssets": function() {
		var search = new GlideRecord("alm_asset"),
			result = [],
			loading;
		search.addQuery("assigned_to", gs.getUserID());
		search.addQuery("install_status", "!=", "7");
		search.query();
		while(search.next()) {
			loading = this.getJSON(search);
			result.push(loading);
			if(!loading.ci) {
				loading.$status_class = "btn btn-danger";
				loading.$status_text = "No Configuration Item is associated with this asset";
				loading.$status_icon = "fa fa-exclamation-triangle";
			} else if(!loading.assigned) {
				loading.$status_class = "btn btn-warning";
				loading.$status_text = "This asset has no assignment date";
				loading.$status_icon = "fa fa-exclamation-triangle";
			}
		}
		return JSON.stringify({
			"rows": result
		});
	},
    "type": "ActionTableDemoAssets",
	/**
	 * Add worknotes to the indicated asset.
	 * @method module:ScriptIncludes.ActionTableDemoAssets#assetSubstatus
	 * @param {String} asset_id SysID for the asset to update
	 * @param {String} substatus To include in the work note.
	 */
	"assetSubstatus": function(asset_id, substatus) {
		var asset = new GlideRecord("alm_asset");
		asset_id = asset_id || this.getParameter("asset_id");
		substatus = substatus || this.getParameter("substatus");
		if(asset.get(asset_id)) {
			// asset.setValue("substatus", this.getParameter("substatus"));
			asset.work_notes = "This should move to " + substatus + " ( [code]<a href=\"/sys_user.do?sys_id=" + gs.getUserID() + "\">" + gs.getUserDisplayName() + "</a>[/code] )";
			asset.update();
		}
	}
});


/**

Example Column Description JSON
[
    {
        "label": "Name",
        "field": "display_name"
    },
    {
        "label": "Model",
        "field": "model"
    },
    {
        "label": "Serial Number",
        "field": "serial_number"
    },
    {
        "label": "Installed",
        "field": "install_date"
    },
    {
        "label": "Status",
        "field": "substatus"
    }
]

Example Action Description JSON
[
    {
        "label": "",
        "icon": "fa fa-info-circle",
        "title": "{{display_name}}",
        "action": "form-modal",
        "perform": "/alm_asset.do?sys_id={{sys_id}}",
        "classes": "btn btn-success",
        "table": "alm_hardware",
        "sys_id": "{{sys_id}}",
        "view": "default"
    },
    {
        "label": "",
        "icon": "fa fa-external-link",
        "field": "name",
        "action": "newlink",
        "classes": "btn btn-success",
        "perform": "/alm_asset.do?sys_id={{sys_id}}"
    },
    {
        "label": "Sold",
        "action": "ajax-call",
        "perform": "/sys_user.do?sys_id={{sys_id}}",
        "classes": "btn btn-primary",
        "tbl_class": "ActionTableDemoAssets",
        "tbl_method": "assetSubstatus",
		"asset_id": "{{sys_id}}",
        "substatus": "sold"
    },
    {
        "label": "Donated",
        "action": "ajax-call",
        "perform": "/sys_user.do?sys_id={{sys_id}}",
        "classes": "btn btn-primary",
        "tbl_class": "ActionTableDemoAssets",
        "tbl_method": "assetSubstatus",
		"asset_id": "{{sys_id}}",
        "substatus": "donated"
    }
]
 */
