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

	public static function addZoneEvent($zid,$eid)
	{
		if(!Zone::checkZid($zid,true) || !Event::checkEid($eid)) return Status::INVALID_ARGS;
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

	public static function isZoneHasEvent($zoneId,$eventId)
	{
		$query = parent::find()
                ->where('`zone_id` = :zid')
                ->params([':zid' => $zoneId])
                ->select('events')
                ->scalar();

		return strpos($query,$eventId) > -1;
	}
}