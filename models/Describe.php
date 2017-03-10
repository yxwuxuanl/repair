<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2017/3/1
 * Time: 下午1:12
 */

namespace app\models;
use yii\db\ActiveRecord;

class Describe extends  ActiveRecord
{
	public static function tableName()
	{
		return 'describe';
	}

	public function attributes()
	{
		return ['task_id','content'];
	}

	public static function add($task_id,$content)
	{
		$model = new self();
		$model->task_id = $task_id;
		$model->content = $content;
		$model->insert();
	}

	public static function get($taskId)
	{
		return parent::find()->where('`task_id`=:tid',[':tid' => $taskId])->select('content')->scalar();
	}
}