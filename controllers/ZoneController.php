<?php

namespace app\controllers;

use app\filters\CustomResponseFilter;
use app\filters\LoginFilter;
use app\filters\RoleFilters;
use app\formatter\Status;
use app\models\CustomLabel;
use app\models\zeMap;
use app\models\Zone;
use yii\web\Controller;
use app\controllers\RoleController as Role;

class ZoneController extends Controller
{
    public function behaviors()
    {
        return [
           'login' => [
               'class' => LoginFilter::className(),
			   'only' => ['add','delete','remove-event','rename','add-event','change-custom']
           ],
			'role' => [
				'class' => RoleFilters::className(),
				'rules' => [
					'add' => Role::SYSTEM_ADMIN,
					'rename' => Role::SYSTEM_ADMIN,
					'delete' => Role::SYSTEM_ADMIN,
					'remove-event' => Role::SYSTEM_ADMIN,
					'add-event' => Role::SYSTEM_ADMIN,
					'change-custom' => Role::SYSTEM_ADMIN
				]
			],
			'response' => [
				'class' => CustomResponseFilter::className()
			]
        ];
    }

    public function actionGetParent()
	{
		$row = Zone::getParent();

		if($row === NULL)
		{
			return Status::SUCCESS;
		}else{
			return $row;
		}
	}

    public function actionRename($zoneId,$zoneName)
    {
		return Zone::rename($zoneId,$zoneName);
    }

    public function actionDelete($zoneId)
    {
		return Zone::remove($zoneId);
    }

    public function actionAdd($name,$parent = null)
    {
		return Zone::create($name,$parent);
    }

    public function actionGetChildren($parent)
    {
		$row = Zone::getSubs($parent);
		if(!is_array($row))
		{
			return $row;
		}else{
			if(empty($row))
			{
				return Status::SUCCESS;
			}
			return $row;
		}
    }

    public function actionGetEvents($zoneId,$onlyIn = false)
    {
		return Zone::getEvent($zoneId,$onlyIn);
    }

    public function actionRemoveEvent($zoneId,$eventId)
	{
		return zeMap::removeZoneEvent($zoneId,$eventId);
    }

    public function actionAddEvent($zoneId,$eventId)
	{
		return zeMap::addZoneEvent($zoneId,$eventId);
    }

    public function actionGetCustom($zoneId)
	{
		$row = CustomLabel::get($zoneId);

		if($row === NULL)
		{
			return [Status::SUCCESS,null];
		}else{
			return $row;
		}
	}

	public function actionChangeCustom($zoneId,$tips,$test)
	{
		if(!Zone::checkZid($zoneId,true) || ($tips == '' && $test != '')) return Status::INVALID_ARGS;

		if($tips == '' && $test == '')
		{
			if(CustomLabel::remove($zoneId) === Status::SUCCESS)
			{
				return '删除成功';
			}else{
				return Status::DATABASE_SAVE_FAIL;
			}
		}

		if(CustomLabel::find()->where('`zone_id`=:zid',[':zid' => $zoneId])->count())
		{
			if(CustomLabel::edit($zoneId,$tips,$test) === Status::SUCCESS)
			{
				return '修改成功';
			}else{
				return Status::DATABASE_SAVE_FAIL;
			}
		}else{
			if(CustomLabel::add($zoneId,$tips,$test) === Status::SUCCESS)
			{
				return '添加成功';
			}else{
				return Status::DATABASE_SAVE_FAIL;
			}
		}
	}
}
