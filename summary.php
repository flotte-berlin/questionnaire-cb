<?php
/**
 * summary.php
 * Author: Hiroyoshi Kurohara(Microgadget,inc.)
 * Author EMail : kurohara@yk.rim.or.jp
 * License: GPLv2 or Lator.
 *
 */
namespace questionnaire;

define(__NAMESPACE__ . '\DEF_FETCHCOUNT', 4096);

function initialize_summary() {
  add_ns_action('wp_ajax_qstnr_summary', 'ajax_summary');
}

function summary() {
  wp_enqueue_script('amcharts', plugins_url('amcharts/amcharts/amcharts.js', __FILE__));
  wp_enqueue_script('amcharts-pie', plugins_url('amcharts/amcharts/pie.js', __FILE__));
  wp_enqueue_script('amcharts-serial', plugins_url('amcharts/amcharts/serial.js', __FILE__));
  wp_enqueue_script('amcharts-serial', plugins_url('amcharts/amcharts/themes/light.js', __FILE__));
  wp_enqueue_script('qstnr_summary', plugins_url('summary.js', __FILE__));
    ?>
  <div class="qstnr-summary">
  <div class="qstnr-summary-bg">
  <p> no valid data
  </div>
  </div>
<?php
  
}

function summary_ne() {
  ob_start();
  summary();
  $html = ob_get_contents();
  ob_end_clean();
  return $html;
}

/**
 * called when paged answer list requested.
 */
function ajax_summary() {
  $postid = $_GET['postid'];
  if (! wp_verify_nonce($_GET['nonce'], QUESTIONNAIRE_NONCE . $postid) ) {
    status_header(SC_BADREQUEST);
    echo json_encode(array('success' => false));
    die();
  }

  status_header(SC_OK);
  echo json_encode(summary_total($postid), JSON_UNESCAPED_UNICODE);

  die();
}

function summary_total($postid) {
  $sum = NULL;
  for ($i = 0;;$i += DEF_FETCHCOUNT) {
    $data_arr = get_answer_list($postid, $i, DEF_FETCHCOUNT);
    foreach ($data_arr as $entry) {
      $content = json_decode($entry->comment_content, true);
      $itemlist = $content['itemlist'];
      if (is_null($sum)) {
	// initialize summary array.
	$sum = $itemlist;
	foreach ($sum as $index => $item) {
	  foreach ($item['selected'] as $key => $value) {
	    // change boolean value into integer 0.
	    $sum[$index]['selected'][$key] = 0;
	  }
	  $sum[$index]['valid'] = 0;
	}
      }
      foreach ($itemlist as $index => $item) {
	$isvalid = FALSE;
	if ($item['type'] !== 'text') {
	  foreach ($item['selected'] as $key => $value) {
	    if ($value === true) {
	      $isvalid = TRUE;
	      $sum[$index]['selected'][$key]++ ;
	    }
	  }
	}
	if ($isvalid === TRUE) {
	  $sum[$index]['valid']++;
	}
      }
    }
    if (count($data_arr) < DEF_FETCHCOUNT) {
      break;
    }
  }
  return $sum;
}
