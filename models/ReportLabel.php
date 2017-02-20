<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2017/1/19
 * Time: 下午4:39
 */

namespace app\models;

use yii\db\ActiveRecord;

class ReportLabel extends ActiveRecord
{
	public static function tableName()
	{
		return 'report_label';
	}
}
