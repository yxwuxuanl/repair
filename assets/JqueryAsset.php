<?php

namespace app\assets;
use yii\web\AssetBundle;

class JqueryAsset extends AssetBundle
{
    public $basePath = '@webroot';
    public $baseUrl = '@web';

    public $js = [
        'script/jquery.min.js'
    ];
}
