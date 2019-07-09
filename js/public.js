/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

var _vTimers = {};
var _apis = null;

function timerHas(key) { return typeof _vTimers[key] !== 'undefined'; }
function timerOnly(key, time, closure) { if (timerHas()) return ; _vTimers[key] = setTimeout(closure, time); }
function time() { return new Date().getTime(); }

$(function() {
  var $body = $('body');
  
  var Keyboard = {
    inited: false,
    init: function() {
      if (Keyboard.inited) return;
      else Keyboard.inited = false;

      $(window).keydown(function(e) {
        var i = parseInt(Main.$formats.attr('data-i'));
        
        if (e.keyCode == 38) {
          var $tmp = Menu.$links.filter('.active').prev();
          if ($tmp.length)
            return $tmp.click();

          $tmp = Menu.$links.filter('.active').parent().prev();
          if ($tmp.length)
            return $tmp.find('>*').last().click();

          $tmp = Menu.$apis.find('>*').last();
          return $tmp.find('>*').last().click();
        }
        if (e.keyCode == 40) {
          var $tmp = Menu.$links.filter('.active').next();
          if ($tmp.length)
            return $tmp.click();
          
          $tmp = Menu.$links.filter('.active').parent().next();
          if ($tmp.length)
            return $tmp.find('>*').first().click();

          $tmp = Menu.$apis.find('>*').first();
          return $tmp.find('>*').first().click();
        }

        var l = Main.$tabs.length;

        if (e.keyCode == 39) {
          Main.$formats.attr('data-i', ++i > l ? i = 1 : i);
          Params.update('t', Main.$tabs.eq(i - 1).attr('data-name'));
        }

        if (e.keyCode == 37) {
          Main.$formats.attr ('data-i', --i < 1 ? i = l : i);
          Params.update('t', Main.$tabs.eq(i - 1).attr('data-name'));
        }
      });
    }
  };

  var Params = {
    val: {},
    init: function() {
      window.location.hash.substr(1).split('&').forEach(function(val) {
        var splitter = val.split('=');
        if (splitter.length != 2) return;
        var k = decodeURIComponent(splitter[0]), v = decodeURIComponent(splitter[1]);
        if (k.slice (-2) == '[]')
          if (!Params.val[k = k.slice(0, -2)])
            Params.val[k] = [v];
          else Params.val[k].push(v);
          else Params.val[k] = v;
      });

      Params.val.n = Params.val.n ? Params.val.n : '';
      Params.val.t = Params.val.t ? Params.val.t : '';
      Params.val.q = Params.val.q ? Params.val.q : '';
    },
    update: function(k, v) {
      if (typeof Params.val[k] === 'undefined')
        return;

      Params.val[k] = v;
      
      if (k == 'q') {
        Params.val.n = '';
        Params.val.t = '';
      }

      var str = [];
      for (var t in Params.val)
        str.push (t + '=' + Params.val[t]);

      window.location.hash = str.join('&');
    }
  };

  var Loading = {
    $el: null,
    $p: $('<p />'),
    $span: $('<span />'),
    init: function() {
      if (Loading.$el) return;
      Loading.$el = $('<div />').attr('id', 'load').append($('<h1 />')).append(Loading.$p).append($('<div />').append($(Array.apply(null, Array(3)).map(function (_, i) { return $('<i />'); })).map($.fn.toArray))).append(Loading.$span).appendTo($body);
      Loading.api();
    },
    api: function() {
      $.get('api_project.json?t=' + time()).done(Loading.update).fail(Loading.update.bind(null, {name: 'Maple7', description: 'API 文件', defaultVersion: '0.0.0' }));
    },
    update: function(data) {
      $('title').text(data.description);
      Loading.$p.attr('data-title', data.description);
      Loading.$span.attr('data-version', data.defaultVersion);
      $.get('api_data.json?t=' + time()).done(function(result) { _apis = result; }).fail(function() { _apis = []; }).complete(Menu.init);
    },
    close: function(cb) {
      if (!Loading.$el || Loading.$el.hasClass('hide')) return;
      else Loading.$el.addClass('hide');
      timerOnly('Loading.close', 375, function() { Loading.$el.remove(); Loading.$el = null; cb && cb (); });
    }
  };

  var Menu = {
    $el: null,
    $search: $('<form />').attr('id', 'search'),
    $input: $('<input />').attr('type', 'text').attr('id', 'input').attr('placeholder', '你想找什麼？').prop('required', true),
    $apis: $('<div />').attr('id', 'apis'),
    $footer: $('<footer />').attr('id', 'footer').append($('<span />').text('版型設計 by')).append($('<a />').attr('href', 'https://www.ioa.tw/f=apidoc').attr('target', '_blank').text('OA Wu')).append($('<span />').text('，程式碼：')).append($('<a />').attr('href', 'https://github.com/comdan66/OA-apiDoc-Template.git').attr('target', '_blank').text('GitHub')),
    $links: [],

    init: function() {
      if (Menu.$el) return;

      Menu.$el = $('<div />').attr('id', 'menu').append(Menu.$search.append(Menu.$input)).append(Menu.$apis).append(Menu.$footer).appendTo($body);
      Menu.$input.val(Params.val.q).keyup(function() { Params.update('q', $(this).val().trim()); Menu.filterAPI(Params.val.q); });
      Menu.$search.submit(function() { return false; });
      Menu.filterAPI(Params.val.q);
    },

    filterAPI: function(q) {
      q = typeof q === 'undefined' ? '' : q;
      q = typeof q === 'string' ? q.trim() : q;
      q = typeof q === 'object' ? Menu.$input.val().trim() : q;

      Menu.$apis.empty();

      var groups = {};
      _apis.filter(function(t) { var re = new RegExp(q, 'gi'); return q.length ? t.type.match(re) || t.url.match(re) || t.title.match(re) || t.group.match(re) : t; }).forEach(function(t) { if (typeof t.group === 'undefined') t.group = ''; if (typeof groups[t.group] === 'undefined') groups[t.group] = []; groups[t.group].push(t); });
      
      Menu.$links = [];

      for (var group in groups) {
        let tmp = groups[group].map(function(t) { return $('<label />').addClass('api').attr('data-type', t.type).attr('data-name', t.name).attr('data-url', t.url).text(t.title).data('obj', t).click(function() { Params.update('n', $(this).data('name')); Menu.$links.removeClass('active'); $(this).addClass('active'); Main.render($(this).data('obj')); }); });
        Menu.$apis.append($('<div />').addClass('apis').attr('data-title', group).attr('data-cnt', groups[group].length).append(tmp));
        Menu.$links.push(tmp);
      }

      Menu.$links = $(Menu.$links.length ? Menu.$links.reduce(function(p, n) { return p.concat(n); }) : []).map($.fn.toArray);

      if (!Menu.$links.length) {
        Menu.$apis.attr('data-tip', '找不到任何 API');
      } else {
        Menu.$apis.removeAttr('data-tip');
        var $tmp = Params.val.n.length ? Menu.$links.filter('[data-name="' + Params.val.n + '"]') : Menu.$links;
        $tmp = $tmp.length ? $tmp : Menu.$links;
        $tmp.first().click();
      }
    }
  };

  var Main = {
    $el: null,
    $formats: null,
    $header: null,
    $tabs: null,
    $panels: null,

    init: function () {
      if (Main.$el) return;
      Main.$el = $('<div />').attr('id', 'container').appendTo($('<main />').attr('id', 'main').appendTo($body));
    },

    treeRender: function(datas) {
      var branchs = [];
      for (var i in datas) {
        var $branchs = Main.treeRender(datas[i].branchs);

        let $branch = $('<div />').addClass('branch').attr('data-count', $branchs.length);
        
        var $leaves = $('<div />').addClass('leaves').append(
          $('<b />').text(datas[i].leave).addClass(datas[i].optional ? 'optional' : null)).append(
          $('<u />').text(datas[i].type)).append(
          datas[i].description).click(function() { $branch.toggleClass('close'); });
        
        branchs.push($branch.append($leaves).append($branchs));
      }
      return $(branchs).map($.fn.toArray);
    },

    tree: function(datas) {
      var max = Math.max.apply(null, datas.map(function(a) { return a.field.length }));
      var tmp = {};

      for (var i = 0; i < max; i++)
        for (var j = 0; j < datas.length; j++) {
          if (datas[j].field.length != i + 1) continue;
          if (typeof datas[j].field[i] === 'undefined') continue;

          var branchs = tmp;

          for (var k = 0; k < i; k++)
            if (typeof branchs[datas[j].field[k]] !== 'undefined') { branchs = branchs[datas[j].field[k]].branchs; }
            else { j = datas.length; branchs = null; break; }

          if (branchs) {branchs[datas[j].field[i]] = { leave: datas[j].field[i], type: datas[j].type, optional: datas[j].optional, description: datas[j].description, branchs: {} };}
        }

      return tmp;
    },

    details1: function(data) {
      var $details1 = []; for (var field in data.fields) $details1.push({title: data.default == field ? '說明' : field, columns: data.fields[field]}); $details1.sort(function(a, b) { return a.title > b.title; });
      return $($details1.map(function(field) {
        var $label = $(['樹狀圖', '表格圖'].map(function(t) { return $('<label />').text(t); })).map($.fn.toArray);
        let $details = $('<div/>').addClass('details').attr('data-title', field.title).append($('<div />').addClass('tabs').append($label)).append($('<div />').addClass('panels').append($('<div />').addClass('detail').append($('<div />').addClass('tree').append(Main.treeRender(Main.tree(field.columns.map(function(column) { return { type: column.type, optional: column.optional, field: column.field.split('.'), description: column.description }; })))))).append($('<div />').addClass('detail').append($('<table />').addClass('list').append($('<thead />').append($('<tr />').append($('<th />').attr('width', 80).addClass('center').text('必須')).append($('<th />').attr('width', 120).text('類型')).append($('<th />').attr('width', 200).text('Key')).append($('<th />').text('敘述')))).append($('<tbody />').append($(field.columns.map(function(f) { return $('<tr />').append($('<td />').append($('<span />').addClass(f.optional ? 'optional' : 'need').text(f.optional ? '非必要' : '必要'))).append($('<td />').text(f.type)).append($('<td />').text(f.field)).append($('<td />').html(f.description)) })).map($.fn.toArray))))));
        $label.click(function() { $details.attr('data-i', $(this).index() + 1); }).first().click();
        return $details;
      })).map($.fn.toArray);
    },

    details2: function(data) {
      if (!data.examples.length) return null;
      var $tab = $(data.examples.map(function(example, i) { return $('<label />').text(example.title); })).map($.fn.toArray);
      var $detail = $(data.examples.map(function(example, i) { return $('<div />').addClass('detail').append($('<pre />').addClass('prettyprint').addClass('language-' + example.type).addClass('sample').text(example.content)); })).map($.fn.toArray);
      var $details = $('<div />').addClass('details').attr('data-title', '結果').append($('<div />').addClass('tabs').append($tab)).append($('<div />').addClass('panels').append($detail))
      $tab.click(function() { $details.attr('data-i', $(this).index() + 1); }).first().click();
      return $details;
    },

    render: function(obj) {
      Main.$el.empty();

      var filters = {name: '', title: '', description: '', permission: []};
      for (var filter in filters)
        if (typeof obj[filter] === 'undefined')
          obj[filter] = filters[filter];

      Main.$header = $('<header />').attr('id', 'header').append($('<h1 />').attr('data-title', obj.name).text(obj.title)).append($('<section />').html(obj.description)).append($('<div />').attr('id', 'url').attr('data-type', obj.type).append($('<code />').text(obj.url))).append($('<div />').attr('id', 'importants').append(obj.permission.map(function(permission) { return $('<span />').addClass('important').text(permission.name); })));
      Main.$formats = $('<div />').attr('id', 'formats');

      var formats = { header: {title: 'Header',  default: 'Header', v: 'h'}, parameter: {title: '參數', default: 'Parameter', v: 'p'}, success: {title: '成功',   default: 'Success 200', v: 's'}, error: {title: '錯誤',     default: 'Error 4xx', v: 'e'} };

      Main.$tabs = [];
      Main.$panels = [];

      for (var format in formats)
        if (typeof obj[format] !== 'undefined') {
          Main.$tabs.push(formats[format]);
          Main.$panels.push({ default: formats[format].default, fields: typeof obj[format].fields === 'undefined' ? {} : obj[format].fields, examples: typeof obj[format].examples === 'undefined' ? [] : obj[format].examples });
        }

      Main.$tabs = $(Main.$tabs.map(function(t) { return $('<label />').addClass('tab').attr('data-name', t.v).text(t.title).click(function() { Params.update('t', $(this).attr('data-name')); Main.$formats.attr('data-i', $(this).index() + 1); }); })).map($.fn.toArray);
      Main.$panels = $(Main.$panels.map(function(panel) { return $('<div />').addClass('panel').append(Main.details1(panel)).append(Main.details2(panel)); })).map($.fn.toArray);
      Main.$formats.append($('<div />').attr('id', 'tabs').append(Main.$tabs))
      Main.$formats.append($('<div />').attr('id', 'panels').append(Main.$panels))

      var $tmp = Params.val.t.length ? Main.$tabs.filter ('[data-name="' + Params.val.t + '"]') : Main.$tabs;
      $tmp = $tmp.length ? $tmp : Main.$tabs;
      $tmp.first().click();

      Main.$el.attr('data-deprecated', typeof obj.deprecated !== 'undefined' ? obj.deprecated === true ? '已棄用！' : obj.deprecated : '').append(Main.$header).append(Main.$formats);
      PR.prettyPrint();
      Loading.close();
    }
  };

  Params.init();
  Loading.init();
  Main.init();
  Keyboard.init();
});