/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */
 
$(function() {

  function $_(tag) { return $('<' + tag + ' />'); }
  function $_div() { return $_('div'); }
  function $_label() { return $_('label'); }
  function $_i() { return $_('i'); }
  function $_header() { return $_('header'); }
  function $_b() { return $_('b'); }

  var $body = $('body');

  var View = function() {
    this.controller = null;

    this.load = function() {
      return null;
    };
    this.setController = function(controller) {
      if (!(controller instanceof ViewController)) throw new Error('controller 格式錯誤！');
      this.controller = controller;
    };
  }

  var TableViewCell = function(title, subtitle, event, switchVal, option) {
    View.call(this);

    this.setSection = function(section) {
      if (!(section instanceof TableViewSection)) throw new Error('section 格式錯誤！');
      this.section = section;
      return this;
    };

    this.load = function() {
      var $label = $_label();
      return this.switchVal !== null
        ? $label.attr('id', this.option.id)
                .attr('class', this.option.class)
                .addClass(this.switchVal ? 'a' : 'b')
                .attr('data-subtitle', this.subtitle)
                .text(this.title)
                .append($_i().click(function() {
                  $label.attr('class', $label.hasClass('a') ? 'b' : 'a');
                  this.event && this.event.bind(this.section.tableView.controller.navigation, $label.hasClass('a') ? true : false)();
                }.bind(this)))
        : $label.attr('id', this.option.id)
                .attr('class', this.option.class)
                .attr('data-subtitle', this.subtitle)
                .text(this.title)
                .append($_i())
                .click(this.event && this.event.bind(this.section.tableView.controller.navigation));
    };

    if (typeof subtitle === 'function') {
      option = switchVal;
      switchVal = event;
      event = subtitle;
      subtitle = null;
    }

    if (typeof subtitle === 'boolean') {
      option = switchVal;
      switchVal = subtitle;
      subtitle = null;
    }

    this.section = null;
    this.title = typeof title === 'string' ? title : '';
    this.subtitle = typeof subtitle === 'string' ? subtitle : null;
    this.event = typeof event === 'function' ? event : null;
    this.switchVal = switchVal !== null && typeof switchVal === 'boolean' ? switchVal : null;
    this.option = $.extend({ id: null, class: null }, option);
  }
  TableViewCell.prototype = Object.create(View.prototype);

  var TableViewSection = function(title, cells, option) {
    View.call(this);
    
    this.setTableView = function(tableView) {
      if (!(tableView instanceof TableView)) throw new Error('tableView 格式錯誤！');
      this.tableView = tableView;
      return this;
    };

    this.load = function() {
      return $_div().attr('id', this.option.id)
                    .attr('class', this.option.class)
                    .attr('data-title', this.title).attr('id', this.option.id)
                    .append(this.cells.map(function(cell) {
                      return cell.load();
                    }));
    };

    if ($.isArray(title)) {
      option = cells;
      cells = title;
      title = null;
    }
    
    this.tableView = null;
    this.title = typeof title === 'string' ? title : null;
    this.cells = $.isArray(cells) ? cells.filter(function(cell) { return cell instanceof TableViewCell; }).map(function(cell) { return cell.setSection(this); }.bind(this)) : [];
    this.option = $.extend({ id: null, class: null }, option);
  };
  TableViewSection.prototype = Object.create(View.prototype);

  var TableView = function(sections, option) {
    View.call(this);

    this.load = function() {
      return $_div().attr('id', this.option.id)
                    .attr('class', this.option.class)
                    .append(this.sections.map(function(section) {
                      return section.load();
                    }));
    };

    this.sections = $.isArray(sections) ? sections.filter(function(section) { return section instanceof TableViewSection; }).map(function(cell) { return cell.setTableView(this); }.bind(this)) : [];
    this.option = $.extend({ id: null, class: null }, option);
  };
  TableView.prototype = Object.create(View.prototype);

  var ViewController = function(title) {
    this.title = null;
    this.left = null;
    this.right = null;
    this.view = null;
    this.navigation = null;

    this.setNavigation = function(navigation) {
      if (!(navigation instanceof Navigation)) throw new Error('navigation 格式錯誤！');
      this.navigation = navigation
      return this;
    }
    this.setTitle = function(text, click) {
      if (typeof text !== 'string') throw new Error('text 格式錯誤！');
      if (typeof click !== 'undefined' && typeof click !== 'function') throw new Error('click 格式錯誤！');
      this.title = { text: text, click: click };
      return this;
    };
    this.setLeft = function(text, click) {
      if (typeof text !== 'string') throw new Error('text 格式錯誤！');
      if (typeof click !== 'undefined' && typeof click !== 'function') throw new Error('click 格式錯誤！');
      this.left = { text: text, click: click };
      return this;
    };
    this.setRight = function(text, click) {
      if (typeof text !== 'string') throw new Error('text 格式錯誤！');
      if (typeof click !== 'undefined' && typeof click !== 'function') throw new Error('click 格式錯誤！');
      this.right = { text: text, click: click };
      return this;
    };
    this.setView = function(view) {
      if (!(view instanceof View)) throw new Error('View 格式錯誤！');
      view.setController(this)
      this.view = view;
      return this;
    };

    this.load = function() {
      var view = this.view ? this.view.load() : '';

      view = $_div().append(typeof view === 'string' || (view instanceof jQuery) ? view : '');
      var title = this.title && $_b().text(this.title.text).click(this.title.click ? this.title.click.bind(this.navigation) : null)
      var left  = this.left  && $_label().text(this.left.text).click(this.left.click ? this.left.click.bind(this.navigation) : null)
      var right = this.right && $_label().text(this.right.text).click(this.right.click ? this.right.click.bind(this.navigation) : null)

      return $_div().append(
        $_header().append(left).append(title).append(right)).append(
        view);
    };

    if (typeof title === 'string')
      this.setTitle(title);
  }

  var Navigation = function(rootVC, option) {
    
    if (typeof rootVC === 'undefined') throw new Error('沒有 Root ViewController！');

    var clean = function() {
      this.E = this.V = null;
      this.Vs = [];
    };

    this.present = function(completion, animate) {
      animate = typeof animate === 'undefined' ? true : animate
      completion = typeof completion === 'function' ? completion.bind(this) : null

      this.E.appendTo($body);
      
      if (animate) {
        setTimeout(function() { this.E.addClass('a'); completion && completion(); }.bind(this), 100);
      } else {
        this.E.addClass('a'); completion && completion();
      }
      return this;
    };

    this.push = function(vc, completion, animate) {
      if (!(vc instanceof ViewController)) throw new Error('ViewController 格式錯誤！');
      
      animate = typeof animate === 'undefined' ? true : animate
      completion = typeof completion === 'function' ? completion.bind(this) : null

      if (this.Vs.length && vc.left === null)
        vc.setLeft('返回', this.pop.bind(this, true));

      vc.setNavigation(this);

      vc = vc.load();

      this.V.append(vc);

      if (animate) {
        setTimeout(function() { vc.addClass('a'); completion && completion(); }.bind(this), 100);
      } else {
        vc.addClass('a'); completion && completion();
      }

      this.Vs.push(vc);
    };

    this.pop = function(completion, animate) {
      animate = typeof animate === 'undefined' ? true : animate
      completion = typeof completion === 'function' ? completion.bind(this) : null

      var vc = this.Vs.pop();

      if (!vc) return;

      vc.removeClass('a');

      if (animate) {
        setTimeout(function() { vc.remove(); completion && completion(); }.bind(this), 300);
      } else {
        vc.remove(); completion && completion();
      }

      return this;
    };


    this.dismiss = function(completion, animate) {
      animate = typeof animate === 'undefined' ? true : animate
      completion = typeof completion === 'function' ? completion.bind(this) : null

      this.E.removeClass('a');
      
      if (animate) {
        setTimeout(function() { this.E.remove(); clean(); completion && completion(); }.bind(this), 300);
      } else {
        this.E.remove(); clean(); completion && completion();
      }
    };

    clean();

    option = $.extend({ id: null, class: null, showClass: 'show' }, option);

    this.E  = $_div().attr('id', option.id).attr('class', option.class).append($_label());
    this.V  = $_div();
    this.Vs = [];

    this.E.append(this.V);
    this.push(rootVC, null, false)
  }

  TableViewCell.create = function(title, subtitle, event, switchVal, option) { return new TableViewCell(title, subtitle, event, switchVal, option); }
  TableViewSection.create = function(title, cells, option) { return new TableViewSection(title, cells, option); }
  TableView.create = function(sections, option) { return new TableView(sections, option); }
  ViewController.create = function(title) { return new ViewController(title); }
  Navigation.create = function(rootVC, option) { return new Navigation(rootVC, option); }

  var sections = [
    TableViewSection.create("aaa", [
      TableViewCell.create('交通路況'),
      TableViewCell.create('交通路況', '顯示時間'),
      
      TableViewCell.create('交通路況', function() {
        this.dismiss()
        
      }),
      TableViewCell.create('交通路況', function() {
        console.error(this);
        
        this.dismiss()
      }, true),
      TableViewCell.create('交通路況', '顯示時間', function() {
        this.push(ViewController.create('啦啦啦'))

      }),

      TableViewCell.create('交通路況', function() {}, true),
      TableViewCell.create('交通路況', '顯示時間', function() {}, true),

      TableViewCell.create('交通路況', function() {}, false),
      TableViewCell.create('交通路況', '顯示時間', function() {}, false),
    ]),
  ];

  var tableview = TableView.create(sections, { class: 'x0' });

  var vc = ViewController.create("asd")
                         .setLeft("新增", function() {
                           this.push(ViewController.create('啦啦啦'))
                         })
                         .setRight("關閉", function() {
                           this.dismiss(function() {
                            console.error(this);
                            
                           });
                         })
                         .setView(tableview)

  Navigation.create(vc, { id: 'x', showClass: 'a' })
            .present(function() {
              
            })




});
