<?php

namespace app\models;

use app\formatter\Status;
use yii\base\Exception;

class Zone extends \yii\db\ActiveRecord
{
	public static function tableName()
    {
        return 'zone';
    }

    public function attributes()
	{
		return ['zone_name','zone_id'];
	}

    public static function getParent()
	{
		return parent::find()->where('right(`zone_id`,2) = 00')->asArray()->all();
	}

	public static function getSubs($parent)
	{
		if(!static::checkZid($parent,true)) return Status::INVALID_ARGS;

		return parent::find()
            ->where(['between','zone_id',$parent + 1,$parent + 99])
            ->asArray()->all();
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
		return parent::find()->where('`zone_id` = :zid',[':zid' => $zid])->one() !== NULL;
	}

	public static function checkZoneName($zoneName)
	{
		return is_string($zoneName) && strlen($zoneName) > 2;
	}

	public static function create($zoneName,$parent)
	{
		if(!static::checkZoneName($zoneName) || ($parent !== null && !static::checkZid($parent,true))) return Status::INVALID_ARGS;

		$ar = parent::find()
            ->orderBy(['zone_id' => SORT_DESC])
            ->select('zone_id');

		if($parent === null)
		{
			$row = $ar
                ->where('right(`zone_id`,2) = 0')
                ->scalar();

			if($row === FALSE)
			{
				$zoneId = 1000;
			}else{
				$zoneId = $row + 100;
			}
		}else{
			$row = $ar
                ->where(['between','zone_id',$parent,$parent + 99])
                ->scalar();

			$zoneId = $row + 1;
		}

		$model = new self();
		$model->zone_id = $zoneId;
		$model->zone_name = $zoneName;

		try
		{
//		    Trigger `zone`.`createZone`
			$model->insert();
		}catch (Exception $e)
		{
		    return Status::DATABASE_SAVE_FAIL;
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
			if(static::checkZid($zoneId,true))
			{
				parent::deleteAll(['between','zone_id',$zoneId,$zoneId + 99]);
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
		if(!static::checkZid($zoneId,true)) return Status::INVALID_ARGS;

		$event = zeMap::find()
            ->where('`zone_id`=:zid')
            ->params([':zid' => $zoneId])
            ->select('events')
            ->scalar();

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

	public static function getZoneName($zoneId)
	{
		return parent::find()
            ->select('group_concat(`zone_name`)')
            ->where('`zone_id`=:parent')
            ->orWhere('`zone_id`=:child')
            ->params([':parent' => substr($zoneId,0,2) . '00',':child' => $zoneId])
            ->scalar();
	}
}
