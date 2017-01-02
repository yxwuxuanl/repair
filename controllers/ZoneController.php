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
    //    return [];
       return [
           'login' => [
               'class' => LoginFilter::className()
           ],
           'privilege' => [
               'class' => PrivilegeFilter::className(),
               'privilege' => P_SYSTEM_ZONE
           ]
       ];
    }

    public function actionMain($action,$params)
    {
        if(method_exists($this,$action)){

            $result = call_user_func_array([$this,$action],explode(',',$params));

            \Yii::$app->response->format = 'json';

            if($result['status'] === 1){
                if(\Yii::$app->get('zeCache')->make() !== true){
                    \Yii::$app->get('zeCache')->delete();
                }
            }

            return $result;
        }
    }

    public function rename($zone_id,$zone_name)
    {
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

    public function delete($zone_id)
    {
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

    public function add($name,$parent)
    {
        \Yii::$app->response->format = 'json';

        $model = new Zone();
        $lastId = $model->getUsableId($parent);

        $model->zone_id = $lastId;
        $model->zone_name = $name;

        if($model->validate()){
            if($model->save()){
                \Yii::$app->get('zeCache')->make();
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
