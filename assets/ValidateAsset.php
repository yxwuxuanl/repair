<?php

namespace app\assets;

use yii\web\AssetBundle;

class ValidateAsset extends AssetBundle
{
    public $basePath = '@webroot';
    public $baseUrl = '@web';

    public $js = [
        'script/jquery.validate.min.js'
    ];

    public $depends = [
        'app\assets\JqueryAsset'
    ];
}

