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

	public static function removeEvent($eid)
	{
		if(!Event::checkEid($eid)) return Status::INVALID_ARGS;

		$sql = "UPDATE `zone_event_map` SET `events` = REPLACE(`events`,'{$eid},','')";
		if(\Yii::$app->getDb()->createCommand($sql)->execute())
		{
			return 1;
		}
		return 0;
	}

	public static function addZoneEvent($zid,$eid)
	{
		if(!Zone::checkZid($zid,true) || !Event::checkEid($eid) || !Event::isExist($eid)) return Status::INVALID_ARGS;
		$sql = "UPDATE `zone_event_map` SET `events` = CONCAT(`events`,'{$eid},') WHERE `zone_id` = '{$zid}'";
		return \Yii::$app->getDb()->createCommand($sql)->execute();
	}

	public static function removeZoneEvent($zid,$eid)
	{
		if(!Zone::checkZid($zid,true) || !Event::checkEid($eid)) return Status::INVALID_ARGS;
		$sql = "UPDATE `zone_event_map` SET `events` = REPLACE(`events`,'{$eid},','') WHERE `zone_id` = '{$zid}'";

		if(\Yii::$app->getDb()->createCommand($sql)->execute())
		{
			return 1;
		}
		return 0;
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
		return parent::find()->where('`zone_id`=:zid',[':zid' => $zoneId])->andWhere(['like','events',$eventId])->one() !== NULL;
	}
}