define([
    'dojo/_base/lang',
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/dom-construct',
    'dojo/aspect',
    'dijit/Dialog',
    'dijit/focus',
    'dijit/form/Button',
    'dijit/form/TextBox',
    'dijit/form/Select',
    'JBrowse/View/Dialog/WithActionBar',
    'dojo/domReady!'
],
function (
    lang,
    declare,
    array,
    dom,
    aspect,
    dijitDialog,
    focus,
    dButton,
    dTextBox,
    dSelect,
    ActionBarDialog
) {
    return declare(ActionBarDialog, {
        constructor: function () {
            var thisB = this;
            aspect.after(this, 'hide', function () {
                focus.curNode && focus.curNode.blur();
                setTimeout(function () {
                    thisB.destroyRecursive();
                }, 500);
            });
        },
        _dialogContent: function () {
            var myBrowser = this.browser;
            var content = this.content = {};
            var dataRoot = this.dataRoot;
            content.selectedRows = [];
            var container = dom.create('div', { className: 'search-dialog' });
            var introdiv = dom.create('div', {
                className: 'mark-dialog intro',
                innerHTML: 'Save a bookmark of your current view. Double click on bookmark to load view in current window.'
            }, container);
            var markDescriptionDiv = dom.create('div', { className: 'markDescrpit' }, container);
            var matchMessageDiv = dom.create('div', {
                innerHTML: 'No bookmarks have been created.',
                className: 'header'
            }, container);
            content.matchMessageDiv = matchMessageDiv;
            var headerDiv = dom.create('div', { className: 'header' }, container);
            content.headerDiv = headerDiv;
            dom.create('span', {
                innerHTML: 'Genome',
                className: 'header-field matches-generic-field'
            }, headerDiv);
            dom.create('span', {
                innerHTML: 'Location',
                className: 'header-field matches-generic-field'
            }, headerDiv);
            dom.create('span', {
                innerHTML: 'Start',
                className: 'header-field matches-generic-field'
            }, headerDiv);
            dom.create('span', {
                innerHTML: 'End',
                className: 'header-field matches-generic-field'
            }, headerDiv);
            dom.create('span', {
                innerHTML: 'Description',
                className: 'header-field matches-generic-field'
            }, headerDiv);
      // Add bookmark (with description)
            content.markBox = new dTextBox({
                id: 'markBox',
                value: '',
                placeHolder: '(optional) Description of bookmark'
            }).placeAt(markDescriptionDiv);
            var populate = function () {
                var store = JSON.parse(localStorage.getItem('JBrowseMarks'));
                if (store === null) {
                    dojo.style(matchMessageDiv, { display: 'block' });
                    dojo.style(headerDiv, { display: 'none' });
                } else {
                    dojo.style(matchMessageDiv, { display: 'none' });
                    dojo.style(headerDiv, { display: 'block' });
                    var oldLinks = dojo.query('.match-div-header');
                    if (oldLinks.length > 0) {
                        oldLinks.forEach(dojo.destroy);
                    }
                    var markDiv = dojo.create('div', { className: 'match-div-header' }, content.headerDiv);
                    content.markDiv = markDiv;
                    var toggleColor = function (id) {
                        return function () {
                            if (content.selectedRows === null) {
                                content.selectedRows = [];
                                content.selectedRows.push(id);
                            } else {
                                var selected = content.selectedRows.indexOf(id);
                                if (selected != -1) {
                                    content.selectedRows.splice(selected, 1);
                                    dojo.query('.match-header' + id).style('color', 'black');
                                } else {
                                    content.selectedRows.push(id);
                                    dojo.query('.match-header' + id).style('color', '#D24D57');
                                }
                            }
                        };
                    };
                    var openLink = function (link) {
                        return function () {
                            window.open(link, '_self');
                        };
                    };


                    var hideTracks = function (tracklist) {
                        var toHide = [];
                        array.forEach(tracklist, lang.hitch(this, function (track) {
                            if (array.indexOf(myBrowser.view.visibleTrackNames(), track) != -1) {
                                toHide.push(myBrowser.trackConfigsByName[track]);
                            }
                        }));

                        myBrowser.publish('/jbrowse/v1/c/tracks/hide', toHide);
                    };

                    var showTracks = function (tracklist) {
                        var toShow = [];

                        array.forEach(tracklist, lang.hitch(this, function (track) {
                            if (array.indexOf(myBrowser.view.visibleTrackNames(), track) == -1) {
                                toShow.push(myBrowser.trackConfigsByName[track]);
                            }
                        }));

                        myBrowser.publish('/jbrowse/v1/c/tracks/show', toShow);
                        myBrowser.publish('/jbrowse/v1/n/tracks/visibleChanged');
                    };

                    var openLink = function (link, gen, refl, startl, endl) {
                        return function () {
                            var compare = /([^/]*)(.*\/)?(.*)?$/.exec(window.JBrowse.config.dataRoot);
                            compare = compare.filter(function (n) {return n != undefined;});

                            if (compare[compare.length - 1] === gen) {
                                var getTrack = new RegExp('(.*tracks=)([^&]*)(.*)');
                                var tracks = getTrack.exec(window.location.href);
                                var oldTracks = tracks[2].split('%2C');
                                tracks = getTrack.exec(link);
                                var newTracks = tracks[2].split('%2C');

                                hideTracks(oldTracks);
                                showTracks(newTracks);

                                var loc = refl + ':' + startl + '..' + endl;
                                window.JBrowse.navigateTo(loc);
                            } else {
                                window.open(link, '_self');
                            }
                        };
                    };



                    for (var i = 0, mleng = store.length; i < mleng; i++) {
                        var popre = new RegExp('.*[&?]loc=([^:%]*)[:%3A]*([0-9]*)\\.\\.([0-9]*).*');
                        var view = popre.exec(store[i].Link);
                        var gencomp = /([^/]*)(.*\/)?(.*)?$/.exec(store[i].Genome);
                        console.log(gencomp);
                        gencomp = gencomp.filter(function (n) {return n != undefined;});
                        var gen = gencomp[gencomp.length - 1];
                        var loc = view[1];
                        var start = view[2];
                        var end = view[3];
                        var desc = store[i].Desc;
                        var id = store[i].Id;
                        var link = view[0];
                        var newRow = dojo.create('div', {
                            id: 'match-header' + id,
                            className: 'match-header' + id
                        }, markDiv);
                        var genCol = dojo.create('span', {
                            className: 'matches-generic-match',
                            innerHTML: gen
                        }, newRow);
                        var locCol = dojo.create('span', {
                            className: 'matches-generic-match',
                            innerHTML: loc
                        }, newRow);

                        var startCol = dojo.create('span', {
                            className: 'matches-generic-match',
                            innerHTML: start
                        }, newRow);
                        var endCol = dojo.create('span', {
                            className: 'matches-generic-match',
                            innerHTML: end
                        }, newRow);
                        var descCol = dojo.create('span', {
                            className: 'matches-generic-match',
                            innerHTML: desc
                        }, newRow);
                        dojo.connect(newRow, 'onclick', toggleColor(id));
                        dojo.connect(newRow, 'ondblclick', openLink(link, gen, loc, start, end));
                    }
                }
            };
            populate();
            var Bookmark = function (id, dataroot, link, desc) {
                this.Id = id;
                this.Genome = dataroot;
                this.Link = link;
                this.Desc = desc;
            };
            var addMarkButton = new dButton({
                iconClass: 'dijitIconBookmark',
                showLabel: true,
                label: 'Add Bookmark',
                onClick: function () {
                    var desc = content.markBox.get('value');
                    var dataroot = window.JBrowse.config.dataRoot;
                    var link = window.location.href;
                    console.log('jbrowse loc:' + link);
                    var existing = JSON.parse(localStorage.getItem('JBrowseMarks'));
                    var id = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + Date.now();
                    if (parent !== window) {
                        var parFrame = document.referrer;
                        var re1 = new RegExp('(.*)\\?data=.*');
                        var re2 = new RegExp('.*(\\?data=.*)');
                        var docRoot = re1.exec(parFrame);
                        var docLoc = re2.exec(link);
                        console.log('Parent:' + docRoot + '\n' + 'frame:' + docLoc);
                        link = docRoot[1] + docLoc[1];
                    }
                    var bmark = new Bookmark(id, dataroot, link, desc);
                    var marks = [];
                    if (existing) {
                        marks = existing;
                    }
                    marks.push(bmark);
                    localStorage.setItem('JBrowseMarks', JSON.stringify(marks));
                    populate();
                    content.markBox.reset();
                }
            }).placeAt(markDescriptionDiv);
            var controldiv = dom.create('div', { className: 'control-div' }, container);
            var clearSelectedButton = new dButton({
                showLabel: true,
                label: 'Clear Selections',
                onClick: function () {
                    var existing = JSON.parse(localStorage.getItem('JBrowseMarks'));
                    var selected = content.selectedRows;
                    for (var i in selected) {
                        for (var j in existing) {
                            dojo.query('.match-header' + existing[j].Id).style('color', 'black');
                        }
                    }
                    content.selectedRows = [];
                }
            }).placeAt(controldiv);
            var removeSelectedButton = new dButton({
                iconClass: 'dijitIconDelete',
                showLabel: true,
                label: 'Remove Selected Bookmarks',
                onClick: function () {
                    var existing = JSON.parse(localStorage.getItem('JBrowseMarks'));
                    var selected = content.selectedRows;
                    for (var i in selected) {
                        for (var j in existing) {
                            console.log(existing[j].Id + '::' + selected[i]);
                            if (existing[j].Id == selected[i]) {
                                existing.splice(j, 1);
                                break;
                            }
                        }
                    }
                    content.selectedRows = [];
                    localStorage.removeItem('JBrowseMarks');
                    localStorage.setItem('JBrowseMarks', JSON.stringify(existing));
                    dojo.style(headerDiv, { display: 'none' });
                    var oldLinks = dojo.query('.match-div-header');
                    if (oldLinks.length > 0) {
                        oldLinks.forEach(dojo.destroy);
                    }
                    populate();
                }
            }).placeAt(controldiv);
            var openSelectedButton = new dButton({
                iconClass: 'dijitIconFolderOpen',
                showLabel: true,
                label: 'Open Selected Bookmarks',
                onClick: function () {
                    var existing = JSON.parse(localStorage.getItem('JBrowseMarks'));
                    var selected = content.selectedRows;
                    var found = [];
                    for (var i in selected) {
                        for (var j in existing) {
                            if (existing[j].Id == selected[i]) {
                                window.open(existing[j].Link, '_blank');
                            }
                            console.log(existing[j].Id + ':::' + selected[i]);
                        }
                    }
                }
            }).placeAt(controldiv);
            var removeAllButton = new dButton({
                iconClass: 'dijitIconDelete',
                showLabel: true,
                label: 'Remove All Bookmarks',
                onClick: function () {
                    dojo.style(headerDiv, { display: 'none' });
                    dojo.style(matchMessageDiv, { display: 'block' });
                    var oldLinks = dojo.query('.match-div-header');
                    if (oldLinks.length > 0) {
                        oldLinks.forEach(dojo.destroy);
                    }
                    localStorage.removeItem('JBrowseMarks');
                    content.selectedRows = [];
                }
            }).placeAt(controldiv);
            console.log(this);
            return container;
        },
        _fillActionBar: function (actionBar) {
            var thisB = this;
            new dButton({
                label: 'Close',
                onClick: function () {
                    thisB.callback(false);
                    thisB.hide();
                }
            }).placeAt(actionBar);
        },
        show: function (browser, callback) {
            console.log('log:' + window.location.pathname);
            this.browser = browser;
            this.callback = callback || function () {
            };
            this.set('title', 'Quick Bookmarks');
            this.set('content', this._dialogContent());
            this.inherited(arguments);
            focus.focus(this.closeButtonNode);
        }
    });
});
