define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/Deferred',
    'dojo/dom',
    'dojo/dom-construct',
    'dijit/MenuSeparator',
    'dijit/CheckedMenuItem',
    'dijit/form/DropDownButton',
    'dijit/DropDownMenu',
    'dijit/form/Button',
    'dijit/registry',
    'dijit/MenuItem',
    'JBrowse/Plugin',
    './View/QuickMarkDialog'
], function (
    declare,
    lang,
    Deferred,
    dom,
    domConstruct,
    dijitMenuSeparator,
    dijitCheckedMenuItem,
    dijitDropDownButton,
    dijitDropDownMenu,
    dijitButton,
    dijitRegistry,
    dijitMenuItem,
    JBrowsePlugin,
    QuickMarkDialog
) {
    return declare(JBrowsePlugin, {
        constructor: function (args) {
            this._searchTrackCount = 0;
            var searchButton;
            var thisB = this;
            var myBrowser = this.browser;
            var menu;

            console.log('Bookmark plugin starting');
            myBrowser.afterMilestone('initView', function () {
                var buttontext = new dijitMenuItem({
                    label: 'Quick Bookmarks',
                    iconClass: 'dijitIconBookmark',
                    onClick: lang.hitch(thisB, 'createQuickMark')
                });

                myBrowser.addGlobalMenuItem('tools', buttontext);

                if (dijitRegistry.byId('dropdownmenu_tools') == undefined) {
                    myBrowser.renderGlobalMenu('tools', {text: 'Tools'}, myBrowser.menuBar);
                }

                console.log('Bookmark plugin added');
            });
        },

        createQuickMark: function () {
            var quickMark = new QuickMarkDialog();
            var browser = this.browser;
            quickMark.show(browser, function (searchParams) {
                if (searchParams) {
                    console.log(searchParams);
                }
                return;
            });
        }
    });
});
