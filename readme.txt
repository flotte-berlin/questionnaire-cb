===Questionnaire===
Contributors: kurohara
Donate link: http://www.microgadget-inc.com/donate-to-the-questionnaire/
Tags: questionnaire, survey, vote, plugin
Requires at least: 4.2.2
Tested up to: 4.4.2
Stable tag: 2.8.0
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Issue questionnaire(survey/vote) on your own WordPress site.

== Description ==

This plugin adds the ability to create the quetionnaire sheet.  
You can create a questionnaire by adding a post of 'questionnaire' post-type.  
The 'questionnaire' post-type has form editor to edit questionnaire form so that you can easily create the questionnaire sheet.  
You can restrict the person who can answer the questionnaire to the users who has login account.  
(This is default behavior)  

Features:

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

== Installation ==

1. From 'Plugins' admin page, 'AddNew' -> 'Search Plugins' -> enter 'Questionnaire', then install 'Questionnaire' plugin.
1. Activate the plugin through the 'Plugins' menu in WordPress.

== Frequently Asked Questions ==

= How can I create a questionnaire? =

First, you have to have the 'Editor' role to create questionnaire, log in to your WordPress site with such account, then you can create one from the 'Questionnaire' menu of left menu bar of WordPress's dashboard.

= How can visitors see the questionnaire? =

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
  
= Is the answer of questionnaire sent by email? =

Yes, if you check the option of questionnaire detail setting "Notify Answer".
The notification email will be sent to the author when the visitor first answered the questionnaire.
When the same visitor answered the same queationnaire(update the answer), the notification e-mail won't be sent.

= How can I see the answers ? =

You can see the a) the summary of the answers, b) the list of answers, at the bottom of questionnaire editing box.

= Where the answer data saved? =

The answer for a questionnaire is stored as 'comment' data with special comment-type has set.  

= How can I backup questionnaires? =

You can use several ways to backup questionnaires.  

* Use export/import plugin.  
  You will see 'export/import' item on 'tools' menu of WordPress dashboard.  
  You can use this to export/import questionaires(You may need to install extra plugin to do import task).  
* Copy/Paste 'qstnr_metajson' Custom Field.  
  You can export the metadata of questionnaire.   
  You will see 'Custom Field' of 'qstnr_metajson' in the Edit Questionnaire screen if you have on the checkbox of 'Custom Fields' screen option.  
  You can select entire text of 'qstnr_metajson' and do copy to clipboard, then you can paste to your favorite text editors.  
  To import this, you can paste this metajson text into 'qstnr_metajson' custom field then 'Update' the questionnaire.   

= How can I remove the credit text displayed below the questionnaire? =

You can remove this credit('Produced by Questionnaire plugin ....') by editing source code.  
1. remove subject text from notification.php line 158.  
   Do not remove entire line, just remove the text you don't want to see.  
2. remove subject text form questionnaire.php line 342.  
   Do not remove entire line, just remove the text you don't want to see.  

This credit text is exist because of some reasons, but you can freely remove this text by yourself.  
In the future, If 'some reasons' have cleared, I will remove this text completely.  

== Screenshots ==

1. Create a questionnaire from the admin menu 'Questionnaire'.
2. Like a normal post, name your questionair, and write some description.
3. The 'Questionnaire Sheet' option has to be on to edit your questionnaire.
4. You can edit the questionnaire form on 'Form Designer'.
5. 'Form Sample' as preview.
6. 'Form Sample' as preview.
7. Shortcode can be inserted into any posts or pages.
8. Timed questionnaire is available.
9. Various 'Uniqueness' controlls for public questionnaire.
10. Apply additional styles.
11. Summary chart and answer list.
12. Summary chart and answer list.

== Sample Movie ==

1. Using Questionnaire plugin.  

   [youtube https://youtu.be/yMTyQcCh1no]

2. Using constraint logic.  

   [youtube https://youtu.be/97aSFRjsKL8]

3. Using page transition and widgets.

   [youtube https://youtu.be/hl00lHHfz8o]

== Changelog ==
= 2.8.0 =
* Added 'Datetime' and 'Number' as new input type of Questionnaire.  
* Supported 'Duplicate Post' plugin.  
  By using that plugin, Questionnaire will be duplicated with answer list preserved.
* The vertical size of text area now can be changed.  
* Fixed the problem of 'overflowing title text on MS Edge browser'.  
* A little enchanced the performance of Form editor.
= 2.7.0 =
* Added shortcode for summary chart.
= 2.6.0 =
* Added 'Page transition feature'.
* Fixed the bug about 'the first option in select list can't be valid'.
* Other minor bug fixes.
= 2.5.3 =
* Fixed the data corruption bug with 'Update' button.
= 2.5.2 =
* Fixed the problem about label text wrapping on IE.
* Other minor bug fixes.
= 2.5.1 =
* Initialize error on IE(ver 11) has fixed.
* Metabox style has fixed for IE(ver 11).
* A bug about Submit button action has fixed.
= 2.5.0 =
* Widget support.
* Other enchancements.
= 2.4.1 =
* some bug fix(GUI of "submit" action).
= 2.4.0 =
* Configurable "submit" action feature.
* Constraint setting GUI improved.
= 2.3.1 =
* minor bug fix.
= 2.3.0 =
* Image attach feature has been added.
* Dependency logic feature has been added.
= 2.2.1 =
* minor bug fix.
= 2.2.0 =
* Uniqueness with server generated unique key cookie has added.
* Now other posts or pages can display questionnaire using shortcode.
* Appearance control using answer flag has added.
* Appearance control using expiration duration has added.
* Some minor bug fixes.
= 2.1.0 =
* 'Uniqueness' controll feature has added.
* Form's style has updated.
* Some minor bug fixes.
= 2.0.3 =
* Bug fixed: there sometimes pressing "Update" button of Questionnaire edit page causes form data disappeared.  
* The file name when downloading csv has changed.
* Donation link has added.
= 2.0.2 =
* redundant debug code has removed.
= 2.0.1 =
* Some style bug has fixed.
* Stylesheet has updted.
* Language file has updated.
= 2.0.0 =
* Thoroughly redesigned.
= 1.0.2 =
* fixed broken tag ('</fieldset').
= 1.0.1 =
* fixed the 'tested WordPress version'
= 1.0.0 =
* First release.

== Other materials ==

1. This project is using [Icomoon](https://github.com/Keyamoon) icon fonts.

== Additional Requirements ==

1. To use this plugin, your WordPress should be running on PHP ver 5.3 or lator.


