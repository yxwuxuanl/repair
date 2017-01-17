<?php
/**
 * Created by PhpStorm.
 * User: 2m
 * Date: 2016/11/10
 * Time: 上 午9:54
 */

app\assets\LoginAsset::register($this);

$this->title = '登录';
?>

<div class="container">
    <div class="col-md-4 col-md-push-4">
        <form action="" id="login-form" role="form">
            <div class="form-group">
                <label for="login-un-input">用户名</label>
                <input type="text" name="login-un-input" class="form-control" id="login-un-input" required maxlength="6" minlength="2">
            </div>

            <div class="form-group">
                <label for="login-pwd-input">密码</label>
                <input type="password" name="login-pwd-input" class="form-control" id="login-pwd-input" required maxlength="20" minlength="6">
            </div>
        
            <div class="form-group">
                <button class="btn btn-block btn-primary submit">登录</button>
            </div>
        </form>
    </div>
</div>


