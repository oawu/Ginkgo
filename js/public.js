/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

_vTimers = {};
function timerHas(key)                     { return typeof _vTimers[key] !== 'undefined'; }
function timerClean(key)                   { if (typeof _vTimers[key] === 'undefined') return true; clearTimeout(_vTimers[key]); _vTimers[key] = null; }
function timerCleanAll()                   { for (key in _vTimers) timerClean(key); }
function timerOnly(key, time, closure)     { if (timerHas()) return ; _vTimers[key] = setTimeout(closure, time); }
function timerReplace(key, time, closure)  { timerClean(key); _vTimers[key] = setTimeout(closure, time); }

function NavButton() {
  this.el = $('<a />')
  this.title = ''
  this.click = null
  this.color = 'rgba(20, 106, 211, 1.00)'

  this.loadView = function() {
    this.el.text(this.title).click(this.click).css({ color: this.color })
  }
}

function NavVC(vc) {
  this.rootVC = vc
  this.title = ''
  this.left = null
  this.right = null
  this.pushVC = function(vc) {
    vc.loadView();

    this.rootVC.el.find('.vcView').append(vc.el.find('.vcView .view'))
  }
  this.loadView = function() {
    var header = $('<header />').text(this.title);
    if (this.left) {
      this.left.loadView();
      this.left.el.addClass('left');
      header.append(this.left.el)
    }

    if (this.right) {
      this.right.loadView();
      this.right.el.addClass('right');
      header.append(this.right.el)
    }
    
    this.rootVC.loadView();
    this.rootVC.el.find('.vcView').prepend(header)
  }
}
function VC($el) {
  this.el = $el;
  this.view;
  
  this.loadView = function() {
    this.el = $('<div />').addClass('-vc').append($('<div />').addClass('vcView'));
    this.el.find('.vcView').append($('<div />').addClass('view').append(this.view));
  }
}

function pushVC(vc) {
  var el = null;
  vc.loadView();

  if (vc instanceof VC) {
    el = vc.el;
  } else if (vc instanceof NavVC) {
    el = vc.rootVC.el;
  }

  if (!el) {
    return console.error('Error');
  }
  el.appendTo('body')
  el.addClass('show');

  timerReplace(vc, 100, function() {
    el.addClass('opacity')
  });
}
 
$(function() {

  // var cell = TableCellView()
  
  // cell.click(function() {
  //   pushVC(DetailVC(this))
  // })

  // var tableVC = TableVC({
  //   cell: cell
  // })

  var vc = new VC;
  vc.view = '123'

  var navButton = new NavButton()
  navButton.title = '新增'
  navButton.color = 'rgba(34, 118, 228, 1.00)'
  

  var navVC = new NavVC
  navVC.rootVC = vc
  navVC.title = 'Hello'
  navVC.right = navButton

  navButton.click = function() {
    var addVC = new VC
    navVC.pushVC(addVC)
  };

  pushVC(navVC);
  






});