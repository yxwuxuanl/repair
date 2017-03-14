(function ($rs) {
    var
        groupSetting = {
            'init': function ()
            {
                var
                    self = this;    
                
                $rs.ajax('group/get-setting').done(function (response) {
                    self.renderMember(response.content.member, 'in');
                    self.renderMember(response.content.noAssign, 'no-assign');
                    self.$panel.find('.mode select').val(response.content.mode).data('value', response.content.mode);

                    if ('rule' in response.content)
                    {
                        self.renderRule(response.content.rule,response.content.assignsMap,response.content.eventMap);
                        self.$panel.find('.rule').show();
                    }    

                    self.watch();
                });

                this.on(this._module_name_, 'changeMode', '_changeMode_');
                this.on(this._module_name_, 'removeRule', function () {
                    if ('_addRule_' in this.modals) 
                    {
                        this.modals._addRule_.reload = true; 
                    }
                });
            },

            '_changeMode_': function (mode)
            {
                if (mode == '1' || mode == '3')
                {
                    this.$panel.find('.rule').hide().find('tbody').html('');
                } else {
                    this.$panel.find('.rule').show();
                }
            }   , 
            'renderMember': function (data,mount,insert)
            {
                var
                    $mount = this.$panel.find('.' + mount),
                    $ul = $mount.find('ul'),
                    template = $rs.template,
                    li, icon;
                
                if (mount == 'in')
                {
                    icon = '<span class="glyphicon glyphicon-trash" action="removeMember"></span>';
                } else {
                    icon = '<span class="glyphicon glyphicon-plus" action="addMember"></span>';
                }

                li = '<li class="list-group-item">{text}' + icon + '</li>';
                
                if (!insert)
                {
                    $ul = $ul.detach();
                }    
                
                for (var i = 0, len = data.length; i < len; i++)
                {
                    var
                        $li = $(template(li, { 'text': data[i]['account_name'] }));
                    
                    $li.data('aid', data[i]['account_id']);
                    $ul.append($li);
                }    

                !insert && $mount.append($ul);

            },

            'modals': {
                'confirm': function ($active,extend)
                {
                    if ('_confirm_' in this)
                    {
                        return this._confirm_.extend($.extend(extend, {'$active' : $active})).show();
                    }    

                    var
                        init, extend;
                    
                    init = {
                        'show': function ()
                        {
                            this.setTitle(this.title());
                            this.$body.find('.tips').text(this.content());
                        },
                        'init': function ()
                        {
                            var
                                self = this;
                            
                            this.$body.find('button').click(function () {
                                self.post();   
                            });
                        },
                        'close': function ()
                        {
                            if (this.$active[0].tagName == 'SELECT')
                            {
                                this.$active.val(this.$active.data('value'));
                            }    

                            this.$active = null;
                        }    
                    };

                    this._confirm_ = new $rs.modal('#group-confirm-modal', init);
                    this._confirm_.extend($.extend(extend, {'$active' : $active})).show();
                }   , 
                'removeRule': function ($active)
                {
                    this.confirm($active, {
                        'title': function ()
                        {
                            return '移除组任务分配规则';
                        },
                        'content': function ()
                        {
                            return '确认要移除 [' + this.$active.find('.event-name').text() + '] 事件的任务分配规则吗?'
                        },
                        'post': function ()
                        {
                            var
                                $active = this.$active,
                                eventId = $active.data('eid');
                            
                            this.close();
                            
                            $rs.ajax('allocation/remove', {
                                'eventId': eventId
                            }).done(function () {
                                $active.remove();
                                $rs.alert().success('删除成功', 400);

                                groupSetting.trigger('removeRule');

                            }).fail(function (response) {
                                $rs.alert().error('删除失败 <br/>' + response.describe);
                            });
                        }    
                    });
                 }  ,  
                'addMember': function ($active)
                {
                    this.confirm($active, {
                        'title': function () {
                            return '添加组成员';
                        },
                        'content': function () {
                            return '确定将 [' + $active.text() + '] 添加到组?'
                        },
                        'post': function ()
                        {
                            var
                                $active = this.$active,
                                accountId = $active.data('aid');
                            
                            this.close();

                            $rs.ajax('account/change-group', {
                                'accountId': accountId
                            }).done(function () {
                                groupSetting.renderMember([{ 'account_id': accountId, 'account_name': $active.text() }], 'in', true);
                                $active.remove(); 
                                $rs.alert().success('添加成功', 400);
                            }).fail(function (response) {
                                $rs.alert().error('添加失败 <br/>' + response.describe);
                            });
                        }    
                    });
                },
                'removeMember': function ($active)
                {
                    this.confirm($active, {
                        'title': function () {
                            return '删除组成员';
                        },
                        'content': function () {
                            return '确定将 [' + $active.text() + '] 删除?'
                        },
                        'post': function ()
                        {
                            var
                                $active = this.$active,
                                accountId = $active.data('aid'),
                                self = this;

                            $rs.ajax('account/change-group', {
                                'accountId': accountId
                            }).done(function () {
                                groupSetting.renderMember([{ 'account_id': accountId, 'account_name': $active.text() }], 'no-assign', true);
                                $active.remove();
                                self.close();
                                $rs.alert().success('删除成功', 400);
                            }).fail(function (response) {
                                self.close();
                                $rs.alert().error('删除失败 <br/>' + response.describe);
                            });
                        }    
                    });
                },
                'changeMode': function ($select)
                {
                    this.confirm($select, {
                        'title': function () {
                            return '更改组任务分配模式';
                        },
                        'content': function () {
                            return '确认要将组的任务模式更改为 [' + this.$active.find('option:selected').text() + '] 模式?';
                        },
                        'post': function ()
                        {
                            var
                                $active = this.$active,
                                mode = $active.find('option:selected').val(),
                                self = this;

                            $rs.ajax('group/change-task-mode', {
                                'mode': mode
                            }).done(function () {

                                groupSetting.trigger('changeMode', mode);

                                $active.data('value', mode);
                                self.close();
                                $rs.alert().success('已更改', 400);

                            }).fail(function (response) {
                                self.close();
                                $rs.alert().error('更改失败 <br/>' + response.describe);
                            });
                        }    
                    });
                },
                'addRule': function ()
                {
                    if ('_addRule_' in this)
                    {
                        return this._addRule_.show();
                    }    

                    var
                        init, extend;
                    
                    init = {
                        'init': function () {
                            this.watch();
                        },
                        'close': function ()
                        {
                            this.$body.find('.select').removeClass('select');
                        },
                        'show': function ()
                        {
                            if (this.reload)
                            {
                                var
                                    self = this;    

                                $rs.ajax('group/get-create-rule-info').done(function (response) {
                                    self.renderEvent(response.content.events);
                                    self.renderMember(response.content.members);
                                });

                                this.reload = false;
                            }    
                        }    
                    };

                    extend = {
                        'reload' : true,
                        'renderEvent': function (data)
                        {
                            var
                                $mount = this.$body.find('.event-mount'),
                                $select = $mount.find('select').detach(),
                                template = $rs.template,
                                option = '<option value="">{text}</option>';
                            
                            $select.html('');
                            
                            for (var i = 0, len = data.length; i < len; i++)
                            {
                                var
                                    $option = $(template(option, { 'text': data[i]['event_name'] }));
                                
                                $option.data('eid', data[i]['event_id']);
                                $select.append($option);
                            }    

                            $mount.append($select);
                        },
                        'renderMember': function (data)
                        {
                            var
                                $mount = this.$body.find('.member-mount'),
                                $ul = $mount.find('ul').detach(),
                                template = $rs.template,
                                li = '<li class="list-group-item">{text} <span class="glyphicon glyphicon-ok"></span> </li>';
                            
                            $ul.html('');
                            
                            for (var i = 0, len = data.length; i < len; i++)
                            {
                                var
                                    $li = $(template(li, { 'text': data[i]['account_name'] }));
                                
                                $li.data('aid', data[i]['account_id']);
                                $ul.append($li);
                            }    

                            $mount.append($ul);
                        },
                        'watch': function ()
                        {
                            var
                                self = this;
                            
                            this.$body.find('button').click(function () {
                                self.post();
                            });

                            this.$body.find('.member-mount').click(function (event) {
                                if (event.target.tagName == 'LI') {
                                    $(event.target).toggleClass('select');
                                }
                            });

                        },
                        'post': function ()
                        {
                            var
                                $option = this.$body.find('.event').find('option:selected'),
                                $assign = this.$body.find('.select'),
                                level = this.$body.find('.level').val(),
                                assign = [], assign_ = [];
                            
                            $assign.each(function () {
                                assign.push($(this).data('aid'));
                                assign_.push($(this).text());
                            });

                            if (assign.length < 1)
                            {
                                return $rs.alert().error('至少选择一个成员');
                            }    

                            this.close();

                            $rs.ajax('allocation/add', {
                                'event': $option.data('eid'),
                                'assign': assign.join(','),
                                'level': level
                            }).done(function (response) {
                                groupSetting.renderRule([{
                                    'event': $option.text(),
                                    'assign': assign_.join('<br/>'),
                                    'level': level,
                                    'event_id' : $option.data('eid')
                                }]);

                                $option.remove();

                                if (level == 2) {
                                    $assign.remove();
                                }

                                $rs.alert().success('添加成功', 400);
                            }).fail(function (response) {
                                $rs.alert().error('添加失败 <br/>' + response.describe);
                            });
                        }    

                    };
                    
                    this._addRule_ = new $rs.modal('#group-add-rule-modal', init, extend);
                    this._addRule_.show();
                 }    
            },

            'watch': function ()
            {
                var
                    self = this;
                
                this.$panel.find('.member').click(function (event) {
                    if (event.target.tagName == 'SPAN')    
                    {
                        var
                            $target = $(event.target);
                        
                        self.modals[$target.attr('action')]($target.parent());
                    }    
                });

                this.$panel.find('.mode select').change(function () {
                    self.modals['changeMode']($(this));
                });

                this.$panel.find('.rule').click(function (event) {
                    if (event.target.tagName == 'SPAN') 
                    {
                        self.modals['removeRule']($(event.target).parent().parent());
                    } else if (event.target.tagName == 'H5')
                    {
                        self.modals['addRule']();
                   }     
                });
            },
            'renderRule': function (data,assignMap,eventMap)
            {
                var
                    $mount = this.$panel.find('.rule table'),
                    $tbody = $mount.find('tbody').detach(),
                    template = $rs.template,
                    tr, map = false;
                
                if (typeof assignMap == 'object')
                {
                    map = true;
                }    

                tr = '<tr>' +
                    '<td class="event-name">{event}</td>' +
                    '<td class="assign">{assign}</td>' +
                    '<td>{type}</td>' +
                    '<td class="remove"><span class="glyphicon glyphicon-trash"></span></td>' +
                    '</tr>';

                for (var i = 0, len = data.length; i < len; i++)
                {
                    var
                        $tr, assign = '', event, event_id;
                    
                    if (map)
                    {
                        for (var m = 0, mlen = data[i]['assign'].length; m < mlen; m++)
                        {
                            assign += assignMap[data[i]['assign'][m]] + '<br/>';
                        }    

                        event = eventMap[data[i]['event']];
                        event_id = data[i]['event'];
                    } else {
                        event = data[i].event;
                        assign = data[i].assign;
                        event_id = data[i]['event_id'];
                    }

                    $tr = $(template(tr, {
                        'event': event,
                        'assign': assign,
                        'type': data[i]['level'] == 1 ? '普通分配' : '固定分配'
                    }));

                    $tr.data('eid', event_id);
                    $tbody.append($tr);
                }    

                $mount.append($tbody); 
            }    
        };
    
    $rs.addModule('group-setting', groupSetting);
})($rs);