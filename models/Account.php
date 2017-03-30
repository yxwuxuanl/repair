<?php

namespace app\models;

use app\formatter\Status;
use yii\base\Exception;
use yii\db\ActiveRecord;
use app\controllers\RoleController as Role;

class Account extends ActiveRecord
{
	public static function tableName()
	{
		return 'account';
	}

	public function rules()
	{
		return [
			[['account_name'],'required'],
			['account_name','string','max' => 20,'min' => 2],
            ['account_name','checkAccountName'],
			['account_group','default','value' => NULL],
			['account_group',function($attr){
				if($this->$attr !== NULL && !Group::checkGid($this->$attr))
				{
					$this->addError($attr);
				}
			}]
		];
	}

	public function attributes()
	{
		return ['account_name','password','account_id','account_group','role'];
	}

	public static function getAll()
	{
		return parent::find()
		    ->select(['account_id','account_name','role','group_name','account_group'])
		    ->where('`role` != :system')
            ->params([':system' => Role::SYSTEM_ADMIN])
		    ->leftJoin('group','`account_group` = `group_id`')
            ->groupBy(['account_id','account_name','role','group_name','account_group'])
            ->asArray()->all();
	}

	public static function findUser($un,$pwd)
	{
		return parent::find()
		    ->where('`account_name`=:an')
            ->andWhere('password = PASSWORD(:pwd)')
		    ->params([':an' => $un,':pwd' => $pwd])
            ->asArray()->one();
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
		if(!static::checkAid($accountId) || ($groupId && !Group::checkGid($groupId))) return Status::INVALID_ARGS;

        try
        {
            parent::updateAll(['account_group' => $groupId],'account_id = :aid',[':aid' => $accountId]);
        }catch(\yii\db\Exception $e)
        {
            return Status::DATABASE_SAVE_FAIL;
        }

        return Status::SUCCESS;
	}

	public static function getMember($group,$onlyNormal = false)
	{
		if(!Group::checkGid($group)) return Status::INVALID_ARGS;

		$ar = parent::find()
		    ->where('`account_group` = :gid')
            ->params([':gid' => $group])
		    ->orderBy(['role' => 'desc'])
		    ->select('`account_id`,`account_name`');

		if($onlyNormal)
        {
            $ar->andWhere('role != :ga',[':ga' => Role::GROUP_ADMIN]);
        }

        return $ar->asArray()->all();
    }

	public static function getAdminList($groupId)
	{
		if(!Group::checkGid($groupId)) return Status::INVALID_ARGS;

		return parent::find()
		    ->select(['account_id','account_name'])
		    ->where('`account_group` = :gid and `role` = :normal')
		    ->orWhere('`account_group` is null')
		    ->params([':gid' => $groupId,':normal' => Role::NORMAL])
            ->asArray()->all();
	}

	public static function getNoAssign()
	{
        return parent::find()
		    ->where('`account_group` is null')
		    ->select('`account_id`,`account_name`')
            ->asArray()->all();
	}

	public static function isNoAssign($aid)
	{
		return parent::find()
                ->where('`account_id` = :aid')
                ->params([':aid' => $aid])
                ->select('account_group')
                ->scalar() === NULL;
	}

	public static function remove($accountId)
	{
		if(!static::checkAid($accountId)) return Status::INVALID_ARGS;

		$ar = parent::find()->where('`account_id` = :aid')
            ->params([':aid' => $accountId])
            ->one();

		try
		{
		    // Trigger `account`.`clearAllocation`
			$ar->delete();
		}catch (Exception $e)
		{
			return Status::DATABASE_SAVE_FAIL;
		}

		return Status::SUCCESS;
	}

	public static function add($accountName,$groupId)
	{
		$model = new self();

		$model->account_name = $accountName;
        $model->account_group = $groupId;
        $model->role = Role::NORMAL;
        $model->password = \Yii::$app->params['defaultPassword'];

		$model->account_id = 'a_' . \Yii::$app->getSecurity()->generateRandomString(8);
		if(!$model->validate()) return Status::INVALID_ARGS;

		try
		{
//		    Trigger `account`.`encryptPassword`
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

//      Trigger `account`.`changePassword`
		return parent::updateAll(['password' => $pwd],'`account_id` = :aid',[':aid' => $uid]);
	}
}
