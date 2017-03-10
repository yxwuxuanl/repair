<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2017/3/1
 * Time: 上午11:12
 */

namespace app\models;
use yii\db\ActiveRecord;

class Test extends ActiveRecord
{
	public $a;
	public $b;

	function attributes()
	{
		return ['zone_id','test','tips'];
	}

	static function tableName()
	{
		return 'custom_label';
	}
}