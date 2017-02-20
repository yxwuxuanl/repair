<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2016/11/15
 * Time: 下午7:05
 */

namespace app\controllers;

use app\filters\CustomResponseFilter;
use app\filters\LoginFilter;
use app\filters\RoleFilters;
use app\formatter\Status;
use app\models\Account;
use app\models\Event;
use app\models\Group;
use yii\base\Exception;
use yii\web\Controller;
use app\controllers\RoleController as Role;

class GroupController extends Controller
{
	const EVENT_DELETE = 'delete';


	public function behaviors()
	{
		return [
			'response' => [
				'class' => CustomResponseFilter::className(),
			],
			'role' => [
				'class' => RoleFilters::className(),
				'rules' => [
					'get-all' => Role::SYSTEM_ADMIN,
					'add' => Role::SYSTEM_ADMIN,
				]
			],
//			'login' => [
//				'class' => LoginFilter::className()
//			]
		];
	}

	public function actionGetAll($includeAdmin = true,$noAssign = true)
	{
		$row = Group::getAll($includeAdmin);

		if($noAssign)
		{
			unset($row['g_noassign']);
		}

		return $row;
	}

	public function actionAdd($groupName,$groupAdmin,$events)
	{
		$model = new Group(['scenario' => Group::CREATE]);

		$model->group_name = $groupName;
		$model->group_admin = $groupAdmin;
		$model->events = $events;
		$model->group_id = 'g_' . substr(uniqid(),-8);

		if(!$model->validate()) return Status::INVALID_ARGS;

		try
		{
			$model->insert();
		}catch (Exception $e)
		{
			return Status:: GROUP_EXIST;
		}

		return ['group_id' => $model->group_id];
	}

	public function actionRename($group,$name)
	{
		$query = Group::find();

		$query->where('`group_id`=:gid');
		$query->params([':gid' => $group]);

		$ar = $query->one();

		if($ar === NULL) return Status::INVALID_ARGS;

		$ar->scenario = Group::RENAME;
		$ar->group_name = $name;

		if(!$ar->validate()) return Status::INVALID_ARGS;

		try
		{
			$ar->update();
		}catch (Exception $e)
		{
			return Status::GROUP_EXIST;
		}

		return Status::SUCCESS;
	}

	public function actionDelete($group)
	{
		$query = Group::find();

		$query->where('`group_id`=:gid',[':gid' => $group]);
		$ar = $query->one();

		if($ar === NULL) return Status::INVALID_ARGS;
		$ar->delete();
		Account::clearGroup($group);

		return Status::SUCCESS;
	}

	public function actionChangeAdmin($group,$admin)
	{
		$ar = Group::find()->where('`group_id`=:gid',[':gid' => $group])->one();
		if($ar === NULL) return Status::INVALID_ARGS;
		$ar->group_admin = $admin;
		if(!$ar->validate()) return Status::INVALID_ARGS;

		try
		{
			$ar->update();
		}catch(\Exception $e)
		{
			return Status::DATABASE_SAVE_FAIL;
		}

		return Status::SUCCESS;
	}


	public function actionDeleteEvent($group,$event)
	{
		if(!Event::checkEid($event)) return Status::INVALID_ARGS;
		$ar = Group::find()->where('`group_id`=:gid',[':gid' => $group])->one();
		if($ar === NULL) return Status::INVALID_ARGS;
		$oldEvents = $ar->events;
		$ar->events = preg_replace('/' . $event.'(,)?/','',$oldEvents);
		$ar->update();
		return Status::SUCCESS;
	}

	public function actionAddEvent($group,$event)
	{
		if(!Event::checkEid($event) || !Event::isExist($event)) return Status::INVALID_ARGS;
		$ar = Group::find()->where('`group_id`=:gid',[':gid' => $group])->one();
		if($ar === NULL) return Status::INVALID_ARGS;
		$oldEvents = $ar->events;
		$ar->events = $oldEvents . ',' . $event;
		$ar->update();
		return Status::SUCCESS;
	}

	public function actionAddMember($aid,$group = NULL)
	{
		if(!Account::checkAid($aid) || !Account::isNoAssign($aid)) return Status::INVALID_ARGS;
		if(Role::is(Role::GROUP_ADMIN))
		{
			$group = \Yii::$app->getSession()->get('group');
		}else{
			if(!Group::checkGid($group) || !Group::isExist($group)) return Status::INVALID_ARGS;
		}
		Account::changeGroup($aid,$group);
		return Status::SUCCESS;
	}

	public function actionDeleteMember($aid)
	{
		$group = \Yii::$app->getSession()->get('group');
	}
}