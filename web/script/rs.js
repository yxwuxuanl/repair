/**
 * Created by 2m on 2016/11/17.
 */

(function (global) {
    defines['validate'] = 'script/jquery.validate.min.js';

    var    
        $rs = {
            'eventHandle': {},

            'on': function (m, name, actions, func) {
                if (!(m in this.eventHandle)) {
                    this.eventHandle[m] = {};
                }

                if (!(name in this.eventHandle[m])) {
                    this.eventHandle[m][name] = [];
                }

                if (func) {
                    // 事件处理器为 [Object,Method]
                    this.eventHandle[m][name].push([actions, func]);
                } else {
                    // 事件处理器为 Object:Method
                    this.eventHandle[m][name].push(actions);
                }
            },

            'bind': function (m, handle)
            {
                for(var i = 0 ; i < handle.length ; i++)
                {
                    var
                        moduleName,events;

                    if(handle[i].length > 1)
                    {
                        moduleName = handle[i][0],
                        events = handle[i][1];
                    }else{
                        moduleName = m._module_name_;
                        events = handle[i][0]
                    }

                    for(var eventName in events)
                    {
                        var
                            chuck = events[eventName];

                        if(typeof chuck == 'function')
                        {
                            $rs.on(moduleName,eventName,m,chuck);
                        }else{
                            for(var j = 0 ; j < chuck.length ; j++)
                            {
                                $rs.on(moduleName, eventName, m, chuck[j]);
                            }
                        }
                    }
                }
            },

            'trigger': function (m, name) {
                if (!(m in this.eventHandle) || !(name in this.eventHandle[m])) return;
                var
                    defines = $rs.eventHandle[m][name];

                for (var i = 0, len = defines.length; i < len; i++) {

                    var
                        define = defines[i],
                        m_, split, handle;
                    
                    if (typeof define[0] == 'object') {
                        m_ = define[0];
                        handle = define[1];
                    } else {
                        if (define[0].indexOf(':') > 0) {
                            split = define[0].split(':');
                            m_ = split[0];
                            handle = split[1];
                        } else {
                            m_ = define[0];
                            handle = define[1];
                        }

                        m_ = $rs.$modules[m_];
                    }
                    
                    if (!(m_['_module_name_'] in $rs.contain.$contains)) continue;

                    var
                        params = [].slice.call(arguments,2);

                    if (typeof handle == 'string') {
                        m_[handle].apply(m_, params[0]);
                    } else {
                        handle.apply(m_, params[0]);
                    }
                }
            },
            '$bootstraps': [],
            '$modules': {},

            'contain': {
                '$contains': {},

                'set': function (name, instance) {
                    this.$contains[name] = instance;
                },

                'destory': function (name) {
                    this.$contains[name].destory();
                    delete this.$contains[name];
                },

                'get': function (name) {
                    return this.$contains[name];
                },

                'reRun': function (name) {

                    if (typeof name == 'object') {
                        for (var i = 0, len = name.length; i < len; i++) {
                            $rs.contain.reRun(name[i]);
                        }
                    }

                    if (name) {

                        if (name in this.$contains) {
                            this.$contains[name].destory();
                            this.$contains[name].init();
                        }
                        
                    } else {
                        name = this.moduleName;
                        $rs.contain.reRun(name);
                    }

                },

                'has': function (name) {
                    return name in this.$contains;
                },

                'init': function (name) {
                    if ('init' in this.$contains[name]) {
                        this.$contains[name].init();
                    }
                }
            },

            'bootstrap': function () {

                for (var i = 0, len = this.$bootstraps.length; i < len; i++) {
                    this.$bootstraps[i].call(this);
                }

            },

            'parseModuleName': function (href) {

                if (href.slice(0, 1) != '#') {
                    return href;
                }

                href = href.slice(1, -6);

                var
                    index = href.indexOf('-'),
                    rep = href[index + 1];
                
                return href.replace('-' + rep, rep.toUpperCase());
            },

            'addModule': function (name, module_) {
                this.$modules[name] = module_;
            },

            'loader': function (url, success, fail) {
                
                if (url in defines) {
                    url = defines[url];
                }

                return $.get(url).then(success, fail || function () {
                    alert('未知错误,请尝试刷新页面');
                });
            },

            'runModule': function (name, init) {
                if (!(name in this.$modules)) {
                    this.loader(name, function () {
                        $rs.runModule(name, init);
                    });
                } else {
                    if (!this.contain.has(name)) {
                        var
                            module_ = this.$modules[name];
                            
                        module_._module_name_ = name;   

                        for (var key in $rs.plugin)
                        {
                            module_[key] = $rs.plugin[key];
                        }    

                        this.contain.set(name, module_);
                        init && init.call(module_);
                        this.contain.init(name);
                    }
                }
            }
        }
    
    $rs.alert = function () {
        var
            classs = ['error-alert', 'success-alert'],
            args, modal, $modal;
        
        if (!arguments.length) {
            return {
                'success': function () {
                    $rs.alert.apply(null, [1, '操作成功'].concat([].slice.call(arguments,0)));
                },
                'error': function () {
                    $rs.alert.apply(null, [0, '操作失败'].concat([].slice.call(arguments,0)));
                },
            }
        }

        if (!('_alert_' in $rs)) {
            $rs['_alert_'] = modal = new $rs.modal('#alert',{
                'close' : function()
                {
                    this.$modal.removeClass('error-alert success-alert');
                }
            })
        }
            
        modal = modal || $rs._alert_;

        $modal = modal.$modal;

        args = $rs.args(arguments, {
            'level': [
                function (value) {
                    return !isNaN(value);
                }, null
            ],
            'title': [
                function (value) {
                    return typeof value == 'string' || typeof value == 'object';
                }, 'Alert'
            ],
            'content': function (value) {
                return typeof value == 'string' || typeof value == 'object';
            },
            'autoClose': function (value) {
                return !isNaN(value);
            },
            'callback': function (value) {
                return typeof value == 'function';
            }
        })

        args.level !== null && $modal.addClass(classs[args.level]);

        args.callback && modal.bind('closen', args.callback, true);

        args.autoClose && modal.close(args.autoClose);

        modal.setTitle(args.title).setContent(args.content);

        modal.show();
    };

    $rs.modal = function (modal, init, extend) {
        if (typeof modal == 'string') {
            modal = $(modal);
        } else if (modal instanceof jQuery) {
            if (!modal.hasClass('modal')) {
                modal = modal.find('.modal');
            }
        }

        this.$modal = modal;
        this.$title = modal.find('.modal-title');
        this.$body = modal.find('.modal-body');

        extend && this.extend(extend);

        if (typeof init == 'function') {
            init.call(this);
        } else if (typeof init == 'object') {
            for (var eventName in init) {
                if (eventName == 'init') {
                    init[eventName].call(this);
                } else {
                    this.bind(eventName, init[eventName]);
                }
            }
        }
    };

    $rs.modal.prototype = {
        'eventMap': {
            'shown': 'shown.bs.modal',
            'show': 'show.bs.modal',
            'closen': 'hidden.bs.modal',
            'close': 'hide.bs.modal'
        },

        'extend': function (name, content) {
            if (typeof name == 'object') {
                for (var i in name) {
                    this.extend(i, name[i]);
                }
            } else {
                this[name] = content;
            }

            return this;
        },

        'show': function () {
            if (!arguments.length) {
                return this.$modal.modal('show');
            }

            var
                args;

            args = $rs.args(arguments,
                {
                    'title': [
                        function (value) {
                            return typeof value == 'object' || typeof value == 'string';
                        }, null
                    ],
                    'content': [
                        function (value) {
                            return typeof value == 'object' || typeof value == 'string';
                        }, null
                    ],
                    'autoClose': function (value) {
                        return !isNaN(value);
                    }
                }
            )

            this.setTitle(args.title).setContent(args.content);
            args.autoClose && this.close(args.autoClose);
            this.$modal.modal('show');
            return this;
        },

        'close': function (timeout) {
            if (timeout) {
                this.bind('shown', function () {
                    var
                        $modal = this.$modal;

                    setTimeout(function () {
                        $modal.modal('hide');
                    }, timeout)

                }, true);
            } else {
                this.$modal.modal('hide');
            }
            return this;
        },

        'bind': function (eventName, handler, one) {
            var
                self = this;

            if (one) {
                this.$modal.one(this.eventMap[eventName], function () {
                    handler.call(self);
                });
            } else {
                this.$modal.on(this.eventMap[eventName], function () {
                    handler.call(self);
                });
            }

            return this;
        },

        'reset': function () {
            return this.setTitle().setContent();
        },
        
        'setTitle': function (content) {
            $rs.setContent(this.$title, content);
            return this;
        },

        'setContent': function (content) {
            $rs.setContent(this.$body, content);
            return this;
        }
    };

    $rs.ajax = function () {
        var
            args = $rs.args(arguments, {
                'url': function (value) {
                    return typeof value == 'string';
                },
                'type': [
                    function (value) {
                        if (typeof value == 'string') {
                            value = value.toUpperCase();

                            if (value == 'GET' || value == 'POST') {
                                return value;
                            }
                        }
                    },
                    'GET'
                ],
                'data': [
                    function (value) {
                        return typeof value == 'object';
                    },
                    {}
                ],
                'dataType': [
                    function (value) {
                        if (typeof value == 'string') {
                            value = value.toUpperCase();

                            if (['TEXT', 'JSON', 'XML'].indexOf(value) > -1) {
                                return value;
                            }
                        }
                    },
                    'JSON'
                ],
                'timeout': [
                    function (value) {
                        if (!isNaN(value)) {
                            return value;
                        }
                    },
                    10000
                ],
                'otherParams': [
                    function (value) {
                        return typeof value == 'object';
                    },
                    {}
                ]
            });
        

        if (typeof value == 'object') {
            args = args.value;
        } else {
            args = $.extend(args, args.otherParams);
            delete args.otherParams;
        }
        
        return $.ajax(args).then(function (response) {
            if ([200, 304, 1, '1'].indexOf(response.status) > -1 || response.status == 'success') {
                delete response.status;
                return $.Deferred().resolve(response);
            } else {
                return $.Deferred().reject(response);
            }
        })
    };

    $rs.args = function (arguments_, params) {
        var
            args = {}, defaultValue, func;

        for (var name in params) {
            if ($.isArray(params[name])) {
                defaultValue = params[name][1];
                func = params[name][0];
            } else {
                func = params[name];
                defaultValue = false;
            }

            if (arguments_.length) {
                if (func.call(null, arguments_[0])) {
                    args[name] = [].shift.call(arguments_);
                } else {
                    args[name] = defaultValue;
                }
            } else {
                args[name] = defaultValue;
            }
        }
        return args;
    };

    $rs.getCsrf = function () {
        return $('meta[name="csrf-token"]').attr('content');
    };

    $rs.setContent = function ($ele, content) {
        if (!content && content != 0) {
            $ele.html('');
        } else if ($.isArray(content)) {
            $ele.html($rs.tag.apply(null, content));
        } else if (typeof content == 'string') {
            $ele.html(content);
        } else if (content instanceof jQuery) {
            $ele.append(content);
        }
    };

    $rs.validate = function ($form, config, callback) {
        if (!('validator' in $)) {
            this.loader('script/jquery.validate.min.js', function () {
                $rs.validate($form, config, callback);
            });
        } else {
            config = config || {};
            callback && callback();
            $form.validate(config);
            return $form;
        }
    };

    $rs.$bootstraps.push(function () {
        $('#tab').click(function (event) {
            event.preventDefault();

            var
                $target = $(event.target),
                href;
            
            if ($target[0].tagName == 'A' && (href = $target.attr('href')) != '#') {
                var
                    moduleName = href.slice(1, -6);
                
                $rs.runModule(moduleName, function () {
                    this.$panel = $(href);
                });
            }
        })
    });
    
    $rs.$bootstraps.push(function () {
        $('button.submit').click(function () {
            $(this).parent().parent().submit();
        });

    });

    $rs.$bootstraps.push(function () {
        $(document).ajaxSend(function () {
            $('#spinner').show();
        })

        $(document).ajaxComplete(function () {
            $('#spinner').hide();
        })
    });

    $rs.render = function (_config_) {
        var
            frag = document.createDocumentFragment(),
            config;

        config = {
            '$temp': _config_['$temp'],
            'clear': ('clear' in _config_) ? _config_.clear : false,
            'after': ('after' in _config_) ? _config_.after : null,
            'before': ('before' in _config_) ? _config_.before : null,
            'filter': ('filter' in _config_) ? _config_.filter : null,
            'data': ('data' in _config_) ? _config_.data : null,
            'attrs' : ('attrs' in _config_) ? _config_.attrs : null
        };
            
        config.temp = _config_.temp || config.$temp[0].innerHTML;
        config.$mount = _config_['$mount'] || config.$temp.parent();
        
        if(config.before)
        {
            if(config.before.call(config) === false)
            {
                return null;
            }
        }

        // 是否清空节点
        config.clear && config.$mount.html('');

        // 如果没有数据则直接渲染模板
        if (!config.data) {
            return config.$mount.append($(config.temp));
        }

        if (!$.isArray(config.data))
        {
            config.data = [config.data];
        }    

        for (var i = 0, len = config.data.length; i < len; i++) {
            var
                chuck = config.data[i],
                el = config.temp;

            config.filter && config.filter.call(chuck);

            if(config.attrs)
            {
                for (var index in config.attrs)
                {
                    el = el.replace(new RegExp('{' + config.attrs[index] + '}', 'g'), chuck[config.attrs[index]]);
                }
            }else{
                for (var key in chuck) {
                    el = el.replace(new RegExp('{' + key + '}', 'g'), chuck[key]);
                }
            }

            el = $.parseHTML(el);

            if (config.after) {
                el = config.after.call(chuck, el);
            }

            for (var j = 0, ellen = el.length; j < ellen; j++) {
                frag.appendChild(el[j]);
            }
        }

        config.$mount.append(frag);
    }
    
    $rs.watcher = {
        'define': function (key, value, changeHandle) {
            if (typeof value == 'function') {
                changeHandle = value;
                value = null;
            }

            this.data[key] = [value, changeHandle];
        },
        'set': function (key, value) {
            if (key.indexOf('.') > -1) {
                var
                    split = key.split('.');


                this.data[split[0]][0][split[1]] = value;
            } else {
                this.data[key][0] = value;
            }
        },
        'change': function (key, value, args) {
            var
                oldValue = this.get(key),
                handle = this.data[key.split('.')[0]][1];

            this.set(key, value);

            handle.apply(this, [oldValue, value].concat(args));
        },
        'get': function (key) {
            if (key.indexOf('.') > -1) {
                var
                    split = key.split('.');

                return this.data[split[0]][0][split[1]];
            } else {
                return this.data[key][0];
            }
        },
        'plus': function (key) {
            var
                oldValue = this.get(key);

            this.change(key, oldValue + 1, [].slice.call(arguments, 1));
        },
        'sub': function (key) {
            var
                oldValue = this.get(key);

            this.change(key, oldValue - 1, [].slice.call(arguments, 1));
        }
    };

    // 初始化模块的时候以下内容会被注入到模块
    $rs.plugin = {
        'watcher': function ()
        {
            $rs.watcher.data = this._data_;
            return $rs.watcher;
        }   ,
        '_data_' : {},
        'on': function (m, event, func)
        {
            $rs.on(m, event, this, func);
        },
        'trigger': function (event)
        {
            $rs.trigger(this._module_name_, event, [].slice.call(arguments, 1));
        }   , 
        'bind' : function(events)
        {
            $rs.bind(this,events);
        }
    };    
    
    $rs.bootstrap();
    global.$rs = $rs;

})(window);

function C()
{
    console.log.apply(null,arguments);
}