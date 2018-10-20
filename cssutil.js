/**
 * cssutil.js
 * Author: Hiroyoshi Kurohara
 * AUthor email: kurohara@yk.rim.or.jp
 *
 */
//var self = {};
(function () {
  if (self.Qst === undefined) {
    self.Qst = {};
  }
  self.Qst.CSSUtil = {};

  function searchsymbol(text, search, istart, iend) {
    var state = '';
    var len = text.length;
    var i = istart === undefined ? 0 : istart;
    var to = iend === undefined ? len : iend + 1;
    for (;i<to;++i) {
      var c = text.charAt(i);
      switch (state) {
      case '':
	if (c === '\\') {
	  state = 'e';
	} else if (c === '"') {
	  state = 'dq';
	} else if (c === "'") {
	  state = 'sq';
	} else if (c === "/") {
	  state = 'sl';
	} else if (c === search) {
	  return i;
	}
	break;
      case 'dq':
	if (c === '\\') {
	  state = 'e';
	} else if (c === '"') {
	  state = '';
	}
	break;
      case 'sq':
	if (c === '\\') {
	  state = 'e';
	} else if (c === "'") {
	  state = '';
	}
	break;
      case 'e':
	state = '';
	break;
      case 'sl':
	if (c === '\\') {
	  state = 'e';
	} else if (c === '*') {
	  state = 'c';
	} else {
	  state = '';
	}
	break;
      case 'c':
	if (c === '\\') {
	  state = 'ce';
	} else if (c === '*') {
	  state = 'as';
	}
	break;
      case 'ce':
	state = 'c';
	break;
      case 'as':
	if (c === '\\') {
	  state = 'ce';
	} else if (c === '/') {
	  state = '';
	} else {
	  state = 'c';
	}
	break;
      default:
	break;
      }
    }
    return undefined;
  }
  
  function styletop(csstext, start) {
    return searchsymbol(csstext, '{', start);
  }

  function styleend(csstext, start) {
    return searchsymbol(csstext, '}', start) + 1;
  }
  
  self.Qst.CSSUtil = {
    split: function(csstext) {
      var src = csstext;
      var cssrules = [];
      for (;;) {
	var istart = styletop(src);
	if (istart === undefined) {
	  break;
	}
	var selectorstr = src.substring(0, istart);
	var rule = {};
	rule.selectors = selectorstr.split(",");
	var iend = styleend(src, istart);
	rule.styletext = src.substring(istart, iend);
	cssrules.push(rule);
	src = src.substring(iend);
      }
      return cssrules;
    },
    embrace: function(cssrules, outer) {
      var embraced = [];
      for (var i in cssrules) {
	var selectors = cssrules[i].selectors;
	var newselectors = [];
	for (var j in selectors) {
	  newselectors.push(outer + " " + selectors[j]);
	}
	embraced.push({ selectors: newselectors, styletext: cssrules[i].styletext});
      }
      return embraced;
    },
    join: function(cssrules) {
      var joined = [];
      for (var i in cssrules) {
	var cssstring = cssrules[i].selectors.join(",") + " " + cssrules[i].styletext;
	joined.push(cssstring);
      }
      return joined;
    },
  };
})();

// var u = self.Qst.CSSUtil;
// var csstext = ".qstnr-propsheet button, .qstnr-propsheet input {" +
//     "    border: 2px outset buttonface;"+
//     "    padding:4px;"+
//     "    border-radius: 3px;"+
//     "    background-color: white;"+
//     "    vertical-align: top;"+
//     "}"+
//     ".qstnr-additem {"+
//     "    margin: 10px 0;/* abc } \\*/ *\\/ */"+
//     "}"+
//     ""+
//     ".qstnr-propsheet-title {"+
//     "    "+
//     "}"+
//     "div.loading {"+
//     "    background-image: url('ajax-loader.gif');"+
//     "    background-repeat: no-repeat;"+
//     "    background-position: center;"+
//     "}";

// var cssrules = u.split(csstext);
// console.log(cssrules);

// newrules = u.embrace(cssrules, "body");

// console.log(newrules);

// console.log(u.join(newrules));
