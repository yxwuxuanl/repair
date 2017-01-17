<?php

namespace app\controllers;
use app\behaviors\NoCsrf;
use app\behaviors\Privilege;
use app\behaviors\Response;
use app\models\Account;
use yii\web\Controller;
use yii\web\ForbiddenHttpException;

class LoginController extends Controller
{
	public function actionAjax()
	{
		if(!\Yii::$app->request->isAjax){
			\Yii::$app->response->statusCode = 403;
			return $this->fail('');
		}

		$post = \Yii::$app->request->post();
		$model = new Account();

		$model->username = $post['un'];
		$model->password = $post['pwd'];

		if(!$model->validate()) return $this->fail(REP_MODEL_VALIDATE_FAIL);
		if(empty(($userData = $model->findUser()))) return $this->fail('无效的登录信息');

		$this->login($userData);
		return $this->success();
	}

	public function actionCookie()
	{

	}

	public function login($userData)
	{
		$session = \Yii::$app->getSession();
//
		$session->set('account_name', array_shift($userData));
//
//		\Yii::$app->cookie->set('group', array_shift($userData));
//
		$session->set('account_id', array_shift($userData));
//
//		\Yii::$app->get('privilege')->set($userData);
		PrivilegeController::set($userData);
//
		$session->set('IS_LOGIN', true);
	}

	public function behaviors()
	{
		return [
			Response::className(),
			NoCsrf::className()
		];
	}
}