<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2017/3/1
 * Time: 下午1:33
 */

namespace app\models;

use app\formatter\Status;
use Behat\Gherkin\Exception\Exception;
use yii\db\ActiveRecord;

class TaskTrace extends ActiveRecord
{
	public static function tableName()
	{
		return 'task_trace';
	}

	public function attributes()
	{
		return ['task_id','assign','trace_mode','complete_time'];
	}

	public static function add($task_id,$assign,$trace_mode)
	{
		$model = new self();

		$model->task_id = $task_id;
		$model->assign = $assign;
		$model->trace_mode = $trace_mode;

		$transaction = \Yii::$app->getDb()->beginTransaction();

		try
		{
			$model->insert();
			Task::updateAll(['status' => 1],'`task_id`=:tid',[':tid' => $task_id]);
			$transaction->commit();
		}catch(Exception $e)
		{
			$transaction->rollBack();
			return Status::DATABASE_SAVE_FAIL;
		}

		return Status::SUCCESS;
	}
}