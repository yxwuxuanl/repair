$(function () {    
    $service.registerModule('login', {
        'init': function () {
            $('#login-form').validate({
                'messages': {
                    'login-un-input': {
                        'required': '用户名不能为空',
                        'minlength': '用户名长度在 2~6 个字符之间',
                        'maxlength' : '用户名长度在 2~6 个字符之间'
                    },
                    'login-pwd-input': {
                        'required': '密码不能为空',
                        'minlength': '密码长度在 6~20 个字符之间',
                        'maxlength' : '密码长度在 6~20 个字符之间'
                    }
                }
            });

            var
                _this = this;    
            
            $('#login-form').submit(function (event) {
                event.preventDefault();

                if ($(this).valid()) {
                    _this.login.call(this);
                }
            })
        },

        'login': function () {

            var
                un = $(this).find('#login-un-input').val(),
                pwd = $(this).find('#login-pwd-input').val();

            $service.ajax('login/ajax', 'post', {
                'un': un,
                'pwd': pwd,
                '_csrf': $service.getCsrf()
            }).done(function () {
                location.reload();
            }).fail(function (response) {

                if(response.status == -1){
                    $service.alert(2,'登录失败','用户名或密码错误');
                }else{
                    $service.alert(2,'登录失败','Login Fail (' + response.status + ')');
                }

            });
        }
    })

    $service.initModule('login');
});