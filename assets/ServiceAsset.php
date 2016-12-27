<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2016/11/8
 * Time: 上午9:44
 */

namespace app\assets;

use yii\validators\ValidationAsset;
use yii\web\AssetBundle;
use yii\web\View;
use yii\widgets\ActiveFormAsset;

class ServiceAsset extends AssetBundle
{
    public $basePath = '@webroot';
    public $baseUrl = '@web';

    public $css = [
        'css/main.css'
    ];

    public $js = [
        'script/servicepage.js',
        'script/ajax.js',
		'script/helper.js',
		'script/alert.js',
		'script/modal.js',
        'script/init.js'
    ];

    public $depends = [
        'app\assets\BootstrapAsset'
    ];
}