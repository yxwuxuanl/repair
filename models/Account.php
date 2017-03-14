<?php

namespace app\models;

use app\formatter\Status;
use yii\base\Exception;
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

	public static function isExist($aid)
	{
		return parent::findOne(['account_id' => $aid]) !== NULL;
	}

	public static function changeGroup($accountId,$groupId)
	{
		if(!static::checkAid($accountId) || !Group::checkGid($groupId)) return Status::INVALID_ARGS;
		$ar = parent::find()->where('`account_id`=:aid and (`account_group`=\'g_noAssign\' or `account_group`=:gid)',[':aid' => $accountId,':gid' => $groupId])->one();
		if($ar === NULL) return Status::INVALID_ARGS;

		if($ar->account_group == $groupId)
		{
			$ar->account_group = 'g_noAssign';
		}else{
			$ar->account_group = $groupId;
		}

		return $ar->update();
	}

	public static function getNoMembers($gid,$includeAdmin = true)
	{
	}

	public static function getMember($group,$admin)
	{
		if(!Group::checkGid($group)) return Status::INVALID_ARGS;

		$query = parent::find();

		$query->where('`account_group`=:gid',[':gid' => $group]);

		if(!$admin)
		{
			$query->andWhere('`role` != \'group_admin\'');
		}

		$query->orderBy(['role' => 'desc']);
		$query->select('`account_id`,`account_name`');

		$row = $query->asArray()->all();

		if($row === NULL)
		{
			return Status::INVALID_ARGS;
		}else{
			return $row;
		}
	}

	public static function getAdminList($groupId)
	{
		if(!Group::checkGid($groupId)) return Status::INVALID_ARGS;

		$ar = parent::find();
		$ar->select(['account_id','account_name']);
		$ar->where('(`account_group`=:gid and `role` != :role)',[':gid' => $groupId,':role' => Role::GROUP_ADMIN]);
		$ar->orWhere('`account_group`=\'g_noAssign\'');

		return $ar->asArray()->all();
	}

	public static function getNoAssign()
	{
		$query = parent::find();
		$query->where('`account_group`=\'g_noAssign\'');
		$query->select('`account_id`,`account_name`');

		$row = $query->asArray()->all();

		if($row === NULL)
		{
			return [];
		}else{
			return $row;
		}
	}

	public static function isNoAssign($aid)
	{
		$ar = parent::find()->where('`account_id`=:aid and `account_group`=\'g_noAssign\'',[':aid' => $aid])->count();
		return !!$ar;
	}

	public static function changeRole($aid,$role)
	{
		$ar = parent::find()->where('`account_id`=:aid',[':aid' => $aid])->one();
		$ar->role = $role;
		$ar->update();
	}

	public static function remove($accountId)
	{
		if(!static::checkAid($accountId)) return Status::INVALID_ARGS;
		$ar = parent::find()->where('`account_id`=:aid',[':aid' => $accountId])->one();
		if($ar === NULL) return Status::INVALID_ARGS;
		$transaction = \Yii::$app->getDb()->beginTransaction();

		try
		{
			if($ar->role == Role::GROUP_ADMIN)
			{
				Group::updateAll(['group_admin' => null],'`group_id`=:gid',[':gid' => $ar->account_group]);
			}
			$ar->delete();
			$transaction->commit();
		}catch (Exception $e)
		{
			$transaction->rollBack();
			return Status::DATABASE_SAVE_FAIL;
		}

		return Status::SUCCESS;
	}

	public static function add($accountName,$groupId)
	{
		if(!static::checkAccountName($accountName) || ($groupId != '0' && !Group::checkGid($groupId))) return Status::INVALID_ARGS;

		$model = new self();
		$model->account_name = $accountName;


		if($groupId == '0')
		{
			$model->account_group = 'g_noAssign';
		}else{
			$model->account_group = $groupId;
		}

		$model->role = Role::NORMAL;
		$model->password = \Yii::$app->params['defaultPassword'];
		$model->account_id = 'a_' . substr(uniqid(),-8);

		try
		{
			$model->insert();
		}catch(Exception $e)
		{
			return Status::DATABASE_SAVE_FAIL;
		}

		return $model->account_id;
	}

	public static function checkAccountName($accountName)
	{
		return is_string($accountName) && strlen($accountName) >= 2;
	}

	public static function changePwd($pwd,$uid)
	{
		if(!is_string($pwd) || strlen($pwd) < 5) return Status::INVALID_ARGS;

		$sql = "UPDATE `account` SET `password` = PASSWORD('$pwd') WHERE `account_id` = '$uid'";
		return (string) \Yii::$app->getDb()->createCommand($sql)->execute();
	}

}
