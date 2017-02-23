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
		return ['group_id','group_name','group_admin','events'];
	}

	public function rules()
	{
		return [
			[['group_id','group_name','events','group_admin'],'required'],
			['events','string','min' => 10],
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
			'create' => ['group_id','group_name','group_admin','events'],
			'rename' => ['group_name'],
			'change_admin' => ['group_admin']
		];
	}

	public static function hasEvent($group,$event)
	{
		$query = parent::find();

		$query->where('`group`=:gid');
		$query->andWhere('`events` like \'%:eid%\'');
		$query->params([':gid' => $group,':eid' => $event]);

		return $query->asArray()->one() !== NULL;
	}

	public static function changeAdmin($group,$admin)
	{
		if(!static::checkGid($group) || !Account::checkAid($admin)) return Status::INVALID_ARGS;

		$account = Account::find();

		// 组管理员必须满足 未分配组/该组成员 其一
		$account->where('`account_id`=:aid and (`account_group`=:gid or `account_group`=:noAssign)',[':aid' => $admin,':gid' => $group,':noAssign' => 'g_noassign']);
		$accountAr = $account->one();

		if($accountAr === NULL) return Status::INVALID_ARGS;

		$groupQuery = Group::find();
		$groupQuery->where('`group_id`=:gid',[':gid' => $group]);
		$groupAr = $groupQuery->one();

		if($groupAr === NULL) return Status::INVALID_ARGS;

		$oldAdmin = $groupAr->group_admin;

		$transaction = \Yii::$app->db->beginTransaction();

		try
		{
			// 清除原管理员的组管理员角色
			Account::updateAll(['role' => Role::NORMAL],['account_id' => $oldAdmin]);

			// 设置新组管理员角色
			$accountAr->account_group = $group;
			$accountAr->role = Role::GROUP_ADMIN;
			$accountAr->update();

			// 更新组管理员
			$groupAr->group_admin = $admin;
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
		$query = parent::find();
		$fields = ['group_name','group_id'];

		if($includeAdmin)
		{
			$query->join('left join','account','`account`.`account_id`=`group`.`group_admin`');
			$fields[] = 'account_name as group_admin';
		}

		$query->select($fields);

		$row = $query->asArray()->all();
		$result = [];

		foreach($row as $item)
		{
			$group_id = $item['group_id'];
			unset($item['group_id']);
			$result[$group_id] = $item;
		}

		return $result;
	}

	public static function checkGid($gid)
	{
		return $gid == 'g_noassign' || (is_string($gid) && strlen($gid) == 10 && substr($gid,0,2) == 'g_');
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
			Account::updateAll(['account_group' => 'g_noassign','role' => 'normal'],['account_group' => $group]);

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

	public static function create($groupName,$groupAdmin,$events)
	{
		$model = new self();

		$model->scenario = static::CREATE;
		$model->group_name = $groupName;
		$model->group_admin = $groupAdmin;
		$model->events = ',' . $events;
		$model->group_id = 'g_' . substr(uniqid(),-8);

		if(!$model->validate()) return [Status::INVALID_ARGS,$model->errors];
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
}
