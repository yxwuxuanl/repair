<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2017/1/19
 * Time: 下午4:39
 */

namespace app\models;

use app\formatter\Status;
use yii\base\Exception;
use yii\db\ActiveRecord;

class CustomLabel extends ActiveRecord
{
	public static function tableName()
	{
		return 'custom_label';
	}

	public static function get($zoneId)
	{
		if(!Zone::checkZid($zoneId,true))
		{
			return Status::INVALID_ARGS;
		}

		$row = parent::find()->where('`zone_id`=:zid',[':zid' => $zoneId])->asArray()->one();

		return $row;
	}

	public function attributes()
	{
		return ['tips','test','zone_id'];
	}

	public static function add($zoneId,$tips,$test)
	{
		if(!Zone::checkZid($zoneId)) return Status::INVALID_ARGS;
		$model = new self;

		$model->zone_id = $zoneId;
		$model->tips = $tips;
		$model->test = $test;

		try
		{
			$model->insert();
		}catch(Exception $e)
		{
			return Status::OTHER_ERROR;
		}

		return Status::SUCCESS;
	}

	public static function remove($zoneId)
	{
		try
		{
			parent::deleteAll('`zone_id`=:zid',[':zid' => $zoneId]);
		}catch (Exception $e)
		{
			return Status::OTHER_ERROR;
		}

		return Status::SUCCESS;
	}

	public static function edit($zoneId,$tips,$test)
	{
		try
		{
			parent::updateAll(['tips' => $tips,'test' => $test],'`zone_id`=:zid',[':zid' => $zoneId]);
		}catch (Exception $e)
		{
			return Status::OTHER_ERROR;
		}

		return Status::SUCCESS;
	}
}
