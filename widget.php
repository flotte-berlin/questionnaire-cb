<?php
/**
 */
namespace questionnaire;

class Qstnr_Widget extends \WP_Widget {
  /**
   * Sets up the widgets name etc
   */
  public function __construct() {
    $widget_ops = array(
      'classname' => 'Qstnr_Widget',
	'description' => 'Questionnaire widget',
    );

    parent::__construct( 'Qstnr_Widget', 'Questionnaire Widget', $widget_ops );
  }

  /**
   * Outputs the content of the widget
   *
   * @param array $args
   * @param array $instance
   */
  public function widget( $args, $instance ) {
    // outputs the content of the widget
      ?>
    <div class="widget widget_questionnaire">
    <div class="qstnr-widget-title"><?= $instance['title'] ?></div>
    <div class="qstnr-widget-desc"><?= $instance['message'] ?></div>
    <?php
    if (array_key_exists('qstnrid', $instance) && $instance['qstnrid'] !== 0) {
      $qstnr_post = get_post($instance['qstnrid']);
      if ($qstnr_post && $qstnr_post->post_type === POSTTYPE) {
	echo the_questionnaire_form($qstnr_post);
      }
    }
      ?>
    </div>
    
    <?php
  }

  /**
   * Outputs the options form on admin
   *
   * @param array $instance The widget options
   */
  public function form( $instance ) {
    // outputs the options form on admin
    $title = ! empty( $instance['title'] ) ? $instance['title'] : __( 'New title', 'text_domain' );
    $message = ! empty( $instance['message'] ) ? $instance['message'] : '';
    $qstnrid = ! empty( $instance['qstnrid'] ) ? $instance['qstnrid'] : '' ;
    $args = array( 'post_type' => POSTTYPE );
    $qstnrlist = get_posts($args);
    
    ?>
    <p>
      <div class="qstnr-widget-info" style="font-size:8pt;">
	<?= __('Be cautious about that only 1 questionnaire form can be displayed on a screen.', ns_()) ?><br>
	<?= __('If your page/post contents contains a questionnaire form, either of questionnaires on the widget or on the contents will be displayed.', ns_()) ?><br>
	<?= __('(If your theme calls contents first, the questionnaire on the contents will be dispalyed, or if your theme calls widgets first, the questionnaire on the widget will be displayed)', ns_()) ?>
      </div>
  <table>
    <tr>
      <td>
	<label for="<?= $this->get_field_id('title') ?>"><?= __('Title:') ?></label>
      </td>
      <td>
	<input type="text" class="widefat" id="<?= $this->get_field_id('title') ?>" name="<?= $this->get_field_name('title') ?>" value="<?= esc_attr($title)?>">
      </td>
    </tr>
    <tr>
      <td>
	<label for="<?= $this->get_field_id('message') ?>"><?= __('Message:') ?></label>
      </td>
      <td>
	<textarea id="<?= $this->get_field_id('message') ?>" name="<?= $this->get_field_name('message')?>" rows="4" placeholder="message for this questionnaire"><?= $message ?></textarea>
      </td>
    </tr>
    <tr>
      <td>
	<label for="<?= $this->get_field_id('qstnrid')?>"><?= __('ID:', ns_()) ?></label>
      </td>
      <td>
	<select id="<?= $this->get_field_id('qstnrid') ?>" name="<?= $this->get_field_name('qstnrid')?>">
	  <option value="none">none</option>
	  <?php foreach ($qstnrlist as $e) : ?>
	    <?php $t = substr($e->post_title, 0, 16); ?>
	    <?php if ($e->ID == $qstnrid) : ?>
	      <option value="<?= $e->ID?>" title="<?= $e->post_title ?>" selected><?= $e->ID . ":" . $t ?></option>
	    <?php else : ?>
	      <option value="<?= $e->ID?>" title="<?= $e->post_title ?>" ><?= $e->ID . ":" . $t ?></option>
	    <?php endif ?>
	  <?php endforeach ?>
	</select>
      </td>
    </tr>
  </table>
    </p>
    <script type="text/javascript">
    jQuery(function($) {
      $(document).ready(function() {
	$("#<?= $this->get_field_id('qstnrid')?>").val("<?= $qstnrid ?>");
	$("#<?= $this->get_field_id('qstnrid')?>").on('change', function(event) {
	  // update title according to the questionnaire's document title.
	  var title = $("#<?= $this->get_field_id('qstnrid')?> option:selected").attr('title');
	  $("#<?= $this->get_field_id('title')?>").val(title);
	});
      });
    });
    </script>
    <?php
  }

  /**
   * Processing widget options on save
   *
   * @param array $new_instance The new options
   * @param array $old_instance The previous options
   */
  public function update( $new_instance, $old_instance ) {
    // processes widget options to be saved
    $instance = array();

    $instance['title'] = ( ! empty( $new_instance['title'] ) ) ? strip_tags( $new_instance['title'] ) : '';
    $instance['message'] = ( ! empty( $new_instance['message'] ) ) ? strip_tags( $new_instance['message'] ) : '';
    $instance['qstnrid'] = $new_instance['qstnrid'];

    return $instance;
  }
}
