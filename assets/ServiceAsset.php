<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2016/11/8
 * Time: 上午9:44
 */

namespace app\assets;

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
        'script/servicepage.js'
    ];

    public $depends = [
    	'app\assets\JqueryAsset',
		'app\assets\BootstrapAsset'
    ];
}