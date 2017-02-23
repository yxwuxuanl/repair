(function ($service) {
    var
        account_manage = {
            'modals': {
                'delete': function () {
                    if (!('_delete_' in this)) {
                        this._delete_ = new $service.modal('#account-delete-modal', {
                            'init': function () {
                                var
                                    _this = this;

                                this.$body.find('button').click(function () {
                                    var
                                        $active = _this.$active;
                                    
                                    _this.close();

                                    $service.ajax('account/delete', 'POST', {
                                        'aid': $active.data('aid'),
                                        '_csrf': $service.getCsrf()
                                    }).done(function (response) {
                                        $service.alert().success('删除成功', 400, function () {
                                            $active.remove();
                                            $active = null;
                                        });
                                    }).fail(function (response) {
                                        $service.alert().error('删除失败<br>' + response.describe);
                                        $active = null;
                                    });
                                });
                            },
                            'show': function () {
                                var
                                    $active = this.$active;
                            
                                this.$body.find('.account-name').text($active.find('td').eq(0).text());

                                if ($active.data('role') == 'group_admin') {
                                    this.$body.find('.group-name').text($active.find('td').eq(1).text());
                                    this.$body.find('.ga-tips').show();
                                }
                            },
                            'close': function () {
                                this.$body.find('.ga-tips').hide();
                                this.$active = null;
                            }
                        });
                    }
                    return this._delete_;
                },
                'add': function () {
                    if (!('_add_' in this)) {
                        this._add_ = new $service.modal('#account-add-modal', {
                            'init': function () {
                                var
                                    $form = this.$body.find('form');

                                $service.validate($form);

                                $form.submit(function (event) {
                                    var
                                        $this = $(this);

                                    event.preventDefault();

                                    if (!$this.valid()) return false;
                                    var
                                        data = {
                                            'account_name': $this.find('[type=text]').val()
                                        },
                                        $option = $this.find('option:selected'),
                                        group_id = $option.data('gid'),
                                        group_name;
                                        
                                    if (group_id != 0) {
                                        data['group'] = group_id;
                                        group_name = $option.text();
                                    } else {
                                        group_name = '未分配';
                                    }

                                    account_manage.modals.add().close();
                                        
                                    $service.ajax('account/add', 'POST', data).done(function (response) {
                                        $service.alert().success('添加成功', 400, function () {
                                            account_manage.renderAccountList([$.extend(data, {
                                                'group_id': group_id,
                                                'role': 'normal',
                                                'group_name': group_name,
                                                'account_id': response.content.account_id
                                            })]);
                                        });
                                    }).fail(function (response) {
                                        $service.alert().error('添加失败<br>' + response.describe);
                                    });

                                });

                                $service.ajax('group/get-all').done(function (response) {
                                    account_manage.renderGroupList(response.content);
                                });
                            },
                            'close': function () {
                                var
                                    $form = this.$body.find('form');
                                
                                $form[0].reset();
                                $form.validate().resetForm();
                            }
                        });
                    }
                    return this._add_;
                }
            },

            'init': function () {
                $service.ajax('account/get-all').done(function (response) {
                    account_manage.renderAccountList(response.content);
                    account_manage.watch();
                }).fail(function (response) {
                    $service.alert().error('数据获取失败');
                });
                
                this.on('group-manage', 'delete', 'deleteGroup');
                this.on('group-manage', 'change-admin', 'setGroupAdmim');
                this.on('group-manage', 'rename', 'editGroupName');
                this.on('group-manage', 'add' , function (data) {
                    if ('_add_' in this.modals) {
                        this.renderGroupList(data);
                    }
                });
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
                account_manage.$panel.click(function (event) {
                    var
                        targetName = event.target.tagName;
                    
                    if (targetName == 'SPAN') {
                        var
                            $target = $(event.target);
                        
                        if ($target.hasClass('delete-icon')) {
                            if ($target.parent().parent().data('role') == 'group_admin') {
                                $service.alert().error('无法删除组管理员');
                                return false;
                            }
                            account_manage.modals.delete().extend({ '$active': $target.parent().parent() }).show();
                        } else if ($target.hasClass('add-row')) {
                            account_manage.modals.add().show();
                        }
                    }
                });
            },
            'renderAccountList': function (data) {
                var
                    $mount = this.$panel.find('tbody'),
                    _tag = $service.tag,
                    _template = $service.template,
                    template, deleteSpan, $tr;
                    
                template = _tag('tr', {}, [
                    _tag('td', '.account-name', '{name}'),
                    _tag('td', '{group}'),
                    _tag('td', '{role}'),
                    _tag('td', '{delete}')
                ]);

                deleteSpan = _tag('span', '.glyphicon glyphicon-trash delete-icon');

                for (var i = 0, len = data.length; i < len; i++) {
                    $tr = $(_template(template, {
                        'name': data[i]['account_name'],
                        'group': data[i]['group_name'],
                        'role': data[i]['role'],
                        'delete': deleteSpan
                    }));

                    $tr.data('aid', data[i]['account_id']);
                    $tr.data('role', data[i]['role']);
                    $tr.data('gid', data[i]['account_group']);
                    $mount.append($tr);
                }
            },
            'renderGroupList': function (data) {
                var
                    _template = $service.template,
                    $select = this.$panel.find('select'),
                    template;
                                    
                template = $service.tag('option', '{gname}');

                for (var gid in data) {
                    var
                        $option = $(_template(template, { 'gname': data[gid]['group_name'] }));
                    
                    $option.data('gid', gid);
                    $select.append($option);
                }
            }
        };
    
    $service.addModule('account-manage', account_manage);
})($service);