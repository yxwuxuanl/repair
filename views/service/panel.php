<?php

$panels = panels();

foreach($panels as $name => $panel)
{
    foreach($panel as $item)
    {
        $panelName = $name . '-' . $item;

        echo '<div class="tab-pane fade" id="'. $panelName .'-panel">'.$this->render('/service/panels/' . $panelName . '.php').'</div>';
    }
}