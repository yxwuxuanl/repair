(function ($service) {
    var
        loginout = {
            'init': function ()
            {
                $service.ajax('login/login-out').done(function () {
                    location.reload();
                });
            }    
        }
    $service.addModule('account-loginout', loginout);
})($service);