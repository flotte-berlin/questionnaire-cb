<?php
namespace questionnaire;
/**
 *
 */
function process_transit($meta_array, $answer) {
  $answer_array = json_decode($answer, true);
  $transit_dest = array();
  if (array_key_exists('transit', $meta_array)) {
    $transit_array = $meta_array['transit'];
    foreach ($transit_array as $transit) {
      if ($transit['default']) {
	if (strlen(trim($transit['url'])) > 0) {
	  $transit_dest['url'] = trim($transit['url']);
	  $transit_dest['target'] = $transit['target'];
	  continue;
	}
      } else {
	$conditions = $transit['condition'];
	$fire = true;
	foreach ($conditions as $condition) {
	  if (array_key_exists('on', $condition)) {
	    $args = $condition['on'];
	    $target = $answer_array['itemlist'][$args[0]];
	    if ($target['selected'][$target['selectedname'][$args[1]]] !== true) {
	      $fire = false;
	    }
	  } else if (array_key_exists('match', $condition)) {
	    $args = $condition['match'];
	    $target = $answer_array['itemlist'][$args[0]]['value'];
	    if ($args[1] === "==empty" && $target === "") {
	    } else if ($args[1] === "") {
	    } else if (strstr($target, $args[1])) {
	    } else {
	      $fire = false;
	    }
	  }
	  if (! $fire ) {
	    break;
	  }
	}
	if ($fire) {
	  $transit_dest['url'] = $transit['url'];
	  $transit_dest['target'] = $transit['target'];
	  break;
	}
      }
    }
  }
  return $transit_dest;
}
