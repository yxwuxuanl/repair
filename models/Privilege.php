<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2016/11/10
 * Time: 下午4:20
 */

namespace app\models;

use yii\db\ActiveRecord;

class Privilege extends ActiveRecord
{
	const CHANGE = 'change';


	public static function tableName()
	{
		return 'privilege';
	}

	public function scenarios()
	{
		return parent::scenarios(); // TODO: Change the autogenerated stub
	}
}