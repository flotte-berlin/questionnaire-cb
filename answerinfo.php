<?php
namespace questionnaire;

function initialize_answerinfo() {
  add_ns_action('wp_ajax_qstnr_answer_info', 'ajax_answer_info');
}

function ajax_answer_info() {

  if (array_key_exists('postid', $_GET)) {

    $postid = $_GET['postid'];
    $nonce = $_GET['nonce'];

    if (wp_verify_nonce($nonce, QUESTIONNAIRE_NONCE . $postid)) {
      $comments = query_comments($postid, array());
      
      if ($_SERVER['REQUEST_METHOD'] === 'POST') {

	foreach ( $comments as $comment ) {
	  wp_delete_comment($comment->comment_ID, true);
	}
	
	$ccount = query_comments($postid, array('count' => true));
	
        status_header(SC_OK);
	echo json_encode(array('success' => true, 'count' => $ccount));
      } else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        status_header(SC_OK);
        echo json_encode(array('success' => true, 'answercount' => get_answer_count($postid)));
      } else {
	status_header(SC_ERROR);
	echo ('{"success":false}');
      }
      die();
    }
  }

  status_header(SC_ERROR);
  echo json_encode(array('success' => false));

  die();
}

function answerinfo($ldata) {
  wp_enqueue_script('qstnr_answerinfo', plugins_url('answerinfo.js', __FILE__));
?>
  <div id="qstnr-answerinfo">
    <div id="qstnr-answerinfo-errormsg"></div>
    <table style="border:none">
      <tr>
        <td><button id="qstnr-sync-answerinfo"><span class="icon-sync"></span></button><span><?= __('Count of Answers: ', ns_()) ?></span><span class="qstnr-answercount"></span></td>
        <td><button type="button" id="qstnr-clearAnswers"><?= __('Delete all answers', ns_()) ?></button></td>
      </tr>
    </table>
    <div class="qstnr-confirm-dialog" style="display:none;">
      <div><?= __('Are you sure to delete all answer data?', ns_()); ?></div>
      <button type="button" id="qstnr-deleteanswer-confirm-yes"><?= __('OK', ns_());?></button>
      <button type="button" id="qstnr-deleteanswer-confirm-no"><?= __('Cancel', ns_());?></button>
    </div>
  </div>
<?php
}

