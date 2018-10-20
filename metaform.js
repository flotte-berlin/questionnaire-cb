/**
 * metaform.js
 *
 * Copyright (C) 2015, 2016 Hiroyoshi Kurohara(MicroGadget,inc.).
 * kurohara@yk.rim.or.jp, kurohara@microgadget-inc.com
 */
jQuery(function($) {
  if (! self.Qst) {
    self.Qst = { };
  }
  _.extend(self.Qst, {
      TYPE_LABEL  :'label',
      TYPE_OPTION :'option',
      TYPE_TEXT   :'text',
      TYPE_RADIO  :'radio',
    TYPE_CHECK  :'check',
    TYPE_NUMBER : 'number',
    TYPE_DATETIME : 'datetime',
  });

  self.Qst.constraint_cond = function constraint_cond(cond) {
    var condstr;
    for (var key in cond) {
      condstr = key;
      for (var op in cond[key]) {
	if (op === 'not') {
	  condstr += 'ifoff';
	} else {
	  condstr += 'ifon';
	}
      }
    }
    return condstr;
  }
  self.Qst.constraint_item = function constraint_item(cond) {
    var p;
    if (cond) {
      if (cond.item) {
	p = cond.item;
      } else {
	var arr = [];
	for (var i in cond) {
	  p = constraint_item(cond[i]);
	  if (p) {
	    if (p instanceof Array) {
	      return p;
	    } else {
	      arr.push(p);
	      if (p === "required") {
		break;
	      }
	    }
	  }
	}
	p = arr;
      }
    }
    return p;
  }

  var MetaFormItem_PropertyDescriptor = {
    "type": {
      enumerable: true,
      set: function(type) {
	this.setprop("type", type);
      },
      get: function() {
	return this._type;
      },
    },
    "text": {
      enumerable: true,
      set: function(text) {
	this.setprop("text", text, "textchange");
      },
      get: function() {
	return this._text;
      },
    },
    "index": {
      enumerable: true,
      set: function(index) {
	this.setprop("index", index);
      },
      get: function() {
	return this._index;
      },
    },
    "img": {
      enumerable: true,
      set: function(obj) {
	this.setprop("img", obj, "change");
      },
      get: function() {
	return this._img;
      },
    },
    "required": {
      enumerable: true,
      set: function(btrue) {
	this.setprop("required", btrue, "change");
      },
      get: function() {
	return this._required;
      },
    },
    "constraint": {
      enumerable: true,
      set: function(opt) {
	this.setprop("constraint", opt, "change");
      },
      get: function() {
	return this._constraint;
      },
    },
    "rows": {
      enumerable: true,
      set: function(opt) {
	this.setprop("rows", opt, "change");
      },
      get: function() {
	return this._rows;
      },
    },
    "year": {
      enumerable: true,
      set: function(opt) {
	this.setprop("year", opt);
      },
      get: function() {
	return this._year;
      },
    },
    "month": {
      enumerable: true,
      set: function(opt) {
	if (! opt) {
	  this.container.suppressevents = true;
	  this.setprop("day", false);
	  this.container.suppressevents = false;
	}
	this.setprop("month", opt);
      },
      get: function() {
	return this._month;
      },
    },
    "day": {
      enumerable: true,
      set: function(opt) {
	if (opt) {
	  this.container.suppressevents = true;
	  this.setprop("month", true);
	  this.container.suppressevents = false;
	}
	this.setprop("day", opt);
      },
      get: function() {
	return this._day;
      },
    },
    "wday": {
      enumerable: true,
      set: function(opt) {
	this.setprop("wday", opt, "change");
      },
      get: function() {
	return this._wday;
      },
    },
    "hour": {
      enumerable: true,
      set: function(opt) {
	if (!opt) {
	  this.container.suppressevents = true;
	  this.setprop("min", false);
	  this.setprop("sec", false);
	  this.container.suppressevents = false;
	}
	this.setprop("hour", opt);
      },
      get: function() {
	return this._hour;
      },
    },
    "min": {
      enumerable: true,
      set: function(opt) {
	this.container.suppressevents = true;
	if (opt) {
	  this.setprop("hour", true);
	} else {
	  this.setprop("sec", false);
	}
	this.container.suppressevents = false;
	this.setprop("min", opt);
      },
      get: function() {
	return this._min;
      },
    },
    "sec": {
      enumerable: true,
      set: function(opt) {
	if (opt) {
	  this.container.suppressevents = true;
	  this.setprop("hour", true);
	  this.setprop("min", true);
	  this.container.suppressevents = false;
	}
	this.setprop("sec", opt);
      },
      get: function() {
	return this._sec;
      },
    },
    "maxnumber":{
      enumerable: true,
      set: function(opt) {
	this.setprop("maxnumber", opt, "change");
      },
      get: function() {
	return this._maxnumber;
      },
    },
    "minnumber":{
      enumerable: true,
      set: function(opt) {
	this.setprop("minnumber", opt, "change");
      },
      get: function() {
	return this._minnumber;
      },
    },
    "minyear": {
      enumerable: true,
      set: function(opt) {
	this.setprop("minyear", opt, "change");
      },
      get: function() {
	return this._minyear;
      },
    },
    "maxyear": {
      enumerable: true,
      set: function(opt) {
	this.setprop("maxyear", opt, "change");
      },
      get: function() {
	return this._maxyear;
      },
    },
    "_type": {
      enumerable: false,
      value: "",
      writable: true,
    },
    "_text": {
      enumerable: false,
      value: "",
      writable: true,
    },
    "_index": {
      enumerable: false,
      value: 0,
      writable: true,
    },
    "_img": {
      enumerable: false,
      value: {},
      writable: true,
    },
    "_required": {
      enumerable: false,
      value: false,
      writable: true,
    },
    "_constraint": {
      enumerable: false,
      value: {},
      writable: true,
    },
    "_rows": {
      enumerable: false,
      value: 5,
      writable: true,
    },
    "_year": {
      enumerable: false,
      value: true,
      writable: true,
    },
    "_month": {
      enumerable: false,
      value: true,
      writable: true,
    },
    "_day": {
      enumerable: false,
      value: true,
      writable: true,
    },
    "_wday": {
      enumerable: false,
      value: false,
      writable: true,
    },
    "_hour": {
      enumerable: false,
      value: false,
      writable: true,
    },
    "_min": {
      enumerable: false,
      value: false,
      writable: true,
    },
    "_sec": {
      enumerable: false,
      value: false,
      writable: true,
    },
    "_maxnumber":{
      enumerable: false,
      value: 999999,
      writable: true,
    },
    "_minnumber":{
      enumerable: false,
      value: 0,
      writable: true,
    },
    "_minyear":{
      enumerable: false,
      value: 1900,
      writable: true,
    },
    "_maxyear": {
      enumerable: false,
      value: 2100,
      writable: true,
    },
    "container": {
      enumerable: false,
      value: null,
      writable: true,
    },
  };

  var MetaFormItem = function(arg) {
    Object.defineProperties(this, MetaFormItem_PropertyDescriptor);
    this.container = arg.container;
    this.index = arg.index;
    if (arg.type) {
      this.type = arg.type;
    } else {
      this.type = Qst.TYPE_LABEL;
    }
    if (arg.text) {
      this.text = arg.text;
    } else {
      this.text = "";
    }
    arg.rows ? this.rows = arg.rows : undefined;
    arg.minnumber ? this.minnumber = arg.minnumber : undefined;
    arg.maxnumber ? this.maxnumber = arg.maxnumber : undefined;
    arg.year ? this.year = arg.year : undefined;
    arg.month ? this.month = arg.month : undefined;
    arg.minyear ? this.minyear = arg.minyear : undefined;
    arg.maxyear ? this.maxyear = arg.maxyear : undefined;
    arg.day ? this.day = arg.day : undefined;
    arg.hour ? this.hour = arg.hour : undefined;
    arg.min ? this.min = arg.min : undefined;
    arg.sec ? this.sec = arg.sec : undefined;
    arg.img ? this.img = arg.img : undefined;
    
    arg.required ? this.required = arg.required : undefined;
    arg.constraint ? this.constraint = arg.constraint : undefined;
    arg.container ? this.container = arg.container : undefined;
  };
  
  MetaFormItem.prototype = _.extend(MetaFormItem.prototype, {
    clone: function() {
      var dest = new MetaFormItem(this);
      return dest;
    },
    setprop: function(propname, value, events) {
      var changed = (this[ "_" + propname ] === undefined && value === undefined ? false : (this[ "_" + propname ] !== value ? true : (this[ "_" + propname ].toString() === value.toString())));
      this[ "_" + propname ] = value;
      if (changed && ! this.container.suppressevents) {
	if (propname === 'required') {
	  this.container.suppressevents = true;
	  this.container.reconstruct_action_cond();
	  this.container.suppressevents = false;
	}
	if (events) {
	  this.container.trigger(events, this._index);
	} else {
	  //	  this.container.trigger("change", this._index);
	  this.container.checksequence();
	  this.container.trigger("reset", this._index);
	}
      }
    },
    clearconstraint: function() {
      if (this.type !== Qst.TYPE_LABEL) {
	this.required = false;
	this.constraint = {};
      }
    },
  });

  function dateToInputString(date) {
    return date.toISOString().replace(/:[0-9]{2}\.[0-9]+[zZ]/, "");
  }
  
  var MetaFormModel = self.Qst.MetaFormModel = Backbone.Model.extend({
    isPublic: false,
    viewtype: 1,
    items: null,
    defaults: {
      viewtype: 1,
      isPublic: false,
      items: [],
      usefss:false,
      fss:"",
      notifyflag: true,
      unique_email: true,
      unique_name: false,
      unique_ip: false,
      unique_browser: false,
      unique_cookie: false,
      cookie_expire_months: 0,
      cookie_expire_days: 365,
      cookie_expire_hours: 0,
      cookie_expire_mins: 0,
      disappear_after_answer: false,
      form_alternative_content_answered: "",
      disappear_after_timeout: false,
      form_expire_datetime: dateToInputString(new Date()),
      form_alternative_content_expired: "",
      use_action_setting: false,
      ack_type: "default",
      action_cond: { "none": null },
      submit_text: qstnr_data.txtSubmit,
      ack_text: qstnr_data.txtThankYou,
      dismiss_text: qstnr_data.txtOK,
    },
    initialize: function() {
      this.url = qstnr_data.admin_ajax_url + "?" 
                  + $.param({
                        action: "qstnr_formmeta", 
                        nonce: qstnr_data.nonce, 
                        postid: qstnr_data.postid
                  });
      // model data version.
      this.set('mdv', qstnr_data.mdv);
      this._suppressevents = [];
      Object.defineProperty(this, "suppressevents",
			    {
			      get : function()
			      {
				if (this._suppressevents.length === 0) {
				  return false;
				} else {
				  return true;
				}
			      },
			      set : function(newValue)
			      {
				if (newValue) {
				  this._suppressevents.push(newValue);
				} else {
				  this._suppressevents.pop();
				}
			      },
			      enumerable : false,
			      configurable : true
			    }
			   );
    },
    parse: function(data, option) {
      try {
	if (data && data.items) {
	  this.suppressevents = true;
	  this.items([]);
	  var index = 0;
	  _.each(data.items, function(item) {
	    var arg = {container: this, index: index++ };
	    _.extend(arg, item);
	    this.items().push(new MetaFormItem(arg));
	  }, this);
	  delete data.items;
	  this.checksequence();
	  this.suppressevents = false;
	}
	this.trigger("reset");
	return data;
      } catch (e) {
	console.log(e);
	return null;
      }
    },
    check_action_cond: function() {
      if (this.ispublic() && (! this.unique_cookie() && (this.unique_name() || this.unique_email()))) {
	var cond = Qst.constraint_cond(this.action_cond());
	if (cond === 'submitifon') {
	  this.action_cond({'none':null});
	}
      }
    },
    getset_bool: function(name, btrue) {
      if (btrue === undefined) {
	return this.get(name);
      } else {
	this.set(name, btrue != 0);
	this.check_action_cond();
      }
    },
    getset_val: function(name, val) {
      if (val === undefined) {
	return this.get(name);
      } else {
	this.set(name, val);
      }
    },
    unique_name: function(btrue) {
      return this.getset_bool('unique_name', btrue);
    },
    unique_email: function(btrue) {
      return this.getset_bool('unique_email', btrue);
    },
    unique_ip: function(btrue) {
      return this.getset_bool('unique_ip', btrue);
    },
    unique_browser: function(btrue) {
      return this.getset_bool('unique_browser', btrue);
    },
    unique_cookie: function(btrue) {
      return this.getset_bool('unique_cookie', btrue);
    },
    cookie_expire_months: function(months) {
      return this.getset_val('cookie_expire_months', months);
    },
    cookie_expire_days: function(days) {
      return this.getset_val('cookie_expire_days', days);
    },
    cookie_expire_hours: function(hours) {
      return this.getset_val('cookie_expire_hours', hours);
    },
    cookie_expire_mins: function(mins) {
      return this.getset_val('cookie_expire_mins', mins);
    },
    disappear_after_answer: function(btrue) {
      return this.getset_bool('disappear_after_answer', btrue);
    },
    form_alternative_content_answered: function(content) {
      return this.getset_val('form_alternative_content_answered', content);
    },
    disappear_after_timeout: function(btrue) {
      return this.getset_bool('disappear_after_timeout', btrue);
    },
    form_expire_datetime: function(datetime) {
      return this.getset_val('form_expire_datetime', datetime);
    },
    form_alternative_content_expired: function(content) {
      return this.getset_val('form_alternative_content_expired', content);
    },
    use_action_setting: function(btrue) {
      return this.getset_val('use_action_setting', btrue);
    },
    ack_type: function(type) {
      return this.getset_val('ack_type', type);
    },
    post_ack_content: function(content) {
      return this.getset_val('post_ack_content', content);
    },
    keep_size: function(btrue) {
      return this.getset_bool('keep_size', btrue);
    },
    action_cond: function(cond) {
      return this.getset_val('action_cond', cond);
    },
    set_action_cond: function(cond_type, items) {
      var itemval = [];
      var levelop = {};
      if (items && items.length > 0 && items[0] === 'required') {
	var modelitems = this.items();
	var qid = 0;
	// insert "dummy" item.
	itemval.push({item: "required"});
	// insert all required items.
	_.each(modelitems, function(modelitem) {
	  if (modelitem.type === Qst.TYPE_LABEL) {
	    if (modelitem.required) {
	      itemval.push({ item: "[" + qid + "]" });
	    }
	    qid++;
	  }
	});
	levelop = { and: itemval };
      } else {
	if (items && items.length > 0) {
	  _.each(items, function(e) {
	    itemval.push( {item: e} );
	  }, this);
	}
	levelop = { or: itemval };
      }
      if (itemval.length > 0) {
	var condition = {};
	switch (cond_type) {
	case 'none':
	case 'default':
	  break;
	case 'submitifon':
	  condition.submit = levelop;
	  break;
	case "showifon":
	  condition.show = levelop;
	  break;
	case "showifoff":
	  condition.show = { not: levelop };
	  break;
	case "hideifon":
	  condition.hide = levelop;
	  break;
	case "hideifoff":
	  condition.hide = { not: levelop };
	  break;
	case "enableifon":
	  condition.enable = levelop;
	  break;
	case "enableifoff":
	  condition.enable = { not: levelop };
	  break;
	case "disableifon":
	  condition.disable = levelop;
	  break;
	case "disableifoff":
	  condition.disable = { not: levelop };
	  break;
	default:
	  break;
	}
	this.action_cond(condition);
	return true;
      }
      return false;
    },
    reconstruct_action_cond: function() {
      var cond_type = Qst.constraint_cond(this.action_cond());
      var cond_item = Qst.constraint_item(this.action_cond());
      this.set_action_cond(cond_type, cond_item);
    },
    submit_text: function(text) {
      return this.getset_val('submit_text', text);
    },
    ack_text: function(text) {
      return this.getset_val('ack_text', text);
    },
    dismiss_text: function(text) {
      return this.getset_val('dismiss_text', text);
    },
    ispublic: function(btrue) {
      return this.getset_bool('isPublic', btrue);
    },
    viewtype: function(type) {
      if (type === undefined) {
	return this.get('viewtype');
      } else {
	this.set('viewtype', type);
      }
    },
    usefss: function(use) {
      if (use === undefined) {
	return this.get('usefss');
      } else {
	this.set('usefss', use);
      }
    },
    notifyflag: function(bNotify) {
      if (bNotify === undefined) {
	return this.get('notifyflag');
      } else {
	this.set('notifyflag', bNotify);
      }
    },
    fss:function(fss) {
      if (fss === undefined) {
	return this.get('fss');
      } else {
	this.set('fss', fss);
      }
    },
    items: function(val) {
      if (val) {
	this.set('items', val);
	return this;
      } else {
	return this.get('items');
      }
    },
    transit: function(t) {
      return this.getset_val('transit', t);
    },
    transitcondition: function(i, cond) {
      var transit = this.get('transit');
      if (i < transit.length) {
	if (cond) {
	  transit[i].condition = cond;
	} else {
	  return transit[i].condition;
	}
      }
    },
    transitdest: function(i, dest, target) {
      var transit = this.get('transit');
      if (i < transit.length) {
	if (dest) {
	  transit[i].url = dest;
	  transit[i].target = target;
	} else {
	  return { url: transit[i].url, target: transit[i].target };
	}
      }
    },
    renumber: function() {
      this.suppressevents = true;
      var items = this.get('items');
      var i = 0;
      var qid = 1;
      _.each(items, function(item) {
	item.index = i++;
	item.qid = qid;
	if (item.type === Qst.TYPE_LABEL) {
	  qid++;
	}
      });
      this. suppressevents = false;
    },
    addnew: function() {
      var items = this.get('items');
      this.suppressevents = true;
      items.push(new MetaFormItem({container: this, index: items.length}));
      this.checksequence();
      this.suppressevents = false;
      this.trigger('add');
    },
    delete: function(index) {
      var items = this.get('items');
      items.splice(index, 1);
      this.checksequence();
      this.renumber();
      this.trigger('remove', index);
    },
    moveup: function(index) {
      var items = this.get('items');
      if (index > 0) {
        var current = items[index];
        var prev = items[index - 1];
	items[index] = prev;
	items[index - 1] = current;
	prev.index = index;
	current.index = index - 1;
	
        this.checksequence();
      }
    },
    movedown: function(index) {
      var items = this.get('items');
      if (index < items.length - 1) {
        var current = items[index];
        var next = items[index + 1];
	items[index] = next;
	items[index + 1] = current;
	next.index = index;
	current.index = index + 1;
	
        this.checksequence();
      }
    },
    checksequence: function() {
      this.suppressevents = true;
      var prevtype = undefined;
      var isfirst = true;
      _.each(this.get('items'), function(item) {
        if (isfirst) {
          item.type = Qst.TYPE_LABEL;
        } else {
          if (prevtype === Qst.TYPE_LABEL) {
            if (item.type === Qst.TYPE_LABEL) {
              item.type = Qst.TYPE_TEXT;
            }
          } else if (prevtype === Qst.TYPE_TEXT) {
            item.type = Qst.TYPE_LABEL;
          } else {
            if (prevtype !== item.type) {
              item.type = Qst.TYPE_LABEL;
            }
          }
        }
        prevtype = item.type;
        isfirst = false;
	item.clearconstraint();
      });
      this.renumber();
      this.suppressevents = false;
    },
  });

});

