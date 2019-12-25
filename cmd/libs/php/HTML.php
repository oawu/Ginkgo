<?php

/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2019, Ginkgo
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

namespace HTML;

abstract class DomElement {
  private static $SingletonTags = ['area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'];

  private $tag;
  protected $text, $attrs = [], $datas = [];

  public function __construct($text = '') {
    $this->tag = strtolower(deNamespace(get_called_class()));
    $this->text($text);
  }

  public function text($text) {
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

  public static function create($text = '') {
    return new static(array_filter(\arrayFlatten(func_get_args()), function($t) { return $t !== null; }));
  }

  public function __call($name, $arguments) {
    $this->attrs[$name] = array_shift($arguments);
    return $this;
  }
}

class A          extends DomElement {} function A() {          return A::create(\arrayFlatten(func_get_args())); }
class B          extends DomElement {} function B() {          return B::create(\arrayFlatten(func_get_args())); }
class I          extends DomElement {} function I() {          return I::create(\arrayFlatten(func_get_args())); }
class P          extends DomElement {} function P() {          return P::create(\arrayFlatten(func_get_args())); }
class H1         extends DomElement {} function H1() {         return H1::create(\arrayFlatten(func_get_args())); }
class Div        extends DomElement {} function Div() {        return Div::create(\arrayFlatten(func_get_args())); }
class Span       extends DomElement {} function Span() {       return Span::create(\arrayFlatten(func_get_args())); }
class Pre        extends DomElement {} function Pre() {        return Pre::create(\arrayFlatten(func_get_args())); }
class Del        extends DomElement {} function Del() {        return Del::create(\arrayFlatten(func_get_args())); }
class Option     extends DomElement {} function Option() {     return Option::create(\arrayFlatten(func_get_args())); }
class Select     extends DomElement {} function Select() {     return Select::create(\arrayFlatten(func_get_args())); }
class Form       extends DomElement {} function Form() {       return Form::create(\arrayFlatten(func_get_args())); }
class Input      extends DomElement {} function Input() {      return Input::create(\arrayFlatten(func_get_args())); }
class Button     extends DomElement {} function Button() {     return Button::create(\arrayFlatten(func_get_args())); }
class Header     extends DomElement {} function Header() {     return Header::create(\arrayFlatten(func_get_args())); }
class Footer     extends DomElement {} function Footer() {     return Footer::create(\arrayFlatten(func_get_args())); }
class Article    extends DomElement {} function Article() {    return Article::create(\arrayFlatten(func_get_args())); }
class Section    extends DomElement {} function Section() {    return Section::create(\arrayFlatten(func_get_args())); }
class Img        extends DomElement {} function Img() {        return Img::create(\arrayFlatten(func_get_args())); }
class Time       extends DomElement {} function Time() {       return Time::create(\arrayFlatten(func_get_args())); }
class Figcaption extends DomElement {} function Figcaption() { return Figcaption::create(\arrayFlatten(func_get_args())); }
class Main       extends DomElement {} function Main() {       return Main::create(\arrayFlatten(func_get_args())); }
class Title      extends DomElement {} function Title() {      return Title::create(\arrayFlatten(func_get_args())); }
class Link       extends DomElement {} function Link() {       return Link::create(\arrayFlatten(func_get_args())); }
class Meta       extends DomElement {} function Meta() {       return Meta::create(\arrayFlatten(func_get_args())); }
class Script     extends DomElement {} function Script() {     return Script::create(\arrayFlatten(func_get_args())); }
class Html       extends DomElement {} function Html() {       return Html::create(\arrayFlatten(func_get_args())); }
class Head       extends DomElement {} function Head() {       return Head::create(\arrayFlatten(func_get_args())); }
class Body       extends DomElement {} function Body() {       return Body::create(\arrayFlatten(func_get_args())); }
class Style      extends DomElement {} function Style() {      return Style::create(\arrayFlatten(func_get_args())); }

class Figure     extends DomElement { public function url($url) { return $this->style("background-image: url('" . $url . "');"); } } function Figure() {     return Figure::create(\arrayFlatten(func_get_args())); }
class Label      extends DomElement { public function url($url) { return $this->style("background-image: url('" . $url . "');"); } } function Label() {      return Label::create(\arrayFlatten(func_get_args())); }
