<?php

namespace app\models;

use yii\db\ActiveRecord;
use yii\db\Query;

class User extends ActiveRecord
{
    public $username;
    public $password;

    function rules()
    {
        return [
            [['username','password'],'required','message' => '{attribute}不能为空'],
            [['username','password'],'string','min' => 6,'tooShort' => '{attribute}过短']
        ];
    }

    function attributeLabels()
    {
        return [
            'username' => '登录名',
            'password' => '密码'
        ];
    }

    function findUser()
    {
        $result = (new Query())->select(
            'privilege.edit_record,privilege.edit_event,privilege.edit_account,privilege.edit_zone,privilege.login,`user`.zone,`user`.user_id,`user`.user_name'
        )->where('user_name="lin2ur"')->join('INNER JOIN','privilege','user.user_id = privilege.user_id')->from('user')->where('`user`.user_name=:un')->andWhere('`user`.password=PASSWORD(:pwd)')->addParams([':un' => $this->username,':pwd' => $this->password])->one();
        return $result;
    }

    public static function findUserById($id)
    {
        return static::findOne($id);
    }
}
