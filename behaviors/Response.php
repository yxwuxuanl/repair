<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2017/1/14
 * Time: 下午6:40
 */

namespace app\behaviors;

use yii\base\Behavior;

class Response extends Behavior
{
	public function success($data = null)
	{
		if(is_array($data)){
			$data['length'] = count($data);
		}

		\Yii::$app->response->format = 'json';

		if($data){
			return ['status' => 1,'content' => $data];
		}else{
			return ['status' => 1];
		}
	}

	public function fail($error,$message = '')
	{
		\Yii::$app->response->format = 'json';

		return array_merge(['status' => $error,'describe' => \Yii::$app->params['errorCode'][$error]],(array) $message);
	}
}