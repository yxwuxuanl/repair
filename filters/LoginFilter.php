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
        parent::beforeAction($action);
        return \Yii::$app->getSession()->get('IS_LOGIN',false);
    }
}