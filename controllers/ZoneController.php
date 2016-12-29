<?php

namespace app\controllers;

use app\filters\LoginFilter;
use app\filters\PrivilegeFilter;
use app\models\Zone;
use yii\web\Controller;
use yii\filters\VerbFilter;

class ZoneController extends Controller
{
    public function behaviors()
    {
       return [
           'verbs' => [
               'class' => VerbFilter::className(),
               'actions' => [
                   'delete' => ['POST'],
               ],
           ],
           'login' => [
               'class' => LoginFilter::className()
           ],
           'privilege' => [
               'class' => PrivilegeFilter::className(),
               'privilege' => P_SYSTEM_ZONE
           ]
       ];
    }

    public function actionGetParent()
    {
        \Yii::$app->response->format = 'json';
        $row = Zone::getParent();
        return array_merge(['status' => 1],array_merge($row,['length' => count($row)]));
    }

    public function actionGetSubs($parent)
    {
        \Yii::$app->response->format = 'json';

        if(is_numeric($parent) && $parent >= 1000 && $parent < 10000)
        {
            $result = Zone::getSubs($parent);

            if(empty($result))
            {
                return ['status' => 0,'message' => '该区域无子区域'];
            }else{
                return array_merge(['status' => 1],array_merge($result,['length' => count($result)]));
            }
        }
    
        return ['status' => -1];
    }

    public function actionRename($zone_id,$zone_name)
    {
		\Yii::$app->response->format = 'json';

        $model = Zone::findOne($zone_id);

        if($model !== null){
        	$model->zone_name = $zone_name;

        	if($model->validate() && $model->update()){
				return ['status' => 1];
			}else{
        		return array_merge(['status' => 0],$model->errors);
			}
		}
		return ['status' => -1];
    
    }

    public function actionDelete()
    {
        \Yii::$app->response->format = 'json';

        $zone_id = \Yii::$app->request->post('zone_id');

        if(($ar = Zone::findOne($zone_id)))
        {
            if(static::isParent($zone_id))
            {
                if(Zone::deleteZones($zone_id)){
                    return ['status' => 1];
                }

                return ['status' => -1];
                    
            }else{

                if($ar->delete()){
                    return ['status' => 1];
                }

                return ['status' => -1];
            }
        }
        return ['status' => 0];
    }

    public function actionAdd($name = null,$parent = null)
    {
        \Yii::$app->response->format = 'json';

        $model = new Zone();
        $lastId = $model->getUsableId($parent);

        $model->zone_id = $lastId;
        $model->zone_name = $name;

        if($model->validate()){
            if($model->save()){
                return ['status' => 1,'id' => $lastId];
            }
            return ['status' => -1];
        }
        return ['status' => 0];
    }

    public static function isParent($zone_id)
    {
        return substr($zone_id,-2,2) == '00';
    }
}
