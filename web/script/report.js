(function () {
    var report = {

        'init': function () {
            var
                self = this, $panel;

            $panel = this['$panel'] = $('#report-contain');

            $rs.ajax('zone/get-parent').done(function (response) {
                report.renderZone(response.content, 'parent-zone');
                report.watch();
            }).fail(function (response) {
                $rs.alert().error('数据获取失败 <br/>' + response.describe);
            });

            report.validateForm();
        },

        'watch': function ()
        {
            this.$panel.find('#parent-zone').change(function () {
                var
                    $option = $(this).find('option:selected');
                
                if ($option.val() == '')
                {
                    var
                        $children = $('#children-zone'),
                        $event = $('#event');
                    
                    $children.val('');
                    $children.find('option:gt(0)').remove();

                    $event.val('');
                    $event.find('option:gt(0)').remove();

                    report.renderCustom({});

                    return;
                }    

                $rs.ajax('report/get-info', {
                    'zoneId': $option.data('zid')
                }).done(function (response) {
                    report.renderZone(response.content.childZone,'children-zone');
                    report.renderEvent(response.content.events);
                    report.renderCustom(response.content.custom || {});
                });
            });

            this.$panel.find('form').submit(function (event) {
                event.preventDefault();
                $(this).valid() && report.post($(this));
            });

            this.$panel.find('#my-report form').submit(function (event) {
                event.preventDefault();
                if ($(this).valid())
                {
                    report.renderRow($(this).find('[type=text]').val());
                }    
            })
        }   ,

        'post': function ($form)
        {
            var
                data = {
                    reporter_id: $form.find('#reporter-id').val(),
                    reporter_name: $form.find('#reporter-name').val(),
                    reporter_tel: $form.find('#tel').val(),
                    zone_id: $form.find('#children-zone option:selected').data('zid'),
                    event_id: $form.find('#event option:selected').data('eid'),
                    custom: $form.find('#custom-input').val(),
                    describe: $form.find('#other-describe').val(),
                    _csrf : $rs.getCsrf()
                };
            
            $rs.ajax('report/post', 'POST', data).done(function (response) {
                $rs.alert().success('报修成功,你可以在 `报障记录` 页面追踪该任务', function () {
                    $('[href="#my-report"]').tab('show');
                    report.$panel.find('form')[0].reset();
                    report.renderRow(data['reporter_id']);
                });
            });
        },

        'customValidateTest': null,

        'validateForm': function () {
            $rs.loader('validate', function () {
                report.$panel.find('#report-form').validate({
                    'rules': {
                        'reporter-id': {
                            'required': true,
                            'stuNumber': true
                        },
                        'reporter-name': {
                            'required': true,
                            'minlength': 2
                        },
                        'tel': {
                            'required': true,
                            'phone': true
                        },
                        'parent-zone': {
                            'required': true
                        },
                        'sub-zone': {
                            'required': true
                        },
                        'event': {
                            'required': true
                        },
                        'custom-input': {
                            'custom': true,
                        }
                    },
                    'messages': {
                        'reporter-id': {
                            'required': '学号不能为空',
                        },
                        'tel': {
                            'required': '电话号码不能为空'
                        },
                        'parent-zone': {
                            'required': '请选择区域'
                        },
                        'sub-zone': {
                            'required': '请选择区域'
                        },
                        'event': {
                            'required': '请选择事件'
                        },
                        'reporter-name': {
                            'required': '请输入姓名',
                            'minlength': '请输入姓名'
                        }
                    },
                    debug: true
                });

                report.$panel.find('#login-form').validate({
                    'rules': {
                        'login-stu-id': {
                            'required': true,
                            'stuNumber': true
                        }
                    }
                });

                $.validator.addMethod('stuNumber', function (value) {
                    var
                        year = (new Date).getFullYear();
        
                    if (
                        !isNaN(value) &&
                        value.length == 8 &&
                        value.slice(0, 4) <= year &&
                        value.slice(0, 4) >= year - 4
                    ) {
                        return true;
                    }

                    return false;
                }, $.validator.format('学号格式错误'));

                $.validator.addMethod('phone', function (value) {
                    return (/^1(3|4|5|7|8)\d{9}$/).test(value);
                }, $.validator.format('电话号码格式错误'));

                $.validator.addMethod('custom', function (value) {
                    if (report.customValidateTest === null) {
                        return true;
                    } else {
                        return (new RegExp(report.customValidateTest)).test(value);
                    }
                }, $.validator.format('请输入正确的参数'));
            });
        },

        'renderRow': function (stuNumber)
        {
            $rs.ajax('report/get-row', {
                'stuNumber' : stuNumber
            }).done(function (response) {
                if (response.content.length < 1)
                {
                    return $rs.alert().error('暂无报修记录');
                }    

                var
                    status = {
                        '0': '已提交',
                        '1': '正在处理',
                        '2': '已完成'
                    },
                    template = $rs.template,
                    data = response.content,
                    $mount = report.$panel.find('#my-report'),
                    $ul = $mount.find('ul'),
                    li;
                    
                li = $ul.html();
                $ul.detach().html('');

                for (var i = 0, len = data.length; i < len; i++)
                {
                    var
                        $li = $(template(li, {
                            'time': data[i]['post_time'],
                            'zone': data[i]['zone'] + ' ' + data[i]['custom'],
                            'event': data[i]['event'],
                            'status': data[i]['status'] ? status[data[i]['status']] : '已提交',
                        }));
                     
                    $ul.append($li);
                }    

                $mount.find('.login').hide();
                $mount.append($ul);
                $mount.find('.report-row').show();
            })
        }   , 

        'renderZone': function (data,mount,clear)
        {
            var
                $mount = this.$panel.find('.' + mount + '-mount'),
                $select = $mount.find('select').detach(),
                template = $rs.template,
                option = '<option value="1">{text}</option>';
            
            $select.find('option:gt(0)').remove();

            for (var i = 0, len = data.length; i < len; i++)
            {
                var
                    $option = $(template(option, { 'text': data[i]['zone_name'] }));
                
                $option.data('zid', data[i]['zone_id']);
                $select.append($option);
            }    

            $mount.append($select);
        },

        'renderEvent': function (data)
        {
            var
                $mount = this.$panel.find('.event-mount'),
                $select = $mount.find('select').detach(),
                template = $rs.template,
                option = '<option value="1">{text}</option>';
            
            $select.find('option:gt(0)').remove();

            for (var i = 0, len = data.length; i < len; i++)
            {
                var
                    $option = $(template(option, { 'text': data[i]['event_name'] }));
                
                $option.data('eid', data[i]['event_id']);
                $select.append($option);
            }    

            $mount.append($select);
        },

        'renderCustom': function (data)
        {
            var
                $label = this.$panel.find('#custom-label');

            $label.find('input').val('');

            if ($.isEmptyObject(data))
            {
                report.customValidateTest = null;
                return $label.hide();
            }    
            
            $label.find('label').text(data.tips);

            if (data.test == '')
            {
                report.customValidateTest = null;
            } else {
                report.customValidateTest = data.test;
            }

            $label.show();
        }   , 
    }

    $rs.addModule('report', report);
})();