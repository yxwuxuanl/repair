<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2016/11/24
 * Time: 下午3:45
 */

namespace app\assets;
use yii\web\AssetBundle;

class LoginAsset extends AssetBundle
{
	public $basePath = '@webroot';
	public $baseUrl = '@web';

	public $js = [
		'script/login.js'
	];

	public $depends = [
		'app\assets\BootstrapAsset'
	];
}
