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
		$row = Event::all();

		if(empty($row))
		{
			return Status::SUCCESS;
		}else{
			return $row;
		}
	}

	public function actionAdd($ename){
		$model = new Event();
		$model->scenario = 'add';
		$eid = 'e_' . substr(uniqid(),-8);
		$model->event_id = $eid;
		$model->event_name = $ename;

		if(!$model->validate()) return Status::INVALID_ARGS;

		try
		{
			$model->insert();
		}catch(Exception $e)
		{
			return Status::EVENT_EXIST;
		}

		return ['eid' => $eid];
	}

	public function actionDelete($eid)
	{
		if(!Event::checkEid($eid)) return Status::INVALID_ARGS;
		$ar = Event::findOne(['event_id' => $eid]);

		if($ar === NULL) return Status::INVALID_ARGS;

		if($ar->delete())
		{
			return Status::SUCCESS;
		}

		return Status::DATABASE_SAVE_FAIL;
	}


	public function actionRename($eid,$ename){

		if(!Event::checkEid($eid)) return Status::INVALID_ARGS;

		$model = Event::findOne(['event_id' => $eid]);
		$model->scenario = 'rename';
		$model->event_name = $ename;

		if(!$model->validate()) return Status::INVALID_ARGS;

		try
		{
			$model->update();
		}catch (Exception $e)
		{
			return Status::EVENT_EXIST;
		}

		return Status::SUCCESS;
	}

	public function actionGetNoAssign()
	{
		return Event::getNoAssign();
	}
}