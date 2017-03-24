<?php
namespace app\controllers;

use app\filters\CustomResponseFilter;
use app\filters\RoleFilters;
use app\models\Account;
use yii\web\Controller;
use app\controllers\RoleController as Role;
use app\filters\LoginFilter;


class AccountController extends Controller
{
	public function behaviors()
	{
		return [
			'response' => [
				'class' => CustomResponseFilter::className()
			],
			'role' => [
				'class' => RoleFilters::className(),
				'rules' => [
					'get-all' => Role::SYSTEM_ADMIN,
					'delete' => Role::SYSTEM_ADMIN,
					'get-admin-list' => Role::SYSTEM_ADMIN,
					'change-group' => Role::GROUP_ADMIN,
					'get-no-assign' => Role::GROUP_ADMIN,
					'add' => Role::SYSTEM_ADMIN
				]
			],
			'login' => [
				'class' => LoginFilter::className(),
				'only' => ['get-all','delete','get-admin-list','change-group','get-no-assign','change-pwd','add']
			]
		];
	}

    public function actionGetAll()
	{
		return Account::getAll();
	}

	public function actionGetAdminList($groupId)
	{
		return Account::getAdminList($groupId);
	}

	public function actionChangeGroup($accountId)
	{
		return (string) Account::changeGroup($accountId,GroupController::getGroup());
	}

	public function actionGetNoAssign()
	{
		return Account::getNoAssign();
	}

	public function actionChangePwd($pwd)
	{
		return Account::changePwd($pwd,\Yii::$app->getSession()->get('uid'));
	}

	public function actionAdd($accountName,$groupId = null)
	{
		return Account::add($accountName,$groupId);
	}

	public function actionDelete($accountId)
	{
		return Account::remove($accountId);
	}

	public static function getAccountId()
	{
		return \Yii::$app->getSession()->get('uid');
	}
}
