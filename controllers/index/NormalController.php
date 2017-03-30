<?php 

namespace app\controllers\index;
use app\controllers\AccountController;
use app\controllers\AllocationController;
use app\controllers\GroupController;
use app\models\Group;
use app\models\Task;
use app\models\TaskCount;
use yii\web\Controller;
use app\controllers\RoleController as Role;

class NormalController extends Controller
{
	public function actionIndex()
	{
		$session = \Yii::$app->getSession();
        $allSum = TaskCount::getSum(AccountController::getAccountId());
        $weekSum = TaskCount::getSum(AccountController::getAccountId(),date('Y.W'));

        $data = [
            'accountName' => $session->get('account_name'),
            'isGa' => Role::is(Role::GROUP_ADMIN),
            'groupName' => Group::getGroupName(GroupController::getGroup()),
            'efficient' => $allSum['efficient'] ? $allSum['efficient'] : 0,
            'allDone' => $allSum['complete'] ? $allSum['complete'] : 0,
            'weekDone' => $weekSum['complete'] ? $weekSum['complete'] : 0,
            'underway' => $allSum['underway'] ? $allSum['underway'] : 0,
            'weekEfficient' => $weekSum['efficient'] ? $weekSum['efficient'] : 0
        ];

		return $this->renderPartial('/index/normal',$data);
	}
}