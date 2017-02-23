<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2016/12/30
 * Time: 上午11:09
 */

namespace app\models;

use yii\db\ActiveRecord;

class zeMap extends ActiveRecord
{
	public static function tableName()
	{
		return 'zone_event_map';
	}

	public function attributes()
	{
		return ['zone_id','events'];
	}

	public static function deleteEvent($zid,$eid)
	{
		$ar = parent::find()->where('`zone_id`=:zid',[':zid' => $zid])->one();
		$ar->events = str_replace(',' . $eid,'',$ar->events);
		return $ar->update();
	}

	public static function clearEvent($eid)
	{
	}

	public static function addEvent($zid,$eid)
	{
		$ar = parent::find()->where('`zone_id`=:zid',[':zid' => $zid])->one();

		if($ar->events == '')
		{
			$ar->events = ',' . $eid;
		}else{
			if(strpos($ar->events,$eid) !== FALSE)
			{
				return false;
			}
			$ar->events .= ',' . $eid;
		}
		return $ar->update();
	}

	public static function addRecord($zid){
		$model = new self();
		$model->zone_id = $zid;
		$model->insert();
	}

	public static function getEvents($zid,$onlyIn)
	{
		$event = parent::find()->where(['zone_id' => $zid])->select('events')->asArray()->scalar();
		$in = Event::find()->where(['in','event_id',explode(',',$event)])->from('event')->asArray()->all();
		
		if($onlyIn) return $in;

		$notIn = parent::find()->where(['not in','event_id',explode(',',$event)])->from('event')->asArray()->all();

		return ['in' => $in,'notIn' => $notIn];
	}
}