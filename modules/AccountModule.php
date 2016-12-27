<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2016/11/17
 * Time: 下午11:26
 */

namespace app\modules;

use yii\base\Component;
use app\models\Account;

class AccountModule extends Component
{
    public function getUid()
    {
        return \Yii::$app->getSession()->get('account_id');
    }

    public function getUserName()
    {
        return \Yii::$app->getSession()->get('account_name');
    }

    public function isLogin()
    {
        return \Yii::$app->getSession()->get('IS_LOGIN',false);
    }

    public function loginByAjax()
    {
        \Yii::$app->response->format = 'json';
        $model = new Account();
        $post = \Yii::$app->request->post();

        $model->load($post);

        if($model->validate())
        {
            if(($user = $model->login()))
            {
                $this->login($user,!!$model->remember);
                return ['status' => 1];
            }
            return ['status' => 0,'message' => '账户名或密码无效'];
        }else{
            return ['status' => 0,'message' => '账户名或密码无效'];
        }
    }

    public function loginByCookie()
    {

    }

    public function login($accountInfo,$remember = false)
    {
        $session = \Yii::$app->getSession();

        $account_id = $accountInfo['account_id'];
        unset($accountInfo['account_id']);

        $group = $accountInfo['account_group'];

        $account_name = $accountInfo['account_name'];

        $session->set('account_id',$account_id);
        $session->set('account_name',$account_name);

        \Yii::$app->cookie->set('group',$group);

        \Yii::$app->get('privilege')->set($accountInfo);

        if($remember)
        {
            \Yii::$app->cookie->set('login',['account_id' => $account_id]);
        }

        \Yii::$app->getSession()->set('IS_LOGIN',true);
    }

    public function getInfo()
    {
        \Yii::$app->response->format = 'json';

        if(\Yii::$app->request->isGet)
        {
            $model = new Account();
            return $model->findUser($this->getUid());
        }
    }
}