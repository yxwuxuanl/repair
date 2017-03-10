<?php 

namespace app\controllers\index;
use app\models\Group;
use app\models\Task;
use yii\web\Controller;
use app\controllers\RoleController as Role;

class NormalController extends Controller
{
	public function actionIndex()
	{
		$session = \Yii::$app->getSession();
		$taskNumber = Task::getTaskNumber($session->get('uid'),$session->get('group'));
		$group = Group::find()->where('`group_id`=:gid',[':gid' => $session->get('group')])->asArray()->one();

		$data = [
			'accountName' => \Yii::$app->getSession()->get('account_name'),
			'underway' => $taskNumber[1],
			'groupPool' => $taskNumber[2],
			'complete' => $taskNumber[0],
			'groupName' => $group['group_name'],
			'isGm' => Role::is(Role::GROUP_ADMIN),
			'taskMode' => $group['task_mode']
		];
		return $this->renderPartial('/index/normal',$data);
	}
}