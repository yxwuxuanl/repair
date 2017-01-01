<?php

namespace app\controllers;

use app\models\Event;
use app\models\zeMap;
use app\models\Zone;
use app\controllers\ZoneController;

class zeCacheController
{
	public $dir;

	public function make()
	{
		$zones = [];
		$events = [];

		foreach(Event::all() as $item){
			$events[$item['event_id']] = [
				'event_name' => $item['event_name'],
				'zones' => []
			];
		}

		foreach(Zone::all() as $key => $item){

			if(ZoneController::isParent($item['zone_id'])){

				if(empty($item['events'])){
					$events_ = [];
				}else{
					$events_ = explode(',',$item['events']);
					array_shift($events_);
				}

				$lastParent = $item['zone_id'];

				foreach($events_ as $event){
					$events[$event]['zones'][] = $lastParent;
				}

				$zones[$lastParent] = [
					'subs' => [],
					'events' => $events_,
					'zone_name' => $item['zone_name']
				];

			}else{

				unset($item['events']);
				$zones[$lastParent]['subs'][] = $item;

			}

		}

		$dir = \Yii::getAlias($this->dir);
		$cache = str_replace(['{z}','{e}','{time}'],[json_encode($zones),json_encode($events),date('Y-m-d H:i:s')],file_get_contents($dir . 'zeTemplate.js'));

		file_put_contents($dir . 'zeCache.js',$cache);

		return true;
	}

	public function delete()
	{
		unlink(\Yii::getAlias($this->dir) . 'zeCache.js');
	}

}