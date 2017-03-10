<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2017/1/26
 * Time: 下午10:04
 */

namespace app\formatter;
use yii\base\Component;
use yii\helpers\ArrayHelper;
use yii\helpers\Json;
use app\formatter\Status;
use yii\web\ResponseFormatterInterface;

class CustomResponseFormatter extends Component implements ResponseFormatterInterface
{
	public function format($response)
	{
		if(($data = $response->data) !== null)
		{
			$response->getHeaders()->set('Content-Type', 'application/json; charset=UTF-8');
			$data = (array) $data;

			if(empty($data))
			{
				$response->content = Json::encode(['status' => Status::SUCCESS,'content' => []]);
				return;
			}

			if(!ArrayHelper::isAssociative($data) && is_string($data[0]) && key_exists($data[0],Status::$describe) && $data[0] != Status::SUCCESS){
				$responseData = $this->fail($data);
			}else{
				$responseData = $this->success($data);
			}

			$response->content = Json::encode($responseData);
		}
	}

	public function success($data)
	{
		$response = ['status' => 1];

		if(!ArrayHelper::isAssociative($data) && is_string($data[0]) && $data[0] == Status::SUCCESS)
		{
			array_shift($data);
		}

		$response['content'] = $data;

		return $response;
	}

	public function fail($data)
	{
		$response = ['status' => $data[0]];
		$response['describe'] = Status::$describe[$data[0]];
		array_shift($data);

		$response['message'] = $data;
		return $response;
	}
}