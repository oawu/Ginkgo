<?php

if (!function_exists("sr")) {
  function sr($input, $multiplier) {
    return str_repeat($input, $multiplier);
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

  // public static function color($str, $fCode = null, $bCode = null) {
  //   $xterm = new Xterm();
  //   return $xterm->color($fCode)->background($bCode)->str($str);
  // }
}
class Display {
  const MAX_LEN = 80;
// 6+7+7+8+8+10+8+8+7+7+6

  private static function strSplitWords($str, $max = null) {
    $chars = array_filter(preg_split('//u', $str), function($t) { return $t !== ''; });
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

      return [$str, array_sum(array_map(function($t) {
        return mb_strwidth($t);
      }, array_filter(preg_split('//u', $str), function($t) { return $t !== ''; })))];
    }, $lines);
  }

  public static function error($content, $titile = '錯誤') {
    $lines = self::lines($content, Display::MAX_LEN - 8);
    $titleLen = array_sum(array_map(function($t) { return strlen($t) == 3 ? 2 : 1; }, array_filter(preg_split('//u', $titile), function($t) { return $t !== ''; })));

    $lineColor = new Xterm();
    $lineColor->color(Xterm::WHITE);
    $lineColor->background(Xterm::RED);

    $titleColor = new Xterm();
    $titleColor->color(Xterm::YELLOW);
    $titleColor->background(Xterm::RED);
    $titleColor->blod();

    echo "\n";
    echo $lineColor->str(' ╭') . $lineColor->str('─') . $titleColor->str(' ' . $titile . ' ') . $lineColor->str(sr('─', Display::MAX_LEN - $titleLen - 7)) . $lineColor->str('╮ ');
    echo "\n";
    echo $lineColor->str(' │') . $lineColor->str(sr(' ', Display::MAX_LEN - 4)) . $lineColor->str('│ ');
    echo "\n";
    foreach ($lines as $line) {
      echo $lineColor->str(' │') . $lineColor->str('  ' . $line[0] . '  ' . sr(' ', Display::MAX_LEN - $line[1] - 8)) . $lineColor->str('│ ');
      echo "\n";
    }
    echo $lineColor->str(' ╰') . $lineColor->str(sr('─', Display::MAX_LEN - 4)) . $lineColor->str('╯ ');
    echo "\n";
    echo "\n";
    exit(1);
  }
}

$rows = array_map(function() {
  return array_fill(0, 10 * 2, 124);
}, range(0, 9 * 2));

$code1 = [16, 17, 18, 19, 20];
$code2 = [21];

// $code1 = [21, 20, 19, 18, 17];
// $code2 = [16];

$color = new Xterm();
for ($i = 0; $i < count($rows); $i++) { 
  for ($j = 0; $j < count($rows[$i]); $j++) { 
    if ($i < 5 && $j < 5) {
      $color->background($code1[min($i, $j)]);
    } else if ($i < 5 && $j > count($rows[$i]) - 5) {
      $color->background($code1[min($i, count($rows[$i]) - $j)]);
    } else if ($i > count($rows) - 5 && $j < 5) {
      $color->background($code1[min(count($rows) - $i, $j)]);
    } else if ($i > count($rows) - 5 && $j > count($rows[$i]) - 5) {
      $color->background($code1[min(count($rows) - $i, count($rows[$i]) - $j)]);
    } else if (!($i < 5) && !($i > count($rows) - 5) && $j < 5) {
      $color->background($code1[$j]);
    } else if (!($i < 5) && !($i > count($rows) - 5) && $j > count($rows[$i]) - 5) {
      $color->background($code1[count($rows[$i]) - $j]);
    } else if (!($j < 5) && !($j > count($rows[$i]) - 5) && $i < 5) {
      $color->background($code1[$i]);
    } else if (!($j < 5) && !($j > count($rows[$i]) - 5) && $i > count($rows) - 5) {
      $color->background($code1[count($rows) - $i]);
    } else {
      $color->background($code2[0]);
    }
    echo $color->str('  ');
  }
  echo "\n";
}
exit();


// $code2 = [196];
// $code3 = [160, 124, 88, 52, 0];

// $color = new Xterm();
// $rows = range(0, 16);
// $first5 = array_splice($rows, 0, 5);
// $last5 = array_splice($rows, -5, 5);

// $color = new Xterm();
// foreach ($first5 as $i => $value) {
//   $color->background($code1[$i]);
//   echo $color->str(' ');
//   echo "\n";
// }
// foreach ($rows as $i => $value) {
//   $color->background($code2[0]);
//   echo $color->str(' ');
//   echo "\n";
// }
// foreach ($last5 as $i => $value) {
//   $color->background($code3[$i]);
//   echo $color->str(' ');
//   echo "\n";
// }

// for ($i = 0; $i < $row; $i++) { 
//   for ($j = 0; $j < 80; $j++) { 
//     if ($i < $row / 2 || $i > $row / 2)
//       $color->background($code[$i < $row / 2 ? $i : ($row - $i)]);

//     echo $color->str(' ');
//   }
//   echo "\n";
// }





// // Display::error('aaaa');
// $color = new Xterm();
// foreach ([1,2,2,2,2,] as $key => $value) {
  
// for ($i = 0; $i < 80; $i++) { 
//   if ($i < 6 || $i > 75)
//     $color->background($code[$i < 76 ? $i : (80 - $i)]);
//   else
//     $color->background($code[5]);
//   echo $color->str(' ');
// }

// echo "\n";
// }
// // foreach ([8, 9, 11, 11, 12, 11, 11, 9, 8] as $i => $len) {
// //   $color->background($code[$i]);
// //   echo $color->str(sr(' ', $len));
// // }