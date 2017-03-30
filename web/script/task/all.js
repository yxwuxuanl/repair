(function ($rs) {
    var
        $module;

    $module = {
        'init' : function(){
            this.watch();
            $('select', this.$panel).change();
        },
        'watch' : function(){
            $('select',this.$panel).change(function(){
                $module['load' + this.value]();
            });
        },
        'loadcomplete' : function()
        {
            var
                $mount = $('.complete',this.$panel);

            $mount.show().siblings().hide();

            $rs.ajax('task/get-group-task',{
                'complete' : 1
            }).done(function(response){
                $rs.render({
                    '$temp' : $('ul .t-content',$mount),
                    'data' : response.content,
                    'before' : function()
                    {
                        if(!this.data.length)
                        {
                            $rs.render({
                                '$temp' : $('.t-empty',$mount),
                                '$mount' : $mount
                            });
                            return false;
                        }

                        this.$mount.find('li').remove();
                    },
                    'filter' : function()
                    {               
                        switch (this.trace_mode) {
                            case '0':
                                this.trace_mode = '默认规则分配';
                                break;

                            case '1':
                                this.trace_mode = '定向规则分配';
                                break;

                            case '2':
                                this.trace_mode = '手动领取';
                                break;

                            case '3':
                                this.trace_mode = '组管理员分配';
                                break
                        }
                    }
                })
            });
        },
        'loadunderway' : function()
        {
            var
                $mount = $('.underway', this.$panel);

            $mount.show().siblings().hide();

            $rs.ajax('task/get-group-task', {
                'underway': 1
            }).done(function (response) {
                $rs.render({
                    '$temp': $('ul .t-content', $mount),
                    'data': response.content,
                    'before': function () {
                        if (!this.data.length) {
                            $rs.render({
                                '$temp': $('.t-empty', $mount),
                                '$mount': $mount
                            });
                            return false;
                        }

                        this.$mount.find('li').remove();
                    },
                    'filter': function () {
                        switch (this.trace_mode) {
                            case '0':
                                this.trace_mode = '默认规则分配';
                                break;

                            case '1':
                                this.trace_mode = '定向规则分配';
                                break;

                            case '2':
                                this.trace_mode = '手动领取';
                                break;

                            case '3':
                                this.trace_mode = '组管理员分配';
                                break
                        }
                    }
                })
            });
        },
        '_run_' : function(){},
    };

    $rs.addModule('task-all', $module);
})($rs);