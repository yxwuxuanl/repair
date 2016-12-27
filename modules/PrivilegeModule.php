<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2016/11/17
 * Time: 下午11:46
 */

namespace app\modules;
use yii\base\Component;

class PrivilegeModule extends Component
{
	public $list;

	// 注册权限列表到 Session
    public function set($pl)
    {
    	$pls = [];
    	$keys = array_keys($this->list);

    	foreach($pl as $name => $p)
    	{
    		if(in_array($name, $keys))
    		{
    			$pls[$name] = static::parse($p);
    		}
    	}

    	\Yii::$app->getSession()->set('privilege',$pls);
    }

    // 获取 Session 的权限列表
    public function get($name = null)
    {
    	$pl = \Yii::$app->getSession()->get('privilege');

    	if($name && isset($this->list[$name]))
    	{
    		return $pl[$name];
    	}

    	return $pl;
    }

    public function has($name)
    {
        $p = explode('_', $name);
        $pl = $this->get($p[0]);
        return in_array($p[1],$pl);
    }

    public function getLabel($name)
    {
        if(isset($this->list[$name]))
        {
            return $this->list[$name]['label'];
        }
    }

    public function getMenu($name,$level)
    {
        return $this->list[$name][$level]['menu'];
    }

    public function parse($p)
    {
    	$row = [];

        for($i = 1 ; $i <= $p ; $i = $i << 1)
        {
            if($i & $p)
            {
                $row[] = $i;
            }
        }

        return $row;
    }
}