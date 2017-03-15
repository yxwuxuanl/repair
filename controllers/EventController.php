<?php 

namespace app\controllers;

use app\filters\CustomResponseFilter;
use app\filters\LoginFilter;
use app\filters\RoleFilters;
use app\models\Event;
use yii\web\Controller;
use app\controllers\RoleController as Role;

class EventController extends Controller
{
	public function behaviors()
	{
		return [
			'response' => [
				'class' => CustomResponseFilter::className()
			],
			'login' => [
				'class' => LoginFilter::className(),
				'only' => ['add','remove','rename']
			],
			'role' => [
				'class' => RoleFilters::className(),
				'rules' => [
					'add' => Role::SYSTEM_ADMIN,
					'remove' => Role::SYSTEM_ADMIN,
					'rename' => Role::SYSTEM_ADMIN
				]
			]
		];
	}

	public function actionGetEvents()
	{
		return Event::find()->asArray()->all();
	}

	public function actionAdd($eventName)
	{
		return Event::create($eventName);
	}

	public function actionRemove($eventId)
	{
		return (string) Event::remove($eventId);
	}

	public function actionRename($eventName,$eventId)
	{
		return (string) Event::rename($eventId,$eventName);
	}

	public function actionGetNoAssign()
	{
		return Event::getNoAssign();
	}
}