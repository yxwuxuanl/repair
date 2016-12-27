<?php

$input = './servicepage.js';
$input_fp = file_get_contents($input);

$matches = [];

preg_match_all('/\/\/ Begin \'(.*?)\'/',$input_fp,$matches);

foreach($matches[1] as $name)
{
    $file = file_get_contents('./' . $name);

    // $input_fp = preg_replace('/\/\/ Begin \\' . $name . '\'(.*)?/');
    // echo '/\/\/ Begin \'' . $name . '\'/' . "\n";
}