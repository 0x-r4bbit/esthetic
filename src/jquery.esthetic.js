(function ($, window, undefined){
  'use strict';

  // stack for all Esthetic instances
  var stack  = [];

  // unique identifier start with 0
  var unique = 0;

  var defaults = {
    'cssClasses': {
      'btn': 'esthetic-trigger',
      'item': 'esthetic-item',
      'selected': 'esthetic-item-selected',
      'list': 'esthetic-list',
      'input': 'esthetic-input',
      'wrap': 'esthetic-select'
    },
    'events': ['touchstart', 'mousedown', 'focusin'/*, 'keydown'*/],
    'hidden': 'hidden'
  };

  // Esthetic constructor
  function Esthetic (select, settings){

    $.extend(this, {
      options: $.extend({}, defaults, settings),
      isVisible: false,
      select: select,
      $select: $(select),
      id: unique++, // increase and set Instance ID
      onCreate: function () {},
      onChange: function () {},
      onUpdate: function () {}
    }, settings);

    this.initialize();
  }

  Esthetic.prototype.initialize = function (update) {
    // initiate parser
    this.List = new EstheticList(this.select, this.options);
    this.$elm = $('<div class="' + this.options.cssClasses.wrap + '" />');
    this.$elm.append('' +
      '<button class="' + this.options.cssClasses.btn + '">' +
      '  <span>' + this.List.selected.text + '</span>' +
      '</button>' +
      '<div class="' + this.options.cssClasses.list + '"></div>');

    this.$trigger = this.$elm.find('.' + this.options.cssClasses.btn);
    this.$list    = this.$elm.find('.' + this.options.cssClasses.list);

    this.eventStream();
    this.onCreate();


    if(update) {
      this.$select.next().remove();
    } else {
      stack.push(this);
    }

    this.$select.after(this.$elm);
  };

  Esthetic.prototype.eventStream = function () {
    var _this = this;

    var triggers = objToArr(_this.options.cssClasses, '.');
    var events   = this.options.events;

    _this.$elm.on(events.join(' '), triggers.join(', '), function(e) {

      e.preventDefault();
      e.stopPropagation();

      var $this = $(this);
      //var type = e.type;
      //var keyCode = e.keyCode;

      // keycodes used
      // 9:  tab
      // 40: down
      // 39: right
      // 38: up
      // 37: left
      //var keys = [9,40,39,38,37];

      if(!_this.isVisible) {
        _this.$list.html(_this.List.toHtml());
        _this.toggle(_this.id);
      } else {
        _this.toggle();
      }

      if($this.hasClass(_this.options.cssClasses.item)) {
        var value = $this.find('button').attr('data-esthetic-val');

        _this.List.updateSelected(value);

        _this.$select
          .find('option[value="' + value + '"]')
          .prop('selected', true);

        _this.$trigger.text($this.text());
      }

    });
  };

  Esthetic.prototype.toggle = function(id) {
    if(typeof(id) === 'number') {
      stack[id].show();
      return;
    }

    $.map(stack, function(item){
      item.hide();
    });
  };

  Esthetic.prototype.hide = function() {
    this.isVisible = false;
    this.$elm.find('ul').eq(0).attr('hidden', true);
  };

  Esthetic.prototype.show = function() {
    this.isVisible = true;
    this.$elm.find('ul').eq(0).attr('hidden', false);
  };

  Esthetic.prototype.update = function() {
    this.initialize(true);
  };

  function EstheticList (select, options) {
    this.options = options;
    this.selected = null;
    this.grpIdx = 0;
    this.parsed = this.parse(select);
    this.html = '';

    return this;
  }

  EstheticList.prototype.updateSelected = function(value) {
    for(var i=0;i<this.parsed.length;i++) {
      this.parsed[i].selected = (this.parsed[i].value === value);
    }
    this.toHtml(true);
  };

  EstheticList.prototype.toHtml = function (refresh) {

    // caching if needed
    if(this.html.length && !refresh) {
      return this.html;
    }

    var html = '', list = this.parsed, cssClasses = this.options.cssClasses;

    var chunk = function(item) {
      return '' +
        '<li ' +
        ' class="' + cssClasses.item + ' ' + ((item.selected) ? cssClasses.selected : '') + '" ' +
        '">' +
        ' <button' +
        ' data-esthetic-val="' + item.value + '"' +
        '   value="' + item.value + '">' + item.text +
        '</button>' +
        '</li>';
    };

    for(var i=0; i<list.length; i++) {
      if(list[i].group) {
        var grpIdx = list[i].grpIdx;
        html += '<li><span>' + list[i].label + '</span><ul>';
        while(list[i] && grpIdx === list[i].grpIdx) {
          html += chunk(list[i]);
          i++;
        }
        html += '</ul></li>';
      } else {
        html += chunk(list[i]);
      }
    }
    this.html = '<ul hidden>' + html + '</ul>';

    return this.html;
  };

  EstheticList.prototype.parse = function(select) {
    this.parsed = [];
    for(var i = 0; i < select.childNodes.length; i++) {
      var node = select.childNodes[i];
      if (node.nodeName.toUpperCase() === 'OPTGROUP') {
        this.addGroup(node);
      } else if(node.nodeName.toUpperCase() === 'OPTION') {
        this.addOption(node, {group: false, label: false});
      }
    }
    return this.parsed;
  };

  EstheticList.prototype.addOption = function (node, options) {
    this.parsed.push({
      text:     node.text,
      value:    node.value,
      selected: node.selected,
      group:    options.group,
      label:    options.label,
      grpIdx:   (options.group) ? this.grpIdx : -1,
      disabled: node.disabled
    });
    if(node.selected) {
      this.selected = node;
    }
  };

  EstheticList.prototype.addGroup = function (group) {
    this.grpIdx++;
    for(var i = 0; i < group.children.length; i++) {
      this.addOption(group.children[i], {group: true, label: group.label});
    }
  };

  // Helper Functions
  // ================================================================================
  var objToArr = function(obj, pad) {
    var arr = [];
    for (var key in obj) {
      arr.push(pad + obj[key]);
    }
    return arr;
  };

  // jQUERY BRIDGE
  $.fn.esthetic = function (options) {
    return this.each(function (){
      $(this).data('esthetic', new Esthetic(this, options));
    });
  };

  // expose to global object window
  window.Esthetic = Esthetic;

}(jQuery, window));
