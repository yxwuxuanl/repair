(function ($rs) {
    var
        event = {
            'init': function () {
                this.watcher().define('events', function (old, _new_, $mount) {
                    if (_new_ > 0)
                    {
                        if (old == 0)
                        {
                            $mount.find('.empty').remove();
                        }    
                    } else {
                        $rs.render({
                            '$temp': $('#t-empty', event.$panel),
                            '$mount': $mount || false
                        });
                    }
                });

                $rs.ajax('event/get-events').done(function (response) {
                    var
                        data = response.content;
                    
                    if (data.length > 0) {
                        $rs.render({
                            '$temp': $('#t-content', event.$panel),
                            'data': data,
                            'before': function () {
                                event.watcher().change('events', this.data.length, this.$mount);
                            },
                            'after': function (el) {
                                $.data(el[1], 'eid', this.event_id);
                                return el;
                            }
                        })
                    } else {
                        event.watcher().change('events', 0);
                    }

                    event.watch();
                }).fail(function () {
                    $rs.alert().error('数据获取失败');
                });
                
                this.on(this._module_name_, 'deleteEvent', '_remove_');
                this.on(this._module_name_, 'add', '_insert_');
            },

            '_render_': function ($ul)
            {
                var
                    children = this.$panel.find('')
                
                if (children < 1)
                {
                    $ul.find('.empyt').remove();
                }    

                $ul.data('children', children + 1);
            },

            '_remove_': function ()
            {   
                var
                    children = $ul.data('children');
                
                if ( (children - 1) < 1)
                {
                    $ul.html(this.els.empty);
                }

                $ul.data('children', children - 1);
            }, 
            
            'modals': {
                'input': function ($active,extend)
                {
                    if ('_input_' in this)
                    {
                        return this._input_.extend($.extend({ '$active': $active }, extend)).show();
                    }    

                    var
                        init;
                    
                    init = {
                        'init': function ()
                        {
                            var
                                self = this,
                                $form = this.$body.find('form');
                                
                            $rs.validate($form);

                            $form.submit(function (event) {
                                event.preventDefault();
                                if ($(this).valid()) {
                                    self.post($(this));
                                }
                            });
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
                    
                    this._input_ = new $rs.modal('#event-input-modal', init);
                    this._input_.extend($.extend({ '$active': $active }, extend)).show();
                }   , 
                'delete': function ($active)
                {
                    if ('_delete_' in this)
                    {
                        return this._delete_.extend({ '$active': $active }).show();
                    }    

                    var
                        init;
                    
                    init = {
                        'init': function () {
                            var
                                self = this;
                            
                            this.$body.find('button').click(function () {
                                self.post();
                            });
                        },
                        'show': function () {
                            this.setTitle('删除 [' + this.$active.text() + ']');
                        },
                        'close': function () {
                            this.$active = null;
                        }
                    };
                    extend = {
                        'post': function () {
                            var
                                $active = this.$active;
                            
                            this.close();

                            $rs.ajax('event/remove', { 'eventId': $active.data('eid') }).done(function () {

                                // event.trigger('deleteEvent', $active.data('eid'));

                                event.watcher().sub('events');
                                $active.remove();
                                $rs.alert().success('删除成功', 400);
                            }).fail(function (response) {
                                $rs.alert().error('删除失败<br/>' + response.describe);
                            });
                        }
                    };
                    
                    this._delete_ = new $rs.modal('#event-delete-modal', init, extend);
                    this.delete($active);
                },
                'rename': function ($active)
                {
                    this.input($active, {
                        'post': function ($form) {
                            var
                                eventName = $form.find('[type=text]').val(),
                                $active = this.$active,
                                self = this;

                            $rs.ajax('event/rename', {
                                'eventName': eventName,
                                'eventId': $active.data('eid')
                            }).done(function () {
                                $active.find('.event-name').text(eventName);
                                self.close();
                                $rs.alert().success('重命名成功', 400);
                            }).fail(function (response) {
                                $rs.alert().error('重命名失败 <br/>' + response.describe);
                            });
                        },
                        'title': function () {
                            return '重命名 [' + this.$active.text() + ']';
                        }
                    });
                },
                'add': function ()
                {
                    this.input(null, {
                        'post': function ($form) {
                            var
                                eventName = $form.find('[type=text]').val();
                            
                            this.close();

                            $rs.ajax('event/add', { 'eventName': eventName }).done(function (response) {

                                $rs.render({
                                    '$temp': $('#t-content', event.$panel),
                                    'data': [{ 'event_name': eventName, 'event_id': response.content[0] }],
                                    'before': function () {
                                        event.watcher().plus('events', this.$mount);
                                    },
                                    'after': function (el) {
                                        $.data(el[1], 'eid', this.event_id);
                                        return el;
                                    }
                                });

                                $rs.alert().success('添加成功', 400);
                            }).fail(function (response) {
                                $rs.alert().error('删除失败 <br/>' + response.describe);
                            });
                        },
                        'title': function () {
                            return '添加事件';
                        }
                    });
                }    
            },
            'watch': function () {
                this.$panel.find('.mount').click(function ($event) {
                    if ($event.target.tagName == 'SPAN')
                    {
                        var
                            $target = $($event.target);
                        
                        if ($target.hasClass('glyphicon'))
                        {
                            event.modals[$target.attr('action')]($target.parent().parent());
                        }    
                    }    
                });

                this.$panel.find('.add-row').click(function () {
                    event.modals.add();
                });
            },
        }
    
    $rs.addModule('system-event', event);
})($rs);