(function ($service) {
    var
        accountManage = {
            'init': function () {
                $service.ajax('account/get-all').done(function (response) {
                    accountManage.render(response.content);
                    accountManage.watch();
                }).fail(function (response) {
                    $service.alert().error('数据获取失败');
                });
                
                this.on('group-manage', 'renameGroup', '_renameGroup_');
                this.on('group-manage', 'addGroup', '_addGroup_');
                this.on('group-manage', 'removeGroup', '_removeGroup_');
                this.on('group-manage', 'changeAdmin', '_changeAdmin_');
            },

            '_changeAdmin_': function (oldAdmin, newAdmin,groupName)
            {
                var
                    $mount = this.$panel.find('table'),
                    $tbody = $mount.find('tbody').detach();
                
                $tbody.find('tr').each(function () {
                    var
                        $tr = $(this);
                    
                    if ($tr.find('.account-name').text() == oldAdmin)
                    {
                        $tr.find('.role').text('normal');
                    } else if ($tr.find('.account-name').text() == newAdmin)
                    {
                        $tr.find('.group-name').text(groupName);
                        $tr.find('.role').text('group_admin');
                    }    
                });

                $mount.append($tbody);
            }   , 

            '_removeGroup_': function (groupName)
            {
                var
                    $mount = this.$panel.find('table'),
                    $tbody = $mount.find('tbody').detach();
                
                $tbody.find('tr').each(function () {
                    var
                        $tr = $(this);
                    
                    if ($tr.find('.group-name').text() == groupName) {

                        if ($tr.find('.role').text() == 'group_admin') {
                            $tr.find('.role').text('normal');
                        }

                        $tr.find('.group-name').text('未分配');
                    }
                });

                $mount.append($tbody);

                if ('_rename_' in this.modals)
                {
                    var
                        $mount = this.modals._rename_.$body.find('.mount'),
                        $select = $mount.find('select').detach();
                    
                    $select.find('option').each(function () {
                        var
                            $option = $(this);
                        
                        if ($option.text() == groupName)
                        {
                            $option.remove();
                            return false;
                        }    
                    });
                        
                    $mount.append($select);
                }    
            },

            '_renameGroup_': function (oldName, newName) {
                var
                    $mount = this.$panel.find('table'),
                    $tbody = $mount.find('tbody').detach();
                
                $tbody.find('tr').each(function () {
                    var
                        $groupName = $(this).find('.group-name');
                    
                    if ($groupName.text() == oldName) {
                        $groupName.text(newName);
                    }
                });

                $mount.append($tbody);

                if ('_add_' in this.modals) {
                    var
                        $mount = this.modals._add_.$body.find('.mount'),
                        $select = $mount.find('select').detach();
                    
                    $select.find('option').each(function () {
                        var
                            $this = $(this);
                        
                        if ($this.text() == oldName) {
                            $this.text(newName);
                            return false;
                        }
                    });

                    $mount.append($select);
                }
            },
            
            '_addGroup_': function (data) {
                if ('_add_' in this.modals) {
                    this.modals._add_.render([data], true);
                }
                    
                var
                    $mount = this.$panel.find('table'),
                    $tbody = $mount.find('tbody').detach();

                $tbody.find('tr').each(function () {
                    var
                        $tr = $(this);
                        
                    if ($tr.find('.account-name').text() == data['group_admin']) {
                        $tr.find('.group-name').text(data['group_name']);
                        $tr.find('.role').text('group_admin');
                        return false;
                    }
                })

                $mount.append($tbody);

            }, 

            'modals': {
                'delete': function ($active) {
                    if ('_delete_' in this)
                    {
                        return this._delete_.extend('$active', $active).show();
                    }    

                    var
                        init, extend;
                    
                    init = {
                        'init': function () {
                            var
                                self = this;
                            
                            this.$body.find('button').click(function () {
                                self.post($(this));
                            });
                        },
                        'show': function () {
                            this.setTitle('删除 [' + this.$active.find('.account-name').text() + ']');
                        },
                        'close': function ()
                        {
                            this.$active = null;
                        }    
                    };

                    extend = {
                        'post': function ()
                        {
                            var
                                $active = this.$active,
                                accountId = $active.data('aid');
                            
                            this.close();

                            $service.ajax('account/delete', {
                                'accountId': accountId
                            }).done(function () {

                                accountManage.trigger('deleteAccount', $active);
                                
                                $active.remove();
                                $service.alert().success('删除成功', 400);
                            }).fail(function (response) {
                                $service.alert().error('删除失败 <br/>' + response.describe);
                            });
                        }    
                    };

                    this._delete_ = new $service.modal('#account-delete-modal', init, extend);
                    return this._delete_.extend('$active', $active).show();
                },
                'add': function () {

                    if ('_add_' in this)
                    {
                        return this._add_.show();
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
                            });

                            $service.ajax('group/get-all', {
                                'includeAdmin': 0
                            }).done(function (response) {
                                self.render(response.content);
                            }).fail(function (response) {
                                $service.alert().error('数据获取失败 <br/>' + response.describe);
                            });
                        },
                        'close': function ()
                        {
                            this.$body.find('select').val(0);
                            this.$body.find('form')[0].reset();
                        }    
                    };

                    extend = {
                        'post': function ($form)
                        {
                            var
                                accountName = $form.find('[type=text]').val(),
                                $option = $form.find('option:selected'),
                                groupId = $option.data('gid') || 0;

                            this.close();

                            $service.ajax('account/add', {
                                'accountName': accountName,
                                'groupId': groupId
                            }).done(function (response) {
                                accountManage.render([{
                                    'account_id': response.content[0],
                                    'account_name': accountName,
                                    'group_name': $option.text(),
                                    'role': 'normal'
                                }], true);
                                $service.alert().success('添加成功', 400);
                            }).fail(function (response) {
                                $service.alert().error('添加失败 <br/>' + response.describe);
                            });
                        },
                        'render': function (data,insert)
                        {
                            var
                                template = $service.template,
                                $mount = this.$body.find('.mount'),
                                $select = $mount.find('select'),
                                option;
                            
                            option = '<option>{text}</option>';

                            if (!insert)
                            {
                                $select = $select.detach();
                            }    

                            for (var i = 0, len = data.length; i < len; i++)
                            {
                                var
                                    $option = $(template(option, { 'text': data[i]['group_name'] }));
                                
                                $option.data('gid', data[i]['group_id']);
                                $select.append($option);
                            }    

                            if (!insert)
                            {
                                $mount.append($select);
                            }    
                        }
                    };

                    this._add_ = new $service.modal('#account-add-modal', init, extend);
                    this._add_.show();
                }
            },
            'deleteGroup': function (group) {
                var
                    $table = this.$panel.find('table'),
                    $tbody = $table.find('tbody').detach();
                
                $tbody.find('tr').each(function () {
                    var
                        $tr = $(this);

                    if ($tr.find('td').eq(1).text() == group) {
                        $tr.find('td').eq(1).text('未分配').end().eq(2).text('normal');
                    }
                })

                $table.append($tbody);

                if ('_add_' in this.modals) {
                    var
                        $select = this.modals['_add_'].$body.find('select');
                    
                    $select.find('option').each(function () {
                        if ($(this).text() == group) {
                            $(this).remove();
                            return false;
                        }
                    })
                }
            },

            'editGroupName': function (newName, oldName) {
                var
                    $table = this.$panel.find('table'),
                    $tbody = $table.find('tbody').detach();
                
                $tbody.find('tr').each(function () {
                    var
                        $tr = $(this),
                        $td = $tr.find('td').eq(1);

                    if ($td.text() == oldName) {
                        $td.text(newName);
                    }
                })

                $table.append($tbody);
            },
            
            'setGroupAdmim': function (newAdmin, oldAdmin) {
                var
                    $table = this.$panel.find('table'),
                    $tbody = $table.find('tbody').detach();
                
                $tbody.find('tr').each(function () {
                    var
                        $tr = $(this),
                        $td = $tr.find('td');
                    
                    if ($td.eq(0).text() == newAdmin) {
                        $td.eq(2).text('group_admin');
                    } else if ($td.eq(0).text() == oldAdmin) {
                        $td.eq(2).text('normal');
                    }
                })

                $table.append($tbody);
            },

            'watch': function () {
                this.$panel.find('table').click(function (event) {
                    var
                        targetName = event.target.tagName;
                    
                    if (targetName == 'SPAN') {
                        var
                            $target = $(event.target);
                        
                        accountManage.modals.delete($target.parent().parent());
                    }
                }).end().find('h4').click(function () {
                    accountManage.modals.add(); 
                });
            },
            'render': function (data,insert) {
                var
                    $mount = this.$panel.find('table'),
                    $tbody = $mount.find('tbody'),
                    template = $service.template,
                    tr;
                    
                if (!insert)
                {
                    $tbody = $tbody.detach();
                }    

                tr = '<tr><td class="account-name">{accountName}</td>' +
                    '<td class="group-name">{groupName}</td>' +
                    '<td class="role">{role}</td>' +
                    '<td><span class="glyphicon glyphicon-trash"></span></td></tr>';

                for (var i = 0, len = data.length; i < len; i++)
                {
                    var
                        $tr = $(template(tr, {
                            'accountName': data[i]['account_name'],
                            'groupName': data[i]['group_name'],
                            'role': data[i]['role']
                        }));

                    $tr.data('aid', data[i]['account_id']);
                    $tbody.append($tr);
                }

                if (!insert)
                {
                    $mount.append($tbody);
                }    
            },

        };
    
    $service.addModule('account-manage', accountManage);
})($service);