<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2016/11/17
 * Time: 下午9:22
 */


foreach($panels as $name => $panel)
{

	$asset = ucfirst($name) . 'Asset';

	call_user_func(['app\assets\\' . $asset,'register'],$this);

    foreach($panel as $item)
    {
        $panelName = $name . '-' . $item;

        echo '<div class="tab-pane fade" id="'. $panelName .'-panel">'.$this->render('panels/' . $panelName . '.php').'</div>';
    }
}