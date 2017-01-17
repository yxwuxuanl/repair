<?php

namespace app\controllers;

use app\behaviors\Response;
use app\filters\LoginFilter;
use app\filters\PrivilegeFilter;
use app\models\Event;
use app\models\zeMap;
use app\models\Zone;
use yii\web\Controller;
use yii\filters\VerbFilter;

class ZoneController extends Controller
{
    public function behaviors()
    {
   	    return [Response::className()];
        return [
           'login' => [
               'class' => LoginFilter::className()
           ],
           'privilege' => [
               'class' => PrivilegeFilter::className(),
               'privilege' => P_SYSTEM_ZONE
           ],
			Response::className()
        ];
    }

    public function actionGetParent()
	{
		return $this->success((new Zone)->getParent());
	}

    public function actionRename($zid,$zone_name)
    {
        if(!static::checkZid($zid)) return $this->fail(REP_INVALID_ARGS);

        $model = Zone::findOne($zid);

        $model->zone_name = $zone_name;
        $model->scenario = 'rename';

        if(!$model->validate()){
            return $this->fail(REP_MODEL_VALIDATE_FAIL);
        }

        if(!$model->update()){
            return $this->fail(REP_MODEL_SAVE_FAIL);
        }else{
            return $this->success();
        }
    }

    public function actionDelete($zid)
    {
        $model = new Zone();
        $model->scenario = 'delete';
        $model->zone_id = $zid;

        if(!$model->validate()) return $this->fail(REP_INVALID_ARGS);

        if($model->deleteZone()){
            return $this->success();
        }else{
            return $this->fail(REP_MODEL_SAVE_FAIL);
        }
    }

    public function actionAdd($name,$parent = null)
    {
        $model = new Zone();
        $model->scenario = 'add';

        $usableId = $model->getUsableId($parent);
        if(!$usableId) return $this->fail(REP_MODEL_NOT_FOUND);
            
        $model->zone_id = $usableId;
        $model->zone_name = $name;

        if(!$model->validate()) return $this->fail(REP_MODEL_VALIDATE_FAIL,['message' => $model->errors]);
        if(!$model->save()) return $this->fail(REP_MODEL_SAVE_FAIL);

        return $this->success(['id' => $usableId]);
    }

    public static function checkZid($zone_id,$isParent = false)
    {
		if(!is_numeric($zone_id) || $zone_id > 9999 || $zone_id < 1000){
			return false;
		}

		if($isParent){
        	return is_numeric($zone_id) && substr($zone_id,-2,2) == '00';
		}

		return true;
    }

    public function actionGetSubs($zid)
    {
        $model = new Zone();
        $model->scenario = 'necessaryParent';
        $model->zone_id = $zid;

        if(!$model->validate()) return $this->fail(REP_INVALID_ARGS);

        $result = $model->getSubs();

        return $this->success($result);
    }

    public function actionGetEvents($zid)
    {
        if(!static::checkZid($zid) || !($row = zeMap::getEvents($zid))) return $this->fail(REP_INVALID_ARGS);
        return $this->success($row);
    }

    public function actionRemoveEvent($zid,$eid)
	{
		if(!ZoneController::checkZid($zid) || !EventController::checkEid($eid)) return $this->fail(REP_INVALID_ARGS);
		if(!zeMap::deleteEvent($eid,$zid)) return $this->fail(REP_MODEL_SAVE_FAIL);
		return $this->success();
    }

    public function actionAddEvent($zid,$eid){

		if(!ZoneController::checkZid($zid) || !EventController::checkEid($eid) || empty(Event::findOne($eid))) return $this->fail(REP_INVALID_ARGS);
		if(!zeMap::addEvent($zid,$eid)) return $this->fail(REP_MODAL_SAVE_FAIL);
		return $this->success();
    }
}
