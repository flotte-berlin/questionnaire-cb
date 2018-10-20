<?php
namespace questionnaire;

function initialize_miscview() {
    
}

/**
 * general use dialogue box
 */
function dialogbox($ldata) {
  wp_enqueue_script('qstnr_miscview', plugins_url('miscview.js', __FILE__));
?>
  <div class="qstnr-dialog" style="display:none;position:absolute">
    <div class="qstnr-dialog-message"></div><div></div>
    <div class="qstnr-dialog-buttons">
      <button class="qstnr-small qstnr-ackbtn" type="button"><div><?= __('Dismiss', ns_()) ?></div><span></span></button>  
    </div>
  </div>
<?php
}

