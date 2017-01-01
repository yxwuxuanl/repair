<?php 

namespace app\models;

use yii\db\ActiveRecord;

class Event extends ActiveRecord
{

	public static function tableName()
	{
		return 'event';
	}

	public static function all()
	{
		return parent::find()->asArray()->all();
	}
}