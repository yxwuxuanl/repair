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
	const CREATE = 'create';

	public static function tableName()
	{
		return 'allocation';
	}

	public function rules()
	{
		return [
			[['event','assign','group_id','level'],'required'],

			[['event','assign'],'string','min' => 10,'on' => static::CREATE],

			['level',function($attr){
				if(!in_array((int) $this->$attr,[0,1,2]))
				{
					$this->addError($attr);
				}
			},'on' => static::CREATE],

			['event',function($attr){
				$event = $this->$attr;

				// 必须是合法的 Event ID 以及该组必须响应该事件
				if(!Event::checkEid($event) || !Group::hasEvent($this->group_id,$event))
				{
					$this->addError($attr);
				}
			},'on' => static::CREATE],

			['assign',function($attr){
				$member = explode(',',$this->$attr);
				$query = Account::find()->where(['in','account_id',$member])->andWhere('`account_group`=:gid',[':gid' => $this->group_id])->count();

				if(count($member) != $query)
				{
					$this->addError($attr);
				}
			},'on' => static::CREATE],

		];
	}

	public function attributes()
	{
		return ['group_id','event','assign','level'];
	}

	public static function create($group,$event,$assign,$level)
	{
		$model = new self();
		$model->scenario = static::CREATE;
		$model->group_id = $group;
		$model->event = $event;
		$model->assign = $assign;
		$model->level = $level;

		if(!$model->validate()) return [Status::INVALID_ARGS,$model->errors];

		try
		{
			$model->insert();
		}catch(Exception $e)
		{
			return Status::DATABASE_SAVE_FAIL;
		}

		return Status::SUCCESS;
	}

	public static function getRuleByGroup($group,$default = false)
	{
		if(!Group::checkGid($group)) return Status::INVALID_ARGS;

		$ar = parent::find()->where('`group_id`=:gid',[':gid' => $group]);

		if(!$default)
		{
			$ar->andWhere('`level` != \'0\'');
		}

		$rules = $ar->asArray()->all();

		foreach($rules as &$item)
		{
			if($item['level'] == 0) continue;
			$item['assign'] = explode(',',$item['assign']);
		}

		return $rules;
	}


	public static function getRuleByEvent($eventId)
	{

	}

	public static function makeDefaultRule($group)
	{
		$model = new self();
		$model->group_id = $group;
		$model->event = '*';
		$model->assign = '*';
		$model->level = 0;
		$model->insert();
	}

	public static function remove($eventId)
	{
		if(!Event::checkEid($eventId)) return Status::INVALID_ARGS;
		return parent::deleteAll('`event`=:eid',[':eid' => $eventId]);
	}
}