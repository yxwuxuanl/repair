<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2017/2/3
 * Time: 下午2:11
 */

namespace app\models;

use yii\db\ActiveRecord;

class Task extends ActiveRecord
{
	public static function tableName()
	{
		return 'task';
	}

	public function attributes()
	{
		return ['task_id','reporter_name','reporter_id','reporter_tel','','event_id','detalis'];
	}
}