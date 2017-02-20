(function ($service) {
    var
        account_manage = {
            'modals': {
                'getDelete': function () {
                    if (!('delete' in this)) {
                        this.delete = new $service.modal('#account-delete-modal', {
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
                    return this.delete;
                },
                'getAdd': function () {
                    if (!('add' in this)) {
                        this.add = new $service.modal('#account-add-modal', {
                            'init': function () {
                                var
                                    $form = this.$body.find('form');

                                $service.validate($form);

                                $form.submit(function (event) {
                                    var
                                        $this = $(this);

                                    event.preventDefault();

                                    if ($this.valid()) {
                                        var
                                            data = {
                                                'account_name': $this.find('[type=text]').val()
                                            },
                                            $select = $this.find('select'),
                                            group_id = $this.find('select').val(),
                                            group_name;
                                        
                                        if (group_id != 0) {
                                            data['group'] = group_id;
                                            group_name = $select.find('[value=' + group_id + ']').html();
                                        } else {
                                            group_name = '未分配';
                                        }

                                        account_manage.modals.getAdd().close();
                                        
                                        $service.ajax('account/add', 'POST', data).done(function (response) {
                                            $service.alert().success('添加成功', 400, function () {
                                                account_manage.render([$.extend(data, {
                                                    'group_id': group_id,
                                                    'role': 'normal',
                                                    'group_name': group_name,
                                                    'account_id': response.content.account_id
                                                })]);
                                            });
                                        }).fail(function (response) {
                                            $service.alert().error('添加失败<br>' + response.describe);
                                        });
                                    }
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

                    return this.add;
                }
            },
            'init': function () {
                $service.ajax('account/get-all').done(function (response) {

                    var
                        accounts = response.content;

                    $service.ajax('group/get-all', {
                        'includeAdmin': 0,
                        'noAssign' : 0
                    }).done(function (response) {
                        account_manage.renderAccountList(accounts, response.content);
                        account_manage.renderGroupList(response.content);
                    });

                    account_manage.watch();

                }).fail(function (response) {
                    $service.alert().error('数据获取失败');
                });
            },
            'watch': function () {
                account_manage.$panel.click(function (event) {
                    var
                        targetName = event.target.tagName;
                    
                    if (targetName == 'SPAN') {
                        var
                            $target = $(event.target);
                        
                        if ($target.hasClass('delete-icon')) {
                            account_manage.actions.delete($target);
                        } else if ($target.hasClass('add-row')) {
                            account_manage.actions.add();
                        }
                    }
                });
            },
            'actions': {
                'delete': function ($target) {
                    var
                        $tr = $target.parent().parent();

                    account_manage.modals.getDelete().extend({
                        '$active': $tr
                    }).show();
                },
                'add': function () {
                    account_manage.modals.getAdd().show();
                }
            },
            'renderAccountList': function (accounts, groups) {
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

                for (var i = 0, len = accounts.length; i < len; i++) {
                    $tr = $(_template(template, {
                        'name': accounts[i]['account_name'],
                        'group': groups[accounts[i]['account_group']]['group_name'],
                        'role': accounts[i]['role'],
                        'delete': deleteSpan
                    }));

                    $tr.data('aid', accounts[i]['account_id']);
                    $mount.append($tr);
                }
            },
            'renderGroupList': function (groups) {
                var
                    _template = $service.template,
                    data = groups,
                    options = [],
                    template;
                                    
                template = $service.tag('option', { 'value': '{gid}' }, '{gname}');

                options.push(_template(template, {
                    'gid': 0,
                    'gname': '不分配'
                }));

                for (var gid in data) {
                    options.push(_template(template, {
                        'gid': gid,
                        'gname': data[gid]['group_name']
                    }));
                }

                this.$panel.find('select').html(options.join(''));
            }
        };
    
    $service.addModule('account-manage', account_manage);
})($service);