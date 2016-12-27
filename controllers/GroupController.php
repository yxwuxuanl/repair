<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2016/11/15
 * Time: 下午7:05
 */

namespace app\controllers;
use yii\base\Component;

class GroupController extends Component
{
    public function set($group)
    {
        \Yii::$app->getSession()->set('group',explode(',',$group));
    }

    public function get($uid = null)
    {
        if(!$uid)
        {
            if(!\Yii::$app->getSession()->get('group',false))
            {
                $this->set($this->getUserGroup(\Yii::$app->account->uid));
            }
        }

        return \Yii::$app->getSession()->get('group');
    }

    public function getUserGroup($uid)
    {
        
    }

    public function inGroup()
    {

    }

    public function changeAccountGroup($uid,$group)
    {

    }
}