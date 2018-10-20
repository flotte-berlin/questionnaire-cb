/**
 * dependency.js
 *
 * Copyright (C) 2015, 2016 Hiroyoshi Kurohara(MicroGadget,inc.).
 * kurohara@yk.rim.or.jp, kurohara@microgadget-inc.com
 * Author: Hiroyoshi Kurohara(Microgadget,inc.)
 * Author URI: http://www.microgadget-inc.com/
 * License: GPLv2 or later
 */

jQuery(function($) {
  var NodeList = self.Qst.NodeList = [];
  self.Qst.getNodeList = function() {
    var nodeList = Qst.NodeList;
    Qst.NodeList = [];;
    return nodeList;
  };
  var Node = self.Qst.Node = function Node(op, nparents) {
    this.op = op;
    this.child = null;
    this.parents = new Array(nparents);
    Qst.NodeList.push(this);
  };

  Node.prototype = _.extend(Node.prototype, {
    _alltrue: function() {
      for (var i = 0;i <  this.parents.length;++i) {
	if (!this.parents[i]) {
	  return false;
	}
      }
      return true;
    },
    _onetrue: function() {
      for (var i in this.parents) {
	if (this.parents[i]) {
	  return true;
	}
      }
      return false;
    },
    reset: function() {
      for (var i = 0;i < this.parents.length;++i) {
	this.parents[i] = false;
      }
    },
    sendResult: function(index, bresult) {
      this.parents[index] = bresult;
      var bself = false;
      switch (this.op) {
      case 'and':
	bself = this._alltrue();
	break;
      case 'or':
	bself = this._onetrue();
	break;
      case 'not':
	bself = ! this._onetrue();
	break;
      default:
      }
      if (this.child) {
	this.child(bself);
      }
    },
    setChild: function(f) {
      this.child = f;
    },
    getLink: function(index) {
      return (new Function('result', '{ this.sendResult(' + index + ', result); }')).bind(this);
    },
    getResetLink: function() {
      return (new Function('', '{ this.reset(); }')).bind(this);
    },
  });
  Node.prototype.constructor = Node;
  Node.construct = function(struct, terminals) {
    var node;
    var childarray;
    for (key in struct) {
      switch (key) {
      case 'or':
	node = new Node('or', struct.or.length);
	childarray = struct.or;
	break;
      case 'and':
	node = new Node('and', struct.and.length);
	childarray = struct.and;
	break;
      case 'not':
	node = new Node('not', 1);
	childarray = [ struct.not ];
	break;
      case 'item':
	// special care for 'questionnaire plugin'
	// (this part should be made more generic)
	if (struct.item === 'required' || struct.item === 'none') {
	  break;
	}
	node = new Node('or', 1);
	var link = node.getLink(0);
	terminals.push({ link: link, item: struct.item });
	return node;
	break;
      default:
	return Node.construct(struct[key], terminals);
	break;
      }
      for (var i in childarray) {
	var link = node.getLink(i);
	var parent = Node.construct(childarray[i], terminals);
	if (parent) {
	  parent.setChild(link);
	} else {
	  // for node which can't be triggered('required'...)
	  if (node.op === 'and') {
	    node.parents[i] = true;
	  } else if (node.op === 'or') {
	    node.parents[i] = false;
	  }
	}
      }
    }
    return node;
  };
});
