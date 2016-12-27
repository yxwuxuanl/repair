<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2016/11/20
 * Time: 下午9:23
 */

namespace app\assets;
use yii\web\AssetBundle;
use yii\web\View;

class ZoneAsset extends AssetBundle
{
    public $basePath = '@webroot';
    public $baseUrl = '@web';

    public $js = [
        'script/zone.js'
    ];

    public $jsOptions = [
      'position' => View::POS_HEAD
    ];

}