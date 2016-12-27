<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2016/11/24
 * Time: 下午3:54
 */
namespace app\assets;
use yii\web\AssetBundle;

class SystemAsset extends AssetBundle
{
	public $basePath = '@webroot';
	public $baseUrl = '@web';

	public $js = [
		'script/system.js',
	];

	public $depends = [
		'app\assets\ServiceAsset'
	];
}