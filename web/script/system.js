/**
 * Created by 2m on 2016/11/24.
 */
$(function ($service) {
    $service.registerModule('system-zone', {
        'renderDt': function (data) {
            var dt = [], tag = $service.tag, $dl;

            for (var i = 0; i < data.length; i++){
                    dt.push(tag('dt', { 'class': 'list-group-item', 'data-zid': data[i]['zone_id'] },
                    [
                        ['span', '.zone-name parent-zone', data[i]['zone_name']],
                        ['span', '.glyphicon glyphicon-chevron-down']
                    ]
                ));
                dt.push(tag('div', '.subs')); 
            }

            if (!($dl = this.$panel.find('dl')).length) {
                $dl = tag('dl', true);
                $dl.html(dt.join(''));
                this.$panel.find('.content').append($dl);
            } else {
                $dl.append($(dt.join('')));
            }
        },

        'init': function () {

            var
                _this = this;

            $service.ajax('zone/get-parent', 'get', 'json', 5000).fail(function (response) {

                $service.alert().error('获取数据失败');

            }).done(function (response) {

                _this.modal = new $service.modal('#zone-modal');
                _this.watchModal();
                _this.renderDt(response);
                _this.watchDl();
                _this.watchForm();

                _this.$panel.find('#zone-add-span').click(function () {
                    _this._active_ = $(this);
                    _this.modal.show();
                })

            })

        },

        'watchForm': function () {
            var
                _this = this,
                $body = this.modal.$body;
            
            $service.addFormValidate({
                '#zone-rename-form': {
                    messages: {
                        'zone-rename-input': {
                            'required': '请输入新的区域名',
                            'minlength': '区域名长度在 2~10 个字符之间',
                            'maxlength': '区域名长度在 2~10 个字符之间'
                        }
                    },
                    debug: true
                },
                '#zone-add-form': {
                    messages: {
                        'zone-add-input': {
                            'required': '请输入新的区域名',
                            'minlength': '区域名长度在 2~10 个字符之间',
                            'maxlength': '区域名长度在 2~10 个字符之间'
                        }
                    }
                },
                debug: true
            }, $body);

            $body.find('form').submit(function (event) {
                event.preventDefault();

                if ($(this).valid()) {
                    _this[$(this).attr('action')].call(this, _this._active_);
                    _this.modal.close();
                }
            })
        },

        'rename': function ($active) {
            var
                value = $(this).find('#zone-rename-input').val();
            
            $service.ajax('zone/rename', {
                'zone_id': $active.parent().attr('data-zid'),
                'zone_name': value
            }).done(function (response) {
                $service.alert().success('重命名成功', 400, function () {
                    $active.html(value);
                });
            }).fail(function (response) {
                $service.alert().error('重命名失败');
            })

        },

        'delete': function () {
            var
                $active = this._active_,
                id = $active.parent().attr('data-zid'),
                csrf = $service.getCsrf(),
                _this = this;

            this.modal.close();

            $service.ajax('zone/delete', 'post', {
                'zone_id': id,
                '_csrf': csrf
            }).done(function () {
                $service.alert().success('删除成功', 400, function () {
                    if ($active.hasClass('sub-zone')) {
                        $active.parent().remove();
                    } else {
                        $active.parent().next().remove().end().remove();
                    }
                })
            }).fail(function () {
                $service.alert().error('删除失败');
            })
        },

        'add': function ($active) {
            var
                data, value, id, tag = $service.tag, _this = this;

            value = $(this).find('#zone-add-input').val();
            id = $active.parent().attr('data-zid');
            
            $service.ajax('zone/add', {
                'parent': id,
                'name': value
            }).done(function (response) {
                $service.alert().success('已添加一个区域', 400, function () {
                    if (id == '0000') {
                        $service.modules['system-zone'].renderDt([{ 'zone_id': response.id, 'zone_name': value }]);
                    } else {
                        $active.parent().next().append(tag('dd', { 'data-zid': response.id, 'class': 'list-group-item' }, [['span', '.zone-name sub-zone', value]]));
                    }
                })
            })

        },
        
        'showSubs': function ($target) {
            var
                $next = $target.next(),
                _this = this,
                $active,
                len;
            
            if ($next.hasClass('subs-active')) {
                this.hideSubs($target, $next);
                return;
            } else {
                if (($active = $target.siblings('.subs-active')).length) {
                    this.hideSubs($active.prev(), $active);
                }
            }

            if (!$.data($next[0], 'load')) {

                _this.loadSubs($target.attr('data-zid'), $next).done(function () {
                    _this.showSubs($target);
                });

            } else {

                if ((len = $next.children().length)) {
                    $next.show(len * 5 + 200, function () {
                        $target.find('.glyphicon-chevron-down').show();
                    }).addClass('subs-active');
                } else {
                    $service.alert().error('此区域暂无子区域');
                }

            }
        },

        'loadSubs': function (id, $container) {
            return $service.ajax('zone/get-subs', { 'parent': id }).done(function (response) {
                var
                    dd = [],
                    tag = $service.tag;
                
                for (var i = 0, len = response.length; i < len; i++){
                    dd.push(tag('dd', ['.list-group-item',
                        { 'data-zid': response[i]['zone_id'] }],
                        [['span', '.zone-name sub-zone', response[i]['zone_name']]]
                    ));
                }

                $container.append($(dd.join('')));
                $.data($container[0], 'load', 1);

            }).fail(function (response) {

                if (response.status == 0) {
                    $.data($container[0], 'load', 1);
                    $service.alert().error('该区域暂无子区域');
                } else {
                    $service.alert().error('数据获取失败');
                }

            })
        },
    
        'hideSubs': function ($dt, $subs) {
            $subs.hide(200, function () {
                $dt.find('.glyphicon-chevron-down').hide();
                $(this).removeClass('subs-active');
            });
        },

        'watchDl': function () {
            var
                _this = this;

            this.$panel.find('dl').click(function (event) {

                event.stopPropagation();

                var
                    $target = $(event.target),
                    tagName = event.target.tagName;

                if (tagName == 'DT') {
                    _this.showSubs($target);
                } else if (tagName == 'SPAN' && $target.hasClass('zone-name')) {
                    _this._active_ = $target;
                    _this.modal.show();
                } else if (tagName == 'DD') {
                    $target.find('.zone-name').click();
                }
            })
        },

        'watchModal': function () {
            var
                _this = this,
                modal = this.modal,
                $modal = modal.body;

            modal.$body.find('#zone-delete-a').on('show.bs.tab', function () {
                var
                    $button = modal.$body.find('#zone-delete-button'),
                    timer;

                $button.text(5).attr('disabled', 'disabled');

                timer = setInterval(function () {
                    var
                        count = $button.text();

                    if (count > 1) {
                        $button.text(count - 1);
                    } else {
                        clearInterval($.data($button[0], 'timer'));
                        $button.removeAttr('disabled').text('确认删除');
                    }
                }, 1000);

                $.data($button[0], 'timer', timer);
            }).on('hide.bs.tab', function () {
                var
                    $button = modal.$body.find('#zone-delete-button');
                clearInterval($.data($button[0], 'timer'));
            });
            
            modal.$body.find('#zone-delete-button').click(function () {
                _this.delete.call(_this);
            })

            modal.$body.find('.nav a').click(function (event) {
                event.preventDefault();
                $(this).tab('show');
            })

            modal.onShow(function () {
                var
                    li = modal.$body.find('.nav li'),
                    $active = _this._active_;

                if ($active.hasClass('sub-zone')) {
                    li.eq(2).hide();
                } else if ($active.hasClass('add-zone')) {
                    this.setTitle('添加主要区域');
                    li.eq(0).hide().end().eq(1).hide();
                }
                
                if ($active.hasClass('zone-name')) {
                    this.setTitle($active.html());
                }

                li.each(function () {
                    if ($(this).css('display') != 'none') {
                        $(this).find('a').tab('show');
                        return false;
                    }
                })
            }, true);

            modal.onHidenn(function () {
                modal.$body.find('.nav li').show();
                _this._active_ = null;

                modal.$body.find('form').each(function () {
                    $(this).validate().resetForm();
                    this.reset();
                })
            }, true);
        }
    });

    $service.registerModule('system-event', {
       'init' : function () {

        } 
    });

}($service))