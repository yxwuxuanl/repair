<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2016/12/30
 * Time: 上午11:09
 */

namespace app\models;

use yii\db\ActiveRecord;

class zeMap extends ActiveRecord
{
	public static function tableName()
	{
		return 'zone_event_map';
	}

	public function attributes()
	{
		return ['zone_id','events'];
	}

	public static function deleteZone($zid){
		parent::findOne($zid)->delete();
	}

	public static function deleteEvent($eid,$zid = null){

		$sql = 'UPDATE `zone_event_map` SET `events` = REPLACE(`events`,' . "'{$eid},','')";

		if($zid){
			$sql .= ' WHERE `zone_id` = ' . $zid;
		}

		return \Yii::$app->db->createCommand($sql)->execute();
	}

	public static function addEvent($zid,$eid){
		return \Yii::$app->db->createCommand('UPDATE `zone_event_map` SET `events` = CONCAT(`events`,' . "'{$eid},')" . ' WHERE `zone_id` = ' . "'{$zid}'")->execute();
	}

	public static function addZone($zid){
		$model = new self();
		$model->zone_id = $zid;
		$model->insert();
	}

	public static function getEvents($zid){
		$event = parent::find()->where(['zone_id' => $zid])->select('events')->asArray()->one();

		if(empty($event)) return null;

		$event = explode(',',$event['events']);
		array_pop($event);

		$in = parent::find()->where(['in','event_id',$event])->from('event')->asArray()->all();
		$in['length'] = count($in);

		$notIn = parent::find()->where(['not in','event_id',$event])->from('event')->asArray()->all();
		$notIn['length'] = count($notIn);

		return ['in' => $in,'notIn' => $notIn];
	}
}