(function ($rs) {
    var
        _module_ = {
            'init': function ()
            {
                this.watcher().define('tasks', function (old, _new_, $mount) {
                    if (_new_ > 0) {
                        if (old == 0) {
                            $mount.find('.empty').remove();
                        }
                    } else {
                        $rs.render({
                            '$temp': $('#t-empty', _module_.$panel)
                        });
                    }
                });

                $rs.ajax('task/get-assign-task').done(function (response) {
                    var
                        data = response.content;
                    
                    if (data.length > 0) {
                        $rs.render({
                            '$temp': $('#t-content', _module_.$panel),
                            'data': data,
                            'before': function () {
                                _module_.watcher().change('tasks', this.data.length, this.$mount);
                            },
                            'after': function (el) {
                                $.data(el[1], 'tid', this.task_id);
                                return el;
                            }
                        });
                    } else {
                        _module_.watcher().change('tasks', 0);
                    }
                });

                this.watch();
            },
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

                    this._main_ = new $rs.modal(_module_.$panel.find('#task-assign-modal'), init, extend);
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
                            _module_.watcher().sub('tasks');
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
                    if (event.target.tagName == 'LI') {
                        _module_.modals.detail($(event.target));
                    } else if (event.target.tagName == 'P') {
                        $(event.target).parent().click();
                    } else if (event.target.tagName == 'BUTTON') {
                        _module_.modals.complete($(event.target).parent());
                    }
                });
            }    
        };
    $rs.addModule('task-assign', _module_);
})($rs);