<?php

/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2020, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

namespace HTML {
  abstract class DomElement {
    private static $SingletonTags = ['area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'];

    private $tag;
    protected $text, $attrs = [], $datas = [];

    public function __construct($text = '') {
      $this->tag = strtolower(deNamespace(get_called_class()));
      $this->text($text);
    }

    public function text($text = null) {
      if ($text === null) return is_array($this->text) ? implode('', $this->text) : $this->text;
      $this->text = $text;
      return $this;
    }

    public function attr($key, $val) {
      $this->attrs[$key] = $val;
      return $this;
    }

    public function data($key, $val) {
      if ($val === null) return $this;
      is_array($val) && $val = json_encode($val);
      $this->datas[$key] = $val;
      return $this;
    }

    public function __toString() {
      if ($this->tag === null)
        return '';

      foreach ($this->datas as $key => $value)
        $this->attrs['data-' . $key] = $value;

      if (in_array($this->tag, DomElement::$SingletonTags))
        return '<' . $this->tag . attr($this->attrs) . '/>';

      return ($this->tag === 'html' ? '<!DOCTYPE html>' : '') . '<' . $this->tag . attr($this->attrs) . '>' . (is_array($this->text) ? implode('', $this->text) : $this->text) . '</' . $this->tag . '>';
    }

    public static function create(...$args) {
      return new static(array_filter($args, function($t) { return $t !== null; }));
    }

    public function __call($name, $arguments) {
      $this->attrs[$name] = array_shift($arguments);
      return $this;
    }
  }

  class A          extends DomElement {} function a(...$args) {          return A::create(...$args); }
  class B          extends DomElement {} function b(...$args) {          return B::create(...$args); }
  class I          extends DomElement {} function i(...$args) {          return I::create(...$args); }
  class P          extends DomElement {} function p(...$args) {          return P::create(...$args); }
  class Br         extends DomElement {} function br(...$args) {         return Br::create(...$args); }
  class H1         extends DomElement {} function h1(...$args) {         return H1::create(...$args); }
  class H2         extends DomElement {} function h2(...$args) {         return H2::create(...$args); }
  class H3         extends DomElement {} function h3(...$args) {         return H3::create(...$args); }
  class Hr         extends DomElement {} function hr(...$args) {         return Hr::create(...$args); }
  class Ul         extends DomElement {} function ul(...$args) {         return Ul::create(...$args); }
  class Li         extends DomElement {} function li(...$args) {         return Li::create(...$args); }
  class Div        extends DomElement {} function div(...$args) {        return Div::create(...$args); }
  class Span       extends DomElement {} function span(...$args) {       return Span::create(...$args); }
  class Pre        extends DomElement {} function pre(...$args) {        return Pre::create(...$args); }
  class Del        extends DomElement {} function del(...$args) {        return Del::create(...$args); }
  class Option     extends DomElement {} function option(...$args) {     return Option::create(...$args); }
  class Select     extends DomElement {} function select(...$args) {     return Select::create(...$args); }
  class Form       extends DomElement {} function form(...$args) {       return Form::create(...$args); }
  class Input      extends DomElement {} function input(...$args) {      return Input::create(...$args); }
  class IFrame     extends DomElement {} function iframe(...$args) {     return IFrame::create(...$args); }
  class Button     extends DomElement {} function button(...$args) {     return Button::create(...$args); }
  class Header     extends DomElement {} function header(...$args) {     return Header::create(...$args); }
  class Footer     extends DomElement {} function footer(...$args) {     return Footer::create(...$args); }
  class Article    extends DomElement {} function article(...$args) {    return Article::create(...$args); }
  class Section    extends DomElement {} function section(...$args) {    return Section::create(...$args); }
  class Img        extends DomElement {} function img(...$args) {        return Img::create(...$args); }
  class Time       extends DomElement {} function time(...$args) {       return Time::create(...$args); }
  class Figcaption extends DomElement {} function figcaption(...$args) { return Figcaption::create(...$args); }
  class Main       extends DomElement {} function main(...$args) {       return Main::create(...$args); }
  class Title      extends DomElement {} function title(...$args) {      return Title::create(...$args); }
  class Link       extends DomElement {} function link(...$args) {       return Link::create(...$args); }
  class Meta       extends DomElement {} function meta(...$args) {       return Meta::create(...$args); }
  class Script     extends DomElement {} function script(...$args) {     return Script::create(...$args); }
  class Html       extends DomElement {} function html(...$args) {       return Html::create(...$args); }
  class Head       extends DomElement {} function head(...$args) {       return Head::create(...$args); }
  class Body       extends DomElement {} function body(...$args) {       return Body::create(...$args); }
  class Style      extends DomElement {} function style(...$args) {      return Style::create(...$args); }
  class Figure     extends DomElement { public function url($url) { return $this->style("background-image: url('" . $url . "');"); } } function figure(...$args) {     return Figure::create(...$args); }
};
