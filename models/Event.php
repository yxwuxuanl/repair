<?php 

namespace app\models;

use app\controllers\EventController;
use app\formatter\Status;
use yii\base\Exception;
use yii\db\ActiveRecord;

class Event extends ActiveRecord
{
	public static function tableName()
	{
		return 'event';
	}

	public function attributes()
	{
		return ['event_id','event_name'];
	}

	public static function checkEid($eid){
		return is_string($eid) && strlen($eid) == 10 && substr($eid,0,2) == 'e_';
	}

	public static function multiHas($list)
	{
		$query = parent::find();
		$explode = explode(',',$list);
		$query->where(['in','event_id',$explode]);

		return $query->count() == count($explode);
	}

	public static function isExist($eid)
	{
		$query = parent::find()->asArray();
		$query->where('`event_id`=:eid',[':eid' => $eid]);

		return $query->one() !== NULL;
	}

	public static function getNoAssign()
	{
		$bind = [];

		foreach(Group::find()->select('events')->each() as $group)
		{
			$bind = array_merge($bind,explode(',',$group['events']));
		}

		$notBind = [];

		foreach(Event::find()->each() as $item)
		{
			if(!in_array($item['event_id'],$bind))
			{
				$notBind[] = $item;
			}
		}

		return $notBind;
	}

	public static function checkEventName($eventName)
	{
		return is_string($eventName) && strlen($eventName) > 5;
	}

	public static function create($eventName)
	{
		$model = new self();
		$model->event_name = $eventName;
		$model->event_id = 'e_' . substr(uniqid(),-8);
		if(!$model->validate()) return Status::INVALID_ARGS;

		try
		{
			$model->insert();
		}catch(Exception $e)
		{
			return Status::EVENT_EXIST;
		}

		return $model->event_id;
	}

	public static function rename($eventId,$eventName)
	{
		if(!static::checkEid($eventId) || !static::checkEventName($eventName)) return Status::INVALID_ARGS;

		try
		{
			parent::updateAll(['event_name' => $eventName],'`event_id`=:eid',[':eid' => $eventId]);
		}catch(Exception $e)
		{
			return Status::EVENT_EXIST;
		}

		return Status::SUCCESS;
	}

	public static function remove($eventId)
	{
		if(!static::checkEid($eventId) || !static::isExist($eventId)) return Status::INVALID_ARGS;

		$transaction = \Yii::$app->getDb()->beginTransaction();

		try
		{
			// 删除`Event`表记录
			parent::deleteAll(['event_id' => $eventId]);

			// 清除`Group`表
			\Yii::$app->getDb()->createCommand("UPDATE `group` SET `events` = REPLACE(`events`,',{$eventId}','') LIMIT 1");

			\Yii::$app->getDb()->createCommand("UPDATE `zone_event_map` SET `events` = REPLACE(`events`,',{$eventId}','') LIMIT 1");

			Allocation::deleteAll(['event' => $eventId]);
			$transaction->commit();
		}catch(Exception $e)
		{
			$transaction->rollBack();
			return Status::DATABASE_SAVE_FAIL;
		}

		return Status::SUCCESS;
	}

	public static function getEventName($eventId)
	{
		return parent::find()->where('`event_id`=:eid',[':eid' => $eventId])->select('event_name')->scalar();
	}
}