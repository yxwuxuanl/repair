<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2016/11/10
 * Time: 上 午9:54
 */

use app\assets;
use yii\widgets\ActiveForm;

assets\LoginAsset::register($this);

$this->title = '登录';
?>

<div class="container">
    <div class="col-md-4 col-md-push-4">

        <?php
            $form = ActiveForm::begin(['options' => ['name' => 'login']]);
        ?>

        <?= $form->field($model,'account_name')->label(); ?>
        <?= $form->field($model,'password')->passwordInput()->label(); ?>
        <?= $form->field($model,'remember')->checkbox() ;?>

        <div>
            <button id="login-button" class="btn btn-primary" data-loading-text="登录中..." autocomplete="off">登录</button>
        </div>
    </div>

    <?php ActiveForm::end() ?>
</div>


