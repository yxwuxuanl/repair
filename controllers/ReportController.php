<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2016/11/15
 * Time: 下午3:56
 */

namespace app\controllers;
use app\filters\CustomResponseFilter;
use yii\web\Controller;

class ReportController extends Controller
{
    public function actionIndex()
    {
        return $this->render('index.html');
    }

    public function actionPost()
    {
        return \Yii::$app->getRequest()->post();        
    }


    public function behaviors()
	{
		return [
			'response' => [
				'class' => CustomResponseFilter::className(),
				'only' => ['post']
			]
		];
	}
}