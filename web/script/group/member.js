/**
 * Created by 2m on 2017/3/29.
 */

(function($rs){
    var
        $module;

    $module = {
        'init' : function(){
            this.watcher().define('member',{},function(old,$new,$mount){

            });

            $rs.ajax('group/get-setting',{
                'member' : 1
            }).done(function(response){
               $module.render(response.content['in'],'in');
               $module.render(response.content['not-in'],'not-in');
               $module.watch();
            }).fail(function(){
                $rs.alert().error('数据获取失败');
            });

            this.bind(this.events);
        },
        'events' : [
            [{
                'changeMemberList' : function($mount)
                {
                    var
                        $empty = $mount.find('.empty'),
                        $sibling = $mount.parent().siblings('div').find('ul');

                    $empty.length && $empty.remove();

                    if(!$sibling.find('li').length)
                    {
                        $rs.render({
                            '$temp' : $('.t-empty',$sibling),
                            '$mount' : $sibling
                        });
                    }
                }
            }]
        ],
        'render' : function(data,mount)
        {
            var
                $mount = $('.' + mount + ' ul',this.$panel);

            $rs.render({
                '$temp' : $('.t-content',$mount),
                '$mount' : $mount,
                'data' : data,
                'before' : function()
                {
                    $module.trigger('changeMemberList',this.$mount);
                    $.isArray(data) && this.$mount.find('li').remove();
                },
                'after' : function(el)
                {
                    $.data(el[1],'aid',this.account_id);
                    return el;
                }
            });
        },
        'watch' : function()
        {
            $('.in',this.$panel).click(function(event){
               if(event.target.tagName === 'SPAN')
               {
                   $module.modals['remove']($(event.target).parent());
               }
            });

            $('.not-in',this.$panel).click(function(event){
                if(event.target.tagName === 'SPAN')
                {
                    $module.modals['add']($(event.target).parent());
                }
            });
        },
        'modals' : {
            'remove' : function($active)
            {
                var
                    extend = {
                        'title' : function()
                        {
                            return '确认移除组内成员'
                        },

                        'content' : function()
                        {
                            return '确认移除组内成员 [' + $active.text() + ']?';
                        },

                        'post' : function()
                        {
                            var
                                aid = $active.data('aid');

                            this.close();

                            $rs.ajax('group/delete-member',{
                                'accountId' : aid
                            }).done(function(){
                                $active.remove();
                                $module.render({'account_name' : $active.text(),'account_id' : aid},'not-in');
                                $rs.alert().success('已移除',400);
                            }).fail(function(response){
                                $rs.alert().error('移除失败 <br>' + response.describe);
                            });
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
                        this.$body.find('.tips').text(this.content());
                    }
                };

                this._confirm_ = new $rs.modal('#group-confirm-modal',init);
                return this._confirm_.extend(extend).show();
            },
            'add' : function($active)
            {
                var
                    aid = $active.data('aid'),
                    extend;

                extend = {
                    'title' : function()
                    {
                        return '添加组成员';
                    },
                    'content' : function()
                    {
                        return '确认要将 [' + $active.text() + '] 添加到组?'
                    },
                    'post' : function()
                    {
                        var
                            aid = $active.data('aid');

                        this.close();

                        $rs.ajax('group/add-member',{
                            'accountId' : aid
                        }).done(function(){
                            $active.remove();
                            $module.render({'account_name' : $active.text(),'account_id' : aid},'in');
                            $rs.alert().success('已添加',400);
                        }).fail(function(response){
                            $rs.alert().error('添加失败 <br>' +  response.describe);
                        });
                    }
                };

                this.confirm(extend);
            }
        }
    };

    $rs.addModule('group-member',$module);
})($rs);