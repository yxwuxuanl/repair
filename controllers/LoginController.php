<?php

namespace app\controllers;
use app\behaviors\NoCsrf;
use app\filters\CustomResponseFilter;
use app\formatter\Status;
use app\models\Account;
use yii\web\Controller;

class LoginController extends Controller
{
	public function actionAjax()
	{
		if(\Yii::$app->request->isAjax){
			$model = new Account();
			$model->scenario = Account::LOGIN;

			$model->account_name = \Yii::$app->request->post('un','');
			$model->password = \Yii::$app->request->post('pwd','');

			if(!$model->validate() || empty(($userData = $model->findUser()))) return Status::INVALID_LOGIN_INFO;
			$this->login($userData);

			return Status::SUCCESS;
		}else{
			\Yii::$app->response->statusCode = 403;
		}
	}

	public function actionCookie()
	{

	}

	public function login($userData)
	{
		$session = \Yii::$app->getSession();
		$session->set('uid',$userData['account_id']);
		$session->set('role',$userData['role']);
		$session->set('account_group',$userData['account_group']);
		$session->set('account_name',$userData['account_name']);
		$session->set('IS_LOGIN',true);
	}

	public function behaviors()
	{
		return [
			'response' => [
				'class' => CustomResponseFilter::className(),
				'only' => ['ajax','out']
			],
			NoCsrf::className()
		];
	}

	public function actionOut()
	{
		\Yii::$app->getSession()->destroy();
		return Status::SUCCESS;
	}
}