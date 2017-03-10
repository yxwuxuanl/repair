/**
 * Created by 2m on 2016/11/17.
 */

$(function (global) {
    defines['validate'] = 'script/jquery.validate.min.js';
    var
        $service = {
            'eventHanlders': {},

            'on': function (m, name, actions, func) {
                if (!(m in this.eventHanlders)) {
                    this.eventHanlders[m] = {};
                }

                if (!(name in this.eventHanlders[m])) {
                    this.eventHanlders[m][name] = [];
                }

                if (func) {
                    this.eventHanlders[m][name].push([actions, func]);
                } else {
                    this.eventHanlders[m][name].push(actions);
                }
            },

            'trigger': function (m, name, params) {
                if (!(m in this.eventHanlders) || !(name in this.eventHanlders[m])) return;
                var
                    defines = $service.eventHanlders[m][name];

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

                        m_ = $service.$modules[m_];
                    }
                    
                    if (!(m_['_module_name_'] in $service.contain.$contains)) continue;

                    if (typeof handle == 'string') {
                        m_[handle].apply(m_, params);
                    } else {
                        handle.apply(m_, params);
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
                            $service.contain.reRun(name[i]);
                        }
                    }

                    if (name) {

                        if (name in this.$contains) {
                            this.$contains[name].destory();
                            this.$contains[name].init();
                        }
                        
                    } else {
                        name = this.moduleName;
                        $service.contain.reRun(name);
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
                        $service.runModule(name, init);
                    });
                } else {
                    if (!this.contain.has(name)) {
                        var
                            module_ = this.$modules[name];
                            
                        module_._module_name_ = name;   

                        for (var key in $service.plugin)
                        {
                            module_[key] = $service.plugin[key];
                        }    

                        this.contain.set(name, module_);
                        init && init.call(module_);
                        this.contain.init(name);
                    }
                }
            }
        }
    
    $service.alert = function () {
        
        var
            classs = ['error-alert', 'success-alert'],
            args, modal, $modal;
        
        if (arguments.length == 0) {
            return {
                'success': function () {
                    $service.alert.apply(null, [1, '操作成功'].concat($service.toArray(arguments)));
                },
                'error': function () {
                    $service.alert.apply(null, [0, '操作失败'].concat($service.toArray(arguments)));
                },
            }
        }

        if (!('_alert_' in $service)) {
            $service['_alert_'] = modal = new $service.modal('#alert')
        }
            
        modal = modal || $service._alert_;

        $modal = modal.$modal;

        args = $service.args(arguments, {
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


        if (args.level !== null) {
            $modal.addClass(classs[args.level]);
        }

        if (args.callback) {
            modal.bind('closen', args.callback, true);
        }

        modal.setTitle(args.title).setContent(args.content);


        if (args.autoClose) {
            modal.close(args.autoClose);
        }

        modal.show();

    };

    $service.modal = function (modal, init, extend) {

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
        var
            _this = this;

        if (typeof extend == 'object') {
            for (var key in extend) {
                this[key] = extend[key];
            }
        }

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

    $service.modal.prototype = {

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

            if (arguments.length == 0) {
                this.$modal.modal('show');
                return;
            }

            var
                args;

            args = $service.args(arguments,
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

            if (args.autoClose) {

                this.close(args.autoClose);

            }

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
                _this = this;

            if (one) {
                this.$modal.one(this.eventMap[eventName], function () {
                    handler.call(_this);
                });
            } else {
                this.$modal.on(this.eventMap[eventName], function () {
                    handler.call(_this);
                });
            }

            return this;
        },

        'reset': function () {
            return this.setTitle().setContent();
        },
        
        'setTitle': function (content) {
            $service.setContent(this.$title, content);
            return this;
        },

        'setContent': function (content) {
            $service.setContent(this.$body, content);
            return this;
        }
    };

    $service.ajax = function () {
        var
            args = $service.args(arguments, {
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

    $service.toArray = function (args) {
        return Array.prototype.slice.call(args, 0);
    };

    $service.template = function (text, params) {

        for (var key in params) {
            text = text.replace(new RegExp('{' + key + '}', 'g'), params[key]);
        }

        return text;
    };

    $service.tag = function () {
        var
            tag_template = '<{tag} {attributes}>{content}</{tag}>',
            attr_template = '{attr}="{value}"',
            t = $service.template,
            attrs = [],
            contents = [],
            attr_func,
            args,
            tag;
        
        args = $service.args(arguments, {
            'tagName': function (value) {
                return typeof value == 'string';
            },
            'options': [
                function (value) {
                    if (typeof value == 'string') {
                        return value.slice(0, 1) == '.' || value.slice(0, 1) == '#';
                    }
                    return typeof value == 'object';
                }, {}
            ],
            'content': [
                function (value) {
                    return typeof value == 'string' || $.isArray(value);
                }, null
            ],
            'encap': function (value) {
                return typeof value == 'boolean';
            }
        })

        attr_func = function (attr) {
            if ($.isArray(attr)) {

                for (var i = 0, len = attr.length; i < len; i++) {
                    attr_func(attr[i]);
                }

            } else if (typeof attr == 'object') {

                for (var key in attr) {
                    attrs.push(t(attr_template, { 'attr': key, 'value': attr[key] }));
                }

            } else if (typeof attr == 'string') {
                if (attr.slice(0, 1) == '.') {

                    attrs.push(t(attr_template, { 'attr': 'class', 'value': attr.slice(1) }));

                } else if (attr.slice(0, 1) == '#') {

                    attrs.push(t(attr_template, { 'attr': 'id', 'value': attr.slice(1) }));

                } else {
                    attrs.push(attr);
                }
            }
        }

        attr_func(args.options);

        if (args.content) {
            if (typeof args.content == 'string') {

                contents.push(args.content);

            } else {

                for (var i = 0, len = args.content.length; i < len; i++) {
                    
                    if (typeof args.content[i] == 'string') {

                        contents.push(args.content[i]);

                    } else if ($.isArray(args.content[i])) {

                        contents.push($service.tag.apply(null, args.content[i]));

                    }

                }
            }
        }

        tag = t(tag_template, {
            'tag': args.tagName,
            'attributes': attrs.join(' '),
            'content': contents.join('')
        });

        if (args.encap) {
            return $(tag.join(''));
        }

        return tag;
    };

    $service.args = function (arguments_, params) {
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
                    args[name] = Array.prototype.shift.call(arguments_);
                } else {
                    args[name] = defaultValue;
                }
            } else {
                args[name] = defaultValue;
            }
        }
        return args;
    };

    $service.getCsrf = function () {
        return $('meta[name="csrf-token"]').attr('content');
    };

    $service.setContent = function ($ele, content) {
        if (!content && content != 0) {
            $ele.html('');
        } else if ($.isArray(content)) {
            $ele.html($service.tag.apply(null, content));
        } else if (typeof content == 'string') {
            $ele.html(content);
        } else if (content instanceof jQuery) {
            $ele.append(content);
        }
    };

    $service.validate = function ($form, config, callback) {
        if (!('validator' in $)) {
            this.loader('script/jquery.validate.min.js', function () {
                $service.validate($form, config, callback);
            });
        } else {
            config = config || {};
            callback && callback();
            $form.validate(config);
            return $form;
        }
    };

    $service.$bootstraps.push(function () {
        $('#tab').click(function (event) {
            event.preventDefault();

            var
                $target = $(event.target),
                href;
            
            if ($target[0].tagName == 'A' && (href = $target.attr('href')) != '#') {
                var
                    moduleName = href.slice(1, -6);
                
                $service.runModule(moduleName, function () {
                    this.$panel = $(href);
                });
            }
        })
    });
    
    $service.$bootstraps.push(function () {

        $('button.submit').click(function () {
            $(this).parent().parent().submit();
        });

    });

    $service.$bootstraps.push(function () {
        $(document).ajaxSend(function () {
            $('#spinner').show();
        })

        $(document).ajaxComplete(function () {
            $('#spinner').hide();
        })
    });

    $service.render = function (_config_) {
        var
            frag = document.createDocumentFragment(),
            config = {
                '$temp': _config_['$temp'],
                'clear': ('clear' in _config_) ? _config_.clear : false,
                'after': ('after' in _config_) ? _config_.after : null,
                'before': ('before' in _config_) ? _config_.before : null,
                'filter': ('filter' in _config_) ? _config_.filter : null,
                'data': ('data' in _config_) ? _config_.data : null
            };
        
        config.temp = config.$temp[0].innerHTML;
        config.$mount = _config_['$mount'] || config.$temp.parent();

        config.before && config.before.call(config);

        // 是否清空节点
        config.clear && config.$mount.html('');

        // 如果没有数据则直接渲染模板
        if (!config.data) {
            return config.$mount.append($(config.temp));
        }

        for (var i = 0, len = config.data.length; i < len; i++) {

            var
                chunk = config.data[i],
                el = config.temp;

            config.filter && config.filter.call(chunk);

            for (var key in chunk) {
                el = el.replace(new RegExp('{' + key + '}', 'g'), chunk[key]);
            }

            el = $.parseHTML(el);

            if (config.after) {
                el = config.after.call(chunk, el);
            }

            for (var j = 0, ellen = el.length; j < ellen; j++) {
                frag.appendChild(el[j]);
            }
        }

        config.$mount.append(frag);
    }
    
    // 初始化模块的时候以下内容会被注入到模块
    $service.plugin = {
        'watcher': {
            'data': {},
            'define': function (key, value, changeHandle) {

                if (typeof key == 'object')
                {
                    for (var attr in key)
                    {
                        this.define(attr, key[attr]['default'], key[attr]['handle']);
                    }    
                } else {
                    this.data[key] = [value, changeHandle];
                }
            },
            'set': function (key, value)
            {
                if (key.indexOf('.') > -1)
                {
                    var
                        split = key.split('.');
                

                    this.data[split[0]][0][split[1]] = value;
                } else {
                    this.data[key][0] = value;
                }
            }   , 
            'change': function (key,value,args)
            {
                var
                    oldValue = this.get(key),    
                    handle = this.data[key.split('.')[0]][1];
                
                this.set(key, value);

                handle.apply(this,[oldValue,value].concat(args));
            },
            'get': function (key)
            {
                if (key.indexOf('.') > -1)
                {
                    var
                        split = key.split('.');
                    
                    return this.data[split[0]][0][split[1]];
                } else {
                    return this.data[key][0];
                }
            }   , 
            'plus': function (key)
            {
                var
                    oldValue = this.get(key);
                
                this.change(key, oldValue + 1, Array.prototype.slice.call(arguments, 1));
            },
            'sub': function (key)
            {
                var
                    oldValue = this.get(key);
                
                this.change(key, oldValue - 1, Array.prototype.slice.call(arguments, 1));
            }    
        },
        'on': function (m, event, func)
        {
            $service.on(m, event, this, func);
        },
        'trigger': function (event)
        {
            $service.trigger(this._module_name_, event, Array.prototype.slice.call(arguments, 1));
        }   , 

    };    
    
    $service.bootstrap();
    global.$service = $service;

}(window));

function C()
{
    console.log.apply(null,arguments);
}