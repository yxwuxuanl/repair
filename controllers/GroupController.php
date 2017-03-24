<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2016/11/15
 * Time: 下午7:05
 */

namespace app\controllers;

use app\filters\CustomResponseFilter;
use app\formatter\Status;
use app\models\Account;
use app\models\Allocation;
use app\models\Event;
use app\models\Group;
use yii\web\Controller;
use app\controllers\RoleController as Role;
use app\filters\RoleFilters;

class GroupController extends Controller
{
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
					'rename' => Role::SYSTEM_ADMIN,
					'delete' => Role::SYSTEM_ADMIN,
					'change-task-mode' => Role::GROUP_ADMIN,
					'get-setting' => Role::GROUP_ADMIN,
					'change-admin' => Role::SYSTEM_ADMIN,
					'add-member' => Role::GROUP_ADMIN,
					'delete-member' => Role::GROUP_ADMIN,
					'get-event' => Role::SYSTEM_ADMIN,
					'get-create-rule-info' => Role::GROUP_ADMIN,
					'get-create-data' => Role::SYSTEM_ADMIN
				]
			],
//			'login' => [
//				'class' => LoginFilter::className()
//			]
		];
	}

	public function actionGetAll($includeAdmin = true)
	{
		$row = Group::getAll($includeAdmin);

		if(empty($row))
		{
			return Status::SUCCESS;
		}else{
			return $row;
		}
	}

	public function actionAdd($groupName,$events,$groupAdmin = NULL)
	{
		return Group::create($groupName,$groupAdmin,$events);
	}

	public function actionRename($groupId,$groupName)
	{
		return Group::rename($groupId,$groupName);
	}

	public function actionDelete($groupId)
	{
		return Group::remove($groupId);
	}

	public function actionChangeTaskMode($mode)
	{
		return Group::changeTaskMode(static::getGroup(),$mode);
	}

	public static function getGroup()
	{
		return \Yii::$app->getSession()->get('group');
	}

	public function actionGetSetting()
	{
		$group = static::getGroup();
		$setting = [];

		$events = [];
		$assigns = [];

		$eventMap = [];
		$assignsMap = [];

		$setting['mode'] = Group::getTaskMode($group);
		$setting['member'] = Account::getMember($group,true);
		$setting['noAssign'] = Account::getNoAssign();

		if($setting['mode'] == '2' || $setting['mode'] == '4')
		{
			$setting['rule'] = Allocation::getGroupRule($group);
		}

		return $setting;
	}

	public function actionChangeAdmin($groupId,$adminId)
	{
		return Group::changeAdmin($groupId,$adminId);
	}

	public function actionRemoveEvent($groupId,$eventId)
	{
		return (string) Group::removeGroupEvent($groupId,$eventId);
	}

	public function actionAddEvent($groupId,$eventId)
	{
		return Group::addGroupEvent($groupId,$eventId);
	}

	public function actionAddMember($accountId)
	{
		if(!Account::checkAid($accountId) || !Account::isNoAssign($accountId)) return Status::INVALID_ARGS;
		return Account::changeGroup($accountId,GroupController::getGroup());
	}

	public function actionDeleteMember($aid)
	{
		if(!Account::checkAid($aid) || !Account::isExist($aid)) return Status::INVALID_ARGS;
		return Account::changeGroup($aid,'g_noAssign');
	}

	public function actionGetEvent($groupId)
	{
		return Group::getEvent($groupId);
	}

	public function actionGetCreateRuleInfo()
	{
		$group = static::getGroup();

		$bindEvents = [];
		$bindMember = [];

		foreach(Allocation::find()->where('`group_id`=:gid',[':gid' => $group])->each() as $rule)
		{
			if($rule['level'] >= 1)
			{
				$bindEvents[] = $rule['event'];

				if($rule['level'] == 2)
				{
					$bindMember = array_merge(explode(',',$rule['assign']),$bindMember);
				}
			}
		}

		$events = [];
		$members = [];

		foreach(Group::getEvent($group) as $event)
		{
			if(!in_array($event['event_id'],$bindEvents))
			{
				$events[] = $event;
			}
		}

		foreach (Account::getMember($group) as $account)
		{
			if(!in_array($account['account_id'],$bindMember))
			{
				$members[] = $account;
			}
		}

		return ['events' => $events,'members' => $members];
	}

	public function actionGetCreateData()
	{
		return [
			'account' => Account::getNoAssign(),
			'event' => Event::getNoAssign()
		];
	}
}