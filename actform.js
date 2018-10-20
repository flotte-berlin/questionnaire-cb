/**
 * actform.js
 * Copyright (C) Hiroyoshi Kurohara(MicroGadget,inc.)
 * kurohara@yk.rim.or.jp, kurohara@microgadget-inc.com
 */
jQuery(function($) {
  if (! self.Qst) {
    self.Qst = {};
  }

  var ActFormItem_PropertyDescriptor = {
    "img": {
      enumerable: false,
      value: {},
      writable: true,
    },
    "required" : {
      enumerable: false,
      value: {},
      writable: true,
    },
    "constraint": {
      enumerable: false,
      value: {},
      writable: true,
    },
    "itemimages": {
      enumerable: false,
      value: [],
      writable: true,
    },
    "receivers": {
      enumerable: false,
      value: [],
      writable: true,
    },
    "rows": {
      enumerable: false,
      value: 5,
      writable: true,
    },
    "minnum": {
      enumerable: false,
      value: 0,
      writable: true,
    },
    "maxnum": {
      enumerable: false,
      value: 99999,
      writable: true,
    },
    "year": {
      enumerable: false,
      value: true,
      writable: true,
    },
    "month": {
      enumerable: false,
      value: true,
      writable: true,
    },
    "day": {
      enumerable: false,
      value: true,
      writable: true,
    },
    "wday": {
      enumerable: false,
      value: false,
      writable: true,
    },
    "hour": {
      enumerable: false,
      value: false,
      writable: true,
    },
    "min": {
      enumerable: false,
      value: false,
      writable: true,
    },
    "sec": {
      enumerable: false,
      value: false,
      writable: true,
    },
    "minyear": {
      enumerable: false,
      value: 1970,
      writable: true,
    },
    "maxyear": {
      enumerable: false,
      value: 2100,
      writable: true,
    },
  };

  var ActFormItem = function(arg) {
    Object.defineProperties(this, ActFormItem_PropertyDescriptor);
    if (arg.name) {
      this.name = arg.name;
    } else {
      this.name = 'item_' + arg.index;
    }
    this.type = arg.type;
    this.title = arg.title;
    this.text = arg.text;
    this.value = arg.value;
    this.selections = arg.selections;
    this.selected = arg.selected;
    this.selectedname = arg.selectedname;
    if (! this.selections) {
      this.selections = [];
    }
    if (! this.selectedname) {
      this.selectedname = [];
    }
    if (! this.selected) {
      this.selected = {};
    }
    this.img = arg.img;
    this.required = arg.required;
    this.constraint = arg.constraint;
    this.itemimages = [];
    this.receivers = [];
    this.valid = false;
    this.rows = arg.rows;
  };

  ActFormItem.prototype = _.extend(ActFormItem.prototype, {
    push: function(obj) {
      this.type = obj.type;
      switch (obj.type) {
      case Qst.TYPE_TEXT:
        this.text = obj.text;
	this.rows = obj.rows;
        break;
      case Qst.TYPE_NUMBER:
	this.text = obj.text;
	this.minnum = obj.minnum;
	this.maxnum = obj.maxnum;
	break;
      case Qst.TYPE_DATETIME:
	this.text = obj.text;
	this.year = obj.year;
	this.month = obj.month;
	this.day = obj.day;
	this.wday = obj.wday;
	this.hour = obj.hour;
	this.min = obj.min;
	this.sec = obj.sec;
	this.minyear = obj.minyear;
	this.maxyear = obj.maxyear;
	break;
      case Qst.TYPE_RADIO:
      case Qst.TYPE_CHECK:
      case Qst.TYPE_OPTION:
	if (! this.selections) {
	  this.selections = [];
	  this.selectedname = [];
	  this.selected = [];
	}
	this.selections.push(obj.text);
	var selectedname = this.type + "_selected_" + this.selectedname.length;
	this.selectedname.push(selectedname);
	this.selected[selectedname] = false;
        break;
      default:
        break;
      }
      if (obj.img) {
	this.itemimages.push(obj.img);
      } else {
	this.itemimages.push({});
      }
      if (this.type === Qst.TYPE_CHECK || this.type === Qst.TYPE_TEXT) {
	this.valid = true;
      }
    },
    each: function(f) {
      if (this.type !== Qst.TYPE_TEXT) {
	for (var i = 0;i < this.selections.length;++i) {
	  var data = { "text": this.selections[i], "selected":this.selected[this.selectedname[i]], name: this.name, value: this.selectedname[i], img: this.itemimages[i] };
	  f(data);
	}
      }
    },
    select: function(selected) {
      var hash_selected = {};
      selected.each(function(index, e) {
	hash_selected[$(e).val()] = true;
      }.bind(this));
      this.selectval(hash_selected);
    },
    selectval: function(selected) {
      if (this.type === Qst.TYPE_CHECK || this.type === Qst.TYPE_OPTION) {// check box is valid if once accessed.
	this.valid = true;
      } else {
	this.valid = false;
      }
      _.each(this.selectedname, function(key) {
	if (selected[key]) {
	  this.selected[key] = selected[key];
	  if (selected[key] === true) {
	    this.valid = true;
	  }
	} else {
	  this.selected[key] = false;
	}
      },this);
      for (var i = 0;i < this.selectedname.length;i++) {
	this.notifyreceivers(i, this.selected[this.selectedname[i]]);
      }
      this.notifyreceivers(-1, this.valid);
    },
    textchanged: function(value) {
      this.valid = (value !== "");
      this.value = value;
      this.notifyreceivers(0, value !== "");
      this.notifyreceivers(-1, value !== "");
    },
    numberchanged: function(value) {
      this.textchanged(value);
    },
    datetimechanged: function(date, hour, min, sec) {
      var datetimeval = "";
      if (! date ) {
	  if (this.year || this.month || this.day) {
	    return;
	  }
      } else {
	datetimeval = date;
      }
      if (this.hour || this.min || this.sec) {
	datetimeval += " ";
      }
      if (!hour || hour < 0) {
	if (this.hour) {
	  return;
	}
      } else {
	datetimeval += hour + ":";
      }
      if (!min || min < 0) {
	if (this.min) {
	  return;
	}
	datetimeval += "00:";
      } else {
	datetimeval += min + ":";
      }
      if (!sec || sec < 0) {
	if (this.sec) {
	  return;
	}
	datetimeval += "00";
      } else {
	datetimeval += sec;
      }
      
      this.textchanged(datetimeval);
    },
    clearanswer: function() {
      switch(this.type) {
      case Qst.TYPE_TEXT:
      case Qst.TYPE_NUMBER:
      case Qst.TYPE_DATETIME:
	this.textchanged("");
	break;
      default:
	this.selectval({});
	break;
      }
    },
    addreceiver: function(i, receiver) {
      this.receivers.push({ index: i, receiver: receiver });
    },
    notifyreceivers: function(i, btrue) {
      _.each(this.receivers, function(o) {
	if (o && o.index === i && o.receiver) {
	  o.receiver(btrue);
	}
      }, this);
    },
    r_validate: function() {
      if (this.type === Qst.TYPE_OPTION) {
	var have_selected = false;
	_.each(this.selected, function(v) {
	  if (v) {
	    have_selected = true;
	  }
	});
	if (! have_selected ) {
	  this.selected[this.selectedname[0]] = true;
	  this.valid = true;
	}
      }
      if (this.required && ! this.valid) {
	throw qstnr_data.txtRequireCheckError;
      }
    },
    copy_answer: function(src) {
      if (src.type === Qst.TYPE_TEXT) {
	this.textchanged(src.value);
      } else if (src.type === Qst.TYPE_RADIO || src.type === Qst.TYPE_CHECK || src.type === Qst.TYPE_OPTION) {
	this.selectval(src.selected);
      }
    },
  });

  var ActForm = self.Qst.ActForm = Backbone.Model.extend({
    author: "",
    email: "",
    itemlist: [], 
    initialize: function(args) {
      this.set('itemlist', []);
      this.url = qstnr_data.admin_ajax_url + "?" 
                  + $.param({
                      action: "qstnr_questionnaire", 
                      postid: qstnr_data.postid,
                      nonce: qstnr_data.nonce
                  }) ;
      // set cookie
      if (qstnr_data.cookie_data_for_js && qstnr_data.cookie_data_for_js.cookie_key) {
	try {
	  var expiretime = new Date(qstnr_data.cookie_data_for_js.expire_time * 1000);
	  $.cookie(qstnr_data.cookie_data_for_js.cookie_key, qstnr_data.cookie_data_for_js.key,
		   {
		     // domain: qstnr_data.cookie_data_for_js.cookie_domain,
		     path: qstnr_data.cookie_data_for_js.cookie_path,
		     expires: expiretime
		   });
	} catch(e) {
	}
      }
    },
    parse: function(response, options)  {
      if (response && response.itemlist) {
	var itemlist = [];
	_.each(response.itemlist, function(item) {
	  itemlist.push(new ActFormItem(item));
	});
	this.set('itemlist', itemlist);
	delete response.itemlist;
      }
      if (response && response.answer_date) {
	// to neglect from model
	this.answer_date = response.answer_date;
	delete response.answer_date;
      }
      return response;
    },
    itemlist: function() {
      return this.get('itemlist');
    },
    setauthor: function(author) {
      this.set('author', author);
    },
    setemail: function(email) {
      this.set('email',  email);
    },
    metaupdated: function(metadoc) {
      var items = metadoc.items();
      var currentFormItem = null;
      var i = 0;
      var itemlist = [];
      _.each(items, function(item) {
        switch (item.type) {
        case Qst.TYPE_LABEL:
          ++i;
          currentFormItem = new ActFormItem({
	    title: item.text,
	    index: i,
	    img: item.img,
	    required: item.required,
	    constraint: item.constraint
	  });
          itemlist.push(currentFormItem);
          break;
        case Qst.TYPE_TEXT:
	case Qst.TYPE_NUMBER:
	case Qst.TYPE_DATETIME:
        case Qst.TYPE_CHECK:
        case Qst.TYPE_OPTION:
        case Qst.TYPE_RADIO:
          currentFormItem.push({
	    type: item.type,
	    text: item.text,
	    img: item.img,
	    rows: item.rows,
	    year: item.year,
	    month: item.month,
	    day: item.day,
	    hour: item.hour,
	    min: item.min,
	    sec: item.sec,
	    wday: item.wday,
	    minnum: item.minnum,
	    maxnum: item.maxnum,
	    minyear: item.minyear,
	    maxyear: item.maxyear,
	  });
          break;
        default:
          break;
        }
      }, this);
      this.set('itemlist', itemlist);
      // local properties
      if (metadoc.use_action_setting()) {
	this.action_cond = metadoc.action_cond();
	this.ack_type = metadoc.ack_type();
	this.submit_text = metadoc.submit_text();
	this.dismiss_text = metadoc.dismiss_text();
	this.ack_text = metadoc.ack_text();
	this.post_ack_content = metadoc.post_ack_content();
	this.keep_size = metadoc.keep_size();
      } else {
	this.action_cond = undefined;
	this.ack_type = undefined;
	this.submit_text = undefined;
	this.dismiss_text = undefined;
	this.ack_text = undefined;
	this.post_ack_content = undefined;
	this.keep_size = undefined;
      }
      this.ispublic = metadoc.ispublic();
      this.unique_cookie = metadoc.unique_cookie();
      this.unique_email = (this.unique_cookie || ! this.ispublic) ? false : metadoc.unique_email();
      this.unique_name = (this.unique_cookie || ! this.ispublic) ? false : metadoc.unique_name();
      // 
      this.trigger("reset");
    },
    r_validate: function() {
      var result = null;
      try {
	_.each(this.itemlist(), function(item) {
	  item.r_validate();
	});
      } catch (e) {
	result = e;
      }
      return result;
    },
    author: function() {
      return this.get('author');
    },
    update_timestamp: function() {
      this.set('timestamp', (new Date()).getTime());
    },
    copy_answer: function(src) {
      var srcitemlist = src.itemlist();
      var dstitemlist = this.itemlist();
      for (var i in srcitemlist) {
	if (i < dstitemlist.length) {
	  dstitemlist[i].copy_answer(srcitemlist[i]);
	}
      }
    },
  });

  var ActFormItemView = self.Qst.ActFormItemView = Backbone.View.extend({
    tagName: "div",
    className: "questitem",
    
    initialize: function(arg) {
      this.model = arg.model;
      this.index = arg.index;
    },
    enable: function(btrue) {
      if (btrue !== this.$("fieldset").is(":disabled")) {
	this.model.clearanswer();
	this.clearanswer();
      }
      if (btrue) {
	this.$("fieldset").removeAttr('disabled');
	this.$el.removeClass("qstnr-item-disabled");
      } else {
	this.$("fieldset").attr("disabled", true);
	this.$el.addClass("qstnr-item-disabled");
      }
      this.model.valid = btrue;
    },
    disable: function(btrue) {
      this.enable(!btrue);
    },
    show: function(btrue) {
      if (btrue !== this.$el.is(":visible")) {
	this.model.clearanswer();
	this.clearanswer();
      }
      if (btrue) {
	this.$el.show();
      } else {
	this.$el.hide();
      }
      this.model.valid =  btrue;
    },
    hide: function(btrue) {
      this.show(!btrue);
    },
    clearanswer:function() {
      this.$("textarea").val("");
      this.$("option").prop("checked", false);
      this.$("input[type=radio]").prop("checked", false);
      this.$("input[type=checkbox]").prop("checked", false);
      this.$("input[type=number]").val("");
      this.$("input[type=datetime-local]").val("");
    },
    events: {
      "change textarea": "textchanged",
      "change select.qstnr-option": "selchanged",
      "change input[type=checkbox]": "selchanged",
      "change input[type=radio]":"selchanged",
      "change input[type=number]":"numberchanged",
      "change input.qstnr-date":"datechanged",
      "change select.qstnr-hour": "hourchanged",
      "change select.qstnr-min": "minchanged",
      "change select.qstnr-sec": "secchanged",
    },
    imgtag: function(img) {
      var opacity = "";
      var size = 'with="'+img.width+'" height="'+img.height+'"';
      if (! img.auto && img.geoparam) {
	size = 'width="'+img.geoparam.width+'" height="'+img.geoparam.height+'" ';
	opacity = 'style="opacity:' + img.geoparam.opacity + '"';
      }
      var align = "";
      if (img.align === "center") {
	align = ' class="align-center" ';
      } else if (img.align === "right") {
	align = ' class="align-right" ';
      }
      image = '<img src="' + img.url + '"' + size + align + opacity + ' >';
      return image;
    },
    imgstyle: function(img) {
      bgimage = {
	"background-image": "url('" + img.url + "')",
	"background-repeat" : "no-repeat",
      };
      return bgimage;
    },
    render: function() {
      var item = this.model;
      if (this.model.img && this.model.img.pos === "before") {
	this.$el.append(this.imgtag(this.model.img));
      }
      if (this.model.img && this.model.img.pos === "background") {
	this.$el.css(this.imgstyle(this.model.img));
      }
      this.$el.append($('<span class="qstnr-qid">' + this.index + '</span>'));
      this.$el.append($('<div class="qstnr-qdivtitle">' + item.title + '</div>'));
      var fieldset = $('<fieldset class="qstnr-qblock"><legend>'+ item.title + '</legend></fieldset>');
      if (this.model.img && this.model.img.pos === "after") {
	fieldset.append(this.imgtag(this.model.img));
      }
      this.$el.append(fieldset);
      var cont = fieldset;
      var tmpl = function() {return "";};
      switch (item.type) {
      case Qst.TYPE_TEXT:
        cont.append($('<div class="qstnr-textarea"><textarea class="qstnr-message" placeholder="' + item.text + '" rows="'+item.rows+'" >' + (item.value ? item.value : "") + '</textarea></div>'));
        break;
      case Qst.TYPE_NUMBER:
	cont.append($('<div class="qstnr-number"><input type="number" min="' + item.minnum + '" max="' + item.maxnum + '"></div>'));
	break;
      case Qst.TYPE_DATETIME:
	var datetimeinput = $('<div class="qstnr-datetime"></div>');
	var datetimetmpl = _.template($('#qstnr-template-datetime').html());
	datetimeinput.append(datetimetmpl({item: item}));
	var dateinput = "";
	var dateFormat = (item.year ? "yy/" : "") + (item.month ? (item.day ? "mm/dd" : "mm") : "");
	dateFormat = dateFormat.replace(/\/$/, "");
	if (item.year || item.month) {
	  dateinput = datetimeinput.find('input[type=text].qstnr-date');
	  dateinput.datepicker({
	    changeYear: item.year ? true : false,
	    changeMonth: true,
	    yearRange: (item.year ? ("" + item.minyear + ":" + item.maxyear) : "c:c"),
	    useMonth: item.month ? true : false,
	    useDay: item.day ? true : false,
	    dateFormat: dateFormat,
	  });
	}
	cont.append(datetimeinput);
	break;
      case Qst.TYPE_OPTION:
        cont.append($('<div class="qstnr-select"><select class="qstnr-option"></select></div>'));
        cont = cont.find(".qstnr-option");
        tmpl = _.template('<option value="<%= data.value %>" <%= data.selected ? "selected" : "" %> ><%= data.text %></option>');
        break;
      case Qst.TYPE_RADIO:
        tmpl = _.template('<div class="qstnr-radio"><input type="radio" name="<%= data.name %>" value="<%= data.value %>" <%= data.selected ? "checked" : "" %> id="<%= cid %>"><label for="<%= cid %>"><span></span><%= beforeimg %><span><%= data.text %></span><%= afterimg %></label></div>');
        break;
      case Qst.TYPE_CHECK:
        tmpl = _.template('<div class="qstnr-checkbox"><input type="checkbox" name="<%= data.name %>" value="<%= data.value %>" <%= data.selected ? "checked" : "" %> id="<%= cid %>"><label for="<%= cid %>"><span></span><%= beforeimg %><span><%= data.text %></span><%= afterimg %></label></div>');
        break;
      default:
        break;
      }
      var ctrlid_prefix = "qstnr-control-id-" + this.index + "-";
      var ctrlindex = 0;
      item.each(function(data) {
	var afterimg = "", beforeimg = "", imgstyle = {};
	if (data.img) {
	  if (data.img.pos === 'before') {
	    beforeimg = this.imgtag(data.img);
	  }
	  if (data.img.pos === 'after') {
	    afterimg = this.imgtag(data.img);
	  }
	  if (data.img.pos === 'background') {
	    imgstyle = this.imgstyle(data.img);
	  }
	}
	var ctrlitem = $(tmpl({ data: data, cid: ctrlid_prefix + ctrlindex++, beforeimg: beforeimg, afterimg: afterimg}));
	ctrlitem.css(imgstyle);
        cont.append(ctrlitem);
      }.bind(this));

      return this;
    },
    textchanged: function(event) {
      this.model.textchanged(this.$("textarea").val());
    },
    numberchanged: function(event) {
      this.model.numberchanged(this.$("input").val());
    },
    datechanged: function(event) {
      var dateval = this.$("input.qstnr-date").val();
      var hour = this.$("select.qstnr-hour option:selected").val();
      var min = this.$("select.qstnr-min option:selected").val();
      var sec = this.$("select.qstnr-sec option:selected").val();
      this.model.datetimechanged(dateval, hour, min, sec);
    },
    hourchanged: function(event) {
      this.datechanged(event);
    },
    minchanged: function(event) {
      this.datechanged(event);
    },
    secchanged: function(event) {
      this.datechanged(event);
    },
    selchanged: function(event) {
      if (this.model.type === Qst.TYPE_CHECK || this.model.type === Qst.TYPE_RADIO) {
	this.model.select(this.$el.find(":checked"));
      } else {
	this.model.select(this.$el.find(":selected"));
      }
    },
  });

  var ActFormView = self.Qst.ActFormView = Backbone.View.extend({
    type: 1,
    el: $("#qstnr-actform"),
    initialize: function(arg) {
      this.dialogView = new Qst.DialogView({el: $("div.qstnr-answersheet div.qstnr-dialog")});
      this.inprogressView = new Qst.InprogressView({
                              fg: ".qstnr-actform-bg", 
                              el: "div.qstnr-answersheet", 
                              bg: "form#qstnr-actform", 
                              button: "button#qstnr-submit"});
      this.model = arg.model;
      this.nodelist = [];
    },
    events: {
      "click #qstnr-submit": "dosubmit",
      "click div.qstnr-answersheet": "dismiss",
      "change #qstnr-name": "authorchange",
      "change #qstnr-email": "emailchange",
    },
    render: function() {
      var cont = $('<div></div>');
      var i = 1;
      var views = [];
      cont.addClass('qstnr-qbody-' + this.type);
      _.each(this.model.itemlist(), function(item) {
        var formitem = new ActFormItemView({model: item, index: i});
	views.push(formitem);
        cont.append(formitem.render().$el);
	++i;
      });
      var qstlist = this.$(".qstnr-qstlist");
      qstlist.empty();
      qstlist.append(cont);
      //
      this.$("div.qstnr-submitinfo").remove();
      var tmpl = _.template($("#qstnr-template-answersheet-after").html());
      var data = { unique_name: this.model.unique_name, unique_email: this.model.unique_email, submit_text: this.model.submit_text };
      this.$el.append(tmpl(data));
      //
      if (this.model.submit_text) {
	this.$("#qstnr-submit").text(this.model.submit_text);
      }
      //
      this.inprogressView = new Qst.InprogressView({
                              fg: ".qstnr-actform-bg", 
                              el: "div.qstnr-answersheet", 
                              bg: "form#qstnr-actform", 
                              button: "button#qstnr-submit"});
      //
      this.$("#qstnr-submit").show();
      var terminals = [];
      _.each(views, function(view) {

	if (! view.model.required && view.model.constraint) {
	  var actionname = Object.keys(view.model.constraint)[0];
	  if (actionname) {
	    var actionfunc = view[actionname].bind(view);
	    var node = Qst.Node.construct(view.model.constraint, terminals);
	    node.setChild(actionfunc);
	    // setup initial state
	    var firstop = Object.keys(view.model.constraint[actionname])[0];
	    if (firstop && firstop === "not") {
	      actionfunc(true);
	    } else {
	      actionfunc(false);
	    }
	  }
	}
      });
      if (this.model.action_cond) {
	var actionname = Object.keys(this.model.action_cond)[0];
	if (actionname) {
	  var actionfunc;
	  var firstop;
	  switch (actionname) {
	  case 'submit':
	    firstop = Object.keys(this.model.action_cond[actionname])[0];
	    actionname = 'reservesubmit';
	    actionfunc = this[actionname].bind(this);
	    break;
	  case 'enable':
	  case 'disable':
	  case 'hide':
	  case 'show':
	    firstop = Object.keys(this.model.action_cond[actionname])[0];
	    actionname = actionname + 'submit';
	    actionfunc = this[actionname].bind(this);
	    break;
	  default:
	    break;
	  }
	  if (actionfunc) {
	    var linkcount_base = terminals.length;
	    var node = Qst.Node.construct(this.model.action_cond, terminals);
	    node.setChild(actionfunc);
	    // setup initial state
	    if (actionname !== 'reservesubmit') {
	      if (firstop && firstop === "not") {
		actionfunc(true);
	      } else {
		actionfunc(false);
	      }
	    } else {
	      this.hidesubmit(true);
	    }
	    if (terminals.length - linkcount_base === 0 ||
		(terminals.length - linkcount_base === 1 &&
		 terminals[linkcount_base].item === "required"
		)) {
	      switch (actionname) {
	      case 'reservesubmit':
	      case 'showsubmit':
	      case 'enablesubmit':
		this.dialogView.show(true, "Constraint setting error, 'Submit action' will not  be issued.");
		break;
	      default:
		break;
	      }
	    }
	  }
	}
      }
      _.each(terminals, function(term) {
	if (term.item && term.item !== "none" && term.item !== "required") {
	  var itemvalue = eval(term.item);
	  var view = views[itemvalue[0]];
	  if (view) {
	    if (itemvalue.length > 1) {
	      var controlindex = itemvalue[1];
	      view.model.addreceiver(controlindex, term.link);
	    } else {
	      view.model.addreceiver(-1, term.link);
	    }
	  }
	}
      });
      // initialize 'valid state'
      _.each(views, function(view) {
	view.model.clearanswer();
      }, this);
      
      this.$el.show();
      this.$el.css('height', '');
      this.$el.css('opacity', '');
      this.$("div.qstnr-qstlist").css('height', '');
      return this;
    },
    dismiss: function() {
      this.dialogView.show(false);
    },
    changetype: function(type) {
      this.type = type;
      var div = this.$(".qstnr-qstlist > div");
      var stylelist = "";
      for (var stylekey in qstnr_data.stylelist) {
	stylelist += "qstnr-qbody-" + qstnr_data.stylelist[stylekey] + " ";
      }
      div.removeClass(stylelist);
      div.addClass("qstnr-qbody-" + type);
    },
    after_hide: function() {
      this.$('div.qstnr-qstlist').html('');
      if (this.model.keep_size) {
	this.hidediv.height(this.old_height);
      }
      if (this.model.post_ack_content) {
	this.$('div.qstnr-qstlist').html(this.model.post_ack_content);
      }
      if (this.model.keep_size) {
	if (this.model.post_ack_content) {
	  this.hidediv.css('opacity', '');
	}
      } else {
	if (this.model.post_ack_content) {
	  this.hidediv.show();
	}
      }
    },
    finished: function(bsuccess, data, jqXHR) {
      // -- transit() || (dialogbox(),hide())
      // -- dialogbox(),hide()
      // blink()
      // dialogbox()
      // hide()
      // transit() || hide()
      // transit() || dialogbox()
      //
      var or = this.model.ack_type ? this.model.ack_type.split(",") : ["none", "dialogbox"];
      if (or.length === 1) {
	or.unshift("none");
      }
      or[0] = or[0].replace('default', 'dialogbox');
      or[1] = or[1].replace('default', 'dialogbox');
      or[1] = or[1].split("-");
      if (or[1].length === 1) {
	or[1].push("none");
      }

      var dialogbox = function(result) {
	var msg  = result ? result.msg : qstnr_data.txtThankYou ;
	var buttontext = this.model.dismiss_text;
	this.dialogView.show(true, msg, "qstnr-dialog-answer-success", buttontext);
      }.bind(this);
      var transit = function(result) {
	try {
	  if (result.transit.url) {
	    if (result.transit.target) {
	      window.open(result.transit.url, result.transit.target);
	    } else {
	      window.location.href = result.transit.url;
	    }
	    return true;
	  }
	} catch (e) {}
	return false;
      }.bind(this);
      var blink = function() {
	this.$(".qstnr-actform-bg").animate({ 'opacity': '0.1'}, 100, function() {
	  this.$(".qstnr-actform-bg").animate({'opacity': '1.0'}, 500, function() {
	    this.$(".qstnr-actform-bg").css('opacity', '');
	  }.bind(this));
	}.bind(this));
      }.bind(this);
      var none = function() {return false};
      var hide = function(result) {
	this.hidediv = (this.model.post_ack_content && this.model.post_ack_content !== "") ? this.$('div.qstnr-qstlist') : this.$el;
	if (this.model.keep_size) {
	  this.old_height = this.hidediv.height();
	  this.hidediv.animate({ 'opacity': '0.0'}, 200, this.after_hide.bind(this));
	} else {
	  this.hidediv.hide({duration: 500, complete: this.after_hide.bind(this)});
	}
	this.showsubmit(false);
      }.bind(this);
      
      if (bsuccess) {
	if (! eval(or[0] + '(data)') ) {
	  if ( eval(or[1][0] + '(data)') ) {
	    eval(or[1][1] + '(data)');
	  }
	}
      } else {
	var msg  = qstnr_data.txtServerError;
	var buttontext = this.model.dismiss_text;
	this.dialogView.show(true, msg, "qstnr-dialog-answer-error", buttontext);
      }
    },
    showsubmit: function(btrue) {
      if (btrue) {
	this.$("#qstnr-submit").show();
      } else {
	this.$("#qstnr-submit").hide();
      }
    },
    hidesubmit: function(btrue) {
      this.showsubmit(!btrue);
    },
    enablesubmit: function(btrue) {
      if (btrue) {
	this.$("#qstnr-submit").removeAttr('disabled');
      } else {
	this.$("#qstnr-submit").prop('disabled', 'disabled');
      }
    },
    disablesubmit: function(btrue) {
      this.enablesubmit(!btrue);
    },
    reservesubmit: function(bsubmit) {
      this.submitFlag = bsubmit;
      if (this.submitId === undefined) {
	this.submitId = setTimeout(function() {
	  if (this.submitFlag) {
	    this.dosubmit(true);
	  }
	  this.submitId = undefined;
	}.bind(this), 0);
      }
    },
    dosubmit: function(bsubmit) {
      if (bsubmit) {
	this.authorchange();
	this.emailchange();
	var checked = this.model.r_validate();
	if (checked !== null) {
	  this.dialogView.show(true, checked);
	} else {
	  this.model.update_timestamp();
	  this.inprogressView.ajaxcall2(this.model.save.bind(this.model), this.finished.bind(this), {}, {timeout: qstnr_data.ajaxTimeout});
	}
	this.entermodal(false);
      }
    },
    authorchange: function() {
      this.model.setauthor(this.$('#qstnr-name').val());
    },
    emailchange: function() {
      this.model.setemail(this.$('#qstnr-email').val());
    },
    entermodal: function(btrue, postfunc) {
      if (btrue) {
	$("#qstnr-actform-modal-bg").on('click', function() {
	  this.entermodal(false);
	  if (postfunc) {
	    postfunc();
	  }
	}.bind(this));
	$("#qstnr-actform-modal-bg").show();
	$(document.body).css({overflow: 'hidden'});
      } else {
	$("#qstnr-actform-modal-bg").hide();
	$(document.body).css({overflow: ''});
      }
    },
    popup: function(top, left, btrue) {
      if (btrue) {
	var adminmenuwidth = $("#adminmenuwrap").width();
	var windowwidth = $(window).width();
	var windowheight = $(window).height();
	var dialogwidth = this.$el.width();
	$("div.qstnr-answersheet-sample").css(
	  {
	    'position':'fixed',
	    'top': "" + 30 + "px",
	    'left': "" + (windowwidth - dialogwidth) / 2 + "px",
	    'width': dialogwidth,
	    'max-height': "" + (windowheight - 30 * 2) + 'px',
	    'overflow-y': 'scroll',
	  });
      } else {
	$("div.qstnr-answersheet-sample").css(
	  {
	    'position':'static',
	    'top': '',
	    'left': '',
	    'width': 'auto',
	    'max-height': "",
	    'overflow-y': ''
	  });
      }
    },
  });

  $(document).ready(function() {
    ///
    // jQuery.datepicker mod
    //
    var oldSelectDay = $.datepicker._selectDay;
    $.datepicker._selectDay = function(id, month, year, td) {
      var inst = this._getInst($(id)[0]);
      if (inst.settings.useDay === false) {
	oldSelectDay.call($.datepicker, id, month, year, $("<td><a>1</a></td>"));
      } else {
	oldSelectDay.call($.datepicker, id, month, year, td);
      }
    };
    var oldupdate = $.datepicker._updateDatepicker;
    $.datepicker._updateDatepicker = function(inst) {
      oldupdate.call($.datepicker, inst);
      if (inst.settings.useDay === false) {
	var tbl = inst.dpDiv.find("table.ui-datepicker-calendar");
	var year, month;
	tbl.find("td").each(function(i, e) {
	  if (! year) {
	    year = $(e).attr("data-year");
	    month = $(e).attr("data-month");
	  }
	});
	tbl.find("th,td").css({"display": "none"});
	tbl.append('<tr><td data-handler="selectDay" data-event="click" data-month="' + month + '" data-year="' + year + '"><a class="ui-state-default ui-stete-hover" href="#">OK</a></td></tr>');
	$.datepicker._attachHandlers(inst);
      }
      if (inst.settings.useMonth === false) {
	inst.dpDiv.find(".ui-datepicker-month").css({"display":"none"});
      }
    };
    ///
  });
});

