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
		return Task::create(\Yii::$app->getRequest()->get());
	}

	public function actionGetResult($stuNumber)
	{
		return Task::queryReportRow($stuNumber);
	}

    public function behaviors()
	{
		return [
			'response' => [
				'class' => CustomResponseFilter::className(),
				'only' => ['post','get-info','get-row','get-result']
			],
			NoCsrf::className()
		];
	}
}