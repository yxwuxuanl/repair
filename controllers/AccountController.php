<?php
namespace app\controllers;

use app\behaviors\NoCsrf;
use app\filters\CustomResponseFilter;
use app\filters\LoginFilter;
use app\filters\RoleFilters;
use app\formatter\Status;
use app\models\Account;
use app\models\Group;
use yii\base\Exception;
use yii\web\Controller;
use app\controllers\RoleController as Role;


class AccountController extends Controller
{
    public function actionInfo($uid)
    {

    }

    public function actionGetAll()
	{
		return Account::getUserList();
	}

	public function actionGetAdminList($groupId)
	{
		return Account::getAdminList($groupId);
	}

	public function actionChangeGroup($accountId)
	{
		return (string) Account::changeGroup($accountId,\Yii::$app->getSession()->get('group'));
	}

	public function actionGetNoAssign()
	{
		return Account::getNoAssign();
	}

	public function actionChangePwd($pwd)
	{
		return Account::changePwd($pwd,\Yii::$app->getSession()->get('uid'));
	}

	public function actionAdd($accountName,$groupId)
	{
		return Account::add($accountName,$groupId);
	}

	public function actionDelete($accountId)
	{
		return Account::remove($accountId);
	}

	public function behaviors()
	{
		return [
			'response' => [
				'class' => CustomResponseFilter::className()
			],
			'role' => [
				'class' => RoleFilters::className(),
				'rules' => [
//					'get-all' => Role::SYSTEM_ADMIN,
					'delete' => Role::SYSTEM_ADMIN
				]
			],
//			'login' => [
//				'class' => LoginFilter::className()
//			],
			NoCsrf::className()
		];
	}

	public static function getAccountId()
	{
		return \Yii::$app->getSession()->get('uid');
	}
}
