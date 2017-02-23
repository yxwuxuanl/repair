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

	public function actionGetAdminList($group)
	{
		return Account::getAdminList($group);
	}

	public function actionGetNoAssign()
	{
		return Account::getNoAssign();
	}

	public function actionAdd()
	{
		$model = new Account();
		$model->scenario = Account::CREATE;

		$model->account_name = \Yii::$app->getRequest()->post('account_name','');
		$model->account_group = \Yii::$app->getRequest()->post('group','g_noassign');
		$model->account_id = 'a_' . substr(uniqid(),-8);
		$model->role = Role::NORMAL;
		$model->password = \Yii::$app->params['defaultPassword'];

		if(!$model->validate()) return [Status::INVALID_ARGS,$model->errors];

		try
		{
			$model->insert();
		}catch (Exception $e)
		{
			return Status::ACCOUNT_EXIST;
		}

		return ['account_id' => $model->account_id];
	}

	public function actionDelete()
	{
		$model = new Account();
		$model->scenario = Account::DELETE;
		$aid = \Yii::$app->getRequest()->post('aid', false);

		$model->account_id = $aid;

		if (!$model->validate()) return [Status::INVALID_ARGS,$model->errors];
		if (!$model->deleteUser()) return Status::OTHER_ERROR;

		return Status::SUCCESS;
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
}
