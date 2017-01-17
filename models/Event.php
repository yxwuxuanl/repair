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
				if(!EventController::checkEid($this->event_id)){
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
}