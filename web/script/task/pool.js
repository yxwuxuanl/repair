(function ($service) {
    var
        taskPool = {
            'init': function ()
            {

            },
            'render': function (data)
            {
                var
                    $mount = this.$panel.find('.mount'),
                    $ul = $mount.find('ul').detach(),
                    template = $service.template,
                    li = $ul.html();
                
                $ul.html('');

                
            },
            'modals': {
                
            },
            'watch': function ()
            {

            }    
        };
    
    $service.addModule('task-pool', taskPool);
})($service);