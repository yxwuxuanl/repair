(function ($rs) {
    var
        _module_ = {
            'init': function () {
                this.watcher().define('groups', function (old, _new_, $mount) {
                    if (_new_ > 0) {
                        if (old == 0) {
                            $mount.find('.empty').remove();
                        }
                    } else {
                        $rs.render({
                            '$temp': $('.t-empty', $mount)
                        });
                    }
                });

                $rs.ajax('group/get-all').done(function (response) {
                    _module_.render(response.content);
                    _module_.watch();
                }).fail(function (response) {
                    $rs.alert().error('数据获取失败请刷新后重试');
                });

                this.bind(this.events);
            },

            'events' : [
                [{
                    'remove' : [
                        function () {
                            if ('_add_' in this.modals) 
                            {
                                this.modals._add_.reload = true;
                            }

                            if('_changeAdmin_' in this.modals)
                            {
                                this.modals._changeAdmin_.last = null;
                            }
                        }
                    ],
                    'change-admin' : function(accountId){
                        if ('_add_' in this.modals) {
                            var
                                $select = this.modals._add_.$body.find('select');

                            $select.find('option').each(function(){
                                if($.data(this,'aid') == accountId)
                                {
                                    $(this).remove();
                                    return false;
                                }
                            })
                        }
                    }
                }],
                ['account-manage',{
                    'remove' : function(accountId)
                    {
                        this.$panel.find('tr').each(function(){
                            if ($.data(this,'aid') == accountId)
                            {
                                $.data(this,'aid',null);
                                $(this).find('.group-admin').text('未指派');
                                return false;
                            }
                        });

                        if('_add_' in this.modals)
                        {
                            var
                                $select = this.modals._add_.$body.find('select');

                            $select.find('option').each(function(){
                                if($.data(this,'aid') == accountId)
                                {
                                    $(this).remove();
                                    return false;
                                }
                            });
                        }

                        if('_changeAdmin_' in this.modals)
                        {
                            var
                                $select = this.modals._changeAdmin_.$body.find('select');

                            $select.find('option').each(function(){
                                if($.data(this,'aid') == accountId)
                                {
                                    $(this).remove();
                                    return false;
                                }
                            })
                        }
                    }
                }]
            ],

            'render' : function(data)
            {
                $rs.render({
                    '$temp' : $('.mount .t-content',_module_.$panel),
                    'data' : data,
                    'before' : function()
                    {
                        if($.isArray(this.data))
                        {
                            if(this.data.length < 1)
                            {
                                _module_.watcher().change('groups',0,this.$mount);
                                return false;
                            }
                            _module_.watcher().change('groups',this.data.length,this.$mount);
                        }else{
                            _module_.watcher().plus('groups',this.$mount);
                        }
                    },
                    'filter' : function()
                    {
                        if(this.group_admin === null)
                        {
                            this.group_admin = '未指派';
                        }
                    },
                    'after': function (el) {
                        $.data(el[1], 'aid', this.account_id);
                        $.data(el[1], 'gid', this.group_id);
                        return el;
                    },
                    'attrs' : ['group_name','group_admin']
                })
            },

            'watch': function () {
                this.$panel.find('table').click(function (event) {
                    var
                        $target = $(event.target);
                    
                    if ($target[0].tagName == 'SPAN' && $target.hasClass('glyphicon'))
                    {
                        _module_.modals[$target.attr('action')]($target.parent().parent().parent());
                    }
                });

                this.$panel.find('.add').click(function () {
                    _module_.modals.add();
                });
            },

            'modals': {
                'add': function () {
                    if ('_add_' in this)
                    {
                        return this._add_.show();
                    }    

                    var
                        init, extend;
                    
                    init = {
                        'init': function () {
                            var
                                self = this,
                                $form = this.$body.find('form');
                            
                            this.reload = true;
                            
                            $rs.validate($form);

                            $form.submit(function (event) {
                                var
                                    $this = $(this);

                                event.preventDefault();
                                $this.valid() && self.post($this);
                            });

                            this.$body.find('.event-mount').click(function (event) {
                                if (event.target.tagName == 'LI') {
                                    var
                                        $target = $(event.target);

                                    !$target.hasClass('empty') && $target.toggleClass('select');
                                } else if (event.target.tagName == 'SPAN') {
                                    $(event.target).parent().click();
                                }
                            });
                        },
                        'show': function () {
                            if (!this.reload) return;

                            var
                                self = this,
                                $body = this.$body;
                            
                            $rs.ajax('group/get-create-data').done(function (response) {
                                self.renderAdmin(response.content.account);
                                self.renderEvent(response.content.event);
                            }).fail(function (response) {
                                $rs.alert().error('数据获取失败 <br/>' + response.describe);
                            });
                            
                            this.reload = false;
                        },
                        'close': function () {
                            this.$body.find('form')[0].reset();
                            this.$body.find('.select').removeClass('select');
                        }
                    };

                    extend = {
                        'reload' : true,
                        'renderAdmin': function (data)
                        {
                            var
                                $body = this.$body;
                            
                            $rs.render({
                                'temp': '<option>{account_name}</option>',
                                '$mount': $('select', $body),
                                'data': data,
                                'after': function (el) {
                                    $.data(el[0], 'aid', this.account_id);
                                    return el;
                                }
                            });
                        },
                        'renderEvent': function (data)
                        {
                            var
                                $body = this.$body;
                            
                            $rs.render({
                                '$temp': $('.t-content', $body),
                                'data': data,
                                'after': function (el) {
                                    $.data(el[1], 'eid', this.event_id);
                                    return el;
                                },
                                'before' : function()
                                {
                                    if(this.data.length < 1)
                                    {
                                        this.temp = this['$mount'].find('.t-empty')[0].innerHTML;
                                        this.data = null;
                                    }else{
                                        this.$mount.find('li').remove();
                                    }
                                }
                            });
                        },
                        'post': function ($form)
                        {
                            var
                                groupName = $form.find('[type=text]').val(),
                                $option = $form.find('option:selected'),
                                $events = this.$body.find('.select'),
                                events = [],
                                $eventMount = this.$body.find('.event-mount');
                            
                            if ($events.length < 1)
                            {
                                return $rs.alert().error('至少选择一个事件');
                            }    

                            $events.each(function () {
                                events.push($(this).data('eid'));
                            });

                            this.close();

                            $rs.ajax('group/add', {
                                'groupName': groupName,
                                'groupAdmin': $option.data('aid'),
                                'events': events.join(',')
                            }).done(function (response) {
                                _module_.render({
                                    'group_name': groupName,
                                    'group_id': response.content[0],
                                    'group_admin': $option.text()
                                });
                                
                                _module_.trigger('add', groupName,response.content[0],$option.data('aid'));

                                $option.data('aid') && $option.remove();
                                $events.remove();

                                $rs.alert().success('添加成功', 400);
                            }).fail(function (response) {
                                $rs.alert().error('添加失败 <br/>' + response.describe);
                            });
                        }
                    };

                    this._add_ = new $rs.modal('#group-add-modal', init, extend);
                    this._add_.show();
                },
                'rename': function ($active) { 
                    if ('_rename_' in this)
                    {
                        return this._rename_.extend({'$active' : $active}).show();
                    }    

                    var
                        init, extend;
                    
                    init = {
                        'init': function ()
                        {
                            var
                                $form = this.$body.find('form'),
                                self = this;
                            
                            $rs.validate($form);
                            $form.submit(function (event) {
                                event.preventDefault();
                                $(this).valid() && self.post($(this));
                            })
                        },
                        'close': function ()
                        {
                            this.$body.find('form')[0].reset();
                        },
                        'show': function ()
                        {
                            this.setTitle('重命名 [' + this.$active.find('.group-name').text() + ']');
                         }    
                    };
                    extend = {
                        'post': function ($form)
                        {
                            var
                                $active = this.$active,    
                                groupId = $active.data('gid'),
                                oldName = $active.find('.group-name').text(),
                                groupName = $form.find('[type=text]').val();
                            
                            this.close();

                            $rs.ajax('group/rename', {
                                'groupId': groupId,
                                'groupName': groupName
                            }).done(function () {
                                $active.find('.group-name').text(groupName);

                                _module_.trigger('rename', groupId, groupName);

                                $rs.alert().success('重命名成功', 400);
                            }).fail(function (response) {
                                $rs.alert().error('重命名失败 <br/>' + response.describe);
                            });
                        }    
                    };

                    this._rename_ = new $rs.modal('#group-rename-modal', init, extend);
                    this._rename_.extend({ '$active': $active }).show();
                },
                'remove': function ($active) {
                    if ('_remove_' in this)
                    {
                        return this._remove_.extend({ '$active': $active }).show();
                    }    

                    var
                        init, extend;
                    
                    init = {
                        'init': function ()
                        {
                            var
                                self = this;

                            this.$body.find('button').click(function () {
                                self.post();
                            });
                        },
                        'show': function ()
                        {
                            this.setTitle('删除 [' + this.$active.find('.group-name').text() + ']');
                        }    
                    };
                    extend = {
                        'post': function ()
                        {    
                            var
                                $active = this.$active;
                            
                            this.close();

                            $rs.ajax('group/delete', {
                                'groupId': $active.data('gid')
                            }).done(function () {
                                _module_.trigger('remove', $active.data('gid'));
                                _module_.watcher().sub('groups', $('.mount',_module_.$panel));
                                $active.remove();
                                $rs.alert().success('删除成功', 400);
                            }).fail(function (response) {
                                $rs.alert().error('删除失败 <br/>' + response.describe);
                            });
                        }    
                    };

                    this._remove_ = new $rs.modal('#group-delete-modal', init, extend);
                    this._remove_.extend({ '$active': $active }).show();
                },
                'changeAdmin': function ($active) {
                    if ('_changeAdmin_' in this)
                    {
                        return this._changeAdmin_.extend({ '$active': $active }).show();
                    }    

                    var
                        init, extend;
                    
                    init = {
                        'init': function ()
                        {
                            var
                                self = this;
                            
                            this.$body.find('button').click(function () {
                                self.post();
                            });
                        },
                        'show': function ()
                        {
                            var
                                groupId = this.$active.data('gid'),
                                self = this;

                            if(this.last == groupId)
                            {
                                return;
                            }

                            this.setTitle('更改 [' + this.$active.find('.group-name').text() + '] 组管理员');

                            $rs.ajax('account/get-admin-list', {
                                'groupId': groupId
                            }).done(function (response) {
                                self.render(response.content);
                            }).fail(function (response) {
                                $rs.alert().error('数据获取失败 <br/>' + response.describe);
                            });

                            this.last = groupId;
                        }    
                    };

                    extend = {
                        'last' : null,
                        'render': function (data)
                        {
                            var
                                $body = this.$body;

                            $rs.render({
                                'temp': '<option>{account_name}</option>',
                                '$mount': $('select', $body),
                                'data' : data,
                                'after' : function(el)
                                {
                                    $.data(el[0],'aid',this.account_id);
                                    return el;
                                },
                                'before' : function()
                                {
                                    this.$mount.children().remove();
                                },
                                'attrs' : ['account_name']
                            });
                        },
                        'post': function ()
                        {
                            var
                                $active = this.$active,
                                groupId = $active.data('gid'),
                                $option = this.$body.find('option:selected'),
                                $groupAdmin = $active.find('.group-admin');
                            
                            this.close();

                            $rs.ajax('group/change-admin', {
                                'groupId': groupId,
                                'adminId': $option.data('aid')
                            }).done(function () {
                                _module_.trigger('change-admin',$option.data('aid'),$active.data('aid'),$active.find('.group-name').text());

                                $active.data('aid', $option.data('aid'));

                                $groupAdmin.text($option.text());
                                $option.remove();
                                $rs.alert().success('更换管理员成功', 400);
                            }).fail(function (response) {
                                $rs.alert().error('更换管理员失败 <br/>' + response.describe);
                            });
                        }    
                    };
                    
                    this._changeAdmin_ = new $rs.modal('#group-change-admin-modal', init, extend);
                    this._changeAdmin_.extend({ '$active': $active }).show();
                },
                'event': function ($active) {
                    if ('_event_' in this)
                    {
                        return this._event_.extend({ '$active': $active }).show();
                    }    

                    var
                        init, extend;
                    
                    init = {
                        'init': function ()
                        {
                            var
                                self = this;    

                            $rs.ajax('event/get-no-assign').done(function (response) {
                                self.render(response.content, 'not-has');
                                self.watch();
                            }).fail(function (response) {
                                $rs.alert().error('数据获取失败 <br/>' + response.describe);
                            });
                            
                        },
                        'show': function ()
                        {
                            if (this.last == this.$active.data('gid')) return;
                            this.last = this.$active.data('gid');
                            this.setTitle('更改 [' + this.$active.find('.group-name').text() + '] 的事件');

                            var
                                self = this;    

                            $rs.ajax('group/get-event', {
                                'groupId': this.$active.data('gid')
                            }).done(function (response) {
                                self.render(response.content, 'has');
                            }).fail(function (response) {
                                $rs.alert().error('数据获取失败 <br/>' + response.describe);
                            });
                        },
                        'close': function ()
                        {
                            this.$active = null;
                        }    
                    };

                    extend = {
                        'render': function (data, mount)
                        {
                            var
                                $body = this.$body,
                                $mount = $body.find('.' + mount + ' ul');
                            
                            if ($.isArray(data) && mount == 'has')
                            {
                                $mount.find('li').remove();
                            }    

                            $rs.render({
                                '$temp': $('template', $mount),
                                '$mount': $mount,
                                'data': data,
                                'after': function (el) {
                                    $.data(el[1], 'eid', this.event_id);
                                    return el;
                                },
                                'attrs' : ['event_name']
                            });
                        },
                        'watch': function ()
                        {
                            var
                                self = this;

                            this.$body.find('.event-mount').click(function (event) {
                                if (event.target.tagName == 'SPAN')
                                {
                                    var
                                        $target = $(event.target);
                                    
                                    self[$target.attr('action')]($target.parent());
                                }    
                            })
                        },
                        'remove': function ($target)
                        {
                            var
                                eventId = $target.data('eid'),
                                groupId = this.$active.data('gid'),
                                self = this;
                            
                            $rs.ajax('group/remove-event', {
                                'eventId': eventId,
                                'groupId': groupId
                            }).done(function () {
                                self.render({ 'event_id': eventId, 'event_name': $target.text() }, 'not-has');
                                $target.remove();
                                $rs.alert().success('删除成功', 400);
                            }).fail(function (response) {
                                $rs.alert().error('删除失败 <br/>' + response.describe);
                            });
                        },
                        'add': function ($target)
                        {
                            var
                                eventId = $target.data('eid'),
                                groupId = this.$active.data('gid'),
                                self = this;
                            
                            $rs.ajax('group/add-event', {
                                'eventId': eventId,
                                'groupId': groupId
                            }).done(function () {
                                self.render({ 'event_id': eventId, 'event_name': $target.text() }, 'has');
                                $target.remove();
                                $rs.alert().success('添加成功', 400);
                            }).fail(function (response) {
                                $rs.alert().error('添加失败 <br/>' + response.describe);
                            });
                        }    
                    };

                    this._event_ = new $rs.modal('#group-event-modal', init, extend);
                    this._event_.extend({ '$active': $active }).show();
                },
            }
        };

    $rs.addModule('group-manage', _module_);
})($rs);