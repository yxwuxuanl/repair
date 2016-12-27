<?php 

namespace app\models;

use yii\db\ActiveRecord;

class Event extends ActiveRecord
{
	public static function all()
	{
		return parent::find()->asArray()->limit(20)->all();
	}


}