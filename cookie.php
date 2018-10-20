<?php
namespace questionnaire;
define(__NAMESPACE__ . '\COOKIE_VISITOR_KEY', 'qstnr_visitor_key');
define(__NAMESPACE__ . '\DEFAULT_COOKIE_TIMEOUT', 60 * 60 * 24 * 30);

/*
 * cookie.php
 */

function initialize_cookie() {

}

function calculate_timeout($meta_array) {
  return ((($meta_array['cookie_expire_months'] * 30 + $meta_array['cookie_expire_days']) * 24 + $meta_array['cookie_expire_hours']) * 60 + $meta_array['cookie_expire_mins']) * 60;
}

function cookie_visitor_key($postid) {
  return COOKIE_VISITOR_KEY . '_' . $postid . '_' . COOKIEHASH;
}

function issue_cookie($postid, $metajson) {
  $meta_array = json_decode($metajson, true);
  if ($meta_array['unique_cookie']) {
    if (! $meta_array['unique_cookie_exipire']) {
      $meta_array['unique_cookie_exipire'] = DEFAULT_COOKIE_TIMEOUT;
    }
    $expire_time = $_SERVER['REQUEST_TIME'] + calculate_timeout($meta_array);
    $cookie_key = cookie_visitor_key($postid);
    if (! array_key_exists($cookie_key, $_COOKIE) || ! $_COOKIE[$cookie_key]) {
      $key = $_SERVER['REMOTE_ADDR'] . $_SERVER['REQUEST_TIME'] . random_int(0, 9999999);
      $result = @ setcookie($cookie_key, $key, $expire_time, COOKIEPATH, COOKIE_DOMAIN);
      return array(
	'cookie_key' => $cookie_key,
	  'key' => $key,
	  'expire_time' => $expire_time,
	  'cookie_path' => COOKIEPATH,
	  'cookie_domain' => COOKIE_DOMAIN
      );
    }
  } else {
  }
  return array();
}

