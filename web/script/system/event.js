$service.addModule('system-event', {

    'modals': {},

    'init': function () {
        
        var
            _this = this;

        $service.ajax('event/get-events').done(function (response) {
            _this.render(response.content);
            _this.watchActions();
        }).fail(function () {
            $service.alert().error('数据获取失败');
        });
    },

    'render': function (content) {
        var
            lis = [],
            template = $service.template,
            tag = $service.tag,
            li_template;
            
        li_template = tag('li', ['.list-group-item', { 'data-eid': '{eid}' }], [
            tag('span', '.event-name', '{ename}'),

            tag('span', '.action-icons', [
                tag('span', ['.glyphicon glyphicon-pencil', { 'action': 'rename' }]),
                tag('span', ['.glyphicon glyphicon-trash', { 'action': 'delete' }]),
            ])
        ]);

        for (var i = 0, len = content.length; i < len; i++) {
            lis.push(template(li_template, {
                'eid': content[i]['event_id'],
                'ename': content[i]['event_name']
            }));
        }

        this.$panel.find('.grid').append(lis.join(''));
    },

    'formActions': {
        'add': function ($form, modal) {
            if ($form.valid()) {
                var
                    ename = $form.find('[type="text"]').val(),
                    instance = modal.data.instance;

                modal.close();

                $service.ajax('event/add', {
                    'ename': ename
                }).done(function (response) {

                    $service.alert().success('添加成功', 400, function () {
                        instance.render([{ 'event_name': ename, 'event_id': response.content.id }]);
                   })

                }).fail(function (response) {
                    
                    $service.alert().error('添加失败<br/>' + response.describe);

                });
            }
        },
        'rename': function ($form, modal) {
            if ($form.valid()) {
                var
                    ename = $form.find('[type="text"]').val(),
                    instance = modal.data.instance,
                    $active = modal.data.$active,
                    eid = $active.attr('data-eid');
                
                modal.close();

                $service.ajax('event/rename', {
                    'ename': ename,
                    'eid': eid
                }).done(function (response) {
                    
                    $service.alert().success('重命名成功', 400, function () {
                        $active.text(ename);
                    })

                }).fail(function (response) {

                    $service.alert().error('重命名失败<br/>' + response.describe);

                });
            }
        },
        'delete': function (modal) {
            var
                eid = modal.data.$active.attr('data-eid'),
                $active = modal.data.$active;
            
            modal.close();

            $service.ajax('event/delete', {
                'eid': eid
            }).done(function () {
                $service.alert().success('删除成功', 400, function () {
                    $active.remove();
                })
            }).fail(function (response) {
                $service.alert().error('删除失败');
            });
        }
    },
    
    'callModal': function ($active, action) {
        if (!('input' in this.modals)) {
            var    
                modal = this.modals['input'] = new $service.modal(this.$panel.find('#event-input-modal'),{
                'init': function () {
                    var
                        $form = this.$body.find('form'),
                        modal = this;
                    

                    $service.loader('validate', function () {
                        $form.validate(); 
                    });
                    
                    this['$form'] = $form;
                    this['$button'] = this.$body.find('button');

                    $form.submit(function (event) {
                        event.preventDefault();
                        modal.data.handler.call(modal.data.instance, $(this), modal);
                    })
                },
                'close': function () { 
                    this.data = null;
                    this.$form.validate().resetForm();
                    this.$form[0].reset();
                },
                'show': function () {
                    if (this.data.action == 'add') {
                        this.setTitle('添加事件');
                        this.$button.text('添加');
                    } else {
                        this.setTitle('重命名 [' + this.data.$active.find('.event-name').text() + ']');
                        this.$button.text('重命名');
                    }
                }
            });
        }

        (modal || this.modals['input']).extend('data',{
            '$active': $active,
            'action': action,
            'handler': this.formActions[action],
            'instance' : this
        }).show();  
    },

    'rename': function ($active) {
        this.callModal($active, 'rename');
    },
    
    'add': function () {
        this.callModal(null, 'add');
    },

    'delete': function ($active) {
        if (!('delete' in this.modals)) {
            var
                modal;
            
            modal = this.modals['delete'] = new $service.modal(this.$panel.find('#event-delete-modal'), {
                'init': function () {

                    var
                        modal = this;

                    this.$body.find('button').click(function () {
                        modal.data.handler(modal);
                    }) 
                },
                'show': function () {
                    this.setTitle('删除 [' + this.data.$active.find('.event-name').text() + ']');
                },
                'close': function () {
                    this.data = null;
               } 
            });
        }

        (modal || this.modals.delete).extend('data', {
            'handler': this.formActions.delete,
            '$active': $active
        }).show();
    },

    'watchActions': function () {

        var
            _this = this;

        this.$panel.find('.grid').click(function (event) {

            var
                $target = $(event.target);
            
            if ($target.hasClass('glyphicon')) {

                _this[$target.attr('action')].call(_this, $target.parent().parent());

            } else if ($target.hasClass('add-row')) {
                
                _this.add.call(_this);

            }

        })
    },
})