<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2017/2/27
 * Time: 下午10:19
 */

namespace app\controllers;
use app\filters\CustomResponseFilter;
use app\models\Allocation;
use yii\web\Controller;

class AllocationController extends Controller
{
	public function behaviors()
	{
		return [
			'response' => [
				'class' => CustomResponseFilter::className()
			],
		];
	}

	public function actionAdd($event,$assign,$level)
	{
		return Allocation::create(GroupController::getGroup(),$event,$assign,$level);
	}

	public function actionGetRule()
	{
		return Allocation::getGroupRule(GroupController::getGroup());
	}

	public function actionRemove($eventId)
	{
		return (string) Allocation::remove($eventId);
	}
}