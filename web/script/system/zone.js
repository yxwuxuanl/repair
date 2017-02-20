$service.addModule('system-zone', {
    'modals': {},
    
    'renderParent': function (content) {
    
        var
            $contain = this.$panel.find('.grid'),
            tag = $service.tag,
            template = $service.template,
            lis = [],
            sub = tag('li', '.subs-zone', tag('ul', '.list-group')),
            li_template;
        
        li_template = tag('li', ['.list-group-item parent-zone', { 'data-zid': '{zid}' }], [
            tag('span', '.zone-name', '{zname}'),

            tag('span', '.action-icons', [
                tag('span', ['.glyphicon glyphicon-plus', { 'action': 'add' }]),
                tag('span', ['.glyphicon glyphicon-pencil', { 'action': 'rename' }]),
                tag('span', ['.glyphicon glyphicon-trash', { 'action': 'delete' }]),
                tag('span', ['.glyphicon glyphicon-list', { 'action': 'event' }])
            ])
        ]);
            
        for (var i = 0, len = content.length; i < len; i++) {

            lis.push(
                template(li_template, { 'zid': content[i]['zone_id'], 'zname': content[i]['zone_name'] })
            );

            lis.push(sub);
        }
        
        if (i > 1) {
            $contain = $contain.detach();
            $contain.append(lis.join(''));
            this.$panel.find('.content').append($contain);
        } else {
            $contain.append(lis.join(''));
        }

        lis = null;
    },

    'init': function () {
        var
            _this = this,
            helpers = this.$helpers;
        
        $service.ajax('zone/get-parent').done(function (response) {
            _this.renderParent(response.content);
            _this.watchGrid();
        }).fail(function () {
            $service.alert().error('数据获取失败,请刷新重试');
        })
    },

    'watchGrid': function () {
        var
            _this = this;

        this.$panel.find('.grid').click(function (event) {
            var
                $target = $(event.target),
                tagName = $target[0].tagName,
                $active;

            if (tagName == 'SPAN') {
                if ($target.hasClass('glyphicon')) {
                    
                    _this[$target.attr('action')].call(_this, $target.parent().parent());

                } else if ($target.hasClass('zone-name')) {

                    $target.parent().click();

                }

            } else if (tagName == 'LI') {
                
                if ($target.hasClass('parent-zone')) {
                    _this.showSubs($target);
                } else if ($target.hasClass('add-row')) {
                    _this.add.call(_this, null);
                }
            }

        })
    },

    'formHandlers': {
        'add': function ($form, modal) {
            if ($form.valid()) {
                var
                    $active = modal.data.$active,
                    instance = this,
                    zname = $form.find('[type="text"]').val(),
                    data = { 'name': zname };
                
                if ($active) {
                    data['parent'] = $active.attr('data-zid');
                }
                
                modal.close();

                $service.ajax('zone/add', data).done(function (response) {

                    $service.alert().success('添加成功', 400, function () {
                        
                        if ($active) {
                            instance.renderSubs([{ 'zone_id': response.content.id, 'zone_name': zname }], $active.next().find('ul'));
                        } else {
                            instance.renderParent([{ 'zone_id': response.content.id, 'zone_name': zname }]);
                        }

                    });

                }).fail(function (response) {
                    $service.alert().error('添加失败<br/>' + response.describe);
                });
            }
        },
        
        'rename': function ($form, modal) {
            if ($form.valid()) {

                var
                    $active = modal.data.$active,
                    instance = modal.data.instance,
                    zid = $active.attr('data-zid'),
                    zname = $form.find('[type="text"]').val();
                
                modal.close();

                $service.ajax('zone/rename', {
                    'zid': zid,
                    'zone_name': zname
                }).done(function () {
                    $service.alert().success('重命名成功', 400, function () {
                        $active.find('.zone-name').text(zname);
                    })
                }).fail(function (response) {
                    $service.alert().error('重命名失败<br/>' + response.describe);
                });
            }

        },
        'delete': function (modal) {
            var
                $active = modal.data['$active'],
                zid = $active.attr('data-zid');
            
            modal.close();
            
            $service.ajax('zone/delete', {
                'zid': zid
            }).done(function () {
                $service.alert().success('删除成功', 400, function () {
                    if ($active.hasClass('parent-zone')) {
                        $active.next().remove();
                    }
                    $active.remove();
                })
            }).fail(function (response) {
                $service.alert().error('删除失败<br/>' + response.describe);
            });
        }
    },

    'callModal': function ($active, action) {
        if (!('input' in this.modals)) {
            var
                modal = this.modals['input'] = new $service.modal(this.$panel.find('#zone-input-modal'), {
                    'close': function () {
                        this.data = null;
                        this.$form.validate().resetForm();
                        this.$form[0].reset();
                    },
                    'show': function () {
                        if (this.data.action == 'add') {
                            if (this.data.$active) {
                                this.setTitle('添加一个新区域至 [' + this.data.$active.find('.zone-name').text() + ']');
                            } else {
                                this.setTitle('添加一个主要区域');
                            }

                            this.$button.text('添加');
                        } else if (this.data.action == 'rename') {
                            this.setTitle('重命名 [' + this.data.$active.find('.zone-name').text() + ']');
                            this.$button.text('重命名');
                        }
                    },
                    'init': function () {
                        var
                            $form = this.$body.find('form'),
                            modal = this;

                        $form.submit(function (event) {
                            event.preventDefault();
                            modal.data.handler.call(modal.data.instance, $(this), modal);
                        })

                        $service.loader('validate', function () {
                            $form.validate();
                        })

                        this['$form'] = $form;
                        this['$button'] = this.$body.find('button');
                    }
                });
        }

        (modal || this.modals['input']).extend('data', {
            '$active': $active,
            'action': action,
            'handler': this.formHandlers[action],
            'instance': this
        }).show();
    },

    'add': function ($active) {
        this.callModal($active, 'add');
    },

    'rename': function ($active) {
        this.callModal($active, 'rename');
    },

    'event': function ($active) {
        var
            zid = $active.attr('data-zid'),
            _this = this;
        
        $service.ajax('zone/get-events', {
            'zid': zid
        }).done(function (response) {
            _this.callEventModal(response.content, $active);
        }).fail(function (response) {
            $service.alert().error('数据获取失败<br/>' + response.describe);
        });
    },

    'callEventModal': function (data, $active) {
        if (!('event' in this.modals)) {
            var
                _this = this,
                modal;
            
            modal = this.modals['event'] = new $service.modal(this.$panel.find('#zone-event-modal'), {
                'init': function () {

                    var
                        modal = this;

                    this.$body.find('.event').click(function (event) {
                        var
                            $target = event.target;
                        
                        if ($target.tagName == 'SPAN') {
                            $target = $($target);
                            _this[$target.attr('action')](modal, $target.parent().parent());
                        }
                    })
                },
                'show': function () {
                    
                    this.render(this.data.content.in, 'in', true);
                    this.render(this.data.content.notIn, 'not-in', true);
                    this.data.content = null;

                    this.setTitle('区域 [' + this.data.$active.find('.zone-name').text() + ']');
                },
                'close': function () {
                    this.data = null;
                }
            })

            modal.extend('render', function (content, mount, init) {
                var
                    lis = [],
                    $mount = modal.$body.find('.' + mount + ' ul'),
                    tag = $service.tag,
                    template = $service.template,
                    li_template;

                if (init) {
                    $mount.html('');
                }
                    
                if (content.length == 0) {
                    return;
                }
                
                li_template = tag('li', ['.list-group-item', { 'data-eid': '{eid}' }], [
                    tag('span', '.event-name', '{ename}'),

                    tag('span', '.action-icons', [
                        tag('span', ['.glyphicon glyphicon-' + (mount == 'in' ? 'trash' : 'plus'), { 'action': mount == 'in' ? 'removeEvent' : 'addEvent' }])
                    ])
                ]);

                for (var i = 0, len = content.length; i < len; i++) {
                    lis.push(template(li_template, {
                        'eid': content[i]['event_id'],
                        'ename': content[i]['event_name']
                    }))
                }

                $mount.append(lis.join(''));
            })
        }
        (modal || this.modals['event']).extend('data', {
            '$active': $active,
            'content': data
        }).show();
    },

    'removeEvent': function (modal, $target) {
        $service.ajax('zone/remove-event', {
            'eid': $target.attr('data-eid'),
            'zid': modal.data.$active.attr('data-zid')
        }).done(function () {
            $service.alert().success('删除事件成功', 400, function () {
                modal.render([{ 'event_id': $target.attr('data-eid'), 'event_name': $target.find('.event-name').text() }], 'not-in');
                $target.remove();
            })
        }).fail(function (response) {
            $service.alert().error('删除失败<br/>' + response.describe);
        });
    },

    'addEvent': function (modal, $target) {
        $service.ajax('zone/add-event', {
            'eid': $target.attr('data-eid'),
            'zid': modal.data.$active.attr('data-zid')
        }).done(function () {
            $service.alert().success('添加事件成功', 400, function () {
                modal.render([{ 'event_id': $target.attr('data-eid'), 'event_name': $target.find('.event-name').text() }], 'in');
                $target.remove();
            })
        }).fail(function (response) {
            $service.alert().error('添加失败<br/>' + response.describe);
        });
    },

    'delete': function ($active) {
        if (!('delete' in this.modals)) {
            var
                modal;
            
            modal = this.modals['delete'] = new $service.modal(this.$panel.find('#zone-delete-modal'), {
                'close': function () {
                    this.data = null;
                },
                'init': function () {
                    
                    var
                        modal = this;

                    this.$body.find('button').click(function () {
                        modal.data.handler(modal);
                    })
                },
                'show': function () {
                    this.setTitle('删除 [' + this.data.$active.find('.zone-name').text() + ']');
                }
            });
        }

        (modal || this.modals.delete).extend('data', {
            'handler': this.formHandlers.delete,
            '$active': $active
        }).show();
    },
    
    'showSubs': function ($target) {
        var
            $mount = $target.next(),
            $contain = $mount.find('ul'),
            len;
        
        if (!$mount.data('IS_LOAD')) {
            this.renderSubs($target.attr('data-zid'), $contain, $mount, $target);
        } else {
            len = $contain.children().length;

            if (len > 0) {
                $mount.siblings('.subs-active').removeClass('subs-active');
                $mount.toggleClass('subs-active');
            } else {
                $service.alert().error('该区域无子区域');
            }
        }
    },

    'renderSubs': function (id, $contain, $mount, $target) {

        if (typeof id != 'object') {
            var
                _this = this;

            $service.ajax('zone/get-subs', {
                'zid': id
            }).done(function (response) {

                _this.renderSubs(response.content, $contain, $mount);
                _this.showSubs($target);

            }).fail(function (response) {
                $service.alert().error('数据获取失败<br/>' + response.describe);
            });
        } else {
            var
                data = id,
                lis = [],
                tag = $service.tag,
                template = $service.template,
                li_template, li;
            
            li_template = tag('li', ['.list-group-item', { 'data-zid': '{zid}' }], [
                tag('span', '.zone-name', '{zname}'),

                tag('span', '.action-icons', [
                    tag('span', ['.glyphicon glyphicon-pencil', { 'action': 'rename' }]),
                    tag('span', ['.glyphicon glyphicon-trash', { 'action': 'delete' }])
                ])
            ]);

            for (var i = 0, len = data.length; i < len; i++) {
                li = template(li_template, { 'zid': data[i]['zone_id'], 'zname': data[i]['zone_name'] });
                lis.push(li);
            }

            if (i) {
                $contain.append($(lis.join('')));
            }
                    
            if ($mount) {
                $mount.data('IS_LOAD', true);
            }
        }
    }
});