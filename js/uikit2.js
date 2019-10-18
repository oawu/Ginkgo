function OAM(t) { if (!(this instanceof OAM)) return new OAM(t); this._div=null, this._option=Object.assign({className:"",top:0,left:0,width:32,height:32,html:"",map:null,position:null,css:{}},t),this._option.map&&this.setMap(this._option.map) }
function iOM() { OAM.prototype=new google.maps.OverlayView,Object.assign(OAM.prototype,{setPoint:function(){ if (!this._div) return; if(!this._option.position) return this._div.style.left="-999px",void(this._div.style.top="-999px"); if (!this.getProjection()) return;var t=this.getProjection().fromLatLngToDivPixel(this._option.position);t&&(this._div.style.left=t.x-this._option.width/2+this._option.left+"px",this._div.style.top=t.y-this._option.height/2+this._option.top+"px")},draw:function(){this.setPoint()},onAdd: function() {for(var t in this._div=document.createElement("div"),this._div.style.position="absolute",this._div.className=this._option.className,this._div.style.width=this._option.width+"px",this._div.style.height=this._option.height+"px",this._div.innerHTML=this._option.html,this._option.css)"width"!=t&&"height"!=t&&"top"!=t&&"left"!=t&&"bottom"!=t&&"right"!=t&&(this._div.style[t]=this._option.css[t]);var i=this;google.maps.event.addDomListener(this._div,"click",function(t){t.stopPropagation&&t.stopPropagation(),google.maps.event.trigger(i,"click")}),this.getPanes().overlayImage.appendChild(this._div)},remove:function(){return this._div&&(this._div.parentNode.removeChild(this._div),this._div=null),this},setHtml:function(t){this._option.html=t;return this._div&&(this._div.innerHTML=this._option.html),this},getClassName:function(){return this._option.className},setClassName:function(t){this._option.className=t;return this._div&&(this._div.className=this._option.className),this},setPosition:function(t){return this.map&&(this._option.position=t,this.setPoint()),this},getPosition:function(){return this._option.position}})}
function GoogleMap() { if (!(this instanceof GoogleMap)) return new GoogleMap(); if (typeof GoogleMap.keys !== 'object' || !Array.isArray(GoogleMap.keys)) return false; if (GoogleMap.inited === true) return GoogleMap.inited; else GoogleMap.inited = true; window.gmc = function() { $(window).trigger('gm'); }; $(window).bind('gm', GoogleMap.callback); GoogleMap.callback = function() { if (GoogleMap.callbacked === true) return; else GoogleMap.callbacked = true; iOM(); return typeof GoogleMap.finish === 'function' && GoogleMap.finish(); }; var key = GoogleMap.keys[Math.floor((Math.random() * GoogleMap.keys.length))]; $.getScript('https://maps.googleapis.com/maps/api/js?' + (key ? 'key=' + key + '&' : '') + 'language=zh-TW&libraries=visualization&callback=gmc', GoogleMap.callback); return true; }

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

  var def = Vue.component.bind(Vue);

  def('v', {
    props: {
      view: View,
      controller: ViewController },
    mounted: function() {
      this.view.controller = this.controller; },
    computed: {
      on: function() { for (var i in this.view.on) if (typeof this.view.on[i] === 'function') this.view.on[i] = this.view.on[i].bind(this.view); else delete this.view.on[i]; return this.view.on; } },
    template: el(['@is=view.el', '@class=view.class', '@on=on', '@text=view.text'])
  })

  def('atv', {
    props: {
      view: View,
      controller: ViewController },
    mounted: function() {
      this.view.controller = this.controller; },
    computed: {
      isLoading: function() { return !this.view.isLoaded; },
      timeAt: function() { return !this.isLoading ? this.view.timeAt : null; },
      sections: function() { return !this.isLoading ? this.view.sections : []; },
      references: function() { return !this.isLoading ? this.view.references : []; } },
    template: el(['@is=view.el', '@class=[view.class, { loading: isLoading }]'], [
      el('section', ['@for=(section, i) in sections', '@key=i'], [
        el('h2', ['@if=section.title', '@text=section.title']),
        el(['@for=(token, j) in section.tokens', '@key=j', '@is=token.type=="text"?"p":"figure"', '@style=token.type=="image"?{ backgroundImage: "url(" + token.url + ")" }:{}'],[
          '{{ token.type == "text" ? token.val : null }}',
          el('figcaption', [ '@if=token.type!="text"&&token.val', '@text=token.val'])])]),
      el('time', ['@if=timeAt', '@text=timeAt']),
      el('ul', ['@if=references.length'],
        el('li', ['@for=(reference, i) in references', '@key=i'], [
          '{{ !reference.link ? reference.title : null }}',
          el('a', ['@if=reference.link', '@href=reference.link', '@text=reference.title ? reference.title : reference.link'])]))])
  })

  def('hmv', {
    props: {
      view: View,
      controller: ViewController },
    mounted: function() {
      this.view.controller = this.controller;
      this.view.setMap(this.$refs.map);
    },
    computed: {
      laoding: function() { return !this.view.gmap; },
      title: function() { return this.view.title; },
      lengths: function() { return !this.laoding ? this.view.lengths : []; },
      zoomIn: function() { return this.view.zoomInOut.bind(this.view, 1); },
      zoomOut: function() { return this.view.zoomInOut.bind(this.view, -1); },
      clickInfo: function() { return this.view.clickInfo.bind(this.view); },
      clickTime: function() { return this.view.clickTime.bind(this.view); },
    },
    template: el(['@is=view.el', '@class=view.class'], [
      el('div', ['@class=["map", { Vl: laoding, loading: laoding }]', 'ref=map']), 
      el('label', ['@if=!laoding', '@class={ info: true, on: view.isInfoOn }', '@text="路徑資訊"', '@click=clickInfo']), 
      el('label', ['@if=!laoding', '@class={ time: true, on: view.isTimeOn }', '@text="時間紀錄"', '@click=clickTime']), 
      el('div', ['@if=!laoding', 'class=lengths'],
        el('span', ['@for=(length, i) in lengths', '@key=i', '@text=length.length', '@data-title=length.title'])), 
      el('div', ['@if=!laoding', 'class=zoom'], [
        el('label', ['@click=zoomIn']), 
        el('label', ['@click=zoomOut'])])])
  })

  def('tv-cl', {
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
        return typeof this.cell.click === 'function' ? { click: this.cell.click.bind(this.cell) } : {} },
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
        el('input', ['@if=textInput.el=="input"', '@type=textInput.type', '@placeholder=textInput.placeholder', '@focus=error=null', '@model=cell.value']),
        el('textarea', ['@if=textInput.el=="textarea"', '@type=textInput.type', '@placeholder=textInput.placeholder', '@focus=error=null', '@model=cell.value']),
        el('u', ['@if=error', '@text=error'])]),
      el(['@if=marker', '@is=marker', '@on=onEl'])])
  });

  def('tv-h', {
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

  def('tv-f', {
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

  def('tv-s', {
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
      el(['@if=header', '@is=header.component', '@header=header', '@section=section', '@tableview=tableview', '@controller=controller']),
      el(['@for=(row, i) in rows', '@key=i', '@is=row.component', '@class=[i == 0 ? "first" : null, i == rows.length - 1 ? "last" : null]', '@cell=row', '@section=section', '@tableview=tableview', '@controller=controller']),
      el(['@if=footer', '@is=footer.component', '@footer=footer', '@section=section', '@tableview=tableview', '@controller=controller'])])
  });

  def('tv', {
    props: {
      view: View,
      controller: ViewController },
    mounted: function() {
      this.view.controller = this.controller; },
    computed: {
      isLoading: function() { return !Array.isArray(this.view.sections); },
      sections: function() { return !this.isLoading ? this.view.sections.filter(function(section) { return section instanceof TableViewSection; }) : []; } },
    template: el(['@is=view.el', '@class=[view.class, { loading: isLoading }]'],
      el(['@for=(section, i) in sections', '@key=i', '@is=section.component', '@section=section', '@tableview=view', '@controller=controller']))
  });

  def('acv', {
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

  def('vc', {
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

  def('nav-bar', {
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

  def('nc', {
    props: {
      controller: NavigationController },
    computed: {
      vcs: function() { return this.controller.viewControllers.filter(function(vc) { return vc instanceof ViewController; }); } },
    template: el('div', ['@class=controller.class'],
      el(['@for=(vc, i) in vcs', '@key=i', '@is=vc.component', '@controller=vc', '@navigation=controller']))
  });

  function Window() { if (!(this instanceof Window)) return new Window();
    var vue = new Vue({
      comments: false,
      data: {
        display: false,
        show: false,
        viewControllers: [] },
      methods: {
        nowVC: function() {
          return this.vcs.length > 0 ? this.vcs[this.vcs.length - 1] : null; } },
      computed: {
        vcs: function() { return this.viewControllers.filter(function(vc) { return vc instanceof ViewController; }); } },
      el: el('div',['@if=display', '@class=["Win", { show: show }]'], 
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
    this.component = def('v');
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
    
    this.component = def('vc');
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
    this.component = def('nav-bar');
    this.class = 'NB';

    this.left  = null;
    this.title = null;
    this.right = null;
  }

  NavigationController.prototype = Object.create(ViewController.prototype);
  function NavigationController(rootViewController) { if (!(this instanceof NavigationController)) return new NavigationController(rootViewController);
    ViewController.call(this);
    
    var isTransition = false;

    this.component = def('nc');
    this.viewControllers = [];
    this.viewController = null;

    this.lastViewController = function() { return this.viewControllers.length > 1 ? this.viewControllers[this.viewControllers.length - 2] : null; };
    this.thisViewController = function() { return this.viewControllers.length > 0 ? this.viewControllers[this.viewControllers.length - 1] : null; };

    this.push = function(viewController, completion, animate) {
      if (isTransition) return this;
      if (!(viewController instanceof ViewController) || viewController instanceof NavigationController || viewController instanceof AlertController) return this;
      isTransition = true;
      
      viewController.navigationBar || (viewController.navigationBar = NavigationBar()); 

      var thisViewController = this.thisViewController();
      thisViewController && viewController.setLeft('返回', this.pop.bind(this), 'back');
      this.viewController = viewController;

      animate === false ? this.viewControllers.push(viewController) && viewController.addClass('push').addClass('ed') && (!thisViewController || thisViewController.addClass('ed').addClass('last')) && !(isTransition = false) && typeof completion === 'function' && completion.call(this) : this.viewControllers.push(viewController.addClass('ani')) && (!thisViewController || thisViewController.addClass('ani')) && setTimeout(function() { viewController.addClass('push'); thisViewController && thisViewController.addClass('last'); setTimeout(function() { viewController.addClass('ed'); isTransition = false; typeof completion === 'function' && completion.call(this) }.bind(this), 400); }.bind(this), 100)
      return this;
    };

    this.pop = function(completion, animate) {
      if (isTransition) return this;

      var viewController = this.thisViewController();
      var lastViewController = this.lastViewController();

      if (lastViewController === null)
        return this.dismiss(completion, animate);
      
      isTransition = true;
      animate === false ? this.viewControllers.pop().removeClass('ani').removeClass('ed').removeClass('push') && lastViewController.removeClass('ani').removeClass('last').removeClass('ed') && !(isTransition = false) && typeof completion === 'function' && completion.call(this) : viewController.addClass('ani').removeClass('ed').removeClass('push') && lastViewController.addClass('ani').removeClass('last') && setTimeout(function() { this.viewControllers.pop(); isTransition = false; typeof completion === 'function' && completion.call(this); }.bind(this), 400)
      return this;
    };

    this.addClass('NC').push(rootViewController, null, false);
  }
  
  AlertController.prototype = Object.create(ViewController.prototype);
  function AlertController(title, message, style) { if (!(this instanceof AlertController)) return new AlertController(title, message, style);
    ViewController.call(this);

    this.view.component = def('acv');
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
  function TableViewCell(title, detail, marker, click, layout, name, value) { if (!(this instanceof TableViewCell)) return new TableViewCell(title, detail, marker, click, layout, name, value);
    View.call(this);

    this.section = null;
    this.tableView = null;

    this.component = def('tv-cl');

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
    this.checkCanOff = false;

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
    this.setOn     = function(val) { this.isOn = typeof val === 'boolean' && val ? true : false; return this; }
    this.setCanOff = function(val) { this.checkCanOff = typeof val === 'boolean' && val ? true : false; return this; }

    this.setTitle(title).setDetail(detail).setMarker(marker).setClick(click).setLayout(layout).setName(name).setValue(value).class = 'TVCL';
  }

  TableViewHeader.prototype = Object.create(View.prototype);
  function TableViewHeader() { if (!(this instanceof TableViewHeader)) return new TableViewHeader();
    View.call(this);
    this.section = null;
    this.tableView = null;

    this.component = def('tv-h');
    this.html = null;
    this.class = null;
    this.el = 'header';
  }

  TableViewFooter.prototype = Object.create(View.prototype);
  function TableViewFooter() { if (!(this instanceof TableViewFooter)) return new TableViewFooter();
    View.call(this);
    this.section = null;
    this.tableView = null;

    this.component = def('tv-f');
    this.html = null;
    this.class = null;
    this.el = 'footer';
  }

  TableViewSection.prototype = Object.create(View.prototype);
  function TableViewSection(rows) { if (!(this instanceof TableViewSection)) return new TableViewSection(rows);
    View.call(this);

    this.tableView = null;
    this.component = def('tv-s');
    
    this.header = null;
    this.footer = null;

    this.rows = [];
    this.resetRows = function(rows) { this.rows = []; return this.appendRow(rows); };
    this.appendRow = function(rows) { Array.isArray(rows) || (rows = [rows]); rows = rows.filter(function(row) { return row instanceof TableViewCell; }); for (var i in rows) this.rows.push(rows[i]); return this; }
    this.setHeader = function(html) { if (typeof html === 'string' && html) { this.header || (this.header = TableViewHeader()) && (this.header.html = html); }; return this; }
    this.setFooter = function(html) { if (typeof html === 'string' && html) { this.footer || (this.footer = TableViewFooter()) && (this.footer.html = html); }; return this; }
    this.resetRows(rows).class = 'TVS';
  }

  TableView.prototype = Object.create(View.prototype);
  function TableView(sections) { if (!(this instanceof TableView)) return new TableView(sections);
    View.call(this);

    this.component = def('tv');
    this.sections = null;
    this.resetSections = function(sections) { this.sections = null; return this.appendSection(sections); };
    this.appendSection = function(sections) { if (typeof sections === 'undefined') return this; this.sections === null && (this.sections = []); Array.isArray(sections) || (sections = [sections]); sections = sections.filter(function(section) { return section instanceof TableViewSection; }); for (var i in sections) this.sections.push(sections[i]); return this; };
    this.rows = function() { return this.sections.filter(function(section) { return section instanceof TableViewSection; }).map(function(section) { return section.rows.filter(function(row) { return row instanceof TableViewCell; }); }).reduce(function(a, b) { return a.concat(b); }); };
    
    this.checkCellOnly = function(cell) {
      if (cell.checkCanOff) cell.setOn(!cell.isOn);
      else cell.setOn(true);

      if (cell.name !== null)
        this.rows().filter(function(row) { return row.marker == 'check' && row != cell && row.name == cell.name; })
                   .forEach(function(row) { row.setOn(false); });
      
      return typeof cell.click === 'function' && cell.click.call(cell, cell.isOn);
    };

    this.checkAll = function() {
      return this.rows()
                 .filter(function(row) { return typeof row.check === 'function'; })
                 .filter(function(row) { var tmp = row.check(); return typeof tmp === 'string' && tmp && (row.error = tmp); })
                 .length == 0;
    };

    this.data = function() {
      if (!this.checkAll())
        return null;

      var tmps = this.rows().filter(function(row) {
        if (row.name === null)
          return false;

        if (row.marker != 'check' && row.marker != 'switch')
          return true;

        return row.isOn
      });

      var data = {}; for (var i in tmps) data[tmps[i].name] = tmps[i].value;

      return data;
    }

    this.resetSections(sections).addClass('TV');
  }

  TableViewController.prototype = Object.create(ViewController.prototype);
  function TableViewController(sections) { if (!(this instanceof TableViewController)) return new TableViewController(sections);
    ViewController.call(this);
    this.tableView = this.view = TableView(sections);
  }

  TableWebView.prototype = Object.create(TableView.prototype);
  function TableWebView(url) { if (!(this instanceof TableWebView)) return new TableWebView(url);
    TableView.call(this);
    
    this.setSections = function(sections) {
      this.resetSections(sections.map(function(section) {
        var header = typeof section.header === 'string' && section.header ? section.header : null;
        var footer = typeof section.footer === 'string' && section.footer ? section.footer : null;
        var rows   = typeof section.rows === 'object' && Array.isArray(section.rows) ? section.rows.map(function(row) {
          if (typeof row !== 'object') return null;
          if (typeof row.system !== 'string' || ['web', 'both'].indexOf(row.system) == -1) return null;
          var cell = TableViewCell();
          typeof row.title === 'string' && row.title && cell.setTitle(row.title);
          typeof row.detail === 'string' && row.detail && cell.setDetail(row.detail);
          typeof row.icon === 'string' && row.icon && cell.setIcon(row.icon);
          typeof row.image === 'string' && row.image && cell.setImage(row.image);
          
          switch (typeof row.action.type === 'string' ? row.action.type : null) {
            case "native":
              switch (typeof row.action.key === 'string' ? row.action.key : null) {
                case "traffic": cell.setMarker('switch'); break;
                case "pathInfo": cell.setMarker('switch'); break;
                case "pathLine": cell.setMarker('switch'); break;
                case "pathTime": cell.setMarker('switch'); break;
                case "heatmap": cell.setMarker('switch'); break;
                case "direction": cell.setMarker('arrow'); break;
                case "score": cell.setMarker('arrow'); break;
                default: break;
              } break;
            case "article": cell.setMarker('arrow').setClick(typeof row.action.url === 'string' && row.action.url ? function() { this.push(ArticleWebViewController().setTitle(typeof row.title === 'string' && row.title ? row.title : null), function() { this.thisViewController().url(row.action.url); }); } : null); break;
            case "tableView": cell.setMarker('arrow').setClick(typeof row.action.url === 'string' && row.action.url ? function() { this.push(TableWebViewController().setTitle(typeof row.title === 'string' && row.title ? row.title : null), function() { this.thisViewController().url(row.action.url); }); } : null); break;
            case "historyMap": cell.setMarker('arrow').setClick(typeof row.action.url === 'string' && row.action.url ? function() { this.push(HistoryMapViewController().setTitle(typeof row.title === 'string' && row.title ? row.title : null), function() { this.thisViewController().url(row.action.url); }); } : null); break;
            case "url": cell.setMarker('arrow').setClick(typeof row.action.url === 'string' && row.action.url ? function() { window.open(row.action.url); } : null); break;
            case "fb": cell.setMarker('arrow').setClick(typeof row.action.url === 'string' && row.action.url ? function() { window.open(row.action.url); } : null); break;
            default: break;
          }
          
          return cell;
        }).filter(function(row) { return row !== null; }) : [];

        return rows.length ? TableViewSection(rows).setHeader(header).setFooter(footer) : null;
      }).filter(function(section) { return section !== null; }));
    };

    this.setFormat = function(format) {
      if (!(typeof format === 'object' && format)) return this;
      typeof format.sections === 'object' && Array.isArray(format.sections) && this.setSections(format.sections);
      return this;
    };

    this.url = function(url) {
      $.get(url)
       .done(this.setFormat.bind(this))
       .fail(this.setFormat.bind(this, { sections: [] }));
      return this;
    };

    this.addClass('Vl').url(url);
  }

  TableWebViewController.prototype = Object.create(TableViewController.prototype);
  function TableWebViewController(url) { if (!(this instanceof TableWebViewController)) return new TableWebViewController(url);
    TableViewController.call(this);
    this.tableView = this.view = TableWebView(url);
    this.url = this.tableView.url.bind(this.tableView);
  }

  ArticleView.prototype = Object.create(View.prototype);
  function ArticleView(format) { if (!(this instanceof ArticleView)) return new ArticleView(format);
    View.call(this, 'article');
    
    this.component = def('atv');

    this.isLoaded = false;
    this.timeAt = null;
    this.sections = [];
    this.references = [];

    this.setTimeAt = function(val) { if (typeof val === 'undefined') return this; else this.isLoaded = true; typeof val === 'string' && val && (this.timeAt = val); return this; };
    this.setSections = function(val) {
      if (typeof val === 'undefined') return this; else this.isLoaded = true;
      typeof val === 'object' && Array.isArray(val) && (this.sections = val.map(function(section) {
        if (typeof section !== 'object')
          return null;

        var title = typeof section.title === 'string' && section.title ? section.title : null;

        var tokens = typeof section.tokens === 'object' && Array.isArray(section.tokens) ? section.tokens.map(function(token) {
            var type = typeof token.type === 'string' && token.type && ['text', 'image'].indexOf(token.type) !== -1 ? token.type : null;
            var val  = typeof token.val === 'string' && token.val ? token.val : null;
            var url  = typeof token.url === 'string' && token.url ? token.url : null;

            if (token.type === null) return null;
            if (token.type == 'image' && url === null) return null;
            if (token.type == 'text' && val === null) return null;

            return { type: type, val: val, url: url }
          }).filter(function(token) { return token !== null; }) : []

        return section.title || section.tokens.length ? {
          tokens: tokens,
          title: title
        } : null;
      }).filter(function(section) { return section !== null; }));

      return this;
    };
    this.setReferences = function(val) {
      if (typeof val === 'undefined') return this; else this.isLoaded = true;
      typeof val === 'object' && Array.isArray(val) && (this.references = val.map(function(reference) {
        if (typeof reference !== 'object') return null;
        var title = typeof reference.title === 'string' && reference.title ? reference.title : null;
        var link = typeof reference.link === 'string' && reference.link ? reference.link : null;
        return title || link ? { title: title, link: link } : null;
      }).filter(function(reference) { return reference !== null; }));
      return this;
    };

    this.addClass('ATV');
  }

  ArticleViewController.prototype = Object.create(ViewController.prototype);
  function ArticleViewController() { if (!(this instanceof ArticleViewController)) return new ArticleViewController();
    ViewController.call(this);
    this.articleView = this.view = ArticleView();
  }

  ArticleWebView.prototype = Object.create(ArticleView.prototype);
  function ArticleWebView(url) { if (!(this instanceof ArticleWebView)) return new ArticleWebView(url);
    ArticleView.call(this);
    
    this.setFormat = function(format) {
      if (!(typeof format === 'object' && format)) return this;
      typeof format.timeAt === 'string' && format.timeAt && this.setTimeAt(format.timeAt);
      typeof format.sections === 'object' && Array.isArray(format.sections) && this.setSections(format.sections);
      typeof format.references === 'object' && Array.isArray(format.references) && this.setReferences(format.references);
      return this;
    };

    this.url = function(url) {
      $.get(url)
       .done(this.setFormat.bind(this))
       .fail(function() { this.isLoaded = true; }.bind(this));
      return this;
    };

    this.addClass('Vl').url(url);
  }

  ArticleWebViewController.prototype = Object.create(ArticleViewController.prototype);
  function ArticleWebViewController(url) { if (!(this instanceof ArticleWebViewController)) return new ArticleWebViewController(url);
    ArticleViewController.call(this);
    this.articleView = this.view = ArticleWebView(url);
    this.url = this.articleView.url.bind(this.articleView);
  }

  HistoryMapView.prototype = Object.create(View.prototype);
  function HistoryMapView(lat, lng, zoom, url) { if (!(this instanceof HistoryMapView)) return new HistoryMapView(lat, lng, zoom, url);
    View.call(this);
    this.component = def('hmv');
    

    this.lat  = null;
    this.lng  = null;
    this.zoom = null;

    this.mapEl = null;
    this.gmap  = null;

    this.title = null;
    this.lengths = [];
    this.isInfoOn = true;
    this.isTimeOn = true;
    
    var mazu = null;
    var infos = [];
    var lines = [];
    var markers = [];
    var lastZoom = null;
    var idleTimer = null;
    var fetchEd = false;

    var checkLat  = function(lat) {  return typeof lat  === 'number' && lat >= -90  && lat <= 90 };
    var checkLng  = function(lng) {  return typeof lng  === 'number' && lng >= -180 && lng <= 180 };
    var checkZoom = function(zoom) { return typeof zoom === 'number' && zoom >= 0   && zoom <= 18 };

    var time = function() { return new Date().getTime(); }
    var timeago = function(x) { var d = time() / 1000 - x, c = [{b: 10, f: '現在'},{b: 6, f: '不到 1 分鐘'},{b: 60, f: ' 分鐘前'},{b: 24, f: ' 小時前'},{b: 30, f: ' 天前'},{b: 12, f: ' 個月前'}], u = 1; for (var i = 0; i < c.length; i++, u = t) { t = c[i].b * u; if (d < t) return (i > 1 ? parseInt(d / u, 10) : '') + c[i].f; } return parseInt(d / u, 10) + ' 年前'; };
    var text = function (t) { return t.replace(new RegExp('\r?\n','g'), '<br />'); }
    var genTimerUnit = function(r) { var a = r.length / 5; return parseInt(r.length / (a > 10 ? 10 : (a < 1 ? 1 : a)), 10); }
    var genLatLng = function(t) { return new google.maps.LatLng(t[0].lat, t[0].lng); };
    var genTimeMarker = function(l, t) { var g = timeago(t[0].time); return OAM({ map: this.gmap, position: genLatLng(t), width: 10, height: 10, className: 'timeMarker ' + l.timeAlign, html: "<i style='background-color: rgba(" + l.color.r + ", " + l.color.g + ", " + l.color.b + ", 1)'></i><div>" + g + "</div>" }); }
    var genInfoMarker = function(t) { return OAM({ map: this.gmap, position: genLatLng(t), width: 10, height: 10, className: 'infoMarker', html: t.length == 1 ? "<div>" + text(t[0].text) + "</div>" : ('<b>' + t.length + '</b>') }); }
    var filterNotNull = function(t) { return t !== null; }
    var markerRemove = function(t) { t.map && t.setMap(null); return null; }

    var init = function() {
      if (typeof google === 'undefined' || typeof google.maps === 'undefined' || typeof google.maps.Map === 'undefined') return this;
      if (this.gmap !== null) return fetch.call(this);
      if (this.mapEl === null) return fetch.call(this);
      if (!checkLat(this.lat) || !checkLng(this.lng) || !checkZoom(this.zoom)) return fetch.call(this);
      
      this.gmap = new google.maps.Map(this.mapEl, { zoom: this.zoom, clickableIcons: false, disableDefaultUI: true, gestureHandling: 'greedy', center: new google.maps.LatLng(this.lat, this.lng) });
      this.gmap.mapTypes.set('ms', new google.maps.StyledMapType([{stylers: [{gamma: 0}, {weight: 0.75}] }, {featureType: 'all', stylers: [{ visibility: 'on' }]}, {featureType: 'administrative', stylers: [{ visibility: 'on' }]}, {featureType: 'landscape', stylers: [{ visibility: 'on' }]}, {featureType: 'poi', stylers: [{ visibility: 'on' }]}, {featureType: 'road', stylers: [{ visibility: 'simplified' }]}, {featureType: 'road.arterial', stylers: [{ visibility: 'on' }]}, {featureType: 'transit', stylers: [{ visibility: 'on' }]}, {featureType: 'water', stylers: [{ color: '#b3d1ff', visibility: 'on' }]}, {elementType: "labels.icon", stylers:[{ visibility: 'off' }]}]));
      this.gmap.setMapTypeId('ms');
      this.gmap.addListener('idle', function() { if (this.gmap.zoom === lastZoom) return; else lastZoom = this.gmap.zoom; clearTimeout(idleTimer); idleTimer = setTimeout(fetch.bind(this), 300); }.bind(this));
      return fetch.call(this);
    };

    var cluster = function(oris, zoom, unit, lineStyle, closure) {
      if (!oris.length) return closure ? closure([]) : [];

      var tmps = {}, news = [], tols = lineStyle ? oris.length - 1 : oris.length;
      
      for (var i = 0; i < oris.length; i++) {
        if (typeof tmps[i] !== 'undefined') continue;

        tmps[i] = true;
        var tmp = [oris[i]];

        for (var j = i + 1; j < tols; j++) {
          if (typeof tmps[j] !== 'undefined')
            if (lineStyle) break; else continue;

          var distance = Math.max(Math.abs(oris[i].lat - oris[j].lat), Math.abs(oris[i].lng - oris[j].lng));

          if (30 / Math.pow(2, zoom) / unit <= distance)
            if (lineStyle) break; else continue;

          tmps[j] = true;
          tmp.push(oris[j]);
        }

        news.push(tmp);
      }

      tmps = null;
      return closure ? closure(news) : news;
    };

    var fetchLine = function() {
      lines.filter(function(line) { return line.polyline === null; }).forEach(function(line) { return line.polyline = new google.maps.Polyline({ map: this.gmap, strokeWeight: 5, strokeColor: 'rgba(' + line.color.r + ', ' + line.color.g + ', ' + line.color.b + ', ' + line.color.a + ')' }) }.bind(this));
      lines.forEach(function(line) {
        return cluster.call(this, line.markers, this.gmap.zoom, 1, true, function(markers) {
          line.polyline.setPath(markers.map(genLatLng));
        }.bind(this));
      }.bind(this));
      return this;
    };

    var fetchLineTime = function() {
      lines.forEach(function(line) {
        line.times = line.times.map(markerRemove).filter(filterNotNull);
        if (!this.isTimeOn) return this;
        return cluster.call(this, line.markers, this.gmap.zoom, 2, false, function(markers) {
            var u = genTimerUnit(markers);
            line.times = markers.filter(function(_, i) { return i % u === 0 || i == markers.length - 1; })
                   .map(genTimeMarker.bind(this, line))
                   .filter(filterNotNull);
        }.bind(this));
      }.bind(this));
      return this;
    };

    var fetchInfo = function() {
      markers = markers.map(markerRemove).filter(filterNotNull);
      if (!this.isInfoOn) return this;
      cluster.call(this, infos, this.gmap.zoom, 0.5, false, function(ms) { markers = ms.map(genInfoMarker.bind(this)).filter(filterNotNull); }.bind(this));
      return this;
    };

    var fitMap = function() {
      if (fetchEd || !lines.length) return this;
      var bounds = new google.maps.LatLngBounds();
      lines.forEach(function(line) { line.markers.forEach(function(marker) { bounds.extend(genLatLng([marker])); }) })
      this.gmap.fitBounds(bounds);
      fetchEd = true;
      return this;
    };

    var fetchMazu = function() {
      mazu !== null && !(mazu instanceof OAM) && (mazu = OAM({ map: this.gmap, position: genLatLng([mazu]), width: 40, height: 70, top: -35, className: 'mazuMarker', html: (mazu.info ? "<div>" + text(mazu.info) + "</div>" : "") +  "<img src='/img/mz.png'/>" }));
      return this;
    };

    var fetch = function() {
      return this.gmap !== null ? fitMap.call(fetchMazu.call(fetchInfo.call(fetchLineTime.call(fetchLine.call(this))))) : this;
    };

    this.setMap = function(mapEl) { typeof mapEl === 'object' && mapEl instanceof HTMLDivElement && (this.mapEl = mapEl) && init.call(this); return this; };
    this.setLat  = function(val) { if (checkLat(val)) {  this.lat  = val; init.call(this); } return this; };
    this.setLng  = function(val) { if (checkLng(val)) {  this.lng  = val; init.call(this); } return this; };
    this.setZoom = function(val) { if (checkZoom(val)) { this.zoom = val; init.call(this); } return this; };
    this.zoomInOut = function(label) { this.gmap && this.gmap.setZoom(this.gmap.zoom + label); return this; };
    this.clickInfo = function() { this.isInfoOn = !this.isInfoOn; fetch.call(this); return this; };
    this.clickTime = function() { this.isTimeOn = !this.isTimeOn; fetch.call(this); return this; };
    
    this.setTitle = function(title) {
      typeof title === 'string' && title && (this.title = title);
      return this;
    };

    this.appendLength = function(title, length) {
      typeof title === 'string' && title && typeof length === 'number' && this.lengths.push({ title: title, length: length });
      return this;
    };

    this.setInfos = function(val) {
      typeof val === 'object' && Array.isArray(val) && (infos = val.reverse().map(function(info) {
        var lat  = typeof info.lat === 'number'  && checkLat(info.lat) ? info.lat : null;
        var lng  = typeof info.lng === 'number'  && checkLng(info.lng) ? info.lng : null;
        var text = typeof info.text === 'string' && info.text ? info.text : null;

        return lat === null || lng === null || text === null ? null : {
          lat: lat,
          lng: lng,
          text: text,
        };
      }).filter(function(info) { return info !== null; }));
      return this;
    };

    this.setLines = function(val) {
      typeof val === 'object' && Array.isArray(val) && (lines = val.map(function(line) {
        var title = typeof line.title === 'string' && line.title ? line.title : null;
        var length = typeof line.length === 'number' ? line.length : null;
        var color = typeof line.color === 'object' && Array.isArray(line.color) && line.color.length == 4 ? { r: line.color[0], g: line.color[1], b: line.color[2], a: line.color[3] } : null;
        var timeAlign = typeof line.timeAlign === 'string' && ['left', 'center', 'right'].indexOf(line.timeAlign) !== -1 ? line.timeAlign : 'center';
        var markers = line.markers.map(function(marker) {
          var lat  = typeof marker.lat  === 'number' && checkLat(marker.lat) ? marker.lat : null;
          var lng  = typeof marker.lng  === 'number' && checkLng(marker.lng) ? marker.lng : null;
          var time = typeof marker.time === 'number' ? marker.time : null;
          return lat === null || lng === null || time === null ? null : {
            lat: lat,
            lng: lng,
            time: time,
          };
        }).filter(function(marker) { return marker !== null; });

        return title === null || length === null || color === null || !markers.length ? null : this.appendLength(title, length) && {
          polyline: null,
          times: [],
          title: title,
          length: length,
          color: color,
          timeAlign: timeAlign,
          markers: markers,
        };
      }.bind(this)).filter(function(line) { return line !== null; }));
      return this;
    };

    this.setFormat = function(format) {
      typeof format.lat === 'number' && checkLat(format.lat) && typeof format.lng === 'number' && checkLng(format.lng) && (mazu = { lat: format.lat, lng: format.lng, info: typeof format.info === 'string' && format.info ? format.info : null });
      typeof format.title === 'string' && format.title && this.setTitle(format.title);
      typeof format.length === 'number' && format.length && this.appendLength('全部累計', format.length);
      typeof format.infos === 'object' && Array.isArray(format.infos) && this.setInfos(format.infos);
      typeof format.lines === 'object' && Array.isArray(format.lines) && this.setLines(format.lines);
      return init.call(this);
    };

    this.url = function(url) {
      typeof url === 'string' && $.get(url) .done(this.setFormat.bind(this));
      return this;
    };

    this.addClass('HMV').setLat(lat).setLng(lng).setZoom(zoom).url(url);
  }

  HistoryMapViewController.prototype = Object.create(ViewController.prototype);
  function HistoryMapViewController(url) { if (!(this instanceof HistoryMapViewController)) return new HistoryMapViewController(url);
    ViewController.call(this);
    this.historyMapView = this.view = HistoryMapView(24.571414629893,120.70938291783, 10, url);
    this.url = this.historyMapView.url.bind(this.historyMapView);
  }

  GoogleMap.keys = ['AIzaSyBF02Xytwx2peyWWpiUwkQDgng_FYmnBaA'];
  GoogleMap.finish = function() {

    var vc = TableWebViewController('menu.json')
      vc.setTitle('標題');
      vc.setRight('新增');
      vc.setLeft('關閉');

    NavigationController(vc).present();

  };

  GoogleMap();







  // var vc = ViewController()
  // vc.view = TableView([
  //   TableViewSection([

  //     TableViewCell().setTitle('標題').setDetail('請輸入標題').setMarker('input').setName('a1').setValue('').setCheck(function() {
  //       return typeof this.value === 'string' && this.value ? '' : '錯誤！'
  //     }),

  //     TableViewCell().setTitle('標題').setDetail('選項 2').setLayout('value').setMarker('arrow').setName('a2').setValue('item 2').setClick(function() {
  //       var that = this;

  //       var vc = ViewController()
  //       vc.setTitle('請選擇')
  //       vc.view = TableView([
  //         TableViewSection([
  //           TableViewCell().setTitle('選項 1').setName('name').setCanOff(false).setValue('item 1').setOn(that.value == 'item 1').setMarker('check').setClick(function(val) {
  //             that.setValue(this.value).setDetail(this.title)
  //           }),
  //           TableViewCell().setTitle('選項 2').setName('name').setCanOff(false).setValue('item 2').setOn(that.value == 'item 2').setMarker('check').setClick(function(val) {
  //             that.setValue(this.value).setDetail(this.title)
  //           })
  //         ])
  //       ]);

  //       this.push(vc)
  //     })
  //   ]),
  //   TableViewSection([
  //     TableViewCell().setTitle('確定').setAlign('center').setColor('blue').setClick(function() {
  //       console.error(this.tableView.data());
  //     })
  //   ])
  // ])


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

  // vc.setTitle('標題')
  // vc.setRight('新增')
  // vc.setLeft('關閉')

  // NavigationController(vc).present();






















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