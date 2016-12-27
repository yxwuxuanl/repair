<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2016/11/14
 * Time: 下午11:30
 */

namespace app\controllers;

use yii\base\Component;

class CookieController extends Component
{
    public $cookies;
    public $securityKey;
    public $cookie;

    public function __get($name)
    {
        if(array_key_exists(strtolower($name),$this->cookies))
        {
            $getter = 'get' . ucfirst($name);

            if(method_exists($this,$getter))
            {
                return $this->$getter();
            }else{
                return $this->get($name);
            }
        }
        return parent::__get($name);
    }

    public function __set($name,$value)
    {
        $setter = 'set' . ucfirst($name);

        if(array_key_exists(strtolower($name),$this->cookies) && method_exists($this,$setter))
        {
            return call_user_func_array([$this,$setter],$value);
        }
    }

    public function set($name,$value)
    {
        $config = $this->cookies[$name];

        $format = '{expire}-' . $config['format'];
        $expire = isset($config['expire']) ? time() + $config['expire'] * 60 * 60 * 24 : 0;

        if(isset($config['ipValidate']) && $config['ipValidate'])
        {
            $format .= '-{ip}';
        }

        $cookie = str_replace(['{expire}','{ip}'],[$expire,\Yii::$app->request->getUserIP()],$format);

        $matches = [];
        preg_match_all('/\{[a-zA-Z0-9_]+\}/',$cookie,$matches);

        $cookie = str_replace($matches[0],$value,$cookie);

        $crypt = \Yii::$app->getSecurity()->encryptByKey($cookie,$this->securityKey);

        \Yii::$app->response->cookies->add(new \yii\web\Cookie([
            'name' => $config['name'],
            'value' => $crypt,
            'expire' => $expire,
        ]));
    }

    public function get($name)
    {
        $config = $this->cookies[$name];

        if(($cookie = \Yii::$app->request->cookies[$config['name']]))
        {
            $cookie = \Yii::$app->getSecurity()->decryptByKey($cookie->value,$this->securityKey);

            $explode = explode('-',$cookie);

            $expire = array_shift($explode);

            if(isset($config['ipValidate']) && $config['ipValidate'])
            {
                if(array_pop($explode) != \Yii::$app->request->getUserIP())
                {
                    return false;
                }
            }

            if(time() < $expire)
            {
                $matches = [];
                preg_match_all('/\{[a-zA-Z0-9_]+\}/',$config['format'],$matches);
                return array_combine($matches[0],$explode);
            }
        }
        return false;
    }


    public function hasCookie($name)
    {
        return array_key_exists($name,$this->cookies) && isset(\Yii::$app->request->cookies[$this->cookies[$name]['name']]);
    }
}