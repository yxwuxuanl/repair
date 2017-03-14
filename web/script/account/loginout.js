(function ($rs) {
    var
        loginout = {
            'init': function ()
            {
                $rs.ajax('login/login-out').done(function () {
                    location.reload();
                });
            }    
        }
    $rs.addModule('account-loginout', loginout);
})($rs);