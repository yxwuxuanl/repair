(function ($rs) {
    var
        zone = {
            'init': function ()
            {
                this.watcher().define('parent', 0,
                    function (old, value, $mount) {
                        if (value) {
                            if (!old) {
                                $mount.find('.empty').remove();
                            }
                        } else {
                            $rs.render({
                                '$temp': $('.t-parent-empty', $mount),
                                '$mount' : $mount
                            });
                        }
                    }
                );

                this.watcher().define('subszone', {}, function (old, _new_, $mount) { 
                    if (_new_)
                    {
                        if (!old)
                        {
                            $mount.find('.empty').remove();
                        }    
                    } else {
                        $rs.render({
                            '$temp': $('.t-children-empty', zone.$panel),
                            '$mount': $mount
                        });
                    }
                });

                $rs.ajax('zone/get-parent').done(function (response) {                    
                    zone.render(response.content);
                    zone.watch();
                    zone.bind(zone.events);
                });
                
            },

            'render' : function(data)
            {
                $rs.render({
                    '$temp': $('.t-parent-content',zone.$panel),
                    'data' : data,
                    'before' : function()
                    {
                        if($.isArray(this.data))
                        {
                            if(this.data.length)
                            {
                                zone.watcher().change('parent',this.data.length,this.$mount);
                            }else{
                                zone.watcher().change('parent',0,this.$mount);
                                return false;
                            }
                        }else{
                            zone.watcher().plus('parent',this.$mount);
                        }
                    },
                    'after' : function(el)
                    {
                        $.data(el[1],'zid',this.zone_id);
                        return el;
                    }
                })
            },

            events : [
                ['system-event',{
                    'add' : function()
                    {
                        $rs.setProp(this.modals,'_event_',{
                            'last' : null
                        });
                    },
                    'remove' : function()
                    {
                        $rs.setProp(this.modals,'_event_',{
                            'last' : null
                        });
                    }
                }]
            ],

            'watch': function ()
            {
                $('.mount', this.$panel).click(function (event) {
                    var
                        $target = $(event.target);
                    
                    if ($target[0].tagName == 'SPAN' && $target.hasClass('glyphicon')) {
                        zone.modals[$target.attr('action')]($target.parent().parent());
                    } else if ($target[0].tagName == 'LI') {
                        if ($target.hasClass('parent')) {
                            zone.showChildren($target);
                        }
                    }
                });

                $('.add-row', this.$panel).click(function () {
                    zone.modals.add(null);
                });
            },
            'showChildren': function ($target)
            {
                var
                    $mount = $target.next();

                if ($mount.hasClass('expand'))
                {
                    return $mount.removeClass('expand').css({ 'display': 'none' });
                }

                if (!$mount.data('IS_LOAD')) {
                    var
                        zoneId = $target.data('zid');

                    $rs.ajax('zone/get-children', {
                        'parent': zoneId
                    }).done(function (response) {
                        var
                            data = response.content;

                        $mount.data('IS_LOAD', true);
                        
                        zone.renderChild(data,$mount,zoneId);

                        zone.showChildren($target);
                    });
                } else { 
                    $mount.addClass('expand').css({ 'display': 'block' });
                }
            }, 

            'renderChild':function(data,$mount,zid)
            {
                var
                    watcherKey = 'subszone.' + String(zid).slice(0,2),
                    $ul = $mount.find('ul');

                $rs.render({
                    '$temp': $('.t-children-content',zone.$panel),
                    '$mount': $ul,
                    'data' : data,
                    'attrs' : ['zone_name'],
                    'before' : function()
                    {
                        if($.isArray(this.data))
                        {
                            if(this.data.length)
                            {
                                zone.watcher().change(watcherKey,this.data.length,this.$mount);
                            }else{
                                zone.watcher().change(watcherKey,0,this.$mount);
                                return false;
                            }
                        }else{
                            zone.watcher().plus(watcherKey,this.$mount);
                        }
                    },
                    'after' : function(el)
                    {
                        $.data(el[1],'zid',this.zone_id);
                        return el;
                    }
                })
            },

            'modals':
            {
                'input': function (extend)
                {

                    if ('_input_' in this)
                    {
                        return this._input_.extend(extend).show();
                    }    

                    var
                        init;
                    
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
                        'show': function ()
                        {
                            this.setTitle(this.title());
                        },
                        'close': function ()
                        {
                            this.$body.find('form')[0].reset();
                            this.$active = null;
                        }    
                    };
                    
                    this._input_ = new $rs.modal('#zone-input-modal', init);
                    this._input_.extend(extend).show();
                }   , 
                'add': function ($active)
                {
                    var
                        extend = {
                            'title': function ()
                            {
                                if (this.$active)
                                {
                                    return '添加子区域到 [' + this.$active.text() + ']';
                                } else {
                                    return '创建主要区域';
                                }
                            },
                            'post': function ($form)
                            {
                                var
                                    $active = this.$active,
                                    parent = $active ? $active.data('zid') : undefined,
                                    zoneName = $form.find('[type=text]').val();

                                this.close();

                                $rs.ajax('zone/add', {
                                    'parent': parent,
                                    'name': zoneName
                                }).done(function (response) {
                                    var
                                        zoneId = response.content[0];
                                    
                                    if ($active)
                                    {
                                        var
                                            $mount = $active.next();    
                                        
                                        if ($mount.data('IS_LOAD'))
                                        {
                                            zone.renderChild({ 'zone_id': zoneId, 'zone_name': zoneName },$mount,parent);
                                        }    

                                    } else {
                                        zone.render({ 'zone_id': zoneId, 'zone_name': zoneName });
                                    }
                                        
                                    $rs.alert().success('添加成功', 400);
                                }).fail(function (response) {
                                    $rs.alert().error('添加失败<br/>' + response.describe);
                                });
                            }    
                        };
                    this.input($.extend({ '$active': $active }, extend));
                },
                'rename': function ($active)
                {
                    var
                        extend;
                    
                    extend = {
                        '$active' : $active,
                        'title': function ()
                        {
                            return '重命名 [' + this.$active.text() + ']';
                        },
                        'post': function ($form)
                        {
                            var
                                zoneId = this.$active.data('zid'),
                                name = $form.find('[type=text]').val(),
                                $active = this.$active;

                            this.close();

                            $rs.ajax('zone/rename', {
                                'zoneId': zoneId,
                                'zoneName': name
                            }).done(function () {
                                $active.find('.zone-name').text(name);
                                $rs.alert().success('重命名成功', 400);
                            }).fail(function (response) {
                                $rs.alert().error('重命名失败 <br/>' + response.describe);
                            });
                        }    
                    };

                    this.input(extend);
                },
                'delete': function ($active)
                {
                    if ('_delete_' in this)
                    {
                        return this._delete_.extend({'$active' : $active}).show();
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
                            this.setTitle('删除 [' + this.$active.find('.zone-name').text() + ']');
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
                                zoneId = $active.data('zid');
                            
                            this.close();

                            $rs.ajax('zone/delete', {
                                'zoneId': zoneId,
                            }).done(function () {
                                if ($active.hasClass('parent'))
                                {
                                    zone.watcher().sub('parent');
                                    $active.next().remove();
                                } else {
                                    zone.watcher().sub('subszone.' + (zoneId + '').slice(0, 2), $active.parent());
                                }

                                $active.remove();
                                $rs.alert().success('删除成功', 400);
                            }).fail(function (response) {
                                $rs.alert().error('删除失败 <br/>' + response.describe);
                            });
                        }    
                    };

                    this._delete_ = new $rs.modal('#zone-delete-modal', init, extend);
                    this._delete_.extend({ '$active': $active }).show();
                },
                'event': function ($active)
                {
                    if ('_event_' in this)
                    {
                        return this._event_.extend({ '$active': $active }).show();
                    }    

                    var
                        init, extend;
                    
                    init = {
                        'init': function ()
                        {
                            zone.watcher().define('events',{},function(old,$new,$mount){
                                if($new > 0)
                                {
                                    if(old == 0)
                                    {
                                        $mount.find('.empty').remove();
                                    }
                                }else{
                                    $rs.render({
                                        '$temp' : $('.t-empty',$mount)
                                    });
                                }
                            });

                            this.watch();
                        },
                        'show': function ()
                        {
                            var
                                zoneId = this.$active.data('zid'),
                                self = this;
                            
                            this.setTitle('修改 [' + this.$active.find('.zone-name').text() + '] 事件');

                            if (this.last == zoneId)
                            {
                                return;
                            }

                            this.last = zoneId;

                            zone.watcher().set('events',{});

                            $rs.ajax('zone/get-events', {
                                'zoneId': zoneId
                            }).done(function (response) {
                                self.render(response.content.in, 'in');
                                self.render(response.content.notIn, 'not-in');
                            }).fail(function (response) {
                                $rs.alert().error('数据获取失败 <br/>' + response.describe);
                            });
                        }    
                    };

                    extend = {
                        'watch': function () {
                            var
                                self = this;

                            this.$body.find('.event').click(function (event) {
                                var
                                    $target = $(event.target);
                                
                                if ($target[0].tagName == 'SPAN') {
                                    self[$target.attr('action') + 'Event']($target.parent());
                                }
                            })
                        },
                        'render': function (data, type) {
                            var
                                $mount = $('.' + type,this.$body);

                            $rs.render({
                                '$temp' : $('.t-content',$mount),
                                'data' : data,
                                'after' : function(el)
                                {
                                    $.data(el[1],'eid',this.event_id);
                                    return el;
                                },
                                'before' : function()
                                {
                                    $.isArray(this.data) && this.$mount.find('li').remove();
                                }
                            });
                        },

                        'removeEvent': function ($target) {
                            var
                                eventId = $target.data('eid'),
                                zoneId = this.$active.data('zid'),
                                self = this;

                            $rs.ajax('zone/remove-event', {
                                'eventId': eventId,
                                'zoneId': zoneId
                            }).done(function () {
                                self.render({'event_id' : eventId,'event_name' : $target.text()},'not-in');
                                $target.remove();
                                $rs.alert().success('删除成功', 400);
                            }).fail(function (response) {
                                $rs.alert().error('删除失败 <br/>' + response.describe);
                            });
                        },
                        'addEvent': function ($target) {
                            var
                                eventId = $target.data('eid'),
                                zoneId = this.$active.data('zid'),
                                self = this;

                            $rs.ajax('zone/add-event', {
                                'eventId': eventId,
                                'zoneId': zoneId
                            }).done(function () {
                                self.render({ 'event_id': eventId, 'event_name': $target.text() },'in');
                                $target.remove();
                                $rs.alert().success('添加成功', 400);
                            }).fail(function (response) {
                                $rs.alert().error('添加失败 <br/>' + response.describe);
                            });
                        }
                    };

                    this._event_ = new $rs.modal('#zone-event-modal', init, extend);
                    this._event_.extend({ '$active': $active }).show();
                },
                'custom': function ($active)
                {
                    if ('_custom_' in this)
                    {
                        return this._custom_.extend({ '$active': $active }).show();
                    }    

                    var
                        init, extend;

                    init = {
                        'init': function ()
                        {

                            var
                                self = this;
                            
                            this.$body.find('form').submit(function (event) {
                                event.preventDefault();
                                self.post($(this));
                            });

                        }   , 
                        'show': function ()
                        {
                            if (this.last == this.$active.data('zid')) return;
                            var
                                $active = this.$active,
                                $body = this.$body,
                                self = this;
                            
                            this.last = $active.data('zid');

                            this.setTitle('设置 [' + $active.find('.zone-name').text() + '] 自定义区域');

                            $rs.ajax('zone/get-custom', {
                                'zoneId': $active.data('zid')
                            }).done(function (response) {
                                if (response.content !== null) {
                                    $body.find('.tips').val(response.content.tips);
                                    $body.find('.test').val(response.content.test);
                                    self.oldValue = { 'test': response.content.test, 'tips': response.content.test };
                                } else {
                                    $body.find('.tips').val('');
                                    $body.find('.test').val('');
                                    self.oldValue = { 'test': null, 'tips': null };
                                }
                            }).fail(function (response) {
                                $rs.alert().error('数据获取失败 <br/>' + response.describe);
                            });
                        }
                    };

                    extend = {
                        'post': function ($form)
                        {
                            var
                                tips = $form.find('.tips').val(),
                                test = $form.find('.test').val(),
                                zoneId = this.$active.data('zid');
                            
                            if (tips == this.oldValue.tips && test == this.oldValue.test)
                            {
                                return this.close();
                            }

                            if (tips == '' && test != '') 
                            {
                                return $rs.alert().error('请输入提示文字');
                            }    

                            this.close();
                            this.last = null;
                            
                            $rs.ajax('zone/change-custom', {
                                'tips': tips,
                                'test': test,
                                'zoneId': zoneId
                            }).done(function (response) {
                                $rs.alert().success(response.content[0], 400);
                            }).fail(function (response) {
                                $rs.alert().error(response.describe);
                            });

                        }    
                    };

                    this._custom_ = new $rs.modal('#zone-custom-modal', init, extend);
                    this._custom_.extend({ '$active': $active }).show();
                }    
            }
        };
    
    $rs.addModule('system-zone', zone);
})($rs);

