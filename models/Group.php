<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2017/2/5
 * Time: 下午9:14
 */

namespace app\models;

use yii\base\Exception;
use yii\db\ActiveRecord;
use app\controllers\RoleController as Role;
use app\formatter\Status;

class Group extends ActiveRecord
{
	const G_NO_ASSIGN = 'g_noAssign';
	const G_SYSTEM = 'system';

	public static function tableName()
	{
		return 'group';
	}

	public function attributes()
	{
		return ['group_id','group_name','group_admin','events','task_mode'];
	}

	public function rules()
	{
		return [
			[['group_name','events','group_admin','task_mode'],'required'],

			['events','string','min' => 10],
			['task_mode','number','min' => 0,'max' => 3],
            
			['group_name','string','min' => 3],

			['events',function($attr){
                foreach(explode(',',$this->$attr) as $event)
                {
                    if(!Event::checkEid($event))
                    {
                        return $this->addError($attr);
                    }
                }
			}],

            ['group_admin','default','value' => null],

            ['group_admin',function($attr){
		        if(!Account::checkAid($this->$attr))
                {
                    $this->addError($attr);
                }
            }],

			['group_admin',function($attr){
				if(!Account::isNoAssign($this->$attr))
                {
                    $this->addError($attr);
                }
			}],
		];
	}

	public function scenarios()
	{
		return [
			'default' => [],
			'create' => ['group_id','group_name','group_admin','events','task_mode'],
			'rename' => ['group_name'],
			'change_admin' => ['group_admin']
		];
	}

	public static function hasEvent($group,$event)
	{
		$query = parent::find()
            ->where('`group_id`=:gid')
            ->andWhere(['like','events',$event])
            ->params([':gid' => $group])
            ->asArray()
            ->one();

		return $query !== NULL;
	}

	public static function changeAdmin($groupId,$adminId)
	{
		$accountAr = Account::find()
            ->where('`account_id`=:aid and (`account_group`=:gid or `account_group`=:noAssign)')
            ->params([':aid' => $adminId,':gid' => $groupId,':noAssign' => static::G_NO_ASSIGN])
            ->one();

        $groupAr = static::find()
            ->where('`group_id`=:gid')
            ->params([':gid' => $groupId])
            ->one();

		$oldAdmin = $groupAr->group_admin;

		$transaction = \Yii::$app->db->beginTransaction();

		try
		{
			Account::updateAll(['role' => Role::NORMAL],['account_id' => $oldAdmin]);

			if($accountAr->account_group != $groupId)
			{
				$accountAr->account_group = $groupId;
			}

			$accountAr->role = Role::GROUP_ADMIN;
			$accountAr->update();

			$groupAr->group_admin = $adminId;
			$groupAr->update();

			$transaction->commit();
		}catch (Exception $e)
		{
			$transaction->rollBack();
			return Status::DATABASE_SAVE_FAIL;
		}

		return Status::SUCCESS;
	}

	public static function getAll($includeAdmin = true)
	{
		$query = parent::find()->where(['not in','group_id',[static::G_SYSTEM,static::G_NO_ASSIGN]]);
		$query->select(['group_name','group_id']);

		if($includeAdmin)
		{
			$query->join('left join','account','`account`.`account_id`=`group`.`group_admin`');
			$query->addSelect('account_name as group_admin,group_admin as account_id');
		}

		return $query->asArray()->all();
	}

	public static function checkGid($gid)
	{
		return $gid == static::G_NO_ASSIGN || (is_string($gid) && strlen($gid) == 10 && substr($gid,0,2) == 'g_');
	}

	public static function isExist($gid)
	{
		return !!parent::find()->where('`group_id`=:gid',[':gid' => $gid])->count();
	}

	public static function remove($group)
	{
		$ar = parent::find()
            ->where('`group_id`=:gid',[':gid' => $group])
            ->one();

		$transaction = \Yii::$app->db->beginTransaction();

		try
		{
			Account::updateAll(['role' => Role::NORMAL],['account_id' => $ar->group_admin]);
			Account::updateAll(['account_group' => static::G_NO_ASSIGN],['account_group' => $group]);

			$ar->delete();
			$transaction->commit();
		}catch(\Exception $e)
		{
			$transaction->rollBack();
			return Status::DATABASE_SAVE_FAIL;
		}

		return Status::SUCCESS;
	}

	public static function checkGroupName($groupName)
	{
		return is_string($groupName) && strlen($groupName) >= 2;
	}

	public static function create($groupName,$groupAdmin,$events)
	{
		$model = new static();

		$model->group_name = $groupName;
		$model->task_mode = 1;
		$model->group_admin = $groupAdmin;
		$model->events = $events;
		$model->group_id = 'g_' . substr(uniqid(),-8);

		if(!$model->validate()) return Status::INVALID_ARGS;
		$transaction = \Yii::$app->db->beginTransaction();

		try
		{
            $model->insert();
			Account::updateAll(['account_group' => $model->group_id,'role' => Role::GROUP_ADMIN],'`account_id` = :aid',[':aid' => $groupAdmin]);
            $transaction->commit();
		}catch (Exception $e)
		{
			$transaction->rollBack();
			return Status::DATABASE_SAVE_FAIL;
		}

		return $model->group_id;
	}

	public static function rename($groupId,$groupName)
	{
		if(!static::checkGid($groupId) || !static::checkGroupName($groupName)) return Status::INVALID_ARGS;

		try
		{
			parent::updateAll(['group_name' => $groupName],'`group_id`=:gid',[':gid' => $groupId]);
		}catch(Exception $e)
		{
			return Status::GROUP_EXIST;
		}

		return Status::SUCCESS;
	}

	public static function getEvent($groupId)
	{
		if(!static::checkGid($groupId)) return Status::INVALID_ARGS;

		$events = parent::find()->where('`group_id`=:gid',[':gid' => $groupId])->select('events')->scalar();
		if($events === FALSE) return Status::INVALID_ARGS;

		return Event::find()->where(['in','event_id',explode(',',$events)])->asArray()->all();
	}

	public static function removeGroupEvent($group,$event)
	{
		if(!static::checkGid($group) || !Event::checkEid($event)) return Status::INVALID_ARGS;
		$sql = "UPDATE `group` SET `events` = REPLACE(`events`,'{$event},','') WHERE `group_id` = '{$group}' LIMIT 1";
		return \Yii::$app->getDb()->createCommand($sql)->execute();
	}

	public static function addGroupEvent($group,$event)
	{
		if(!static::checkGid($group) || !Event::checkEid($event) || !Event::isExist($event)) return Status::INVALID_ARGS;

		// 判断事件是否已经被绑定
		$isExist = parent::find()->where(['like','events',$event])->count();
		if($isExist > 0) return Status::INVALID_ARGS;

		$sql = "UPDATE `group` SET `events` = CONCAT(`events`,'{$event},') WHERE `group_id` = '{$group}' LIMIT 1";
		return \Yii::$app->getDb()->createCommand($sql)->execute();
	}

	public static function removeEvent($eid)
	{
		\Yii::$app->getDb()->createCommand("UPDATE `group` SET `events` = REPLACE(`events`,'{$eid},','') LIMIT 1")->execute();
	}

	public static function changeTaskMode($group,$mode)
	{
		$mode = (int) $mode;
		if(!in_array($mode,[1,2,3,4])) return Status::INVALID_ARGS;

		$transaction = \Yii::$app->getDb()->beginTransaction();
		$oldMode = Group::getTaskMode($group);

		try
		{
			parent::updateAll(['task_mode' => $mode],['group_id' => $group]);

//			删除所有分配规则
			if($mode == 1)
			{
				Allocation::deleteAll('`group_id`=:gid',[':gid' => $group]);
			}

//			删除默认的分配规则
			if($mode == 2)
			{
				Allocation::deleteAll('`group_id`=:gid and `level` = \'0\'',[':gid' => $group]);
			}

//			删除所有自定义规则并且插入默认规则
			if($mode == 3)
			{
				Allocation::deleteAll('`group_id`=:gid and `level` != \'0\'',[':gid' => $group]);

				if($oldMode != 4)
				{
					Allocation::generateDefaultRule($group);
				}
			}

//			插入默认规则
			if($mode == 4)
			{
				if($oldMode != 3)
				{
					Allocation::generateDefaultRule($group);
				}
			}

			$transaction->commit();
		}catch (Exception $e)
		{
			$transaction->rollBack();
			return Status::DATABASE_SAVE_FAIL;
		}

		return Status::SUCCESS;
	}

	public static function getTaskMode($group)
	{
		return parent::find()->where('`group_id`=:gid',[':gid' => $group])->select('task_mode')->scalar();
	}

	public static function findByEvent($event)
	{
		return parent::find()->where(['like','events',$event])->asArray()->one();
	}

	public static function getGroupName($group)
	{
		return parent::find()->where('`group_id`=:gid',[':gid' => $group])->select('group_name')->scalar();
	}

}
