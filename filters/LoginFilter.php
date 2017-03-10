<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2016/11/11
 * Time: 上午12:12
 */
namespace app\filters;

use yii\base\ActionFilter;

class LoginFilter extends ActionFilter
{
    function beforeAction($action)
    {
		if(!\Yii::$app->getSession()->get('IS_LOGIN',false))
		{
			\Yii::$app->getResponse()->statusCode = 403;
			return false;
		}else{
			return true;
		}
    }
}