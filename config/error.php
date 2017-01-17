<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2017/1/14
 * Time: 下午6:46
 */

$errors = [
	'1' => 'MODEL_NOT_FOUND',
	'2' => 'EMPTY_RESULT',
	'3' => 'MODEL_VALIDATE_FAIL',
	'4' => 'INVALID_ARGS',
	'5' => 'MODEL_SAVE_FAIL'
];

foreach($errors as $value => $name){
	define('REP_' . $name,$value);
}

return $errors;