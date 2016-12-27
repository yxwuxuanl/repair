<?php
/**
 * Created by PhpStorm.
 * User: lin2ur
 * Date: 2016/9/20
 * Time: 下午6:12
 */

namespace app\behaviors;
use yii\base\Behavior;
use yii\web\Controller;

class NoCsrf extends Behavior
{
    public function events()
    {
        return [Controller::EVENT_BEFORE_ACTION => function($event){
            $event->action->controller->enableCsrfValidation = false;
        }];
    }
}