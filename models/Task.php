<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2017/2/3
 * Time: 下午2:11
 */

namespace app\models;

use app\formatter\Status;
use yii\base\Exception;
use yii\db\ActiveRecord;

class Task extends ActiveRecord
{
	public $describe;

	public static function tableName()
	{
		return 'task';
	}

	public function rules()
	{
		return [
			[['reporter_name','reporter_id','reporter_tel'],'required'],

			['reporter_name','string','min' => 2],

			['reporter_id','checkStuNumber'],

			['reporter_tel',function($attr){
				if(!preg_match('/^1(3|4|5|7|8)\d{9}$/',$this->$attr))
				{
					$this->addError($attr);
				}
			}],


			['custom',function($attr){
				$test = CustomLabel::get(substr($this->zone_id,0,2) . '00');

				if(is_array($test) && $test['test'] != '')
				{
					if(!preg_match('/'. $test['test'] .'/',$this->$attr))
					{
						$this->addError($attr);
					}
				}
			}]
		];
	}

	public static function checkStuNumber($value)
	{
		if(!is_numeric($value) || strlen($value) != 8 || date('Y') - substr($value,0,4) > 4 || date('Y') < substr($value,0,4))
		{
			return false;
		}
		return true;
	}

	public static function getRow($stuNumber)
	{
		if(!static::checkStuNumber($stuNumber)) return Status::INVALID_ARGS;
		$ar = parent::find()->where('`reporter_id`=:rid',[':rid' => $stuNumber]);
		$ar->select(['post_time','zone','event','custom','status']);
		$row = $ar->asArray()->all();

		if($row === NULL)
		{
			return [];
		}else{
			return $row;
		}
	}

	public static function add($data)
	{
		$model = new self();

		foreach($data as $attr => $value)
		{
			$model->$attr = $value;
		}

		if(!empty($model->errors) || !$model->validate()) return [Status::INVALID_ARGS,$model->errors];

		$event = $model->event_id;
		$group = Group::findByEvent($event);

		$task_id = 't_' . substr(uniqid(),-8);

		$model->event = Event::getEventName($event);
		$model->zone = Zone::getZoneName($model->zone_id);
		$model->task_id = $task_id;
		$model->group_id = $group['group_id'];
		$model->post_time = date('Y-m-d');

		$transaction = \Yii::$app->getDb()->beginTransaction();

		try
		{
			$model->insert();

			if($model->describe != '')
			{
				Describe::add($task_id,$model->describe);
			}

			if($group['task_mode'] != 1)
			{
				static::assign($task_id,$event,$group);
			}

			$transaction->commit();
		}catch (Exception $e)
		{
			$transaction->rollBack();
			return Status::DATABASE_SAVE_FAIL;
		}

		return Status::SUCCESS;
	}

	public static function assign($taskId,$event,$group)
	{
		$rules = Allocation::getGroupRule($group['group_id'],true);

		$eventRule = NULL;
		$defaultRule = NULL;
		$bind = [];

		if(!is_array($rules)) return false;

		foreach($rules as $rule)
		{
			if($rule['level'] == 2)
			{
				$bind = array_merge($bind,$rule['assign']);
			}

			if($rule['event'] == $event)
			{
				$eventRule = $rule;
				break;
			}else if($rule['event'] === NULL)
			{
				$defaultRule = $rule;
			}
		}

		if($eventRule === NULL && $defaultRule === NULL)
		{
			return false;
		}

		if($eventRule)
		{
			$assignList = $eventRule['assign'];
			$index = $eventRule['next'];
			$assign = $assignList[$index];
			$mode = 2;
			Allocation::updateAll(['next' => (++$index >= count($assignList) ? 0 : $index)],'`event`=:eid',[':eid' => $event]);
		}else{
			$assignList = Account::getMember($group['group_id']);
			$index = $defaultRule['next'];

			if($group['task_mode'] == 4)
			{
				for($index = $defaultRule['next'];$index <= count($assignList);$index++)
				{
					if($index == count($assignList))
					{
						$index = 0;
						continue;
					}

					if(!in_array($assignList[$index]['account_id'],$bind))
					{
						$assign = $assignList[$index]['account_id'];
						$index++;
						break;
					}
				}
			}else{
				$assign = $assignList[$index]['account_id'];

				if(++$index >= count($assignList))
				{
					$index = 0;
				}
			}

			$mode = 1;
			Allocation::updateAll(['next' => $index],'`group_id`=:gid and `level` = \'0\'',[':gid' => $group['group_id']]);
		}

		TaskTrace::add($taskId,$assign,$mode);
		return true;
	}

	public function setzone_id($value)
	{
		if(!Zone::checkZid($value))
		{
			$this->addError('zone');
		}else{
			$this->zone_id = $value;
		}
	}

	public function setevent_id($value)
	{
		if(!Event::checkEid($value) || !zeMap::isZoneHasEvent(substr($this->zone_id,0,2) . '00',$value))
		{
			$this->addError('event');
		}else{
			$this->event_id = $value;
		}
	}

	public static function getGroup($event)
	{
		return Group::find()->where(['like','events',$event])->one();
	}

	public function attributes()
	{
		return ['task_id','reporter_name','reporter_id','status','reporter_tel','event','zone','custom','group_id','post_time'];
	}

	public static function getAssignTask($accountId)
	{
		$ar = TaskTrace::find()->where('`assign`=:aid and `status` != \'2\'',[':aid' => $accountId]);
		$ar->innerJoin('task','task_trace.task_id = task.task_id');
		$ar->select(['task.task_id as task_id','event','concat(`zone`,\' \',`custom`) as zone','post_time']);
		$ar->orderBy(['post_time' => 'desc']);
		return $ar->asArray()->all();
	}

	public static function getDetail($taskId)
	{
		if(!static::checkTaskId($taskId)) return Status::INVALID_ARGS;

		$ar = parent::find()->where('`task_id`=:tid',[':tid' => $taskId]);
		$ar->select(['reporter_name','reporter_id','reporter_tel']);

		$row = $ar->asArray()->one();

		if($row === NULL) return Status::INVALID_ARGS;

		$row['describe'] = Describe::get($taskId);

		return $row;
	}

	public static function getGroupTaskPool($groupId)
	{

	}

	public static function checkTaskId($taskId)
	{
		return is_string($taskId) && strlen($taskId) == 10 && substr($taskId,0,2) == 't_';
	}

	public static function finish($taskId)
	{
		if(!static::checkTaskId($taskId)) return Status::INVALID_ARGS;
		$transaction= \Yii::$app->getDb()->beginTransaction();

		try
		{
			parent::updateAll(['status' => '2'],'`task_id`=:tid',[':tid' => $taskId]);
			TaskTrace::updateAll(['complete_time' => date('Y-m-d')],'`task_id`=:tid',[':tid' => $taskId]);
			$transaction->commit();
		}catch(Exception $e)
		{
			$transaction->rollBack();
			return Status::DATABASE_SAVE_FAIL;
		}

		return Status::SUCCESS;
	}

	public static function getTaskNumber($accountId,$group)
	{
		$complete = 0;
		$underway = 0;

		foreach(TaskTrace::find()->where('`assign`=:aid',[':aid' => $accountId])->each() as $task)
		{
			if($task['complete_time'] == NULL)
			{
				$underway++;
			}else{
				$complete++;
			}
		}

		$groupPool = parent::find()->where('`group_id`=:gid',[':gid' => $group])->andWhere(['status' => NULL])->count();

		return [$complete,$underway,$groupPool];
	}

	public static function getGroupUnderway($group)
	{
		$ar = parent::find();
		$ar->select(['task.post_time','task.zone','task.`event`','`task`.task_id','task_trace.trace_mode','concat(`zone`,\' \',`custom`) as zone' ,'account.account_name']);
		$ar->innerJoin('task_trace','task.task_id = task_trace.task_id ');
		$ar->innerJoin('account','task_trace.assign = account.account_id');
		$ar->where('`group_id`=:gid',[':gid' => $group]);

		return $ar->asArray()->all();
	}

	public static function getTaskPool($group)
	{
		return parent::find()->where('`group_id`=:gid',[':gid' => $group])->andWhere(['status' => NULL])->asArray()->select(['task_id','event','zone','custom','post_time'])->all();
	}
}