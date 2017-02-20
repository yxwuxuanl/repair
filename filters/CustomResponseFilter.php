<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2017/1/30
 * Time: 上午1:06
 */

namespace app\filters;
use app\formatter\CustomResponseFormatter;
use yii\base\ActionFilter;
use yii\base\Event;
use yii\web\Response;

class CustomResponseFilter extends ActionFilter
{
	public $use = [];

	public function beforeAction($action)
	{
		$response = \Yii::$app->getResponse();
		$response->formatters['custom'] = 'app\formatter\CustomResponseFormatter';
		$response->format = 'custom';
		return true;
	}
}