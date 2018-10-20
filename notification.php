<?php

namespace questionnaire;

function initialize_notification() {
  add_ns_filter('pre_option_comments_notify', 'checkif_comments_notify', 10, 1);
  add_ns_filter('pre_option_moderation_notify', 'checkif_moderation_notify', 10, 1);
  add_ns_filter('default_option_comments_notify', 'checkif_comments_notify', 10, 1);
  add_ns_filter('default_option_moderation_notify', 'checkif_moderation_notify', 10, 1);
  add_ns_filter('option_comments_notify', 'checkif_comments_notify', 10, 1);
  add_ns_filter('option_moderation_notify', 'checkif_moderation_notify', 10, 1);
  add_ns_filter('pre_comment_approved', 'approve_if_formanswer', 10, 2);
  add_ns_filter('comment_notification_notify_author', 'filter_notification_notify_author', 10, 2);
  add_ns_filter('comment_notification_text', 'filter_notification_text', 10, 2);
  add_ns_filter('comment_notification_subject', 'filter_notification_subject', 10, 2);
  add_ns_filter('questionnaire_add_inline_style', 'filter_add_inline_style', 10);
  
//  add_ns_filter('questionnaire_add_inline_style', 'filter_add_inline_style2', 20);
//  add_ns_filter('comment_notification_recipients', 'filter_recipients');
//  add_ns_filter('comment_notification_headers', 'filter_notification_headers');
//  add_ns_filter('edit_comment', 'filter_edit_comment');
}

function is_involved(&$postmeta = NULL) {
  if (array_key_exists('postid', $_GET)) {
    if (array_key_exists(GLOBAL_KEY_POSTMETA, $GLOBALS)) {
      $postmeta = $GLOBALS[GLOBAL_KEY_POSTMETA];
      return true;
    }
  }
  return false;
}

function checkif_comments_notify($default) {
  $postmeta = NULL;
  if (is_involved($postmeta)) {
    if ($postmeta['notifyflag'] === true) {
      return true;
    } else {
      return false;
    }
  }
  return $default;
}

function checkif_moderation_notify($default) {
  $postmeta = NULL;
  if (is_involved($postmeta)) {
    if ($postmeta['notifyflag'] === true) {
      return true;
    } else {
      return false;
    }
  }
  return $default;
}

function approve_if_formanswer($approved, $commentdata = null) {
  $postmeta = NULL;
  if (is_involved($postmeta)) {
    return true;
  }
  return $approved;
}

function filter_notification_notify_author($default, $comment_id = 0) {
  $postmeta = NULL;
  if (is_involved($postmeta)) {
    if ($postmeta['notifyflag'] === true) {
      return true;
    }
  }
  return $default;
}

function filter_recipients() {
  $postmeta = NULL;
  if (is_involved()) {
  }
}

function filter_notification_text($notify_message, $comment_id = 0) {
  $postmeta = NULL;
  if (is_involved($postmeta)) {

    $blogname = wp_specialchars_decode(get_option('blogname'), ENT_QUOTES);
    $comment = get_comment( $comment_id );
    if ( empty( $comment ) ) {
      return false;
    }

    $post    = get_post( $comment->comment_post_ID );
    
    $indent = "        ";
    try {
      $translated = "";
      $formanswer_array = json_decode($comment->comment_content, true);
      foreach ($formanswer_array['itemlist'] as $item) {
	$translated .= "[ " . $item['title'] . "]\r\n";
	if ($item['type'] === 'text') {
	  $translated .= $indent . "'" . $item['value'] . "'\r\n";
	} else {
	  foreach ($item['selections'] as $index => $value) {
	    $translated .= $indent . $value . " : ";
	    if ($item['selected'][$item['selectedname'][$index]] === true) {
	      $translated .= "\r\n" . $indent . $indent . "o" . "\r\n";
	    } else {
	      $translated .= "\r\n" . $indent . $indent . "_" . "\r\n";
	    }
	  }
	}
      }

      $new_notify_message  = sprintf( __( 'New answer on your questionnaire "%s"', ns_() ), $post->post_title ) . "\r\n";
      /* translators: 1: comment author, 2: author IP, 3: author domain */
      $new_notify_message .= sprintf( __( 'Author: %1$s (IP: %2$s, %3$s)' ), $comment->comment_author, $comment->comment_author_IP, $comment_author_domain ) . "\r\n";
      $new_notify_message .= sprintf( __( 'E-mail: %s' ), $comment->comment_author_email ) . "\r\n";
      $new_notify_message .= sprintf( __( 'URL: %s' ), $comment->comment_author_url ) . "\r\n";
      $new_notify_message .= sprintf( __( 'Whois: %s' ), "http://whois.arin.net/rest/ip/{$comment->comment_author_IP}" ) . "\r\n";
      $new_notify_message .= sprintf( __('Answer: %s' ), "\r\n" . $translated ) . "\r\n\r\n";
      return $new_notify_message;
    } catch (Exception $e) {

    }
  }
  return $notify_message;
}

function filter_notification_subject($subject, $comment_id = 0) {
  $postmeta = NULL;
  if (is_involved($postmeta)) {
    $blogname = wp_specialchars_decode(get_option('blogname'), ENT_QUOTES);
    $comment = get_comment( $comment_id );
    if ( empty( $comment ) ) {

      return false;
    }

    $post    = get_post( $comment->comment_post_ID );
    $new_subject = sprintf( __('[%1$s] Answer: "%2$s"', ns_()), $blogname, $post->post_title );
  }
  return $subject;
}

function filter_notification_headers() {
  $postmeta = NULL;
  if (is_involved()) {
  }
}

function filter_edit_comment() {
  $postmeta = NULL;
  if (is_involved()) {
  }
}

function filter_add_inline_style($style) {
  return $style . "/* */ .qstnr-answersheet > form:after{content:'Producend By Questionnaire plugin developed by Microgadget,inc.'; font-size: 9px;margin-top:2em;line-height:1.5em;text-height:1.5em;white-space:pre;display:block;color:gray;} ";
}

