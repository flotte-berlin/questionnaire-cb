<?php
namespace questionnaire;

function initialize_genanswer() {
  add_ns_action('wp_ajax_qstnr_gen_answer', 'ajax_gen_answer');
  add_ns_action('wp_ajax_nopriv_qstnr_gen_answer', 'ajax_gen_answer');
}

function ajax_gen_answer() {
  if (! wp_verify_nonce($_GET['nonce'], QUESTIONNAIRE_NONCE . $_GET['postid']) ) {
    status_header(SC_BADREQUEST);
    echo json_encode(array('success' => false));
    die();
  }
  $postid = $_GET['postid'];
  $remoteaddr = $_SERVER['REMOTE_ADDR'];
  $useragent = $_SERVER['HTTP_USER_AGENT'];

  $userid = 0;

  status_header(SC_OK);

  $formdata = received_data();
  $formdata_array = json_decode($formdata, true);

  $author = $formdata_array['author'];
  $email = $formdata_array['email'];
  
  do_action(ACTION_PROC_ANSWER, 
    array(
      'postid' => $postid,
	'remoteaddr' => $remoteaddr, 
	'useragent' => $useragent, 
	'userid' => $userid,
	'author' => $author,
	'email' => $email,
	'formdata' => $formdata));

  die();
}

function genanswer() {
?>
  <script type="text/javascript">
  jQuery(function($) {
    $(document).ready(function() {
      var inprogressView = new Qst.InprogressView({el: $(".qstnr-genanswer"), bg: "", fg: ".qstnr-genanswer", button: "#qstnr_btn_genanswer" });
      
    $("#qstnr_btn_genanswer").on("click", function() {
	Qst.actview.model.url = qstnr_data.admin_ajax_url + "?" 
                  + $.param({
                      action: "qstnr_gen_answer",
                      postid: qstnr_data.postid,
                      nonce: qstnr_data.nonce
    });
	var uid = Math.floor( Math.random() * 100 );
	Qst.actview.model.setauthor("testuser" + uid);
	Qst.actview.model.setemail("testuser" + uid + "@test.com");
	Qst.actview.model.save();
	console.log(Qst.actview.model);
	return false;
      });
    });
  });
  </script>
  <div class="qstnr-genanswer">
    <div class="qstnr-genanswer-bg">
      <button id="qstnr_btn_genanswer">generate dummy answer</button>
    </div>
  </div>
<?php
}
