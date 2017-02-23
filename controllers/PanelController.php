<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2017/2/1
 * Time: 上午12:23
 */

namespace app\controllers;

use app\controllers\RoleController as Role;

class PanelController
{
	public static $panels = [
		'system' => [
			'label' => '系统设置',
			'1' => [
				['区域设置','zone'],
				['事件设置','event']
			]
		],
		'account' => [
			'label' => '帐号管理',
			'1' => [
				['修改密码','changepwd'],
				['退出登录','loginout'],
			],
			'2' => [
				['管理帐号','manage'],
			]
		],
		'group' => [
			'label' => '组管理',
			'1' => [
				['管理组','manage']
			],
			'2' => [
				['组成员','member'],
			],
		],
		'task' => [
			'label' => '任务',
			'1' => [
				['查看分配的任务','assign'],
				['查看已完成的任务','done'],
			],
			'2' => [
				['查看组的未完成的任务','group'],
				['查看组已完成的任务','group-done'],
				['手动分配任务','manual-assign']
			],
		]
	];

	public static function getPanels($panel,$level)
	{
		$panels = static::$panels[$panel];
		$panels_ = [];

		for($i = 1 ; $i <= $level ; $i = $i << 1)
		{
			if($i & $level)
			{
				$panels_ = array_merge($panels_,$panels[$i]);
			}
		}

		return $panels_;
	}

	public static function getLabel($name)
	{
		return static::$panels[$name]['label'];
	}

	public static function getPanelsByRole()
	{
		$role = \Yii::$app->getSession()->get('role');
		$def = Role::$map[$role];

		unset($def['indexController']);

		$panels = [];

		foreach($def as $item => $value)
		{
			$panels[$item] = [
				'label' => static::getLabel($item),
				'panels' => static::getPanels($item,$value)
			];
		}

		return $panels;
	}
}