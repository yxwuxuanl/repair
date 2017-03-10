<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2017/2/1
 * Time: 上午12:21
 */

namespace app\controllers;

class RoleController
{
	const NORMAL = 'normal';
	const GROUP_ADMIN = 'group_admin';
	const SYSTEM_ADMIN = 'system_admin';

	public static $map = [
		self::NORMAL => [
			'indexController' => 'index/normal',
			'account' => 1,
			'task' => 1
		],
		self::GROUP_ADMIN => [
			'indexController' => 'index/normal',
			'account' => 1,
			'task' => 3,
			'group' => 2
		],
		self::SYSTEM_ADMIN => [
			'account' => 3,
			'group' => 1,
			'system' => 1
		],
	];

	public static function is($role)
	{
		if(is_array($role))
		{
			foreach($role as $r)
			{
				if(static::is($r))
				{
					return true;
				}
			}
			return false;
		}else{
			return \Yii::$app->getSession()->get('role') == $role;
		}
	}

	public static function getRole()
	{
		return \Yii::$app->getSession()->get('role');
	}
}