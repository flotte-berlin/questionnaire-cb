/**
 * answerlist.js
 * Author: Hiroyoshi Kurohara(Microgadget,inc.)
 * Author E-Mail: kurohara@yk.rim.or.jp
 * License: GPLv2 or Lator.
 */

jQuery(function($) {
  if (! self.Qst) {
    self.Qst = { };
  }
  var Qst = self.Qst;

  var AnswerCollection = Qst.AnswerCollection = Backbone.Collection.extend({
    model: Qst.ActForm,
  });
  /**
   * Answer list model with paging control
   */
  var AnswerList = Qst.AnswerList = Backbone.Model.extend({
    collection: null,
    total: 0,
    lastpgidx: 0, 
    start: 0,
    numlinks: 0,
    current: 0,
    cntinpage: 0,

    initialize: function() {
      this.set('cntinpage', 20);
      this.url = qstnr_data.admin_ajax_url + "?" 
        + $.param({
          action: "qstnr_answer_list", 
          nonce: qstnr_data.nonce,
	  postid: qstnr_data.postid,
        });
    },
    parse: function(data, options) {
      var collection = new AnswerCollection();
      for (var i in data.collection) {
	var entryModel = new Qst.ActForm(data.collection[i]);
	entryModel.parse(data.collection[i]);
	collection.push(entryModel);
      }
      this.set('collection', collection);
      this.set('lastpgidx', Math.floor(data.total / data.cntinpage));
      this.set('numlinks', 20);
      this.set('total', parseInt(data.total));
      delete data.collection;
      delete data.total;
      delete data.cntinpage;
      return data;
    },
    total: function() {
      return this.get('total');
    },
    // max number of links(depends on the number of total answers).
    lastpgidx: function() {
      return this.get('lastpgidx');
    },
    start: function() {
      return this.get('start');
    },
    // number of links displayed on a screen.
    numlinks: function() {
      return this.get('numlinks');
    },
    current: function() {
      return this.get('current');
    },
    cntinpage: function() {
      return this.get('cntinpage');
    },
    getpage: function(start, current, options) {
      this.fetch(_.extend(
	{data: {
	  start: start, 
	  current: current, 
	  cntinpage: this.cntinpage()}, processData: true}, options));
    },
    initialfetch: function(options) {
      this.fetch(_.extend({data: {start: 0, current: 0, cntinpage: 0}, processData: true}, options));
    },
    collection: function() {
      return this.get('collection');
    },
  });

  var AnswerListTestView = Qst.AnswerListTestView = Backbone.View.extend({
    el: $(".qstnr-answerlist-body"),
    initialize: function() {
      this.listenTo(this.model, "sync", function() {
	this.render();
      });
    },
    render: function() {
      this.$el.html("");
      this.$el.append($('<div class="qstnr-answerlist-bg"><textarea></textarea></div>'));
      this.$(".qstnr-answerlist-bg textarea").val(JSON.stringify(this.model));
    },
  });
  
  /**
   * View for answerlist content area
   */
  var AnswerListView = Qst.AnswerListView = Backbone.View.extend({
    el: $(".qstnr-answerlist-body"),
    initialize: function(args) {
      this.inprogressView = new Qst.InprogressView({ el: this.$el, bg:".qstnr-answerlist-bg", fg:".qstnr-answerlist", button:".qstnr-pagenavi"});
//      this.inprogressView.ajaxcall(this.model.initialfetch.bind(this.model), this.finished.bind(this), {timeout: 500});

      this.dialogView = Qst.getDialogView();
      this.listenTo(this.model, "sync", function() {
	this.render();
      });
      this.metamodel = args.metamodel;
      this.model = args.model;
    },
    events: {
      "click a": "getpage",
    },
    pagenav: function(nav) {
      var tmpl_link = _.template('<a href="javascript:void(0);" start="<%= start %>" current="<%= current %>" ><%= text %></a>');
      var tmpl_fake = _.template('<span class="qstnr-fakelink"><%= text %></span>');
      var v;
      var tmpl;

      var start = this.model.start();
      var current = this.model.current();
      var numlinks = this.model.numlinks();
      var lastpgidx = this.model.lastpgidx();

      if (start === 0 && lastpgidx === 0) {
	if (this.model.total() === 0) {
	  nav.append("<p>no answer received");
	}
	return;
      }
      v = { start: 0, current: 0, text: "&lt;&lt;" };
      tmpl = current > 0 ? tmpl_link : tmpl_fake;
      nav.append( $(tmpl(v)) );

      v = { start: start > current ? start : start - 1, current: current - 1, text: "&lt;" };
      tmpl = current > 0 ? tmpl_link : tmpl_fake;
      nav.append( $(tmpl(v)));

      v = { start: start - 1, current: current, text: '...' };
      tmpl = start > 0 ? tmpl_link : tmpl_fake;
      nav.append( $(tmpl(v)) );

      for (var i = start; i < start + numlinks && i <= lastpgidx;++i) {
        v = { start: start, current: i, text: i + 1};
        tmpl = i === current ? tmpl_fake : tmpl_link;
        nav.append( $(tmpl(v)) );
      }

      v = { start: start + 1, current: (current > start ? current : current + 1), text: '...' };
      tmpl = start < lastpgidx ? tmpl_link : tmpl_fake;
      nav.append( $(tmpl(v)) );

      v = { start: current >= start + numlinks ? start + 1 : start, current: current + 1, text: '&gt;' };
      tmpl = current < lastpgidx ? tmpl_link : tmpl_fake;
      nav.append( $(tmpl(v)) );

      v = { start: lastpgidx - numlinks, current: current > lastpgidx - numlinks ? current : lastpgidx - numlinks, text: '&gt;&gt;' };
      tmpl = current > lastpgidx ? tmpl_link : tmpl_fake;
      nav.append( $(tmpl(v)) );

      return nav;
    },
    render: function() {
      var navi = this.$(".qstnr-pagenavi");
      var contents = this.$(".qstnr-answerlist");
      navi.html("");
      contents.html("");
      this.pagenav(navi);
      this.answerCollectionView = new AnswerCollectionView({model: this.model.collection(), metamodel: this.metamodel});
      this.answerCollectionView.render();
      contents.append(this.answerCollectionView.$el);
      if (this.model.total() === 0) {
	this.$('.qstnr-csv-download').hide();
      } else {
	this.$('.qstnr-csv-download').show();
      }
    },
    callgetpage: function(args, options) {
      this.model.getpage(args.start, args.current, options);
    },
    getpage: function() {
      var tgt = $(event.target);
      this.inprogressView.ajaxcall2(this.callgetpage.bind(this), this.finished.bind(this), 
				   {
				     start: tgt.attr('start'), 
				     current: tgt.attr('current')
				   }, {timeout: qstnr_data.ajaxTimeout});
    },
    finished: function(bSuccess, data, errstatus) {
      if (bSuccess) {
      } else {
	this.dialogView.show(true, data, errstatus);
      }
    },
  });

  /**
   * View for answer list
   */
  var AnswerCollectionView = Qst.AnswerCollectionView = Backbone.View.extend({
    tagName: "table",
    className: "answers",
    template: "",
    initialize: function(args) {
      this.model = args.model;
      this.metamodel = args.metamodel;
    },
    header: function(formmodel) {
      var header = $("<thead></thead>");
      var htmpl1 = _.template('<th <%= selcount > 0 ? "colspan=\\"" + selcount + "\\"" : "" %> ><%= title %></th>');
      var htmpl2 = _.template('<th><%= seltext %></th>');

      var firstrow = $("<tr><th rowspan=2></th></tr>");
      var formitems = formmodel.itemlist();
      _.each(formitems, function(item) {
        var v = { selcount: item.selections.length, title: item.title };
        firstrow.append($(htmpl1(v)));
      });
      var secondrow = $("<tr></tr>");
      _.each(formitems, function(item) {
	if (item.type === Qst.TYPE_TEXT) {
	  secondrow.append($("<th></th>"));
	} else {
          for (var i = 0;i < item.selections.length;++i) {
            var v = { seltext: item.selections[i] };
            secondrow.append($(htmpl2(v)));
          }
	}
      });

      header.append(firstrow);
      header.append(secondrow);
      return header;
    },
    render: function() {
      var headermodel;
      if (this.model.length > 0) {
        headermodel = this.model.at(0);
      } else {
        // construct ActForm model somehow from MetaFormModel.
        headermodel = new Qst.ActForm();
        headermodel.metaupdated(this.metamodel);
      }
      // table header
      this.$el.append(this.header(headermodel));
      // table body
      var seltmpl = _.template('<td><span <%= selected ? "class=\\"icon-checkmark2\\"" : "" %> ></span></td>');
      var texttmpl = _.template('<td class="message"><%= text %></td>');
      var nametmpl = _.template('<td class="author"><%= text %></td>');

      this.model.each(function(formmodel) {
        var row = $("<tr></tr>");
	row.append($(nametmpl({text: formmodel.author()})));
        _.each(formmodel.itemlist(), function(item) {
          if (item.type === Qst.TYPE_TEXT || item.type === Qst.TYPE_NUMBER || item.type === Qst.TYPE_DATETIME) {
            row.append($(texttmpl({text: item.value})));
          } else {
	    for (var i in item.selections) {
	      row.append($(seltmpl({selected: item.selected[item.selectedname[i]]})));
	    }
          }
        });
        this.$el.append(row);
      }, this);
    },
  });

});
