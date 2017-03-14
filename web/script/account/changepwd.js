(function ($rs) {
    var
        changePwd = {
            'init': function ()
            {

                var
                    $form = $('form', this.$panel);

                $rs.validate($form);
                
                $form.submit(function (event) {
                    event.preventDefault();
                    changePwd.post($form);
                });
            }, 
            'post': function ($form)
            {
                if (!$form.valid()) return;

                $rs.ajax('account/change-pwd', {
                    'pwd': $form.find('[type=text]').val()
                }).done(function () {
                    $rs.alert().success('密码修改成功', 400, function () {
                        $form[0].reset();
                    });
                }).fail(function (response) {
                    $rs.alert().error('密码修改失败 <br/>' + response.describe);
                });
            }    
        };
    
    $rs.addModule('account-changepwd', changePwd);
})($rs);