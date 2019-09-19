<?php
namespace questionnaire;

define(__NAMESPACE__ . '\ACTION_PROC_ANSWER', 'qstnr_proc_answer');

function initialize_actform()
{

    add_ns_action('wp_ajax_qstnr_questionnaire', 'ajax_questionnaire');

    add_ns_action('wp_ajax_nopriv_qstnr_questionnaire', 'ajax_questionnaire');

    add_ns_action(ACTION_PROC_ANSWER, 'action_save_answer_comment');

    add_ns_action('comment_flood_trigger', 'action_flood_comment');

}

function get_user_booking_by_hash($user_id, $booking_hash)
{
    if(!$booking_hash) {
        return [];
    }

    global $wpdb;

    $datetime_today = new \DateTime();
    $date_today = $datetime_today->format('Y-m-d');

    //get bookings data
    $table_name = $wpdb->prefix . 'cb_bookings';
    $select_statement = "SELECT * FROM " . $table_name . " WHERE user_id = %d " .
                      "AND hash = '%s' ".
                      "AND date_end <= '".$date_today."' ".
                      "AND status = 'confirmed';";

    $prepared_statement = $wpdb->prepare($select_statement, $user_id, $booking_hash);

    $bookings_result = $wpdb->get_results($prepared_statement);

    return $bookings_result;
}

function get_booking_by_hash($booking_hash)
{
    global $wpdb;

    $datetime_today = new \DateTime();
    $date_today = $datetime_today->format('Y-m-d');

    //get bookings data
    $table_name = $wpdb->prefix . 'cb_bookings';
    $select_statement = "SELECT * FROM " . $table_name . " " .
                      "WHERE hash = '%s' ".
                      "AND date_end <= '".$date_today."' ".
                      "AND status = 'confirmed';";

    $prepared_statement = $wpdb->prepare($select_statement, $booking_hash);

    $bookings_result = $wpdb->get_results($prepared_statement);

    return $bookings_result;
}

function ajax_questionnaire()
{

    if (! wp_verify_nonce($_GET['nonce'], QUESTIONNAIRE_NONCE . $_GET['postid']) ) {
        status_header(SC_BADREQUEST);
        echo json_encode(array('success' => false), JSON_UNESCAPED_UNICODE);
        die();
    }
    $postid = $_GET['postid'];
    $remoteaddr = $_SERVER['REMOTE_ADDR'];
    $useragent = $_SERVER['HTTP_USER_AGENT'];
    $user = wp_get_current_user();
    $userid = $user->ID;

    $method = $_SERVER['REQUEST_METHOD'];

    status_header(SC_OK);

    if ($method === 'GET') {
        if ($userid !== 0) {
            $frmvalue = get_answer_data($postid, $userid);
        } else {
            $frmvalue = "[]";
        }
        echo $frmvalue;
    } else if ($method === 'POST' || $method === 'PUT') {
        $metajson = get_post_meta($postid, POSTMETA_METAJSON, true);
        $meta_array = json_decode($metajson, true);

        $formdata = received_data();
        $formdata_array = json_decode($formdata, true);

        if ($userid !== 0) {
            $author = $user->user_login;
            $email = '';
        } else {
            $author = $formdata_array['author'];
            $email = $formdata_array['email'];
        }

        $booking = sanitize_text_field($_GET['booking']);

        if ($userid === 0) {
            // check required fields.
            if ($meta_array['unique_cookie'] === true) {
                $cookie_key = cookie_visitor_key($postid);
                $cookie_unique_key = "";
                if (array_key_exists($cookie_key, $_COOKIE)) {
                     $cookie_unique_key = $_COOKIE[$cookie_key];
                }
                if (strlen($cookie_unique_key) === 0) {
                    echo json_encode(array('success' => false, 'msg' => __('Cookie timeout has expired. Please reload this page and issue answer again.', ns_())), JSON_UNESCAPED_UNICODE);
                    die();
                }
            } else {
                if ($meta_array['unique_email'] === true && trim($email) === '' 
                    || $meta_array['unique_name'] === true && trim($author) === ''
                ) {
                    echo json_encode(array('success' => false, 'msg' => __('Required field is empty', ns_())), JSON_UNESCAPED_UNICODE);
                    die();
                }
                $expire_time = 24 * 60 * 60 * 365 + $_SERVER['REQUEST_TIME'];
                if ($meta_array['unique_email']) {
                    setcookie('comment_author_email_' . COOKIEHASH, trim($email), $expire_time, COOKIEPATH, COOKIE_DOMAIN);
                }
                if ($meta_array['unique_name']) {
                    setcookie('comment_author_' . COOKIEHASH, trim($author), $expire_time, COOKIEPATH, COOKIE_DOMAIN);
                }
            }
        }
        else {

            //check if booking is valid (belongs to user)
            $user_booking_results = get_user_booking_by_hash($userid, $booking);

            if(count($user_booking_results) == 0) {
                echo json_encode(array('success' => false, 'msg' => 'No booking found.')); //TODO: translate
                die();
            }

        }

        if ($meta_array['disappear_after_timeout']) {
            $expire_timeout_value = new \DateTime($meta_array['form_expire_datetime']);
            $now = new \DateTime();
            if ($expire_timeout_value->diff($now)  ->invert === 0) {
                echo json_encode(array('success' => false, 'msg' => __('Timeout has already expired.', ns_())), JSON_UNESCAPED_UNICODE);
                die();
            }
        }
        do_action(
            ACTION_PROC_ANSWER,
            array(
            'postid' => $postid,
            'remoteaddr' => $remoteaddr,
            'useragent' => $useragent,
            'userid' => $userid,
            'author' => $author,
            'email' => $email,
            'url' => 'http://'.$booking, //for booking uniqueness check
            'meta' => $meta_array,
            'formdata' => $formdata)
        );
    }

    die();
}

function get_unique_comment_id_from_condition(&$args)
{
    $postid = $args['postid'];

    $meta_array = $args['meta'];
    $comments_query = array();

    $comments_query['author_url'] = $args['url'];  //for booking uniqueness check

    if ($args['userid'] !== 0) {
        $comments_query['user_id'] = $args['userid'];

    } else {

        if ($meta_array['unique_cookie'] === true) {
            $cookie_key = cookie_visitor_key($postid);
            $cookie_unique_key = "";
            if (array_key_exists($cookie_key, $_COOKIE)) {
                $cookie_unique_key = $_COOKIE[$cookie_key];
            }
            $args['email'] = 'hash_' . str_replace(':', 'col', $cookie_unique_key) . '@fake.fake';
            $comments_query['author_email'] = $args['email'];
        } else {
            if ($meta_array['unique_name'] === true) {
                $comments_query['author__in'] = $args['author'];
            }
            if ($meta_array['unique_email'] === true) {
                $comments_query['author_email'] = $args['email'];
            }
            if ($meta_array['unique_ip'] === true) {
                $comments_query['comment_author_IP'] = $args['remoteaddr'];
            }
            if ($meta_array['unique_browser'] === true) {
                $comments_query['comment_agent'] = $args['useragent'];
            }

            //we use booking hash in $comments_query['author_url'] for identification
            /*
            // fake mail address if needed
            // for avoid miss dicision of comments flood.
            if ($args['email'] == null || $args['email'] === '') {
                $args['email'] = 'hash_' . hash('md5', $args['remoteaddr'] . $args['useragent']) . '@fake.fake';
            }
            */
        }
    }

    $comment_id = null;
    if (count($comments_query) > 0) {
        $comment_id = get_unique_comment_id($postid, $comments_query);
    }
    return $comment_id;
}

function action_save_answer_comment($args)
{
    $postid = $args['postid'];

    $comment_id = get_unique_comment_id_from_condition($args);

    // for notification knows it is in our context.
    $GLOBALS[GLOBAL_KEY_POSTMETA] = $args['meta'];

    if ($comment_id === null) {
        $err = wp_new_comment(
            array(
            'comment_post_ID' => $args['postid'],
            'comment_author' => $args['author'],
            'comment_author_email' => $args['email'],
            'comment_author_url' => $args['url'],
            'comment_content' => $args['formdata'],
            'comment_type' => COMMENTTYPE,
            'comment_parent' => 0,
            'user_id' => $args['userid'],
            'comment_author_IP' => $args['remoteaddr'],
            'comment_agent' => $args['useragent'],
            )
        );

    } else {
        if ($args['meta']['disappear_after_answer']) {
            echo json_encode(array('success' => false, 'msg' => __('You have already answered to this questionnaire.', ns_())), JSON_UNESCAPED_UNICODE);
            return;
        } else {
            $err = wp_update_comment(
                array(
                'comment_ID' => $comment_id,
                'comment_post_ID' => $postid,
                'comment_content' => $args['formdata'],
                'comment_author_IP' => $args['remoteaddr'],
                'comment_agent' => $args['useragent'],
                'comment_author_email' => $args['email'],
                )
            );
        }
    }
    $transit = [];
    if (strstr($args['meta']['ack_type'], 'transit')) {
        $transit = process_transit($args['meta'], $args['formdata']);
    }
    $message = __('Thank you for answering!', ns_());
    if ($args['meta']['use_action_setting']) {
        $message = $args['meta']['ack_text'];
    }
    echo json_encode(
        array(
        'success' => true,
        'msg' => $message,
        'transit' => $transit),
        JSON_UNESCAPED_UNICODE
    );
}

/**
 */
function actform_enqueue_resources()
{
    wp_enqueue_script('qstnr_metaform', plugins_url('metaform.js', __FILE__));
    wp_enqueue_script('qstnr_actform', plugins_url('actform.js', __FILE__));
    wp_enqueue_script('qstnr_cssutil', plugins_url('cssutil.js', __FILE__));
    wp_enqueue_script('qstnr_dependency', plugins_url('dependency.js', __FILE__));
    wp_enqueue_script('qstnr_jquery_cookie_js', plugins_url('jquery.cookie.js', __FILE__));
    $depstyles = apply_filters('qstnr_pre_formstyle', array());
    wp_enqueue_style('qstnr_formcomposer_style', plugins_url('style.css', __FILE__), $depstyles);
    wp_enqueue_style('qstnr_icomoon_style', plugins_url('icomoon/style.css', __FILE__));
    wp_enqueue_script('qstnr_jquery_ui_js', plugins_url('jquery-ui.min.js', __FILE__));
    wp_enqueue_style('qstnr_jquery_ui_style', plugins_url('jquery-ui.min.css', __FILE__));
}

/*
 * questionnaire form display.
 */
function actform($jsdata, $options)
{

    wp_add_inline_style('qstnr_formcomposer_style', $jsdata['addStyle']);
    ?>
  <script type="text/template" id="qstnr-template-answersheet-after">
    <div class="qstnr-submitinfo">
      <% if (unique_name || unique_email) { %>
      <div class="qstnr-authorinfo">
    <?php if ($options['issample']) : ?>
      <hr class="qstnr-authinfo">
    <?php endif ?>
    <fieldset class="qstnr-authorinfo">
      <% if (unique_name && unique_email) { %>
      <legend><?php echo __('Please specify your name and e-mail address.', ns_()) ?></legend>
      <% } else if (unique_name) { %>
      <legend><?php echo __('Please specify your name.', ns_()) ?></legend>
      <% } else if (unique_email) { %>
      <legend><?php echo __('Please specify your e-mail address.', ns_()) ?></legend>
      <% } %>
      <table>
        <% if (unique_name) { %>
        <tr>
          <td>
        <span class="qstnr-publiclabel"><?php echo __('Your Name', ns_()) ?></span>
          </td>
          <td>
        <input required type="text" class="qstnr-publicname" name="qstnr-name" id="qstnr-name" maxlength="64">
          </td>
        </tr>
        <% } %>
        <% if (unique_email) { %>
        <tr>
          <td>
        <span class="qstnr-publiclabel"><?php echo __('Your EMail Address', ns_()) ?></span>
          </td>
          <td>
        <input required type="email" class="qstnr-publicmail" name="qstnr-email" id="qstnr-email">
          </td>
        </tr>
        <% } %>
      </table>
    </fieldset>
      </div>
      <% } %>
      <button type="button" id="qstnr-submit"><%= submit_text ? submit_text :  "<?php echo __('Submit', ns_()) ?>" %></button>
    </div>
  </script>
  <script type="text/template" id="qstnr-template-datetime">
    <% if (item.year || item.month || item.day) { %>
    <table class="qstnr-dateinput">
      <thead>
    <th>
    <?php echo __('Date [ ', ns_()) ?>
      <% if (item.year) { %>
    <?php echo __('Year', ns_()) ?>
      <% } %>
      <% if (item.month) { %>
    <?php echo __(' Month', ns_()) ?>
      <% } %>
      <% if (item.day) { %>
    <?php echo __(' Day', ns_()) ?>
      <% } %>]
    </th>
      </thead>
      <tbody>
    <tr>
      <td>
        <input type="text" class="qstnr-date">
      </td>
    </tr>
      </tbody>
    </table>
    <% } %>
    <% if (item.hour || item.min || item.sec) { %>
    <table class="qstnr-timeinput">
      <thead>
    <% if (item.hour) { %>
    <th>
    <?php echo __('Hour', ns_()) ?>
    </th>
    <% } %>
    <% if (item.min) { %>
    <th>
    <?php echo __('Min', ns_()) ?>
    </th>
    <% } %>
    <% if (item.sec) { %>
    <th>
    <?php echo __('Sec', ns_()) ?>
    </th>
    <% } %>
      </thead>
      <tbody>
    <tr>
      <% if (item.hour) { %>
      <td>
        <select class="qstnr-hour">
          <% for (var h = 0;h < 24;++h) { %>
          <option value="<%= h %>"><%= "" + (h < 10 ? "0" : "") + h %></option>
          <% } %>
        </select>
      </td>
      <% } %>
      <% if (item.min) { %>
      <td><%= item.hour ? ":" : "" %>
        <select class="qstnr-min">
          <% for (var m = 0;m < 60;++m) { %>
          <option value="<%= m %>"><%= "" + (m < 10 ? "0" : "") + m %></option>
          <% } %>
        </select>
      </td>
      <% } %>
      <% if (item.sec) { %>
      <td><%= item.min ? ":" : "" %>
        <select class="qstnr-sec">
          <% for (var s = 0;s < 60;++s) { %>
          <option value="<%= s %>"><%= "" + (s < 10 ? "0" : "") + s %></option>
          <% } %>
        </select>
      </td>
      <% } %>
    </tr>
      </tbody>
    </table>
    <% } %>
  </script>
  <div id="qstnr-actform-modal-bg" class="qstnr-modal-bg"></div>
  <div class="qstnr-answersheet<?php echo $options['issample'] ? ' qstnr-answersheet-sample' : '' ?>">
    <?php if ($options['issample']) : ?>
      <div class="qstnr-propsheet-title">
        <?php echo $jsdata['txtFormSampleTitle'] ?>
      </div>
    <?php endif; ?>
    <form id="qstnr-actform">
      <div class="qstnr-actform-bg">
    <div class="qstnr-qstlist">
    </div>
    <div class="qstnr-qstmessage"></div>
      </div>
    </form>
    <?php dialogbox($jsdata); ?>
  </div>
    <?php
}


/**
 * non-echo version
 */
function actform_ne($jsdata, $options)
{
    ob_start();
    actform($jsdata, $options);
    $html = ob_get_contents();
    ob_end_clean();
    return $html;
}

function get_unique_comment_id($postid, $conditions)
{
    global $wpdb;

    if (count($conditions) == 0) {
        return null;
    }
    $query = "select comment_ID from $wpdb->comments where comment_post_ID = %d and comment_type = %s ";
    $condition = "";
    $values = array( $postid );
    array_push($values, COMMENTTYPE);
    foreach ($conditions as $key => $value) {
        switch ($key) {
        case "author_email":
            $condition .= " and comment_author_email = %s ";
            array_push($values, $value);
            break;
        case "author__in":
            $condition .= " and comment_author = %s ";
            array_push($values, $value);
            break;
        case "comment_author_IP":
            $condition .= " and comment_author_IP = %s ";
            array_push($values, $value);
            break;
        case "comment_agent":
            $condition .= " and comment_agent = %s ";
            array_push($values, $value);
            break;
        case "user_id":
            $condition .= " and user_id = %d ";
            array_push($values, $value);
            break;
        case "author_url":
            $condition .= " and comment_author_url = %s ";
            array_push($values, $value);
            break;
        default;
            break;
        }
    }
    $query .= $condition;
    $prepared_statement = $wpdb->prepare($query, $values);
    return $wpdb->get_var($prepared_statement);
}

function action_flood_comment( $time_lastcomment = 0, $time_newcomment = 0)
{
    // check if this flood belongs to this plugin.
    if (array_key_exists(GLOBAL_KEY_POSTMETA, $GLOBALS)) {
        echo json_encode(array('success' => false, 'msg' => __('Too early committing answer after you answered before. Please wait for several minutes.', ns_())), JSON_UNESCAPED_UNICODE);

        die();
    }
}

function filter_pre_comment_author_email($email)
{
    return $email;
}
