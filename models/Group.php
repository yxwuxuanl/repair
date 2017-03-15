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
	const CREATE = 'create';
	const CHANGE_ADMIN = 'change_admin';
	const DELETE = 'delete';
	const ADD_EVENT = 'add_event';
	const REMOVE_EVENT = 'remove_event';
	const RENAME = 'rename';

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
			[['group_id','group_name','events','group_admin','task_mode'],'required'],
			['events','string','min' => 10],
			['task_mode','number','min' => 0,'max' => 3],
			['group_id',function($attr){
				if(!static::checkGid($this->$attr))
				{
					$this->addError($attr,'INVALID' . $attr);
				}
			}],
			['group_name','string','min' => 2],
			['events',function($attr){
				if(!Event::checkEid($this->$attr) || !Event::isExist($this->$attr) || static::hasEvent($this->group_id,$this->$attr))
				{
					$this->addError($attr,'INVALID' . $attr);
				}
			},'on' => static::ADD_EVENT],
			['events',function($attr){
				if(!Event::checkEid($this->$attr) || !static::hasEvent($this->group_id,$this->$attr))
				{
					$this->addError($attr);
				}
			},'on' => static::REMOVE_EVENT],

			['events',function($attr){
			//	逐个验证事件有效性
				if(!Event::multiHas(substr($this->$attr,1)))
				{
					$this->addError($attr);
				}
			},'on' => static::CREATE],

			['group_admin',function($attr){
				// 组管理员必须是 no_assign 状态
				$aid = $this->$attr;

				if($aid === NULL) return;

				$ar = Account::find();
				$ar->where('`account_id`=:aid and `account_group`=:gid',[':aid' => $aid,':gid' => 'g_noassign']);

				if($ar->count() < 1)
				{
					$this->addError($attr);
				}
			},'on' => static::CREATE]
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
		$query = parent::find();

		$query->where('`group_id`=:gid');
		$query->andWhere(['like','events',$event]);
		$query->params([':gid' => $group]);

		return $query->asArray()->count();
	}

	public static function changeAdmin($groupId,$adminId)
	{
		if(!static::checkGid($groupId) || !Account::checkAid($adminId)) return Status::INVALID_ARGS;

		$account = Account::find();

		// 组管理员必须满足 未分配组/该组成员 其一
		$account->where('`account_id`=:aid and (`account_group`=:gid or `account_group`=:noAssign)',[':aid' => $adminId,':gid' => $groupId,':noAssign' => 'g_noAssign']);
		$accountAr = $account->one();

		if($accountAr === NULL) return Status::INVALID_ARGS;

		$groupQuery = Group::find();
		$groupQuery->where('`group_id`=:gid',[':gid' => $groupId]);
		$groupAr = $groupQuery->one();

		if($groupAr === NULL) return Status::INVALID_ARGS;

		$oldAdmin = $groupAr->group_admin;

		$transaction = \Yii::$app->db->beginTransaction();

		try
		{
			// 清除原管理员的组管理员角色
			Account::updateAll(['role' => Role::NORMAL],['account_id' => $oldAdmin]);

			// 设置新组管理员角色
			$accountAr->account_group = $groupId;
			$accountAr->role = Role::GROUP_ADMIN;
			$accountAr->update();

			// 更新组管理员
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
		$query = parent::find()->where(['not in','group_id',['g_noAssign','system']]);
		$query->select(['group_name','group_id']);

		if($includeAdmin)
		{
			$query->join('left join','account','`account`.`account_id`=`group`.`group_admin`');
			$query->addSelect('account_name as group_admin');
		}

		return $query->asArray()->all();
	}

	public static function checkGid($gid)
	{
		return $gid == 'g_noAssign' || (is_string($gid) && strlen($gid) == 10 && substr($gid,0,2) == 'g_');
	}

	public static function findGroup($gid)
	{
		if(static::checkGid($gid))
		{
			return parent::find()->where('group_id=:gid')->params([':gid' => $gid])->asArray()->one();
		}else{
			return NULL;
		}
	}

	public static function isExist($gid)
	{
		return !!parent::find()->where('`group_id`=:gid',[':gid' => $gid])->count();
	}

	public static function remove($group)
	{
		if(!static::checkGid($group)) return Status::INVALID_ARGS;
		$ar = parent::find()->where('`group_id`=:gid',[':gid' => $group])->one();
		if($ar === NULL) return Status::INVALID_ARGS;

		$transaction = \Yii::$app->db->beginTransaction();

		// 删除组事务
		try
		{
			// 清理 `account` 表
			Account::updateAll(['account_group' => 'g_noAssign','role' => 'normal'],['account_group' => $group]);

			// 删除 `group` 表记录
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
		$model = new self();

		$model->group_name = $groupName;
		$model->task_mode = 1;
		$model->group_admin = $groupAdmin;
		$model->events = ',' . $events;
		$model->group_id = 'g_' . substr(uniqid(),-8);

		if(!$model->validate()) return Status::INVALID_ARGS;
		$transaction = \Yii::$app->db->beginTransaction();

		try
		{
			// 插入记录
			$model->insert();

			// 更新组管理员记录
			Account::updateAll(['account_group' => $model->group_id,'role' => Role::GROUP_ADMIN],'`account_id`=:aid',[':aid' => $groupAdmin]);

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

	public static function removeEvent($group,$event)
	{
		if(!static::checkGid($group) || !Event::checkEid($event)) return Status::INVALID_ARGS;
		$sql = "UPDATE `group` SET `events` = REPLACE(`events`,',{$event}','') WHERE `group_id` = '{$group}' LIMIT 1";
		return \Yii::$app->getDb()->createCommand($sql)->execute();
	}

	public static function addEvent($group,$event)
	{
		if(!static::checkGid($group) || !Event::checkEid($event) || !Event::isExist($event)) return Status::INVALID_ARGS;

		// 判断事件是否已经被绑定
		$isExist = parent::find()->where(['like','events',$event])->count();
		if($isExist > 0) return Status::INVALID_ARGS;

		$sql = "UPDATE `group` SET `events` = CONCAT(`events`,',{$event}') WHERE `group_id` = '{$group}' LIMIT 1";	
		return \Yii::$app->getDb()->createCommand($sql)->execute();
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
