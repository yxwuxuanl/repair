<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2016/11/15
 * Time: 下午3:56
 */

namespace app\controllers;
use app\behaviors\NoCsrf;
use app\filters\CustomResponseFilter;
use app\formatter\Status;
use app\models\CustomLabel;
use app\models\Event;
use app\models\Task;
use app\models\Zone;
use yii\web\Controller;

class ReportController extends Controller
{
    public function actionIndex()
    {
        return $this->render('index.html');
    }

	public function actionGetInfo($zoneId)
	{
		if(!Zone::checkZid($zoneId,true) || !Zone::isExist($zoneId)) return Status::INVALID_ARGS;

		$data = [
			'childZone' => Zone::getSubs($zoneId),
			'events' => Zone::getEvent($zoneId,true),
			'custom' => CustomLabel::get($zoneId)
		];

		return $data;
	}

	public function actionPost()
	{
		$request = \Yii::$app->getRequest();

		$data = [
			'reporter_id' => $request->post('reporter_id',null),
			'reporter_name' => $request->post('reporter_name',null),
			'reporter_tel' => $request->post('reporter_tel',null),
			'zone_id' => $request->post('zone_id',null),
			'event_id' => $request->post('event_id',null),
			'custom' => $request->post('custom',null),
			'describe' => $request->post('describe',null)
 		];

		return Task::add($data);
	}

	public function actionGetRow($stuNumber)
	{
		return Task::getRow($stuNumber);
	}

    public function behaviors()
	{
		return [
			'response' => [
				'class' => CustomResponseFilter::className(),
				'only' => ['post','get-info','get-row']
			],
			NoCsrf::className()
		];
	}
}