<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2017/1/30
 * Time: 上午12:57
 */

namespace app\formatter;

class Status
{
	const SUCCESS = '1';
	const INVALID_ARGS = '-1';
	const DATABASE_SAVE_FAIL = '-2';
	const OTHER_ERROR = '0';
	const INVALID_LOGIN_INFO = '-3';
	const ACCOUNT_EXIST = '-4';
	const GROUP_EXIST = '-5';

	static $describe = [
		'1' => 'SUCCESS',
		'0' => 'OTHER_ERROR',
		'-1' => 'INVALID_ARGS',
		'-2' => 'DATABASE_SAVE_FAIL',
		'-3' => 'INVALID_LOGIN_INFO',
		'-4' => '账户已经存在',
		'-5' => '组已经存在'
	];
}