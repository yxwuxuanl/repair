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
	public $action;

    function beforeAction($action)
    {
		if(!$this->action){
			if(!\Yii::$app->getSession()->get('IS_LOGIN',false)){
				\Yii::$app->response->headers->add('status',403);
				return false;
			}
		}else if(is_array($this->action)){
			if(in_array($action,$this->action)){
				if(!\Yii::$app->getSession()->get('IS_LOGIN',false)){
					\Yii::$app->response->headers->add('status',403);
					return false;
				}
			}
		}else{
			if($this->action == $action){
				if(!\Yii::$app->getSession()->get('IS_LOGIN',false)){
					\Yii::$app->response->headers->add('status',403);
					return false;
				}
			}
		}

		return true;

    }
}