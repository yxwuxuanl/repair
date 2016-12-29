<?php

namespace app\controllers;
use app\behaviors\NoCsrf;
use app\behaviors\Privilege;
use app\models\Account;
use yii\web\Controller;
use yii\web\ForbiddenHttpException;

class LoginController extends Controller
{
	public function actionAjax()
	{
		\Yii::$app->response->format = 'json';

		if(\Yii::$app->request->isAjax){

			$post = \Yii::$app->request->post();
			$model = new Account();

			$model->username = $post['un'];
			$model->password = $post['pwd'];

			if($model->validate()){

				if(!empty(($userData = $model->findUser()))){
					$this->login($userData);
					return ['status' => 1];
				}

				return ['status' => -1];
			}
			return ['status' => -2];
		}
		throw new ForbiddenHttpException();
	}

	public function actionCookie()
	{

	}

	public function login($userData)
	{
		$session = \Yii::$app->getSession();

		$session->set('account_name', array_shift($userData));

		\Yii::$app->cookie->set('group', array_shift($userData));

		$session->set('account_id', array_shift($userData));

		\Yii::$app->get('privilege')->set($userData);

		$session->set('IS_LOGIN', true);
	}

	public function behaviors()
	{
		return [
//			NoCsrf::className(),
			Privilege::className()
		];
	}
}