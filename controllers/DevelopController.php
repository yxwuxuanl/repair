<?php

namespace app\controllers;

use app\behaviors\NoCsrf;
use yii\web\Controller;

class DevelopController extends Controller
{
    public function actionGetSession()
    {
        $sid = \Yii::$app->request->post('sid');
        $_COOKIE['PHPSESSID'] = $sid;
        \Yii::$app->response->format = 'json';
        return \Yii::$app->getSession();
    }

    public function behaviors()
    {
        return [
            NoCsrf::className()
        ];
    }

    public function actionSetSession()
    {
        \Yii::$app->response->format = 'json';
        $post = \Yii::$app->request->post();
        array_shift($post);
    }

    public function set($key,$current,$value)
    {

    }
}