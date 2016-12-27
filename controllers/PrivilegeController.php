<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2016/11/10
 * Time: 下午3:47
 */

namespace app\controllers;

use app\models\Privilege;
use yii\base\Component;
use yii\web\ForbiddenHttpException;

class PrivilegeController extends Component
{
    public function set($uid = null,$privilege = null)
    {

    }

    public function get()
    {
        return \Yii::$app->getSession()->get('privilege');
    }

    public function register($privilege)
    {
        foreach($privilege as $index => $value)
        {
            $privilege[$index] = $this->compute($value);
        }

        \Yii::$app->getSession()->set('privilege',$privilege);
    }

    public function compute($privilege)
    {
        $pl = [];

        foreach([1,2,4,8,16] as $p)
        {
            if($p & $privilege)
            {
                $pl[] = $p;
            }
        }

        return count($pl) == 1 ? $pl[0] : $pl;
    }

}