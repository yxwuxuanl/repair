<?php

namespace app\models;

use yii\db\ActiveRecord;
use yii\db\Query;

class Account extends ActiveRecord
{
	public $username;
	public $password;

	function rules()
	{
		return [
			[['username','password'],'required'],
			['username','string','min' => 2,'max' => 10],
			['password','string','min' => 5,'max' => 20]
		];
	}

	function findUser()
	{
		$result = (new Query())->select('account.account_name,account.account_group,privilege.*')->join('INNER JOIN','privilege','account.account_id = privilege.account_id')->from('account')->where('`account`.account_name=:un')->andWhere('`account`.password=PASSWORD(:pwd)')->addParams([':un' => $this->username,':pwd' => $this->password])->one();
		return $result;
	}
}
