<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2016/11/10
 * Time: 下午3:47
 */

namespace app\controllers;

use \yii\base\Controller;

class PrivilegeController extends Controller
{
    public static function set($privilegeList)
    {
		$session = \Yii::$app->getSession();
		$privileges = [];

		foreach($privilegeList as $name => $value){
			$privileges[$name] = static::compute($value);
		}

		$session->set('Privilege',$privileges);
    }

    public function get()
    {
        return \Yii::$app->getSession()->get('Privilege');
    }

    public static function compute($value)
    {
        $list = [];

		for($i = 1 ; $i <= $value ; $i = $i << 1){
			if($value & $i){
				$list[] = $i;
			}
		}

        return $list;
    }

    public static function getLabel($privilege)
	{
		return \Yii::$app->params['privilege'][$privilege]['label'];
	}

	public static function getPanels($privilege,$level)
	{
		return \Yii::$app->params['privilege'][$privilege][$level]['panels'];
	}

	public static function getDesc($privilege,$level)
	{
		return \Yii::$app->params['privilege'][$privilege][$level]['desc'];
	}

	public static function has($privilege)
	{
		list($name,$level) = explode('_',$privilege);
		$privileges = \Yii::$app->getSession()->get('Privilege');
		return in_array($level,$privileges[$name]);
	}

}