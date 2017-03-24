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

	public function findGroupUsers(){}

	public static function getAll()
	{
		return parent::find()
		    ->select(['account_id','account_name','role','group_name','account_group'])
		    ->where('`role` = :normal')
            ->orWhere('`role` = :ga')
            ->params([':normal' => Role::NORMAL,':ga' => Role::GROUP_ADMIN])
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
            ->asArray()
            ->one();
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

		$ar = parent::find()
            ->where('`account_id` = :aid')
            ->andWhere('`account_group` = :noAssign or `account_group`=:gid')
            ->params([':aid' => $accountId,':gid' => $groupId,':noAssign' => Group::G_NO_ASSIGN])
            ->one();

		if($ar->account_group == $groupId)
		{
			$ar->account_group = Group::G_NO_ASSIGN;
		}else{
			$ar->account_group = $groupId;
		}

		return $ar->update();
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
		    ->orWhere('`account_group` = :noAssign')
		    ->params([':gid' => $groupId,':normal' => Role::NORMAL,':noAssign' => Group::G_NO_ASSIGN])
            ->asArray()->all();
	}

	public static function getNoAssign()
	{
        return parent::find()
		    ->where('`account_group` = :noAssign')
            ->params([':noAssign' => Group::G_NO_ASSIGN])
		    ->select('`account_id`,`account_name`')
            ->asArray()->all();
	}

	public static function isNoAssign($aid)
	{
		return parent::find()
                ->where('`account_id`=:aid')
                ->params([':aid' => $aid])
                ->select('account_group')
                ->scalar() == Group::G_NO_ASSIGN;
	}

	public static function remove($accountId)
	{
		if(!static::checkAid($accountId)) return Status::INVALID_ARGS;

		$ar = parent::find()->where('`account_id` = :aid')
            ->params([':aid' => $accountId])
            ->one();

		$transaction = \Yii::$app->getDb()->beginTransaction();

		try
		{
			if($ar->account_group != Group::G_NO_ASSIGN)
			{
				$allocations = Allocation::find()
                    ->where('group_id = :gid')
                    ->params([':gid' => $ar->account_group]);

				$update = 0;
				$remove = [];

				foreach($allocations->each() as $allocation)
				{
					if(strpos($allocation->assign,$accountId) > -1)
					{
						if($allocation->assign == $accountId)
						{
							$remove[] = $allocation->allocation_id;
						}else{
							$update++;
						}
					}
				}

				if($update > 0)
				{
					$sql = "UPDATE `allocation` SET `assign` = REPLACE(`assign`,',{$accountId}',''),`assign` = REPLACE(`assign`,'{$accountId},','') WHERE `group_id` = '{$ar->account_group}' LIMIT {$update}";
					\Yii::$app->getDb()->createCommand($sql)->execute();
				}

				if(!empty($remove))
				{
					Allocation::deleteAll(['in','allocation_id',$remove]);
				}
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
		if(!static::checkAccountName($accountName) || ($groupId !== null && !Group::checkGid($groupId))) return Status::INVALID_ARGS;

		$model = new static();
		$model->account_name = $accountName;

		if($groupId === null)
		{
			$model->account_group = Group::G_NO_ASSIGN;
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

		$newPwd = \Yii::$app->getSecurity()->generatePasswordHash($pwd);

		return parent::updateAll(['password' => $newPwd],'`account_id` = :aid',[':aid' => $uid]);
	}
}
