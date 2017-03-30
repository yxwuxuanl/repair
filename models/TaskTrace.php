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
		return ['task_id','assign','trace_mode','complete_time','trace_time'];
	}

	public static function Trace($task_id, $assign, $trace_mode)
	{
	    if($trace_mode == '3')
        {
            return parent::updateAll(['assign' => $assign],'task_id = :tid',[':tid' => $task_id]);
        }

		$model = new self();

		$model->task_id = $task_id;
		$model->assign = $assign;
		$model->trace_mode = $trace_mode;

        $model->insert();
	}
}