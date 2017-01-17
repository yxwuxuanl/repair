/**
 * Created by 2m on 2016/11/17.
 */

$(function (global) {
    var
        $service = {
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
                
                return $.get(url).then(success, fail || function () {
                    alert('未知错误,请尝试刷新页面');
                });

            },

            'runModule': function (name, injectPanel) {
                
                var
                    moduleName = this.parseModuleName(name);
                
                if (!(moduleName in this.$modules)) {
                    this.loader(defines[moduleName], function () {
                        $service.runModule(name);
                    });
                    return;
                }
                
                if (!this.contain.has(moduleName)) {
                    var
                        module_ = this.$modules[moduleName],
                        contain = this.contain;

                    module_['_moduleName'] = moduleName;

                    module_.reRun = function () {
                        $service.contain.reRun(moduleName);
                    }
                    
                    if (injectPanel !== false) {
                        module_['$panel'] = $(name);
                    }

                    this['_' + moduleName + '_'] = module_;
                    
                    contain.set(moduleName, module_);
                    contain.init(moduleName);
                }

            }
        }
    
    $service.alert = function () {
        
        var
            classs = ['error-alert', 'success-alert'],
            args,modal,$modal;
        
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

    $service.modal = function (modal, init) {

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
                    return typeof value == 'string' || typeof value == 'object';
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
            if ([200, 304, 1].indexOf(response.status) > -1 || response.status == 'success') {
                delete response.status;
                return $.Deferred().resolve(response);
            } else {
                return $.Deferred().reject(response);
            }
        })
    };

    $service.toArray = function (args) {
        return Array.prototype.slice.call(args,0);
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

    $service.validate = function ($form, config) {

        if (!('validator' in $)) {
            this.loader('script/jquery.validate.min.js', function () {
                $service.validate($form, config);
            });
        } else {
            config = config || {};
            $form.validate(config);
            return $form;
        }

    };

    $service.$bootstraps.push(function () {

        var
            self = this;

        $('#nav').click(function (event) {
            event.preventDefault();

            var
                $target = $(event.target),
                href;
            
            if ($target[0].tagName == 'A' && (href = $target.attr('href')) != '#') {
                self.runModule(href);
            }

        })
    })
    
    $service.$bootstraps.push(function () {

        $('button.submit').click(function () {
            $(this).parent().parent().submit();
        })

    })

    $service.$bootstraps.push(function () {
        $(document).ajaxSend(function () {
            $('.spinner').show();
        })

        $(document).ajaxComplete(function () {
            $('.spinner').hide();
        })
    })

    $service.bootstrap();
    
    global.$service = $service;

} (window))

function C()
{
    console.log.apply(null,arguments);
}


