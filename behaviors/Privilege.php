<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2016/12/29
 * Time: 下午7:08
 */

namespace app\behaviors;

use yii\base\Behavior;
use yii\base\Controller;

class Privilege extends Behavior
{
	public function events()
	{
		return [
			Controller::EVENT_BEFORE_ACTION => function(){
				\Yii::$app->set('privilege',\Yii::$app->createController('privilege')[0]);
			}
		];
	}
}