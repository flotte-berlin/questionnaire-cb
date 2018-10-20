/*
 */
jQuery(function($) {

  $(document).ready(function() {
    var metadoc = new Qst.MetaFormModel();

    var actmodel = new Qst.ActForm();
    var metaview = new Qst.FormMetaView({model: metadoc});
    var actview = Qst.actview = new Qst.ActFormView({model: actmodel});
    var ansctrlview = new Qst.AnswerInfoView();

    metadoc.on("change add remove reset textchange", function(event) {
      actview.type = metadoc.get('viewtype');
      actmodel.metaupdated(this);
      actview.render();
    }, metadoc);

    metadoc.on("change:viewtype", function() {

      actview.changetype(metadoc.get('viewtype'));
    });

    var samplestate = { inmodal: false };
    actview.old_finished = actview.finished;
    actview.finished = function(bsuccess, data, jqXHR) {
      if (samplestate.inmodal) {
      } else {
	this.old_finished(bsuccess, data, jqXHR);
      }
      samplestate.inmodal = false;
    };

    // link metaview with actview
    metaview.actviewmodal = function(btrue, target) {
      samplestate.inmodal = btrue;
      actview.entermodal(btrue, function() {
	actview.popup(0, 0, false);
      });
      var newtop = target ? target.offsetTop : 0;
      var newleft = target ? target.offsetLeft : 0;
      actview.popup(newtop, newleft, btrue);
    };

    metaview.load();

    //
    // replace sync function with 'fake' one.
    actmodel.sync = function(method, model, options) {
      if (method === 'create' || method === 'update') {
    	setTimeout(function() {
    	  if (options.success) {
    	    var message = this.ack_text ? this.ack_text : qstnr_data.txtThankYou;
    	    options.success({ msg: message }, null);
    	  }
    	  if (metaview.sampleSaveHook) {
    	    metaview.sampleSaveHook(model);
    	  }
    	}.bind(this), 600);
      } else {
    	return Backbone.sync(method, model, options);
      }
    }.bind(actmodel);
    
    // summary & answerlist
    var aggmodel = new Qst.AnswerList();
    var aggview = new Qst.AnswerListView({model: aggmodel, metamodel: metadoc});
    //var aggview = new Qst.AnswerListTestView({model: aggmodel});

    var summary = new Qst.SummaryTotal();
    var summaryView = new Qst.SummaryView({model: summary});
    summary.fetch({timeout:qstnr_data.ajaxTimeout});
    //
    summary.on("sync", function() {
      aggmodel.initialfetch({timeout:qstnr_data.ajaxTimeout});
    });

    ansctrlview.$("#qstnr-sync-answerinfo").on("click", function() {
      summary.fetch({timeout:qstnr_data.ajaxTimeout});
    });

    $("input#publish").on("click", function () {
      var metajson = JSON.stringify(metadoc);
      var metajsoninput = $('form#post input[name=qstnr-temp-metajson]');
      if (metajsoninput.length === 0) {
	metajsoninput = $('<input type="hidden" name="qstnr-temp-metajson">');
	$("form#post").append(metajsoninput);
      }
      metajsoninput.val(metajson);
    });
  });

});
