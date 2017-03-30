/**
 * Created by 2m on 2017/3/29.
 */
(function($rs){
    var
        $module;

    $module = {
        'init' : function(){
            $rs.ajax('group/get-setting',{
                'taskMode' : 1
            }).done(function(response){
                var
                    mode = response.content.mode;

                $('.task-mode',$module.$panel).val(mode).data('oldValue',mode);
                $module.trigger('changeMode',mode);

                if(mode == '2' || mode == '4')
                {
                    $module.loadRules();
                }

                $module.watch();
            });

            this.bind(this.events);
        },

        'loadRules' : function()
        {
            $rs.ajax('group/get-setting',{
                'rules' : 1
            }).done(function(response){
                var
                    $mount = $('.rules tbody',$module.$panel),
                    data = response.content,
                    renderName;

               $rs.render({
                    '$temp' : $('.t-group',$mount),
                   '$mount' : $mount,
                   'data' : data,
                   'filter' : function()
                   {
                       var
                           assign = this.assign;

                       this.row = assign.length;

                       this.account_name = assign.slice(0,1)[0]['account_name'];

                       if(this.level == '1')
                       {
                           this.level = '否';
                       }else{
                           this.level = '是';
                       }
                   },
                   'before' : function ()
                   {
                        this.$mount.find('tr').remove();
                   },
                   'after' : function(el)
                   {
                       var
                           current = this.assign.slice(1),
                            temp = $('.t-only-name',$mount)[0].innerHTML;

                        $.data(el[1],'alid',this.allocation_id);

                        for(var i in current)
                        {
                            el = el.concat($.parseHTML(temp.replace('{account_name}',current[i]['account_name'])));
                        }

                       return el;
                   }
               });
            });
        },

        'events' : [
            [{
                'changeMode' : function(mode)
                {
                    if(mode == '1' || mode == '3')
                    {
                        $('.rules',this.$panel).hide().find('tbody tr').remove();
                    }else{
                        $('.rules',this.$panel).show();
                    }
                },
                'removeMember' : function($e)
                {
                    if(!$e.find('li').length)
                    {
                        $rs.render({
                            '$temp' : $('.t-empty',$e),
                            '$mount' : $e
                        });
                    }

                    $rs.setProp(this.modals,'_create_',{
                        'reload' : true
                    });
                },
            }]
        ],

        'watch' : function()
        {
            $('.task-mode',this.$panel).change(function(){
                $module.modals.changeTaskMode($(this));
            });

            var
                $rules = $('.rules');

            $rules.find('.create-rule').click(function(){
                $module.modals.create();
            });

            $rules.find('table').click(function(event){
                if(event.target.tagName == 'SPAN')
                {
                    $module.modals.remove($(event.target).parent().parent());
                }
            });
        },
        'modals' : {
            'changeTaskMode' : function($select)
            {
                var
                    extend ;

                extend = {
                    '$active' : $select,

                    'title' : function()
                    {
                        return '更改组任务分配模式';
                    },
                    'content' : function()
                    {
                        var
                            str = [];

                        str.push('确认要将组任务分配模式更改为 [' + $(':selected',$select).text() + '] 模式?');

                        if($select.val() == '1' || $select.val() == '3')
                        {
                            str.push('更改为该模式后所有自定义规则将会被移除');
                        }

                        return str.join('<br>');
                    },
                    'post' : function()
                    {
                        var
                            mode = this.$active.val(),
                            self = this;

                        $rs.ajax('group/change-task-mode',{
                            'taskMode' : mode
                        }).done(function(){
                            self.$active.data('oldValue',mode);

                            $module.trigger('changeMode',mode);

                            self.close();
                            $rs.alert().success('已更改',400);
                        }).fail(function(response){
                            self.close();
                            $rs.alert().fail('更改失败 <br>' + response.describe);
                        })
                    },
                    '_close' : function()
                    {
                        this.$active.val(this.$active.data('oldValue'));
                    }
                };

                this.confirm(extend);
            },
            'confirm' : function(extend)
            {
                if('_confirm_' in this)
                {
                    return this._confirm_.extend(extend).show();
                }

                var
                    init;

                init = {
                    'init' : function()
                    {
                        var
                            self = this;

                        this.$body.find('button').click(function(){
                            self.post();
                        });
                    },
                    'show' : function()
                    {
                        this.setTitle(this.title());
                        this.$body.find('.tips').html(this.content());
                        if(this._show)
                        {
                            this._show();
                            this._show = null;
                        }
                    },
                    'close' : function()
                    {
                        if(this._close)
                        {
                            this._close();
                            this._close = null;
                        }
                        this.$active = null;
                    }
                };

                this._confirm_ = new $rs.modal($('.confirm-modal',$module.$panel),init);
                this._confirm_.extend(extend).show();
            },
            'create' : function()
            {
                if('_create_' in this)
                {
                    return this._create_.show();
                }

                var
                    init,extend;

                init = {
                    'init' : function()
                    {
                        this.$body.find('.member').click(function(event){
                            if(event.target.tagName == 'LI')
                            {
                                var
                                    $li = $(event.target);

                                !$li.hasClass('empty') && $li.toggleClass('select');
                            }else if(event.target.tagName == 'SPAN')
                            {
                                $(event.target).parent().click();
                            }
                        });

                        var
                            self = this;

                        this.$body.find('button').click(function(){
                            self.post();
                        });
                    },
                    'show' : function()
                    {
                        if(this.reload)
                        {
                            var
                                $body = this.$body;

                            $rs.ajax('group/get-create-rule-info').done(function(response){
                                $rs.render({
                                   '$temp' : $('.member .t-content',$body),
                                    'data' : response.content.members,
                                    'after' : function(el)
                                    {
                                        $.data(el[1],'aid',this.account_id);
                                        return el;
                                    },
                                    'before' : function()
                                    {
                                        this.$mount.find('li').remove();

                                        if(!this.data.length)
                                        {
                                            var
                                                $mount = this.$mount;

                                            $rs.render({
                                                '$temp' : $('.t-empty',$mount),
                                                '$mount' : $mount
                                            });

                                            return false;
                                        }
                                    }

                                });

                                $rs.render({
                                    'temp' : '<option>{event_name}</option>',
                                    'data' : response.content.events,
                                    '$mount' : $('.event',$body),
                                    'after' : function(el)
                                    {
                                        $.data(el[0],'eid',this.event_id);
                                        return el;
                                    },
                                    'before' : function()
                                    {
                                        this.$mount.find('option:gt(1)').remove();
                                    }
                                })
                            });
                            this.reload = false;
                        }
                    },
                    'close' : function()
                    {
                        this.$body.find('.member li').removeClass('select');
                        this.$body.find('.event').val('');
                    }
                };

                extend = {
                    'reload' : true,
                    'post' : function()
                    {
                        var
                            assigns = [],
                            $event = this.$body.find('.event :selected'),
                            event = $event.data('eid'),
                            level,$assigns;

                        if(!event)
                        {
                            return $rs.alert().error('请选择一个事件');
                        }

                        $assigns = this.$body.find('.member .select');

                        $assigns.each(function(){
                            assigns.push($.data(this,'aid'));
                        });

                        if(!assigns.length)
                        {
                            return $rs.alert().error('至少选择一个成员');
                        }

                        level = this.$body.find('.type').val();

                        this.close();

                        $rs.ajax('allocation/create',{
                            'event' : event,
                            'assign' : assigns.join(','),
                            'level' : level
                        }).done(function(){

                           if(level === '2')
                           {
                               $module.trigger('removeMember',$assigns.parent());
                                $assigns.remove();
                           }

                           $event.remove();
                           $module.loadRules();

                           $rs.alert().success('已创建规则',400);
                        }).fail(function(response){
                            $rs.alert().error('创建失败 <br>' + response.describe);
                        });
                    }
                };

                this._create_ = new $rs.modal($('.create-rule-modal',$module.$panel),init,extend);
                this._create_.show();
            },
            'remove' : function($active)
            {
                var
                    extend ;

                extend = {
                    '$active' : $active,
                    'title' : function()
                    {
                        return '删除分配规则';
                    },
                    'content' : function()
                    {
                        return '确认删除该自定义分配规则?';
                    },
                    'post' : function()
                    {
                        var
                            $active = this.$active;

                        this.close();

                        $rs.ajax('allocation/remove',{
                            'allocationId' : $active.data('alid')
                        }).done(function(){
                            var
                                index = $active.index(),
                                rowspan = Number($active.find('td').eq(0).attr('rowspan')),
                                $children = $active.parent().children(),
                                end = index + rowspan;

                            for(; index < end ; index++)
                            {
                                $children.eq(index).remove();
                            }

                            $rs.setProp($module.modals,'_create_',{
                                'reload' : true
                            });

                            $rs.alert().success('已移除',400);
                        });
                    },
                    '_close' : function()
                    {
                        this.$active = null;
                    }
                };

                this.confirm(extend);
            }
        }
    };

    $rs.addModule('group-taskmode',$module);
})($rs);