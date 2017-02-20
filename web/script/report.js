(function () {
    var report = {

        'init': function () {
            var
                $panel;

            $panel = this['$panel'] = $('#report-contain');

            $service.ajax('zone/get-parent').done(function (response) {
                report.renderOption(response.content, '请选择主要区域', { 'value': 'zone_id', 'text': 'zone_name' }, '#parent-zone');
                report.watchSelect();
            });

            report.validateForm();
            $panel.find('form').submit(function () {
                report.post($(this));
            });
        },

        'post': function ($form)
        {
            if ($form.valid())
            {
                var
                    data = {
                        '_csrf' : $service.getCsrf()
                    };    

                $form.find('[type="text"],select,textarea').each(function () {
                    data[this.id] = $(this).val();
                })

                $service.ajax('report/post', 'POST', data).done(function () {
                    $service.alert().success('报告成功');
                }).fail(function (response) {
                    $service.alert().error('报告失败<br>' + response.describe);
                });
            }    
        },

        'customValidateTest': null,

        'validateForm': function () {
            $service.loader('validate', function () {
                $('form').validate({
                    'rules': {
                        'stu-number': {
                            'required': true,
                            'stuNumber': true
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
                        'stu-number': {
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
                        }
                    },
                    debug: true
                })

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

        'renderOption': function (content, defaultOption, map, mount) {
            var
                $mount = this.$panel.find(mount),
                template = $service.template,
                options = [],
                option_template;
            
            option_template = $service.tag('option', { 'value': '{value}' }, '{text}');

            options.push(template(option_template, {
                'value': '',
                'text': defaultOption
            }));

            for (var i = 0, len = content.length; i < len; i++) {
                options.push(template(option_template, {
                    'value': content[i][map['value']],
                    'text': content[i][map['text']]
                }));
            }

            $mount.html(options.join(''));
        },

        'watchSelect': function () {
            var
                _this = this;

            this.$panel.find('#parent-zone').change(function () {
                var
                    zid = $(this).val();
                
                report.$panel.find('#custom-label').hide();

                if (zid == 0) {
                    report.customValidateTest = null;
                    report.renderOption([], '请选择主要区域', {}, '#sub-zone');
                    report.renderOption([], '请选择区域', {}, '#event');
                    return;
                }

                $service.ajax('zone/get-subs', {
                    'zid': zid
                }).done(function (response) {
                    report.renderOption(response.content, '请选择子区域', { 'value': 'zone_id', 'text': 'zone_name' }, '#sub-zone');
                    report.renderLabel(zid);
                }).fail(function (response) {
                    $service.alert().error('数据获取失败<br/>' + response.describe);
                });
            });

            this.$panel.find('#sub-zone').change(function () {
                $service.ajax('zone/get-events', {
                    'zid': _this.$panel.find('#parent-zone').val(),
                    'onlyIn': 1
                }).done(function (response) {
                    _this.renderOption(response.content, '请选择事件', { 'value': 'event_id', 'text': 'event_name' }, '#event');
                }).fail(function (response) {
                    $service.alert().error('数据获取失败<br/>' + response.describe);
                });
            })
        },

        'renderLabel': function (zid) {
            $service.ajax('zone/get-label', {
                'zid': zid
            }).done(function (response) {
                response = response.content;

                if (!$.isArray(response)) {
                    var
                        $custom = report.$panel.find('#custom-label');
                    
                    $custom.find('input').val('');
                    report.customValidateTest = response.test;
                    $custom.find('label').eq(0).text(response.tips);
                    $custom.find('label').eq(1).remove();
                    $custom.show();
                }
            })
        }
    }

    $service.addModule('report', report);
})();