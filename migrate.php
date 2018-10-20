<?php
namespace questionnaire;

/** v1 metadata sample ****
[{"name":"select","value":"LBL"},{"name":"text","value":" どのタイプの豆腐がお好きですか？"},{"name":"select","value":"RAD"},{"name":"text","value":" 絹ごし"},{"name":"select","value":"RAD"},{"name":"text","value":" 木綿"},{"name":"select","value":"RAD"},{"name":"text","value":" その他"},{"name":"select","value":"LBL"},{"name":"text","value":" その他の場合、よろしければ具体的な種別をご記入ください"},{"name":"select","value":"TEXT"},{"name":"text","value":"豆腐の種類等 "},{"name":"select","value":"LBL"},{"name":"text","value":" 普段豆腐を購入する場所をお教えください"},{"name":"select","value":"CHK"},{"name":"text","value":" スーパーマーケット"},{"name":"select","value":"CHK"},{"name":"text","value":" 豆腐専門店の店頭"},{"name":"select","value":"CHK"},{"name":"text","value":" 豆腐カー"}]
 ***/

/** v1 answer sample ***
[{\"name\":\"radio_1\",\"value\":\"1\"},{\"name\":\"message_2\",\"value\":\"田舎豆腐\"},{\"name\":\"check_3\",\"value\":\"1\"},{\"name\":\"check_3\",\"value\":\"2\"}]
 ***/

/** v2 meta sample ***
*/

/** v2 answer sample ***

'{\"itemlist\":[{\"name\":\"item_1\",\"type\":\"radio\",\"title\":\"どの種類の豆腐がお好きですか？\",\"selections\":[\"絹ごし\",\"木綿\",\"その他\"],\"selected\":{\"radio_selected_0\":false,\"radio_selected_1\":true,\"radio_selected_2\":false},\"selectedname\":[\"radio_selected_0\",\"radio_selected_1\",\"radio_selected_2\"]},{\"name\":\"item_2\",\"type\":\"text\",\"title\":\"問1で「その他」と答え>た方、よろしければ種類を記入ください。\",\"text\":\"豆腐の種類\",\"value\":\"田舎豆腐\",\"selections\":[],\"selected\":{},\"selectedname\":[]},{\"name\":\"item_3\",\"type\":\"check\",\"title\":\"普段どんな場所で豆腐を購入していますか？\",\"selections\":[\"スーパーマーケット\",\"豆腐屋、>豆腐専門店等の店舗\",\"豆腐カー、豆腐移動販売\",\"その他\"],\"selected\":{\"check_selected_0\":false,\"check_selected_1\":true,\"check_selected_2\":true,\"check_selected_3\":false},\"selectedname\":[\"check_selected_0\",\"check_selected_1\",\"check_selected_2\",\"check_selected_3\"]}],\"author\":\"test2\",\"email\":\"test2@test.com\"}'

*/

function convert_formmeta_from_v1($postid, $v1_array) {

  $ispublic_v1 = get_post_meta($postid, 'questionnaire_ispublic', true);
  $formmeta_array = array();
  $formmeta_array['viewtype'] = 1;
  $formmeta_array['isPublic'] = ($ispublic_v1 === "on" ? true : false);
  $formmeta_array['usefss'] = false;
  $formmeta_array['fss'] = "";
  $formmeta_array['notifyflag'] = false;
  $items = array();

  $itementry = NULL;
  foreach ($v1_array as $v1_item) {
    if ($v1_item['name'] === 'select') {
      if ($itementry !== NULL) {
	array_push($items, $itementry);
      }
      $itementry = array();
      switch ($v1_item['value']) {
	case 'LBL':
	  $itementry['type'] = 'label';
	  break;
	case 'RAD':
	  $itementry['type'] = 'radio';
	  break;
	case 'CHK':
	  $itementry['type'] = 'check';
	  break;
	case 'OPT':
	  $itementry['type'] = 'option';
	  break;
	case 'TEXT':
	  $itementry['type'] = 'text';
	  break;
	default:
	  // wrong data;
	  break;
      }
    } else if ($v1_item['name'] === 'text') {
      $itementry['text'] = $v1_item['value'];
    } else {
      // wrong data;
    }
  }
  
  if ($itementry !== NULL) {
    array_push($items, $itementry);
  }

  $formmeta_array['items'] = $items;
  return $formmeta_array;
}

function meta_to_answer($formmeta) {
  $answer_array = array();
  $itemlist = array();
  $itemindex = 1;
  $item = NULL;
  $selectindex = 0;
  foreach ($formmeta['items'] as $metaitem) {
    switch ($metaitem['type']) {
      case 'label':
	if ($item !== NULL) {
	  array_push($itemlist, $item);
	}
	$item = array();
	$item['name'] = 'item_' . $itemindex;
	$item['title'] = $metaitem['text'];
	$item['type'] = NULL;
	$item['selections'] = array();
	$item['selected'] = array();
	$item['selectedname'] = array();
	$itemindex ++;
	break;
      case 'text':
	$item['type'] = 'text';
	$item['text'] = $metaitem['text'];
	$item['value'] = '';
	break;
      case 'radio':
	if ($item['type'] === NULL) {
	  $item['type'] = 'radio';
	  $selectindex = 0;
	}
	$selectedname = 'radio_selected_' . $selectindex;
	array_push($item['selections'], $metaitem['text']);
	$item['selected'][$selectedname] = false;
	array_push($item['selectedname'], $selectedname);
	$selectindex++;
	break;
      case 'check':
	if ($item['type'] === NULL) {
	  $item['type'] = 'check';
	  $selectindex = 0;
	}
	$selectedname = 'check_selected_' . $selectindex;
	array_push($item['selections'], $metaitem['text']);
	$item['selected'][$selectedname] = false;
	array_push($item['selectedname'], $selectedname);
	$selectindex++;
	break;
      case 'option':
	if ($item['type'] === NULL) {
	  $item['type'] = 'option';
	  $selectindex = 0;
	}
	$selectedname = 'option_selected_' . $selectindex;
	array_push($item['selections'], $metaitem['text']);
	$item['selected'][$selectedname] = false;
	array_push($item['selectedname'], $selectedname);
	$selectindex++;
	break;
      default:
	break;
    }
  }
  if ($item !== NULL) {
    array_push($itemlist, $item);
  }

  
  $answer_array['itemlist'] = $itemlist;
  return $answer_array;
}

function convert_answer_from_v1($formmeta, $v1_answer, $comment_author, $comment_email) {
  $answer_array = meta_to_answer($formmeta);

  $answer_array['author'] = $comment_author;
  $answer_array['email'] = $comment_email;

  //
  foreach ($v1_answer as $v1_item) {
    // source is 1 origin
    $ctrlidx = intval(preg_replace('/[a-zA-Z]+_/', '', $v1_item['name'])) - 1;

    if ($answer_array['itemlist'][$ctrlidx]['type'] === 'text') {
      $answer_array['itemlist'][$ctrlidx]['value'] = $v1_item['value'];
    } else {
      // source is 0 origin
      $selectedidx = intval($v1_item['value']);
      $selectedkey = $answer_array['itemlist'][$ctrlidx]['selectedname'][$selectedidx];
      $answer_array['itemlist'][$ctrlidx]['selected'][$selectedkey] = true;
    }
  }
  return $answer_array;
}

function get_qstnr_ver1_form_meta($postid) {
  $formmeta_v1 = get_post_meta($postid, POSTMETA_METAJSON_VER1, true);
  if ($formmeta_v1 === "") {
    return "";
  }
  $formmeta_v1_array = json_decode($formmeta_v1, true);

  $formmeta_array = convert_formmeta_from_v1($postid, $formmeta_v1_array);

  if (count($formmeta_array) === 0) {
    return "";
  }
  return json_encode($formmeta_array, JSON_UNESCAPED_UNICODE);
}

function query_ver1_comments($postid, $args) {
  clear_comment_filter();
  $query_params = array_merge(array('post_id' => $postid, 'type' => COMMENTTYPE_VER1), $args);

  $result =  get_comments($query_params);
  set_comment_filter();
  return $result;
}

function get_ver1_answer_data($postid, $userid) {
  $ver1_answer = query_ver1_comments($postid, array( 'author__in' => array($userid) ));
  $ansvalue = "[]";
  if (count($ver1_answer) > 0) {
    $ver1_answer_array = json_decode($ver1_answer[0]->comment_content, true);
    $formmeta_v1 = get_post_meta($postid, POSTMETA_METAJSON_VER1, true);
    if ($formmeta !== "") {
      $formmeta_v1_array = json_decode($formmeta_v1, true);
      $formmeta_array = convert_formmeta_from_v1($postid, $formmeta_v1_array);
      $answer_array = convert_answer_from_v1($formmeta_array, $ver1_answer_array, $ver1_answer[0]->comment_author, $ver1_answer[0]->comment_email);
      $ansvalue = json_encode($answer_array, JSON_UNESCAPED_UNICODE);
    }
  }
  return $ansvalue;
}

function auto_migrate_data($postid) {
  // convert meta data
  $formmeta_v1 = get_post_meta($postid, POSTMETA_METAJSON_VER1, true);
  if ($formmeta_v1 !== "") {
    $v1_array = json_decode($formmeta_v1, true);
    $formmeta_array = convert_formmeta_from_v1($postid, $v1_array);
    $formmeta = json_encode($formmeta_array, JSON_UNESCAPED_UNICODE);
    update_post_meta($postid, POSTMETA_METAJSON, $formmeta);
    // convert answer data
    $answerlist = query_ver1_comments($postid, array());
    foreach ($answerlist as $answeritem) {

      $v1_answer_array = json_decode($answeritem->comment_content, true);
      $v1_user = $answeritem->comment_author === NULL ? "" : $answeritem->comment_author;
      $v1_email = $answeritem->comment_author_email === NULL ? "" : $answeritem->comment_author_email;
      $newanswer_array = convert_answer_from_v1($formmeta_array, $v1_answer_array, $v1_user, $v1_email);
      $answer_credential = array(
	'post_id' => $postid,
	  'author_email' => $v1_email,
	  'author__in' => array( $v1_user ),
	  'type' => COMMENTTYPE,
	  'user_id' => $answeritem->user_id,
	  'count' => true,
      );
      try {
	if (get_comments($answer_credential) === "0") {
	  $newanswer_commentdata = array(
	    'comment_post_ID' => $postid,
	      'comment_author' => $v1_user,
	      'comment_email' => $v1_email,
	      'comment_type' => COMMENTTYPE,
	      'comment_parent' => 0,
	      'user_id' => $answeritem->user_id,
	      'comment_author_IP' => $answeritem->comment_author_IP,
	      'comment_agent' => $answeritem->comment_agent,
	      'comment_date' => $answeritem->comment_date,
	      //
	      'comment_author_url' => $answeritem->comment_author_url,
	      'comment_content' => json_encode($newanswer_array, JSON_UNESCAPED_UNICODE),
	      'comment_parent' => 0,
	      'comment_date_gmt' => $answeritem->comment_date_gmt,
	  );
	  
	  wp_insert_comment($newanswer_commentdata);
	}
      } catch (Exception $e) {
      }
    }
    return $formmeta;
  }
  return "";
}
