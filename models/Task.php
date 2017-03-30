<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2017/2/3
 * Time: 下午2:11
 */

namespace app\models;

use app\controllers\GroupController;
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

	public $enableClientValidation = false;

	public function rules()
	{
		return [
			[['reporter_name','reporter_id','reporter_tel','event','zone'],'required'],

			['reporter_name','string','min' => 2,'max' => 8],
			['reporter_id','checkStuNumber'],

			['reporter_tel',function($attr){
				if(!preg_match('/^1(3|4|5|7|8)\d{9}$/',$this->$attr))
				{
					$this->addError($attr);
				}
			}],

            ['event',function($attr){
                if(!Event::checkEid($this->$attr) || !zeMap::isZoneHasEvent($this->parent_zone,$this->$attr))
                {
                    $this->addError($attr);
                }
            }],

            ['zone',function($attr){
                if(!Zone::checkZid($this->$attr) || substr($this->$attr,0,2) != substr($this->parent_zone,0,2) || !Zone::isExist($this->$attr))
                {
                    $this->addError($attr);
                }
            }],
		];
	}

    public function attributes()
    {
        return ['task_id','reporter_name','reporter_id','status','reporter_tel','event','zone'];
    }

	public static function checkStuNumber($value)
	{
		if(!is_numeric($value) || strlen($value) != 8 || date('Y') - substr($value,0,4) > 4 || date('Y') < substr($value,0,4))
		{
			return false;
		}
		return true;
	}

	public static function getReportResult($taskId, $stuNumber)
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

	public static function create($data)
	{
		if(!array_key_exists('custom',$data))
        {
            $data['custom'] = '';
        }

        if(!array_key_exists('parent_zone',$data)) return Status::INVALID_ARGS;

        $model = new self();

		foreach($data as $attr => $value)
		{
			$model->$attr = $value;
		}
		if(!empty($model->errors) || !$model->validate()) return [Status::INVALID_ARGS,$model->errors];

		$eventId = $model->event;
		$zoneId = $model->zone;
        $taskId = 't_' . \Yii::$app->getSecurity()->generateRandomString(8);
        $group = Group::findByEvent($eventId);

		$model->event = Event::getEventName($eventId);
		$model->zone = Zone::getZoneName($zoneId) . ' ' . $model->custom;
		$model->status = '0';
		$model->task_id = $taskId;

		$transaction = \Yii::$app->getDb()->beginTransaction();

		try
		{
            $model->insert(FALSE);

			if($model->describe != '')
			{
				Describe::add($taskId,$model->describe);
			}

			if($group['task_mode'] != 1)
			{
				static::assign($taskId,$eventId,$group);
			}

			$transaction->commit();
		}catch (\yii\db\Exception $e)
		{
		    print_r($e);
			$transaction->rollBack();
			return Status::DATABASE_SAVE_FAIL;
		}

		return Status::SUCCESS;
	}

	public function setcustom($value)
    {
        if(!CustomLabel::valid($this->parent_zone,(string) $value))
        {
            $this->addError('custom');
        }else{
            $this->custom = $value;
        }
    }

    public function setparent_zone($value)
    {
        if(!Zone::checkZid($value,true) || !Zone::isExist($value))
        {
            $this->addError('parent_zone');
        }else{
            $this->parent_zone = $value;
        }
    }

	public static function assign($taskId,$event,$group)
	{
		$rules = Allocation::getGroupRule($group['group_id'],true,false);

		$eventRule = NULL;
		$defaultRule = NULL;
		$bind = [];

		if(!is_array($rules)) return false;

		foreach($rules as $rule)
		{
			if($rule['level'] == 2)
			{
				$bind = array_merge($bind,explode(',',$rule['assign']));
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
			$assignList = explode(',',$eventRule['assign']);
			$index = $eventRule['next'];
			$assign = $assignList[$index];
			$mode = 1;
			Allocation::updateAll(['next' => (++$index >= count($assignList) ? 0 : $index)],'`allocation_id` = :aid',[':aid' => $eventRule['allocation_id' .
            '']]);
		}else{
			$assignList = Account::getMember($group['group_id']);
			$index = $defaultRule['next'];

			if($group['task_mode'] == 4)
			{
				for($index = $defaultRule['next'];$index <= count($assignList);$index++)
				{
					if($index == count($assignList))
					{
						$index = -1;
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

			$mode = 0;
			Allocation::updateAll(['next' => $index],'`allocation_id` = :aid',[':aid' => 'def_' . substr($group['group_id'],-8)]);
		}

		TaskTrace::Trace($taskId,$assign,$mode);
		return true;
	}

	public static function getGroup($event)
	{
		return Group::find()->where(['like','events',$event])->one();
	}

	public static function getAssignTask($accountId)
	{
        return TaskTrace::find()
            ->where('assign = :aid')
            ->andWhere('status != \'2\'')
            ->params([':aid' => $accountId])
            ->innerJoin('task','task_trace.task_id = task.task_id')
            ->select(['task.task_id as task_id','event','zone','post_time'])
            ->orderBy(['post_time' => 'desc'])
            ->asArray()->all();
	}

	public static function getDetail($taskId)
	{
		if(!static::checkTaskId($taskId)) return Status::INVALID_ARGS;

		$ar = parent::find()
            ->where('task.`task_id` = :tid',[':tid' => $taskId])
            ->innerJoin('task_trace','task.task_id = task_trace.task_id')
		    ->select(['reporter_name','reporter_id','reporter_tel','trace_mode'])
            ->asArray()->one();

		return $ar;
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
		return parent::updateAll(['status' => '2'],'`task_id` = :tid',[':tid' => $taskId]);
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

	public static function getCompleteByAccount($aid)
    {
        return parent::find()
            ->where('assign = :aid')
            ->andWhere('status = \'2\'')
            ->innerJoin('task_trace','task.task_id = task_trace.task_id')
            ->select(['post_time','complete_time','trace_mode','zone','event'])
            ->params([':aid' => $aid])
            ->asArray()->all();
    }


    public static function getByGroup($gid,$status)
    {
        $member = [];

        foreach(Account::getMember($gid) as $m)
        {
            $member[] = $m['account_id'];
        }

        return parent::find()
            ->where(['in','assign',$member])
            ->andWhere('status = :status')
            ->innerJoin('task_trace','task.task_id = task_trace.task_id')
            ->innerJoin('account','account_id = assign')
            ->select(['post_time','complete_time','zone','event','account_name'])
            ->params([':status' => (string) $status])
            ->asArray()->all();
    }

    public static function queryReportRow($stuId)
    {
        return parent::find()
            ->where('reporter_id = :rid')
            ->select(['post_time','zone','event','status'])
            ->params([':rid' => $stuId])
            ->asArray()->all();
    }
}