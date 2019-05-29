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
  static public function infos($val) {
    return [$val, array_sum(array_map(function($t) { return strlen($t) == 3 ? 2 : 1; }, $tmp = Str::splitStr($val))), array_sum(array_map('strlen', $tmp))];
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

class Menu {

  private static function display(&$cho, $navs, $items) {
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

    $choColor = new Xterm();
    $choColor->color(Xterm::RED);
    $choColor->blod();
    $titleColor = new Xterm();
    $lineColor = new Xterm();
    $lineColor->dim();
    $lineColor->color(Xterm::L_BLACK);
    $subtitleColor = new Xterm();
    $subtitleColor->color(Xterm::L_BLACK);
    $choTitleColor = new Xterm();
    $choTitleColor->color(Xterm::L_CYAN);
    $choLineColor = new Xterm();
    $choLineColor->dim();
    $choLineColor->color(Xterm::CYAN);
    $choSubtitleColor = new Xterm();
    $choSubtitleColor->color(Xterm::CYAN);

    $navs = array_map(function($nav) { return [$nav, array_sum(array_map(function($t) { return strlen($t) == 3 ? 2 : 1; }, Str::splitStr($nav)))]; }, $navs);
    
    $last = array_pop($navs);
    array_push($navs, [Xterm::create($last[0], Xterm::YELLOW), $last[1]]);
    $sp = Str::repeat(Display::MAX_LEN - ((count($navs) - 1) * 2 + array_sum(array_column($navs, 1))) - 7);
    
    echo Str::repeat() . $_6 . Str::repeat(3) . implode(Xterm::create('﹥', Xterm::L_BLACK), array_column($navs, 0)) . $sp . $_6;
    echo Display::LN;
    echo Str::repeat() . $_7 . Str::repeat(Display::MAX_LEN - 4, $_5) . $_8; echo Display::LN;

    foreach ($items as $key => &$val) {
      $val[0] = Str::infos($val[0]);
      $val[1] = Str::infos($val[1]);
      $val[2] = Str::infos(!empty($val[2]) ? $val[2] : '');
      $val[0][1] += ($val[2][1] ? 1 + $val[2][1] : 0);
      $val[0][2] += ($val[2][2] ? 1 + $val[2][2] : 0);
    }

    $xLen = max(array_column(array_column($items, 0), 1));

    $cho <= count($items) || $cho = 1;
    $cho >= 1 || $cho = count($items);

    foreach ($items as $key => $item) {
      $spaceNum = $xLen + ($item[0][2] - $item[0][1]);
      $title = $item[0][0];
      $subTitle = $item[1][0];
      $sr = Str::repeat(Display::MAX_LEN - 7 - $xLen - 4 - strlen($item[1][0]) - 3);

      if (++$key == $cho)
        echo Str::repeat() . $_6 . Str::repeat() . $choColor->str('➜') . Str::repeat(2) . $choTitleColor->str($key . '.' . Str::repeat() . sprintf('%-' . $spaceNum . 's', $item[0][0])) . $choLineColor->str(' ─ ') . $choSubtitleColor->str($subTitle) . $sr . $_6;
      else
        echo Str::repeat() . $_6 . Str::repeat(4) .                              $titleColor->str($key . '.' . Str::repeat() . sprintf('%-' . $spaceNum . 's', $item[0][0])) . $lineColor->str(' ─ ')    . $subtitleColor->str($subTitle)    . $sr . $_6;
      echo Display::LN;
    }

    $footer = '[←]離開 [→]進入 [↑]上移 [↓]下移 [h]說明';
    
    $len = Str::width($footer);
    $rs = Str::repeat(Display::MAX_LEN - $len - 7);

    echo Str::repeat() . $_7 . Str::repeat(Display::MAX_LEN - 4, $_5) . $_8; echo Display::LN;
    echo Str::repeat() . $_6 . Str::repeat(3) . $footer . $rs . $_6; echo Display::LN;
    echo Str::repeat() . $_2 . Str::repeat(Display::MAX_LEN - 4, $_5) . $_4; echo Display::LN;
  }

  private static function cho(&$cho, $navs, $items) {
    self::display($cho, $navs, $items);

    Keyboard::listener(function($code, $keyboard) use (&$cho, $navs, $items) {
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

      self::display($cho, $navs, $items);
    })->run();

    return $cho;
  }

  public static function env($cho = 1) {
    $cho = self::cho($cho, ['主選單', '初始專案環境'], [
      ['開發環境', 'Development Environment'],
      ['測試環境', 'Testing Environment'],
      ['預備環境', 'Staging Environment'],
      ['正式環境', 'Production Environment'],
    ]);

    switch ($cho) {
      case 1:  echo "開發環境";; break;
      case 2:  echo "測試環境";; break;
      case 3:  echo "預備環境";; break;
      case 4:  echo "正式環境";; break;
      default: Menu::main(1); break;
    }
  }

  public static function create($cho = 1) {
    $cho = self::cho($cho, ['主選單', '新增檔案'], [
      ['新增 Migration 檔案', 'Create Migration'],
      ['新增 Model 檔案', 'Create Model'],
    ]);

    switch ($cho) {
      case 1:  echo "新增 Migration ";; break;
      case 2:  echo "新增 Model ";; break;
      default: Menu::main(2); break;
    }
  }

  public static function migration($cho = 1) {
    $cho = self::cho($cho, ['主選單', '執行 Migration'], [
      ['更新至最新版', 'Update to the latest version'],
      ['輸入更新版號', 'Enter the version number'],
    ]);

    switch ($cho) {
      case 1:  echo "更新至最新版 ";; break;
      case 2:  echo "輸入更新版號 ";; break;
      default: Menu::main(3); break;
    }
  }

  public static function clean($cho = 1) {
    $cho = self::cho($cho, ['主選單', '清除檔案目錄'], [
      ['清除 Cache 目錄', 'Clean Cache Dir'],
      ['清除 Tmp 目錄', 'Clean Tmp Dir'],
    ]);

    switch ($cho) {
      case 1:  echo "清除 Cache 目錄 ";; break;
      case 2:  echo "清除 Tmp 目錄 ";; break;
      default: Menu::main(4); break;
    }
  }

  public static function deploy($cho = 1) {
    $cho = self::cho($cho, ['主選單', '部署專案'], [
      ['部署測試', 'Deploy Testing'],
      ['部署預備', 'Deploy Staging'],
      ['部署正式', 'Deploy Production'],
    ]);

    switch ($cho) {
      case 1:  echo "部署測試 ";; break;
      case 2:  echo "部署預備 ";; break;
      case 3:  echo "部署正式 ";; break;
      default: Menu::main(5); break;
    }
  }

  public static function main($cho = 1) {
    $cho = self::cho($cho, ['主選單'], [
      ['初始專案環境', 'Init Project Environment'],
      ['新增檔案', 'Create Migration or Model'],
      ['執行 Migration', 'Migration Update'],
      ['清除檔案目錄', 'Clean Cache'],
      ['部署專案', 'Deploy Project'],
    ]);

    switch ($cho) {
      case 1:  Menu::env(); break;
      case 2:  Menu::create(); break;
      case 3:  Menu::migration(); break;
      case 4:  Menu::clean(); break;
      case 5:  Menu::deploy(); break;
      default: break;
    }
  }
}

Menu::main();
