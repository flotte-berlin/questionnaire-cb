/*
 */
jQuery(function($) {
  $(document).ready(function() {
    var metadoc = new Qst.MetaFormModel();
    var actmodel = new Qst.ActForm();
    var actview = new Qst.ActFormView({model: actmodel});
    var actmodel_old = new Qst.ActForm();
    
    actview.inprogressView.ajaxcall(
      metadoc.fetch.bind(metadoc),
      function(bSuccess, data, jqXHR) {
    	actmodel.metaupdated(this);
    	actview.type = metadoc.get('viewtype');
	/* no longer support 'bring previous answer' feature. */
	// actview.inprogressView.ajaxcall(
	//   actmodel_old.fetch.bind(actmodel_old),
	//   function (bSuccess, data, jqXHR) {
    	//     if (this.itemlist().length === 0) {
    	//       // if no answer data exists, get metamodel to setup questionnaire form.
    	//     } else {
	//       actmodel.copy_answer(actmodel_old);
    	//     }
	//   }.bind(actmodel_old),
	//   {timeout: qstnr_data.ajaxTimeout}
	// );
	actview.render();
      }.bind(metadoc),
      {timeout: qstnr_data.ajaxTimeout}
    );
  });
});
