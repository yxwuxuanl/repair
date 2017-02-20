<?php 

namespace app\controllers;

use app\filters\LoginFilter;
use app\filters\PrivilegeFilter;
use app\models\Event;
use yii\web\Controller;
use app\behaviors\Response;

class EventController extends Controller
{

	public function behaviors()
	{
		return [Response::className()];

		return [
			'Login' => [
				'class' => LoginFilter::className()
			],
			'Privilege' => [
				'class' => PrivilegeFilter::className(),
				'privilege' => P_SYSTEM_EVENT
			],
			Response::className()
		];
	}

	public function actionGetEvents()
	{
		return $this->success(Event::all());
	}

	public function actionAdd($ename){
		$model = new Event();
		$model->scenario = 'add';
		$eid = 'e_' . substr(uniqid(),-8);
		$model->event_id = $eid;
		$model->event_name = $ename;

		if(!$model->validate()) return $this->fail(REP_INVALD_ARGS);
		if(!$model->insert()) return $this->fail(REP_MODEL_SAVE_FAIL);

		return $this->success(['eid' => $eid]);
	}

	public function actionDelete($eid){
		if(!Event::checkEid($eid)){
			return $this->fail(REP_INVALID_ARGS);
		}

		if(!Event::deleteEvent($eid)) return $this->fail(REP_MODEL_SAVE_FAIL);
		return $this->success();
	}


	public function actionRename($eid,$ename){

		if(!Event::checkEid($eid)) return $this->fail(REP_INVALID_ARGS);

		$model = Event::findOne($eid);
		$model->scenario = 'rename';
		$model->event_name = $ename;

		if(!$model->validate()) return $this->fail(REP_MODEL_VALIDATE_FAIL);
		if(!$model->update()) return $this->fail(REP_MODEL_SAVE_FAIL);

		return $this->success();
	}
}