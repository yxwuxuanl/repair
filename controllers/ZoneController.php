<?php

namespace app\controllers;

use app\behaviors\Response;
use app\filters\CustomResponseFilter;
use app\filters\LoginFilter;
use app\filters\PrivilegeFilter;
use app\formatter\Status;
use app\models\Event;
use app\models\ReportLabel;
use app\models\zeMap;
use app\models\Zone;
use yii\web\Controller;
use yii\filters\VerbFilter;

class ZoneController extends Controller
{
    public function behaviors()
    {
        return [
           'login' => [
               'class' => LoginFilter::className(),
			   'only' => ['add','rename','delete','remove-event']
           ],
			'response' => [
				'class' => CustomResponseFilter::className()
			],
        ];
    }

    public function actionGetParent()
	{
		$model = new Zone();
		$data = $model->getParent();

		if(!empty($data))
		{
			return $data;
		}else{
			return Status::OTHER_ERROR;
		}
	}

    public function actionRename($zid,$zone_name)
    {
        if(!Zone::checkZid($zid)) return Status::INVALID_ARGS;

        $model = Zone::findOne($zid);

        $model->zone_name = $zone_name;
        $model->scenario = 'rename';

        if(!$model->validate()) return Status::INVALID_ARGS;

        if(!$model->update()){
        	return Status::DATABASE_SAVE_FAIL;
        }else{
        	return Status::SUCCESS;
        }
    }

    public function actionDelete($zid)
    {
        $model = new Zone();
        $model->scenario = 'delete';
        $model->zone_id = $zid;

        if(!$model->validate()) return Status::INVALID_ARGS;

        if($model->deleteZone()){
        	return Status::SUCCESS;
        }else{
        	return Status::DATABASE_SAVE_FAIL;
        }
    }

    public function actionAdd($name,$parent = null)
    {
        $model = new Zone();
        $model->scenario = 'add';

        $usableId = $model->getUsableId($parent);

        if(!$usableId) return Status::INVALID_ARGS;
            
        $model->zone_id = $usableId;
        $model->zone_name = $name;

        if(!$model->validate()) return Status::INVALID_ARGS;
        if(!$model->save()) return Status::DATABASE_SAVE_FAIL;

		if($parent === null){
			zeMap::addZone($usableId);
		}

        return ['id' => $usableId];
    }

    public function actionGetSubs($zid)
    {
        $model = new Zone();
        $model->scenario = 'necessaryParent';
        $model->zone_id = $zid;

        if(!$model->validate()) return Status::INVALID_ARGS;

        $result = $model->getSubs();

        if(!empty($result))
		{
			return $result;
		}else{
        	return Status::OTHER_ERROR;
		}
    }

    public function actionGetEvents($zid,$onlyIn = false)
    {
        if(!Zone::checkZid($zid) || !($row = zeMap::getEvents($zid,$onlyIn))) return Status::INVALID_ARGS;
        return $row;
    }

    public function actionRemoveEvent($zid,$eid)
	{
		if(!Zone::checkZid($zid) || !Event::checkEid($eid)) return Status::INVALID_ARGS;
		if(!zeMap::deleteEvent($eid,$zid)) return Status::DATABASE_SAVE_FAIL;
		return Status::SUCCESS;
    }

    public function actionGetLabel($zid)
    {
		if(!Zone::checkZid($zid,true)) return Status::INVALID_ARGS;
		$result = ReportLabel::find()->where(['zone_id' => $zid])->asArray()->one();

		if(empty($result))
		{
			return Status::SUCCESS;
		}else{
			return $result;
		}
    }

    public function actionAddEvent($zid,$eid){

		if(!Zone::checkZid($zid) || !Event::checkEid($eid) || empty(Event::findOne($eid))) return Status::INVALID_ARGS;
		if(!zeMap::addEvent($zid,$eid)) return Status::DATABASE_SAVE_FAIL;
		return Status::SUCCESS;
    }
}
