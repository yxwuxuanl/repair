<?php

namespace app\controllers;
use app\filters\CustomResponseFilter;
use app\formatter\Status;
use app\models\Account;
use yii\web\Controller;

class LoginController extends Controller
{
	public function actionAjax()
	{
		if(\Yii::$app->request->isAjax){

		    $un = \Yii::$app->getRequest()->post('un',NULL);
		    $pwd = \Yii::$app->getRequest()->post('pwd',NULL);

		    if($un === NULL || $pwd === NULL) return Status::INVALID_LOGIN_INFO;

			$row = Account::findUser($un,$pwd);

			if($row === NULL) return Status::INVALID_LOGIN_INFO;

			$this->login($row);
			return Status::SUCCESS;
		}else{
			\Yii::$app->response->statusCode = 403;
		}
	}

	public function actionCookie(){}

	public function login($userData)
	{
		$session = \Yii::$app->getSession();
		$session->set('uid',$userData['account_id']);
		$session->set('role',$userData['role']);
		$session->set('group',$userData['account_group']);
		$session->set('account_name',$userData['account_name']);
		$session->set('IS_LOGIN',true);
	}

	public function behaviors()
	{
		return [
			'response' => [
				'class' => CustomResponseFilter::className(),
				'only' => ['ajax','login-out']
			]
		];
	}

	public function actionLoginOut()
	{
		\Yii::$app->getSession()->set('IS_LOGIN',false);
		return Status::SUCCESS;
	}
}