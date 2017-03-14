(function ($rs) {
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
                    template = $rs.template,
                    li = $ul.html();
                
                $ul.html('');

                
            },
            'modals': {
                
            },
            'watch': function ()
            {

            }    
        };
    
    $rs.addModule('task-pool', taskPool);
})($rs);