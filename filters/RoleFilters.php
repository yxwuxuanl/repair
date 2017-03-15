<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2017/1/24
 * Time: 下午11:13
 */

namespace app\filters;

use yii\base\ActionFilter;
use app\controllers\RoleController as Role;
use yii\helpers\ArrayHelper;

class RoleFilters extends ActionFilter
{
	public $rules = null;

	public function beforeAction($action)
	{
		$flag = $this->judge($action->id);

		if(!$flag)
		{
			\Yii::$app->getResponse()->statusCode = 403;
		}

		return $flag;
	}

	public function judge($actionId)
	{
		$rules = $this->rules;

		if($rules === null) return true;
		if(is_string($rules)) return Role::is($rules);

		foreach($rules as $action => $role)
		{
			if($actionId == $action) return Role::is($role);
		}

		return true;
	}
}