<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2016/12/30
 * Time: 上午11:09
 */

namespace app\models;

use yii\db\ActiveRecord;

class zeMap extends ActiveRecord
{
	public static function tableName()
	{
		return 'zone_event_map';
	}

	public static function all()
	{
		return parent::find()->asArray()->all();
	}
}