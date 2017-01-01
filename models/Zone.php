<?php

namespace app\models;

use Yii;

class Zone extends \yii\db\ActiveRecord
{

    public static function tableName()
    {
        return 'zone';
    }

    public function rules()
    {
        return [
             [['zone_id'], 'integer'],
             [['zone_name'], 'string', 'max' => 50,'min' => 3],
        ];
    }

    public function attributes()
	{
		return ['zone_name','zone_id'];
	}

    public static function deleteZones($zone_id)
    {
        return parent::deleteAll(['between','zone_id',$zone_id,$zone_id + 99]);
    }

    public static function getUsableId($parent)
    {
        $ar = parent::find()->select('zone_id')->orderBy(['zone_id' => SORT_DESC])->asArray();
        if($parent == '0000')
        {
            $row = $ar->where('right(`zone_id`,2)=0')->one();
            return $row['zone_id'] + 100;
        }else{
            $row = $ar->where(['between','zone_id',$parent,$parent + 99])->one();
            return $row['zone_id'] + 1;
        }
    }

    public static function all()
    {
        return parent::find()->select('`zone`.*,`zone_event_map`.`events`')->join('LEFT JOIN','zone_event_map','`zone`.`zone_id`=`zone_event_map`.`zone_id`')->asArray()->all();
    }

}
