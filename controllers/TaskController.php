<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2017/3/1
 * Time: 下午10:46
 */

namespace app\controllers;
use app\filters\CustomResponseFilter;
use app\models\Task;
use yii\web\Controller;

class TaskController extends Controller
{
	public function behaviors()
	{
		return [
			'response' => [
				'class' => CustomResponseFilter::className()
			]
		];
	}

	public function actionGetTask()
	{
		return Task::getAssignTask(AccountController::getAccountId());
	}

	public function actionGetTaskPool()
	{
		return Task::getTaskPool(\Yii::$app->getSession()->get('group'));
	}

	public function actionGetDetail($taskId)
	{
		return Task::getDetail($taskId);
	}

	public function actionFinish($taskId)
	{
		return Task::finish($taskId);
	}

	public function actionGetGroupUnderway()
	{
		return Task::getGroupUnderway(GroupController::getGroup());
	}
}
