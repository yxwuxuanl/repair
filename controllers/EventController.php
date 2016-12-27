<?php 

namespace app\controllers;

use app\filters\LoginFilter;
use app\filters\PrivilegeFilter;
use app\models\Event;
use yii\web\Controller;
use yii\filters\VerbFilter;

class EventController extends Controller
{
	public function actionGet()
	{
		\Yii::$app->response->format = 'json';

		return array_merge(['status' => 1],Event::all());
	}
}