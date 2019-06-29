<?php

class Str {
  static public function split($str) {
    return array_filter(preg_split('//u', $str), function($t) { return $t !== ''; });
  }
  static public function width($str) {
    return array_sum(array_map(function($t) { return mb_strwidth($t); }, Str::split($str)));
  }
  static public function repeat($multiplier = 1, $input = ' ') {
    return str_repeat($input, $multiplier);
  }

  public static function docx3($str, $max = null) {
    $strs = [];
    foreach (Str::split($str) as $val) {
      if (($width = Str::width($val)) > $max) {
        if ($max) {
          array_push($strs, '…');
        } else {
          array_pop($strs);
          array_push($strs, '…');
        }
        break;
      } else {
        $max -= $width;
        array_push($strs, $val);
      }
    }
    return implode('', $strs);
  }
  public static function splitWords($str, $max = null) {
    $chars = Str::split($str);
    $words = $tmps = [];

    foreach ($chars as $char) {
      if (strlen($char) == 3) {
        array_push($words, ['word' => implode('', $tmps), 'len' => count($tmps), 'chinese' => false]);
        $tmps = [];

        array_push($words, ['word' => $char, 'len' => 2, 'chinese' => true]);
      } else if ($char == ' ') {
        array_push($words, ['word' => implode('', $tmps), 'len' => count($tmps), 'chinese' => false]);
        $tmps = [];

      } else {
        array_push($tmps, $char);

        if ($max && count($tmps) >= $max) {
          array_push($words, ['word' => implode('', $tmps), 'len' => count($tmps), 'chinese' => false]);
          $tmps = [];
        }
      }
    }

    array_push($words, ['word' => implode('', $tmps), 'len' => count($tmps), 'chinese' => false]);
    $tmps = [];

    return array_filter($words, function($word) { return $word['word'] !== ''; });
  }

}

class Keyboard {

  private $closure = null;
  private $stdin = null;
  private $running = false;

  public function __construct($closure = null) {

    $this->setStdin()
         ->setClosure($closure);
  }

  public function setStdin($stdin = null) {
    $this->stdin = $stdin ?: fopen('php://stdin', 'r');
    system('stty -icanon -echo');
    stream_set_blocking($this->stdin, 0);
    return $this;
  }

  public function setClosure($closure) {
    $this->closure = $closure;
    return $this;
  }

  private function code() {
    $key = ord(fgetc($this->stdin));

    if (27 === $key) {
      fgetc($this->stdin);
      $key = ord(fgetc($this->stdin));
      $key = 0 - $key;
    }

    return $key;
  }

  public function stop() {
    $this->running = false;
    return $this;
  }

  public function run() {
    $this->running = true;
    while ($this->running) {
      $reads = [$this->stdin];
      $writes = [];
      $except = null;
      @stream_select($reads, $writes, $except, null, null) !== false
        && is_callable($this->closure)
        && call_user_func($this->closure, $this->code(), $this);
    }

    return $this;
  }

  static public function create() {
    return new self();
  }

  static public function listener($closure) {
    return new self($closure);
  }
}

class Xterm {
  const BLACK  = 0;
  const WHITE  = 15;

  const RED    = 1;
  const GREEN  = 2;
  const YELLOW = 3;
  const BLUE   = 4;
  const PURPLE = 5;
  const CYAN   = 6;
  const GRAY   = 7;

  const L_BLACK  = 8;
  const L_RED    = 9;
  const L_GREEN  = 10;
  const L_YELLOW = 11;
  const L_BLUE   = 12;
  const L_PURPLE = 13;
  const L_CYAN   = 14;
  
  private $fCode, $bCode;
  private $blod, $italic, $underline, $dim, $blink, $inverted, $hidden;

  public function color($code) { $this->fCode = $code; return $this; }
  public function background($code) { $this->bCode = $code; return $this; }
  public function blod($blod = true) { $this->blod = $blod; return $this; }
  public function dim($dim = true) { $this->dim = $dim; return $this; }
  public function italic($italic = true) { $this->italic = $italic; return $this; }
  public function underline($underline = true) { $this->underline = $underline; return $this; }
  public function blink($blink = true) { $this->blink = $blink; return $this; }
  public function inverted($inverted = true) { $this->inverted = $inverted; return $this; }
  public function hidden($hidden = true) { $this->hidden = $hidden; return $this; }

  public function str($str) {
    $codes = [];
    $this->fCode > -1 && $this->fCode < 256 && array_push($codes, "\033[38;5;" . $this->fCode . "m");
    $this->bCode > -1 && $this->bCode < 256 && array_push($codes, "\033[48;5;" . $this->bCode . "m");
    foreach (['blod' => 1, 'dim' => 2, 'italic' => 3, 'underline' => 4, 'blink' => 5, 'inverted' => 7, 'hidden' => 8] as $key => $val)
      isset($this->$key) && is_bool($this->$key) && $this->$key && array_push($codes, "\033[" . $val . "m");
    foreach ($codes as $code) $str = $code . $str . "\033[0m";
    return $str;
  }

  public static function create($str, $fCode = null, $bCode = null) {
    $xterm = new Xterm();
    return $xterm->color($fCode)->background($bCode)->str($str);
  }
}

class Display {
  const MAX_LEN = 64;
  const LN      = "\n";

  private static function tokensLen($words) {
    $len = 0;
    for ($i = 0, $c = count($words); $i < $c; $i++)
      if (!$i) $len += $words[$i]['len'];
      else if ($words[$i - 1]['chinese'] && $words[$i]['chinese']) $len += $words[$i]['len'];
      else $len += $words[$i]['len'] + 1;
    return $len;
  }

  public static function lines($str, $max = null) {
    $words = Str::splitWords($str, $max);
    $lines = $tokens = [];

    foreach ($words as $word) {
      $tokensLen = self::tokensLen($tokens);

      if (!$tokensLen) {
        array_push($tokens, $word);
      } else {
        $end = end($tokens);

        if ($end['chinese'] && $word['chinese']) {
          if ($max && $tokensLen + $word['len'] > $max) {
            
            array_push($lines, $tokens);
            $tokens = [$word];
          } else {
            array_push($tokens, $word);
          }
        } else {
          if ($max && $tokensLen + $word['len'] + 1 > $max) {
            array_push($lines, $tokens);
            $tokens = [$word];
          } else {
            array_push($tokens, $word);
          }
        }
      }
    }

    array_push($lines, $tokens);

    return array_map(function($words) {
      $str = '';
      
      for ($i = 0, $c = count($words); $i < $c; $i++)
        if (!$i) $str = $words[$i]['word'];
        else if ($words[$i - 1]['chinese'] && $words[$i]['chinese']) $str .= $words[$i]['word'];
        else $str .= ' ' . $words[$i]['word'];

      return [$str, Str::width($str)];
    }, $lines);
  }

  public static function error($content, $title = '錯誤') {
    $lines = Display::lines($content, Display::MAX_LEN - 8);
    $titleLen = array_sum(array_map(function($t) { return strlen($t) == 3 ? 2 : 1; }, Str::split($title)));

    $lineColor = new Xterm();
    $lineColor->color(Xterm::WHITE);
    $lineColor->background(Xterm::RED);

    $titleColor = new Xterm();
    $titleColor->color(Xterm::YELLOW);
    $titleColor->background(Xterm::RED);
    $titleColor->blod();

    echo "\n";
    echo $lineColor->str(' ╭') . $lineColor->str('─') . $titleColor->str(' ' . $title . ' ') . $lineColor->str(Str::repeat(Display::MAX_LEN - $titleLen - 7, '─')) . $lineColor->str('╮ ');
    echo "\n";
    // echo $lineColor->str(' │') . $lineColor->str(Str::repeat(Display::MAX_LEN - 4)) . $lineColor->str('│ ');
    // echo "\n";
    foreach ($lines as $line) {
      echo $lineColor->str(' │') . $lineColor->str('  ' . $line[0] . '  ' . Str::repeat(Display::MAX_LEN - $line[1] - 8)) . $lineColor->str('│ ');
      echo "\n";
    }
    echo $lineColor->str(' ╰') . $lineColor->str(Str::repeat(Display::MAX_LEN - 4, '─')) . $lineColor->str('╯ ');
    echo "\n";
    echo "\n";
    exit(1);
  }

  public static function logo() {
    $space = Display::MAX_LEN - 43 - 4;
    
    $l = $space > 1 ? (int)($space / 2) : 0;
    $r = Str::repeat($space - $l);
    $l = Str::repeat($l);

    $lineColor = new Xterm();
    $lineColor->color(Xterm::L_BLACK);
    $_1 = $lineColor->str('╭');
    $_2 = $lineColor->str('╰');
    $_3 = $lineColor->str('╮');
    $_4 = $lineColor->str('╯');
    $_5 = $lineColor->str('─');
    $_6 = $lineColor->str('│');
    $_7 = $lineColor->str('├');
    $_8 = $lineColor->str('┤');


    $c = new Xterm();
    $c->dim();
    $c->color(Xterm::L_BLACK);

    echo Str::repeat() . $_1 . Str::repeat(Display::MAX_LEN - 4, $_5) . $_3; echo Display::LN;
    echo Str::repeat() . $_6 . $l . '███' . $c->str('╗') . '   ███' . $c->str('╗') . ' █████' . $c->str('╗') . ' ██████' . $c->str('╗') . ' ██' . $c->str('╗') . '     ███████' . $c->str('╗') . '' . $r . $_6; echo Display::LN;
    echo Str::repeat() . $_6 . $l . '████' . $c->str('╗') . ' ████' . $c->str('║') . '██' . $c->str('╔══') . '██' . $c->str('╗') . '██' . $c->str('╔══') . '██' . $c->str('╗') . '██' . $c->str('║') . '     ██' . $c->str('╔════╝') . '' . $r . $_6; echo Display::LN;
    echo Str::repeat() . $_6 . $l . '██' . $c->str('╔') . '████' . $c->str('╔') . '██' . $c->str('║') . '███████' . $c->str('║') . '██████' . $c->str('╔╝') . '██' . $c->str('║') . '     █████' . $c->str('╗') . '  ' . $r . $_6; echo Display::LN;
    echo Str::repeat() . $_6 . $l . '██' . $c->str('║╚') . '██' . $c->str('╔╝') . '██' . $c->str('║') . '██' . $c->str('╔══') . '██' . $c->str('║') . '██' . $c->str('╔═══╝') . ' ██' . $c->str('║') . '     ██' . $c->str('╔══╝') . '  ' . $r . $_6; echo Display::LN;
    echo Str::repeat() . $_6 . $l . '██' . $c->str('║') . ' ' . $c->str('╚═╝') . ' ██' . $c->str('║') . '██' . $c->str('║') . '  ██' . $c->str('║') . '██' . $c->str('║') . '     ███████' . $c->str('╗') . '███████' . $c->str('╗') . '' . $r . $_6; echo Display::LN;
    echo Str::repeat() . $_6 . $l . '' . $c->str('╚═╝') . '     ' . $c->str('╚═╝╚═╝') . '  ' . $c->str('╚═╝╚═╝') . '     ' . $c->str('╚══════╝╚══════╝') . '' . $r . $_6; echo Display::LN;
    echo Str::repeat() . $_7 . Str::repeat(Display::MAX_LEN - 4, $_5) . $_8; echo Display::LN;
  }
}

class Subitme {
  protected $index, $select, $title, $subtitle;

  public function __construct(bool $select, int $index, string $title, string $subtitle) {
    $this->setSelect($select)
         ->setIndex($index)
         ->setTitle($title)
         ->setSubtitle($subtitle);
  }

  public function setSelect(bool $select) {
    $this->select = $select;
    return $this;
  }

  public function setIndex(int $index) {
    $this->index = $index;
    return $this;
  }

  public function setTitle(string $title) {
    $this->title = $title;
    return $this;
  }

  public function setSubtitle(string $subtitle) {
    $this->subtitle = $subtitle;
    return $this;
  }

  public static function create(bool $select, int $index, string $title, string $subtitle) {
    return new static($select, $index, $title, $subtitle);
  }

  public function __toString() {
    $titleLen = Display::MAX_LEN - 19 - 12 - 4;

    $lineColor = new Xterm();
    $lineColor->color(Xterm::L_BLACK);
    $_6 = $lineColor->str('│');


    $color = new Xterm();
    $color->dim();

    $titleColor = new Xterm();
    $titleColor->dim();
    
    $datetimeColor = new Xterm();
    $datetimeColor->dim();
    $datetimeColor->color(Xterm::L_BLACK);

    $hoverColor = new Xterm();

    $titleHoverColor = new Xterm();
    $titleHoverColor->color(Xterm::WHITE);
    
    $datetimeHoverColor = new Xterm();
    $datetimeHoverColor->dim();
    $datetimeHoverColor->color(Xterm::WHITE);

    if ($this->select)
      return Str::repeat() . $_6 . Str::repeat() . $hoverColor->str('▣') . $titleHoverColor->str(sprintf('%4d. ', $this->index) . sprintf('%-' . $titleLen . 's', Str::docx3($this->title, $titleLen))) . Str::repeat(3) . $datetimeHoverColor->str($this->subtitle) . Str::repeat() . $_6;
    else
      return Str::repeat() . $_6 . Str::repeat() . $color->str('□')      . $titleColor->str(sprintf('%4d. ', $this->index) . sprintf('%-' . $titleLen . 's', Str::docx3($this->title, $titleLen)))      . Str::repeat(3) . $datetimeColor->str($this->subtitle)      . Str::repeat() . $_6;
  }
}
abstract class Item {
  protected $title, $subtitle, $subitems = [];
  protected $parent, $isHover = false, $isChoed = false;

  public function __construct($title, $subtitle) {
    $this->setTitle($title)
         ->setSubtitle($subtitle);
  }
  
  public function title() { return $this->title; }
  public function subtitle() { return $this->subtitle; }

  public function titleWidth() { return array_sum(array_map(function($t) { return strlen($t) == 3 ? 2 : 1; }, Str::split($this->title))); }
  public function subtitleWidth() { return array_sum(array_map(function($t) { return strlen($t) == 3 ? 2 : 1; }, Str::split($this->subtitle))); }

  public function titleLen() { return array_sum(array_map('strlen', Str::split($this->title))); }
  public function subtitleLen() { return array_sum(array_map('strlen', Str::split($this->subtitle))); }

  public function setTitle(string $title) {
    $this->title = $title;
    return $this;
  }

  public function setSubtitle(string $subtitle) {
    $this->subtitle = $subtitle;
    return $this;
  }

  public function setParent(Menu $parent) {
    $this->parent = $parent;
    return $this;
  }

  public function isChoed(bool $isChoed) {
    $this->isChoed = $isChoed;
    return $this;
  }

  public function isHover(bool $isHover) {
    $this->isHover = $isHover;
    return $this;
  }

  public function back() {
    return $this->parent ? $this->parent->choice($this->index() + 1) : null;
  }

  public function index() {
    if (!$this->parent)
      return 0;
    return $this->parent->itemIndex($this);
  }

  public function subitems() {
    return $this->subitems;
  }

  public function setSubitems(array $subitems) {
    $this->subitems = $subitems;
    return $this;
  }

  public function __toString() {
    if (!$this->parent)
      return '';
    $itemsTitleMaxWidth = $this->parent->itemsTitleMaxWidth();
    $spaceCount = $itemsTitleMaxWidth + ($this->titleLen() - $this->titleWidth());
    $repeatSpace = Str::repeat(Display::MAX_LEN - 7 - $itemsTitleMaxWidth - 4 - $this->subtitleLen() - 3);

    $arrowColor = new Xterm();
    $arrowColor->color(Xterm::L_RED);
    $this->isChoed && $arrowColor->dim();
    $lineColor = new Xterm();
    $lineColor->color(Xterm::L_BLACK);
    $_6 = $lineColor->str('│');

    $numColor = new Xterm();
    $titleColor = new Xterm();
    $splitColor = new Xterm();
    $splitColor->color(Xterm::L_BLACK);
    $splitColor->dim();
    $subtitleColor = new Xterm();
    $subtitleColor->dim();

    $numHoverColor = new Xterm();
    $numHoverColor->color(Xterm::WHITE);
    $titleHoverColor = new Xterm();
    $titleHoverColor->color(Xterm::WHITE);
    $splitHoverColor = new Xterm();
    $splitHoverColor->dim();
    $subtitleHoverColor = new Xterm();

    if ($this->isHover)
      return Str::repeat() . $_6 . Str::repeat() . $arrowColor->str('➜') . Str::repeat(2) . $numHoverColor->str(($this->index() + 1) . '.') . Str::repeat() . $titleHoverColor->str(sprintf('%-' . $spaceCount . 's', $this->title)) . $splitHoverColor->str(' ─ ') . $subtitleHoverColor->str($this->subtitle) . $repeatSpace . $_6;
    else
      return Str::repeat() . $_6 . Str::repeat(4) .                                              $numColor->str(($this->index() + 1) . '.') . Str::repeat() .      $titleColor->str(sprintf('%-' . $spaceCount . 's', $this->title)) .      $splitColor->str(' ─ ') .      $subtitleColor->str($this->subtitle) . $repeatSpace . $_6;
  }

  public static function create($title, $subtitle) {
    return new static($title, $subtitle);
  }

  public static function show(&$cho, Menu $menu, bool $isChoed = false) {
    system('clear');

    Display::logo();

    $lineColor = new Xterm();
    $lineColor->color(Xterm::L_BLACK);
    $_1 = $lineColor->str('╭');
    $_2 = $lineColor->str('╰');
    $_3 = $lineColor->str('╮');
    $_4 = $lineColor->str('╯');
    $_5 = $lineColor->str('─');
    $_6 = $lineColor->str('│');
    $_7 = $lineColor->str('├');
    $_8 = $lineColor->str('┤');

    $cho <= count($menu->items()) || $cho = 1;
    $cho >= 1 || $cho = count($menu->items());

    $families = $menu->families();
    $repeatSpace = Str::repeat(Display::MAX_LEN - ((count($families) - 1) * 2 + array_sum(array_map(function($family) { return $family->titleWidth(); }, $families))) - 7);
    echo Str::repeat() . $_6 . Str::repeat(3) . implode(Xterm::create('﹥', Xterm::L_BLACK), array_map(function($family) use ($menu) { return Xterm::create($family->title(),  $family == $menu ? Xterm::YELLOW : null); }, $families)) . $repeatSpace . $_6;
    echo Display::LN;
    echo Str::repeat() . $_7 . Str::repeat(Display::MAX_LEN - 4, $_5) . $_8; echo Display::LN;

    if ($subitems = $menu->subitems()) {
      $titleLen = Display::MAX_LEN - 19 - 12 - 3;

      $datetimeColor = new Xterm();
      $datetimeColor->color(Xterm::L_BLACK);
      
      $titleHoverColor = new Xterm();
      $titleHoverColor->color(Xterm::L_YELLOW);
      
      $datetimeHoverColor = new Xterm();
      $datetimeHoverColor->dim();
      $datetimeHoverColor->color(Xterm::YELLOW);

      $hoverColor = new Xterm();
      $hoverColor->dim();
      $hoverColor->color(Xterm::L_YELLOW);

      foreach ($menu->subitems() as $subitem) {
        echo $subitem;
        // if ($subitem[0])
        //   echo Str::repeat() . $_6 . Str::repeat() . $hoverColor->str('▣') . $titleHoverColor->str(sprintf('%3d. ', $subitem[1]) . sprintf('%-' . $titleLen . 's', Str::docx3($subitem[2], $titleLen))) . Str::repeat(3) . $datetimeHoverColor->str($subitem[3]) . Str::repeat() . $_6;
        // else
        //   echo Str::repeat() . $_6 . Str::repeat() . '□' . sprintf('%3d. ', $subitem[1]) . sprintf('%-' . $titleLen . 's', Str::docx3($subitem[2], $titleLen)) . Str::repeat(3) . $datetimeColor->str($subitem[3]) . Str::repeat() . $_6;
        echo Display::LN;
      }

      echo Str::repeat() . $_7 . Str::repeat(Display::MAX_LEN - 4, $_5) . $_8; echo Display::LN;
    }

    foreach ($menu->items() as $i => $item) {
      echo $item->isHover(++$i == $cho)->isChoed($isChoed);
      echo Display::LN;
    }

    $footer = '[←]離開 [→]進入 [↑]上移 [↓]下移 [h]說明';
    
    $len = Str::width($footer);
    $rs = Str::repeat(Display::MAX_LEN - $len - 7);

    echo Str::repeat() . $_7 . Str::repeat(Display::MAX_LEN - 4, $_5) . $_8; echo Display::LN;
    echo Str::repeat() . $_6 . Str::repeat(3) . $footer . $rs . $_6; echo Display::LN;
    echo Str::repeat() . $_2 . Str::repeat(Display::MAX_LEN - 4, $_5) . $_4; echo Display::LN;
  }
}

class Doing extends Item {
  protected $thingFunc;
  protected $tips = [];

  public function appendTip(string $tip) {
    array_push($this->tips, $tip);
    return $this;
  }
  
  public function thing($thingFunc) {
    $this->thingFunc = $thingFunc;
    return $this;
  }

  protected function showTips() {
    $cho = $this->index() + 1;
    Item::show($cho, $this->parent, true);
    
    if ($this->tips) {
      $tmpColor = new Xterm();
      $tmpColor->color(Xterm::YELLOW);

      echo Display::LN;
      echo Str::repeat() . $tmpColor->str("【注意事項】") . Display::LN;

      $tmpColor->color(Xterm::L_PURPLE);
      
      foreach ($this->tips as $tip) {
        $lines = Display::lines($tip, Display::MAX_LEN - 8);

        foreach ($lines as $i => $line)
          echo Str::repeat(4) . ($i ? ' ' : $tmpColor->str("※")) . Str::repeat() . $line[0] . Display::LN;
      }
    }

    return $this;
  }

  public function check($title = '是否正確') {

    $tmpColor = new Xterm();
    $tmpColor->color(Xterm::YELLOW);

    echo Display::LN;
    echo Str::repeat() . $tmpColor->str("【確認】") . Display::LN;

    $arrowColor = new Xterm();
    $arrowColor->color(Xterm::L_RED);
    echo $title = Str::repeat(2) . $arrowColor->str('➜') . " " . $title . "[y：確定, n：取消]：";

    $cho = null;
    Keyboard::listener(function($code, $keyboard) use (&$cho, $title) {
      if (in_array($cho, ['y', 'n'])) {
        if ($code == 10) {
          echo Display::LN;
          return $keyboard->stop();
        } else {
          $cho == null;
        }
      }

      echo "\r\33[K" . $title;

      if (in_array($cho = strtolower(chr($code)), ['y', 'n']))
        echo $cho;
    })->run();

    return $cho;
  }
  public function choice() {
    return is_callable($thingFunc = $this->thingFunc)
      ? call_user_func_array($thingFunc, array_merge([$this], func_get_args()))
      : $this->back();
  }
}

class Check extends Doing {
  public function choice() {
    if (!is_callable($thingFunc = $this->thingFunc))
      return $this->back();
    
    $this->showTips();
    $cho = $this->check();
    
    return $cho === 'n' ? $this->back() : parent::choice();
  }
}

class Input extends Doing {
  // private $inputRule
  private $check;
  private $validator;
  private $inputs = [];

  // public function __construct($title, $subtitle) {
  //   parent::__construct($title, $subtitle);
    
  //   // $this->setInputRule(function($code, $strs) {
  //   //   return (in_array($code, array_map('ord', range('a', 'z')))
  //   //           || in_array($code, array_map('ord', range('A', 'Z')))
  //   //           || in_array($code, array_map('ord', range('0', '9')))
  //   //           || in_array($code, array_map('ord', ['-', '_', ' '])))
  //   //          && ($strs || $code != ord(' '));
  //   // });
  // }
  public function setValidator($validator) {
    $this->validator = $validator;
    return $this;
  }
  public function setCheck(bool $check = true) {
    $this->check = $check;
    return $this;
  }
  // public function setInputRule($inputRule) {
  //   $this->inputRule = $inputRule;
  //   return $this;
  // }
  public function appendInput(string $title, string $rule = '/[0-9A-Za-z-_ ]+/') {
    array_push($this->inputs, [
      'title' => $title,
      'rule' => $rule,
    ]);
    return $this;
  }

  private function getStr($input) {

    $arrowColor = new Xterm();
    $arrowColor->color(Xterm::L_RED);
    echo $title = Str::repeat(2) . $arrowColor->str('➜') . " 請輸入" . $input['title'] . "：";

    $strs = [];
    Keyboard::listener(function($code, $keyboard) use (&$strs, $input, $title) {
      if ($code == 127 && $strs) {
        echo "\33[1D\33[K";
        array_pop($strs);
        return;
      }

      $rule = $input['rule'];

      if ($code == 10 && preg_match_all($rule, trim(implode('', $strs)))) {
        echo Display::LN;
        return $keyboard->stop();
      }

      if ($rule && preg_match_all($rule, chr($code))) {
        array_push($strs, chr($code));
        echo chr($code);
      }
    })->run();

    return trim(implode('', $strs));
  }

  public function showError($errors) {
    if ($errors) {
      is_array($errors) || $errors = [$errors];

      $tmpColor = new Xterm();
      $tmpColor->color(Xterm::YELLOW);

      echo Display::LN;
      echo Str::repeat() . $tmpColor->str("【輸入資訊有錯誤】") . Display::LN;

      foreach ($errors as $i => $error) {
        $lines = Display::lines($error, Display::MAX_LEN - 8);

        foreach ($lines as $i => $line)
          echo Str::repeat(4) . ($i ? ' ' : (($i + 1) . ".")) . Str::repeat() . $line[0] . Display::LN;
      }
    }
    return $this;
  }
  public function choice() {
    if (!is_callable($thingFunc = $this->thingFunc))
      return $this->back();
    $strs = [];
    
    $tmpColor = new Xterm();
    $tmpColor->color(Xterm::YELLOW);
    $error = '';

    do {
      $strs = [];
      
      do {

        $strs = [];
        $this->showTips();
        $this->showError($error);
        
        echo Display::LN;
        echo Str::repeat() . $tmpColor->str("【請輸入以下資訊】") . Display::LN;

        foreach ($this->inputs as $input)
          array_push($strs, $this->getStr($input));
        
        $strs = array_filter($strs, function($str) { return $str !== null && is_string($str);});
      
      } while(($validator = $this->validator) && is_callable($validator) && ($error = call_user_func_array($validator, $strs)));
    } while(($this->check === true && $this->check('請確認以上資訊是否正確？') == 'n') || count($strs) != count($this->inputs));

    return  call_user_func_array('parent::choice', $strs);
  }
}

class Menu extends Item {
  private $items = [];

  public function __construct($title, $subtitle) {
    parent::__construct($title, $subtitle);
  }

  public function items() {
    return $this->items;
  }

  public function appendItem(Item $item) {
    $item->setParent($this);
    array_push($this->items, $item);
    return $this;
  }

  public function itemsTitleMaxWidth() {
    return max(array_map(function($item) {
      return $item->titleWidth();
    }, $this->items));
  }

  public function families() {
    if (!$this->parent) return [$this];
    else return array_merge($this->parent->families(), [$this]);
  }

  public function itemIndex(Item $item) {
    foreach ($this->items as $i => $tmp)
      if ($tmp === $item)
        return $i;
    return 0;
  }

  public function choice(int $cho = 1) {
    Item::show($cho, $this);

    Keyboard::listener(function($code, $keyboard) use (&$cho) {
      if (!in_array($code, [-65, -66, -67, -68]))
        return;

      switch ($code) {
        default:
        case -68:
          $cho = 0;
        case -67:
          return $keyboard->stop();
          break;
        
        case -65: --$cho; break;
        case -66: ++$cho; break;
      }

      Item::show($cho, $this);
    })->run();

    if (!isset($this->items[$cho - 1]))
      return $this->back();

    return $this->items[$cho - 1]->choice();
  }
}

class Init {

    // function dirsMaker($dirs, $path = '') {
    //   foreach ($dirs as $dir => $files) {
    //     echo "\n";

    //     $title = "\r" . sr(" ", 4) . cliColor("➤ ", "c2") . '檢查 ' . cliColor($path . $dir, 'W') . ' 目錄';
    //     echo $title . cliColor("… ", "w0");

    //     if (is_file(PATH . $path . $dir)) {
    //       echo $title . cliColor(" ─ ", "N") . cliColor('失敗', "r");
    //       echo "\n";
    //       echo sr(" ", 5) . cliColor(" ◎ ", "p2") . '存在' . cliColor('相同名稱', 'W') . '的' . cliColor('檔案', 'W') . '！';
    //       echo "\n";
    //       echo "\n";
    //       exit(1);
    //     }
        

    //     if (!file_exists(PATH . $path . $dir)) {
    //       echo $title . cliColor(" ─ ", "N") . cliColor('不存在', "P");
    //       echo "\n";

    //       $title = "\r" . sr(" ", 6) . cliColor("➤ ", "c2") . '建立 ' . cliColor($path . $dir, 'W') . ' 目錄';
    //       echo $title . cliColor("… ", "w0");
    //       umaskMkdir($path . $dir, 0777, true);
    //       echo $title . cliColor(" ─ ", "N") . cliColor("完成", "g");
    //     } else {
    //       echo $title . cliColor(" ─ ", "N") . cliColor("存在", "g");
    //     }
    //     echo "\n";


    //     $title = "\r" . sr(" ", 6) . cliColor("➤ ", "c2") . '檢查 ' . cliColor($path . $dir, 'W') . ' 目錄可否寫入';
    //     echo $title . cliColor("… ", "w0");

    //     if (!is_writable(PATH . $path . $dir)) {
    //       echo $title . cliColor(" ─ ", "N") . cliColor("失敗", "r");
    //       echo "\n";
    //       exit(1);
    //     }
    //     echo $title . cliColor(" ─ ", "N") . cliColor("完成", "g");
    //     echo "\n";

    //     foreach ($files as $name => $content) {
    //       if (is_array($content)) {
    //         dirsMaker([$name => $content], $dir . DIRECTORY_SEPARATOR);
    //       } else {
    //         $title = "\r" . sr(" ", 6) . cliColor("➤ ", "c2") . (file_exists(PATH . $path . $dir . DIRECTORY_SEPARATOR . $name) ? "取代 " : "建立 ") . cliColor($path . $dir . DIRECTORY_SEPARATOR . $name, 'W') . " 檔案";
    //         echo $title . cliColor("… ", "w0");

    //         if (!fileWrite(PATH . $path . $dir . DIRECTORY_SEPARATOR . $name, $content, 'w+b')) {
    //           echo $title . cliColor(" ─ ", "N") . cliColor("失敗", "r");
    //           echo "\n";
    //           echo sr(" ", 5) . cliColor(" ◎ ", "p2") . "寫入檔案失敗！";
    //           echo "\n";
    //           echo "\n";
    //           exit(1);
    //         }

    //         echo $title . cliColor(" ─ ", "N") . cliColor("完成", "g");
    //         echo "\n";
    //       }
    //     }
    //   }
    // };

  private static function env($env) {
    $dirs = [
      'App' => [
        'Func' => [],
        'Lib' => [],
      ],
      'Config' => [
        $env => [
          'Database.php' => ''
          'Deploy.php' => ''
          'Model.php' => ''
        ]
      ],
      'Migration' => [],
      'System' => [
        'Env.php | replace' => ''
      ],
      'File' => [
        '.release' => [],
        'Log' => [],
        'Cache' => [],
        'Session' => [],
        'Tmp' => [],
      ],
      'Public' => [
        'Storage' => []
      ]
    ];
  }

  public static function development() {
    
  }
}

$initDevelopmentEnv = Check::create('開發環境', 'Development Environment');
$initDevelopmentEnv->appendTip('建立 System 下的 Env.php 檔案。')
                   ->appendTip('建立 App 下的 Func 與 Lib 目錄。')
                   ->appendTip('建立 File 目錄與其下的 Log, Cache, Session, Tmp 目錄。')
                   ->appendTip('建立 Public 下的 Storage 目錄。')
                   ->appendTip('建立 Config 下的 Development 目錄。')
                   ->appendTip('過程中若要離開 Maple 請直接按下鍵盤上的 control + c')
                   ->thing('Init::development');

$initTestingEnv = Check::create('測試環境', 'Testing Environment');
$initStagingEnv = Check::create('預備環境', 'Staging Environment');
$initProductionEnv = Check::create('正式環境', 'Production Environment');

$initEnvMenu = Menu::create('初始專案環境', 'Init Project Environment')
               ->appendItem($initDevelopmentEnv)
               ->appendItem($initTestingEnv)
               ->appendItem($initStagingEnv)
               ->appendItem($initProductionEnv);

$createMigration = Input::create('新增 Migration 檔案', 'Create Migration');
$createMigration->appendTip('建立「File」目錄。')
                ->appendInput('輸入名稱', '/[0-9A-Za-z-_ ]+/')
                ->thing(function() {
                  echo '<meta http-equiv="Content-type" content="text/html; charset=utf-8" /><pre>';
                  var_dump(func_get_args());
                  exit();
                });

$createModel = Input::create('新增 Model 檔案', 'Create Model');
$createModel->setCheck()
            ->appendTip('建立「File」目錄。')
            ->appendInput('輸入名稱', '/[0-9A-Za-z-_ ]+/')
            ->appendInput('輸入欄位 1', '/[0-9A-Za-z-_ ]?/')
            ->appendInput('輸入欄位 2', '/[0-9A-Za-z-_ ]?/')
            ->setValidator(function() {
              func_get_args();
              // return 'aaaaaa';
            })
            ->thing(function() {
              func_get_args();
            });

$createFileMenu = Menu::create('新增檔案', 'Create Migration or Model')
               ->appendItem($createMigration)
               ->appendItem($createModel);

$migrationToLatest  = Check::create('更新至最新版', 'Update to the latest version');
$migrationToLatest->thing(function() {
              func_get_args();
            });
$migrationToVersion = Input::create('輸入更新版號', 'Enter the version number');
$migrationToVersion->appendTip('建立「File」目錄。')
                   ->appendInput('輸入名稱', '/[0-9]+/')
                   ->thing(function() {
                     var_dump(func_get_args());
                   });

$migrationMenu = Menu::create('執行 Migration', 'Migration Update')
               ->setSubitems([
                Subitme::create(true, 99, 'create Admin', '2019-12-13 12:23:34'),
                Subitme::create(true, 100, 'create Admin', '2019-12-13 12:23:34'),
                Subitme::create(true, 101, 'create Adm dsad daoledaoledaoledaoledaoledaoledaole', '2019-12-13 12:33:34'),
                Subitme::create(true, 102, 'create Adm dsad daole', '2019-12-13 12:33:34'),
                Subitme::create(false, 103, 'create Adm dsad daole', '2019-12-13 12:33:34'),
                Subitme::create(false, 104, 'create Adm dsad daole', '2019-12-13 12:33:34'),
              ])
               ->appendItem($migrationToLatest)
               ->appendItem($migrationToVersion);

$cleanCache = Check::create('清除 Cache 目錄', 'Clean Cache Dir');
$cleanTmp   = Check::create('清除 Tmp 目錄', 'Clean Tmp Dir');
$cleanMenu = Menu::create('清除檔案目錄', 'Clean Cache')
               ->appendItem($cleanCache)
               ->appendItem($cleanTmp);

$deployTesting    = Check::create('部署測試', 'Deploy Testing');
$deployStaging    = Check::create('部署預備', 'Deploy Staging');
$deployProduction = Check::create('部署正式', 'Deploy Production');
$deployMenu = Menu::create('部署專案', 'Deploy Project')
               ->appendItem($deployTesting)
               ->appendItem($deployStaging)
               ->appendItem($deployProduction);

$mainMenu = Menu::create('主選單', 'Main menu')
                ->appendItem($initEnvMenu)
                ->appendItem($createFileMenu)
                ->appendItem($migrationMenu)
                ->appendItem($cleanMenu)
                ->appendItem($deployMenu);
// echo '<meta http-equiv="Content-type" content="text/html; charset=utf-8" /><pre>';
// var_dump(range('a', 'z'));
// var_dump(range('A', 'Z'));
// var_dump(range('=', '-'));
// exit();
$mainMenu->choice();
// Display::error('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');