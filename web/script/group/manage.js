(function ($rs) {
    var
        groupManage = {
            'init': function () {
                this.watcher().define('groups', function (old, _new_, $mount) {
                    if (_new_ > 0) {
                        if (old == 0) {
                            $mount.find('.empty').remove();
                        }
                    } else {
                        $rs.render({
                            '$temp': $('#t-empty', groupManage.$panel)
                        });
                    }
                });

                $rs.ajax('group/get-all').done(function (response) {
                    var
                        data = response.content;
                    
                    if (data.length < 1)
                    {
                        groupManage.watcher().change('groups', 0);
                    } else {
                        $rs.render({
                            '$temp': $('#t-content', groupManage.$panel),
                            'data': data,
                            'before': function () {
                                groupManage.watcher().change('groups', this.data.length, this.$mount);
                            },
                            'filter': function () {
                                if (this.group_admin == null) {
                                    this.group_admin = '未指派';
                                }
                            },
                            'after': function (el) {
                                $.data(el[1], 'gid', this.group_id);
                                return el;
                            }
                        });
                    }
                    groupManage.watch();
                }).fail(function (response) {
                    $rs.alert().error('数据获取失败请刷新后重试');
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
                        groupManage.modals[$target.attr('action')]($target.parent().parent().parent());
                    }
                });

                this.$panel.find('.add').click(function () {
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
                            
                            $rs.validate($form);

                            $form.submit(function (event) {
                                var
                                    $this = $(this);

                                event.preventDefault();
                                $this.valid() && self.post($this);
                            });

                            this.$body.find('.event-mount').click(function (event) {
                                if (event.target.tagName == 'LI') {
                                    $(event.target).toggleClass('select');
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
                                response.content.account.length > 0 && self.renderAdmin(response.content.account);
                                response.content.event.length > 0 && self.renderEvent(response.content.event);
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
                                '$temp': $('#t-event-content', $body),
                                'data': data,
                                'after': function (el) {
                                    $.data(el[1], 'eid', this.event_id);
                                    return el;
                                }
                            });
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
                                return $rs.alert().error('至少选择一个事件');
                            }    

                            $events.each(function () {
                                events.push($(this).data('eid'));
                            })

                            this.close();

                            $rs.ajax('group/add', {
                                'groupName': groupName,
                                'groupAdmin': $option.data('aid'),
                                'events': events.join(',')
                            }).done(function (response) {
                                var
                                    data = {
                                        'group_name': groupName,
                                        'group_id': response.content[0],
                                        'group_admin': $option.text()
                                    };

                                $events.remove();
                                $option.remove();

                                $rs.render({
                                    '$temp': $('#t-content', groupManage.$panel),
                                    'data': [data],
                                    'after': function (el) {
                                        $.data(el[1], 'gid', this.group_id);
                                        return el;
                                    },
                                    'before': function () {
                                        groupManage.watcher().plus('groups', this.$mount);
                                    }
                                });

                                $rs.alert().success('添加成功', 400);
                                groupManage.trigger('addGroup', data);
                            }).fail(function (response) {
                                $rs.alert().error('添加失败 <br/>' + response.describe);
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

                            $rs.ajax('group/rename', {
                                'groupId': groupId,
                                'groupName': groupName
                            }).done(function () {
                                $active.find('.group-name').text(groupName);

                                // Todo
                                groupManage.trigger('renameGroup', oldName, groupName);

                                $rs.alert().success('重命名成功', 400);
                            }).fail(function (response) {
                                $rs.alert().error('重命名失败 <br/>' + response.describe);
                            });
                            
                        }    
                    };

                    this._rename_ = new $rs.modal('#group-rename-modal', init, extend);
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

                            $rs.ajax('group/delete', {
                                'groupId': $active.data('gid')
                            }).done(function () {
                                groupManage.trigger('removeGroup', $active.find('.group-name').text());
                                groupManage.watcher().sub('groups');

                                $active.remove();
                                $rs.alert().success('删除成功', 400);
                            }).fail(function (response) {
                                $rs.alert().error('删除失败 <br/>' + response.describe);
                            });
                        }    
                    };

                    this._delete_ = new $rs.modal('#group-delete-modal', init, extend);
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
                                
                                $rs.ajax('account/get-admin-list', {
                                    'groupId': groupId
                                }).done(function (response) {
                                    self.render(response.content);
                                }).fail(function (response) {
                                    $rs.alert().error('数据获取失败 <br/>' + response.describe);
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
                                template = $rs.template,
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

                            $rs.ajax('group/change-admin', {
                                'groupId': groupId,
                                'adminId': $option.data('aid')
                            }).done(function () {
                                groupManage.trigger('changeAdmin', $groupAdmin.text(), $option.text(),$active.find('.group-name').text());
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
                                }
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

    $rs.addModule('group-manage', groupManage);
})($rs);