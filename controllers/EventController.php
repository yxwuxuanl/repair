<?php 

namespace app\controllers;

use app\filters\CustomResponseFilter;
use app\filters\LoginFilter;
use app\formatter\Status;
use app\models\Event;
use yii\base\Exception;
use yii\web\Controller;
use app\behaviors\Response;

class EventController extends Controller
{
	public function behaviors()
	{
		return [
			'response' => [
				'class' => CustomResponseFilter::className()
			]
		];
	}

	public function actionGetEvents()
	{
		return Event::all();
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