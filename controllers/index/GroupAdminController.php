<?php
namespace app\controllers\index;
use app\models\Group;
use app\models\Task;
use yii\web\Controller;

class GroupAdminController extends Controller
{
	public function actionIndex()
	{
		$session = \Yii::$app->getSession();
		$taskNumber = Task::getTaskNumber($session->get('uid'),$session->get('group'));

		$data = [
			'accountName' => \Yii::$app->getSession()->get('account_name'),
			'underway' => $taskNumber[1],
			'groupPool' => $taskNumber[2],
			'complete' => $taskNumber[0],
			'groupName' => Group::getGroupName($session->get('group'))
		];
		return $this->renderPartial('/index/normal',$data);
	}
}