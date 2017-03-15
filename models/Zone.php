<?php

namespace app\models;

use app\controllers\ZoneController;
use app\formatter\Status;
use Yii;
use yii\base\Exception;
use yii\db\Query;


class Zone extends \yii\db\ActiveRecord
{
	public static function tableName()
    {
        return 'zone';
    }

    public function attributes()
	{
		return ['zone_name','zone_id','events'];
	}

    public static function getParent()
	{
		return parent::find()->where('right(`zone_id`,2) = 00')->asArray()->all();
	}

	public static function getSubs($parent)
	{
		if(!static::checkZid($parent)) return Status::INVALID_ARGS;
		return parent::find()->where(['between','zone_id',$parent + 1,$parent + 99])->asArray()->all();
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

	public static function isExist($zid)
	{
		return !!parent::find()->where('`zone_id`=:zid',[':zid' => $zid])->count();
	}

	public static function checkZoneName($zoneName)
	{
		return is_string($zoneName) && strlen($zoneName);
	}

	public static function create($zoneName,$parent)
	{
		if(!static::checkZoneName($zoneName) || ($parent != 0 && !static::checkZid($parent,true))) return Status::INVALID_ARGS;

		$ar = parent::find()->orderBy(['zone_id' => SORT_DESC])->asArray();

		if($parent == 0)
		{
			$row = $ar->where('right(`zone_id`,2) = 0')->one();
			if(empty($row))
			{
				$zoneId = 1000;
			}else{
				$zoneId = $row['zone_id'] + 100;
			}
		}else{
			$row = $ar->where(['between','zone_id',$parent,$parent + 99])->one();
			if(empty($row)) return Status::INVALID_ARGS;
			$zoneId = $row['zone_id'] + 1;
		}

		$model = new self();
		$model->zone_id = $zoneId;
		$model->zone_name = $zoneName;

		$transaction = \Yii::$app->getDb()->beginTransaction();

		try
		{
			$model->insert();

			if($parent == 0)
			{
				zeMap::create($zoneId);
			}

			$transaction->commit();
		}catch (Exception $e)
		{
			$transaction->rollBack();
			return Status::ZONE_EXIST;
		}

		return $zoneId;
	}

	public static function rename($zoneId,$zoneName)
	{
		if(!static::checkZid($zoneId) || !static::checkZoneName($zoneName)) return Status::INVALID_ARGS;

		try
		{
			parent::updateAll(['zone_name' => $zoneName],'`zone_id`=:zid',[':zid' => $zoneId]);
		}catch(Exception $e)
		{
			return Status::ZONE_EXIST;
		}

		return Status::SUCCESS;
	}

	public static function remove($zoneId)
	{
		if(!static::checkZid($zoneId)) return Status::INVALID_ARGS;

		$transaction = \Yii::$app->getDb()->beginTransaction();

		try
		{
//			父区域
			if(static::checkZid($zoneId,true))
			{
				parent::deleteAll(['between','zone_id',$zoneId,$zoneId + 99]);
				zeMap::remove($zoneId);
			}else{
				parent::deleteAll('`zone_id`=:zid',[':zid' => $zoneId]);
			}

			$transaction->commit();

		}catch(Exception $e)
		{
			$transaction->rollBack();
			return Status::DATABASE_SAVE_FAIL;
		}

		return Status::SUCCESS;
	}

	public static function getEvent($zoneId,$onlyIn)
	{
		if(!static::checkZid($zoneId)) return Status::INVALID_ARGS;

		$event = zeMap::find()->where(['zone_id' => $zoneId])->select('events')->asArray()->scalar();

		if($event === FALSE) return Status::INVALID_ARGS;

		$in = [];
		$notIn = [];
		$explode = explode(',',$event);

		foreach(Event::find()->each() as $event)
		{
			if(in_array($event['event_id'],$explode))
			{
				$in[] = $event;
			}else{
				$notIn[] = $event;
			}
		}

		if($onlyIn)
		{
			return $in;
		}else{
			return ['in' => $in,'notIn' => $notIn];
		}
	}

	public static function addEvent($zoneId,$eventId)
	{
		if(!static::checkZid($zoneId,true) || !Event::checkEid($eventId) || !Event::isExist($eventId)) return Status::INVALID_ARGS;

		$sql = "UPDATE `zone_event_map` SET `events` = CONCAT(`events`,',{$eventId}') WHERE `zone_id` = '{$zoneId}'";
		return \Yii::$app->getDb()->createCommand($sql)->execute();
	}

	public static function removeEvent($zoneId,$eventId)
	{
		if(!static::checkZid($zoneId,true) || !Event::checkEid($eventId)) return Status::INVALID_ARGS;

		$sql = "UPDATE `zone_event_map` SET `events` = REPLACE(`events`,',{$eventId}','') WHERE `zone_id` = '{$zoneId}'";
		return \Yii::$app->getDb()->createCommand($sql)->execute();
	}

	public static function getZoneName($zoneId)
	{
		return parent::find()->select('group_concat(`zone_name`)')->where(['in','zone_id',[substr($zoneId,0,2) . '00',$zoneId]])->scalar();
	}
}
