<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2016/11/15
 * Time: 下午3:56
 */

namespace app\controllers;
use app\behaviors\NoCsrf;
use app\models\Account;
use yii\web\Controller;

class ServiceController extends Controller
{
    public function actionIndex()
    {
        if(!\Yii::$app->get('account')->isLogin())
        {
            return $this->render('login',['model' => new Account()]);
        }else{

            $data = [
                'pl' => \Yii::$app->privilege->get()
            ];

            return $this->render('index',$data);
        }
    }

    public function init()
    {
        \Yii::$app->set('service',$this);
    }

    public function actionLogin()
    {
        if(\Yii::$app->request->isAjax)
        {
            return \Yii::$app->account->loginByAjax();
        }
    }

    public function behaviors()
    {
        return [
            NoCsrf::className()
        ];
    }

}