(function($) {
    // TODO: make the node ID configurable
    var treeNode = $('#jsdoc-toc-nav');

    // initialize the tree
    treeNode.tree({
        autoEscape: false,
        closedIcon: '&#x21e2;',
        data: [{"label":"<a href=\"module-AngularProviders.html\">AngularProviders</a>","id":"module:AngularProviders","children":[{"label":"<a href=\"module-AngularProviders.SPGlideAjax.html\">SPGlideAjax</a>","id":"module:AngularProviders.SPGlideAjax","children":[]}]},{"label":"<a href=\"module-ScriptIncludes.html\">ScriptIncludes</a>","id":"module:ScriptIncludes","children":[{"label":"<a href=\"module-ScriptIncludes.ActionTableScriptAPI.html\">ActionTableScriptAPI</a>","id":"module:ScriptIncludes.ActionTableScriptAPI","children":[]}]},{"label":"<a href=\"module-WidgetComponents.html\">WidgetComponents</a>","id":"module:WidgetComponents","children":[{"label":"<a href=\"module-WidgetComponents.ActionTableServerScript.html\">ActionTableServerScript</a>","id":"module:WidgetComponents.ActionTableServerScript","children":[]},{"label":"<a href=\"module-WidgetComponents-ActionTableController.html\">ActionTableController</a>","id":"module:WidgetComponents~ActionTableController","children":[]}]}],
        openedIcon: ' &#x21e3;',
        saveState: false,
        useContextMenu: false
    });

    // add event handlers
    // TODO
})(jQuery);
