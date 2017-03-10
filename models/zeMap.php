<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2016/12/30
 * Time: 上午11:09
 */

namespace app\models;

use app\formatter\Status;
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

	public static function getEvent($zoneId)
	{
		if(!Zone::checkZid($zoneId,true)) return Status::INVALID_ARGS;
		$event = parent::find()->where('`zone_id`=:zid',[':zid' => $zoneId])->select('events')->scalar();
		if($event === FALSE) return Status::INVALID_ARGS;

		return Event::find()->where(['in','event_id',explode(',',$event)])->all();
	}

	public static function remove($zoneId)
	{
		parent::deleteAll('zone_id=:zid',[':zid' => $zoneId]);
	}

	public static function create($zoneId)
	{
		$model = new self();
		$model->zone_id = $zoneId;
		$model->insert();
	}

	public static function isZoneHasEvent($zoneId,$eventId)
	{
		return parent::find()->where('`zone_id`=:zid',[':zid' => $zoneId])->andWhere(['like','events',$eventId])->count();
	}
}