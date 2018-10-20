/**
 *
 */

jQuery(function($) {
  var AnswerInfoModel = self.Qst.AnswerInfoModel = Backbone.Model.extend({
    initialize: function() {
      this.url = qstnr_data.admin_ajax_url 
        + "?" + $.param({
                    action: "qstnr_answer_info", 
                    nonce: qstnr_data.nonce, 
                    postid: qstnr_data.postid
                  });
    },
    parse: function(data, options) {
      return data;
    },
    answercount: function() {
      return this.get('answercount');
    },
  });

  var AnswerInfoErrorView = self.Qst.AnswerInfoErrorView = Backbone.View.extend({
    el: "#qstnr-answerinfo",
    initialize: function() {
      
    },
    show: function(bshow, message) {
      if (bshow) {
	this.$el.addClass("answerinfo-errorview");
	this.$("#qstnr-answerinfo-errormsg").css("display", "block");
	this.$("#qstnr-answerinfo-errormsg").text(message);
      } else {
	this.$el.removeClass("answerinfo-errorview");
	this.$("#qstnr-answerinfo-errormsg").css("display", "none");
      }
    },
  });
  
  var AnswerInfoView = self.Qst.AnswerInfoView = Backbone.View.extend({
    el: "#qstnr-answerinfo",
    initialize: function() {
      this.inprogressView = new Qst.InprogressView({
                              el: this.$el, 
                              bg: "",
                              fg: ".qstnr-answerinfo table",
                              button: ".qstnr-answerinfo table button",
      });
      this.model = new AnswerInfoModel();
      this.dialogView = new Qst.DialogView();
      this.errorView = new AnswerInfoErrorView();
      this.listenTo(this.model, "change", this.render);
      this.dosync();
    },
    events: {
      "click #qstnr-clearAnswers": "doclear",
      "click #qstnr-sync-answerinfo": "dosync",
      "click .qstnr-dialog": "dismiss",
      "click #qstnr-deleteanswer-confirm-yes": "clearAnswers",
      "click #qstnr-deleteanswer-confirm-no": "cancelClear",
    },
    finished: function(bSuccess, data, jqXHR) {
      // end inprogress view.
      if (! bSuccess) {
      	var errmsg = qstnr_data.txtRequestError;
      	errmsg += " " + jqXHR.status + "," + jqXHR.statusText;
      	this.errorView.show(true, errmsg);
      }
    },
    save_finished: function(bSuccess, data, jqXHR) {
      this.inprogressView.transit(false);
      if (! bSuccess) {
        this.dialogView.show(true, qstnr_data.txtRequestError + jqXHR.status + "," + jqXHR.statusText);
        this.on("click", "dismiss");
      }
    },
    dismiss: function() {
      this.off("click", "dismiss");
      this.dialogView.show(false);
      return false;
    },
    render: function() {
      this.$(".qstnr-answercount").text(this.model.answercount());
    },
    doclear: function() {
      if (! this.$(".qstnr-confirm-dialog").is(':visible')) {
	this.$(".qstnr-confirm-dialog").fadeToggle(400);
      }
    },
    clearAnswers: function() {
      this.inprogressView.ajaxcall2(this.model.save.bind(this.model), this.save_finished.bind(this), {"answercount": 0}, {timeout: qstnr_data.ajaxTimeout});
      if (this.$(".qstnr-confirm-dialog").is(':visible')) {
	this.$(".qstnr-confirm-dialog").fadeToggle(400);
      }
      return false;
    },
    cancelClear: function() {
      if (this.$(".qstnr-confirm-dialog").is(':visible')) {
	this.$(".qstnr-confirm-dialog").fadeToggle(400);
      }
    },
    dosync: function() {
       this.inprogressView.ajaxcall(this.model.fetch.bind(this.model), this.finished.bind(this), {timeout: qstnr_data.ajaxTimeout});
      return false;
    },
  });

});

