<?php 

namespace app\models;

use app\formatter\Status;
use yii\base\Exception;
use yii\db\ActiveRecord;

class Event extends ActiveRecord
{
	public static function tableName()
	{
		return 'event';
	}

    public function rules()
    {
        return [
            [['event_name'],'required'],
            ['event_name','checkEventName']
        ];
    }

    public function attributes()
	{
		return ['event_id','event_name'];
	}

	public static function checkEid($eid){
		return is_string($eid) && strlen($eid) == 10 && substr($eid,0,2) == 'e_';
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
		$model->event_id = 'e_' . \Yii::$app->getSecurity()->generateRandomString(8);
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
			parent::updateAll(['event_name' => $eventName],'`event_id` = :eid',[':eid' => $eventId]);
		}catch(Exception $e)
		{
			return Status::EVENT_EXIST;
		}

		return Status::SUCCESS;
	}

	public static function remove($eventId)
	{
		if(!static::checkEid($eventId)) return Status::INVALID_ARGS;

		try
		{
//		    Trigger `event`.`removeEvent`
			parent::deleteAll(['event_id' => $eventId]);
		}catch(Exception $e)
		{
			return Status::DATABASE_SAVE_FAIL;
		}

		return Status::SUCCESS;
	}

	public static function getEventName($eventId)
	{
		return parent::find()
            ->where('`event_id` = :eid')
            ->params([':eid' => $eventId])
            ->select('event_name')
            ->scalar();
	}
}