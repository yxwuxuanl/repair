<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2017/3/1
 * Time: 下午10:46
 */

namespace app\controllers;
use app\filters\CustomResponseFilter;
use app\filters\LoginFilter;
use app\filters\RoleFilters;
use app\models\Task;
use yii\web\Controller;
use app\controllers\RoleController as Role;

class TaskController extends Controller
{
	public function behaviors()
	{
		return [
			'response' => [
				'class' => CustomResponseFilter::className()
			],
            'role' => [
                'class' => RoleFilters::className(),
                'rules' => [
                    'get-complete-by-account' => [Role::NORMAL,Role::GROUP_ADMIN]
                ]
            ],
            'login' => [
                'class' => LoginFilter::className(),
                'only' => ['get-complete-by-account']
            ]
		];
	}

    public function actionGetCompleteByAccount()
    {
        return Task::getCompleteByAccount(AccountController::getAccountId());
    }

	public function actionGetUnderwayTask()
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

	public function actionGetGroupTask($complete = 0,$underway = 0)
	{
        if($complete)
        {
            return Task::getByGroup(GroupController::getGroup(),2);
        }

        if($underway)
        {
            return Task::getByGroup(GroupController::getGroup(),1);
        }
	}
}
