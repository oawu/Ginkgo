
$(function() {
  function $_(tag)        { return $('<' + tag + ' />'); }
  function $_a()          { return $_('a'); }
  function $_b()          { return $_('b'); }
  function $_button()     { return $_('button'); }
  function $_div()        { return $_('div'); }
  function $_figcaption() { return $_('figcaption'); }
  function $_figure()     { return $_('figure'); }
  function $_footer()     { return $_('footer'); }
  function $_h1()         { return $_('h1'); }
  function $_h2()         { return $_('h2'); }
  function $_header()     { return $_('header'); }
  function $_i()          { return $_('i'); }
  function $_input()      { return $_('input'); }
  function $_label()      { return $_('label'); }
  function $_li()         { return $_('li'); }
  function $_p()          { return $_('p'); }
  function $_section()    { return $_('section'); }
  function $_span()       { return $_('span'); }
  function $_textarea()   { return $_('textarea'); }
  function $_time()       { return $_('time'); }
  function $_u()          { return $_('u'); }
  function $_ul()         { return $_('ul'); }
  function $_form()       { return $_('form'); }
  function $_component()  { return $_('component'); }

  // Window
  // View
  // ViewController

  // AlertController: ViewController

  // TableViewController: ViewController
    // TableView: View
      // TableViewSection: View
        // TableViewCell: View

  // NavigationController: ViewController
    // NavigationBar: View
      // BarButtonItem: View
      // BarButtonItem: View
  
  // ArticleController: ViewController
  // HistotyMapController: ViewController

  // * sup delay load feature
  // * sup quick link
  // function Timer(func, ttl) {
  //   return typeof ttl === 'number' ? setTimeout(func, ttl) : func();
  // }

  function Timer(func, ttl) { if (!(this instanceof Timer)) return new Timer(func, ttl);
    var funcs = [], stop = false;

    this.delay = function(func, ttl) {
      if (typeof func === 'function') funcs.push({ func: func, ttl: ttl});
      return this;
    };
    
    function run() {
      var func = funcs.shift();
      if (!func || stop === true) return this;
      if (typeof func.ttl === 'number') return setTimeout(function() { if (stop === true) return; stop = func.func() === false; return run(); }, func.ttl);
      else stop = func.func() === false;
      return run();
    }

    this.stop = function() { stop = true; };
    this.run = function() { run(); return this; };

    return typeof func === 'function' ? typeof ttl === 'number' ? setTimeout(func, ttl) : func() : this;
  };

  Vue.component('view', {
    props: {
      view: View,
      controller: ViewController },
    mounted: function() {
      this.view.controller = this.controller; },
    template: $_component()
      .attr(':class', 'view.class')
      .attr('v-if', 'typeof this.view.element === "string" && this.view.element.length')
      .attr(':is', 'this.view.element')
      .attr('v-on:click.stop', 'typeof view.click === "function" ? view.click.call(view) : {}')
      .text('{{ view.text }}')
      .prop('outerHTML')
  });

  Vue.component('navigation-bar', {
    props: {
      bar: NavigationBar,
      controller: ViewController },
    mounted: function() {
      this.bar.controller = this.controller; },
    template: $_div()
      .attr(':class', 'bar.class')
      .attr('v-if:', 'controller').append(
        $_component()
          .attr('v-if', 'bar.left')
          .attr(':is', 'bar.left && bar.left.component')
          .attr(':view', 'bar.left')
          .attr(':controller', 'controller')).append(
        $_component()
          .attr('v-if', 'bar.title')
          .attr(':is', 'bar.title && bar.title.component')
          .attr(':view', 'bar.title')
          .attr(':controller', 'controller')).append(
        $_component()
          .attr('v-if', 'bar.right')
          .attr(':is', 'bar.right && bar.right.component')
          .attr(':view', 'bar.right')
          .attr(':controller', 'controller'))
      .prop('outerHTML')
  });

  Vue.component('table-view-cell', {
    props: {
      cell: TableViewCell,
      section: TableViewSection,
      tableview: TableView,
      controller: ViewController },
    mounted: function() {
      this.cell.section = this.section;
      this.cell.tableView = this.tableview;
      this.cell.controller = this.controller; },
    computed: {
      click: function() { return typeof this.cell.click === 'function' ? this.cell.click.bind(this.cell) : function() {} },
      className: function() {
        var tmps = this.cell.classList();

        if (!(this.cell.layout instanceof CellLayout))
          this.cell.layout = CellLayout.none;

        if (typeof this.cell.detail === "string" && this.cell.detail.length && this.cell.layout == CellLayout.none)
          this.cell.layout = CellLayout.subtitle;

        tmps.push(this.cell.layout.val);

        this.cell.icon && tmps.push('icon');
        this.cell.isWrap === true && tmps.push('wrap');
        this.cell.align instanceof CellAlign && tmps.push(this.cell.align.val);
        this.cell.color instanceof CellColor && tmps.push(this.cell.color.val);

        return tmps.filter(function(t) { return t !== null; }).join(' ');
      },
    },
    template: $_label()
      .attr('v-on:click.stop', 'click')
      .attr(':class', 'className').append(
        $_figure()
          .attr('v-if', 'cell.icon')
          .attr(':class', 'cell.icon')).append(
        $_b()
          .text('{{ cell.title }}')).append(
        $_span()
          .attr('v-if', 'typeof cell.detail === "string" && cell.detail.length')
          .text('{{ cell.detail }}'))
      .prop('outerHTML')
  });

  Vue.component('table-view-cell-switch', {
    props: {
      cell: TableViewCell,
      section: TableViewSection,
      tableview: TableView,
      controller: ViewController },
    mounted: function() {
      this.cell.section = this.section;
      this.cell.tableView = this.tableview;
      this.cell.controller = this.controller; },
    computed: {
      click: function() { return typeof this.cell.click === 'function' ? this.cell.click.bind(this.cell) : function() {} },

      className: function() {

        var tmps = this.cell.classList();

        if (!(this.cell.layout instanceof CellLayout))
          this.cell.layout = CellLayout.none;

        if (typeof this.cell.detail === "string" && this.cell.detail.length && this.cell.layout == CellLayout.none)
          this.cell.layout = CellLayout.subtitle;

        tmps.push(this.cell.layout.val);

        this.cell.icon && tmps.push('icon');
        this.cell.isOn === true && tmps.push('on');
        this.cell.isWrap === true && tmps.push('wrap');
        this.cell.align instanceof CellAlign && tmps.push(this.cell.align.val);
        this.cell.color instanceof CellColor && tmps.push(this.cell.color.val);

        return tmps.filter(function(t) { return t !== null; }).join(' ');
      },
    },
    template: $_div()
      .attr(':class', 'className').append(
        $_figure()
          .attr('v-if', 'cell.icon')
          .attr(':class', 'cell.icon')).append(
        $_b()
          .text('{{ cell.title }}')).append(
        $_span()
          .attr('v-if', 'typeof cell.detail === "string" && cell.detail.length')
          .text('{{ cell.detail }}')).append(
        $_label()
          .attr('v-on:click.stop', 'click'))
      .prop('outerHTML')
  });

  Vue.component('table-view-cell-arrow', {
    props: {
      cell: TableViewCell,
      section: TableViewSection,
      tableview: TableView,
      controller: ViewController },
    mounted: function() {
      this.cell.section = this.section;
      this.cell.tableView = this.tableview;
      this.cell.controller = this.controller; },
    computed: {
      click: function() { return typeof this.cell.click === 'function' ? this.cell.click.bind(this.cell) : function() {} },
      className: function() {

        var tmps = this.cell.classList();

        if (!(this.cell.layout instanceof CellLayout))
          this.cell.layout = CellLayout.none;

        if (typeof this.cell.detail === "string" && this.cell.detail.length && this.cell.layout == CellLayout.none)
          this.cell.layout = CellLayout.subtitle;

        tmps.push(this.cell.layout.val);

        this.cell.icon && tmps.push('icon');
        this.cell.isOn === true && tmps.push('on');
        this.cell.isWrap === true && tmps.push('wrap');
        this.cell.align instanceof CellAlign && tmps.push(this.cell.align.val);
        this.cell.color instanceof CellColor && tmps.push(this.cell.color.val);

        return tmps.filter(function(t) { return t !== null; }).join(' ');
      },
    },
    template: $_label()
      .attr(':class', 'className')
      .attr('v-on:click.stop', 'click').append(
        $_figure()
          .attr('v-if', 'cell.icon')
          .attr(':class', 'cell.icon')).append(
        $_b()
          .text('{{ cell.title }}')).append(
        $_span()
          .attr('v-if', 'typeof cell.detail === "string" && cell.detail.length')
          .text('{{ cell.detail }}')).append(
        $_i())
      .prop('outerHTML')
  });

  Vue.component('table-view-cell-checkmark', {
    props: {
      cell: TableViewCell,
      section: TableViewSection,
      tableview: TableView,
      controller: ViewController },
    mounted: function() {
      this.cell.section = this.section;
      this.cell.tableView = this.tableview;
      this.cell.controller = this.controller; },
    computed: {
      click: function() { return typeof this.cell.click === 'function' ? this.cell.click.bind(this.cell) : function() {} },
      className: function() {

        var tmps = this.cell.classList();

        if (!(this.cell.layout instanceof CellLayout))
          this.cell.layout = CellLayout.none;

        if (typeof this.cell.detail === "string" && this.cell.detail.length && this.cell.layout == CellLayout.none)
          this.cell.layout = CellLayout.subtitle;

        tmps.push(this.cell.layout.val);

        this.cell.icon && tmps.push('icon');
        this.cell.isOn === true && tmps.push('on');
        this.cell.isWrap === true && tmps.push('wrap');
        this.cell.align instanceof CellAlign && tmps.push(this.cell.align.val);
        this.cell.color instanceof CellColor && tmps.push(this.cell.color.val);

        return tmps.filter(function(t) { return t !== null; }).join(' ');
      },
    },
    methods: {
      check: function() {
        if (!(typeof this.cell.name === 'string' && this.cell.name.length))
          return this.click(this.cell.isOn = !this.cell.isOn);
        this.cell.isOn = true;
        this.cell.tableView.rows().filter(function(row) { return row instanceof TableViewCellCheckmark && typeof row.name === 'string' && row.name.length && row.name == this.cell.name && row != this.cell; }.bind(this)).forEach(function(row) { row.isOn = false; });
        return this.click(true);
      }
    },
    template: $_label()
      .attr(':class', 'className')
      .attr('v-on:click.stop', 'check').append(
        $_figure()
          .attr('v-if', 'cell.icon')
          .attr(':class', 'cell.icon')).append(
        $_b()
          .text('{{ cell.title }}')).append(
        $_span()
          .attr('v-if', 'typeof cell.detail === "string" && cell.detail.length')
          .text('{{ cell.detail }}')).append(
        $_i())
      .prop('outerHTML')
  });

  Vue.component('table-view-cell-input', {
    props: {
      cell: TableViewCell,
      section: TableViewSection,
      tableview: TableView,
      controller: ViewController },
    mounted: function() {
      this.cell.section = this.section;
      this.cell.tableView = this.tableview;
      this.cell.controller = this.controller; },
    computed: {
      className: function() {
        var tmps = this.cell.classList();

        this.cell.icon && tmps.push('icon');
        this.cell.isWrap === true && tmps.push('wrap');
        this.cell.align instanceof CellAlign && tmps.push(this.cell.align.val);
        this.cell.color instanceof CellColor && tmps.push(this.cell.color.val);

        return tmps.filter(function(t) { return t !== null; }).join(' ');
      },
    },
    template: $_label()
      .attr(':class', 'className').append(
        $_figure()
          .attr('v-if', 'cell.icon')
          .attr(':class', 'cell.icon')).append(
        $_b().attr('v-if', 'cell.title').text('{{ cell.title }}')).append(
          $_span().append(
            $_input()
              .attr(':type', '"text"')
              .attr(':placeholder', 'cell.detail')
              .attr('v-on:focus', 'cell.error = null')
              .attr('v-model.trim', 'cell.val')).append(
            $_u()
              .attr('v-if', 'typeof cell.error === "string" && cell.error.length')
              .text('{{ cell.error }}')))
      .prop('outerHTML')
  });

  Vue.component('table-view-cell-text', {
    props: {
      cell: TableViewCell,
      section: TableViewSection,
      tableview: TableView,
      controller: ViewController },
    mounted: function() {
      this.cell.section = this.section;
      this.cell.tableView = this.tableview;
      this.cell.controller = this.controller; },
    computed: {
      className: function() {
        var tmps = this.cell.classList();

        this.cell.icon && tmps.push('icon');
        this.cell.isWrap === true && tmps.push('wrap');
        this.cell.align instanceof CellAlign && tmps.push(this.cell.align.val);
        this.cell.color instanceof CellColor && tmps.push(this.cell.color.val);

        return tmps.filter(function(t) { return t !== null; }).join(' ');
      },
    },
    template: $_label()
      .attr(':class', 'className').append(
        $_figure()
          .attr('v-if', 'cell.icon')
          .attr(':class', 'cell.icon')).append(
        $_b().attr('v-if', 'cell.title').text('{{ cell.title }}')).append(
          $_span().append(
            $_textarea()
              .attr(':placeholder', 'cell.detail')
              .attr('v-on:focus', 'cell.error = null')
              .attr('v-model.trim', 'cell.val')).append(
            $_u()
              .attr('v-if', 'typeof cell.error === "string" && cell.error.length')
              .text('{{ cell.error }}')))
      .prop('outerHTML')
  });

  Vue.component('table-view-section', {
    props: {
      section: TableViewSection,
      tableview: TableView,
      controller: ViewController },
    mounted: function() {
      this.section.tableView = this.tableview;
      this.section.controller = this.controller; },
    computed: {
      rows: function() { return this.section.rows.filter(function(row) { return row instanceof TableViewCell; }); },
      headerIsView: function() { return this.section.header instanceof TableViewHeaderFooter },
      footerIsView: function() { return this.section.footer instanceof TableViewHeaderFooter } },
    template: $_section()
      .attr(':class', 'section.class')
      .attr(':data-header', 'typeof section.header === "string" ? section.header : null')
      .attr(':data-footer', 'typeof section.footer === "string" ? section.footer : null').append(
        $_header()
          .attr('v-if', 'headerIsView')
          .attr('v-html', 'section.header.html')).append(
        $_component()
          .attr('v-for', '(row, i) in rows')
          .attr(':key', 'i')
          .attr(':is', 'row.component')
          .attr(':cell', 'row')
          .attr(':section', 'section')
          .attr(':tableview', 'tableview')
          .attr(':controller', 'controller')
          .attr(':class', '[i == 0 ? "first" : null, i == rows.length - 1 ? "last" : null]')).append(
          $_footer()
            .attr('v-if', 'footerIsView')
            .attr('v-html', 'section.footer.html'))
      .prop('outerHTML')
  });

  Vue.component('table-view', {
    props: {
      view: TableView,
      controller: ViewController },
    mounted: function() {
      this.view.controller = this.controller; },
    computed: {
      sections: function() { return this.view.sections.filter(function(section) { return section instanceof TableViewSection; }); } },
    template: $_div()
      .attr(':class', 'view.class')
      .attr(':data-title', 'view.text').append(
      $_component()
        .attr('v-for', '(section, i) in sections')
        .attr(':key', 'i')
        .attr(':is', 'section.component')
        .attr(':section', 'section')
        .attr(':tableview', 'view')
        .attr(':controller', 'controller'))
      .prop('outerHTML')
  });

  Vue.component('view-controller', {
    props: {
      controller: ViewController,
      navigation: NavigationController },
    mounted: function() {
      this.controller.navigationController = this.navigation; },
    template: $_div()
      .attr(':class', 'controller.class').append(
        $_component()
          .attr(':is', 'controller.navigationBar && controller.navigationBar.component')
          .attr(':bar', 'controller.navigationBar')
          .attr(':controller', 'controller')
          .attr('v-if', 'navigation')).append(
        $_component()
          .attr(':is', 'controller.view && controller.view.component')
          .attr(':view', 'controller.view')
          .attr(':controller', 'controller'))
      .prop('outerHTML')
  });

  Vue.component('navigation-controller', {
    props: {
      controller: NavigationController },
    template: $_div()
      .attr(':class', 'controller.class').append(
        $_component()
          .attr('v-for', '(viewController, i) in controller.viewControllers')
          .attr(':key', 'i')
          .attr(':is', 'viewController.component')
          .attr(':controller', 'viewController')
          .attr(':navigation', 'controller'))
      .prop('outerHTML')
  });

  ViewController.prototype = Object.create(OAUI.prototype);
  View.prototype = Object.create(OAUI.prototype);
  
  BarButtonItem.prototype = Object.create(View.prototype);
  NavigationBar.prototype = Object.create(View.prototype);
  NavigationController.prototype = Object.create(ViewController.prototype);
  
  TableViewController.prototype = Object.create(ViewController.prototype);
  TableViewHeaderFooter.prototype = Object.create(View.prototype);
  TableViewSection.prototype = Object.create(View.prototype);
  TableView.prototype = Object.create(View.prototype);

  TableViewCell.prototype = Object.create(View.prototype);
  TableViewCellSwitch.prototype = Object.create(TableViewCell.prototype);
  TableViewCellArrow.prototype = Object.create(TableViewCell.prototype);
  TableViewCellCheckmark.prototype = Object.create(TableViewCell.prototype);
  TableViewCellInput.prototype = Object.create(TableViewCell.prototype);
  TableViewCellText.prototype = Object.create(TableViewCell.prototype);

  function Window($el) { if (!(this instanceof Window)) return new Window($el);
    $el = $el && $el instanceof jQuery ? $el : $_div().addClass('Window');

    $el.attr('v-if', 'display')
       .attr(':class', '{ show: isShow }')
       .append($_component()
         .attr('v-for', '(viewController, i) in viewControllers')
         .attr(':key', 'i')
         .attr(':is', 'viewController.component')
         .attr(':controller', 'viewController'));

    var vue = new Vue({
      el: $el.appendTo(Window.body()).get(0),
      data: {
        display: false,
        isShow: false,
        viewControllers: []
      },
      methods: {
        nowViewController: function() {
          return this.viewControllers.length > 0 ? this.viewControllers[this.viewControllers.length - 1] : null;
        },
      }
    });

    this.present = function(viewController, completion, animate) {
      if (!(viewController && viewController instanceof ViewController)) return this;
      Timer()
        .delay(function() { vue.isShow = true; vue.viewControllers.push(viewController); }, vue.display || !(vue.display = true) || (animate === false) || 10)
        .delay(function() { viewController.addClass('present'); }, animate === false || 10)
        .delay(typeof completion === 'function' && completion.bind(viewController), animate === false || 300 - 10)
      .run();
    };

    this.dismiss = function(viewController, completion, animate) {
      if (!(viewController && viewController instanceof ViewController)) return this;
      if (viewController !== vue.nowViewController()) return this;
      Timer()
        .delay(function() { viewController.removeClass('present') }, null)
        .delay(function() { vue.viewControllers.pop(); }, animate === false || 300)
        .delay(typeof completion === 'function' && completion.bind(viewController), null)
        .delay(function() { vue.viewControllers.length || (vue.isShow = false); } , animate === false || 300)
        .delay(function() { vue.isShow || (vue.display = false); }, null).run();
    };

    option = null; delete option;
  }

  function OAUI(defaultClass) { if (!(this instanceof OAUI)) return new OAUI(defaultClass);
    this.class = typeof defaultClass === 'string' ? defaultClass : '';
    this.click = null;
    this.classList = function() { return this.class.split(/\s+/); };
    this.hasClass = function(c) { return this.classList().filter(function(t) { return t === c }).length != 0; };
    this.addClass = function(c) { if (typeof c !== 'string' || !(c = c.trim())) return this; if (this.hasClass(c)) return this; var t = this.classList(); t.push(c); this.class = t.join(' '); return this; };
    this.removeClass = function(c) { if (typeof c !== 'string' || !(c = c.trim())) return this; if (!this.hasClass(c)) return this; this.class = this.classList().filter(function(t) { return t != c; }).join(' '); return this; };
  }

  function ViewController() { if (!(this instanceof ViewController)) return new ViewController();
    OAUI.call(this, 'ViewController');

    this.component = Vue.component('view-controller');
    
    this.navigationController = null;
    this.navigationBar = NavigationBar()
    this.view = View();

    this.present = function(completion, animate) { Window.main().present(this.navigationController || this, completion, animate); };
    this.dismiss = function(completion, animate) { Window.main().dismiss(this.navigationController || this, completion, animate); };
    this.pop = function(completion, animate) { return this.navigationController ? this.navigationController.pop(completion, animate) : this; };
    this.push = function(viewController, completion, animate) { return this.navigationController ? this.navigationController.push(viewController, completion, animate) : this; };
  }
  
  function View(element) { if (!(this instanceof View)) return new View(element);
    OAUI.call(this, 'View');

    this.component = Vue.component('view');
    this.text = '';
    this.controller = null;
    this.element = typeof element === 'string' && element.length ? element : 'div';
  }

  function BarButtonItem(element) { if (!(this instanceof BarButtonItem)) return new BarButtonItem(element);
    View.call(this, element);
    this.class = '';
  }

  function NavigationBar() { if (!(this instanceof NavigationBar)) return new NavigationBar();
    View.call(this);

    this.component = Vue.component('navigation-bar');
    this.class = 'NavigationBar';

    this.left  = BarButtonItem('label');
    this.title = BarButtonItem('header');
    this.right = BarButtonItem('label');
  }

  function NavigationController(rootViewController) { if (!(this instanceof NavigationController)) return new NavigationController(rootViewController);
    ViewController.call(this);
    var isTransition = false;
    
    this.component = Vue.component('navigation-controller');
    this.viewControllers = [];

    this.nowViewController = function() { return this.viewControllers.length > 0 ? this.viewControllers[this.viewControllers.length - 1] : null; };
    this.lastViewController = function() { return this.viewControllers.length - 1 > 0 ? this.viewControllers[this.viewControllers.length - 2] : null; };

    this.push = function(viewController, completion, animate) {
      if (isTransition) return this;
      if (!(viewController && viewController instanceof ViewController && !(viewController instanceof NavigationController))) return this;
      
      this.viewControllers.push(viewController);
      var lastViewController = this.lastViewController();

      if (lastViewController && !viewController.navigationBar.left.text) {
       viewController.navigationBar.left.text = '返回';
       viewController.navigationBar.left.class = 'back';
       viewController.navigationBar.left.click = this.pop.bind(this);
      }
      
      isTransition = true
      Timer()
      .delay(function() { viewController.addClass('push') && lastViewController && lastViewController.addClass('ed').addClass('last'); }, animate === false || 10)
      .delay(typeof completion === 'function' && completion.bind(this), animate === false || 400 - 10)
      .delay(function() { isTransition = false; }.bind(this))
      .run();
      return this;
    };

    this.pop = function(completion, animate) {
      if (isTransition) return this;

      var viewController = this.nowViewController();
      var lastViewController = this.lastViewController();
      if (lastViewController === null) return this.dismiss(completion, animate);
      
      viewController.removeClass('push') && lastViewController.removeClass('last');

      isTransition = true
      Timer()
      .delay(function() { lastViewController.removeClass('ed'); this.viewControllers.pop(); }.bind(this), animate === false || 400)
      .delay(typeof completion === 'function' && completion.bind(this), null)
      .delay(function() { isTransition = false; }.bind(this))
      .run();
      return this;
    };

    this.addClass('NavigationController')
        .push(rootViewController, null, false);
  }

  function CellLayout(val) { if (!(this instanceof CellLayout)) return new CellLayout(val); this.val = val; } CellLayout.none = CellLayout(null); CellLayout.subtitle = CellLayout('subtitle'); CellLayout.value = CellLayout('value');
  function CellAlign(val) { if (!(this instanceof CellAlign)) return new CellAlign(val); this.val = val; } CellAlign.none = CellAlign(null); CellAlign.left = CellAlign('left'); CellAlign.center = CellAlign('center'); CellAlign.right = CellAlign('right');
  function CellColor(val) { if (!(this instanceof CellColor)) return new CellColor(val); this.val = val; } CellColor.none = CellColor(null); CellColor.blue = CellColor('blue'); CellColor.red = CellColor('red');

  function TableViewCell(icon, title, detail, layout, click) { if (!(this instanceof TableViewCell)) return new TableViewCell(icon, title, detail, layout, click); View.call(this);

    this.component = Vue.component('table-view-cell');
    this.section = null;
    this.tableView = null;
    this.class = 'TableViewCell';

    this.icon = typeof icon === 'string' ? icon : null;
    this.title = typeof title === 'string' ? title : null;
    this.detail = typeof detail === 'string' ? detail : null;

    this.layout = layout instanceof CellLayout ? layout : null;

    this.isWrap = null;
    this.click = typeof click === 'function' ? click : null;

    this.align = null;
    this.color = null;

    this.name = null;
    this.val = null;

    this.check = null;
  }

  function TableViewCellArrow(icon, title, detail, layout, click) { if (!(this instanceof TableViewCellArrow)) return new TableViewCellArrow(icon, title, detail, layout, click); TableViewCell.call(this, icon, title, detail, layout, click);
    this.component = Vue.component('table-view-cell-arrow');
    this.addClass('arrow');
  }

  function TableViewCellSwitch(icon, title, detail, layout, click) { if (!(this instanceof TableViewCellSwitch)) return new TableViewCellSwitch(icon, title, detail, layout, click); TableViewCell.call(this, icon, title, detail, layout, click);
    this.component = Vue.component('table-view-cell-switch');
    this.isOn = false;
    this.addClass('switch');
  }

  function TableViewCellCheckmark(icon, title, detail, layout, click) { if (!(this instanceof TableViewCellCheckmark)) return new TableViewCellCheckmark(icon, title, detail, layout, click); TableViewCell.call(this, icon, title, detail, layout, click);
    this.component = Vue.component('table-view-cell-checkmark');
    this.isOn = false;
    this.addClass('checkmark');
  }

  function TableViewCellInput(title, detail) { if (!(this instanceof TableViewCellInput)) return new TableViewCellInput(title, detail); TableViewCell.call(this, null, title, detail);
    this.component = Vue.component('table-view-cell-input');
    this.addClass('input');
    this.error = null;
  }

  function TableViewCellText(title, detail) { if (!(this instanceof TableViewCellText)) return new TableViewCellText(title, detail); TableViewCell.call(this, null, title, detail);
    this.component = Vue.component('table-view-cell-text');
    this.addClass('text');
    this.error = null;
  }

  function TableViewHeaderFooter() { if (!(this instanceof TableViewHeaderFooter)) return new TableViewHeaderFooter();
    View.call(this);
    this.component = null;
    this.class = '';
    this.html = null;
  }

  function TableViewSection(rows) { if (!(this instanceof TableViewSection)) return new TableViewSection(rows);
    View.call(this);

    this.component = Vue.component('table-view-section');
    this.class = 'TableViewSection';
    this.rows = typeof rows !== 'undefined' && $.isArray(rows) ? rows : [];
    this.header = null;
    this.footer = null;
    this.tableView = null;
  }

  function TableView() { if (!(this instanceof TableView)) return new TableView();
    View.call(this);
    this.component = Vue.component('table-view');
    this.addClass('TableView');
    this.sections = [];

    this.rows = function() {
      return this.sections.filter(function(section) { return section instanceof TableViewSection; }).map(function(section) {
        return section.rows.filter(function(row) { return row instanceof TableViewCell; });
      }).reduce(function(a, b) { return a.concat(b); });
    };
    this.vals = function() {
      if (!this.check()) return null;
      var tmps = this.rows().filter(function(row) { return typeof row.name === 'string' && row.name.length; }).filter(function(row) { return row instanceof TableViewCellCheckmark || row instanceof TableViewCellSwitch ? row.isOn : true; });
      var data = {}; for (var i in tmps) data[tmps[i].name] = tmps[i].val;
      return data;
    };
    this.check = function() {
      return !this.rows().filter(function(row) { return typeof row.name === 'string' && row.name.length; }).filter(function(row) { return typeof row.check === 'function'; }).filter(function(row) {
        return row.error = typeof row.check === 'function' ? row.check() : null;
      }).length;
    };
  }

  function TableViewController() { if (!(this instanceof TableViewController)) return new TableViewController();
    ViewController.call(this);
    this.tableView = this.view = TableView();
    this.sections = this.view.sections;
  }

  Window.main = function() { return this._main ? this._main : this._main = Window({ class: 'Window' }); };
  Window.body = function() { return this._body ? this._body : this._body = $('body'); };

  var tvc = TableViewController()

  tvc.tableView.sections = [
    TableViewSection([
      TableViewCellInput("標題", "副標題"),
      TableViewCellText("標題", "副標題"),
      TableViewCellInput(null, "副標題"),
      TableViewCellText(null, "副標題"),
    ]),
    TableViewSection([
      TableViewCell(),
      TableViewCellArrow(),
      TableViewCellSwitch(),
      TableViewCellCheckmark(),
    ]),
    TableViewSection([
      TableViewCell('icon-2e'),
      TableViewCellArrow('icon-2e'),
      TableViewCellSwitch('icon-2e'),
      TableViewCellCheckmark('icon-2e'),
    ]),
    TableViewSection([
      TableViewCell('icon-2e', '標題'),
      TableViewCellArrow('icon-2e', '標題'),
      TableViewCellSwitch('icon-2e', '標題'),
      TableViewCellCheckmark('icon-2e', '標題'),
    ]),
    TableViewSection([
      TableViewCell('icon-2e', '標題', '副標題'),
      TableViewCellArrow('icon-2e', '標題', '副標題'),
      TableViewCellSwitch('icon-2e', '標題', '副標題'),
      TableViewCellCheckmark('icon-2e', '標題', '副標題'),
    ]),
    TableViewSection([
      TableViewCell('icon-2e', '標題', '副標題', CellLayout.value),
      TableViewCellArrow('icon-2e', '標題', '副標題', CellLayout.value),
      TableViewCellSwitch('icon-2e', '標題', '副標題', CellLayout.value),
      TableViewCellCheckmark('icon-2e', '標題', '副標題', CellLayout.value),
    ]),
    TableViewSection([
      TableViewCell('icon-2e', '標題', '副標題', null, function() { console.error(this); }),
      TableViewCellArrow('icon-2e', '標題', '副標題', null, function() { console.error(this); }),
      TableViewCellSwitch('icon-2e', '標題', '副標題', null, function() { console.error(this); }),
      TableViewCellCheckmark('icon-2e', '標題', '副標題', null, function() { console.error(this); }),
    ]),
  ]

  var nvc = NavigationController(tvc)
  // nvc.present()






















  // var vc = ViewController()
  // vc.navigationBar.title.text = "第一頁"
  
  // vc.view.click = function() {
  //   var vc = ViewController()
  //   vc.navigationBar.title.text = "第二頁"
  //   vc.navigationBar.right.text = "點我"
  //   vc.navigationBar.right.click = function() {
  //     this.controller.dismiss()
  //   }

  //   this.controller.push(vc)
  // }

  // var nvc = NavigationController(vc)
  // nvc.present()















































//   var a = TableViewController();
//   a.navigationBar.right.text = "d"
//   a.navigationBar.right.click = function() {

//   }
  
//   var tmp = TableViewCell();
//   tmp.title = '標題';
//   tmp.subtitle = "副標題"
//   tmp.type = TableViewCellType.value1
//   tmp.accessory = CellAccessory.arrow
//   tmp.click = function() {
//     console.error(this.controller.navigationController);
    
//     // var a1 = TableViewCell();
//     // a1.title = "項目 1"
//     // a1.accessory = CellAccessory.checkmark
//     // a1.click = function() {
//     //   this.pop()
//     // }

//     // var a2 = TableViewCell();
//     // a2.title = "項目 2"
//     // a2.accessory = CellAccessory.checkmark
//     // a2.isOn = true
//     // a2.click = function() {
//     //   this.pop()
//     // }

//     // var b = TableViewController();
//     // b.navigationBar.title.text = "選"
//     // b.tableview.sections = [
//     //   TableViewSection([
//     //     a1, a2
//     //     ])
//     // ];
//     // this.push(b)
//   };
        

//   a.tableview.sections = [TableViewSection([
// tmp
//     ])]
//   var nvc = NavigationController(a);
//   nvc.present()




//   var vc = ViewController()

//   vc.view = TableView()
//     var a0 = TableViewSection()
//     a0.header = TableViewHeaderFooter()
//     a0.header.html = 'dd'

//     a0.rows = [
//       (()=>{
//         var tmp = TableViewCellInput(); tmp.title = '標題';
//         tmp.subtitle = "副標題"
//         tmp.name = 'OA'
//         tmp.model = ''
//         tmp.check = function() {
//           return "a"
//         };
//         return tmp;
//       })(),
//       (()=>{
//         var tmp = TableViewCellInput();
//         tmp.subtitle = "副標題"
//         tmp.name = 'OA'
//         tmp.model = ''
//         tmp.check = function() {
//           return "a"
//         };
//         return tmp;
//       })(),
//       (()=>{
//         var tmp = TableViewCellInput(); tmp.title = '標題';
//         tmp.subtitle = "副標題"
//         tmp.model = ''
//         tmp.type = TableViewCellType.value2;
//         tmp.check = function() {
//           return "a"
//         };
//         return tmp;
//       })(),
//       (()=>{
//         var tmp = TableViewCellInput();
//         tmp.subtitle = "副標題"
//         tmp.model = ''
//         tmp.type = TableViewCellType.value2;
//         tmp.check = function() {
//           return "a"
//         };
//         return tmp;
//       })(),
//     ];
//     var a1 = TableViewSection()
//     a1.header = "普通"
//     a1.rows = [
//       // (()=>{
//       //   var tmp = TableViewCellText(); tmp.title = '標題';
//       //   tmp.subtitle = "副標題"
//       //   tmp.name = 'OA'
//       //   tmp.model = ''
//       //   tmp.check = function() {
//       //     return "a"
//       //   };
//       //   return tmp;
//       // })(),
//       // (()=>{
//       //   var tmp = TableViewCellText();
//       //   tmp.subtitle = "副標題"
//       //   tmp.name = 'OA'
//       //   tmp.model = ''
//       //   tmp.check = function() {
//       //     return "a"
//       //   };
//       //   return tmp;
//       // })(),
//       // (()=>{
//       //   var tmp = TableViewCellText(); tmp.title = '標題';
//       //   tmp.subtitle = "副標題"
//       //   tmp.model = ''
//       //   tmp.type = TableViewCellType.value2;
//       //   tmp.check = function() {
//       //     return "a"
//       //   };
//       //   return tmp;
//       // })(),
//       (()=>{
//         var tmp = TableViewCellText();
//         tmp.subtitle = "副標題"
//         tmp.model = ''
//         tmp.type = TableViewCellType.value2;
//         tmp.check = function() {

//           return this.model.length ? "" : "請輸入！"
//         };
//         return tmp;
//       })(),
//     ];

//     var a = TableViewSection()
//     a.header = "普通"
//     a.rows = [
//       (()=>{
//         var tmp = TableViewCell(); tmp.title = '標題';
//         return tmp;
//       })(),
//       (()=>{
//         var tmp = TableViewCell(); tmp.title = '標題'; tmp.subtitle = '副標題';
//         tmp.type = TableViewCellType.subtitle;
//         return tmp;
//       })(),
//       (()=>{
//         var tmp = TableViewCell(); tmp.title = '標題'; tmp.subtitle = '副標題';
//         tmp.type = TableViewCellType.value1;
//         return tmp;
//       })(),
//       (()=>{
//         var tmp = TableViewCell(); tmp.title = '標題'; tmp.subtitle = '副標題';
//         tmp.type = TableViewCellType.value2;
//         return tmp;
//       })(),
//     ];

//     var b = TableViewSection();
//     b.header = "Arrow"
//     b.rows = [
//       (()=>{
//         var tmp = TableViewCell(); tmp.title = '標題';
//         tmp.accessory = CellAccessory.arrow;
//         tmp.click = function() {

//           var vc = ViewController();
//           vc.title = "2"

//           this.push(vc);
//         }
//         return tmp;
//       })(),
//       (()=>{
//         var tmp = TableViewCell(); tmp.title = '標題'; tmp.subtitle = '副標題'; tmp.type = TableViewCellType.subtitle;
//         tmp.accessory = CellAccessory.arrow;
//         return tmp;
//       })(),
//       (()=>{
//         var tmp = TableViewCell(); tmp.title = '標題'; tmp.subtitle = '副標題'; tmp.type = TableViewCellType.value1;
//         tmp.accessory = CellAccessory.arrow;
//         return tmp;
//       })(),
//       (()=>{
//         var tmp = TableViewCell(); tmp.title = '標題'; tmp.subtitle = '副標題'; tmp.type = TableViewCellType.value2;
//         tmp.accessory = CellAccessory.arrow;
//         return tmp;
//       })(),
//     ];

//     var c = TableViewSection();
//     c.header = "Switch"
//     c.rows = [
//       (()=>{
//         var tmp = TableViewCell(); tmp.title = '標題'; tmp.accessory = CellAccessory.switch;
//         tmp.click = function(val) {
//           console.error(this, val);
                    
//         }
//         return tmp;
//       })(),
//       (()=>{
//         var tmp = TableViewCell(); tmp.title = '標題'; tmp.subtitle = '副標題'; tmp.type = TableViewCellType.subtitle;
//         tmp.accessory = CellAccessory.switch;
//         tmp.click = function() {
//           // this.dismiss();
          
//         }
//         return tmp;
//       })(),
//       (()=>{
//         var tmp = TableViewCell(); tmp.title = '標題'; tmp.subtitle = '副標題'; tmp.type = TableViewCellType.value1;
//         tmp.accessory = CellAccessory.switch;
//         tmp.click = function() {
//           // this.dismiss();
          
//         }
//         return tmp;
//       })(),
//       (()=>{
//         var tmp = TableViewCell(); tmp.title = '標題'; tmp.subtitle = '副標題'; tmp.type = TableViewCellType.value2;
//         tmp.accessory = CellAccessory.switch;
//         tmp.click = function() {
//           // this.dismiss();
//         }
//         return tmp;
//       })(),
//     ];

//     var d = TableViewSection();
//     d.header = "Checkmark"
//     d.rows = [
//       (()=>{
//         var tmp = TableViewCell(); tmp.title = '標題';
//         tmp.accessory = CellAccessory.checkmark;
//         return tmp;
//       })(),
//       (()=>{
//         var tmp = TableViewCell(); tmp.title = '標題'; tmp.subtitle = '副標題'; tmp.type = TableViewCellType.subtitle;
//         tmp.accessory = CellAccessory.checkmark;
//         return tmp;
//       })(),
//       (()=>{
//         var tmp = TableViewCell(); tmp.title = '標題'; tmp.subtitle = '副標題'; tmp.type = TableViewCellType.value1;
//         tmp.accessory = CellAccessory.checkmark;
//         return tmp;
//       })(),
//       (()=>{
//         var tmp = TableViewCell(); tmp.title = '標題'; tmp.subtitle = '副標題'; tmp.type = TableViewCellType.value2;
//         tmp.accessory = CellAccessory.checkmark;
//         return tmp;
//       })(),
//     ];

//     var e = TableViewSection();
//     e.header = "Button"
//     e.rows = [
//       (()=>{
//         var tmp = TableViewCell(); tmp.title = '確定';
//         tmp.align = TableViewCellAlign.center
//         tmp.color = CellColor.blue
//         tmp.click = function() {
//           var rows = this.view.sections.map(function(section) { return section.rows.filter(function(row) { return row instanceof TableViewCellInput || row instanceof TableViewCellText; }); }).filter(function(section) { return section.length }).reduce(function(a, b) { return a.concat(b); });
          
//           var error = rows
//             .map(function(row) { row.error = typeof row.check === 'function' ? row.check() : null; return row.error; })
//             .filter(function(error) { return error; }).length > 0;

//           if (error)
//             return;

//           var data = {}, tmps = rows.filter(function(a) { return typeof a.name === 'string'; }); for (var i in tmps) data[tmps[i].name] = tmps[i].model

// console.error(error, data);

//           // console.error(data);
//         }
//         return tmp;
//       })(),
//     ];

//     var f = TableViewSection();
//     f.rows = [
//       (()=>{
//         var tmp = TableViewCell(); tmp.title = '取消';
//         tmp.align = TableViewCellAlign.center
//         tmp.color = TableViewCellColor.red
//         return tmp;
//       })(),
//     ];

//     vc.view.sections = [
//       a0,
//       a1,
//       // a, b, c, d,
//       e,
//        // f
//     ];

//   // vc.navigationBar.title.text = "1";
//   // vc.navigationBar.left.text = "a"
//   // vc.navigationBar.left.click = function() {
//   //   console.error(this);
    
//   // }

//   // vc.view.click = function() {

//   //   var vc = ViewController();
//   //   // vc.title = "2"
//   //   // vc.navigationBar.right.text = ""
//   //   // vc.navigationBar.right.click = function() {
//   //   //   console.error(this);
//   //   // }

//   //   // vc.navigationBar.setRight("sss", function() {
//   //   //   console.error(this);
      
//   //   // });

//   //   // vc.view.click = function() {

//   //   // // this.navigationController && this.navigationController.push(vc)
//   //   //   // var vc = ViewController();
//   //   //   // vc.title = "3"
//   //   //   // this.navigationController && this.navigationController.push(vc)
//   //   //   this.pop()
//   //   // };

//   //   this.push(vc)
    
//   // }

//   var nvc = NavigationController(vc);

//   nvc.present(function() {

//   });







// //   var vc = ViewController()
// //   vc.view = TableView()
// //     var a0 = TableViewSection()
// //     a0.header = "普通"
// //     a0.rows = [
// //       (()=>{
// //         var tmp = TableViewCellInput(); tmp.title = '標題';
// //         tmp.subtitle = "副標題"
// //         tmp.name = 'OA'
// //         tmp.model = ''
// //         tmp.check = function() {
// //           return "a"
// //         };
// //         return tmp;
// //       })(),
// //       (()=>{
// //         var tmp = TableViewCellInput();
// //         tmp.subtitle = "副標題"
// //         tmp.name = 'OA'
// //         tmp.model = ''
// //         tmp.check = function() {
// //           return "a"
// //         };
// //         return tmp;
// //       })(),
// //       (()=>{
// //         var tmp = TableViewCellInput(); tmp.title = '標題';
// //         tmp.subtitle = "副標題"
// //         tmp.model = ''
// //         tmp.type = TableViewCellType.value2;
// //         tmp.check = function() {
// //           return "a"
// //         };
// //         return tmp;
// //       })(),
// //       (()=>{
// //         var tmp = TableViewCellInput();
// //         tmp.subtitle = "副標題"
// //         tmp.model = ''
// //         tmp.type = TableViewCellType.value2;
// //         tmp.check = function() {
// //           return "a"
// //         };
// //         return tmp;
// //       })(),
// //     ];
// //     var a1 = TableViewSection()
// //     a1.header = "普通"
// //     a1.rows = [
// //       // (()=>{
// //       //   var tmp = TableViewCellText(); tmp.title = '標題';
// //       //   tmp.subtitle = "副標題"
// //       //   tmp.name = 'OA'
// //       //   tmp.model = ''
// //       //   tmp.check = function() {
// //       //     return "a"
// //       //   };
// //       //   return tmp;
// //       // })(),
// //       // (()=>{
// //       //   var tmp = TableViewCellText();
// //       //   tmp.subtitle = "副標題"
// //       //   tmp.name = 'OA'
// //       //   tmp.model = ''
// //       //   tmp.check = function() {
// //       //     return "a"
// //       //   };
// //       //   return tmp;
// //       // })(),
// //       // (()=>{
// //       //   var tmp = TableViewCellText(); tmp.title = '標題';
// //       //   tmp.subtitle = "副標題"
// //       //   tmp.model = ''
// //       //   tmp.type = TableViewCellType.value2;
// //       //   tmp.check = function() {
// //       //     return "a"
// //       //   };
// //       //   return tmp;
// //       // })(),
// //       (()=>{
// //         var tmp = TableViewCellText();
// //         tmp.subtitle = "副標題"
// //         tmp.model = ''
// //         tmp.type = TableViewCellType.value2;
// //         tmp.check = function() {

// //           return this.model.length ? "" : "請輸入！"
// //         };
// //         return tmp;
// //       })(),
// //     ];

// //     var a = TableViewSection()
// //     a.header = "普通"
// //     a.rows = [
// //       (()=>{
// //         var tmp = TableViewCell(); tmp.title = '標題';
// //         return tmp;
// //       })(),
// //       (()=>{
// //         var tmp = TableViewCell(); tmp.title = '標題'; tmp.subtitle = '副標題';
// //         tmp.type = TableViewCellType.subtitle;
// //         return tmp;
// //       })(),
// //       (()=>{
// //         var tmp = TableViewCell(); tmp.title = '標題'; tmp.subtitle = '副標題';
// //         tmp.type = TableViewCellType.value1;
// //         return tmp;
// //       })(),
// //       (()=>{
// //         var tmp = TableViewCell(); tmp.title = '標題'; tmp.subtitle = '副標題';
// //         tmp.type = TableViewCellType.value2;
// //         return tmp;
// //       })(),
// //     ];

// //     var b = TableViewSection();
// //     b.header = "Arrow"
// //     b.rows = [
// //       (()=>{
// //         var tmp = TableViewCell(); tmp.title = '標題';
// //         tmp.accessory = CellAccessory.arrow;
// //         tmp.click = function() {

// //           var vc = ViewController();
// //           vc.title = "2"

// //           this.push(vc);
// //         }
// //         return tmp;
// //       })(),
// //       (()=>{
// //         var tmp = TableViewCell(); tmp.title = '標題'; tmp.subtitle = '副標題'; tmp.type = TableViewCellType.subtitle;
// //         tmp.accessory = CellAccessory.arrow;
// //         return tmp;
// //       })(),
// //       (()=>{
// //         var tmp = TableViewCell(); tmp.title = '標題'; tmp.subtitle = '副標題'; tmp.type = TableViewCellType.value1;
// //         tmp.accessory = CellAccessory.arrow;
// //         return tmp;
// //       })(),
// //       (()=>{
// //         var tmp = TableViewCell(); tmp.title = '標題'; tmp.subtitle = '副標題'; tmp.type = TableViewCellType.value2;
// //         tmp.accessory = CellAccessory.arrow;
// //         return tmp;
// //       })(),
// //     ];

// //     var c = TableViewSection();
// //     c.header = "Switch"
// //     c.rows = [
// //       (()=>{
// //         var tmp = TableViewCell(); tmp.title = '標題'; tmp.accessory = CellAccessory.switch;
// //         tmp.click = function(val) {
// //           console.error(this, val);
                    
// //         }
// //         return tmp;
// //       })(),
// //       (()=>{
// //         var tmp = TableViewCell(); tmp.title = '標題'; tmp.subtitle = '副標題'; tmp.type = TableViewCellType.subtitle;
// //         tmp.accessory = CellAccessory.switch;
// //         tmp.click = function() {
// //           // this.dismiss();
          
// //         }
// //         return tmp;
// //       })(),
// //       (()=>{
// //         var tmp = TableViewCell(); tmp.title = '標題'; tmp.subtitle = '副標題'; tmp.type = TableViewCellType.value1;
// //         tmp.accessory = CellAccessory.switch;
// //         tmp.click = function() {
// //           // this.dismiss();
          
// //         }
// //         return tmp;
// //       })(),
// //       (()=>{
// //         var tmp = TableViewCell(); tmp.title = '標題'; tmp.subtitle = '副標題'; tmp.type = TableViewCellType.value2;
// //         tmp.accessory = CellAccessory.switch;
// //         tmp.click = function() {
// //           // this.dismiss();
// //         }
// //         return tmp;
// //       })(),
// //     ];

// //     var d = TableViewSection();
// //     d.header = "Checkmark"
// //     d.rows = [
// //       (()=>{
// //         var tmp = TableViewCell(); tmp.title = '標題';
// //         tmp.accessory = CellAccessory.checkmark;
// //         return tmp;
// //       })(),
// //       (()=>{
// //         var tmp = TableViewCell(); tmp.title = '標題'; tmp.subtitle = '副標題'; tmp.type = TableViewCellType.subtitle;
// //         tmp.accessory = CellAccessory.checkmark;
// //         return tmp;
// //       })(),
// //       (()=>{
// //         var tmp = TableViewCell(); tmp.title = '標題'; tmp.subtitle = '副標題'; tmp.type = TableViewCellType.value1;
// //         tmp.accessory = CellAccessory.checkmark;
// //         return tmp;
// //       })(),
// //       (()=>{
// //         var tmp = TableViewCell(); tmp.title = '標題'; tmp.subtitle = '副標題'; tmp.type = TableViewCellType.value2;
// //         tmp.accessory = CellAccessory.checkmark;
// //         return tmp;
// //       })(),
// //     ];

// //     var e = TableViewSection();
// //     e.header = "Button"
// //     e.rows = [
// //       (()=>{
// //         var tmp = TableViewCell(); tmp.title = '確定';
// //         tmp.align = TableViewCellAlign.center
// //         tmp.color = TableViewCellColor.blue
// //         tmp.click = function() {
// //           var rows = this.view.sections.map(function(section) { return section.rows.filter(function(row) { return row instanceof TableViewCellInput || row instanceof TableViewCellText; }); }).filter(function(section) { return section.length }).reduce(function(a, b) { return a.concat(b); });
          
// //           var error = rows
// //             .map(function(row) { row.error = typeof row.check === 'function' ? row.check() : null; return row.error; })
// //             .filter(function(error) { return error; }).length > 0;

// //           if (error)
// //             return;

// //           var data = {}, tmps = rows.filter(function(a) { return typeof a.name === 'string'; }); for (var i in tmps) data[tmps[i].name] = tmps[i].model

// // console.error(error, data);

// //           // console.error(data);
// //         }
// //         return tmp;
// //       })(),
// //     ];

// //     var f = TableViewSection();
// //     f.rows = [
// //       (()=>{
// //         var tmp = TableViewCell(); tmp.title = '取消';
// //         tmp.align = TableViewCellAlign.center
// //         tmp.color = TableViewCellColor.red
// //         return tmp;
// //       })(),
// //     ];

// //     vc.view.sections = [
// //       // a0,
// //       a1,
// //       // a, b, c, d,
// //       e,
// //        // f
// //     ];

// //     // vc.view.sections = []
// //     // // vc.view.text = "讀取中，請稍候…"
// //     // Timer(function() {
// //     //   // vc.view.sections = [
// //     //   //   a, b, c, d, e, f
// //     //   // ];
// //     //   vc.view.text = "無法取得資料，請稍後再試！";
// //     // }, 2000)



// //   // vc.view.click = function() {
// //   //   console.error(this);
    
// //   // }

// //   vc.title = "1";
// //   // vc.view.click = function() {

// //   //   var vc = ViewController();
// //   //   vc.title = "2"
// //   //   vc.navigationBar.setRight("sss", function() {
// //   //     console.error(this);
      
// //   //   });

// //   //   vc.view.click = function() {

// //   //   // this.navigationController && this.navigationController.push(vc)
// //   //     // var vc = ViewController();
// //   //     // vc.title = "3"
// //   //     // this.navigationController && this.navigationController.push(vc)
// //   //     this.pop()
// //   //   };

// //   //   this.push(vc)
    
// //   // }
// //   // vc.present()
  
// //   // vc.navigationBar.setRight('aaa', );
// //   // vc.navigationBar.title.text = "d"
// //   // vc.navigationBar.title.dblclick = function() {
// //   //   console.error('xxxxx');
// //   // }

// //   // vc.navigationBar.right.click = function() {
// //   //   console.error('x');
// //   // }

// //   var nvc = NavigationController(vc);
// //   nvc.present(function() {

// //   // // // //   // Timer(function() {
// //   // // // //   //   var vc = ViewController();
// //   // // // //   //   vc.title = "ddd"
// //   // // // //   //   this.push(vc)
// //   // // // //   // }.bind(this), 500)
// //   });
//   // console.error(nvc);
  


//   // nvc.present(function() {
//     // vc.view = TableView();
//     // this.view.text = '123'
//   // });

//   // Timer(function() {
    
//   // vc.navigationBar.right.click = function() {
//   //   console.error('x11');
//   // }

//   // }, 1000)








//   // CViewController.prototype = Object.create(ViewController.prototype);
//   // function CViewController() { if (!(this instanceof CViewController)) return new CViewController();
//   //   ViewController.call(this);
//   // }

//   // Timer(function() {
//   //   var va = CViewController(); 
//   //   va.present();
//   // }, 1000)







//   // Timer(function() {

// //   var vc = new ViewController();
// //   vc.present(function() {
// //     console.error(this);

// //     // this.dismiss(function() {
// //     //   console.error(this);
// //     // });
// //   });
// // }, 1000)
  
//   // Window.main().present(a);
// // console.error(a);

//   // setTimeout(function() {
//   //   a.addClass('present')
//   //   // a.click = function() {
//   //   //   console.error('2');
//   //   // }
//   // }, 1000)

});