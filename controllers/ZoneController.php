<?php

namespace app\controllers;

use app\behaviors\Response;
use app\filters\CustomResponseFilter;
use app\filters\LoginFilter;
use app\filters\PrivilegeFilter;
use app\formatter\Status;
use app\models\CustomLabel;
use app\models\Event;
use app\models\ReportLabel;
use app\models\zeMap;
use app\models\Zone;
use yii\base\DynamicModel;
use yii\base\Exception;
use yii\web\Controller;
use yii\filters\VerbFilter;

class ZoneController extends Controller
{
    public function behaviors()
    {
        return [
//           'login' => [
//               'class' => LoginFilter::className(),
//			   'only' => ['add','rename','delete','remove-event']
//           ],
			'response' => [
				'class' => CustomResponseFilter::className()
			],
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

//	isRewrite
    public function actionRename($zoneId,$zoneName)
    {
		return Zone::rename($zoneId,$zoneName);
    }

    public function actionDelete($zoneId)
    {
		return Zone::remove($zoneId);
    }

	// is rewrite
    public function actionAdd($name,$parent)
    {
		return Zone::create($name,$parent);
    }

    // is rewrite
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

//    is rewrite
    public function actionRemoveEvent($zoneId,$eventId)
	{
		return Zone::removeEvent($zoneId,$eventId);
    }

    public function actionGetLabel($zid)
    {
		if(!Zone::checkZid($zid,true)) return Status::INVALID_ARGS;
		$result = ReportLabel::find()->where(['zone_id' => $zid])->asArray()->one();

		if(empty($result))
		{
			return Status::SUCCESS;
		}else{
			return $result;
		}
    }

//    is rewrite
    public function actionAddEvent($zoneId,$eventId)
	{
		return Zone::addEvent($zoneId,$eventId);
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

	public function actionGetEvent($zoneId)
	{
		return zeMap::getEvent($zoneId);
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
