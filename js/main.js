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
  'dijit/MenuItem',
  'JBrowse/Plugin',
  './View/QuickMarkDialog'
], function (declare, lang, Deferred, dom, domConstruct, dijitMenuSeparator, dijitCheckedMenuItem, dijitDropDownButton, dijitDropDownMenu, dijitButton, dijitMenuItem, JBrowsePlugin, QuickMarkDialog) {
  return declare(JBrowsePlugin, {
    constructor: function (args) {
      this._searchTrackCount = 0;
      var searchButton;
      var thisB = this;
      var menu;
      this.browser.afterMilestone('initView', function () {
        var buttontext = new dijitMenuItem({
          label: 'Quick Bookmarks',
          iconClass: 'dijitIconBookmark',
          onClick: lang.hitch(this, 'createQuickMark')
        });
      };
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
