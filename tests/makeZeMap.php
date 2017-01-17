<?php

$conn = new mysqli('127.0.0.1','root','103002','repair');

$events = [];
$zones = [];

$query = $conn->query('select `event_id` from `event`');

while($row = $query->fetch_assoc()){
    $events[] = $row['event_id'];
}

$query = $conn->query('select `zone_id` from `zone`');

while($row = $query->fetch_assoc()){
    $zones[] = $row['zone_id'];
}

$stmt = $conn->prepare('insert into `zone_event_map` (`zone_id`,`events`) values (?,?)');
$stmt->bind_param('ss',$zone_id,$event);


foreach($zones as $zone){
    $eventList = [];

    for($i = 0 ,$r = rand(8,15);$i < $r;$i++){
        do{
            $temp = $events[array_rand($events,1)];
        }while(in_array($temp,$eventList));

        $eventList[] = $temp;
    }

    $zone_id = $zone;
    $event = implode(',',$eventList);
    $stmt->execute();
}
