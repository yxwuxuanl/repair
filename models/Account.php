<?php

namespace app\models;

use app\formatter\Status;
use yii\db\ActiveRecord;
use app\controllers\RoleController as Role;

class Account extends ActiveRecord
{
	const LOGIN = 'login';
	const CREATE = 'create';
	const CHANGE_PWD = 'change_pwd';
	const DELETE = 'delete';
	const CHANGE_GROUP = 'change_group';
	const FIND_BY_GROUP = 'find_by_group';

	public function scenarios()
	{
		return [
			'login' => ['account_name','password'],
			'create' => ['account_name','account_id','account_group','role','password'],
			'changePwd' => ['account_name','password'],
			'delete' => ['account_id'],
			'change_group' => ['account_name','account_group'],
			'find_by_group' => ['account_group'],
			'default' => []
		];
	}

	public static function tableName()
	{
		return 'account';
	}

	public function rules()
	{
		return [
			[['account_name','password','account_id','role','account_group'],'required'],
			['account_name','string','max' => 20,'min' => 2],
			['password','string','min' => 5],
			['account_id',function($attr){
				if(!static::checkAid($this->$attr)){
					$this->addError($attr,'INVALID_' . $attr);
				}
			}],
			['account_group',function($attr){
				if(!Group::checkGid($this->$attr))
				{
					$this->addError($attr,'INVALID' . $attr);
				}
			}]
		];
	}

	public function attributes()
	{
		return ['account_name','password','account_id','account_group','role'];
	}

	public function findGroupUsers()
	{}

	public static function getUserList()
	{
		$query = parent::find();

		$query->select(['account_id','account_name','role','group_name']);
		$query->where('`account_group` != \'system\'');
		$query->leftJoin('group','`account_group`=`group_id`');
		$query->orderBy(['role' => 'desc']);
		
		return $query->asArray()->all();
	}

	public function findUser()
	{
		$query = parent::find();

		$query->where('`account_name`=:an and `password`=PASSWORD(:pwd)');
		$query->params([':an' => $this->account_name,':pwd' => $this->password]);

		return $query->asArray()->one();
	}

	public function deleteUser()
	{
		$ar = parent::findOne(['account_id' => $this->account_id]);

		if(empty($ar)) return null;
		if($ar['role'] == Role::SYSTEM_ADMIN) return false;

		if($ar['role'] == Role::GROUP_ADMIN)
		{
			$group = $ar['account_group'];
			Group::changeAdmin($group,'');
		}

		return $ar->delete();
	}

	public static function checkAid($aid)
	{
		return is_string($aid) && strlen($aid) == 10 && substr($aid,0,2) == 'a_';
	}

	public function setPassword()
	{}

	public static function isExist($aid)
	{
		return parent::findOne(['account_id' => $aid]) !== NULL;
	}

	public static function clearGroup($gid)
	{
		$sql = 'UPDATE `account` SET `account_group`=\'g_noassign\',`role`=\'normal\' WHERE `account_group`=\'' . $gid . '\'';
		\Yii::$app->db->createCommand($sql)->execute();
	}

	public static function changeGroup($aid,$gid,$admin = false)
	{
		$ar = parent::find()->where('`account_id`=:aid',[':aid' => $aid])->one();

		$ar->account_group = $gid;

		if($ar->role == Role::GROUP_ADMIN)
		{
			$ar->role = Role::NORMAL;
		}

		if($admin)
		{
			$ar->role = Role::GROUP_ADMIN;
		}

		$ar->update();
	}

	public static function getNoMembers($gid,$includeAdmin = true)
	{
	}

	public static function getMembers($gid)
	{

	}

	public static function getAdminList($gid)
	{
		if(!Group::checkGid($gid)) return Status::INVALID_ARGS;

		$ar = parent::find();
		$ar->select(['account_id','account_name']);
		$ar->where('(`account_group`=:gid and `role` != :role)',[':gid' => $gid,':role' => Role::GROUP_ADMIN]);
		$ar->orWhere('`account_group`=\'g_noassign\'');

		return $ar->asArray()->all();
	}

	public static function getNoAssign()
	{
		$query = parent::find();
		$query->where('`account_group`=\'g_noassign\'');
		$query->select('`account_id`,`account_name`');
		return $query->asArray()->all();
	}


	public static function isNoAssign($aid)
	{
		$ar = parent::find()->where('`account_id`=:aid and `account_group`=\'g_noassign\'',[':aid' => $aid])->count();
		return !!$ar;
	}

	public static function changeRole($aid,$role)
	{
		$ar = parent::find()->where('`account_id`=:aid',[':aid' => $aid])->one();
		$ar->role = $role;
		$ar->update();
	}
}
