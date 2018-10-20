<?php
namespace questionnaire;

include('genanswer.php');

function initialize_metaform() {
  add_ns_action('add_meta_boxes_questionnaire', 'meta_box');
  add_ns_action('wp_ajax_qstnr_formmeta', 'ajax_formmeta');
  add_ns_action('wp_ajax_nopriv_qstnr_formmeta', 'ajax_formmeta');
  add_ns_action('wp_ajax_qstnr_querycss', 'ajax_querycss');
  add_ns_action('save_post', 'save_post');
  initialize_answerinfo();
  initialize_genanswer();
  initialize_summary();
  initialize_answerlist();
}

function save_post($post_id) {
  if (array_key_exists('qstnr-temp-metajson', $_POST)) {
    $metajson = $_POST['qstnr-temp-metajson'];
    update_post_meta($post_id, POSTMETA_METAJSON, $metajson);
  }
}

function meta_box() {
  add_meta_box(ns_('custom_property'), __('Questionnaire Sheet', ns_()), ns_name('render_meta_box'));
}

function get_qstnr_form_meta($postid) {
  $formmeta = get_post_meta($postid, POSTMETA_METAJSON, true);
  if ($formmeta === "") {
    $formmeta = auto_migrate_data($postid);
  }
  return $formmeta;
}

function ajax_formmeta() {
  if (array_key_exists('postid', $_GET)) {

    $postid = $_GET['postid'];
    $nonce = $_GET['nonce'];
    if (wp_verify_nonce($nonce, QUESTIONNAIRE_NONCE . $postid)) {

      if ($_SERVER['REQUEST_METHOD'] === 'GET') {
	status_header(SC_OK);
	header("Content-type: application/json; charset=utf-8");
	$meta = get_qstnr_form_meta($postid);

	echo $meta;
	die();
      } else if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT') {
	status_header(SC_OK);
	$meta = received_data();

	update_post_meta($postid, POSTMETA_METAJSON, wp_slash($meta));
	echo json_encode(array('success' => true));
	die();
      }
    }
  }
  status_header(SC_BADREQUEST);
  echo json_encode(array('success' => false));
  die();
}

function ajax_querycss() {
  if (array_key_exists('postid', $_GET)) {
    $postid = $_GET['postid'];
    $nonce = $_GET['nonce'];
    if (wp_verify_nonce($nonce, QUESTIONNAIRE_NONCE . $postid)) {
      $styletype = $_GET['styletype'];
      $csscontent = file_get_contents(__DIR__ . '/style.css');
      $searchfor = "/* QUESTIONNAIRE SELECTABLE STYLE: " . $styletype;
      $istart = strpos($csscontent, $searchfor);
      $searchfor = "/* END OF SELECTABLE STYLE";
      $iend = strpos($csscontent, $searchfor, $istart);
      status_header(SC_OK);
      header('Content-type: text/plain');
      echo substr($csscontent, $istart, $iend - $istart);
      die();
    }
  }
  status_header(SC_BADREQUEST);
  echo json_encode(array('success' => false));
  die();
}

function metaform($ldata) {

?>
  <div class="qstnr-propsheet">
    <div class="qstnr-propsheet-title"><?= __('Form Designer', ns_()) ?></div>
    <form>
      <div id="qstnr-formmeta">
        <div class="formmeta-errorview-msgbox">
        </div>
	<div class="formmeta-panelview"></div>
	<div class="qstnr-formmeta-bg">
          <input type="checkbox" id="qstnr-edit-formmeta-toggle">
          <label for="qstnr-edit-formmeta-toggle" title="<?= __('Edit questionnaire&apos;s form.', ns_()) ?>"><span></span><?= __('Edit form entries', ns_()); ?></label>
          <div class="qstnr-formmeta-metaedit" style="position:relative;">
            <button type="button" class="qstnr-additem" title="<?= __('Add new form item.', ns_());?>"><?= __('Add Item', ns_()) ?></button>
            <div class="qstnr-form-meta-itemlist" id="qstnr-form-meta-form">
            </div>
            <button type="button" class="qstnr-additem" title="<?= __('Add new form item.', ns_());?>"><?= __('Add Item', ns_()) ?></button>
          </div>
          <input type="checkbox" id="qstnr-edit-detail-toggle">
          <label for="qstnr-edit-detail-toggle" title="<?= __('Edit other attributes.', ns_())?>"><span></span><?= __('Edit attributes', ns_()); ?></label>
          <div class="qstnr-form-meta-othersettings">
	    <div class="qstnr-form-meta-uniqueness">
	      <input type="checkbox" id="qstnr-ispublic">
              <label for="qstnr-ispublic" class="qstnr-metaparam" title="<?= __('Check here if you wish to make this questionnaire public, otherwise this questionnaire will only be seen by the user who has login account of this site.&#13;', ns_());?>">
		<?= __('Is public questionnaire?', ns_()) ?>
	      </label>
	      <div class="qstnr-public-uniqueness" title="<?= __('This section specifies how to distinguish each answer.&#13;Combining multiple item makes distinguishing strict.&#13;Checking e-mail and name makes display the input box on the questionnaire form.&#13;Leaving all items unchecked causes that all answers will be regarded as unique.', ns_()) ?>">
		<div><?= __('Uniqueness', ns_()) ?></div>
		<input type="checkbox" id="qstnr-unique-cookie">
		<label class="qstnr-unique-cookie" title="<?= __('Distinguish answers using COOKIE which holds server generated unique key.&#13;The unique key will be generated using IP Address, date & time the request issued(in seconds), and random number.', ns_()) ?>" for="qstnr-unique-cookie"><?= __('Use Cookie', ns_())?></label><div></div>
		<div class="qstnr-optional-input-area qstnr-cookie-settings" title="<?= __('These values control the expiration duration of cookie value.', ns_()) ?>">
		  <?= __('Expire time setting', ns_()) ?>
		  <table>
		    <thead>
		      <tr>
			<th style="display:none"><?= __('Months', ns_()) ?></th>
			<th><?= __('Days', ns_()) ?></th>
			<th><?= __('Hours', ns_()) ?></th>
			<th><?= __('Mins', ns_()) ?></th>
		      </tr>
		    </thead>
		    <tbody>
		      <tr>
			<td style="display:none"><input type="number" value="0" min="0" id="qstnr-cookie-expire-months"></td>
			<td><input type="number" value="0" min="0" id="qstnr-cookie-expire-days"></td>
			<td><input type="number" value="0" min="0" id="qstnr-cookie-expire-hours"></td>
			<td><input type="number" value="0" min="0" id="qstnr-cookie-expire-mins"></td>
		      </tr>
		    </tbody>
		  </table>
		</div>
		<input type="checkbox" id="qstnr-unique-name">
		<label title="<?= __('Distinguish answers using name(or nickname).&#13;Checking this item makes display the Name input box.&#13;To see the effect of this item, you should logout from wordpress first, then view this page.&#13;The answer with different name will be regarded as from different visitor.', ns_())?>" for="qstnr-unique-name"><?= __('Use user name', ns_()) ?></label><div></div>
		<input type="checkbox" id="qstnr-unique-email">
		<label title="<?= __('Distinguish answers using e-mail address.&#13;Checking this item makes display the E-Mail input box on the questionnaire form. &#13;To see the effect of this item, you should logout from wordpress first, then view this page.&#13;In general, distinguishing by e-mail address is strict enough.&#13;The answer with different e-mail address will be regarded as from different visitor', ns_())?>" for="qstnr-unique-email"><?= __('Use e-mail address', ns_()) ?></label><div></div>
		<input type="checkbox" id="qstnr-unique-ip">
		<label title="<?= __('Distinguish answers using ip address of visitor.&#13;The answer from different ip-address will be regarded as an answer from different visitor.&#13;In general, this item is combined with browser value.', ns_())?>" for="qstnr-unique-ip"><?= __('Use ip address', ns_()) ?></label><div></div>
		<input type="checkbox" id="qstnr-unique-browser">
		<label title="<?= __('Distinguish answers using browser(user agent value).&#13;In general, this item is combined with ip-address value.', ns_())?>" for="qstnr-unique-browser"><?= __('Use browser name and version', ns_()) ?></label><div></div>
	      </div>
	    </div>
	    <div>
              <label class="qstnr-metaparam" for="qstnr-viewtype" title="<?= __('You can change the type of questionnaire&apos;s visual design from preconstructed design set.', ns_()) ?>"><?= __('Form Style Type: ', ns_()); ?>
              </label>
              <select id="qstnr-viewtype">
		<?php foreach ($ldata['stylelist'] as $styleid) : ?>
		  <option value="<?= $styleid ?>"><?= $styleid ?></option>
		<?php endforeach; ?>
              </select>
	    </div>
            <div class="qstnr-form-meta-fss">
	      <input type="checkbox" id="qstnr-usefss">
              <label for="qstnr-usefss" 
		      title="<?= __('Check here if you wish to apply additional CSS definitions to your questionnaire form.', ns_());?>">
		<?= __('Specify Additional Styles?', ns_()); ?>
	      </label>
	      <button type="button" id="qstnr-button-copycss" title="<?= __('Copy CSS into textarea below from current style type.', ns_()) ?>" style="display:none;"><?= __('Copy from current style type CSS', ns_()) ?></button>
              <textarea
		      id="qstnr-fss"
		      title="<?= __('You can write any CSS definitions here, but for security reason, only styles for questionnaire form will be dynamically applied on this screen.&#13;(on actual questionnaire page, all styles will be applied)', ns_());?>">
	      </textarea>
            </div>
	    <div class="qstnr-form-meta-notification">
	      <input type="checkbox" id="qstnr-notify-author">
	      <label for="qstnr-notify-author" title="<?= __('Check here if you wish to receive notification by e-mail.&#13;An e-mail will be sent to page author when visitor answered to this questionnaire at first time, next time, when a visitor updates his answer, no notification be made even if this checkbox is checked.', ns_());?>">
		<?= __('Notify Answer', ns_()); ?>
	      </label>
	    </div>
	    <div class="qstnr-form-meta-visibility">
	      <input type="checkbox" id="qstnr-disappear-after-answer">
	      <label for="qstnr-disappear-after-answer" title="<?= __('Checking this makes the questionnaire form be disappeared after the visitor answered.', ns_()) ?>">
		<?= __('Only viewable to visitors who have not answered this questionnaire yet.', ns_()) ?>
	      </label><div></div>
	      <div class="qstnr-optional-input-area qstnr-after-answered-info-input">
		<label for="qstnr-form-alternative-content-answered">
		  <?= __('Alternative content', ns_()) ?>
		</label>
		<textarea title="<?= __('You can specify alternative HTML text here.', ns_()) ?>" id="qstnr-form-alternative-content-answered"></textarea>
	      </div>
	      <input type="checkbox" id="qstnr-disappear-after-timeout">
	      <label for="qstnr-disappear-after-timeout" title="<?= __('Checking this enables expiration timeout for questionnaire form.&#13;After timeout expired, questionnaire form will be disappeared, then alternative content will be displayed.', ns_()) ?>">
		<?= __('Disappear after specified timeout expired', ns_()) ?>
	      </label><div></div>
	      <div class="qstnr-optional-input-area qstnr-form-expired-settings" title="<?= __('These values control the expiration duration of questionnaire form.', ns_()) ?>">
		<?= __('Timed expire setting', ns_()) ?> (Server's Timezone setting: <?php echo get_option('timezone_string'); ?>)
		<div>
		  <label for="qstnr-form-expire-datetime">
		    <?= __('When to expire', ns_()) ?>
		  </label>
		  <input type="datetime-local" id="qstnr-form-expire-datetime">
		  <label for="qstnr-form-expire-datetime">
		    <?= __('(Format: "yyyy-mm-ddThh:MM". ex; "2016-02-28T00:00")', ns_()) ?>
		  </label>
		</div>
		<label for="qstnr-form-alternative-content-expired">
		  <?= __('Alternative content', ns_()) ?>
		</label>
		<textarea title="<?= __('You can specify alternative HTML text here.', ns_()) ?>" id="qstnr-form-alternative-content-expired"></textarea>
	      </div>
	    </div>
	    <div class="qstnr-form-meta-answer-action-setting" title="<?= __('Settings about Submit action.', ns_())?>">
	      <input type="checkbox" id="qstnr-specify-action-property">
	      <label for="qstnr-specify-action-property"><?= __('Settings about "Submit action"', ns_()) ?></label>
	      <div class="qstnr-specify-action-property qstnr-optional-input-area">
		<div class="qstnr-form-meta-ack-type" title="<?= __('What is displayed after submit action succeeded, default is disalog box.', ns_())?>">
		  <span><?= __('Greeting type', ns_()) ?></span>
		  <select id="qstnr-action-property-ack-type">
		    <option value="default"><?= __('Default', ns_()) ?></option>
		    <option value="none"><?= __('None', ns_()) ?></option>
		    <option value="-hide"><?= __('Hide', ns_()) ?></option>
		    <option value="dialogbox"><?= __('Dialog box', ns_()) ?></option>
		    <option value="blink"><?= __('Blink', ns_()) ?></option>
		    <option value="transit,dialogbox"><?= __('Page transit or Dialogbox', ns_()) ?></option>
		    <option value="transit,-hide"><?= __('Page transit or Hide', ns_()) ?></option>
		  </select>
		</div>
		<div title="<?= __('Alternative contents which will be displayed after questionaire form is hidden.&#13;Please specify some HTML if you need to show something.', ns_())?>" class="qstnr-form-meta-alternative-after-hidden qstnr-optional-input-area">
		  <div><?= __('Alternative content after hidden', ns_()) ?></div>
		  <div><textarea rows="2" id="qstnr-form-alternative-content-after-hidden"></textarea></div>
		  <div><label title="<?= __('Check this if you want to keep the size of questionnaire area after this questionnaire is hidden.', ns_())?>"><input type="checkbox" id="qstnr-form-meta-keep-size-after-hidden"><?= __('Keep area size', ns_())?></label></div>
		</div>
		<div class="qstnr-optional-input-area" title="<?= __('Page transition settings.&#13;Questionnaire can make page transition after visitor answered this questionnaire.&#13;The transition destination can be selected by the value visitor answered.', ns_()) ?>" id="qstnr-form-meta-transit-settings">
		</div>
		<table>
		  <tr title="<?= __('Alternative text for Submit button.', ns_())?>"><td><label><?= __('Button text for "Submit"', ns_()) ?></label></td><td><input type="text" id="qstnr-action-property-submit-text"></td></tr>
		<tr title="<?= __('The text displayed on the dialog', ns_())?>"><td><label><?= __('Greeting text after Submit', ns_()) ?></label></td><td><input type="text" id="qstnr-action-property-ack-text"></td></tr>
		<tr title="<?= __('Alternative text for Dismiss button.', ns_())?>"><td><label><?= __('Button text for "Dismiss"', ns_()) ?></label></td><td><input type="text" id="qstnr-action-property-dismiss-text"></td></tr>
		</table>
		<div class="qstnr-form-meta-constraint-dependency" title="<?= __('Dependency setting for Submit button.', ns_()) ?>">
		  <span><?= __('Dependency', ns_()) ?></span>
		  <select id="qstnr-action-property-cond">
		    <option value="default"><?= __('Default', ns_()) ?></option>
		    <option value="none"><?= __('None', ns_()) ?></option>
		    <option value="submitifon"><?= __('Auto submit if on', ns_()) ?></option>
		    <option value="showifon"><?= __('show if on', ns_()) ?></option>
		    <option value="showifoff"><?= __('show if off', ns_()) ?></option>
		    <option value="hideifon"><?= __('hide if on', ns_()) ?></option>
		    <option value="hideifoff"><?= __('hide if off', ns_()) ?></option>
		    <option value="enableifon"><?= __('enable if on', ns_()) ?></option>
		    <option value="enableifoff"><?= __('enable if off', ns_()) ?></option>
		    <option value="disableifon"><?= __('disable if on', ns_()) ?></option>
		    <option value="disableifoff"><?= __('disable if off', ns_()) ?></option>
		  </select>
		  <select id="qstnr-action-property-cond-item" size="6" multiple>
		  </select>
		</div>

	      </div>
	    </div>
          </div>
	</div>
	<div class="qstnr-info-display" title="<?= __('Shortcode of this questionnaire.&#13;Clicking the text box below will copy the code into clipboard.&#13;You can paste the shortcode into the other pages or posts.', ns_()) ?>">
	  <input type="radio" name="qstnr-shortcode-select" id="qstnr-shortcode-select-form" checked><label for="qstnr-shortcode-select-form" class="qstnr-shortcode-select"><span></span></label>
	  <input type="radio" name="qstnr-shortcode-select" id="qstnr-shortcode-select-meta"><label for="qstnr-shortcode-select-meta" class="qstnr-shortcode-select"><span></span></label>
	  <input type="radio" name="qstnr-shortcode-select" id="qstnr-shortcode-select-summary"><label for="qstnr-shortcode-select-summary" class="qstnr-shortcode-select"><span></span></label>
	  <label for="qstnr-form-shortcode" class="qstnr-shortcode-selected"><?= __('Shortcode of this questionnaire form ', ns_()) ?></label>
	  <input type="text" readonly="readonly" name="qstnr-shortcode" id="qstnr-form-shortcode" value="">
	  <label for="qstnr-meta-shortcode" class="qstnr-shortcode-selected"><?= __('Shortcode of metadata box of this questionnaire.', ns_()) ?></label>
	  <input type="text" readonly="readonly" name="qstnr-shortcode" id="qstnr-meta-shortcode" value="">
	  <label for="qstnr-summary-shortcode" class="qstnr-shortcode-selected"><?= __('Shortcode of Summary chart box of this questionaire.', ns_()) ?></label>
	  <input type="text" readonly="readonly" name="qstnr-shortcode" id="qstnr-summary-shortcode" value="">
	</div>
        <button type="button" id="qstnr-savemeta" class="qstnr-meta-actionbutton" title="<?= __('Unless pressing this button, questionnaire&apos;s design won&apos;t be saved.', ns_()) ?>"><?= __('Save', ns_()) ?></button>
	<button type="button" id="qstnr-redraw" class="qstnr-meta-actionbutton" title="<?= __('Redraw Form Sample', ns_()) ?>"><?= __('Redraw', ns_()) ?></button>
	<!-- <form method="PUT" action="" id="">
	     <input type="file">
	     <input type="submit" value="upload">
	     </form> -->
      </div>
    </form>
    <script type="text/template" id="qstnr-form-meta-transit-template">
      <br/>
      <?= __('Page transition settings', ns_()) ?>
      <table><tr>
	<td><?= __('Default URL', ns_()) ?></td>
	<td title="<?= __('Clicking text area shows link selection dialogue.', ns_()) ?>"><input type="text" transit_id="0" name="qstnr-form-meta-transit-dest" value="<%= data.length > 0 ? data[0].url : '' %>" placeholder="<?= __('Click to select the default transition URL', ns_())?>"></td>
	<td><button type="button" id="qstnr-form-meta-clear-transit-dest" title="<?= __('Clear default url', ns_())?>">x</button></td>
	</tr>
      </table>
      <button type="button" id="qstnr-form-meta-add-transit" <%= (data.length > 1 && data[data.length - 1].condition.length === 0) ? 'disabled' : '' %>><span><?= __('Add conditional transition', ns_())?></span></button>
      <div class="qstnr-form-meta-transit-list">
	<% _.each(data, function(item, i) { if (i === 0) {return;} %>
	<div class="qstnr-form-meta-transit-item">
	  <span>
	    <button type="button" name="qstnr-form-meta-transit-delete" transit_id="<%= i %>"><span><?= __('Delete', ns_()) ?></span></button>
	  </span>
	  <span>
	    <div>
	      <input type="text" transit_id="<%= i %>" name="qstnr-form-meta-transit-dest" value="<%= item.url %>" placeholder="<?= __('Click to select the transition URL', ns_()) ?>">
	    </div>
	    <div>
	      <label style="width:100%" transit_id="<%= i%>">
		<input type="text" name="qstnr-form-meta-transit-condition" transit_id="<%= i %>" value="<%= item.condition.length > 0 ? stringify(item.condition) : '' %>" readonly <%= item.url ? '' : 'disabled placeholder=""' %> placeholder="<?= __('Click to import answer pattern from sample form.',ns_())?>" >
	      </label>
	    </div>
	  </span>
	</div>
	<% }, this); %>
      </div>
    </script>
    <script type="text/template" id="qstnr-form-meta-item-template">
      <table>
	<% var formertype = undefined; for (var i in items) { var item = items[i]; var en = view.setenabled(formertype); formertype = item.type; %>
	<tr itemindex="<%= item.index %>">
	  <td class="qstnr-auto-align">
	    <button
		    type="button"
		    class="qstnr-deletebtn"
		    title="<?= __('Delete this form item', ns_());?>">
	      <span class="icon-cross"></span>
	    </button>
	    <button type="button"
		    class="qstnr-upbtn"
		    title="<?= __('Move up this form item', ns_()); ?>" >
	      <span class="icon-move-up"></span>
	    </button>
	    <button type="button"
		    class="qstnr-downbtn"
		    title="<?= __('Move down this form item', ns_());?>">
	      <span class="icon-move-down"></span>
	    </button>
	    <select class="qstnr-itemtypesel">
              <option value="label"
		<%= item.type === "label" ? 'selected' : '' %>
		<%= en['label'] ? '' : 'disabled' %>
		title="<?= __('This item will become a question text(subject) of the questionnaire.', ns_());?>"><?= __('Label', ns_());?>
	      </option>
              <option value="text"
		<%= item.type === "text" ? 'selected' : '' %>
		<%= en['text'] ? '' : 'disabled' %>
		title="<?= __('This item will become a free text input area for your questionnaire.', ns_());?>"><?= __('Message', ns_());?>
	      </option>
              <option value="option"
		<%= item.type === "option" ? 'selected' : '' %>
		<%= en['option'] ? '' : 'disabled' %>
		title="<?= __('This item will become a option item of a dropdown of the questionnaire, a dropdown wrapping this item will be created automatically.', ns_());?>"><?= __('Option', ns_());?>
	      </option>
              <option value="radio"
		<%= item.type === "radio" ? 'selected' : '' %>
		<%= en['radio'] ? '' : 'disabled' %>
		title="<?= __('This item will become a radio button of the questionnaire.', ns_());?>"><?= __('Radio', ns_());?>
	      </option>
              <option value="check"
		<%= item.type === "check" ? 'selected' : '' %>
		<%= en['check'] ? '' : 'disabled' %>
		title="<?= __('This item will become a checkbox of the questionnaire.', ns_());?>"><?= __('Check', ns_());?>
	      </option>
              <option value="number"
		<%= item.type === "number" ? 'selected' : '' %>
		<%= en['number'] ? '' : 'disabled' %>
		title="<?= __('This item will become a number input box of the questionnaire.', ns_());?>"><?= __('Number', ns_());?>
	      </option>
              <option value="datetime"
		<%= item.type === "datetime" ? 'selected' : '' %>
		<%= en['datetime'] ? '' : 'disabled' %>
		title="<?= __('This item will become a datetime input box of the questionnaire.', ns_());?>"><?= __('Datetime', ns_());?>
	      </option>
	    </select>
	  </td>
	  <td class="qstnr-justify-align">
	    <div class="qstnr-meta-valuearea">
	      <% if (item.type !== "number" && item.type !== "datetime") { %>
	      <textarea rows=1 class="qstnr-nametext <%= item.type === 'text' ? 'qstnr-nametext-narrow' : ''%>"><%= item.text %></textarea>
	      <% } %>
	      <% if (item.type === "number") { %>
	      <label title="<?= __('Please specify the minimum number visitor allowed to enter.', ns_()) ?>">
		<input type="number" class="qstnr-meta-minnumber" name="qstnr-item-minnumber" value="<%= item.minnumber %>">
	      </label>
	      <label title="<?= __('Please specify the max number visitor allowed to enter.', ns_()) ?>">
		<input type="number" class="qstnr-meta-maxnumber" name="qstnr-item-maxnumber" value="<%= item.maxnumber %>">
	      </label>
	      <% } else if (item.type === "datetime") { %>
	      <label class="qstnr-checkarea">
		<input type="checkbox" name="qstnr-item-year" <%= item.year ? 'checked' : '' %> >
		<span><?= __('YYYY', ns_()) ?></span>
	      </label>
	      <span>/</span>
	      <label class="qstnr-checkarea">
		<input type="checkbox" name="qstnr-item-month" <%= item.month ? 'checked' : '' %> >
		<span><?= __('MM', ns_()) ?></span>
	      </label>
	      <span>/</span>
	      <label class="qstnr-checkarea">
		<input type="checkbox" name="qstnr-item-day" <%= item.day ? 'checked' : '' %> >
		<span><?= __('DD', ns_()) ?></span>
	      </label>
	      <span> </span>
	      <label class="qstnr-checkarea">
		<input type="checkbox" name="qstnr-item-hour" <%= item.hour ? 'checked' : '' %> >
		<span><?= __('HH', ns_()) ?></span>
	      </label><span>:</span>
	      <label class="qstnr-checkarea">
		<input type="checkbox" name="qstnr-item-min" <%= item.min ? 'checked' : '' %> >
		<span><?= __('mm', ns_()) ?></span>
	      </label>
	      <span>:</span>
	      <label class="qstnr-checkarea">
		<input type="checkbox" name="qstnr-item-sec" <%= item.sec ? 'checked' : '' %> >
		<span><?= __('ss', ns_()) ?></span>
	      </label>
	      <% if (item.year) { %>
	      <label>
		<input type="number" min=0 class="qstnr-item-year-range" name="qstnr-item-minyear" value="<%= item.minyear %>">
	      </label>
	      <label>
		<input type="number" min=1 class="qstnr-item-year-range" name="qstnr-item-maxyear" value="<%= item.maxyear %>">
	      </label>
	      <% } %>
	      <% } else if (item.type === "text") { %>
	      <label>
		<input type="number" class="qstnr-meta-rowcount" name="qstnr-item-rows" value="<%= item.rows %>" min="1" max="256">
	      </label>
	      <% } %>
	    </div>
	  </td>
	  <td class="qstnr-auto-align">
	    <label class="qstnr-item-props-label">
	      <input type="radio" class="qstnr-item-props" name="qstnr-item-props" <%= item.type === "option" || item.type === "text" || item.type === "number" || item.type === "datetime" ? 'disabled' : '' %> ><span></span>
	    </label>
	  </td>
	  <td class="qstnr-auto-align">
	    <% if (item.type === 'label') { %>
	    <div class="qstnr-form-meta-ident">- - -Q.<%= item.qid %></div>
	    <% } else { %>
	    <div class="qstnr-form-meta-ident"></div>
	    <% } %>
	  </td>
	</tr>
	<tr class="qstnr-form-meta-item-props-record">
	  <td colspan=3>
	    <div class="qstnr-form-meta-item-props-wrap qstnr-meta-props-id-<%= item.index %>" style="display:none"></div>
	  </td>
	</tr>
	<% } %>
      </table>
    </script>
    <script type="text/template" id="qstnr-props-panel-template">
      <div class="qstnr-form-meta-item-props">
	<fieldset>
	  <legend><?= __('Image settings', ns_()) ?></legend>
	  <div class="qstnr-meta-props-image-and-pos">
	    <label title="<?= __('Clicking here shows media dialogue.', ns_()) ?>"><?= __('Image', ns_()) ?><input type="text" name="qstnr-form-item-imagename"></label>
	    <button type="button" name="qstnr-meta-image-delete" class="qstnr-meta-item-delete" style="display:none" title="<?= __('Delete attached image', ns_())?>"></button>
	    <span name="qstnr-meta-props-image-pos-wrap" title="<?= __('Image location setting',ns_())?>" style="display:none">
	      <span><?= __('Locate image at', ns_()) ?></span>
	      <select name="qstnr-meta-props-image-pos">
		<option value="before"><?= __('Before', ns_())?></option>
		<option value="after"><?= __('After', ns_())?></option>
		<option value="background"><?= __('Background', ns_())?></option>
	      </select>
	      <span><?= __('of this item', ns_()) ?></span>
	    </span>
	  </div>
	  <div class="qstnr-meta-props-image-geometry">
	    <label class="qstnr-label-check" title="<?= __('Use original geometry of the image', ns_()) ?>">
	      <span><?= __('Auto Geometry', ns_()) ?></span>
	      <input type="checkbox" name="qstnr-meta-props-image-geometry-auto">
	    </label>
	    <div class="qstnr-meta-props-image-params" title="<?= __('Specify geometry of displayed image', ns_()) ?>">
	      <span>
		<?= __('Opacity', ns_()) ?><input type="number" name="qstnr-form-image-opacity" min="0" max="1" step="0.01">
	      </span>
	      <span>
		<?= __('Width', ns_()) ?><input type="number" name="qstnr-form-image-width" min="0">
		<?= __('Height', ns_()) ?><input type="number" name="qstnr-form-image-height" min="0">
		<select name="qstnr-form-image-size-unit" style="display:none">
		  <option value="pt">point</option>
		  <option value="px">pixel</option>
		  <option value="pct">%</option>
		  <option value="cm">cm</option>
		</select>
	      </span>
	    </div>
	  </div>
	</fieldset>
	<fieldset class="qstnr-meta-constraint" title="<?= __('Constraint settings', ns_()) ?>">
	  <legend><?= __('Constraint settings', ns_()) ?></legend>
	  <div>
	    <label title="<?= __('If checked, this item have to have some value to do submit.', ns_())?>"><?= __('Required?', ns_()) ?>
	      <input type="checkbox" name="qstnr-meta-props-required">
	    </label>
	  </div>
	  <div class="qstnr-meta-constraint-dependency" title="<?= __('The appearance of this item will depend on other items.', ns_()) ?>"><span><?= __('Dependency', ns_()) ?></span>
	    <select name="qstnr-meta-props-cond">
	      <option value="none"><?= __('None', ns_()) ?></option>
	      <option value="showifon"><?= __('show if on', ns_()) ?></option>
	      <option value="showifoff"><?= __('show if off', ns_()) ?></option>
	      <option value="hideifon"><?= __('hide if on', ns_()) ?></option>
	      <option value="hideifoff"><?= __('hide if off', ns_()) ?></option>
	      <option value="enableifon"><?= __('enable if on', ns_()) ?></option>
	      <option value="enableifoff"><?= __('enable if off', ns_()) ?></option>
	      <option value="disableifon"><?= __('disable if on', ns_()) ?></option>
	      <option value="disableifoff"><?= __('disable if off', ns_()) ?></option>
	    </select>
	    <select name="qstnr-meta-props-cond-item" size="4" multiple>
	    </select>
	  </div>
	</fieldset>
      </div>
    </script>
  </div>
<?php
}

/**
 * render meta box on questionnaire edit screen
 */
function render_meta_box($post) {

  $jsonstr = get_qstnr_meta($post);

  $ldata = js_localize_data(array( 
    'admin_ajax_url' => admin_url('admin-ajax.php'), 
      'postid' => $post->ID,
      'metajsonstr' => $jsonstr,
      'nonce' => wp_create_nonce(QUESTIONNAIRE_NONCE . $post->ID),
      'issample' => true
  ));

  qstnr_process_css($ldata);
  
  wp_enqueue_script('qstnr_metabox', plugins_url('metabox.js', __FILE__));
  wp_localize_script('qstnr_metabox', 'qstnr_data', $ldata);

  wp_enqueue_script('qstnr_metaform', plugins_url('metaform.js', __FILE__));
  wp_enqueue_script('qstnr_metaform_view', plugins_url('metaformview.js', __FILE__));
  wp_enqueue_style('qstnr_style', plugins_url('style.css', __FILE__));
  wp_enqueue_style('qstnr_icomoon_style', plugins_url('icomoon/style.css', __FILE__));

  metaform($ldata);

  dialogbox($ldata);

  actform_enqueue_resources();
  actform($ldata, array( 'issample' =>  true));


  resultsheet($ldata);
  
}

function resultsheet($ldata) {
?>
  <div class="qstnr-resultsheet">
    <div class="qstnr-propsheet-title"><?= __('Answers view', ns_());?></div>
    <?php
    
  answerinfo($ldata);

  
  apply_filters('questionnaire_pro_metaboxes', $ldata);

  $tabarray = array(
    array( 'label' => __('Summary', ns_()), 'function' => 'summary' ),
      array( 'label' => __('List', ns_()), 'function' => 'answerlist' )
  );
  resultview($tabarray, $ldata);

  /*
     for debug.
  genanswer();
    */
    
?>
  </div>
<?php
    
}
