<?php
namespace questionnaire;

/**
 * resultview.php
 * Copyright (C) 2015 Hiroyoshi Kurohara (MicroGadget,inc.)
 */
function resultview($tabarray, $ldata) {
?>
  <div class="qstnr-tabview">
    <?php foreach($tabarray as $tabdef): ?>
      <input type="radio" name="qstnr-tab-result" id="qstnr-tab-switch-<?= $tabdef['function'] ?>" class="qstnr-tab-switch">
      <label for="qstnr-tab-switch-<?= $tabdef['function'] ?>" class="qstnr-tabhandle"><span></span><?= $tabdef['label'] ?></label>
    <?php endforeach; ?>
    <?php foreach($tabarray as $tabdef): ?>
      <div class="qstnr-tabwindow" id="qstnr-<?= $tabdef['function'] ?>">
	<?php call_user_func(__NAMESPACE__ . "\\" . $tabdef['function'], $ldata); ?>
      </div>
    <?php endforeach; ?>
  </div>
  <?php
  $addstyle = ".qstnr-tab-switch:checked + label { color: gray; border-width: 2px; z-index: 40;}";
  foreach ($tabarray as $tabdef) {
    $addstyle .= "#qstnr-tab-switch-" . $tabdef['function'] . ":checked ~ #qstnr-" . $tabdef['function'] . " {";
    $addstyle .= "display:block; }";
  }
  $addstyle .= "#qstnr-" . $tabarray[0]['function'] . " > div { border-radius: 0px 5px 5px 5px; }";

  wp_add_inline_style('qstnr_formcomposer_style', $addstyle);
  wp_enqueue_script('qstnr_resultview', plugins_url('resultview.js', __FILE__));
}

function resultview_ne($tabarray, $ldata) {
  ob_start();
  resultview($tabarray, $ldata);
  $html = ob_get_contents();
  ob_end_clean();
  return $html;
}
