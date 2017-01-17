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

	public function fail($error,$message = null)
	{
		\Yii::$app->response->format = 'json';

		$data = [];

		if(!is_numeric($error)){
			$data['status'] = -1;
			$data['describe'] = $error;
		}else{
			$data['status'] = $error;
			$data['describe'] = \Yii::$app->params['errorCode'][$error];
		}

		if($message){
			$data = array_merge($data,(array) $message);
		}

		return $data;
	}
}