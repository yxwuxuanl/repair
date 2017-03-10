(function ($service) {
    var
        groupManage = {
            'init': function () {
                $service.ajax('group/get-all').done(function (response) {
                    groupManage.render(response.content);
                    groupManage.watch();
                }).fail(function (response) {
                    $service.alert().error('数据获取失败请刷新后重试');
                });
                
                this.on('account-manage', 'deleteAccount', '_deleteAccount_');
                this.on(this._module_name_, 'removeGroup', '_removeGroup_');
                this.on(this._module_name_, 'addGroup', '_addGroup_');
                this.on('system-event', 'deleteEvent', '_deleteEvent_');
            },

            '_deleteEvent_': function (eventId)
            {
                if (!('_event_' in this.modals)) return;
                
                var
                    $mount = this.modals._event_.$body.find('.event-mount');
                    
                $mount.find('li').each(function () {
                    var
                        $li = $(this);
                    
                    if ($li.data('eid') == eventId)
                    {
                        $li.remove();
                        return false;
                    }    
                });
            },
            
            '_renameEvent_': function (eventId, eventName)
            {
                if (!('_event_' in this)) return;

                var
                    $mount = this.$body.find('.event-mount');
                
                $mount.find('li').each(function () {
                    var
                        $li = $(this);
                    
                    if ($li.data('eid') == eventId)
                    {
                        $li.text(eventName);
                        return false;
                    }    
                })
             }    ,

            '_addGroup_': function ()
            {
                if ('_changeAdmin_' in this.modals)
                {
                    this.modals._changeAdmin_.reload = true;
                }    
            }   , 

            '_removeGroup_': function ()
            {
                if ('_add_' in this.modals)
                {
                    this.modals._add_.reload = true;
                }    

                if ('_changeAdmin_' in this.modals)
                {
                    this.modals._changeAdmin_.reload = true;
                }    
            }, 
            
            '_deleteAccount_': function ($active)
            {
                if (!('_changeAdmin_' in this.modals)) return;
                var
                    $body = this.modals._changeAdmin_.$body;
                
                $body.find('option').each(function () {
                    var
                        $option = $(this);
                    
                    if ($option.data('aid') == accountId)
                    {
                        $option.remove();
                        return false;
                    }    
                })
            }   , 

            'watch': function () {
                this.$panel.find('table').click(function (event) {
                    var
                        $target = $(event.target);
                    
                    if ($target[0].tagName == 'SPAN' && $target.hasClass('glyphicon'))
                    {
                        groupManage.modals[$target.attr('action')]($target.parent().parent());
                    }
                });

                this.$panel.find('.add-row').click(function () {
                    groupManage.modals.add();
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
                            
                            $service.validate($form);

                            $form.submit(function (event) {
                                var
                                    $this = $(this);

                                event.preventDefault();
                                if ($this.valid()) {
                                    self.post($this);
                                }
                            });


                        },
                        'show': function () {
                            if (this.reload) {
                                var
                                    self = this;
                                
                                $service.ajax('account/get-no-assign').done(function (response) {
                                    self.renderAdmin(response.content);
                                }).fail(function (response) {
                                    $service.alert().error('数据获取失败 <br/>' + response.describe);
                                });
                            
                                $service.ajax('event/get-no-assign').done(function (response) {
                                    self.renderEvent(response.content);
                                    self.watch();
                                });

                                this.reload = false;
                            }
                        }, 
                        'close': function ()
                        {
                            this.$body.find('form')[0].reset();
                            this.$body.find('.select').removeClass('.select');
                         }    
                    };

                    extend = {
                        'renderAdmin': function (data, insert)
                        {
                            var
                                $mount = this.$body.find('.admin-mount'),
                                $select = $mount.find('select'),
                                template = $service.template,
                                option;
                            
                            option = '<option value="">{text}</option>'
                            
                            if (!insert)
                            {
                                $select.detach();
                                $select.html('');
                            }    

                            for (var i = 0, len = data.length; i < len; i++)
                            {
                                var
                                    $option = $(template(option, { 'text': data[i]['account_name'] }));
                                
                                $option.data('aid', data[i]['account_id']);
                                $select.append($option);
                            }    

                            if (!insert)
                            {
                                $mount.append($select);
                            }    
                        },
                        'renderEvent': function (data, insert)
                        {
                            var
                                $mount = this.$body.find('.event-mount'),
                                $ul = $mount.find('ul'),
                                template = $service.template,
                                li;
                            
                            li = '<li class="list-group-item">{text}' +
                                '<span class="glyphicon glyphicon-ok"></span>' +
                                '</li>';
                            
                            if (!insert)
                            {
                                $ul = $ul.detach();
                                $ul.html('');
                            }    
                            
                            for (var i = 0, len = data.length; i < len; i++)
                            {
                                var
                                    $li = $(template(li, { 'text': data[i]['event_name'] }));
                                $li.data('eid', data[i]['event_id']);
                                $ul.append($li);
                            }    

                            if (!insert)
                            {
                                $mount.append($ul);
                             }    
                        },
                        'post': function ($form)
                        {
                            var
                                groupName = $form.find('[type=text]').val(),
                                $option = $form.find('option:selected'),
                                $events = this.$body.find('.select'),
                                events = [];
                            
                            if ($events.length < 1)
                            {
                                return $service.alert().error('至少选择一个事件');
                            }    

                            $events.each(function () {
                                events.push($(this).data('eid'));
                            })

                            this.close();

                            $service.ajax('group/add', {
                                'groupName': groupName,
                                'groupAdmin': $option.data('aid'),
                                'events': events.join(',')
                            }).done(function (response) {
                                $events.remove();
                                $option.remove();

                                var
                                    data = {
                                        'group_name': groupName,
                                        'group_id': response.content[0],
                                        'group_admin': $option.text()
                                    };

                                groupManage.render([data], true);

                                $service.alert().success('添加成功', 400);

                                groupManage.trigger('addGroup', data);
                                
                            }).fail(function (response) {
                                $service.alert().error('添加失败 <br/>' + response.describe);
                            });
                        }, 
                        'watch': function ()
                        {
                            this.$body.find('.event-mount').click(function (event) {
                                var
                                    $target = $(event.target);
                                
                                if ($target[0].tagName == 'LI')
                                {
                                    $target.toggleClass('select');
                                }    
                            })
                        }    
                    };

                    this._add_ = new $service.modal('#group-add-modal', init, extend);
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
                            
                            $service.validate($form);
                            $form.submit(function (event) {
                                event.preventDefault();

                                if ($(this).valid())
                                {
                                    self.post($(this));
                                }    
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

                            $service.ajax('group/rename', {
                                'groupId': groupId,
                                'groupName': groupName
                            }).done(function () {
                                $active.find('.group-name').text(groupName);

                                groupManage.trigger('renameGroup', oldName, groupName);

                                $service.alert().success('重命名成功', 400);
                            }).fail(function (response) {
                                $service.alert().error('重命名失败 <br/>' + response.describe);
                            });
                            
                        }    
                    };

                    this._rename_ = new $service.modal('#group-rename-modal', init, extend);
                    this._rename_.extend({ '$active': $active }).show();
                },
                'delete': function ($active) {
                    if ('_delete_' in this)
                    {
                        return this._delete_.extend({ '$active': $active }).show();
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

                            $service.ajax('group/delete', {
                                'groupId': $active.data('gid')
                            }).done(function () {

                                groupManage.trigger('removeGroup', $active.find('.group-name').text());

                                $active.remove();
                                $service.alert().success('删除成功', 400);
                            }).fail(function (response) {
                                $service.alert().error('删除失败 <br/>' + response.describe);
                            });
                        }    
                    };

                    this._delete_ = new $service.modal('#group-delete-modal', init, extend);
                    this._delete_.extend({ '$active': $active }).show();
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
                            this.setTitle('更改 [' + this.$active.find('.group-name').text() + '] 组管理员');

                            if (this.reload)
                            {
                                var
                                    groupId = this.$active.data('gid'),
                                    self = this;
                                
                                $service.ajax('account/get-admin-list', {
                                    'groupId': groupId
                                }).done(function (response) {
                                    self.render(response.content);
                                }).fail(function (response) {
                                    $service.alert().error('数据获取失败 <br/>' + response.describe);
                                });
                                
                                this.reload = false;
                            }    
                        }    
                    };

                    extend = {
                        'reload': true,
                        'render': function (data)
                        {
                            var
                                $mount = this.$body.find('.account-mount'),
                                $select = $mount.find('select').detach(),
                                template = $service.template,
                                option;
                            
                            $select.html('');

                            option = '<option value="">{text}</option>';

                            for (var i = 0, len = data.length; i < len; i++)
                            {
                                var
                                    $option = $(template(option, { 'text': data[i]['account_name'] }));
                                
                                $option.data('aid', data[i]['account_id']);

                                $select.append($option);
                            }    

                            $mount.append($select);
                        },
                        'post': function ()
                        {
                            var
                                $active = this.$active,
                                groupId = $active.data('gid'),
                                $option = this.$body.find('option:selected'),
                                $groupAdmin = $active.find('.group-admin');
                            
                            this.close();

                            $service.ajax('group/change-admin', {
                                'groupId': groupId,
                                'adminId': $option.data('aid')
                            }).done(function () {
                                groupManage.trigger('changeAdmin', $groupAdmin.text(), $option.text(),$active.find('.group-name').text());
                                $groupAdmin.text($option.text());
                                $service.alert().success('更换管理员成功', 400);
                            }).fail(function (response) {
                                $service.alert().error('更换管理员失败 <br/>' + response.describe);
                            });
                        }    
                    };
                    
                    this._changeAdmin_ = new $service.modal('#group-change-admin-modal', init, extend);
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

                            $service.ajax('event/get-no-assign').done(function (response) {
                                self.render(response.content, 'not-has');
                                self.watch();
                            }).fail(function (response) {
                                $service.alert().error('数据获取失败 <br/>' + response.describe);
                            });
                            
                        },
                        'show': function ()
                        {
                            if (this.last == this.$active.data('gid')) return;
                            this.last = this.$active.data('gid');
                            this.setTitle('更改 [' + this.$active.find('.group-name').text() + '] 的事件');

                            var
                                self = this;    

                            $service.ajax('group/get-event', {
                                'groupId': this.$active.data('gid')
                            }).done(function (response) {
                                self.render(response.content, 'has');
                            }).fail(function (response) {
                                $service.alert().error('数据获取失败 <br/>' + response.describe);
                            });
                        },
                        'close': function ()
                        {
                            this.$active = null;
                        }    
                    };

                    extend = {
                        'render': function (data, mount, insert)
                        {
                            var
                                $mount = this.$body.find('.' + mount),
                                $ul = $mount.find('ul'),
                                template = $service.template,
                                icon, li;
                            
                            if (!insert)
                            {
                                $ul = $ul.detach();
                                if (mount == 'has')                                
                                {
                                    $ul.html('');
                                }
                            }    

                            if (mount == 'has')
                            {
                                icon = '<span class="glyphicon glyphicon-trash" action="remove"></span>';
                            } else {
                                icon = '<span class="glyphicon glyphicon-plus" action="add"></span>';
                            }

                            li = '<li class="list-group-item">{text}' + icon + '</li>';

                            for (var i = 0, len = data.length; i < len; i++)
                            {
                                var
                                    $li = $(template(li, { 'text': data[i]['event_name'] }));
                                
                                $li.data('eid', data[i]['event_id']);
                                $ul.append($li);
                            }    

                            if (!insert)
                            {
                                $mount.append($ul);
                            }    
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
                            
                            $service.ajax('group/remove-event', {
                                'eventId': eventId,
                                'groupId': groupId
                            }).done(function () {
                                self.render([{ 'event_id': eventId, 'event_name': $target.text() }], 'not-has', true);
                                $target.remove();
                                $service.alert().success('删除成功', 400);
                            }).fail(function (response) {
                                $service.alert().error('删除失败 <br/>' + response.describe);
                            });
                        },
                        'add': function ($target)
                        {
                            var
                                eventId = $target.data('eid'),
                                groupId = this.$active.data('gid'),
                                self = this;
                            
                            $service.ajax('group/add-event', {
                                'eventId': eventId,
                                'groupId': groupId
                            }).done(function () {
                                self.render([{ 'event_id': eventId, 'event_name': $target.text() }], 'has', true);
                                $target.remove();
                                $service.alert().success('添加成功', 400);
                            }).fail(function (response) {
                                $service.alert().error('添加失败 <br/>' + response.describe);
                            });
                        }    
                    };

                    this._event_ = new $service.modal('#group-event-modal', init, extend);
                    this._event_.extend({ '$active': $active }).show();
                },
            },
            'render': function (data,insert) {
                var
                    $mount = this.$panel.find('.mount'),
                    $tbody = $mount.find('tbody'),
                    template = $service.template,
                    tr;
                
                if (!insert)
                {
                    $tbody.detach();
                }    

                tr = '<tr>' +
                    '<td class="group-name">{groupName}</td>' +
                    '<td class="group-admin">{groupAdmin}</td>' +
                    '<td class="actions">' +
                    '<span class="glyphicon glyphicon-pencil" action="rename"></span>' +
                    '<span class="glyphicon glyphicon-trash" action="delete"></span>' +
                    '<span class="glyphicon glyphicon-user" action="changeAdmin"></span>' +
                    '<span class="glyphicon glyphicon-th-list" action="event"></span>' +
                    '</tr>';
                
                for (var i = 0, len = data.length; i < len; i++)
                {
                    var
                        $tr = $(template(tr, {
                            'groupName': data[i]['group_name'],
                            'groupAdmin': data[i]['group_admin'] || '未指派'
                        }));
                    
                    $tr.data('gid', data[i]['group_id']);
                    $tbody.append($tr);
                }    

                if (!insert)
                {
                    $mount.append($tbody);
                }    
            }
        };

    $service.addModule('group-manage', groupManage);
})($service);