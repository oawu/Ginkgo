
$(function() {
  function $_(tag)        { return $('<' + tag + ' />'); }
  function $_a()          { return $_('a'); }
  function $_b()          { return $_('b'); }
  function $_button()     { return $_('button'); }
  function $_div()        { return $_('div'); }
  function $_figcaption() { return $_('figcaption'); }
  function $_figure()     { return $_('figure'); }
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
  function $_time()       { return $_('time'); }
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
    props: {  view: View },
    computed: {
      click: function() { return this.view.click && typeof this.view.click === 'function' ? this.view.click.bind(this.view && this.view.viewController && this.view.viewController instanceof ViewController ? this.view.viewController : null) : function() {}; },
    },
    template: $_div().attr(':class', 'view.class')
                     .attr('v-on:click.prevent', 'click')
                     .text('{{ view.text }}').prop('outerHTML')
  });
  Vue.component('navigation-bar', {
    props: {  bar: NavigationBar },
    methods: {
    },
    computed: {
      titleText:     function() { return this.bar && this.bar.viewController ? this.bar.viewController.title : '' },
      titleClass:    function() { return this.bar && this.bar.title && this.bar.title.class    ? this.bar.title.class : function() {}; },
      titleClick:    function() { return this.bar && this.bar.title && this.bar.title.click    && typeof this.bar.title.click === 'function' ? this.bar.title.click.bind(this.bar && this.bar.navigationController && this.bar.navigationController instanceof NavigationController ? this.bar.navigationController : null) : function() {}; },
      titleDblClick: function() { return this.bar && this.bar.title && this.bar.title.dblclick && typeof this.bar.title.dblclick === 'function' ? this.bar.title.dblclick.bind(this.bar && this.bar.navigationController && this.bar.navigationController instanceof NavigationController ? this.bar.navigationController : null) : function() {}; },
      leftText:      function() { return this.bar && this.bar.left  && this.bar.left.text  ? this.bar.left.text  : ''; },
      leftClass:     function() { return this.bar && this.bar.left  && this.bar.left.class ? this.bar.left.class : ''; },
      leftClick:     function() { return this.bar && this.bar.left  && this.bar.left.click && typeof this.bar.left.click === 'function' ? this.bar.left.click.bind(this.bar && this.bar.navigationController && this.bar.navigationController instanceof NavigationController ? this.bar.navigationController : null) : function() {}; },
      rightText:     function() { return this.bar && this.bar.right && this.bar.right.text  ? this.bar.right.text  : ''; },
      rightClass:    function() { return this.bar && this.bar.right && this.bar.right.class ? this.bar.right.class : ''; },
      rightClick:    function() { return this.bar && this.bar.right && this.bar.right.click && typeof this.bar.right.click === 'function' ? this.bar.right.click.bind(this.bar && this.bar.navigationController && this.bar.navigationController instanceof NavigationController ? this.bar.navigationController : null) : function() {}; },
    },
    template: $_div().attr(':class', 'bar.class')
                     .attr('v-on:click.prevent', 'bar.click && bar.click')
                     .append(
                        $_label().attr(':class', 'leftClass').attr('v-on:click.prevent', 'leftClick').text('{{ leftText }}')).append(
                        $_header().attr(':class', 'titleClass').attr('v-on:click.prevent', 'titleClick').attr('v-on:dblclick.prevent', 'titleDblClick').text('{{ titleText }}')).append(
                        $_label().attr(':class', 'rightClass').attr('v-on:click.prevent', 'rightClick').text('{{ rightText }}'))
                     .prop('outerHTML')
  });

  Vue.component('table-view', {
    props: {  view: View },
    template: $_div().attr(':class', 'view.class')
                     .attr('v-on:click.prevent', 'view.click && view.click')
                     .text('{{ view.text }}').prop('outerHTML')
  });
  Vue.component('view-controller', {
    props: { controller: ViewController },
    template: $_div().attr(':class', 'controller.class')
                     .attr('v-on:click.prevent', 'controller.click && controller.click').append(
                $_component().attr(':is', 'controller.navigationBar && controller.navigationBar.component')
                             .attr(':bar', 'controller.navigationBar')).append(
                $_component().attr(':is', 'controller.view && controller.view.component')
                             .attr(':view', 'controller.view')).prop('outerHTML')
  });
  Vue.component('navigation-controller', {
    props: { controller: NavigationController },
    template: $_div().attr(':class', 'controller.class')
                     .attr('v-on:click.prevent', 'controller.click && controller.click').append(
                $_component()
                  .attr('v-for', '(viewController, i) in controller.viewControllers')
                  .attr(':key', 'i')
                  .attr(':is', 'viewController.component')
                  .attr(':controller', 'viewController')
                ).prop('outerHTML')
  });

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

  ViewController.prototype = Object.create(OAUI.prototype);
  function ViewController() { if (!(this instanceof ViewController)) return new ViewController();
    OAUI.call(this, 'ViewController');
    var navigationController = null;

    this.title = null;
    this.component = Vue.component('view-controller');
    this.navigationBar = NavigationBar()
    this.navigationBar.viewController = this
    this.view = View();
    this.view.viewController = this
    this.present = function(completion, animate) { Window.main().present(this, completion, animate); };
    this.dismiss = function(completion, animate) { Window.main().dismiss(this, completion, animate); };
    this.navigationController = function(n) { if (typeof n === 'undefined') return navigationController; if (n instanceof NavigationController) navigationController = n; return this; };
    // this.pop = function(completion, animate) {
    //   return navigationController !== null && navigationController instanceof NavigationController ? navigationController.pop(completion, animate) : this;
    // };

    // this.push = function(viewController, completion, animate) {
    //   return navigationController ? navigationController.push(viewController, completion, animate) : this; };
  }
  
  View.prototype = Object.create(OAUI.prototype);
  function View() { if (!(this instanceof View)) return new View();
    OAUI.call(this, 'View');

    this.component = Vue.component('view');
    this.text = '';
    this.viewController = null;
    this.navigationController = null;
  }

  NavigationBar.prototype = Object.create(View.prototype);
  function NavigationBar() { if (!(this instanceof NavigationBar)) return new NavigationBar();
    View.call(this);

    this.component = Vue.component('navigation-bar');
    this.class = 'NavigationBar';
    this.title = { class: null, click: null, dblclick: null };
    this.left = null;
    this.right = null;

    this.setTitle = function(text, click, className, dblclick) { if (typeof text === 'string') this.title.text = text; if (typeof click === 'function') this.title.click = click; if (typeof className === 'string') this.title.class = className; if (typeof dblclick === 'function') this.title.dblclick = dblclick; return this; };
    this.setLeft = function(text, click, className) { if (this.left === null) this.left = { text: null, class: null, click: null }; if (typeof text === 'string') this.left.text = text; if (typeof click === 'function') this.left.click = click; if (typeof className === 'string') this.left.class = className; return this; };
    this.setRight = function(text, click, className) { if (this.right === null) this.right = { text: null, class: null, click: null }; if (typeof text === 'string') this.right.text = text; if (typeof click === 'function') this.right.click = click; if (typeof className === 'string') this.right.class = className; return this; };
  }

  TableView.prototype = Object.create(View.prototype);
  function TableView() { if (!(this instanceof TableView)) return new TableView();
    View.call(this);

    this.component = Vue.component('table-view');
    this.class = 'TableView';
  }

  Window.main = function() { return this._main ? this._main : this._main = Window({ class: 'Window' }); };
  Window.body = function() { return this._body ? this._body : this._body = $('body'); };

  NavigationController.prototype = Object.create(ViewController.prototype);
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
      
      viewController.navigationController(this);
      viewController.navigationBar.navigationController = this;

      this.viewControllers.push(viewController);
      var lastViewController = this.lastViewController();

      lastViewController && viewController.navigationBar.left === null && viewController.navigationBar.setLeft('返回', this.pop, 'back');
      
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

    this.addClass('NavigationController').push(rootViewController, null, false);
  }

  var vc = ViewController()
  vc.title = '1'
  vc.view.click = function() {
    var vc = ViewController();
    vc.title = "2"
    vc.view.click = function() {
    this.navigationController() && this.navigationController().push(vc)
      var vc = ViewController();
      vc.title = "3"
      this.navigationController() && this.navigationController().push(vc)
    };

    this.navigationController() && this.navigationController().push(vc)
    
  }
  
  // vc.navigationBar.right.text = "aaa"
  // vc.navigationBar.title.text = "d"
  // vc.navigationBar.title.dblclick = function() {
  //   console.error('xxxxx');
  // }

  // vc.navigationBar.right.click = function() {
  //   console.error('x');
  // }

  var nvc = NavigationController(vc);
  nvc.present(function() {
    // Timer(function() {
    //   var vc = ViewController();
    //   vc.title = "ddd"
    //   this.push(vc)
    // }.bind(this), 500)
  });
  // console.error(nvc);
  


  // nvc.present(function() {
    // vc.view = TableView();
    // this.view.text = '123'
  // });

  // Timer(function() {
    
  // vc.navigationBar.right.click = function() {
  //   console.error('x11');
  // }

  // }, 1000)








  // CViewController.prototype = Object.create(ViewController.prototype);
  // function CViewController() { if (!(this instanceof CViewController)) return new CViewController();
  //   ViewController.call(this);
  // }

  // Timer(function() {
  //   var va = CViewController(); 
  //   va.present();
  // }, 1000)







  // Timer(function() {

//   var vc = new ViewController();
//   vc.present(function() {
//     console.error(this);

//     // this.dismiss(function() {
//     //   console.error(this);
//     // });
//   });
// }, 1000)
  
  // Window.main().present(a);
// console.error(a);

  // setTimeout(function() {
  //   a.addClass('present')
  //   // a.click = function() {
  //   //   console.error('2');
  //   // }
  // }, 1000)

});