<?php

namespace app\models;

use Yii;

/**
 * This is the model class for table "zone".
 *
 * @property integer $zone_id
 * @property string $zone_name
 *
 * @property ZoneEventMap[] $zoneEventMaps
 * @property Event[] $events
 */
class Zone extends \yii\db\ActiveRecord
{

//      public $zone_id;
//      public $zone_name;

    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'zone';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
//             [['zone_id'], 'required'],
             [['zone_id'], 'integer'],
             [['zone_name'], 'string', 'max' => 50,'min' => 3],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'zone_id' => 'Zone ID',
            'zone_name' => 'Zone Name',
        ];
    }

    public function attributes()
	{
		return ['zone_name','zone_id'];
	}

	/**
     * @return \yii\db\ActiveQuery
     */
    public function getZoneEventMaps()
    {
        return $this->hasMany(ZoneEventMap::className(), ['zone_id' => 'zone_id']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getEvents()
    {
        return $this->hasMany(Event::className(), ['event_id' => 'event_id'])->viaTable('zone_event_map', ['zone_id' => 'zone_id']);
    }

    public static function getParent()
    {
        return parent::find()
            ->where('right(`zone_id`,2)=0')
            ->asArray()
            ->all();
    }

    public static function getSubs($zone_id)
    {
        return parent::find()
            ->where(['between','zone_id',$zone_id + 1,$zone_id + 99])
            ->asArray()
            ->all();
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
}
