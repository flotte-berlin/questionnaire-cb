<?php
/*
Plugin Name: questionnaire
Plugin URI: http://www.microgadget-inc.com/labo/wordpress/questionnaire/
Description: Application for collecting questionnaires.
Version: 2.8.0
Author: Hiroyoshi Kurohara(Microgadget,inc.)
Author URI: http://www.microgadget-inc.com/
License: GPLv2 or later
*/

namespace questionnaire;

define(__NAMESPACE__ . '\QUESTIONNAIRE_NONCE', 'questionnaire-');
define(__NAMESPACE__ . '\POSTTYPE', 'questionnaire');
define(__NAMESPACE__ . '\COMMENTTYPE_VER1', 'questionnaire_answer');
define(__NAMESPACE__ . '\COMMENTTYPE', 'qstnr_answer');
define(__NAMESPACE__ . '\POSTMETA_METAJSON_VER1', 'questionnaire_metajson');
define(__NAMESPACE__ . '\POSTMETA_METAJSON', 'qstnr_metajson');
define(__NAMESPACE__ . '\POSTMETA_USEFSS', 'qstnr_usefss');
define(__NAMESPACE__ . '\SC_OK', 200);
define(__NAMESPACE__ . '\SC_BADREQUEST', 400);
define(__NAMESPACE__ . '\SC_ERROR', 500);
define(__NAMESPACE__ . '\GLOBAL_KEY_POSTMETA', __NAMESPACE__ . '\GLOBAL_POSTMETA');
define(__NAMESPACE__ . '\GLOBAL_KEY_HAS_QUESTIONNAIRE', 'questionnaire_document_has_questionnaire');
define(__NAMESPACE__ . '\POSTMETA_QUESTIONNAIRE_ID', 'questionnaire_post_id');

include('wp-nsutil.php');

include('metaform.php');

include('answerinfo.php');

include('miscview.php');

include('resultview.php');

include('answerlist.php');

include('summary.php');

include('notification.php');

include('migrate.php');

include('cookie.php');

include('shortcode.php');

include('widget.php');

include ('transit.php');

add_ns_action('init', 'register_questionnaire');

add_ns_action('plugins_loaded', 'qstnr_loaded');

add_action('widgets_init', function() {
  register_widget('questionnaire\qstnr_widget');
});

function qstnr_loaded() {
  load_plugin_textdomain(__NAMESPACE__, FALSE, basename( dirname( __FILE__ ) ) . '/languages/');
}

function wp_add_inline_style($tag, $style) {
  $newstyle = apply_filters('questionnaire_add_inline_style', $style);

  \wp_add_inline_style($tag, $newstyle);
}

function qstnr_process_css(&$ldata) {
  $csscontent = file_get_contents( dirname( __FILE__ ) . '/style.css');
  if (preg_match_all("/QUESTIONNAIRE SELECTABLE STYLE: ([0-9a-zA-Z\-]+)/", $csscontent, $matched) > 0) {
    $ldata['stylelist'] = $matched[1];
  } else {
    $ldata['stylelist'] = [];
  }
}

include('actform.php');

/**
 * register questionnaire plugin.
 */
function register_questionnaire() {
  $labels = array(
    'name'          => __( 'Questionnaire', ns_() ),
    'singular_name' => __( 'Questionnaire', ns_() ),
    'add_new'       => __( 'Add New', ns_() ),
    'add_new_item'  => __( 'Add New Questionnaire', ns_() ),
    'edit_item'     => __( 'Edit Questionnaire', ns_() ),
    'new_item'      => __( 'New Questionnaire', ns_() ),
    'view_item'     => __( 'View Questionnaire', ns_() ),
    'search_items'  => __( 'Search Questionnaire', ns_() ),
    'not_found'     => __( 'No Questionnaire found', ns_() ),
    'not_found_in_trash' => __( 'No Questionnaire found in trash', ns_() ),
    'parent_item_colon' => __( 'Parent Questionnaire:', ns_() ),
    'menu_name'     => __( 'Questionnaire', ns_() )
  );

  $args = array(
    'labels'              => $labels,
    'hierarchical'        => true,
    'description'         => __( 'For Collecting Questionnaires especially for Absent/Present', ns_()),
    'supports'            => array( 'title', 'editor', 'comments', 'custom-fields', 'author', 'excerpt', 'revisions', 'page-attributes' ),
    'public'              => true,
    'show_ui'             => true,
    'show_in_menu'        => true,
    'show_in_nav_menus'   => true,
    'publicly_queryable'  => true,
    'exclude_from_search'  => false,
    'has_archive'         => true,
    'query_var'           => true,
    'can_export'          => true,
    'rewrite'             => true,
    'capability_type'     => 'post'
  );
  register_post_type( POSTTYPE, $args );

  set_comment_filter();

  add_ns_action('the_content', 'the_content');

  add_ns_filter('get_comments_number', 'get_comments_number');

  initialize_miscview();
  initialize_metaform();
  initialize_actform();
  initialize_answerlist();
  initialize_answerinfo();
  initialize_summary();
  initialize_notification();
  initialize_cookie();
  initialize_shortcode();

  add_ns_action('dp_duplicate_page', 'questionnaire_copy_questionnaire', 10, 2);
}

function set_comment_filter() {
  add_ns_filter('pre_get_comments', 'comments_prequery');
}

function clear_comment_filter() {
  remove_ns_filter('pre_get_comments', 'comments_prequery');
}

function do_output_debug($buffer) {
  ob_start();
  print_r($buffer);
  error_log(ob_get_contents());
  ob_end_clean();
}

function get_comments_number($counted) {

  $post = $GLOBALS['post'];
  if ($post->post_type === POSTTYPE) {
    clear_comment_filter();
    $comments = get_comments(array(
          'post_id' => $post->ID,
          'type' => COMMENTTYPE
        )
    );
    set_comment_filter();
    return $counted - count($comments);
  } else {
    return $counted;
  }
}

function comments_filter($comments) {
  if ($GLOBALS['post']->post_type === POSTTYPE) {
    $result = array();
    foreach ($comments as $comment) {
      if ($comment->comment_type !== COMMENTTYPE) {
        array_push($result, $comment);
      }
    }
    return $result;
  } else {
    return $comments;
  }
}

function comments_prequery(&$comments_query) {
  $comments_query->query_vars['type__not_in'] = array(COMMENTTYPE, COMMENTTYPE_VER1);
}

/**
 * query comments
 */
function query_comments($postid, $args) {
  clear_comment_filter();
  $query_params = array_merge(array('post_id' => $postid, 'type' => COMMENTTYPE), $args);

  $result =  get_comments($query_params);
  set_comment_filter();
  return $result;
}

function has_key_and_true($key, $hash_obj) {
  return (array_key_exists($key, $hash_obj) && $hash_obj[$key]);
}

function check_if_issuer($user) {
  if (has_key_and_true('edit_posts', $user->allcaps) &&
      has_key_and_true('edit_published_posts', $user->allcaps) &&
      has_key_and_true('publish_posts', $user->allcaps) && 
      has_key_and_true('edit_pages', $user->allcaps) &&
      has_key_and_true('edit_others_pages', $user->allcaps) &&
      has_key_and_true('edit_published_pages', $user->allcaps) &&
      has_key_and_true('moderate_comments', $user->allcaps) ) {
    return true;
  } else {
    return false;
  }
}

function js_localize_data($array_data) {
  $js_data = array(
    'mdv'		=> "2.0",
    'ajaxTimeout'           => 30000,
      'addStyle'              => "", 
      'txtSubmit'             => __('Submit', ns_()),
      'txtPleaseAnswer'       => __('Please Answer', ns_()),
      'txtFormDesignerTitle'  => __('Form Designer', ns_()),
      'txtFormSampleTitle'    => __('Form Sample', ns_()),
      'txtAddItem'            => __('Add Item', ns_()),
      'txtShowSample'         => __('Show Sample', ns_()),
      'txtAnswerCommitted'    => __('Successfully Committed!', ns_()),
      'txtServerError'        => __('Server Error!', ns_()),
      'txtIsPublic'           => __('Is public questionnaire?', ns_()),
      'txtYourName'           => __('Your Name', ns_()),
      'txtYourMailAddress'    => __('Your EMail Address', ns_()),
      'txtIdentityLabel'      => __('Please identify yourself', ns_()),
      'txtAnswerCount'        => __('Current count of Answers: ', ns_()),
      'txtClearAnswers'       => __('Delete all answers', ns_()),
      'txtThankYou'           => __('Thank you for answering!', ns_()),
      'txtOK'                 => __('Dismiss', ns_()),
      'txtSave'               => __('Save', ns_()),
      'txtRequestError'      => __('Request returned with error: ', ns_()),
      'txtRequireCheckError' => __('Required field is empty', ns_()),
      'txtNameAndEmailRequest' => __('Please specify your name and e-mail address.', ns_()),
      'txtNameRequest'		=> __('Please specify your name.', ns_()),
      'txtEmailRequest'		=> __('Please specify your e-mail address.', ns_())
  );
  
  return array_merge($js_data, $array_data);
}

function get_qstnr_meta($post) {
  if ($post->__isset(POSTMETA_METAJSON)) {
    $jsonstr = $post->__get(POSTMETA_METAJSON);
    $jsonstr = str_replace('&lt;', '&amp;lt;', $jsonstr);
    $jsonstr = str_replace('&gt;', '&amp;gt;', $jsonstr);
  } else {
    // may be version-1 exist.
    $jsonstr = "";
  }

  return $jsonstr;
}

function get_answer_data($postid, $userid) {
  $frmcomments = query_comments($postid, array( 'author__in' => array($userid) ));

  if (count($frmcomments) > 0) {
    $frmvalue = $frmcomments[0]->comment_content;
    $frmvalue_array = json_decode($frmvalue, true);
    $frmvalue_array['answer_date'] = $frmcomments[0]->comment_date;
    return json_encode($frmvalue_array, JSON_UNESCAPED_UNICODE);
  } else {
    $frmvalue = "[]";
  }

  return $frmvalue;
}

function the_questionnaire_form($post) {

  if (array_key_exists(GLOBAL_KEY_HAS_QUESTIONNAIRE, $GLOBALS) && $GLOBALS[GLOBAL_KEY_HAS_QUESTIONNAIRE] == 1) {
    return "";
  }

  wp_enqueue_script('json2', includes_url('js/json2.js'));
  wp_enqueue_script('underscore', includes_url('js/underscore.min.js'));
  wp_enqueue_script('backbone', includes_url('js/backbone.min.js'));

  $current_user = wp_get_current_user();
  if ($current_user->ID !== 0) {
    $isloggedin = true;
    $ispublic = false;
  } else {
    $isloggedin = false;
  }

  $jsonstr = get_qstnr_meta($post);
  $meta_array = json_decode($jsonstr, true);

  if ($meta_array['disappear_after_answer']) {
    $args = array(
      'postid' => $post->ID,
	'userid' => $current_user->ID,
	'meta' => $meta_array,
	'author' => $_COOKIE['comment_author_' . COOKIEHASH],
	'email' => $_COOKIE['comment_author_email_' . COOKIEHASH],
	'remoteaddr' => $_SERVER['REMOTE_ADDR'],
	'useragent' => $_SERVER['HTTP_USER_AGENT']
    );

    $comment_id = get_unique_comment_id_from_condition($args);

    if ($comment_id != NULL) {
      return $meta_array['form_alternative_content_answered'];
    }
  }
  
  if ($meta_array['disappear_after_timeout']) {
    $tz = new \DateTimeZone(get_option('timezone_string'));
    $expire_timeout_value = new \DateTime($meta_array['form_expire_datetime'], $tz);
    $now = new \DateTime("now", $tz);
    if ($expire_timeout_value->diff( $now )  ->invert === 0) {
      return $meta_array['form_alternative_content_expired'];
    }
  }

  if ($meta_array['isPublic'] === TRUE) {
    $ispublic = true;
  } else {
    $ispublic = false;
  }

  $frmvalue = get_answer_data($post->ID, $current_user->ID);

  $cookie_data_for_js = issue_cookie($post->ID, $jsonstr);
  
  $jsdata = js_localize_data(array( 
    'postid' => $post->ID,
      'isissuer' => check_if_issuer($current_user),
      'ispublic' => $ispublic,
      'showForm' => 1, 
      'addStyle' => ".qstnr-answersheet > form:after{content:'Producend By Questionnaire plugin developed by Microgadget,inc.'; font-size: 9px;margin-top:2em;line-height:1.5em;text-height:1.5em;white-space:pre;display:block;color:gray;} " . ($meta_array['usefss'] === TRUE ? str_replace('&plus;', '+', urldecode($meta_array['fss'])) : ""),
      'admin_ajax_url' => admin_url('admin-ajax.php'),
      'nonce' => wp_create_nonce(QUESTIONNAIRE_NONCE . $post->ID),
      'cookie_data_for_js' => $cookie_data_for_js
  ));

  qstnr_process_css($jsdata);

  $html = "";
  if ( $isloggedin || $ispublic ) {
    
    $GLOBALS[GLOBAL_KEY_HAS_QUESTIONNAIRE] = 1;
  
    actform_enqueue_resources();
    $html = actform_ne($jsdata, array(
      'unique_cookie' => ($isloggedin ? false : $meta_array['unique_cookie']),
      'unique_name' => ($isloggedin ? false : $meta_array['unique_name']),
	'unique_email' => ($isloggedin ? false : $meta_array['unique_email']),
	'issample' => false
    ));
    wp_enqueue_script('qstnr_qst', plugins_url('qst.js', __FILE__));
    wp_localize_script('qstnr_qst', 'qstnr_data', $jsdata);
  }
  return $html;
}

function the_content($content) {
  $post = $GLOBALS['post'];

  if ($post->post_type === POSTTYPE &&
    $GLOBALS['wp_query']->post_count === 1) {

    $content = $content . the_questionnaire_form($post);
  }

  return $content;
}

/**
 * retrieve json data from RESTful client
 */
function received_json() {
  return json_decode(file_get_contents("php://input"));
}

/**
 * retrieve data from RESTful client
 */
function received_data() {
  return file_get_contents("php://input");
}

/**
 * duplicate action
 * will be invoked from 'Duplicate Post' plugin.
 */
function questionnaire_copy_questionnaire($new_post_id, $old_post_object) {
  // copy ansswer data.
  $answers = query_comments($old_post_object->ID, array());

  do_output_debug($answers);
  
  foreach ($answers as $answer) {
    $answer->comment_post_ID = $new_post_id;
    wp_insert_comment((array) $answer);
  }
}

