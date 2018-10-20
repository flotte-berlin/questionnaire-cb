<?php
/**
 * answerlist.php
 * Author: Hiroyoshi Kurohara(Microgadget,inc.)
 * Author EMail : kurohara@yk.rim.or.jp
 * License: GPLv2 or Lator.
 *
 */
namespace questionnaire;

require_once("codeconv.php");

define(__NAMESPACE__ . '\DEF_CNTINPAGE', 20);
define(__NAMESPACE__ . '\DEF_NUMLINKS', 20);

function initialize_answerlist() {
  add_ns_action('wp_ajax_qstnr_answer_list', 'ajax_answer_list');

  add_ns_action('wp_ajax_qstnr_answer_list_csv', 'ajax_answer_list_csv');

}

/**
 * get total count of answers
 */
function get_answer_count($postid) {
  return query_comments($postid, array('count' => true));
}

/**
 * get answer list actually.
 */
function get_answer_list($postid, $offset, $number) {
  return query_comments($postid, array('offset' => $offset, 'number' => $number));
}

/**
 * create header array for csv 
 */
function headercsv($metadata) {
  $metadata_obj = json_decode($metadata, true);
  $header = array(array(), array());
  $items = $metadata_obj['items'];
  $prevtype = null;
  //
  array_push($header[0], "");
  array_push($header[0], "");
  array_push($header[0], "");
  array_push($header[1], __("name", ns_()));
  array_push($header[1], __("email", ns_()));
  array_push($header[1], __("date", ns_()));
  // header, first row
  foreach ($items as $item) {
    if ($item['type'] === 'label') {
      if ($prevtype != null && $prevtype !== 'label') {
        array_pop($header[0]);
      }
      array_push($header[0], $item['text']);
    } else {
      array_push($header[0], "");
    }
    $prevtype = $item['type'];
  }
  // header, second row
  foreach ($items as $item) {
    if ($item['type'] === 'label') {
    } else {
      array_push($header[1], $item['text']);
    }
  }
  return $header;
}

/**
 * output all answers as csv
 */
function get_answer_list_csv($postid) {
  $meta = get_post_meta($postid, POSTMETA_METAJSON, true);
  if ($meta === "") {
    return;
  }
  $all = get_answer_list($postid, 0, null);

  $header = headercsv($meta);

  $locale = get_locale();
  
  $stdout = fopen("php://output", "w");
  if (preg_match('/^ja.*/', $locale) === 1) {
    $charset = "SJIS"; // "SJIS";
    stream_filter_append($stdout, "codeconvto.SJIS");
  } else {
    $charset = "utf-8"; // "utf-8";
  }
  // send http header
  header("Content-type: text/csv; charset=" . $charset);
  header("content-disposition: " . 'attachment; filename="answerlist.csv"');
  // send header part of csv
  fputcsv($stdout, $header[0]);
  fputcsv($stdout, $header[1]);

  // send data part of csv
  foreach ($all as $record) {
    $record_data = json_decode($record->comment_content, true);
    $recarray = array();
    // push personal info
    array_push($recarray, $record_data['author']);
    array_push($recarray, $record_data['email']);
    array_push($recarray, $record->comment_date);

    // convert answer hash to array
    foreach ($record_data['itemlist'] as $item) {
      $type = $item['type'];
      error_log($item['value']);
      if ($type === 'text' || $type === 'datetime' || $type === 'number' ) {
        array_push($recarray, $item['value']);
      } else {
        $selcount = count($item['selections']);
        for ($i = 0;$i < $selcount;++$i) {
          array_push($recarray, $item['selected'][$item['selectedname'][$i]] ? 1 : 0 );
        }
      }
    }

    fputcsv($stdout, $recarray);
  }
  fclose($stdout);

}

/**
 * called when paged answer list requested.
 */
function ajax_answer_list() {
  $postid = $_GET['postid'];
  if (! wp_verify_nonce($_GET['nonce'], QUESTIONNAIRE_NONCE . $postid) ) {
    status_header(SC_BADREQUEST);
    echo json_encode(array('success' => false));
    die();
  }
  $start = (int) $_GET['start'];
  $current = (int) $_GET['current'];
  $cntinpage = (int) $_GET['cntinpage'];
  if ($cntinpage === 0) {
    // should be first fetch.
    $cntinpage = DEF_CNTINPAGE;
  }
  $istart = $start * $cntinpage;
  $icurrent = $current * $cntinpage;

  $comments = get_answer_list($postid, $istart, $cntinpage);
  $collection = array();
  foreach ($comments as $comment) {
    $comment_content_array = json_decode($comment->comment_content, true);
    $comment_content_array['answer_date'] = $comment->comment_date;
    array_push($collection, $comment_content_array);
  }
  status_header(SC_OK);
  echo json_encode(
                   array(
                         'collection' => $collection,
                         'total' => get_answer_count($postid),
                         'start' => $start,
                         'current' => $current,
                         'cntinpage' => $cntinpage
                         ), JSON_UNESCAPED_UNICODE);

  die();
}

/**
 * called when csv download requested.
 */
function ajax_answer_list_csv() {
  $postid = $_GET['postid'];
  if (! wp_verify_nonce($_GET['nonce'], QUESTIONNAIRE_NONCE . $postid) ) {
    status_header(SC_ERROR);
    echo json_encode(array('success' => false));
    die();
  }

  status_header(SC_OK);
  get_answer_list_csv($postid);

  die();
}

function answerlist_ne($ldata) {
  ob_start();
  answerlist($ldata);
  $html = ob_get_contents();
  ob_end_clean();
  return $html;
}

function answerlist($ldata) {

  wp_enqueue_script('qstnr_metaform', plugins_url('metaform.js', __FILE__));
  wp_enqueue_script('qstnr_actform', plugins_url('actform.js', __FILE__));
  wp_enqueue_script('qstnr_aggregated', plugins_url('answerlist.js', __FILE__));
  wp_enqueue_style('qstnr_formcomposer_style', plugins_url('style.css', __FILE__));
  wp_enqueue_style('qstnr_icomoon_style', plugins_url('icomoon/style.css', __FILE__));

?>
  <div class="qstnr-answerlist-body">
    <div class="qstnr-answerlist-bg">
      <div class="qstnr-answerlist">
      </div>
      <div class="qstnr-pagenavi">
      </div>
    </div>
    <div class="qstnr-csv-download">
      <a href="<?= $ldata['admin_ajax_url']?>?action=qstnr_answer_list_csv&postid=<?= $ldata['postid']?>&nonce=<?= $ldata['nonce']?>"><?= __('Download answers as CSV', ns_()) ?></a>
    </div>
  </div>
<?php
  dialogbox($ldata);
}

