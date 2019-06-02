<?php

class Str {
  static public function splitStr($str) {
    return array_filter(preg_split('//u', $str), function($t) { return $t !== ''; });
  }
  static public function width($str) {
    return array_sum(array_map(function($t) { return mb_strwidth($t); }, Str::splitStr($str)));
  }
  static public function repeat($multiplier = 1, $input = ' ') {
    return str_repeat($input, $multiplier);
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
      if (false !== @stream_select($reads, $writes, $except, null, null))
        is_callable($this->closure)
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
  const MAX_LEN = 56;
  const LN      = "\n";

  private static function strSplitWords($str, $max = null) {
    $chars = Str::splitStr($str);
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

  private static function tokensLen($words) {
    $len = 0;
    for ($i = 0, $c = count($words); $i < $c; $i++)
      if (!$i) $len += $words[$i]['len'];
      else if ($words[$i - 1]['chinese'] && $words[$i]['chinese']) $len += $words[$i]['len'];
      else $len += $words[$i]['len'] + 1;
    return $len;
  }

  private static function lines($str, $max = null) {
    $words = self::strSplitWords($str, $max);
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
    $lines = self::lines($content, Display::MAX_LEN - 8);
    $titleLen = array_sum(array_map(function($t) { return strlen($t) == 3 ? 2 : 1; }, Str::splitStr($title)));

    $lineColor = new Xterm();
    $lineColor->color(Xterm::WHITE);
    $lineColor->background(Xterm::RED);

    $titleColor = new Xterm();
    $titleColor->color(Xterm::YELLOW);
    $titleColor->background(Xterm::RED);
    $titleColor->blod();

    echo "\n";
    echo $lineColor->str(' ╭') . $lineColor->str('─') . $titleColor->str(' ' . $title . ' ') . $lineColor->str(Str::repeat('─', Display::MAX_LEN - $titleLen - 7)) . $lineColor->str('╮ ');
    echo "\n";
    echo $lineColor->str(' │') . $lineColor->str(Str::repeat(' ', Display::MAX_LEN - 4)) . $lineColor->str('│ ');
    echo "\n";
    foreach ($lines as $line) {
      echo $lineColor->str(' │') . $lineColor->str('  ' . $line[0] . '  ' . Str::repeat(' ', Display::MAX_LEN - $line[1] - 8)) . $lineColor->str('│ ');
      echo "\n";
    }
    echo $lineColor->str(' ╰') . $lineColor->str(Str::repeat('─', Display::MAX_LEN - 4)) . $lineColor->str('╯ ');
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

abstract class Item {
  protected $title, $subtitle;
  protected $parent, $isHover = false;

  public function __construct($title, $subtitle) {
    $this->setTitle($title)
         ->setSubtitle($subtitle);
  }
  
  public function title() { return $this->title; }
  public function subtitle() { return $this->subtitle; }

  public function titleWidth() { return array_sum(array_map(function($t) { return strlen($t) == 3 ? 2 : 1; }, Str::splitStr($this->title))); }
  public function subtitleWidth() { return array_sum(array_map(function($t) { return strlen($t) == 3 ? 2 : 1; }, Str::splitStr($this->subtitle))); }

  public function titleLen() { return array_sum(array_map('strlen', Str::splitStr($this->title))); }
  public function subtitleLen() { return array_sum(array_map('strlen', Str::splitStr($this->subtitle))); }

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

  public function __toString() {
    if (!$this->parent)
      return '';
    $itemsTitleMaxWidth = $this->parent->itemsTitleMaxWidth();
    $spaceCount = $itemsTitleMaxWidth + ($this->titleLen() - $this->titleWidth());
    $repeatSpace = Str::repeat(Display::MAX_LEN - 7 - $itemsTitleMaxWidth - 4 - $this->subtitleLen() - 3);

    $lineColor = new Xterm();
    $lineColor->color(Xterm::L_BLACK);
    $_6 = $lineColor->str('│');

    if ($this->isHover)
      return Str::repeat() . $_6 . Str::repeat() . '➜' . Str::repeat(2) . ($this->index() + 1) . '.' . Str::repeat() . sprintf('%-' . $spaceCount . 's', $this->title) . ' ─ ' . $this->subtitle . $repeatSpace . $_6;
    else
      return Str::repeat() . $_6 . Str::repeat(4) .                       ($this->index() + 1) . '.' . Str::repeat() . sprintf('%-' . $spaceCount . 's', $this->title) . ' ─ ' . $this->subtitle    . $repeatSpace . $_6;
  }

  public static function create($title, $subtitle) {
    return new static($title, $subtitle);
  }
}

class Doing extends Item {
  private $thingFunc;
  private $check;
  public function check($check) {
    $this->check = $check;
    return $this;
  }
  public function thing($thingFunc) {
    $this->thingFunc = $thingFunc;
    return $this;
  }

  public function choice() {
    if (!is_callable($thingFunc = $this->thingFunc))
      return $this->back();
    
    if ($this->check) {
      while (true) {
        echo " ➜ 是否正確[y：沒錯, n：不是]：";
        $input = strtolower(trim(readline()));
        if (in_array($input, ['y', 'n']))
          break;

        echo "\033[1A\33[K";
      }

      exit($input);
    }

    return $thingFunc($this);
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

  private static function show(&$cho, Menu $menu) {
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
    
    foreach ($menu->items() as $i => $item) {
      echo $item->isHover(++$i == $cho);
      echo Display::LN;
    }

    $footer = '[←]離開 [→]進入 [↑]上移 [↓]下移 [h]說明';
    
    $len = Str::width($footer);
    $rs = Str::repeat(Display::MAX_LEN - $len - 7);

    echo Str::repeat() . $_7 . Str::repeat(Display::MAX_LEN - 4, $_5) . $_8; echo Display::LN;
    echo Str::repeat() . $_6 . Str::repeat(3) . $footer . $rs . $_6; echo Display::LN;
    echo Str::repeat() . $_2 . Str::repeat(Display::MAX_LEN - 4, $_5) . $_4; echo Display::LN;
  }

  public function choice(int $cho = 1) {
    Menu::show($cho, $this);

    Keyboard::listener(function($code, $keyboard) use (&$cho) {
      if (!in_array($code, [65, 66, 67, 68]))
        return;

      switch ($code) {
        default:
        case 68:
          $cho = 0;
        case 67:
          return $keyboard->stop();
          break;
        
        case 65: --$cho; break;
        case 66: ++$cho; break;
      }

      Menu::show($cho, $this);
    })->run();

    if (!isset($this->items[$cho - 1]))
      return $this->back();

    return $this->items[$cho - 1]->choice();
  }
}

$initDevelopmentEnv = Doing::create('開發環境', 'Development Environment');
$initDevelopmentEnv->check(true);
$initDevelopmentEnv->thing(function() {
  echo "string";
});

$initTestingEnv     = Doing::create('測試環境', 'Testing Environment');
$initStagingEnv     = Doing::create('預備環境', 'Staging Environment');
$initProductionEnv  = Doing::create('正式環境', 'Production Environment');
$initEnvMenu = Menu::create('初始專案環境', 'Init Project Environment')
               ->appendItem($initDevelopmentEnv)
               ->appendItem($initTestingEnv)
               ->appendItem($initStagingEnv)
               ->appendItem($initProductionEnv);

$createMigration = Doing::create('新增 Migration 檔案', 'Create Migration');
$createModel     = Doing::create('新增 Model 檔案', 'Create Model');
$createFileMenu = Menu::create('新增檔案', 'Create Migration or Model')
               ->appendItem($createMigration)
               ->appendItem($createModel);

$migrationToLatest  = Doing::create('更新至最新版', 'Update to the latest version');
$migrationToVersion = Doing::create('輸入更新版號', 'Enter the version number');
$migrationMenu = Menu::create('執行 Migration', 'Migration Update')
               ->appendItem($migrationToLatest)
               ->appendItem($migrationToVersion);

$cleanCache = Doing::create('清除 Cache 目錄', 'Clean Cache Dir');
$cleanTmp   = Doing::create('清除 Tmp 目錄', 'Clean Tmp Dir');
$cleanMenu = Menu::create('清除檔案目錄', 'Clean Cache')
               ->appendItem($cleanCache)
               ->appendItem($cleanTmp);

$deployTesting    = Doing::create('部署測試', 'Deploy Testing');
$deployStaging    = Doing::create('部署預備', 'Deploy Staging');
$deployProduction = Doing::create('部署正式', 'Deploy Production');
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

$mainMenu->choice();
