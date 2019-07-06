<?php

function func($a) {
  $a->name = 'OA';
}

class Book {
  public $name;
}

$a = Book();
$a->name = 'apple';
func($a);

echo $a;