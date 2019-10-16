
$(function() {

  function el(e, a, t, h) {if (!(this instanceof el)) return h ? new el(e, a, t).toHTML() : new el(e, a, t).toString();
    if (!e || typeof e !== 'string') { t = a; a = e; e = 'component'; }

    a = Array.isArray(a) ? a.map(function(b) {
      b = [b.substr(0, (b.indexOf('='))), b.substr((b.indexOf('=')) + 1)].map(function(c) { return c.trim(); }).filter(function(c) { return c.length; })
      var k = b.slice(0, 1).join('='), v = b.slice(1).join('='); if (!(k && v)) return null;

      k = k == '@if' ? 'v-if' : k;
      k = k == '@for' ? 'v-for' : k;
      k = k == '@on' ? 'v-on' : k;
      k = k == '@bind' ? 'v-bind' : k;
      k = k == '@html' ? 'v-html' : k;
      k = k == '@text' ? 'v-text' : k;
      k = k == '@model' ? 'v-model.trim' : k;
      k = k == '@focus' ? 'v-on:focus' : k;
      k = k == '@click' ? 'v-on:click' : k;
      k = k[0] == '@' ? ':' + k.substr(1) : k

      return k + '="' + v.replace(/"/g, "'") + '"';
    }).filter(function(b) { return b; }).join(' ') : '';

    t = Array.isArray(t) ? t.join('') : t;
    t = typeof t === 'string' ? t : '';

    this.toString = function() {
      return 'area,base,br,col,command,embed,hr,img,input,keygen,link,meta,param,source,track,wbr'.split(/,/).indexOf(e) != -1
        ? '<' + e + (a && ' ' + a) + ' />'
        : '<' + e + (a && ' ' + a) + '>' + t + '</' + e + '>'
    };
    this.toHTML = function() {
      var el = document.createElement('template');
      el.innerHTML = this;
      el = el.content.firstChild;
      document.body.appendChild(el);
      return el;
    };
  }

  Vue.component('v', {
    props: {
      view: View,
      controller: ViewController },
    mounted: function() {
      this.view.controller = this.controller; },
    computed: {
      on: function() {
        for (var i in this.view.on)
          if (typeof this.view.on[i] === 'function')
            this.view.on[i] = this.view.on[i].bind(this.view);
          else
            delete this.view.on[i];
        return this.view.on;
      }},
    template: el(['@is=view.el', '@class=view.class', '@on=on', '@text=view.text'])
  });

  Vue.component('tv-cl', {
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
      el: function() {
        return this.cell.marker == 'switch' ? 'div' : 'label'; },
      image: function() {
        return this.cell.image !== null
          ? this.cell.image.type === 'icon'
            ? { class: this.cell.image.val, style: {} }
            : { class: null, style: { backgroundImage: 'url(' + this.cell.image.val + ')' } }
          : null; },
      title: function() {
        return typeof this.cell.title === 'string' ? this.cell.title : ''; },
      detail: function() {
        return this.cell.marker != 'input' && this.cell.marker != 'text'
          ? typeof this.cell.detail === 'string' ? this.cell.detail : ''
          : null; },
      textInput: function() {
        return this.cell.marker != 'input' && this.cell.marker != 'text'
          ? null
          : {
            el: this.cell.marker == 'input' ? 'input' : 'textarea',
            type: this.cell.marker == 'input' ? 'text' : null,
            placeholder: typeof this.cell.detail === 'string' && this.cell.detail ? this.cell.detail : '' }; },
      error: {
        set: function(val) {
          this.cell.error = val; },
        get: function() {
          return this.cell.marker == 'input' || this.cell.marker == 'text'
            ? typeof this.cell.error === 'string' && this.cell.error
              ? this.cell.error
              : null
            : null; }
      },
      marker: function() {
        return ['switch', 'arrow', 'check'].indexOf(this.cell.marker) !== -1
          ? this.cell.marker == 'switch'
            ? 'label'
            : 'i'
          : null; },
      onEl: function() {
        if (this.cell.marker == 'switch') return {};
        if (this.cell.marker == 'check') return { click: this.tableview.checkCellOnly.bind(this.tableview, this.cell) }
        return typeof this.cell.click === 'function' ? { click: this.cell.click.bind(this.cell) } : {}
        // return this.cell.marker !== 'switch' && typeof this.cell.click === 'function' ? { click: this.cell.marker != 'check' ? : this.cell.click.bind(this.cell) } : {};

      },
      onMarker: function() {
        return this.cell.marker == 'switch' && typeof this.cell.click === 'function' ? { click: this.cell.click.bind(this.cell) } : {}; },
      className: function() {
        var tmps = this.cell.classList();
        
        this.cell.image && tmps.push(this.cell.image.type);
        this.cell.align && tmps.push(this.cell.align);
        this.cell.color && tmps.push(this.cell.color);
        this.cell.wrap && tmps.push(this.cell.wrap);
        this.cell.marker && tmps.push(this.cell.marker);
        this.cell.isOn && (this.cell.marker == 'switch' || this.cell.marker == 'check') && tmps.push('on');
        this.cell.marker != 'input' && this.cell.marker != 'text' && this.cell.layout && tmps.push(this.cell.layout);

        return tmps.filter(function(t) { return t !== null; }).join(' ');
      }
    },
    template: el(['@is=el', '@class=className', '@on=onEl'], [
      el('figure', ['@if=image', '@class=image.class', '@style=image.style']),
      el('b', ['@if=title', '@text=title']),
      el('span', ['@if=detail', '@text=detail']),
      el('span', ['@if=textInput'], [
        el('input', ['@if=textInput.el=="input"', '@type=textInput.type', '@placeholder=textInput.placeholder', '@focus=error=null', 'v-model.trim=cell.value']),
        el('textarea', ['@if=textInput.el=="textarea"', '@type=textInput.type', '@placeholder=textInput.placeholder', '@focus=error=null', 'v-model.trim=cell.value']),
        el('u', ['@if=error', '@text=error'])]),
      el(['@if=marker', '@is=marker', '@on=onEl'])])
  });

  Vue.component('tv-h', {
    props: {
      header: TableViewHeader,
      section: TableViewSection,
      tableview: TableView,
      controller: ViewController },
    mounted: function() {
      this.header.section = this.section;
      this.header.tableview = this.tableview;
      this.header.controller = this.controller; },
    template: el([
      '@is=header.el',
      '@class=header.class',
      '@html=header.html'])
  });

  Vue.component('tv-f', {
    props: {
      footer: TableViewFooter,
      section: TableViewSection,
      tableview: TableView,
      controller: ViewController },
    mounted: function() {
      this.footer.section = this.section;
      this.footer.tableview = this.tableview;
      this.footer.controller = this.controller; },
    template: el([
      '@is=footer.el',
      '@class=footer.class',
      '@html=footer.html'])
  });

  Vue.component('tv-s', {
    props: {
      section: TableViewSection,
      tableview: TableView,
      controller: ViewController },
    mounted: function() {
      this.section.tableView = this.tableview;
      this.tableview.controller = this.controller; },
    computed: {
      header: function() { return this.section.header && this.section.header instanceof TableViewHeader && this.section.header },
      footer: function() { return this.section.footer && this.section.footer instanceof TableViewFooter && this.section.footer },
      rows: function() { return this.section.rows.filter(function(row) { return row instanceof TableViewCell; }); } },
    template: el(['@is=section.el', '@class=section.class'], [
      el([
        '@if=header',
        '@is=header.component',
        '@header=header',
        '@section=section',
        '@tableview=tableview',
        '@controller=controller']),
      el([
        '@for=(row, i) in rows',
        '@key=i',
        '@is=row.component',
        '@class=[i == 0 ? "first" : null, i == rows.length - 1 ? "last" : null]',
        '@cell=row',
        '@section=section',
        '@tableview=tableview',
        '@controller=controller']),
      el([
        '@if=footer',
        '@is=footer.component',
        '@footer=footer',
        '@section=section',
        '@tableview=tableview',
        '@controller=controller'])])
  });

  Vue.component('tv', {
    props: {
      view: View,
      controller: ViewController },
    mounted: function() {
      this.view.controller = this.controller; },
    computed: {
      isLoading: function() { return !Array.isArray(this.view.sections); },
      sections: function() { return !this.isLoading ? this.view.sections.filter(function(section) { return section instanceof TableViewSection; }) : []; } },
    template: el(['@is=view.el', '@class=[view.class, { loading: isLoading }]'],
      el([
        '@for=(section, i) in sections',
        '@key=i',
        '@is=section.component',
        '@section=section',
        '@tableview=view',
        '@controller=controller']))
  });

  Vue.component('acv', {
    props: {
      view: View,
      controller: ViewController },
    mounted: function() {
      this.view.controller = this.controller; },
    computed: {
      btns: function() {
        return this.view.buttons; } },
    template: el(['@if=view.title || view.message || btns.length', '@is=view.el', '@class=view.class'], [
      el('div', ['@if=view.title || view.message', 'class=Info'], [
        el('b', ['@if=typeof view.title === "string" && view.title', '@text=view.title']),
        el('span', ['@if=typeof view.message === "string" && view.message', '@text=view.message'])]),
      el('div', ['@if=btns.length', 'class=Btns'],
        el(['@for=(btn, i) in btns', '@key=i', '@is=btn.component', '@view=btn', '@controller=controller']))])
  });

  Vue.component('vc', {
    props: {
      controller: ViewController,
      navigation: NavigationController
    },
    mounted: function() {
      this.controller.navigationController = this.navigation; },

    template: el('div', ['@class=controller.class'], [
      el(['@if=navigation && controller.navigationBar', '@is=controller.navigationBar.component', '@bar=controller.navigationBar', '@controller=controller', '@navigation=navigation']),
      el(['@if=controller.view', '@is=controller.view.component', '@view=controller.view', '@controller=controller'])])
  });

  Vue.component('nav-bar', {
    props: {
      bar: NavigationBar,
      controller: ViewController,
      navigation: NavigationController
    },
    mounted: function() {
      this.bar.controller = this.controller; this.bar.navigationController = this.navigation;
      this.bar.left && (this.bar.left.navigationBar = this.bar); this.bar.left && (this.bar.left.controller = this.controller); this.bar.left && (this.bar.left.navigationController = this.navigation);
      this.bar.title && (this.bar.title.navigationBar = this.bar); this.bar.title && (this.bar.title.controller = this.controller); this.bar.title && (this.bar.title.navigationController = this.navigation);
      this.bar.right && (this.bar.right.navigationBar = this.bar); this.bar.right && (this.bar.right.controller = this.controller); this.bar.right && (this.bar.right.navigationController = this.navigation); },
    template: el('div', ['@class=bar.class'], [
      el(['@if=bar.left',  '@is=bar.left.component',  '@view=bar.left',  '@controller=controller']),
      el(['@if=bar.title', '@is=bar.title.component', '@view=bar.title', '@controller=controller']),
      el(['@if=bar.right', '@is=bar.right.component', '@view=bar.right', '@controller=controller'])])
  });

  Vue.component('nc', {
    props: {
      controller: NavigationController },
    computed: {
      vcs: function() { return this.controller.viewControllers.filter(function(vc) { return vc instanceof ViewController; }); } },
    template: el('div', ['@class=controller.class'],
      el(['@for=(vc, i) in vcs', '@key=i', '@is=vc.component', '@controller=vc', '@navigation=controller']))
  });

  function Window() { if (!(this instanceof Window)) return new Window();
    var vue = new Vue({
      data: {
        display: false,
        show: false,
        viewControllers: [] },
      methods: {
        nowVC: function() {
          return this.vcs.length > 0 ? this.vcs[this.vcs.length - 1] : null; } },
      computed: {
        vcs: function() { return this.viewControllers.filter(function(vc) { return vc instanceof ViewController; }); } },
      el: el('div',[
        '@if=display', '@class=["Win", { show: show }]'], 
          el(['@for=(vc, i) in vcs', '@key=i', '@is=vc.component', '@controller=vc']), true)
    });

    this.present = function(viewController, completion, animate) {
      if (!(viewController instanceof ViewController)) return this;
      var tmp = function() { (vue.show || (vue.show = true)); vue.viewControllers.push(viewController); tmp = setTimeout(function() { viewController.addClass('present'); typeof completion === 'function' && setTimeout(completion.bind(viewController), 300); }, 100); tmp = null; delete tmp; };
      animate !== false ? (vue.display || (vue.display = true)) && vue.show ? tmp() : setTimeout(tmp.bind(null), 100) : (vue.display || (vue.display = true)) && (vue.show || (vue.show = true)) && vue.viewControllers.push(viewController.addClass('present')) && typeof completion === 'function' && completion.call(viewController)
      return this;
    };

    this.dismiss = function(viewController, completion, animate) {
      if (!(viewController instanceof ViewController && viewController === vue.nowVC())) return this;
      animate === false ? vue.viewControllers.pop().removeClass('present') && vue.vcs.length ? typeof completion !== 'function' || completion.call(viewController) : (vue.show = false) || (vue.display = false) || typeof completion !== 'function' || completion.call(viewController) : viewController.removeClass('present') && setTimeout(function() { vue.viewControllers.pop(); vue.vcs.length ? typeof completion !== 'function' || completion.call(viewController) : !(vue.show = false) && setTimeout(function() { vue.display = false; }, 300) && typeof completion === 'function' && setTimeout(completion.bind(viewController), 10) }, 300);
      return this;
    };
  }

  Window.main = function() { return this._main ? this._main : this._main = Window(); };
  Window.body = function() { return this._body ? this._body : this._body = $('body'); };

  function OAUI(defaultClass) { if (!(this instanceof OAUI)) return new OAUI(defaultClass);
    this.on = {};
    this.class = typeof defaultClass === 'string' ? defaultClass : null;
    this.classList = function() { return this.class.split(/\s+/); };
    this.hasClass = function(c) { return this.classList().filter(function(t) { return t === c }).length != 0; };
    this.addClass = function(c) { if (typeof c !== 'string' || !(c = c.trim())) return this; if (this.hasClass(c)) return this; var t = this.classList(); t.push(c); this.class = t.join(' '); return this; };
    this.removeClass = function(c) { if (typeof c !== 'string' || !(c = c.trim())) return this; if (!this.hasClass(c)) return this; this.class = this.classList().filter(function(t) { return t != c; }).join(' '); return this; };
  }

  View.prototype = Object.create(OAUI.prototype);
  function View(el) { if (!(this instanceof View)) return new View(el);
    OAUI.call(this, 'V');

    this.controller = null;
    this.component = Vue.component('v');
    this.text = null;
    this.el = typeof el === 'string' && el.length ? el : 'div';

    this.present = function(completion, animate) { return this.controller ? this.controller.present(completion, animate) : this; }
    this.dismiss = function(completion, animate) { return this.controller ? this.controller.dismiss(completion, animate) : this; }
    this.push = function(completion, animate) { return this.controller ? this.controller.push(completion, animate) : this; }
    this.pop  = function(completion, animate) { return this.controller ? this.controller.pop(completion, animate) : this; }
  }

  ViewController.prototype = Object.create(OAUI.prototype);
  function ViewController() { if (!(this instanceof ViewController)) return new ViewController();
    OAUI.call(this, 'VC');
    
    this.component = Vue.component('vc');
    this.navigationController = null;
    this.navigationBar = null
    this.view = View();

    this.present = function(completion, animate) { return Window.main().present(this.navigationController ? this.navigationController : this, completion, animate) && this; };
    this.dismiss = function(completion, animate) { return Window.main().dismiss(this.navigationController ? this.navigationController : this, completion, animate) && this; };

    this.push = function(viewController, completion, animate) { this.navigationController && this.navigationController.push(viewController, completion, animate); return this; };
    this.pop  = function(completion, animate) { this.navigationController && this.navigationController.pop(completion, animate); return this; };

    this.setLeft = function(text, click, className) { this.navigationBar || (this.navigationBar = NavigationBar()); this.navigationBar.left || (this.navigationBar.left = BarButtonItem('label')); this.navigationBar.left.text = text; this.navigationBar.left.class = className; this.navigationBar.left.on.click = click; return this; };
    this.setTitle = function(text, click, className) { this.navigationBar || (this.navigationBar = NavigationBar()); this.navigationBar.title || (this.navigationBar.title = BarButtonItem('header')); this.navigationBar.title.text = text; this.navigationBar.title.class = className; this.navigationBar.title.on.click = click; return this; };
    this.setRight = function(text, click, className) { this.navigationBar || (this.navigationBar = NavigationBar()); this.navigationBar.right || (this.navigationBar.right = BarButtonItem('label')); this.navigationBar.right.text = text; this.navigationBar.right.class = className; this.navigationBar.right.on.click = click; return this; };
  }
  
  BarButtonItem.prototype = Object.create(View.prototype);
  function BarButtonItem(el) { if (!(this instanceof BarButtonItem)) return new BarButtonItem(el);
    View.call(this, el);
    this.navigationBar = null;
    this.navigationController = null;
    this.class = null;
  }

  NavigationBar.prototype = Object.create(View.prototype);
  function NavigationBar() { if (!(this instanceof NavigationBar)) return new NavigationBar();
    View.call(this);

    this.navigationController = null;
    this.component = Vue.component('nav-bar');
    this.class = 'NB';

    this.left  = null;
    this.title = null;
    this.right = null;
  }

  NavigationController.prototype = Object.create(ViewController.prototype);
  function NavigationController(rootViewController) { if (!(this instanceof NavigationController)) return new NavigationController(rootViewController);
    ViewController.call(this);
    
    var isTransition = false;

    this.component = Vue.component('nc');
    this.viewControllers = [];

    this.lastViewController = function() { return this.viewControllers.length > 1 ? this.viewControllers[this.viewControllers.length - 2] : null; };
    this.thisViewController = function() { return this.viewControllers.length > 0 ? this.viewControllers[this.viewControllers.length - 1] : null; };

    this.push = function(viewController, completion, animate) {
      if (isTransition) return this;
      if (!(viewController instanceof ViewController) || viewController instanceof NavigationController || viewController instanceof AlertController) return this;
      isTransition = true;
      
      viewController.navigationBar || (viewController.navigationBar = NavigationBar()); 

      var thisViewController = this.thisViewController();
      thisViewController && viewController.setLeft('返回', this.pop.bind(this), 'back');

      animate === false ? this.viewControllers.push(viewController) && viewController.addClass('push').addClass('ed') && (!thisViewController || thisViewController.addClass('ed').addClass('last')) && !(isTransition = false) && typeof completion === 'function' && completion.call(this) : this.viewControllers.push(viewController.addClass('ani')) && (!thisViewController || thisViewController.addClass('ani')) && setTimeout(function() { viewController.addClass('push'); thisViewController && thisViewController.addClass('last'); setTimeout(function() { viewController.addClass('ed'); isTransition = false; typeof completion === 'function' && completion.call(this) }.bind(this), 350); }.bind(this), 100)
      return this;
    };

    this.pop = function(completion, animate) {
      if (isTransition) return this;

      var viewController = this.thisViewController();
      var lastViewController = this.lastViewController();

      if (lastViewController === null)
        return this.dismiss(completion, animate);
      
      isTransition = true;
      animate === false ? this.viewControllers.pop().removeClass('ani').removeClass('ed').removeClass('push') && lastViewController.removeClass('ani').removeClass('last').removeClass('ed') && !(isTransition = false) && typeof completion === 'function' && completion.call(this) : viewController.addClass('ani').removeClass('ed').removeClass('push') && lastViewController.addClass('ani').removeClass('last') && setTimeout(function() { this.viewControllers.pop(); isTransition = false; typeof completion === 'function' && completion.call(this); }.bind(this), 350)
      return this;
    };

    this.addClass('NC').push(rootViewController, null, false);
  }
  
  AlertController.prototype = Object.create(ViewController.prototype);
  function AlertController(title, message, style) { if (!(this instanceof AlertController)) return new AlertController(title, message, style);
    ViewController.call(this);

    this.view.component = Vue.component('acv');
    this.view.buttons = [];
    this.view.title   = null;
    this.view.message = null;

    this.setTitle = function(title) { typeof title === 'string' && title && (this.view.title = title); return this; };
    this.setMessage = function(message) { typeof message === 'string' && message && (this.view.message = message); return this; };
    this.setStyle = function(style) { typeof style === 'string' && (style == 'sheet' ? this.addClass('sheet') : this.removeClass('sheet')); return this; };
    this.appendButton = function(text, click) { if (typeof text === 'string' && text) { var btn = View('label'); btn.class = null; btn.text = text; btn.on.click = click; this.view.buttons.push(btn); } return this; };
    this.present = function(completion, animate) { return Window.main().present(this, function() { this.view.addClass('popup'); typeof completion === 'function' && (animate === false ? completion.call(this) : setTimeout(completion.bind(this), 300)); }, animate) && this; };
    this.dismiss = function(completion, animate) { this.view.removeClass('popup'); animate === false ? Window.main().dismiss(this, completion, animate) : setTimeout(Window.main().dismiss.bind(Window.main(), this, completion, animate), 300); return this; };

    this.addClass('AC').setTitle(title).setMessage(message).setStyle(style);
  }

  TableViewCell.prototype = Object.create(View.prototype);
  function TableViewCell() { if (!(this instanceof TableViewCell)) return new TableViewCell();
    View.call(this);

    this.section = null;
    this.tableView = null;

    this.component = Vue.component('tv-cl');

    this.image  = null;
    this.title  = null;
    this.detail = null;

    this.name  = null;
    this.value = null;
    this.check = null;

    this.color = null;
    this.align = null;

    this.wrap   = null;
    this.layout = null;
    this.marker = null;
    this.error  = null;
    this.isOn   = false;
    this.click  = null;

    this.class = 'TVCL';

    var markers = ['arrow', 'check', 'switch', 'input', 'text'],
        layouts = ['subtitle', 'value'],
        colors  = ['blue', 'red'],
        aligns  = ['left', 'center', 'right'];

    this.setImage  = function(val) { typeof val === 'string'   && val && (this.image  = { type: 'img',  val: val }); (val === null) && (this.image = null); return this; }
    this.setIcon   = function(val) { typeof val === 'string'   && val && (this.image  = { type: 'icon', val: val }); (val === null) && (this.image = null); return this; }
    this.setTitle  = function(val) { typeof val === 'string'   && val && (this.title  = val);        (val === null) && (this.title  = null);  return this; }
    this.setName   = function(val) { typeof val === 'string'   && val && (this.name   = val);        (val === null) && (this.name   = null);  return this; }
    this.setValue  = function(val) { typeof val === 'string'   && val && (this.value  = val);        (val === null) && (this.value  = null);  return this; }
    this.setWrap   = function(val) { typeof val === 'boolean'  && (this.wrap = val ? 'wrap' : null); (val === null) && (this.wrap   = null);  return this; }
    this.setDetail = function(val) { typeof val === 'string'   && val && (this.detail = val) && this.layout === null && this.setLayout('subtitle'); (val === null) && (this.detail = null);  return this; }
    this.setAlign  = function(val) { typeof val === 'string'   && aligns.indexOf(val) !== -1  && (this.align = val);  (val === null) && (this.align  = null); return this; }
    this.setColor  = function(val) { typeof val === 'string'   && colors.indexOf(val) !== -1  && (this.color = val);  (val === null) && (this.color  = null); return this; }
    this.setLayout = function(val) { typeof val === 'string'   && layouts.indexOf(val) !== -1 && (this.layout = val); (val === null) && (this.layout = null); return this; }
    this.setMarker = function(val) { typeof val === 'string'   && markers.indexOf(val) !== -1 && (this.marker = val); (val === null) && (this.marker = null); return this; }
    this.setCheck  = function(val) { typeof val === 'function' && val && (this.check  = val); (val === null) && (this.check  = null);  return this; }
    this.setClick  = function(val) { typeof val === 'function' && val && (this.click = val);  (val === null) && (this.click  = null);  return this; }
    this.setOn     = function(val) { this.isOn = typeof val === 'boolean'  && val ? true : false; return this; }
  }

  TableViewHeader.prototype = Object.create(View.prototype);
  function TableViewHeader() { if (!(this instanceof TableViewHeader)) return new TableViewHeader();
    View.call(this);
    this.section = null;
    this.tableView = null;

    this.component = Vue.component('tv-h');
    this.html = null;
    this.class = null;
    this.el = 'header';
  }

  TableViewFooter.prototype = Object.create(View.prototype);
  function TableViewFooter() { if (!(this instanceof TableViewFooter)) return new TableViewFooter();
    View.call(this);
    this.section = null;
    this.tableView = null;

    this.component = Vue.component('tv-f');
    this.html = null;
    this.class = null;
    this.el = 'footer';
  }

  TableViewSection.prototype = Object.create(View.prototype);
  function TableViewSection(rows) { if (!(this instanceof TableViewSection)) return new TableViewSection(rows);
    View.call(this);

    this.tableView = null;
    this.component = Vue.component('tv-s');
    
    this.header = null;
    this.footer = null;

    this.rows = [];
    this.appendRow = function(rows) { Array.isArray(rows) || (rows = [rows]); rows = rows.filter(function(row) { return row instanceof TableViewCell; }); for (var i in rows) this.rows.push(rows[i]); return this; }
    this.setHeader = function(html) { if (typeof html === 'string' && html) { this.header || (this.header = TableViewHeader()) && (this.header.html = html); }; return this; }
    this.setFooter = function(html) { if (typeof html === 'string' && html) { this.footer || (this.footer = TableViewFooter()) && (this.footer.html = html); }; return this; }
    this.appendRow(rows).class = 'TVS';
  }

  TableView.prototype = Object.create(View.prototype);
  function TableView(sections) { if (!(this instanceof TableView)) return new TableView(sections);
    View.call(this);

    this.component = Vue.component('tv');
    this.sections = null;
    this.appendSection = function(sections) { this.sections === null && (this.sections = []); Array.isArray(sections) || (sections = [sections]); sections = sections.filter(function(section) { return section instanceof TableViewSection; }); for (var i in sections) this.sections.push(sections[i]); return this; };
    this.rows = function() {
      return this.sections.filter(function(section) { return section instanceof TableViewSection; }).map(function(section) {
        return section.rows.filter(function(row) { return row instanceof TableViewCell; });
      }).reduce(function(a, b) { return a.concat(b); });
    };
    this.checkCellOnly = function(cell) {
      cell.setOn(!cell.isOn);

      if (cell.name !== null)
        this.rows().filter(function(row) { return row.marker == 'check' && row != cell && row.name == cell.name; })
                   .forEach(function(row) { row.setOn(false); });
      
      return typeof cell.click === 'function' && cell.click.call(cell);
    };
    this.checkAll = function() {
      return this.rows()
                 .filter(function(row) { return typeof row.check === 'function'; })
                 .filter(function(row) { var tmp = row.check(); return typeof tmp === 'string' && tmp && (row.error = tmp); })
                 .length == 0;
    };

    this.appendSection(sections).addClass('TV');
  }

  var vc = ViewController()
  vc.view = TableView([
    TableViewSection([

      TableViewCell().setTitle('標題').setDetail('請輸入標題').setMarker('input').setValue('').setCheck(function() {
        
        return typeof this.value === 'string' && this.value ? '' : '錯誤！'
      }),
      TableViewCell().setTitle('標題').setDetail('選項 2').setLayout('value').setMarker('arrow').setValue('item 2').setClick(function() {
        var that = this;

        var vc = ViewController()
        vc.setTitle('請選擇')
        vc.view = TableView([
          TableViewSection([
            TableViewCell().setTitle('選項 1').setName('name').setValue('item 1').setOn(that.value == 'item 1').setMarker('check').setClick(function() {
              that.setValue(this.value)
              that.setDetail(this.title)
            }),
            TableViewCell().setTitle('選項 2').setName('name').setValue('item 2').setOn(that.value == 'item 2').setMarker('check').setClick(function() {
              that.setValue(this.value)
              that.setDetail(this.title)
            })
          ])
        ]);

        this.push(vc)
      })
    ]),
    TableViewSection([
      TableViewCell().setTitle('確定').setAlign('center').setColor('blue').setClick(function() {
        console.error(this.tableView.checkAll());
      })
    ])
  ])


  // setTimeout(function() {
  //   vc.view.sections = []
  // }, 1000)

  // vc.view = TableView()
  //   .appendSection(
  //     TableViewSection().setHeader('aa').setFooter('aa').appendRow(
  //       TableViewCell().setTitle('a1')).appendRow(
  //       TableViewCell().setTitle('a2').setDetail('a2')).appendRow(
  //       TableViewCell().setTitle('a2').setDetail('a2').setLayout('value')))

  // // vc.view.appendSection()
  // setTimeout(function() {
  //   vc.view
  // }, 5000)

  vc.setTitle('標題')
  vc.setRight('新增')
  vc.setLeft('關閉')

  NavigationController(vc).present();






















  // var viewController = ViewController().setTitle('1').setLeft('?', function() {
  //   this.controller.push(ViewController().setTitle('2'));

  // //   var a = AlertController('sheet', 'sheet', 'sheet')
  // //   //   // .setTitle('aa')
  // //     .setMessage('bbb')
  // //     .appendButton('aaa', function() {
  // //       this.dismiss(function() {
  // //   //       console.error(this);
  // //       });
  // //     })
  // //     .appendButton('aaa', function() {
  // //       AlertController('sheet', 'sheet', 'sheet').appendButton('s', function() {
  // //         AlertController('sheet', null, 'sheet').appendButton('s', function() {}).present()
  // //       }).present()
  // //     })
  // //     // .appendButton('bbb', function() {
  // //   //   //   console.error(this);
  // //     // })
  // //     .present(function() {
  // //   //     console.error(this);
  // //     });
  // // // })

  // // // viewController.view.on.click = function() {
  // // //   console.error(this.controller.dismiss());
    
  // // // //   var viewController = ViewController().setTitle('2')
  // // // // //   viewController.view.on.click = function() {
  // // // // //     var viewController = ViewController().setTitle('3')
  // // // // //     this.controller.navigationController.push(viewController)
  // // // //   }

  //   this.controller.push(viewController)
  // });

  // NavigationController(viewController).present();


  // // setTimeout(function() {
  // //   this.push(ViewController().setTitle('2'), function() {
  // //     console.error(this);
  // //   }, );

  // //   setTimeout(function() {
  // //     this.push(ViewController().setTitle('3'), function() {
  // //       console.error(this);
  // //     }, );
  // //   }.bind(this), 1000)

  // // }.bind(.present(function() {

  // // })), 1000)



  // // ViewController().present(function() {
  // //   console.error(this);
    
  // // }, ).view.on.click = function() {
  // //   this.dismiss(function() {
  // //     console.error(this);
      
  // //   }, );
  // // };


});