<?php
namespace questionnaire;

function initialize_shortcode() {
  add_shortcode('questionnaire', __NAMESPACE__ . '\process_shortcode');
  add_shortcode('questionnaire_showmeta', __NAMESPACE__ . '\process_showmeta_shortcode');
  add_shortcode('questionnaire_summary', __NAMESPACE__ . '\process_summary_shortcode');
}

function process_shortcode($attrs) {
  if (array_key_exists('id', $attrs) && $attrs['id'] !== 0) {
    $qstnr_post = get_post($attrs['id']);
    if ($qstnr_post->post_type === POSTTYPE) {
      return the_questionnaire_form($qstnr_post);
    }
  }
}

function process_showmeta_shortcode($attrs) {
  if (array_key_exists('id', $attrs) && $attrs['id'] !== 0) {
    $meta = get_qstnr_form_meta($attrs['id']);
    return $meta;
  }
}

function process_summary_shortcode($attrs) {
  if (array_key_exists('id', $attrs) && $attrs['id'] !== 0) {
    $postid = $attrs['id'];
    
    ob_start();
    ?>
    <script type="text/javascript">
    if (! self.qstnr_data) {
      self.qstnr_data =
      {
	admin_ajax_url: "<?= admin_url('admin-ajax.php') ?>",
	nonce: "<?= wp_create_nonce(QUESTIONNAIRE_NONCE . $postid) ?>",
	postid: "<?= $postid ?>",
	ajaxTimeout:30000
      };
    }
    jQuery(function($) {

      $(document).ready(function() {
	var summary = new Qst.SummaryTotal();
	var summaryView = new Qst.SummaryView({model: summary});
	summary.fetch({timeout:qstnr_data.ajaxTimeout});
	//
	summary.on("sync", function() {
	  aggmodel.initialfetch({timeout:qstnr_data.ajaxTimeout});
	});
	
      });
    });
    </script>
    <?php

    $html = ob_get_contents();
    ob_end_clean();
    return $html . summary_ne();
  }  
}
