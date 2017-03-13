(function ($service) {
    var
        changePwd = {
            'init': function ()
            {

                var
                    $form = $('form', this.$panel);

                $service.validate($form);
                
                $form.submit(function (event) {
                    event.preventDefault();
                    changePwd.post($form);
                });
            }, 
            'post': function ($form)
            {
                if (!$form.valid()) return;

                $service.ajax('account/change-pwd', {
                    'pwd': $form.find('[type=text]').val()
                }).done(function () {
                    $service.alert().success('密码修改成功', 400, function () {
                        $form[0].reset();
                    });
                }).fail(function (response) {
                    $service.alert().error('密码修改失败 <br/>' + response.describe);
                });
            }    
        };
    
    $service.addModule('account-changepwd', changePwd);
})($service);