<?php

$panels = panels();

foreach($panels as $name => $panel)
{
	$asset = ucfirst($name) . 'Asset';

	call_user_func(['app\assets\\' . $asset,'register'],$this);

    foreach($panel as $item)
    {
        $panelName = $name . '-' . $item;

        echo '<div class="tab-pane fade" id="'. $panelName .'-panel">'.$this->render('/service/panels/' . $panelName . '.php').'</div>';
    }
}