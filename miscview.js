/*
 */
jQuery(function($) {
  if (self.Qst.getDialogView === undefined) {
    self.Qst.getDialogView = function() {
      if (self.Qst.dialogView === undefined) {
	self.Qst.dialogView = new self.Qst.DialogView($(".qstnr-dialog"));
      }
      return self.Qst.dialogView;
    };
  }
  
  var DialogView = self.Qst.DialogView = Backbone.View.extend({
    initialize: function(args) {
      this.ignore = false;
      if (args && args.el) {
	this.setElement(args.el);
      }
    },
    events: {
      "click": "dismiss",
    },
    show: function(bshow, text, cls, buttontext) {
      if (bshow) {
	if (buttontext) {
	  this.$("button.qstnr-ackbtn").text(buttontext);
	}
	this.$el.css('opacity', '0');
	this.$el.show();
	this.$el.animate({opacity: "1"}, 400, function() {
	}.bind(this));
        if (text) {
          this.$(".qstnr-dialog-message").html(text);
        }
	this.$el.removeClass();
	this.$el.addClass("qstnr-dialog");
        if (cls) {
          this.$el.addClass(cls);
        }
        // locate at center.
        var parent = this.$el.parent();
        var left = parent.offset().left + (parent.width() - this.$el.width()) / 2;
        var top = parent.offset().top + (parent.height() - this.$el.height()) / 2;
        this.$el.offset({"left": left, "top": top });
      } else {
	this.$el.animate({opacity:'0'}, 400, function() {
	  this.$el.hide();
	}.bind(this));
      }
    },
    render: function() {
    },
    dismiss: function() {
      this.ignore = true;
      this.show(false);
    },
  });

  var InprogressView = self.Qst.InprogressView = Backbone.View.extend({
    initialize: function(at) {
      if (at.el) {
	this.setElement($(at.el).get(0));
      } else {
	this.setElement(document.body);
      }
      this.bg = this.$(at.bg);
      this.fg = this.$(at.fg);
      this.button = this.$(at.button);
    },
    transit: function(binprogress) {
      if (binprogress) {
        this.bg.addClass("qstnr-loading");
        this.fg.addClass("qstnr-waiting");
        this.button.prop("disabled", "disabled");
      } else {
        this.bg.removeClass("qstnr-loading");
        this.fg.removeClass("qstnr-waiting");
        this.button.removeAttr("disabled");
      }
    },
    /**
     * for save 
     */
    ajaxcall2: function(func, finished, args, options) {
      this.transit(true);
      try {
	func(args, _.extend(options, {
	  success: function(model, resultObj, options) {
	    this.transit(false);
	    try {
	      finished(true, resultObj, null);
	    } catch (e) {}
	  }.bind(this),
	  error: function(model, jqXHR, options) {
	    this.transit(false);
	    try {
	      finished(false, null, jqXHR);
	    } catch(e) {}
	  }.bind(this),
	}));
      } catch (e) {
	this.transit(false);
      }
    },
    /**
     * for fetch
     */
    ajaxcall: function(func, finished, options) {
      this.transit(true);
      try {
	func(_.extend(options, {
	  success: function(model, resultObj, options) {
	    this.transit(false);
	    try {
	      finished(true, resultObj, null);
	    } catch(e) {}
	  }.bind(this),
	  error: function(model, jqXHR, options) {
	    this.transit(false);
	    try {
	      finished(false, null, jqXHR);
	    } catch(e) {}
	  }.bind(this),
	}));
      } catch (e) {
	this.transit(false);
      }
    },
  });
  
});
