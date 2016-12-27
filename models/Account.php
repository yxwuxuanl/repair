<?php

namespace app\models;

use yii\db\Query;

class Account extends \yii\db\ActiveRecord
{
    public $account_name;
    public $password;
    public $remember;

    public function rules()
    {
        return [
            [['account_name','password'],'required','message' => '{attribute}不能为空'],
            ['account_name','string','max' => 18,'min' => 4,'tooShort' => '{attribute}过短','tooLong' => '{attribute}过长'],
            ['password','string','max' => 20,'min' => 6,'tooShort' => '{attribute}过短','tooLong' => '{attribute}过长'],
            ['remember','in','range' => [0,1]]
        ];
    }

    public function attributeLabels()
    {
        return [
            'account_name' => '账户名',
            'password' => '密码',
            'remember' => '保持登录状态'
        ];
    }

    public function getQuery()
    {
        return (new Query())->from('account');
    }

    public function findUser($account_id)
    {
        $query = $this->getQuery();

        $query->where('account_id=:uid');

        $query->params([':uid' => $account_id]);

        return $query->one();
    }


    public function getGroup($uid)
    {
        $query = $this->getQuery();

        $query->where('account_id=:uid');

        $query->params([':uid' => $uid]);

        $query->select(['group']);

        return $query->one();
    }

    public function login($uid = null)
    {
        $query = $this->getQuery();

        if($uid)
        {
            $query->where('account.account_id=:uid');
            $query->addParams([
                ':uid' => $uid
            ]);
        }else{
            $query->where('account_name=:an');
            $query->andWhere('password=password(:pwd)');
            $query->addParams([
                ':an' => $this->account_name,
                ':pwd' => $this->password
            ]);
        }

        $query->join('INNER JOIN','privilege','account.account_id=privilege.account_id');
        $query->select(['privilege.*','account.account_group','account.account_name']);

        return $query->one();
    }
}
