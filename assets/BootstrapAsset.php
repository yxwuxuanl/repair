<?php

namespace app\assets;
use yii\web\AssetBundle;

class BootstrapAsset extends AssetBundle
{
    public $basePath = '@webroot';
    public $baseUrl = '@web';

    public $js = [
        'script/bootstrap.min.js'
    ];

    public $css = [
        'css/bootstrap.min.css'
    ];

    public $depends = [
        'app\assets\JqueryAsset'
    ];
}
