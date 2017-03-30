/**
 * Created by 2m on 2017/3/30.
 */

(function($rs){
    var
        $module;

    $module = {
        'init' : function(){
            this.watch();
            this.bind(this.events);
        },

        '_run_' : function(){
            if(this.reload)
            {
                $rs.ajax('task/get-complete-by-account').done(function(response){
                    $module.render(response.content);
                }).fail(function(){
                    $rs.alert().error('数据获取失败');
                });

                this.reload = false;
            }
        },

        'reload' : true,
        'modals' : {},
        'watch' : function(){},
        'events' : [
            ['task-assign',{
                'completeTask' : function()
                {
                    this.reload = true;
                }
            }]
        ],
        'render': function (data) { 
            var
                $mount = $('.mount',this.$panel);

            $rs.render({
                '$temp' : $('.t-content',$mount),
                'data' : data,
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
        }
    };

    $rs.addModule('task-complete',$module);
})($rs);