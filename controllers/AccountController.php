<?php

namespace app\controllers;

use app\models\Account;
use yii\base\Component;
use yii\web\Controller;


class AccountController extends Controller
{
    public function actionInfo()
    {
        \Yii::$app->response->format = 'json';

        if(\Yii::$app->request->isGet)
        {
            $model = new Account();
            $info = $model->findUser(\Yii::$app->get('account')->getUid());

            if($info)
            {
                return array_merge(['status' => 1],$info);
            }else{
                return ['status' => 0];
            }
        }
    }
}
