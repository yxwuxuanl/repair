<?php 

namespace app\models;

use app\controllers\EventController;
use yii\db\ActiveRecord;

class Event extends ActiveRecord
{

	public static function tableName()
	{
		return 'event';
	}

	public function attributes()
	{
		return ['event_id','event_name'];
	}

	public function scenarios()
	{
		return [
			'add' => ['event_id','event_name'],
			'delete' => ['event_id'],
			'rename' => ['event_id','event_name']
		];
	}

	public function rules()
	{
		return [
			[['event_id','event_name'],'required'],
			['event_id',function(){
				if(!static::checkEid($this->event_id)){
					$this->addError('event_id','INVALID_EVENT_ID');
				}
			}],
			['event_name','string','max' => 30,'min' => 5]
		];
	}

	public static function deleteEvent($eid){
		if(!empty($ar = parent::findOne($eid))){

//			-- DELETE HOOK --
			zeMap::deleteEvent($eid);

			return $ar->delete();

		}else{
			return 0;
		}
	}

	public static function all(){
		return parent::find()->asArray()->all();
	}

	public static function checkEid($eid){
		return is_string($eid) && strlen($eid) == 10 && substr($eid,0,2) == 'e_';
	}

	public static function multiHas($list)
	{
		$query = parent::find();
		$explode = explode(',',$list);

		$query->where(['in','event_id',$explode]);

		return $query->count() == count($explode);
	}

	public static function isExist($eid)
	{
		$query = parent::find()->asArray();

		$query->where('`event_id`=:eid');
		$query->params([':eid' => $eid]);

		return $query->one() !== NULL;
	}

}