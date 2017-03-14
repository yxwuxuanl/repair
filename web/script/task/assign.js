(function ($rs) {
    var
        assignTask = {
            'init': function ()
            {
                $rs.ajax('task/get-task').done(function (response) {
                    assignTask.render(response.content);
                });
            },
            'render': function (data)
            {
                var
                    $mount = this.$panel.find('.mount'),
                    $ul = $mount.find('ul'),
                    template = $rs.template,
                    len = data.length,
                    li;
                
                if (len < 1)
                {
                    return $ul.find('.content').remove();
                }    

                $ul.detach().find('.empty').remove();                
                li = $ul.html();

                $ul.html('');

                for (var i = 0, len; i < len; i++) {
                    var
                        $li = $(template(li, {
                            'time': data[i]['post_time'],
                            'zone': data[i]['zone'],
                            'event': data[i]['event']
                        }));

                    $li.data('tid', data[i]['task_id']);
                    $ul.append($li);
                }    

                $mount.append($ul);
                assignTask.watch();
            },
            'modals': {
                'main': function ($active)
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
                            if (this.last == this.$active.data('tid')) return;                            
                            var
                                taskId = this.$active.data('tid'),
                                self = this;
                            
                            this.last = taskId;
                            
                            $rs.ajax('task/get-detail', {
                                'taskId' : taskId
                            }).done(function (response) {
                                self.render(response.content);
                            })
                            
                        },
                        'close': function ()
                        {
                            this.$active = null;
                        }    
                    };

                    extend = {
                        'render': function (data)
                        {
                            var
                                $mount = this.$body;
                            
                            $mount.find('.reporter-id').text(data.reporter_id);
                            $mount.find('.reporter_name').text(data.reporter_name);
                            $mount.find('.reporter_tel').text(data.reporter_tel);

                            if (data.describe)
                            {
                                $mount.find('.describe').find('.content').text(data.describe).end().show();
                            } else {
                                $mount.find('.describe').hide();
                            }
                        }    
                    };

                    this._main_ = new $rs.modal(assignTask.$panel.find('#task-assign-modal'), init, extend);
                    this._main_.extend({ '$active': $active }).show();
                },
                'complete': function ($active)
                {
                    var
                        taskId = $active.data('tid');

                    $rs.ajax('task/finish', {
                        'taskId': taskId
                    }).done(function (response) {
                        $rs.alert().success('任务已结束!', 400, function () {
                            $active.remove();
                        });
                    }).fail(function (response) {
                        $rs.alert().error('结束任务失败 <br/>' + response.describe);
                    });
                }    
            },
            'watch': function ()
            {
                this.$panel.find('ul').click(function (event) {
                    if (event.target.tagName == 'LI')
                    {
                        assignTask.modals.main($(event.target));
                    } else if (event.target.tagName == 'P')
                    {
                        $(event.target).parent().click();
                    } else if (event.target.tagName == 'BUTTON')
                    {
                        assignTask.modals.complete($(event.target).parent());
                    }    
                })
            }    
        };
    

    $rs.addModule('task-assign', assignTask);
})($rs);