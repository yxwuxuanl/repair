(function ($service) {
    var
        groupManage = {
            'destory': function () {
                this.$panel.html('');
            },
            'init': function () {
                $service.ajax('group/get-all').done(function (response) {
                    groupManage.renderGrid(response.content);
                    groupManage.watch();
                }).fail(function (response) {
                    $service.alert().error('数据获取失败请刷新后重试');
                });
            },
            'watch': function () {
                this.$panel.find('.data-mount').click(function (event) {
                    var
                        $target = $(event.target);
                    
                    if ($target[0].tagName == 'SPAN' && $target.hasClass('glyphicon')) {
                        groupManage.modals[$target.attr('action')]().extend({ '$active': $target.parent().parent() }).show();
                    }
                });

                this.$panel.find('.add-row').click(function () {
                    groupManage.modals.add().show();
                })
            },
            'modals': {
                'add': function () {
                    if (!('_add_' in this)) {
                        this._add_ = new $service.modal('#group-add-modal', {
                            'init': function () {
                                var
                                    self = this;
                                
                                this.$body.find('button').click(function () {
                                    self.$body.find('form').submit();
                                });

                                this.renderAdminList();
                                this.renderEvent();

                                $service.validate(this.$body.find('form'));

                                this.$body.find('form').submit(function (event) {
                                    event.preventDefault();
                                    if (!$(this).valid()) return false;

                                    var
                                        events = self.$body.find('.select'),
                                        eid = [],
                                        $form = $(this),
                                        groupName = $form.find('[type=text]').val(),
                                        $option = self.$body.find('option:selected');
                                    
                                    if (events.length < 1) {
                                        $service.alert().error('必须选择一个事件');
                                        return false;
                                    }
                                    
                                    events.each(function () {
                                        eid.push($(this).data('eid'));
                                    });

                                    $service.ajax('group/add', {
                                        'groupName': groupName,
                                        'groupAdmin': $option.data('aid'),
                                        'events': eid.join(',')
                                    }).done(function (response) {
                                        groupManage.modals.add().close();
                                        $service.alert().success('添加成功', 400, function () {
                                            var
                                                data = {},
                                                gid = response.content;
                                            
                                            data[gid] = {
                                                'group_name': groupName,
                                                'group_admin': $option.text(),
                                            }
                                            groupManage.trigger('add', [data]);
                                            groupManage.renderGrid(data);
                                            events.remove();
                                            $option.remove();
                                        });
                                    }).fail(function (response) {
                                        groupManage.modals.add().close();
                                        $service.alert().error('添加失败<br/>' + response.describe);
                                    });
                                });

                                this.$body.find('.events').click(function (event) {
                                    var
                                        $target = $(event.target);
                                    
                                    if ($target[0].tagName == 'LI') {
                                        $target.toggleClass('select')
                                    }
                                })
                                
                            },
                            'close': function () {
                                this.$body.find('.select').removeClass('select');
                                this.$body.find('form')[0].reset();
                            }
                        },
                            {
                                'renderEvent': function () {
                                    var
                                        self = this;
                                    $service.ajax('event/get-no-assign').done(function (response) {
                                        var
                                            _template = $service.template,
                                            _tag = $service.tag,
                                            $mount = self.$body.find('ul').detach(),
                                            template;
                                    
                                        template = _tag('li', '.list-group-item', [
                                            '{event_name}',
                                            _tag('span', '.glyphicon glyphicon-ok')
                                        ]);
                                        
                                        $mount.html('');

                                        for (var i = 0, len = response.content.length; i < len; i++) {
                                            var $li = $(_template(template, {
                                                'event_name': response.content[i]['event_name']
                                            }));

                                            $li.data('eid', response.content[i]['event_id']);
                                            $mount.append($li);
                                        }

                                        self.$body.find('.events').append($mount);
                                    });
                                },
                                'renderAdminList': function () {
                                    var
                                        self = this;

                                    $service.ajax('account/get-no-assign').done(function (response) {
                                        var
                                            options = [],
                                            _template = $service.template,
                                            _tag = $service.tag,
                                            $select = self.$body.find('select'),
                                            data = response.content,
                                            template;
                                    
                                        $select.children().remove();

                                        template = _tag('option', {}, '{text}');

                                        for (var i = 0, len = data.length; i < len; i++) {
                                            var
                                                $option = $(_template(template, { 'text': data[i]['account_name'] }));
                                            
                                            $option.data('aid', data[i]['account_id']);

                                            $select.append($option);
                                        }
                                    });
                                }
                            }
                        );
                    }

                    return this._add_;
                },
                'rename': function () {
                    if (!('_rename_' in this)) {
                        this._rename_ = new $service.modal('#group-rename-modal', {
                            'init': function () {
                                var
                                    $form = this.$body.find('form'),
                                    self = this;

                                $service.validate($form);

                                $form.submit(function (event) {
                                    event.preventDefault();
                                    var
                                        $form = $(this);
                                    
                                    if (!$form.valid()) return false;
                                    
                                    var
                                        gid = self.$active.data('gid'),
                                        gname = $form.find('[type=text]').val();

                                    $service.ajax('group/rename', {
                                        'group': gid,
                                        'name': gname
                                    }).done(function (response) {
                                        var
                                            $old = self.$active.find('td').eq(0);
                                        
                                        groupManage.trigger('rename', [gname, $old.text()]);
                                        $old.text(gname);
                                        self.close();
                                        $service.alert().success('重命名成功', 400);
                                    }).fail(function (response) {
                                        $service.alert().error('重命名失败<br/>' + response.describe);
                                    });
                                })
                            },
                            'close': function () {
                                this.$body.find('form')[0].reset();
                                this.$active = null;
                            },
                            'show': function () {
                                this.setTitle('重命名 [' + this.$active.find('td').eq(0).text() + ']');
                            }
                        });
                    }
                    return this._rename_;
                },
                'delete': function () {
                    if (!('_delete_' in this)) {
                        this._delete_ = new $service.modal('#group-delete-modal', {
                            'init': function () {
                                var
                                    self = this;

                                this.$body.find('button').click(function () {
                                    $service.ajax('group/delete', {
                                        'group': self.$active.data('gid')
                                    }).done(function () {
                                        groupManage.trigger('delete', [self.$active.find('td').eq(0).text()]);
                                        self.$active.remove();
                                        self.close();
                                        $service.alert().success('删除成功', 400);
                                    }).fail(function (response) {
                                        $service.alert().error('删除失败<br/>' + response.describe)
                                    });
                                });
                            },
                            'close': function () {
                                this.$active = null;
                            },
                            'show': function () {
                                this.setTitle('删除 [' + this.$active.find('td').eq(0).text() + ']');
                            }

                        });
                    }

                    return this._delete_;
                },
                'changeAdmin': function () {
                    if (!('_changeAdmin_' in this)) {
                        this._changeAdmin_ = new $service.modal('#group-change-admin-modal', {
                            'init': function () {
                                var
                                    self = this;
                                this.$body.find('button').click(function () {
                                    var
                                        $option = self.$body.find('option:selected'),
                                        group = self.$active.data('gid');
                                    $service.ajax('group/change-admin', {
                                        'admin': $option.data('aid'),
                                        'group': group
                                    }).done(function () {

                                        var
                                            newAdmin = $option.text(),
                                            $oldAdmin = self.$active.find('td').eq(1);

                                        groupManage.trigger('change-admin', [newAdmin, $oldAdmin.text()]);
                                        $oldAdmin.text(newAdmin);

                                        self.close();
                                        $service.alert().success('分配成功', 400);
                                    })
                                });
                            },
                            'show': function () {
                                this.setTitle('更换 [' + this.$active.find('td').eq(0).text() + '] 管理员');
                                this.renderAdminList();
                            }
                        }, {
                                'renderAdminList': function () {
                                    var
                                        self = this;
                                    
                                    $service.ajax('account/get-admin-list', {
                                        'group': self.$active.data('gid')
                                    }).done(function (response) {
                                        var
                                            _template = $service.template,
                                            data = response.content,
                                            $select = self.$body.find('select').detach(),
                                            template;
                                        
                                        $select.children().remove();
                                        
                                        template = $service.tag('option', {}, '{text}');

                                        for (var i = 0, len = data.length; i < len; i++) {
                                            var
                                                $option = $(_template(template, { 'text': data[i]['account_name'] }));
                                            
                                            $option.data('aid', data[i]['account_id']);
                                            $select.append($option);
                                        }

                                        self.$body.find('.accounts').append($select);
                                    })
                                }
                            }
                        );
                    }

                    return this._changeAdmin_;
                },
                'event': function ()
                {

                }    
            },
            'renderGrid': function (data) {
                var
                    $mount = this.$panel.find('.data-mount'),
                    _template = $service.template,
                    _tag = $service.tag,
                    template, actions, detach;
                
                if (!$mount.data('IS_LOAD')) {
                    $mount = $mount.detach();
                    detach = true;
                }

                actions = _tag('td', '.actions', [
                    _tag('span', { 'action': 'rename', 'class': 'glyphicon glyphicon-pencil' }),
                    _tag('span', { 'action': 'delete', 'class': 'glyphicon glyphicon-trash' }),
                    _tag('span', { 'action': 'changeAdmin', 'class': 'glyphicon glyphicon-user' }),
                    _tag('span', { 'action': 'event', 'class': 'glyphicon glyphicon-th-list' })
                ]);

                template = _tag('tr', {}, [
                    _tag('td', '{groupName}'),
                    _tag('td', '{groupAdmin}'),
                    actions
                ]);
                
                for (var gid in data) {
                    var $tr = $(_template(template, {
                        'groupName': data[gid]['group_name'],
                        'groupAdmin': data[gid]['group_admin']
                    }));

                    $tr.data('gid', gid);
                    $mount.append($tr);
                }

                if (detach) {
                    this.$panel.find('table').append($mount);
                    $mount.data('IS_LOAD', true);
                } else {
                    $mount.append($tr);
                }
            }
        };

    $service.addModule('group-manage', groupManage);
})($service);