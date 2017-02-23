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
//			'role' => [
//				'class' => RoleFilters::className(),
//				'rules' => [
//					'get-all' => Role::SYSTEM_ADMIN,
//					'add' => Role::SYSTEM_ADMIN,
//				]
//			],
//			'login' => [
//				'class' => LoginFilter::className()
//			]
		];
	}

	public function actionGetAll($includeAdmin = true,$noAssign = false)
	{
		$row = Group::getAll($includeAdmin);

		unset($row['system']);

		if(!$noAssign)
		{
			unset($row['g_noassign']);
		}

		if(empty($row))
		{
			return Status::SUCCESS;
		}else{
			return $row;
		}
	}

	public function actionAdd($groupName,$groupAdmin,$events)
	{
		$id = Group::create($groupName,$groupAdmin,$events);
		return $id;
		if(key_exists($id,Status::$describe))
		{
			return $id;
		}else{
			return ['gid' => $id];
		}
	}

	public function actionRename($group,$name)
	{
		if(!Group::checkGid($group)) return Status::INVALID_ARGS;
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
		return Group::remove($group);
	}

	public function actionChangeAdmin($group,$admin)
	{
		return Group::changeAdmin($group,$admin);
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
		if(!Account::checkAid($aid) || !Account::isExist($aid)) return Status::INVALID_ARGS;
		Account::changeGroup($aid,'g_noassign');
		return Status::SUCCESS;
	}
}