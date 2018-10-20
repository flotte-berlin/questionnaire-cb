/**
 */
jQuery(function($) {
  var MetaFormErrorView = self.Qst.MetaFormErrorView = Backbone.View.extend({
    el: "#qstnr-formmeta",
    show: function(bShow, message) {
      if (bShow) {
	this.$el.addClass("formmeta-errorview");
	this.$(".formmeta-errorview-msgbox").text(message);
	this.$(".formmeta-errorview-msgbox").css("display", "block");
      } else {
	this.$el.removeClass("formmeta-errorview");
	this.$(".formmeta-errorview-msgbox").css("display", "none");
      }
    },
  });

  var MetaFormItemListView = self.Qst.MetaFormItemListView = Backbone.View.extend({
    parent: null,
    el: "#qstnr-form-meta-form",
    template: _.template($('#qstnr-form-meta-item-template').html()),
    initialize: function(obj) {
      this.parent = obj.parent;
      this.model = obj.model;
      this.propsView = new Qst.FormMetaPropsView({parent: this});
    },
    events: {
      "click .qstnr-deletebtn": "dodelete",
      "click .qstnr-upbtn"    : "doup",
      "click .qstnr-downbtn"  : "dodown",
      "click .qstnr-itemtypesel": "propstoggle",
      "click .qstnr-nametext" : "propstoggle",
      "change .qstnr-itemtypesel": "onselchange",
      "change .qstnr-nametext": "ontextchange",
      "click input.qstnr-item-props": "propsburger_click",
      "change input[name=qstnr-item-props]": "toggle_props",
      "change input[name=qstnr-item-minnumber]": "minnumber_change",
      "change input[name=qstnr-item-maxnumber]": "maxnumber_change",
      "change input[name=qstnr-item-year]": "year_change",
      "change input[name=qstnr-item-month]": "month_change",
      "change input[name=qstnr-item-day]": "day_change",
      "change input[name=qstnr-item-wday]": "wday_change",
      "change input[name=qstnr-item-hour]": "hour_change",
      "change input[name=qstnr-item-min]": "min_change",
      "change input[name=qstnr-item-sec]": "sec_change",
      "change input[name=qstnr-item-rows]": "rows_change",
      "change input[name=qstnr-item-minyear]": "minyear_change",
      "change input[name=qstnr-item-maxyear]": "maxyear_change",
    },
    setenabled: function(formertype) {
      var en;
      var allfalse = { 'label': false, 'radio':false, 'text':false, 'check': false, 'option':false, 'number': false, 'datetime': false };
      var alltrue = { 'label': true, 'radio':true, 'text':true, 'check': true, 'option':true, 'number':true, 'datetime': true };
      
      if (formertype) {
	switch (formertype) {
	case Qst.TYPE_LABEL:
	  en = alltrue;
	  en[Qst.TYPE_LABEL] = false;
	  break;
	case Qst.TYPE_RADIO:
	case Qst.TYPE_CHECK:
	case Qst.TYPE_OPTION:
	  en = allfalse;
	  en[Qst.TYPE_LABEL] = en[formertype] = true;
	  break;
	case Qst.TYPE_TEXT:
	case Qst.TYPE_NUMBER:
	case Qst.TYPE_DATETIME:
	  en = allfalse;
	  en[Qst.TYPE_LABEL] = true;
	  break;
	default:
	  break;
	}
      } else {
	// topmost item
	en = { 'label': true, 'radio':false, 'text':false, 'check': false, 'option':false, 'number': false, 'datetime': false };
      }
      return en;
    },
    render: function() {
      var data = { items: this.model.items(), view: this };
      this.$el.html(this.template(data));
      return this;
    },
    getitemrecord: function(event) {
      var e = $(event.currentTarget);
      for (var i = 0;i < 10;++i) {
	if (e.attr('itemindex')) {
	  return e;
	}
	e = e.parent();
      }
      return null;
    },
    getitemindex: function(event) {
      var index = 0;
      var e = this.getitemrecord(event);
      if (e !== null) {
	index = parseInt(e.attr('itemindex'));
      }
      return index;
    },
    getitem: function(event) {
      return this.model.items()[this.getitemindex(event)];
    },
    onselchange: function(event) {
      var itemmodel = this.getitem(event);
      this.propstoggle(event);
      itemmodel.type = $(event.currentTarget).find("option:selected").val();
      return true;
    },
    doup: function(event) {
      var itemmodel = this.getitem(event);
      this.propstoggle(event);
      this.model.moveup(itemmodel.index);
    },
    dodown: function(event) {
      var itemmodel = this.getitem(event);
      this.propstoggle(event);
      this.movedown(itemmodel.index);
    },
    dodelete: function(event) {
      var itemmodel = this.getitem(event);
      this.propstoggle(event);
      this.model['delete'](itemmodel.index);
    },
    ontextchange: function(event) {
      var itemmodel = this.getitem(event);
      itemmodel.text = _.escape($(event.target).val());
    },
    propstoggle: function(event) {
      var rec = this.getitemrecord(event);
      if (rec.find(".qstnr-item-props").is(':checked')) {
	this.propsburger_click(event);
      }
    },
    propsburger_click: function(event) {
      var rec = this.getitemrecord(event);
      var propsIndex = this.getitemindex(event);
      if (this.lastPropsIndex === propsIndex) {
      	rec.find("input[name=qstnr-item-props]").prop('checked', false);
      	this.toggle_props();
	this.lastPropsIndex = undefined;
      } else {
	this.lastPropsIndex = propsIndex;
      }
    },
    toggle_props: function() {
      var props = this.$("input[name=qstnr-item-props]");
      var items = this.$("tr.qstnr-form-meta-item-props-record");
      props.each(function(p) {
	this.propsView.show($(items[p]), this.model.items()[p], props[p].checked);
      }.bind(this));
    },
    minnumber_change: function(event) {
      this.propstoggle(event);
      this.getitem(event).minnumber = $(event.currentTarget).val();
    },
    maxnumber_change: function(event) {
      this.propstoggle(event);
      this.getitem(event).maxnumber = $(event.currentTarget).val();
    },
    year_change: function(event) {
      this.propstoggle(event);
      this.getitem(event).year = $(event.currentTarget).is(":checked");
    },
    month_change: function(event) {
      this.propstoggle(event);
      this.getitem(event).month = $(event.currentTarget).is(":checked");
    },
    day_change: function(event) {
      this.propstoggle(event);
      this.getitem(event).day = $(event.currentTarget).is(":checked");
    },
    wday_change: function(event) {
      this.propstoggle(event);
      this.getitem(event).wday = $(event.currentTarget).is(":checked");
    },
    hour_change: function(event) {
      this.propstoggle(event);
      this.getitem(event).hour = $(event.currentTarget).is(":checked");
    },
    min_change: function(event) {
      this.propstoggle(event);
      this.getitem(event).min = $(event.currentTarget).is(":checked");
    },
    sec_change: function(event) {
      this.propstoggle(event);
      this.getitem(event).sec = $(event.currentTarget).is(":checked");
    },
    rows_change: function(event) {
      this.propstoggle(event);
      this.getitem(event).rows = $(event.currentTarget).val();
    },
    minyear_change: function(event) {
      this.propstoggle(event);
      this.getitem(event).minyear = $(event.currentTarget).val();
    },
    maxyear_change: function(event) {
      this.propstoggle(event);
      this.getitem(event).maxyear = $(event.currentTarget).val();
    },
    onclick: function() {},
    
    get_depend_itemlist: function(index) {
      var itemlist = [];
      var itemindex = 0;
      var qid = 0;
      _.each(this.model.items(), function(item) {
	if (index === undefined || item.index < index) {
	  var labelstr;
	  var iteminfo;
	  if (item.type === Qst.TYPE_LABEL) {
	    qid++;
	    itemindex = 0;
	    labelstr = item.text.substr(0, 16);
	    if (labelstr.length >= 16) {
	      labelstr = labelstr + "...";
	    }
	    iteminfo = {
	      label: "Q." + qid + " (" + labelstr + ")",
	      index: item.index,
	      value: '[' + (qid - 1) + ']'
	    };
	  } else {
	    itemindex++;
	    labelstr = item.text.substr(0, 16);
	    if (labelstr.length >= 16) {
	      labelstr = labelstr + "...";
	    }
	    iteminfo = {
	      label: "Q." + qid + ":item-" + itemindex + "  (" + labelstr + ")",
	      index: item.index,
	      value: '[' + (qid - 1) + ',' + (itemindex - 1) + ']'
	    };
	  }
	  itemlist.push(iteminfo);
	} else {
	  return false;
	}
      }, this);
      return itemlist;
    },
  });

  var FormMetaView = self.Qst.FormMetaView = Backbone.View.extend({
    el: $("#qstnr-formmeta"),
    initialize: function() {
      this.inprogressView = new Qst.InprogressView({bg: "#qstnr-formmeta", fg: ".qstnr-formmeta-bg", button: "#qstnr-savemeta"});
      this.dialogView = new Qst.DialogView();
      this.errorView = new Qst.MetaFormErrorView();
      this.itemListView = new  Qst.MetaFormItemListView({parent: this, model: this.model });

      this.listenTo(this.model, "add remove reset", this.modelchanged);
      //
      var oldLinkOpen = wpLink.open;
      var oldIsMCE = wpLink.isMCE;
      var oldHtmlUpdate = wpLink.htmlUpdate;
      wpLink.open = function(editorId, callbackfunc) {
	if (callbackfunc) {
	  wpLink.isMCE = function() { return false; };
	  wpLink.htmlUpdate = function() {
	    var attrs, text, html, begin, end, cursor, selection,
		textarea = wpLink.textarea;

	    if ( ! textarea ) {
	      return;
	    }

	    attrs = wpLink.getAttrs();

	    // If there's no href, return.
	    if ( ! attrs.href ) {
	      return;
	    }
	    callbackfunc(attrs.href, attrs.target);
	    // Insert HTML
	    wpLink.close();
	    textarea.focus();
	  };
	  var ed,
	      $body = $( document.body );

	  $body.addClass( 'modal-open' );

	  wpLink.range = null;
	  this.textarea = editorId[0];
	  this.textarea.focus();
	  if (document.selection) {
	    this.range = document.selection.createRange();
	  }
	  $('#wp-link-wrap .wp-link-text-field').hide();
	  $('#wp-link-wrap .link-target').hide();
	  $('#wp-link-wrap').show();
	  $('#wp-link-backdrop').show();

	  wpLink.refresh();

	  $( document ).trigger( 'wplink-open', $('#wp-link-wrap') );
	  
	} else {
	  wpLink.isMCE = oldIsMCE;
	  wpLink.htmlUpdate = oldHtmlUpdate;
	  $('#wp-link-wrap .link-target').show();
	  $('#wp-link-wrap .wp-link-text-field').show();
	  wpLink.old_open(editorId);
	}
      };
      wpLink.old_open = oldLinkOpen;
    },
    events: {
      "click #qstnr-ispublic": "ispublic",
      "click .qstnr-additem": "doadd",
      "change #qstnr-viewtype": "viewtypechange",
      "click #qstnr-savemeta": "dosubmit",
      "click #qstnr-redraw":"doredraw",
      "change #qstnr-usefss": "usefss",
      "change #qstnr-fss": "fss",
      "change #qstnr-notify-author": "notifyflag",
      "change #qstnr-unique-name": "unique_name",
      "change #qstnr-unique-email": "unique_email",
      "change #qstnr-unique-ip":"unique_ip",
      "change #qstnr-unique-browser":"unique_browser",
      "change #qstnr-unique-cookie":"unique_cookie",
      "change #qstnr-cookie-expire-months":"cookie_expire_months",
      "change #qstnr-cookie-expire-days":"cookie_expire_days",
      "change #qstnr-cookie-expire-hours":"cookie_expire_hours",
      "change #qstnr-cookie-expire-mins":"cookie_expire_mins",
      "change #qstnr-disappear-after-answer":"disappear_after_answer",
      "change #qstnr-form-alternative-content-answered":"form_alternative_content_answered",
      "change #qstnr-disappear-after-timeout":"disappear_after_timeout",
      "change #qstnr-form-expire-datetime":"form_expire_datetime",
      "change #qstnr-form-alternative-content-expired":"form_alternative_content_expired",
      "click input[name=qstnr-shortcode]": "copy_shortcode",
      "change #qstnr-specify-action-property": "check_action_settings",
      "change #qstnr-action-property-ack-type": "change_ack_type",
      "change #qstnr-action-property-submit-text": "change_submit_text",
      "change #qstnr-action-property-ack-text": "change_ack_text",
      "change #qstnr-action-property-dismiss-text": "change_dismiss_text",
      "change #qstnr-action-property-cond": "change_action_cond",
      "click #qstnr-action-property-cond-item option": "click_action_cond_item",
      "change #qstnr-action-property-cond-item": "change_action_cond_item",
      "change #qstnr-form-alternative-content-after-hidden": "change_alternative_content_hidden",
      "change #qstnr-form-meta-keep-size-after-hidden": "change_keep_size",
      "click #qstnr-form-meta-add-transit":"add_transit",
      "click input[name=qstnr-form-meta-transit-dest]": "transit_dest_clicked",
      "change input[name=qstnr-form-meta-transit-dest]": "transit_dest_changed",
      "click input[name=qstnr-form-meta-transit-condition]": "transit_import_answer_clicked",
      "click button[name=qstnr-form-meta-transit-delete]": "transit_item_delete",
      "click #qstnr-form-meta-clear-transit-dest": "transit_clear_dest",
    },
    modelchanged: function(arg) {
      this.render();
    },
    render: function() {
      this.$("#qstnr-ispublic").prop("checked", this.model.ispublic());
      this.$("#qstnr-viewtype").val(this.model.viewtype());
      this.$("#qstnr-usefss").prop("checked", this.model.usefss());
      this.$("#qstnr-fss").val(this.unescapeCSS(this.model.fss()));
      this.$("#qstnr-notify-author").prop("checked", this.model.notifyflag());
      this.$("#qstnr-unique-name").prop("checked", this.model.unique_name());
      this.$("#qstnr-unique-email").prop("checked", this.model.unique_email());
      this.$("#qstnr-unique-ip").prop("checked", this.model.unique_ip());
      this.$("#qstnr-unique-browser").prop("checked", this.model.unique_browser());
      this.$("#qstnr-unique-cookie").prop("checked", this.model.unique_cookie());
      this.enable_uniques(this.model.unique_cookie());
      this.$("#qstnr-cookie-expire-months").val(this.model.cookie_expire_months());
      this.$("#qstnr-cookie-expire-days").val(this.model.cookie_expire_days());
      this.$("#qstnr-cookie-expire-hours").val(this.model.cookie_expire_hours());
      this.$("#qstnr-cookie-expire-mins").val(this.model.cookie_expire_mins());
      this.$("#qstnr-disappear-after-answer").prop("checked", this.model.disappear_after_answer());
      this.$("#qstnr-form-alternative-content-answered").val(this.model.form_alternative_content_answered());
      this.$("#qstnr-disappear-after-timeout").prop("checked", this.model.disappear_after_timeout());
      this.$("#qstnr-form-expire-datetime").val(this.model.form_expire_datetime());
      this.$("#qstnr-form-alternative-content-expired").val(this.model.form_alternative_content_expired());
      this.$("#qstnr-form-meta-keep-size-after-hidden").prop("checked", this.model.keep_size());
      this.showfssf(this.model.usefss());
      
      this.$("#qstnr-form-meta-form").html("");
      
      this.itemListView.render();
      
      this.$("#qstnr-form-shortcode").val('[questionnaire id="' + qstnr_data.postid + '"]');
      this.$("#qstnr-meta-shortcode").val('[questionnaire_showmeta id="' + qstnr_data.postid + '"]');
      this.$("#qstnr-summary-shortcode").val('[questionnaire_summary id="' + qstnr_data.postid + '"]');
      this.show_action_settings();
      return this;
    },
    show_action_settings: function() {
      var ack_type = this.model.ack_type();
      var action_cond = this.model.action_cond();
      var action_type = Qst.constraint_cond(action_cond);
      var action_item = Qst.constraint_item(action_cond);
      this.$("#qstnr-specify-action-property").prop('checked', this.model.use_action_setting());
      this.$("#qstnr-action-property-ack-type").val(ack_type);
      this.$("#qstnr-action-property-submit-text").val(this.model.submit_text());
      this.$("#qstnr-action-property-ack-text").val(this.model.ack_text());
      this.$("#qstnr-action-property-dismiss-text").val(this.model.dismiss_text());
      this.$("#qstnr-form-alternative-content-after-hidden").val(this.model.post_ack_content());
      if (this.model.ispublic() && (this.model.unique_email() || this.model.unique_name()) && !this.model.unique_cookie()) {
	this.$("#qstnr-action-property-cond option[value=submitifon]").prop('disabled', 'disabled');
      } else {
	this.$("#qstnr-action-property-cond option[value=submitifon]").removeAttr('disabled');
      }
      if (action_type && action_type !== "") {
	this.$("#qstnr-action-property-cond").val(action_type);
      }
      //
      var itemselect = this.$("#qstnr-action-property-cond-item");
      itemselect.html('');
      var itemlist = this.itemListView.get_depend_itemlist();
      itemlist.push( {value: 'required', label: 'all required have value'} );
      _.each(itemlist, function(item) {
	itemselect.append($('<option value="' + item['value'] + '">' + item['label'] + '</option>'));
      }.bind(this));
      if (action_type && action_type !== "" && action_type !== 'none' && action_type !== 'default') {
	itemselect.val(action_item);
	itemselect.removeAttr('disabled');
      } else {
	itemselect.prop('disabled', 'disabled');
      }
      if (ack_type === "default" || ack_type === "dialogbox" || ack_type === "dialogbox-hide" || ack_type === "transit,dialogbox") {
	this.$("#qstnr-action-property-ack-text").removeAttr('disabled');
	this.$("#qstnr-action-property-dismiss-text").removeAttr('disabled');
      } else {
	this.$("#qstnr-action-property-ack-text").prop('disabled', "disabled");
	this.$("#qstnr-action-property-dismiss-text").prop('disabled', "disabled");
      }
      if (ack_type === "-hide" || ack_type === "dialogbox-hide" || ack_type === "transit,-hide") {
	this.$(".qstnr-form-meta-alternative-after-hidden").addClass("qstnr-optional-input-area-visible");
      } else {
	this.$(".qstnr-form-meta-alternative-after-hidden").removeClass("qstnr-optional-input-area-visible");
      }

      if (ack_type === "transit,dialogbox" || ack_type === "transit,-hide") {
	this.$("#qstnr-form-meta-transit-settings").addClass("qstnr-optional-input-area-visible");
      } else {
	this.$("#qstnr-form-meta-transit-settings").removeClass("qstnr-optional-input-area-visible");
      }

      if (action_type === 'submitifon') {
	this.$("#qstnr-action-property-submit-text").prop('disabled', "disabled");
      } else {
	this.$("#qstnr-action-property-submit-text").removeAttr('disabled');
      }

      this.render_transit();
    },
    enable_uniques: function(use_cookie) {
      if (use_cookie) {
	this.$("#qstnr-unique-name").prop("disabled", "disabled");
	this.$("#qstnr-unique-email").prop("disabled", "disabled");
	this.$("#qstnr-unique-ip").prop("disabled", "disabled");
	this.$("#qstnr-unique-browser").prop("disabled", "disabled");
      } else {
	this.$("#qstnr-unique-name").removeAttr("disabled");
	this.$("#qstnr-unique-email").removeAttr("disabled");
	this.$("#qstnr-unique-ip").removeAttr("disabled");
	this.$("#qstnr-unique-browser").removeAttr("disabled");
      }
    },
    unique_browser: function(event) {
      this.model.unique_browser(this.$("#qstnr-unique-browser").prop("checked"));
    },
    unique_ip: function(event) {
      this.model.unique_ip(this.$("#qstnr-unique-ip").prop("checked"));
    },
    unique_email: function(event) {
      this.model.unique_email(this.$("#qstnr-unique-email").prop("checked"));
      this.show_action_settings();
    },
    unique_name: function(event) {
      this.model.unique_name(this.$("#qstnr-unique-name").prop("checked"));
      this.show_action_settings();
    },
    ispublic: function(event) {
      this.model.ispublic(event.target.checked);
      this.show_action_settings();
    },
    doadd: function() {
      this.model.addnew();
    },
    viewtypechange: function(event) {
      this.model.viewtype($(event.target).val());
    },
    get_finished: function(bSuccess, data, jqXHR) {
      if (bSuccess) {
	this.errorView.show(false);
	this.render();
      } else {
	var errmsg = qstnr_data.txtRequestError;
	errmsg += " " + jqXHR.status + "," + jqXHR.statusText;
	this.errorView.show(true, errmsg);
      }
    },
    put_finished: function(bSuccess, data, jqXHR) {
      if (bSuccess) {
      } else {
	var errmsg = qstnr_data.txtRequestError;
	errmsg += jqXHR.status + "," + jqXHR.statusText;
	this.dialogView.show(true, errmsg);
      }
    },
    dosubmit:function() {
      var savefunc = this.model.save.bind(this.model);
      var finishfunc = this.put_finished.bind(this);
      this.inprogressView.ajaxcall2(savefunc, finishfunc, {container: undefined}, {timeout: qstnr_data.ajaxTimeout});
    },
    doredraw: function() {
      this.model.trigger('reset');
    },
    load: function() {
      var fetchfunc = this.model.fetch.bind(this.model);
      var finishfunc = this.get_finished.bind(this);
      this.inprogressView.ajaxcall(fetchfunc, finishfunc, {timeout:qstnr_data.ajaxTimeout});
    },
    showfssf: function(bshow) {
      if (bshow) {
	this.$("#qstnr-fss").prop("disabled", false);
	this.clearfss();
	this.applyfss(this.$("#qstnr-fss").val());
      } else {
	this.clearfss();
	this.$("#qstnr-fss").prop("disabled", true);
      }
    },
    usefss: function(event) {
      this.showfssf($(event.target).prop('checked'));
      this.model.usefss($(event.target).prop('checked'));
    },
    fss: function() {
      this.model.fss(this.escapeCSS(this.$("#qstnr-fss").val()));
      this.clearfss();
      this.applyfss(this.$("#qstnr-fss").val());
    },
    notifyflag: function() {
      this.model.notifyflag(this.$('#qstnr-notify-author').prop('checked'));
    },
    unique_cookie: function() {
      var is_checked = this.$("#qstnr-unique-cookie").prop('checked');
      this.model.unique_cookie(is_checked);
      this.enable_uniques(is_checked);
      this.show_action_settings();
    },
    cookie_expire_months: function() {
      this.model.cookie_expire_months(this.$("#qstnr-cookie-expire-months").val());
    },
    cookie_expire_days: function() {
      this.model.cookie_expire_days(this.$("#qstnr-cookie-expire-days").val());
    },
    cookie_expire_hours: function() {
      this.model.cookie_expire_hours(this.$("#qstnr-cookie-expire-hours").val());
    },
    cookie_expire_mins: function() {
      this.model.cookie_expire_mins(this.$("#qstnr-cookie-expire-mins").val());
    },
    disappear_after_answer: function() {
      this.model.disappear_after_answer(this.$("#qstnr-disappear-after-answer").prop('checked'));
    },
    form_alternative_content_answered: function() {
      this.model.form_alternative_content_answered(this.$("#qstnr-form-alternative-content-answered").val());
    }, 
    disappear_after_timeout: function() {
      this.model.disappear_after_timeout(this.$("#qstnr-disappear-after-timeout").prop('checked'));
    },
    form_expire_datetime: function() {
      this.model.form_expire_datetime(this.$("#qstnr-form-expire-datetime").val());
    },
    form_alternative_content_expired: function() {
      this.model.form_alternative_content_expired(this.$("#qstnr-form-alternative-content-expired").val());
    },
    copy_shortcode: function() {
      //      this.$("#qstnr-form-shortcode").select();
      this.$("input[name=qstnr-shortcode]:visible").select();
      document.execCommand('copy');
    },
    check_action_settings: function(event) {
      var use_action_setting =  $(event.currentTarget).is(":checked");
      this.model.use_action_setting(use_action_setting);
    },
    change_ack_type: function(event) {
      this.model.ack_type($(event.currentTarget).val());
      this.show_action_settings();
    },
    change_ack_text: function(event) {
      this.model.ack_text($(event.currentTarget).val());
    },
    change_dismiss_text: function(event) {
      this.model.dismiss_text($(event.currentTarget).val());
    },
    change_submit_text: function(event) {
      this.model.submit_text($(event.currentTarget).val());
    },
    change_alternative_content_hidden: function(event) {
      var content = this.$("#qstnr-form-alternative-content-after-hidden").val();
      this.model.post_ack_content(content);
    },
    change_keep_size: function() {
      this.model.keep_size(this.$("#qstnr-form-meta-keep-size-after-hidden").is(":checked"));
    },
    set_action_cond: function() {
      var cond_type = this.$("#qstnr-action-property-cond").val();
      var items = this.$("#qstnr-action-property-cond-item").val();
      var itemval = [];
      _.each(items, function(e) {
	if (e !== 'none') {
	  itemval.push(e);
	}
      });
      this.model.set_action_cond(cond_type, itemval);
    },
    change_action_cond: function(event) {
      if (this.set_action_cond()) {
	this.show_action_settings();
      }
      var val = $(event.currentTarget).val();
      if (val === "none" || val === "default") {
	this.$("#qstnr-action-property-cond-item").val([]);
	this.$("#qstnr-action-property-cond-item").prop('disabled', 'disabled');
	this.$("#qstnr-action-property-submit-text").removeAttr('disabled');
      } else if (val === 'submitifon') {
	this.$("#qstnr-action-property-submit-text").prop('disabled', "disabled");
	this.$("#qstnr-action-property-cond-item").removeAttr('disabled');
      } else {
	this.$("#qstnr-action-property-cond-item").removeAttr('disabled');
	this.$("#qstnr-action-property-submit-text").removeAttr('disabled');
      }
    },
    change_action_cond_item: function(event) {
//      this.set_action_cond();
    },
    click_action_cond_item: function(event) {
      if ($(event.currentTarget).val() === "required") {
	this.$('#qstnr-action-property-cond-item option[value^="["]').removeProp("selected");
      } else {
	this.$('#qstnr-action-property-cond-item option[value="required"]').removeProp("selected");
      }
      this.set_action_cond();
    },
    render_transit: function() {
      var stringify = function(obj) {
	var str = "";
	for (var i in obj) {
	  for (var key in obj[i]) {
	    if (key === 'on') {
	      str += JSON.stringify(obj[i][key]) + "=on";
	    } else if (key === 'match') {
	      str += "[" + obj[i][key][0] + "]=match(" + (obj[i][key][1] === "" ? "*" : obj[i][key][1]) + ")";
	    }
	  }
	  str += " ";
	}
	return str;
      };
      this.add_default_transit();
      var transit_tmpl = _.template($("#qstnr-form-meta-transit-template").html());
      this.$("#qstnr-form-meta-transit-settings").html(transit_tmpl({ data: this.model.transit(), stringify: stringify }));
    },
    add_default_transit: function() {
      var transit = this.model.transit();
      if (! (transit instanceof Array) ) {
	this.model.transit([]);
	transit = this.model.transit();
      }
      if (transit.length === 0) {
	transit.push({
	  'default': true,
	  'url': ""
	});
      }
    },
    add_transit: function() {
      this.add_default_transit();
      var transit = this.model.transit();
      transit.push({
	'url': "",
	'condition': []
      });
      this.render_transit();
    },
    transit_clear_dest: function(event) {
      var transit = this.model.transit();
      if (transit.length > 0) {
	transit[0].url = "";
	this.render_transit();
      }
    },
    transit_item_delete: function(event) {
      var id = $(event.currentTarget).attr('transit_id');
      this.model.transit().splice(id, 1);
      this.render_transit();
    },
    transit_dest_clicked: function(event) {
      var textarea = $(event.currentTarget);
      wpLink.open(textarea, function(href, target) {
	//	textarea.val(href);
	var i = textarea.attr('transit_id');
	this.model.transitdest(i, href, target);
	this.render_transit();
      }.bind(this));
    },
    transit_import_answer_clicked: function(event) {
      this.actviewmodal(true, event.currentTarget);
      this.model.trigger('reset');
      this.sampleSaveHook = function(model) {
	var conditionlist = [];
	var index = 0;
	_.each(model.itemlist(), function(item) {
	  if (item.valid) {
	    switch (item.type) {
	    case Qst.TYPE_TEXT:
	    case Qst.TYPE_NUMBER:
	    case Qst.TYPE_DATETIME:
	      conditionlist.push({ match: [ index , item.value ] });
	      break;
	    default:
	      _.each(item.selectedname, function(name, j) {
		if (item.selected[name]) {
		  conditionlist.push({ on: [index, j] });
		}
	      });
	      break;
	    }
	  }
	  ++index;
	}, this);
	this.actviewmodal(false);
	var i = $(event.currentTarget).attr('transit_id');
	this.model.transitcondition(i, conditionlist);
	this.render_transit();
      };
    },
    clearfss: function() {
      if (this.fsssid !== undefined) {
	var sheet = document.styleSheets[this.fsssid];
	for (var i = this.fssapplied.length - 1;i >= 0;--i) {
	  try {
	    sheet.deleteRule(this.fssapplied[i]);
	  } catch (e) {
	  }
	}
	this.fssapplied = [];
      }
    },
    applyfss: function(fsstext) {
      this.fssapplied = [];
      if (this.fsssid === undefined) {
	this.fsssid = document.styleSheets.length - 1;
      }
      var sheet = document.styleSheets[this.fsssid];
      var ruleset = Qst.CSSUtil.join(Qst.CSSUtil.embrace(Qst.CSSUtil.split(fsstext), "div.qstnr-answersheet"));
      var ruleid = sheet.cssRules.length;
      for (var i in ruleset) {
	this.fssapplied.push(ruleid);
	try {
	  sheet.insertRule(ruleset[i], ruleid);
	} catch (e) {
	}
	++ruleid;
      }
    },
    escapeCSS: function(src) {
      return encodeURI(src.replace(/\+/g, "&plus;"));
    },
    unescapeCSS: function(src) {
      return decodeURI(src).replace(/&plus;/g, "+");
    },
  });

  var input_qstnr_form_item_imagename = "input[name=qstnr-form-item-imagename]";
  var button_qstnr_meta_image_delete = "button[name=qstnr-meta-image-delete]";
  var select_qstnr_meta_props_image_pos = "select[name=qstnr-meta-props-image-pos]";
  var input_qstnr_meta_props_required = "input[name=qstnr-meta-props-required]";
  var select_qstnr_meta_props_cond = "select[name=qstnr-meta-props-cond]";
  var select_qstnr_meta_props_cond_item = "select[name=qstnr-meta-props-cond-item]";
  var input_qstnr_meta_props_image_geometry_auto = "input[name=qstnr-meta-props-image-geometry-auto]";
  var input_qstnr_form_image_opacity = "input[name=qstnr-form-image-opacity]";
  var input_qstnr_form_image_width = "input[name=qstnr-form-image-width]";
  var input_qstnr_form_image_height = "input[name=qstnr-form-image-height]";
  var select_qstnr_form_image_size_unit = "select[name=qstnr-form-image-size-unit]";
  var div_qstnr_meta_constraint_dependency = "div.qstnr-meta-constraint-dependency";
  var fieldset_qstnr_meta_constraint = "fieldset.qstnr-meta-constraint";
  var span_qstnr_meta_props_image_pos_wrap =  "span[name=qstnr-meta-props-image-pos-wrap]";
  var div_qstnr_meta_props_image_geometry = "div.qstnr-meta-props-image-geometry";
  var div_qstnr_meta_props_image_params = "div.qstnr-meta-props-image-params";
  
  var FormMetaPropsView = self.Qst.FormMetaPropsView = Backbone.View.extend({
    tagName: "div",
    className: "",
    template: _.template($("#qstnr-props-panel-template").html()),
    events: {
      "click input[name=qstnr-form-item-imagename]": "imagetext_clicked",
      "click button[name=qstnr-meta-image-delete]":"image_delete",
      "change select[name=qstnr-meta-props-image-pos]": "image_pos_changed",
      "change input[name=qstnr-meta-props-required]": "required_changed",
      "change select[name=qstnr-meta-props-cond]": "dependency_cond_changed",
      "change select[name=qstnr-meta-props-cond-item]": "dependency_cond_changed",
      "change input[name=qstnr-meta-props-image-geometry-auto]": "toggle_auto_geometry",
      "change input[name=qstnr-form-image-opacity]":"image_opacity",
      "change input[name=qstnr-form-image-width]":"image_width",
      "change input[name=qstnr-form-image-height]":"image_height",
      "change select[name=qstnr-form-image-size-unit]":"image_size_unit",
    },
    initialize: function(args) {
      this.parent = args.parent;
    },
    show: function(rec, model, bshow) {
      var prop = rec.find("div.qstnr-form-meta-item-props-wrap");
      if (bshow) {
	this.setElement(prop)
	this.model = model;
	this.$el.html(this.template());
	this.setpropsvalue();
	this.delegateEvents();
	prop.css("max-height", "0");
	prop.css("display", "block");
	prop.animate({
	  "max-height": "4000px"
	}, 100, function() {
	});
      } else {
	prop.animate({
	  "max-heigt": "0"
	}, 100, function() {
	  prop.html("");
	});
      }
    },
    setimageinfostring: function(img) {
      if (img) {
	this.$(input_qstnr_form_item_imagename).val(img.name);
      }
    },
    setpropsvalue: function() {
      this.show_imagecontrol();
      this.$(input_qstnr_meta_props_required).prop("checked", this.model.required);
      var cond = this.model.constraint;
      this.$(select_qstnr_meta_props_cond).val(Qst.constraint_cond(cond));
      if (this.model.index > 0 && this.model.type === Qst.TYPE_LABEL) {
	var itemselect = this.$(select_qstnr_meta_props_cond_item);
	itemselect.html("");
	itemselect.append('<option value="none">None</option>');
	var itemlist = this.parent.get_depend_itemlist(this.model.index);
	_.each(itemlist, function(item) {
	  itemselect.append($('<option value="' + item['value'] + '">' + item['label'] + '</option>'));
	}.bind(this));
	if (this.model.required) {
	  this.$(div_qstnr_meta_constraint_dependency).hide();
	} else {
	  this.$(div_qstnr_meta_constraint_dependency).show();
	}
	this.$(fieldset_qstnr_meta_constraint).show();
	this.$(select_qstnr_meta_props_cond_item).val(Qst.constraint_item(cond));
      } else {
	if (this.model.type === Qst.TYPE_LABEL) {
	  this.$(div_qstnr_meta_constraint_dependency).hide();
	} else {
	  this.$(fieldset_qstnr_meta_constraint).hide();
	}
      }
    },
    imagetext_clicked: function(event) {
      wp.media.editor.open($(event.currentTarget), {
	multiple: false,
	customcb: function(props, attachment) {
	  /*
	    attachment.title
	    attachment.name
	    attachment.filename
	    attachment.url
	    attachment.sizes
	  */
	  var image = attachment.sizes[props.size];
	  image['align'] = props.align;
	  image['name'] = attachment.name;
	  this.setimageinfostring(image);
	  image.geoparam = {
	    opacity: 1.0,
	    width: image.width,
	    height: image.height
	  };
	  image.pos = "before";
	  image.auto = true;
	  this.model.img = image;
	  this.show_imagecontrol();
	}.bind(this)
      });
    },
    image_pos_changed: function() {
      if (this.model.img) {
	var img = this.model.img;
	img.pos = this.$(select_qstnr_meta_props_image_pos).val();
	this.model.img = img;
      }
    },
    show_imagecontrol: function() {
      var d = this.$(button_qstnr_meta_image_delete + "," + span_qstnr_meta_props_image_pos_wrap + "," + div_qstnr_meta_props_image_geometry);
      
      if (this.model.img && this.model.img.name && this.model.img.name !== "") {
	this.$(select_qstnr_meta_props_image_pos).val(this.model.img.pos);
	this.$(input_qstnr_meta_props_image_geometry_auto).prop('checked', this.model.img.auto);
	if (this.model.img.geoparam) {
	  this.$(input_qstnr_form_image_opacity).val(this.model.img.geoparam.opacity);
	  this.$(input_qstnr_form_image_width).val(this.model.img.geoparam.width);
	  this.$(input_qstnr_form_image_height).val(this.model.img.geoparam.height);
	}
	d.show();
	this.show_geometry(!this.model.img.auto);
      } else {
	d.hide();
      }
    },
    image_delete: function() {
      this.model.img = {};
      this.model.img.pos = "";
      this.model.img.geoparam = {};
      this.model.img.auto = true;
      this.setimageinfostring(this.model.img);
      this.show_imagecontrol();
    },
    show_dependency: function(bshow) {
      if (this.model.index !== 0 && bshow) {
	this.$(div_qstnr_meta_constraint_dependency).show();
      } else {
	this.$(div_qstnr_meta_constraint_dependency).hide();
      }
    },
    required_changed: function() {
      this.model.required = this.$(input_qstnr_meta_props_required).is(":checked");
      this.show_dependency(!this.model.required);
    },
    show_geometry: function(bshow) {
      if (bshow) {
	this.$(div_qstnr_meta_props_image_params).show();
      } else {
	this.$(div_qstnr_meta_props_image_params).hide();
      }
    },
    toggle_auto_geometry: function() {
      if (this.model.img) {
	var autogeo = this.$(input_qstnr_meta_props_image_geometry_auto).is(":checked");
	var img = this.model.img;
	img.auto = autogeo;
	this.model.img = img;
	this.show_geometry(! autogeo);
      }
    },
    image_width: function() {
      var img = this.model.img;
      if (img && img.geoparam) {
	img.geoparam.width = this.$(input_qstnr_form_image_width).val();
	this.model.img = img;
      }
    },
    image_height: function() {
      var img = this.model.img;
      if (img && img.geoparam) {
	img.geoparam.height = this.$(input_qstnr_form_image_height).val();
	this.model.img = img;
      }
    },
    image_opacity: function() {
      var img = this.model.img;
      if (img && img.geoparam) {
	img.geoparam.opacity = this.$(input_qstnr_form_image_opacity).val();
	this.model.img = img;
      }
    },
    dependency_cond_changed: function() {
      var cond = this.$(select_qstnr_meta_props_cond).val();
      var items = this.$(select_qstnr_meta_props_cond_item).val();
      var itemval = [];
      _.each(items, function(item) {
	if (item !== 'none') {
	  itemval.push({ item: item });
	}
      });
      var constraint = {};
      if (cond && cond !== "" && cond !== "none" && itemval.length > 0) {
	switch (cond) {
	case "showifon":
	  constraint.show = { or: itemval };
	  break;
	case "showifoff":
	  constraint.show = { not: { or: itemval } };
	  break;
	case "hideifon":
	  constraint.hide = { or: itemval };
	  break;
	case "hideifoff":
	  constraint.hide = { not: { or: itemval } };
	  break;
	case "enableifon":
	  constraint.enable = { or: itemval };
	  break;
	case "enableifoff":
	  constraint.enable = { not: { or: itemval } };
	  break;
	case "disableifon":
	  constraint.disable = { or: itemval };
	  break;
	case "disableifoff":
	  constraint.disable = { not: { or: itemval } };
	  break;
	default:
	  break;
	}
      }
      this.model.constraint = constraint;
    },
  });
  
  $(document).ready(function() {
    if (wp && wp.media) {
      var old_sender = wp.media.editor.send.attachment;
      var old_open = wp.media.editor.open;
      wp.media.editor.open = function(editor, options) {
	if (options.customcb) {
	  wp.media.editor.send.attachment = options.customcb;
	} else {
	  wp.media.editor.send.attachment = old_sender;
	}
	old_open(editor, options);
      };
    }
  });
});
