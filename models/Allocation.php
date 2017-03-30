<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2017/2/23
 * Time: 下午10:46
 */

namespace app\models;
use app\formatter\Status;
use yii\base\Exception;
use yii\db\ActiveRecord;

class Allocation extends ActiveRecord
{
	public static function tableName()
	{
		return 'allocation';
	}

	public function rules()
	{
		return [
			[['event','assign','level'],'required'],

			[['event','assign'],'string','min' => 10],

			['level',function($attr){
				if(!in_array((int) $this->$attr,[0,1,2]))
				{
					$this->addError($attr);
				}
			}],

			['event',function($attr){
				if(!Event::checkEid($this->$attr))
				{
					$this->addError($attr);
				}
			}],

			['assign',function($attr){
				$members = explode(',',$this->$attr);

				foreach($members as $member)
                {
                    if(!Account::checkAid($member))
                    {
                        return $this->addError($attr);
                    }
                }
			}],

		];
	}

	public function attributes()
	{
		return ['group_id','event','assign','level','allocation_id'];
	}

	public static function create($group,$event,$assign,$level)
	{
		$model = new self();

		$model->group_id = $group;
		$model->event = $event;
		$model->assign = $assign;
		$model->level = $level;
		$model->allocation_id = 'al_' . \Yii::$app->getSecurity()->generateRandomString(7);

		if(!$model->validate()) return Status::INVALID_ARGS;

		$transaction = \Yii::$app->getDb()->beginTransaction();

		try
		{
		    if($level == '2')
            {
                $arrAssign = explode(',',$assign);

                $action = [
                    'remove' => [],
                    'edit' => []
                ];

                foreach(parent::find()->where(['like','assign',$arrAssign])->each() as $item)
                {
                    foreach($arrAssign as $assign_)
                    {
                        if(strpos($item['assign'],$assign_) > -1)
                        {
                            if($item['assign'] == $assign_)
                            {
                                $action['remove'] = $item['allocation_id'];
                            }else{
                                $action['edit'][] = [$item['allocation_id'],$assign_];
                            }
                        }
                    }
                }

                if(!empty($action['remove']))
                {
                    parent::deleteAll(['in','allocation_id',$action['remove']]);
                }

                if(!empty($action['edit']))
                {
                    foreach($action['edit'] as $def)
                    {
                        $sql = "UPDATE `allocation` SET `assign` = REPLACE(`assign`,'{$def[1]},','') WHERE `allocation_id` = '{$def[0]}'";
                        \Yii::$app->getDb()->createCommand($sql)->execute();
                    }
                }
            }

			$model->insert();
		    $transaction->commit();
		}catch(Exception $e)
		{
		    $transaction->rollBack();
			return Status::DATABASE_SAVE_FAIL;
		}

		return Status::SUCCESS;
	}

	public static function getGroupRule($group,$defaultRule = false,$getMap = true)
	{
		$ar = parent::find()
            ->where('`group_id` = :gid')
            ->params([':gid' => $group]);

		if(!$defaultRule)
		{
			$ar->andWhere('`level` != \'0\'');
		}

		$rules = $ar->asArray()->all();

		foreach($rules as &$item)
		{
			if($getMap) {
                $explode = explode(',',$item['assign']);
                $item['assign'] = Account::find()
                    ->where(['in', 'account_id', $explode])
                    ->select('`account_name`')
                    ->all();
                $item['event'] = Event::getEventName($item['event']);
            }
		}

		return $rules;
	}
}