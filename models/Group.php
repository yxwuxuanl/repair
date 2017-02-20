<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2017/2/5
 * Time: 下午9:14
 */

namespace app\models;

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
			[['group_id','group_name','events'],'required'],
			['events','string','min' => 10],
			['group_admin',function($attr){
				$row = Account::findOne(['account_id' => $this->$attr]);

				if($row === NULL || $row['role'] === Role::GROUP_ADMIN)
				{
					$this->addError($attr,'INVALID' . $attr);
				}
			}],
			['group_id',function($attr){
				if(!static::checkGid($this->$attr))
				{
					$this->addError($attr,'INVALID' . $attr);
				}
			}],
			['group_name','string','min' => 2],
			['events',function($attr){
				if(!Event::checkEid($this->$attr) || !Event::has($this->$attr) || static::hasEvent($this->group_id,$this->$attr))
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
				if(!Event::multiHas($this->$attr))
				{
					$this->addError($attr);
				}
			},'on' => static::CREATE],
			['group_admin',function($attr){
				if(!Account::isExist($this->$attr))
				{
					$this->addError($attr);
				}
			}]
		];
	}

	public function scenarios()
	{
		return [
			'default' => [],
			'create' => ['group_id','group_name','group_admin','events'],
			'rename' => ['group_name'],
			'change_admin' => ['group_id','group_admin']
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
		$ar = parent::findOne(['group_id' => $group]);
		$ar['group_admin'] = $admin;
		return $ar->update();
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

	public function deleteEvent($old)
	{

	}

	public static function isExist($gid)
	{
		return !!parent::find()->where('`group_id`=:gid',[':gid' => $gid])->count();
	}
}
