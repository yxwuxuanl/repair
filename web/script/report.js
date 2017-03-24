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
                    $option = $(this).find('option:selected'),
                    zid = $option.data('zid');
                
                if(!zid)
                {
                    report.resetChildren();
                    return;
                }

                $rs.ajax('report/get-info', {
                    'zoneId': zid
                }).done(function (response) {
                    report.renderZone(response.content.childZone,'children-zone',true);
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
            $('#custom-label',report.$panel).hide();
        },

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
                'temp' : '<option value="1">{zone_name}</option>',
                '$mount' : $('#' + mount,report.$panel),
                'data' : data,
                'clear' : clear,
                'after' : function(el)
                {
                    $.data(el[0],'zid',this.zone_id);
                    return el;
                }
            })
        },

        'renderEvent': function (data)
        {
            $rs.render({
                'temp': '<option value="1">{event_name}</option>',
                '$mount': $('#event', report.$panel),
                'data': data,
                'clear' : true,
                'after': function (el) {
                    $.data(el[0], 'eid', this.event_id);
                    return el;
                }
            })
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