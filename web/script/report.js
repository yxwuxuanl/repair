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

            this.validateForm();
        },

        'watch': function ()
        {
            this.$panel.find('#parent-zone').change(function () {
                var
                    zid = $(this).val();

                report.resetChildren();

                if(zid)
                {
                    $rs.ajax('report/get-info', {
                        'zoneId': zid
                    }).done(function (response) {
                        report.renderZone(response.content.childZone,'children-zone');
                        report.renderEvent(response.content.events);
                        response.content.custom && report.renderCustom(response.content.custom);
                    });
                }
            });

            this.$panel.find('#report-form').submit(function (event) {
                event.preventDefault();
                $(this).valid() && report.post($(this));
            });

            this.$panel.find('#my-report form').submit(function (event) {
                event.preventDefault();
                $(this).valid() && report.renderRow($(this).find('[type=text]').val());
            });
        },

        'resetChildren' : function()
        {
            $('#children-zone',report.$panel).html('<option value="">请选择区域</option>');
            report.resetEvent();
            report.resetCustom();
        },

        'resetEvent' : function()
        {
            $('#event', report.$panel).html('<option value="">请选择事件</option>');
        },

        'resetCustom' : function()
        {
            var
                $custom = $('#custom-label', report.$panel);

            report.customValidateTest = null;
            $custom.find('label').html('');
            $custom.hide();
        },

        'post': function ($form)
        {
            var
                stuNumber = $form.find('#reporter-id').val();

            $rs.ajax('report/post', $form.serialize()).done(function (response) {
                $rs.alert().success('报修成功,你可以在 `报障记录` 页面追踪该任务', function () {
                    $('[href="#my-report"]').tab('show');
                    report.$panel.find('form')[0].reset();
                    report.renderRow(stuNumber);
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
                    if(report.customValidateTest)
                    {
                        return (new RegExp(report.customValidateTest)).test(value);
                    }

                    return true;
                }, $.validator.format('请输入正确的参数'));
            });
        },

        'renderRow': function (info)
        {
            $rs.ajax('report/get-result',{
                'stuNumber' : info
            }).done(function (response) {
                if (!response.content.length)
                {
                    return $rs.alert().error('无报修记录');
                }    

                $rs.render({
                    '$temp': $('.t-content',report.$panel),
                    'data' : response.content,
                    'filter' : function()
                    {
                        if(this.status === null)
                        {
                            this.status = '已提交';
                        }else if(this.status == 1)
                        {
                            this.status = '正在处理';
                        }else{
                            this.status = '已完成';
                        }

                        if(this.custom === null)
                        {
                            this.custom = '';
                        }
                    }
                });

                $('#my-report',report.$panel).find('.login').hide().end().find('.report-row').show();
            })
        }   , 

        'renderZone': function (data,mount,clear)
        {
            $rs.render({
                'temp': '<option value="{zone_id}">{zone_name}</option>',
                '$mount' : $('#' + mount,report.$panel),
                'data' : data,
            });
        },

        'renderEvent': function (data)
        {
            $rs.render({
                'temp': '<option value="{event_id}">{event_name}</option>',
                '$mount': $('#event', report.$panel),
                'data': data
            })
        },

        'renderCustom': function (data)
        {
            var
                $label = this.$panel.find('#custom-label');

            $label.find('input').val('');
            
            $label.find('label').text(data.tips);

            if (!data.test)
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