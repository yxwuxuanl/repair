(function ($service) {
    var
        systemEvent = {
            'init': function () {
                var
                    $ul = this.$panel.find('.mount ul');
                
                this.els['content'] = $ul.find('.content').detach()[0].outerHTML;
                this.els['empty'] = $ul.find('.empty').detach()[0].outerHTML;

                $service.ajax('event/get-events').done(function (response) {
                    systemEvent.render(response.content);
                    systemEvent.watch();
                }).fail(function () {
                    $service.alert().error('数据获取失败');
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
            }   , 

            'render': function (data, insert) {
                var
                    $mount = this.$panel.find('.mount'),
                    $ul = $mount.find('ul'),
                    template = $service.template,
                    len = data.length,
                    li = this.els.content;

                if (!insert)
                {
                    if (len < 1)
                    {
                        $ul.data('children', 0);
                        return $ul.html(this.els.empty);
                    }    

                    $ul = $ul.detach();
                    $ul.data('children', len);
                }
                
                for (var i = 0; i < len; i++) {
                    var
                        $li = $(template(li, { 'eventName': data[i]['event_name'] }));
            
                    $li.data('eid', data[i]['event_id']);
                    $ul.append($li);
                }

                !insert && $mount.append($ul);
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
                                
                            $service.validate($form);

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
                    
                    this._input_ = new $service.modal('#event-input-modal', init);
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
                                $active = this.$active,
                                self = this;

                            $service.ajax('event/remove', { 'eventId': $active.data('eid') }).done(function () {

                                systemEvent.trigger('deleteEvent', $active.data('eid'));

                                $active.remove();
                                self.close();
                                $service.alert().success('删除成功', 400);
                            }).fail(function (response) {
                                $service.alert().error('删除失败<br/>' + response.describe);
                            });
                        }
                    };
                    
                    this._delete_ = new $service.modal('#event-delete-modal', init, extend);
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

                            $service.ajax('event/rename', {
                                'eventName': eventName,
                                'eventId': $active.data('eid')
                            }).done(function () {
                                $active.find('.event-name').text(eventName);
                                self.close();
                                $service.alert().success('重命名成功', 400);
                            }).fail(function (response) {
                                $service.alert().error('重命名失败 <br/>' + response.describe);
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
                                eventName = $form.find('[type=text]').val(),
                                self = this;

                            $service.ajax('event/add', { 'eventName': eventName }).done(function (response) {
                                self.close();
                                systemEvent.trigger('add');
                                systemEvent.render([{ 'event_name': eventName, 'event_id': response.content[0] }], true);
                                $service.alert().success('添加成功', 400);
                            }).fail(function (response) {
                                $service.alert().error('删除失败 <br/>' + response.describe);
                            });
                        },
                        'title': function () {
                            return '添加事件';
                        }
                    });
                }    
            },
            'watch': function () {
                this.$panel.find('.mount').click(function (event) {
                    if (event.target.tagName == 'SPAN')
                    {
                        var
                            $target = $(event.target);
                        
                        if ($target.hasClass('glyphicon'))
                        {
                            systemEvent.modals[$target.attr('action')]($target.parent().parent());
                        }    
                    }    
                });

                this.$panel.find('.add-row').click(function () {
                    systemEvent.modals.add();
                });
            },
        }
    
    $service.addModule('system-event', systemEvent);
})($service);