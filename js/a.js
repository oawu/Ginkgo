/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */
 
$(function() {
  function $_(tag) { return $('<' + tag + ' />'); }
  function $_a() { return $_('a'); }
  function $_b() { return $_('b'); }
  function $_button() { return $_('button'); }
  function $_div() { return $_('div'); }
  function $_figcaption() { return $_('figcaption'); }
  function $_figure() { return $_('figure'); }
  function $_h1() { return $_('h1'); }
  function $_h2() { return $_('h2'); }
  function $_header() { return $_('header'); }
  function $_i() { return $_('i'); }
  function $_input() { return $_('input'); }
  function $_label() { return $_('label'); }
  function $_li() { return $_('li'); }
  function $_p() { return $_('p'); }
  function $_section() { return $_('section'); }
  function $_span() { return $_('span'); }
  function $_time() { return $_('time'); }
  function $_ul() { return $_('ul'); }
  function $_form() { return $_('form'); }

  BarButtonItem.prototype = Object.create(View.prototype);
  NavigationBar.prototype = Object.create(View.prototype);
  NavigationController.prototype = Object.create(ViewController.prototype);
  TableViewCell.prototype = Object.create(View.prototype);
  TableViewSection.prototype = Object.create(View.prototype);
  TableViewController.prototype = Object.create(ViewController.prototype);
  ArticleViewController.prototype = Object.create(ViewController.prototype);
  HistotyMapViewController.prototype = Object.create(ViewController.prototype);
  WebTableViewController.prototype = Object.create(TableViewController.prototype);
  AlertViewController.prototype = Object.create(ViewController.prototype);
  FeatureViewController.prototype = Object.create(ViewController.prototype);
  TableViewInputCell.prototype = Object.create(View.prototype);
  TableViewButtonCell.prototype = Object.create(View.prototype);
  FormTableViewController.prototype = Object.create(TableViewController.prototype);

  function Window(option) {
    if (!(this instanceof Window)) return new Window(option);

    var clean = function() {
      this.E.remove();
      this.viewControllers = [];
    };

    this.present = function(viewController, completion, animate) {
      if (!(viewController instanceof ViewController))
        throw new Error('viewController 格式錯誤！');
      
      if (this.E === null)
        this.E = $_div().attr('id', this.option.id)
                        .attr('class', this.option.class)
                        .appendTo(Window.body());
      
      var $viewController = viewController.viewWillLoad().viewDidLoad();
      this.viewControllers.push($viewController);
      this.E.append($viewController);

      animate = typeof animate === 'undefined' ? true : animate;
      completion = typeof completion === 'function' ? completion.bind(viewController) : null;

      if (animate) {
        setTimeout(function() {
          $viewController.addClass(viewController.presentClass());
          
          setTimeout(function() {
            completion && completion();
            viewController.viewEndLoad();
          }.bind(this), 300);
        }.bind(this), 100);
      } else {
        $viewController.addClass(viewController.presentClass());
        completion && completion();
        viewController.viewEndLoad();
      }
      return this;
    };
    this.dismiss = function(viewController, completion, animate) {
      if (!(viewController instanceof ViewController))
        throw new Error('viewController 格式錯誤！');
      
      var $viewController = this.viewControllers.pop();

      if ($viewController !== viewController.viewDidLoad())
        return false;

      animate = typeof animate === 'undefined' ? true : animate;
      completion = typeof completion === 'function' ? completion.bind(viewController) : null;
      
      $viewController.removeClass(viewController.presentClass());
      if (animate) {
        setTimeout(function() { 
          $viewController.remove();
          this.viewControllers.length || clean.bind(this)();
          completion && completion();
        }.bind(this), 300);
      } else {
        $viewController.remove();
        this.viewControllers.length || clean.bind(this)();
        completion && completion();
      }
    };

    this.E = null; // element
    this.viewControllers = [];
    this.option = $.extend({ id: null, class: null }, option);
  }

  function View(option) {
    if (!(this instanceof View)) return new View(option);

    var $el = null, controller = null;
    
    this._actions = [];
    this.append = function(el) {        $el === null ? this._actions.push({ action: 'append', param: el })                   : $el.append(el); return this; };
    this.attr = function(key, val) {    $el === null ? this._actions.push({ action: 'attr', param: { key: key, val: val } }) : $el.attr(key, val); return this; };
    this.addClass = function(name) {    $el === null ? this._actions.push({ action: 'addClass', param: name })               : $el.addClass(name); return this; };
    this.text = function(text) {        $el === null ? this._actions.push({ action: 'text', param: text })                   : $el.text(text); return this; };
    this.click = function(click) {      $el === null ? this._actions.push({ action: 'click', param: click })                 : $el.unbind('click').click(click.bind(controller)); return this; };
    this.removeClass = function(name) { $el === null ? this._actions.push({ action: 'removeClass', param: name })            : $el.removeClass(name); return this; };

    this.setUpEl = function() {
      var $el = this.$el.clone(true);

      this._actions.forEach(function(action) {
        switch(action.action) {
          case 'append': this.append(action.param); break;
          case 'attr': this.attr(action.param.key, action.param.val); break;
          case 'addClass': this.addClass(action.param); break;
          case 'text': this.text(action.param); break;
          case 'click': this.unbind('click').click(action.param && action.param.bind(controller)); break;
          case 'removeClass': this.removeClass(action.param); break;
          default: break;
        }
      }.bind($el));

      return $el;
    }

    this.viewWillLoad = function() { return this; };
    this.viewDidLoad = function() { return $el !== null ? $el : $el = this.setUpEl(); };
    this.viewEndLoad = function() { return this; };
    // this.viewReLoad = function() { if ($el !== null) $el = this.setUpEl(); return this;  };
    
    this.controller = function(c, b) { if (typeof c === 'undefined') return controller; if (c instanceof ViewController) controller = c; return this; };

    option = $.extend({ id: null, class: 'View', $el: $_div() }, option);
    
    if (!(option.$el instanceof jQuery))
      throw new Error('View $el(元素) 格式錯誤，必須要為 jQuery 元素！');

    this.$el = option.$el;
    this.attr('id', option.id)
        .attr('class', option.class);
    
    option = null;
    delete option;
  }

  function ViewController(option) {
    if (!(this instanceof ViewController)) return new ViewController(option);

    var presentClass = 'present',
        $el = null,

        navigationController = null,
        left = null,
        title = null,
        right = null;

    this._actions = [];

    this.append = function(el) {        $el === null ? this._actions.push({ action: 'append', param: el })                   : $el.append(el); return this; };
    this.attr = function(key, val) {    $el === null ? this._actions.push({ action: 'attr', param: { key: key, val: val } }) : $el.attr(key, val); return this; };
    this.addClass = function(name) {    $el === null ? this._actions.push({ action: 'addClass', param: name })               : $el.addClass(name); return this; };
    this.removeClass = function(name) { $el === null ? this._actions.push({ action: 'removeClass', param: name })            : $el.removeClass(name); return this; };

    this.presentClass = function(name) { return typeof name === 'undefined' ? presentClass : presentClass = name };
    
    this.setUpEl = function() {
      var $el = this.$el.clone();

      this._actions.forEach(function(action) {
        switch(action.action) {
          case 'append': this.append(action.param); break;
          case 'attr': this.attr(action.param.key, action.param.val); break;
          case 'addClass': this.addClass(action.param); break;
          case 'removeClass': this.removeClass(action.param); break;
          default: break;
        }
      }.bind($el));

      return $el;
    }
    
    this.present = function(completion, animate) { Window.main().present(this.navigationController() || this, completion, animate); };
    this.dismiss = function(completion, animate) { Window.main().dismiss(this.navigationController() || this, completion, animate); };
    
    this.viewWillLoad = function() { return this; };
    this.viewDidLoad = function() { if ($el !== null) return $el; else return $el = this.setUpEl() .append(this.view.controller(this).viewWillLoad().viewDidLoad()); };
    this.viewEndLoad = function() { return this; };
    
    this.navigationController = function(n) { if (typeof n === 'undefined') return navigationController; if (n instanceof NavigationController) navigationController = n; return this; };
    this.left  = function(text, click) { if (typeof text === 'undefined') return left; if (this.navigationController() && this.navigationController().navigationBar()) { this.navigationController().navigationBar().left(text, click); return this; } if (left === null) left  = BarButtonItem(null, null, { $el: $_label() }); if (typeof text === 'string') left.text(text);  if (typeof click === 'function') left.click(click);  return this; };
    this.title = function(text, click) { if (typeof text === 'undefined') return title; if (this.navigationController() && this.navigationController().navigationBar()) { this.navigationController().navigationBar().title(text, click); return this; } if (title === null) title = BarButtonItem(null, null, { $el: $_header() }); if (typeof text === 'string') title.text(text); if (typeof click === 'function') title.click(click); return this; };
    this.right = function(text, click) { if (typeof text === 'undefined') return right; if (this.navigationController() && this.navigationController().navigationBar()) { this.navigationController().navigationBar().right(text, click); return this; } if (right === null) right = BarButtonItem(null, null, { $el: $_label() }); if (typeof text === 'string') right.text(text); if (typeof click === 'function') right.click(click); return this; };
    this.pop = function(completion, animate) { return this.navigationController() ? this.navigationController().pop(completion, animate) : this; };
    this.push = function(viewController, completion, animate) { return this.navigationController() ? this.navigationController().push(viewController, completion, animate) : this; };

    this.view = View();
    
    option = $.extend({ id: null, class: 'Controller', presentClass: 'present', $el: $_div() }, option);
    
    this.$el = option.$el;
    this.attr('id', option.id)
        .attr('class', option.class)
        .presentClass(option.presentClass);
    
    option = null;
    delete option;
  }

  function BarButtonItem(text, click, option) {
    if (!(this instanceof BarButtonItem)) return new BarButtonItem(text, click, option);
    else View.call(this, $.extend({ class: null }, option));
    option = null; delete option;
  }

  function NavigationBar(t, r, l, option) {
    if (!(this instanceof NavigationBar)) return new NavigationBar(t, r, l, option);
    else View.call(this, $.extend({ class: 'NavigationBar' }, option));
    
    var $el = null, navigationController = null, left  = l, title = t, right = r;

    this.navigationController = function(n) { if (typeof n === 'undefined') return navigationController; if (n instanceof NavigationController) navigationController = n; return this };
    this.left  = function(text, click, className) { if (typeof text === 'undefined') return left; if (left === null) left = BarButtonItem(null, null, { $el: $_label() }); if (typeof text === 'string') left.text(text); if (typeof click === 'function') left.click(click); left.addClass(className); return this; };
    this.title = function(text, click, className) { if (typeof text === 'undefined') return title; if (title === null) title = BarButtonItem(null, null, { $el: $_header() }); if (typeof text === 'string') title.text(text); if (typeof click === 'function') title.click(click); title.addClass(className); return this; };
    this.right = function(text, click, className) { if (typeof text === 'undefined') return right; if (right === null) right = BarButtonItem(null, null, { $el: $_label() }); if (typeof text === 'string') right.text(text); if (typeof click === 'function') right.click(click); right.addClass(className); return this; };

    this.viewDidLoad = function() { return $el !== null ? $el : $el = this.setUpEl().append(left && left.controller(this.navigationController()).viewWillLoad().viewDidLoad()).append((title ? title : this.title('')).controller(this.navigationController()).viewWillLoad().viewDidLoad()).append(right && right.controller(this.navigationController()).viewWillLoad().viewDidLoad()); };
    
    option = null; delete option;
  }
  
  function NavigationController(rootViewController, option) {
    if (!(this instanceof NavigationController)) return new NavigationController(rootViewController, option);
    else ViewController.call(this, option);

    if (typeof rootViewController === 'undefined') throw new Error('NavigationController 沒有 Root ViewController！');

    var pushClass = 'push', $el = null, viewControllerContainers = [];

    function setController(viewController) {
      viewController.removeClass('Controller').addClass('NavigationController').viewWillLoad();
      if (typeof viewController.title === 'string') this.navigationBar().title(viewController.title);
      return viewController.append(this.viewControllers().length > 1 && this.navigationBar().left() === null ? this.navigationBar().left('返回', this.pop, 'back').viewDidLoad() : this.navigationBar().viewDidLoad());
    }

    this.viewDidLoad = function() { return $el !== null ? $el : $el = this.setUpEl().append(setController.call(this, rootViewController.navigationController(this)).addClass(this.pushClass()).viewDidLoad()); };
    this.viewEndLoad = function() { this.viewController().viewEndLoad(); return this; };

    this.push = function(viewController, completion, animate) {
      if (!(viewController instanceof ViewController)) throw new Error('viewController 格式錯誤！');
      
      viewController.navigationController(this)
      var navigationBar = NavigationBar(viewController.title(), viewController.right(), viewController.left()).navigationController(this);

      viewControllerContainers.push({ navigationBar: navigationBar, viewController: viewController });

      if ($el === null) return this;

      $el.append(setController.call(this, viewController).viewDidLoad());

      animate = typeof animate === 'undefined' ? true : animate;
      completion = typeof completion === 'function' ? completion.bind(this) : null;

      if (animate) {
        setTimeout(function() {
          viewController.viewDidLoad().addClass(this.pushClass())
          setTimeout(function() {
            completion && completion();
            viewController.viewEndLoad();
          }.bind(this), 300);
        }.bind(this), 100);
      } else {
        viewController.viewDidLoad().addClass(this.pushClass());
        completion && completion();
        viewController.viewEndLoad();
      }

      return this;
    };

    this.pop = function(completion, animate) {
      animate = typeof animate === 'undefined' ? true : animate;
      completion = typeof completion === 'function' ? completion.bind(this) : null;

      var viewControllerContainer = viewControllerContainers.pop();
      if (viewControllerContainer.viewController == rootViewController) return this.dismiss(completion, animate);

      var $viewController = viewControllerContainer.viewController.viewDidLoad();
      $viewController.removeClass(this.pushClass());

      if (animate) {
        setTimeout(function() {
          $viewController.remove();

          viewControllerContainer = null;
          delete viewControllerContainer;

          $viewController = null;
          delete $viewController;

          completion && completion();
        }.bind(this), 300);
      } else {
        $viewController.remove();
        viewControllerContainer = null;
        delete viewControllerContainer;

        $viewController = null;
        delete $viewController;
        completion && completion();
      }
    };

    this.pushClass = function(name) { if (typeof name === 'undefined') return pushClass; pushClass = name; return this; };

    // 取得所有的 viewController
    this.viewControllers = function() {  return viewControllerContainers; }
    
    // 取得現在的 viewController
    this.viewController = function() {  if (!viewControllerContainers.length) throw new Error('NavigationController 錯誤！'); else return viewControllerContainers[viewControllerContainers.length - 1].viewController; }
    
    // 取得現在的 navigationBar
    this.navigationBar = function() {  if (!viewControllerContainers.length) throw new Error('NavigationController 錯誤！'); else return viewControllerContainers[viewControllerContainers.length - 1].navigationBar; }

    this.push(rootViewController, null, false).pushClass($.extend({ pushClass: 'push' }, option).pushClass);
    
    option = null; delete option;
  }

  function TableViewCell(icon, title, subtitle, event, val, option) {
    if (!(this instanceof TableViewCell)) return new TableViewCell(icon, title, subtitle, event, val, option);
    else View.call(this, $.extend({ $el: $_label(), class: 'TableViewCell' + (icon ? ' TableViewCellIcon ' + icon : '') }, option));
    
    var $el = null,
        arrowClass = 'TableViewCellArrow',
        switchClass = 'TableViewCellSwitch',
        switchOnClass = 'TableViewCellSwitchOn';


    this.viewDidLoad = function() {
      if ($el !== null) return $el;
      $el = this.setUpEl();
      return typeof val === 'boolean'
        ? $el.attr('data-subtitle', subtitle).addClass(this.switchClass()).addClass(val ? this.switchOnClass() : null).text(title).append($_i().click(function() { if ($el.hasClass(this.switchOnClass())) $el.removeClass(this.switchOnClass()); else $el.addClass(this.switchOnClass()); event && event.bind(this.controller(), $el.hasClass(this.switchOnClass()))(); }.bind(this)))
        : $el.attr('data-subtitle', subtitle).addClass(event ? this.arrowClass() : null).text(title).append($_i()).click(event && event.bind(this.controller()));
    };

    this.arrowClass = function(name) { if (typeof name === 'undefined') return arrowClass; arrowClass = name; return this; };
    this.switchClass = function(name) { if (typeof name === 'undefined') return switchClass; switchClass = name; return this; };
    this.switchOnClass = function(name) { if (typeof name === 'undefined') return switchOnClass; switchOnClass = name; return this; };
    
    this.arrowClass($.extend({ arrowClass: 'TableViewCellArrow' }, option).arrowClass);
    this.switchClass($.extend({ switchClass: 'TableViewCellSwitch' }, option).switchClass);
    this.switchOnClass($.extend({ switchOnClass: 'TableViewCellSwitchOn' }, option).switchOnClass);
    
    option = null; delete option;
  }

  function TableViewInputCell(title, name, value, placeholder, option) {
    if (!(this instanceof TableViewInputCell)) return new TableViewInputCell(title, name, value, placeholder, option);
    
    if (!((typeof name === 'string' && name.length > 0) || typeof name === 'number')) throw new Error('TableViewInputCell name 是必須的！');
    if (!(typeof value === 'string' || typeof value === 'number')) value = null;
    if (!(typeof placeholder === 'string' || typeof placeholder === 'number')) placeholder = null;
    if (!(typeof title === 'string' || typeof title === 'number')) title = null;
    if (!(typeof option === 'object')) option = {};

    View.call(this, $.extend({ $el: $_label(), class: 'TableViewInputCell' }, option));

    var $el = null, $input = $_input(), attrs = $.extend({ type: 'text', minlength: 1, maxlength: 190, pattern: '.{1,190}', required: true }, option.attrs);

    this.viewDidLoad = function() {
      if ($el !== null) return $el;
      $el = this.setUpEl();
      return $el.attr('data-title', this.title()).append($input.attr(attrs).data('name', this.name()).val(this.value()).attr('placeholder', this.placeholder()));
    };

    this.$input = function() { return $input; };
    this.name = function(n) { if (typeof n === 'undefined' || n === null) return name; if ((typeof name === 'string' && name.length > 0) || typeof name === 'number') name = n; return this; };
    this.value = function(v) { if (typeof v === 'undefined' || v === null) return value; if (typeof value === 'string' || typeof value === 'number') value = v; return this; };
    this.placeholder = function(p) { if (typeof p === 'undefined' || p === null) return placeholder; if (typeof placeholder === 'string' || typeof placeholder === 'number') placeholder = p; return this; };
    this.title = function(t) { if (typeof t === 'undefined' || t === null) return title; if (typeof title === 'string' || typeof title === 'number') title = t; return this; };

    this.value(value);
    this.placeholder(placeholder);
    this.title(title);
    option = null; delete option;
  }

  function TableViewButtonCell(title, event, type, option) {
    if (!(this instanceof TableViewButtonCell)) return new TableViewButtonCell(title, event, type, option);
    
    if (!(typeof title === 'string' || typeof title === 'number')) title = '';
    if (!(typeof event === 'function')) event = null;
    if (!(typeof type === 'string' && (type == 'submit' || type == 'reset'))) type = 'submit';
    if (!(typeof option === 'object')) option = {};
    
    View.call(this, $.extend({ $el: $_button(), class: 'TableViewButtonCell' }, option));
    this.text(title).click(event).attr('type', type);
  }

  function TableViewSection(title, rows, option) {
    if (!(this instanceof TableViewSection)) return new TableViewSection(title, rows, option);
    
    if (!(typeof title === 'string' || typeof title === 'number')) title = null;
    if (!$.isArray(rows)) rows = [];
    if (!(typeof option === 'object')) option = {};

    View.call(this, $.extend({ class: 'TableViewSection' }, option));
    rows = rows.filter(function(cell) { return (cell instanceof TableViewCell) || (cell instanceof TableViewInputCell) || (cell instanceof TableViewButtonCell); });

    var $el = null;
    this.viewDidLoad = function() { return $el !== null ? $el : $el = this.setUpEl().attr('data-title', title).append(this.rows().map(function(cell) { return cell.controller(this.controller()).viewWillLoad().viewDidLoad(); }.bind(this))); };
    this.rows = function(r) {
      if (typeof r === 'undefined' || r === null) return rows;
      if ($.isArray(r)) rows = r;
      return this;
    };

    this.rows(rows);
    
    option = null; delete option;
  }

  function TableViewController(sections, option) {
    if (!(this instanceof TableViewController)) return new TableViewController(sections, option);

    if (!$.isArray(sections)) sections = [];
    if (!(typeof option === 'object')) option = {};

    ViewController.call(this, option);

    var $el = null, $view = null;

    this.viewDidLoad = function() {
      return $el !== null ? $el : $el = this.setUpEl().append($view = this.view.controller(this).viewWillLoad().viewDidLoad().append(sections.map(function(section) { return section.controller(this, 1).viewWillLoad().viewDidLoad(); }.bind(this))));
    };

    this.sections = function(s) { if (typeof s === 'undefined') return sections; sections = s.filter(function(t) { return t instanceof TableViewSection; }); return this.viewReLoad(); };
    this.viewReLoad = function() { if ($el === null) return this; $view.remove(); $el = $el.append($view = this.view.controller(this).viewWillLoad().viewDidLoad().append(sections.map(function(section) { return section.controller(this, 1).viewWillLoad().viewDidLoad(); }.bind(this)))); return this; };
    
    if (option && typeof option.view === 'object' && (option.view instanceof View))
      this.view = option.view;

    this.view.addClass('TableView');
    this.sections(sections);
    option = null; delete option;
  }

  function ArticleViewController(url, option) {
    if (!(this instanceof ArticleViewController)) return new ArticleViewController(url, option);
    else ViewController.call(this, option);

    this.viewEndLoad = function() {
      $.get(url).done(function(r) {
        
        this.title(r.title).view.append(
          r.articles.map(function(section) {
            return $_section().append(section.title && $_h2().text(section.title)).append(section.paragraphs && section.paragraphs.map(function(paragraph) {
              if (paragraph.type == 'text')
                return $_p().text(paragraph.val);
              if (paragraph.type == 'image')
                return $_p().append(
                  $_figure().css({'background-image': 'url(' + paragraph.url + ')'}).append(
                    $_figcaption().text(paragraph.val)));
              return null;
            }));
        })).append(
          r.timeAt && $_time().text(r.timeAt)).append(
          r.references && $_ul().attr('data-title', '以上參考').append(r.references.map(function(reference) {
            reference.link = reference.link ? reference.link : null;
            reference.title = reference.title ? reference.title : reference.link;
            return reference.title ? reference.link ? $_li().append($_a().text(reference.title).attr('href', reference.link)) : $_li().text(reference.title) : null;
        })));

        setTimeout(function() { this.view.addClass('aniShow'); }.bind(this), 100);

      }.bind(this));
      return this;
    };

    this.view.addClass('Article');
  }

  function HistotyMapViewController(url, option) {
    if (!(this instanceof HistotyMapViewController)) return new HistotyMapViewController(url, option);
    else ViewController.call(this, option);

    this.viewEndLoad = function() {
      // $.get(url).done(function(r) {
      // }.bind(this));

      this.view.append(
        $_b().text('2019 歷史紀錄')).append(
        $_span().text('0')).append(
        $_div().append(
          $_label()).append(
          $_label()));
      return this;
    };

    this.view.addClass('HistotyMap');
  }

  function WebTableViewController(url, option) {
    if (!(this instanceof WebTableViewController)) return new WebTableViewController(url, option);
    else TableViewController.call(this, [], option);

    this.viewEndLoad = function() {
      $.get(url).done(function(r) {
        r.title && this.title(r.title);

        return this.sections(r.sections.map(function(section) {
          var rows = section.rows ? section.rows.map(function(row) {
            if (!(typeof row.system === 'string' && typeof row.type === 'string' && typeof row.title === 'string' && row.system !== 'app'))
              return null;

            switch(row.type) {
              case "native":
                switch (row.nativeKey) {
                  case "traffic":   return TableViewCell(row.icon, row.title, row.subtitle, function(val) {}, true);
                  case "pathInfo":  return TableViewCell(row.icon, row.title, row.subtitle, function(val) {}, true);
                  case "pathLine":  return TableViewCell(row.icon, row.title, row.subtitle, function(val) {}, true);
                  case "pathTime":  return TableViewCell(row.icon, row.title, row.subtitle, function(val) {}, true);
                  case "heatmap":   return TableViewCell(row.icon, row.title, row.subtitle, function(val) {}, true);
                  case "direction": return TableViewCell(row.icon, row.title, row.subtitle, function() {});
                  case "score":     return null;
                  default: return null;
                }
              break;
              case "article":    return TableViewCell(row.icon, row.title, row.subtitle, function() { this.push(ArticleViewController(row.url).title(row.title)); });
              case "tableView":  return TableViewCell(row.icon, row.title, row.subtitle, function() { this.push(WebTableViewController(row.url).title(row.title)); });
              case "histotyMap": return TableViewCell(row.icon, row.title, row.subtitle, function() { this.push(HistotyMapViewController(row.url).title(row.title)); });
              case "url":        return TableViewCell(row.icon, row.title, row.subtitle, window.open.bind(null, row.url));
              case "fbUrl":      return TableViewCell(row.icon, row.title, row.subtitle, window.open.bind(null, row.url));
              case "feature":    return TableViewCell(row.icon, row.title, row.subtitle, function() { this.push(FeatureViewController(row.url).title(row.title)); });
              default: return null;
            }
          }).filter(function(row) { return row !== null; }) : [];

          return rows.length ? TableViewSection(typeof section.title === 'string' ? section.title : null, rows) : null;
        }).filter(function(section) { return section !== null; }));
      }.bind(this));
    };

    this.view.addClass('WebTableView');
  }

  function AlertViewController(t, m, a, option) {
    if (!(this instanceof AlertViewController)) return new AlertViewController(t, m, a, option);
    else ViewController.call(this, option);
    
    var $el = null, title = null, message = null, buttons = [];
    
    this.title = function(text) {
      if (typeof text === 'undefined' || text === null) return title;
      if (title === null) title = View({ $el: $_b(), class: 'Title' });
      if (typeof text === 'string') title.text(text);

      return this;
    };
    this.message = function(text) {
      if (typeof text === 'undefined' || text === null) return message;
      if (message === null) message = View({ $el: $_span(), class: 'Message' });
      if (typeof text === 'string') message.text(text);
      return this;
    };
    this.buttons = function(text, click) {
      if (typeof text === 'undefined') return buttons;

      var button = View({ $el: $_label() });

      if (typeof text === 'string')
        button.text(text);

      if (typeof click === 'function')
        button.click(click);

      buttons.push(button);
      if (buttons.length > 3)
        this.addClass('actionSheet');

      return this;
    };

    this.right = function(text, click) {
      if (typeof text === 'undefined')
        return right;

      if (right === null)
        right = View({ $el: $_label() });

      if (typeof text === 'string')
        right.text(text);

      if (typeof click === 'function')
        right.click(click);

      return this;
    };

    this.viewDidLoad = function() {
      return $el !== null ? $el : $el = this.setUpEl().append(
        this.view.controller(this).viewWillLoad().viewDidLoad().append(
          title || message
          ? $_div().addClass('Info').append(
            title && title.controller(this).viewWillLoad().viewDidLoad()).append(
            message && message.controller(this).viewWillLoad().viewDidLoad())
          : null).append(
          $_div().addClass('Buttons').append(this.buttons().map(function(button) {
            return button.controller(this).viewWillLoad().viewDidLoad();
          }.bind(this)))));
    };
    
    this.addClass('AlertController').addClass(a && 'actionSheet');
    this.title(t);
    this.message(m);
  }

  function FeatureViewController(url, option) {
    if (!(this instanceof FeatureViewController)) return new FeatureViewController(url, option);
    else ViewController.call(this, option);

    var clickComment = function() {
      this.push(FormTableViewController([TableViewSection("留言", [TableViewInputCell(null, "content", "", '請輸入內容…', { attrs: { minlength: 1, maxlength: 190, pattern: '.{1,190}', required: true} })])])
          .title('我要留言')
          .submit(function() {
            this.pop();
          }));
    }.bind(this);

    var clickReport = function() {
      this.push()
    }.bind(this);

    this.viewEndLoad = function() {

      $.get(url).done(function(r) {
        r.title && this.title(r.title);
        var comments = r.comments.map(function(comment) {
          if (!(comment.name && comment.time && comment.content)) return null;
          return $_div().append($_b().text(comment.name))
                        .append($_time().text(comment.time))
                        .append($_span().text(comment.content));
        }).filter(function(comment) { return comment !== null; })

        this.view.append(r.alert && $_span().text(r.alert))
                 .append(r.sections.map(function(section) {
                    var rows = section.rows.map(function(row) { return row.val ? $_span().text(row.val).attr('data-title', row.title) : null; }).filter(function(row) { return row !== null; });
                    if (!rows.length) return null;
                    return $_section().append(rows).attr('data-title', section.title);
                 }).filter(function(section) { return section !== null; }))
                 .append($_div().addClass('buttons').append(
                    $_label().text('我要檢舉').click(clickReport)).append(
                    $_label().text('我要留言').click(clickComment)))
                 .append(
                  $_div()
                    .addClass('comments')
                    .attr('data-title', '留言 (' + comments.length + ')')
                    .append(comments));

        setTimeout(function() { this.view.addClass('aniShow'); }.bind(this), 100);
      }.bind(this));
    };

    this.view.addClass('FeatureView');
  }

  Window.main = function() { return this._main ? this._main : this._main = Window({ class: 'Window' }); };
  Window.body = function() { return this._body ? this._body : this._body = $('body'); };

  function FormTableViewController(sections, submit, option) {
    if (!(this instanceof FormTableViewController)) return new FormTableViewController(sections, submit, option);

    if (!$.isArray(sections)) sections = [];
    if (!(typeof submit === 'function')) submit = null;
    if (!(typeof option === 'object')) option = {};
    
    TableViewController.call(this, sections, $.extend({ view: View({ $el: $_form().submit(function() {
      if (typeof submit !== 'function') return false;
      var tmps = sections.map(function(section) { return section.rows().map(function(row) { return row; }); }).reduce(function(a, b) { return a.concat(b); }).filter(function(a) { return a instanceof TableViewInputCell; }).map(function(row) { return row.$input(); });
      var data = {}; for (var i in tmps) data[tmps[i].data('name')] = tmps[i].val().trim();
      submit.call(this, data);
      return false;
    }.bind(this)) }) }, option));
    
    this.submit = function(s) {
      if (typeof s === 'undefined' || s === null) return submit;
      if (typeof s === 'function') submit = s;
      return this;
    };

    sections.push(TableViewSection(null, [TableViewButtonCell('確定送出')]))
    this.submit(submit);
    this.sections(sections);
  }

  // // 交通表單
  // let trafficTaxiForm = FormTableViewController([
  //   TableViewSection("聯絡資訊", [
  //     TableViewInputCell("名稱/暱稱", "name", "", "請輸入聯絡人名稱…"),
  //     TableViewInputCell("手機號碼", "phone", "", "請輸入聯絡人手機…"),
  //     TableViewInputCell("Line 帳號", "line", "", "請輸入聯絡人 Line…"),
  //   ]),
  //   TableViewSection("交通資訊", [
  //     TableViewInputCell("交通工具？", "start", "", "何種交通工具，例如：計程車"),
  //     TableViewInputCell("從哪裡出發", "start", "", "何處出發，例如：台北中和"),
  //     TableViewInputCell("何時出發", "goAt", "", "例如：6/12 下午 6點前", {
  //     }),
  //   ]),
  //   TableViewSection("費用資訊", [
  //     TableViewInputCell("費用計算採？", "start", "", "免費？跳表？多少？"),
  //   ]),
  // ]);

  // trafficTaxiForm.title("新增「付費」搭乘資訊")
  //            .left("返回", function() { this.pop(); })

  // NavigationController(trafficTaxiForm).present();

  // let trafficFreeForm = FormTableViewController([
  //   TableViewSection("聯絡資訊", [
  //     TableViewInputCell("名稱/暱稱", "name", "", "請輸入聯絡人名稱…"),
  //     TableViewInputCell("手機號碼", "phone", "", "請輸入聯絡人手機…"),
  //     TableViewInputCell("Line 帳號", "line", "", "請輸入聯絡人 Line…"),
  //   ]),
  //   TableViewSection("交通資訊", [
  //     TableViewInputCell("交通工具？", "start", "", "何種交通工具，例如：計程車"),
  //     TableViewInputCell("從哪裡出發", "start", "", "何處出發，例如：台北中和"),
  //     TableViewInputCell("何時出發", "goAt", "", "例如：6/12 下午 6點前", {
  //     }),
  //   ]),
  // ]);

  // trafficFreeForm.title("新增「免費」搭乘資訊")
  //            .left("返回", function() { this.pop(); })

  // NavigationController(trafficFreeForm).present();


  // let trafficShareForm = FormTableViewController([
  //   TableViewSection("聯絡資訊", [
  //     TableViewInputCell("名稱/暱稱", "name", "", "請輸入聯絡人名稱…"),
  //     TableViewInputCell("手機號碼", "phone", "", "請輸入聯絡人手機…"),
  //     TableViewInputCell("Line 帳號", "line", "", "請輸入聯絡人 Line…"),
  //   ]),
  //   TableViewSection("交通資訊", [
  //     TableViewInputCell("交通工具？", "start", "", "何種交通工具，例如：計程車"),
  //     TableViewInputCell("從哪裡開始", "start", "", "從哪上車，例如：台北中和"),
  //     TableViewInputCell("抵達哪裡？", "end", "", "抵達何處，例如：拱天宮"),
  //     TableViewInputCell("何時出發", "goAt", "", "例如：6/12 下午 6點前", {
  //       // attrs: {
  //       //   type: 'date'
  //       // }
  //     }),
  //   ]),
  //   TableViewSection("共乘資訊", [
  //     TableViewInputCell("性別限制？", "start", "", "男？女？不拘？"),
  //     TableViewInputCell("應徵人數？", "start", "", "預計幾人共乘？例如：5 人"),
  //     TableViewInputCell("費用計算採？", "start", "", "均分？免費？其他？"),
  //   ]),
  // ]);

  // trafficShareForm.title("新增共乘資訊")
  //            .left("返回", function() { this.pop(); })

  // NavigationController(trafficShareForm).present();




















  // var FormTableViewController = FormTableViewController([
  //     TableViewSection("基本資料", [
  //       TableViewInputCell("name1", "val1", 'placeholder1', "title1", {
  //         attrs: {
  //           minlength: 1,
  //           maxlength: 190,
  //           pattern: '.{1,190}',
  //           required: true
  //         }
  //       }),
  //       TableViewInputCell("name2", "val2", "placeholder2", "title2", {
  //         attrs: {
  //           minlength: 1,
  //           maxlength: 190,
  //           pattern: '.{1,190}',
  //           required: true
  //         }
  //       }),
  //     ])
  // ]).title('功能選單').submit(function(data) {
  //   console.error(data);
    
  //   // this.push(ViewController());
  // });

  // .submit(function() {
  //   // this.push(ViewController())
  // });

    // .right('關閉', function() { this.dismiss(); });

  // NavigationController(FormTableViewController).present();

// report
// add
// comment

  // var FeatureViewController = FeatureViewController('feature.json')
  //   .title('功能選單')
  //   .right('關閉', function() { this.dismiss(); });
  // NavigationController(FeatureViewController).present();





// // Feature

  // NavigationController(WebTableViewController('menu.json')
  //   .title('功能選單')
  //   .right('關閉', function() { this.dismiss(); })).present();

  // AlertViewController("請您使用手機 App 追媽祖吧", "我們是非營利的 GPS 義工團隊，系統支出的費用都是團員們自掏腰包。因為預算金額已經超過額度了，所以請您使用我們的免費 App 吧！這樣明年我們才有足夠的經費再繼續為各位服務！")
  //   .buttons('前往下載', function() { this.dismiss(); })
  //   .buttons('先用網頁版', function() { this.dismiss(); })
  //   .present();

  // NavigationController(WebTableViewController('feature1s.json')
  //   .title("接駁資訊")
  //   .right("關閉", function() { this.dismiss(); })
  //   .left("新增")).present();






  
});
