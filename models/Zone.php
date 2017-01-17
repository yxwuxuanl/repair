<?php

namespace app\models;

use app\controllers\ZoneController;
use Yii;
use yii\db\Query;


class Zone extends \yii\db\ActiveRecord
{
	public function scenarios()
	{
		return [
            'add' => ['zone_name'],
            'rename' => ['zone_id','zone_name'],
            'delete' => ['zone_id'],
            'necessaryParent' => ['zone_id']
        ];
	}

	public static function tableName()
    {
        return 'zone';
    }

    public function rules()
    {
        return [
             [['zone_name','zone_id'],'required'],

             ['zone_id',function(){
				if(!ZoneController::checkZid($this->zone_id)){
					$this->addError('zone_id','INVALID_ZONE_ID');
				}
			 }],

             [['zone_name'], 'string', 'max' => 50,'min' => 3],

             ['zone_id',function(){
                 if(!ZoneController::checkZid($this->zone_id,true)){
					$this->addError('zone_id','INVALID_ZONE_ID');
				 }
             },'on' => 'necessaryParent']

        ];
    }

    public function attributes()
	{
		return ['zone_name','zone_id'];
	}

    public function deleteZone()
    {
        if(ZoneController::checkZid($this->zone_id,true)){

            // -- DELETE HOOK --

            return parent::deleteAll(['between','zone_id',$this->zone_id,$this->zone_id + 99]);
        }else{
            if(!empty(($ar = parent::findOne($this->zone_id)))){
                return $ar->delete();
            }else{
                return 0;
            }
        }
    }

    public static function getUsableId($parent)
    {
        $ar = parent::find()->select('zone_id')->orderBy(['zone_id' => SORT_DESC])->asArray();

        if(!$parent)
        {
            $row = $ar->where('right(`zone_id`,2) = 0')->one();
            return $row['zone_id'] + 100;
        }else{
            $row = $ar->where(['between','zone_id',$parent,$parent + 99])->one();

            if(empty($row)){
                return null;
            }else{
                return $row['zone_id'] + 1;
            }
        }
    }

    public static function all()
    {
        return parent::find()->select('`zone`.*,`zone_event_map`.`events`')->join('LEFT JOIN','zone_event_map','`zone`.`zone_id`=`zone_event_map`.`zone_id`')->asArray()->all();
    }

    public function getParent()
	{
		return parent::find()->where('right(`zone_id`,2) = 00')->asArray()->all();
	}

	public function getSubs()
	{
		return parent::find()->where(['between','zone_id',$this->zone_id + 1,$this->zone_id + 99])->asArray()->all();
	}

	public static function getEvents($zid)
	{

	}
}
