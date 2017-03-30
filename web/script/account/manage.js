(function ($rs) {
    var
        accountManage = {
            'init': function () {
                this.watcher().define('accounts', function (old, _new_, $mount) {
                    if (_new_ > 0) {
                        if (old == 0) {
                            $mount.find('.empty').remove();
                        }
                            
                    } else {
                        $rs.render({
                            '$temp': $('.t-empty', accountManage.$panel),
                            '$mount' : $mount || null
                        });
                    }
                });

                this.watch();
                this.bind(this.events);
            },

            '_run_' : function()
            {
                if(this.reload)
                {
                    $rs.ajax('account/get-all').done(function (response) {
                        accountManage.render(response.content);
                    }).fail(function (response) {
                        $rs.alert().error('数据获取失败');
                    });

                    this.reload = false;
                }
            },

            'reload' : true,

            'render' : function(data)
            {
                $rs.render({
                    '$temp': $('.t-content', accountManage.$panel),
                    'before' : function()
                    {
                        if($.isArray(this.data))
                        {
                            if (this.data.length < 1) {
                                accountManage.watcher().change('accounts', 0, this.$mount);
                                return false;
                            }

                            this.$mount.find('tr').remove();

                            accountManage.watcher().change('accounts', this.data.length, this.$mount);
                        }else{
                            accountManage.watcher().plus('accounts',this.$mount);
                        }
                    },
                    'data' : data,
                    'after' : function(el)
                    {
                        $.data(el[1], 'gid', this.account_group);
                        $.data(el[1],'aid',this.account_id);
                        $.data(el[1],'role',this.role);
                        return el;
                    }, 
                    'filter': function () {
                        if (this.role == 'normal') {
                            this.role = '普通账户';
                        } else {
                            this.role = '部门管理员';
                        }

                        if(this.account_group == null)
                        {
                            this.group_name = '未分配';
                        }
                    },
                    'attrs': ['account_name','group_name','role']
                })
            },

            'events' : [
                ['group-manage',{
                    'remove': function () {
                        this.reload = true;

                        $rs.setProp(this.modals,'_add_',{
                            'reload' : true
                        });

                    },
                    'rename': function () {
                        this.reload = true;

                        $rs.setProp(this.modals,'_add_',{
                            'reload' : true
                        });
                    },
                    'change-admin': function () {
                        this.reload = true;
                    },
                    'add': function () {
                        this.reload = true;

                        $rs.setProp(this.modals,'_add_',{
                            'reload' : true
                        });
                    }
                }]
            ],

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

                            $rs.ajax('account/delete', {
                                'accountId': accountId
                            }).done(function () {

                                accountManage.trigger('remove', accountId);

                                accountManage.watcher().sub('accounts');
                                $active.remove();
                                $rs.alert().success('删除成功', 400);
                            }).fail(function (response) {
                                $rs.alert().error('删除失败 <br/>' + response.describe);
                            });
                        }    
                    };

                    this._delete_ = new $rs.modal('#account-delete-modal', init, extend);
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
                            
                            $rs.validate($form);

                            $form.submit(function (event) {
                                event.preventDefault();
                                $(this).valid() && self.post($(this));
                            });
                        },
                        'show' : function()
                        {
                            if(this.reload)
                            {
                                var
                                    self = this;

                                $rs.ajax('group/get-all', {
                                    'includeAdmin': 0
                                }).done(function (response) {
                                    self.renderGroup(response.content);
                                }).fail(function (response) {
                                    $rs.alert().error('数据获取失败 <br/>' + response.describe);
                                });

                                this.reload = false;
                            }
                        },
                        'close': function ()
                        {
                            this.$body.find('select').val(0);
                            this.$body.find('form')[0].reset();
                        }    
                    };

                    extend = {
                        'reload' : true,
                        'post': function ($form)
                        {
                            var
                                accountName = $form.find('[type=text]').val(),
                                $option = $form.find('option:selected'),
                                groupId = $option.data('gid') || undefined;

                            this.close();

                            $rs.ajax('account/add', {
                                'accountName': accountName,
                                'groupId': groupId
                            }).done(function (response) {
                                $rs.render({
                                    '$temp': $('.t-content', accountManage.$panel),
                                    'data': {
                                        'account_name': accountName,
                                        'group_name': groupId === undefined ? '未分配' : $option.text(),
                                        'role': '普通账户'
                                    },
                                    'before': function () {
                                        accountManage.watcher().plus('accounts', this.$mount);
                                    },
                                    'after': function (el) {
                                        $.data(el[1], 'aid', response.content[0]);
                                        return el;
                                    }
                                });

                                accountManage.trigger('add',accountName,response.content[0]);

                                $rs.alert().success('添加成功', 400);
                            }).fail(function (response) {
                                $rs.alert().error('添加失败 <br/>' + response.describe);
                            });
                        },
                        'renderGroup': function (data)
                        {
                            var
                                $body = this.$body;    

                            $rs.render({
                                'temp': '<option>{group_name}</option>',
                                '$mount' : $body.find('select'),
                                'data': data,
                                'after': function (el) {
                                    $.data(el[0], 'gid', this.group_id);
                                    return el;
                                },
                                'before' : function()
                                {
                                    this.$mount.html('<option>不分配</option>');
                                }
                            });
                        }
                    };

                    this._add_ = new $rs.modal('#account-add-modal', init, extend);
                    this._add_.show();
                }
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
                });

                this.$panel.find('button.add').click(function(){
                    accountManage.modals.add();
                });
            }
        };
    
    $rs.addModule('account-manage', accountManage);
})($rs);