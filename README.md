# Questionnaire-CB

**Contributors:** kurohara, poilu  
**Donate link:** http://www.microgadget-inc.com/donate-to-the-questionnaire/  
**Tags:** questionnaire, survey, vote, plugin  
**Requires at least:** 4.2.2  
**Tested up to:** 4.9.6  
**Stable tag:** 2.11.1  
**License:** GPLv2 or later  
**License URI:** http://www.gnu.org/licenses/gpl-2.0.html

Issue questionnaire (survey/vote) on your own WordPress site.

---

## Preamble

This plugin is based on the Wordpress plugin [Questionnaire](https://wordpress.org/plugins/questionnaire/) (v2.8.0) with some adjustments to connect surveys with [Commons Booking](https://github.com/wielebenwir/commons-booking) bookings and some bug fixes.

## Description

This plugin adds the ability to create the questionnaire sheet.  
You can create a questionnaire by adding a post of 'questionnaire' post-type.  
The 'questionnaire' post-type has form editor to edit questionnaire form so that you can easily create the questionnaire sheet.  
You can restrict the person who can answer the questionnaire to the users who has login account.  
(This is default behavior)  

### Features:

* 4 types of controls(Checkbox, Radiobutton, Dropdown, Textarea).  
* Private or Public questionnaire.  
* GUI for editing the questionnaire.  
* Summary chart.  
* Shortcode for posts or pages.  
* Timed questionnaire.  
* Various uniqueness control.  
* Selectable form styles.  
* Additional CSS can be applied to each questionnaire sheet.  
* E-Mail notification.
* Image can be attached.  
* Dependency logic can be attached(Constraint feature).  
* Questionnaire Widget is now available(but only 1 questionnaire is diaplayable on a screen).
* Page transition with(or without) based on answer values.  
* Tested on narrow screen.  

## Installation

1. From 'Plugins' admin page, 'AddNew' -> 'Search Plugins' -> enter 'Questionnaire', then install 'Questionnaire' plugin.
1. Activate the plugin through the 'Plugins' menu in WordPress.

## Frequently Asked Questions

### How can I create a questionnaire?

First, you have to have the 'Editor' role to create questionnaire, log in to your WordPress site with such account, then you can create one from the 'Questionnaire' menu of left menu bar of WordPress's dashboard.

### How can visitors see the questionnaire?

1. The questionnaire you created has URL of its own.
  If you are using customized permalink settings, the URL of your questionnaire will be depends on it.
  You can add a link of the questionnaire(or a archive link to 'questionnaire' post-type) as a menu item to menu of your site.  
  For example, if your site address is 'http://mysite.com/' and you are using permalink setting like as   
    'http://mysite.com/%category%/%postname%', you can add a custom link menu item with link of 'http://mysite.com/questionnaire', this will work as 'archive' menu of your questionnaire.  
2. You can insert the shortcode of your questionnaire into any posts or pages.
  The shorcode is formed like as :
  [questionnaire id="10"]
  The number "10" is the id of your questionnaire.
  You can simply copy&paste the shortcode displayed at below of 'Form Designer'.

### Is the answer of questionnaire sent by email?

Yes, if you check the option of questionnaire detail setting "Notify Answer".
The notification email will be sent to the author when the visitor first answered the questionnaire.
When the same visitor answered the same queationnaire(update the answer), the notification e-mail won't be sent.

### How can I see the answers ?

You can see the a) the summary of the answers, b) the list of answers, at the bottom of questionnaire editing box.

### Where the answer data saved?

The answer for a questionnaire is stored as 'comment' data with special comment-type has set.  

### How can I backup questionnaires?

You can use several ways to backup questionnaires.  

* Use export/import plugin.  
  You will see 'export/import' item on 'tools' menu of WordPress dashboard.  
  You can use this to export/import questionaires(You may need to install extra plugin to do import task).  
* Copy/Paste 'qstnr_metajson' Custom Field.  
  You can export the metadata of questionnaire.   
  You will see 'Custom Field' of 'qstnr_metajson' in the Edit Questionnaire screen if you have on the checkbox of 'Custom Fields' screen option.  
  You can select entire text of 'qstnr_metajson' and do copy to clipboard, then you can paste to your favorite text editors.  
  To import this, you can paste this metajson text into 'qstnr_metajson' custom field then 'Update' the questionnaire.   

## Sample Movie

1. Using Questionnaire plugin.  

   [youtube https://youtu.be/yMTyQcCh1no]

2. Using constraint logic.  

   [youtube https://youtu.be/97aSFRjsKL8]

3. Using page transition and widgets.

   [youtube https://youtu.be/hl00lHHfz8o]

## Other materials

1. This project is using [Icomoon](https://github.com/Keyamoon) icon fonts.

== Additional Requirements ==

1. To use this plugin, your WordPress should be running on PHP ver 5.3 or lator.
