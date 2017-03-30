(function ($rs) {
    var
        $module = {
            'init': function ()
            {
                $rs.ajax('task/get-underway-task').done(function (response) {
                    var
                        data = response.content;

                    $rs.render({
                        '$temp': $('.mount .t-content', $module.$panel),
                        'data': data,
                        'before': function () {
                            if(!this.data.length)
                            {
                                var
                                    $mount = this.$mount;

                                $rs.render({
                                    '$temp' : $('.t-empty',$mount),
                                    '$mount' : $mount
                                });

                                return false;
                            }
                        },
                        'after': function (el) {
                            $.data(el[1], 'tid', this.task_id);
                            return el;
                        }
                    });
                });

                this.watch();
                this.bind(this.events);
            },

            'events' : [
                [{
                    'completeTask' : function()
                    {
                        var
                            $mount = this.$panel.find('.mount ul');

                        if(!$mount.find('li').length)
                        {
                            $rs.render({
                                '$temp' : $('.t-empty',$mount),
                                '$mount' : $mount
                            });
                        }
                    }
                }]
            ],
            'modals': {
                'detail': function ($active)
                {
                    if ('_main_' in this)
                    {
                        return this._main_.extend({ '$active': $active }).show();
                    }    

                    var
                        init, extend;
                    
                    init = {
                        'init': function ()
                        {

                        },
                        'show': function ()
                        {
                            if (this.last !== this.$active.data('tid'))
                            {
                                var
                                    taskId = this.$active.data('tid'),
                                    self = this;

                                this.last = taskId;

                                $rs.ajax('task/get-detail', {
                                    'taskId' : taskId
                                }).done(function (response) {
                                    self.render(response.content);
                                });
                            }
                        },
                        'close': function ()
                        {
                            this.$active = null;
                        }    
                    };

                    extend = {
                        'last' : null,
                        'render': function (data)
                        {
                            var
                                $body = this.$body;

                            $rs.render({
                                '$temp' : $('.t-details',$body),
                                'data' : data,
                                'before' : function()
                                {
                                    this.$mount.find('.details').remove();
                                },
                                'filter' : function()
                                {
                                    switch (this.trace_mode)
                                    {
                                        case '0':
                                            this.trace_mode = '默认规则分配';
                                            break;

                                        case '1' :
                                            this.trace_mode = '定向规则分配';
                                            break;

                                        case '2' :
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

                    this._main_ = new $rs.modal($module.$panel.find('#task-assign-modal'), init, extend);
                    this._main_.extend({ '$active': $active }).show();
                },
                'complete': function ($active)
                {
                    var
                        taskId = $active.data('tid');

                    $rs.ajax('task/finish', {
                        'taskId': taskId
                    }).done(function () {
                        $active.remove();
                        $module.trigger('completeTask');
                        $rs.alert().success('任务已结束!', 400);
                    }).fail(function (response) {
                        $rs.alert().error('结束任务失败 <br/>' + response.describe);
                    });
                }    
            },
            'watch': function ()
            {
                this.$panel.find('ul').click(function (event) {
                    if (event.target.tagName == 'LI') {
                        var
                            $li = $(event.target);

                        !$li.hasClass('empty') && $module.modals.detail($(event.target));
                    } else if (event.target.tagName == 'P') {
                        $(event.target).parent().click();
                    } else if (event.target.tagName == 'BUTTON') {
                        $module.modals.complete($(event.target).parent());
                    }
                });
            }    
        };
    $rs.addModule('task-assign', $module);
})($rs);