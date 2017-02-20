<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2016/11/15
 * Time: 下午3:56
 */

namespace app\controllers;
use app\behaviors\NoCsrf;
use app\filters\LoginFilter;
use app\models\Account;
use yii\web\Controller;

class ServiceController extends Controller
{
    public function actionIndex()
    {
        if(!\Yii::$app->getSession()->get('IS_LOGIN',false))
        {
        	return $this->render('login');
        }else{
            return $this->render('index');
        }
    }
}