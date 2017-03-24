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

                $rs.ajax('account/get-all').done(function (response) {
                    accountManage.render(response.content);
                }).fail(function (response) {
                    $rs.alert().error('数据获取失败');
                });
                
                this.watch();
                this.bind(this.events);
            },

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
                    'remove' : [
                        function(groupId){
                            this.$panel.find('tr').each(function(){
                                if($.data(this,'gid') == groupId)
                                {
                                    $(this).find('.group-name').text('未分配');

                                    if ($.data(this, 'role') != 'normal') {
                                        $(this).find('.role').text('普通账户');
                                    }
                                }
                            });
                        },
                        function(groupId)
                        {
                            if('_add_' in this.modals)
                            {
                                var
                                    $select = this.modals._add_.$body.find('select');

                                $select.find('option').each(function(){
                                    if($.data(this,'gid') == groupId)
                                    {
                                        $(this).remove();
                                        return false;
                                    }
                                })
                            }
                        }
                    ],
                    'rename' : [
                        function(groupId,groupName)
                        {
                            this.$panel.find('tr').each(function(){
                                if($.data(this,'gid') == groupId)
                                {
                                    $(this).find('.group-name').text(groupName);
                                }
                            });

                            if('_add_' in this.modals)
                            {
                                var
                                    $select = this.modals._add_.$body.find('select');

                                $select.find('option').each(function(){
                                    if ($.data(this, 'gid') == groupId) {
                                        $(this).text(groupName);
                                        return false;
                                    }
                                });
                            }
                        }
                    ],
                    'change-admin' : [
                        function($new,old,groupName)
                        {
                            if(old)
                            {
                                accountManage.$panel.find('tr').each(function(){
                                    if($.data(this,'aid') == old)
                                    {
                                        $(this).find('.role').text('普通账户');
                                        return false;
                                    }
                                });
                            }
                        },
                        function($new,old,groupName)
                        {
                            accountManage.$panel.find('tr').each(function () {
                                if($.data(this,'aid') == $new)
                                {  
                                    $(this).find('.role').text('部门管理员').end().find('.group-name').text(groupName);
                                    return false;
                                }
                            })
                        }
                    ],
                    'add' : [
                        function(groupName,groupId,accountId)
                        {
                            if('_add_' in this.modals)
                            {
                                this.modals._add_.renderGroup({
                                    'group_id' : groupId,
                                    'group_name' : groupName
                                });
                            }
                        },

                        function(groupName,groupId,accountId)
                        {
                            if(accountId)
                            {
                                accountManage.$panel.find('tr').each(function(){
                                    if($.data(this,'aid') == accountId)
                                    {
                                        $(this)
                                            .find('.group-name').text(groupName).end()
                                            .find('.role').text('部门管理员').end()
                                            .data('gid',groupId).end()
                                            .data('role','group_admin');

                                        return false;
                                    }
                                })
                            }
                        }
                    ]
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

                            $rs.ajax('group/get-all', {
                                'includeAdmin': 0
                            }).done(function (response) {
                                self.renderGroup(response.content);
                            }).fail(function (response) {
                                $rs.alert().error('数据获取失败 <br/>' + response.describe);
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
                                '$temp': $('.option', $body),
                                'data': data,
                                'after': function (el) {
                                    $.data(el[1], 'gid', this.group_id);
                                    return el;
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