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
use app\models\Allocation;
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

	public function actionGetTaskMode()
	{
		return [Status::SUCCESS,Group::getTaskMode(static::getGroup())];
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
		$setting['member'] = Account::getMember($group,false);
		$setting['noAssign'] = Account::getNoAssign();

		if($setting['mode'] == '2' || $setting['mode'] == '4')
		{
			$setting['rule'] = Allocation::getGroupRule($group);

			foreach($setting['rule'] as $item)
			{
				$events[] = $item['event'];
				$assigns = array_merge($assigns,$item['assign']);
			}

			foreach (Event::find()->where(['in','event_id',$events])->each() as $item)
			{
				$eventMap[$item['event_id']] = $item['event_name'];
			}

			foreach (Account::find()->where(['in','account_id',$assigns])->each() as $item)
			{
				$assignsMap[$item['account_id']] = $item['account_name'];
			}

			$setting['eventMap'] = $eventMap;
			$setting['assignsMap'] = $assignsMap;
		}

		return $setting;
	}

	public function actionChangeAdmin($groupId,$adminId)
	{
		return Group::changeAdmin($groupId,$adminId);
	}

	public function actionRemoveEvent($groupId,$eventId)
	{
		return (string) Group::removeEvent($groupId,$eventId);
	}

	public function actionAddEvent($groupId,$eventId)
	{
		return Group::addEvent($groupId,$eventId);
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
		Account::changeGroup($aid,'g_noAssign');
		return Status::SUCCESS;
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

		foreach (Account::getMember($group,true) as $account)
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