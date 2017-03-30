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
			[['group_name','events','task_mode'],'required'],

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

            ['group_admin','default','value' => NULL],

            ['group_admin',function($attr){
		        if(!Account::checkAid($this->$attr))
                {
                    $this->addError($attr);
                }
            }],
		];
	}

	public static function hasEvent($group,$event)
	{
		$query = parent::find()
            ->where('`group_id` = :gid')
            ->select('events')
            ->params([':gid' => $group])
            ->scalar();

		return strpos($query,$event) > -1;
	}

	public static function changeAdmin($groupId,$adminId)
	{
	    if(!static::checkGid($groupId) || !Account::checkAid($adminId)) return Status::INVALID_ARGS;

	    try
        {
//            Trigger `group`.`changeGroupAdmin`
            parent::updateAll(['group_admin' => $adminId],'group_id = :gid',[':gid' => $groupId]);
        }catch(\yii\db\Exception $e)
        {
            return Status::DATABASE_SAVE_FAIL;
        }

        return Status::SUCCESS;
	}

	public static function getAll($includeAdmin = true)
	{
		$query = parent::find()
            ->where('group_id != :system')
            ->params([':system' => Group::G_SYSTEM])
            ->select(['group_id','group_name']);

		if($includeAdmin)
		{
			$query->leftJoin('account','`account`.`account_id`=`group`.`group_admin`')
                ->addSelect('account_name as group_admin,group_admin as account_id');
		}

		return $query->asArray()->all();
	}

	public static function checkGid($gid)
	{
		return is_string($gid) && strlen($gid) == 10 && substr($gid,0,2) == 'g_';
	}

	public static function isExist($gid)
	{
		return parent::find()->where('`group_id` = :gid',[':gid' => $gid])->one() !== NULL;
	}

	public static function remove($group)
	{
	    if(!static::checkGid($group)) return Status::INVALID_ARGS;

	    try
        {
//            Trigger `group`.`removeGroup`
            parent::deleteAll('group_id = :gid',[':gid' => $group]);
        }catch(\yii\db\Exception $e)
        {
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
		$model->task_mode = '1';
		$model->group_admin = $groupAdmin;
		$model->events = $events;
		$model->group_id = 'g_' . \Yii::$app->getSecurity()->generateRandomString(8);

		if(!$model->validate()) return Status::INVALID_ARGS;

		try
		{
//		    Trigger `group`.`createGroup`
            $model->insert();
		}catch (Exception $e)
		{
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

		$events = parent::find()
            ->where('`group_id` = :gid',[':gid' => $groupId])
            ->select('events')
            ->scalar();

		return Event::find()
            ->where(['in','event_id',explode(',',$events)])
            ->asArray()->all();
	}

	public static function removeGroupEvent($group,$event)
	{
		if(!static::checkGid($group) || !Event::checkEid($event)) return Status::INVALID_ARGS;
		$sql = "UPDATE `group` SET `events` = REPLACE(`events`,'{$event},','') WHERE `group_id` = '{$group}' LIMIT 1";
		return \Yii::$app->getDb()->createCommand($sql)->execute();
	}

	public static function addGroupEvent($group,$event)
	{
		if(!static::checkGid($group) || !Event::checkEid($event)) return Status::INVALID_ARGS;

		$sql = "UPDATE `group` SET `events` = CONCAT(`events`,'{$event},') WHERE `group_id` = '{$group}' LIMIT 1";
		return \Yii::$app->getDb()->createCommand($sql)->execute();
	}

	public static function changeTaskMode($group,$mode)
	{
		$mode = (int) $mode;
		if(!in_array($mode,[1,2,3,4])) return Status::INVALID_ARGS;

		try
        {
            parent::updateAll(['task_mode' => $mode],'group_id = :gid',[':gid' => $group]);
        }catch(\yii\db\Exception $e)
        {
            return Status::DATABASE_SAVE_FAIL;
        }

        return Status::SUCCESS;
	}

	public static function getTaskMode($group)
	{
		return parent::find()
            ->where('`group_id` = :gid',[':gid' => $group])
            ->select('task_mode')
            ->scalar();
	}

	public static function findByEvent($event)
	{
		return parent::find()
            ->where(['like','events',$event])
            ->asArray()->one();
	}

	public static function getGroupName($group)
	{
		return parent::find()
            ->where('`group_id`=:gid',[':gid' => $group])
            ->select('group_name')
            ->scalar();
	}

}
