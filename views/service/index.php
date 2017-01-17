<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2016/11/17
 * Time: 上午8:55
 */

app\assets\BootstrapAsset::register($this);

function panels($id = null,$action = null)
{
    static $panels = [];

    if($id)
    {
        $panels[$id][] = $action;
    }else{
        return $panels;
    }
}

?>

<div class="container">
    <div class="col-md-10 col-md-push-1">

    <div class="spinner">
        <div class="rect1"></div>
        <div class="rect2"></div>
        <div class="rect3"></div>
        <div class="rect4"></div>
    </div>

    <?= $this->render('nav') ?>
    <?= $this->render('panel') ?>

    </div>
</div>