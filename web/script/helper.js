$(function ($service) {
    
    /**
     * @param String tagName
     * @param String|Object options|class|id
     * @param String|Object|null content
     * @param Object appendTo
     */

    $service.extend('tag', function () {
        var
            args, options = {}, tag = [], attr_func;
        
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

        tag.push('<' + args.tagName);

        attr_func = function (attr) {
            if ($.isArray(attr)) {
                for (var i = 0,len = attr.length; i < len; i++){
                    attr_func(attr[i]);
                }
            } else if (typeof attr == 'object') {
                for (var key in attr) {
                    tag.push(' ' + key + '="' + attr[key] + '"');
                }
            } else if (typeof attr == 'string') {
                if (attr.slice(0, 1) == '.') {
                    tag.push(' class="' + attr.slice(1) + '"');
                } else {
                    tag.push(' id="' + attr.slice(1) + '"');
                }
            }
        }

        args.options && attr_func(args.options);

        tag.push('>');

        if (args.content) {
            if (typeof args.content == 'string') {
                tag.push(args.content);
            } else {

                var
                    len = args.content.length;

                for (var i = 0; i < len; i++) {
                    if (typeof args.content[i] == 'string') {
                        tag.push(args.content[i]);
                    } else if ($.isArray(args.content[i])) {
                        tag.push($service.tag.apply(null, args.content[i]));
                    }
                }
            }
        }

        tag.push('</' + args.tagName + '>');

        if (args.encap) {
            return $(tag.join(''));
        }

        return tag.join('');
    });


    /**
     *  @param Object element
     *  @param String|Object content
     * */

    $service.extend('setContent', function ($ele, content) {
        if (content === undefined) {
            return $ele.html('');
        } else if ($.isArray(content)) {
            $ele.html($service.tag.apply(null, content));
        } else if (typeof content == 'string') {
            $ele.html(content);
        } else if (content instanceof jQuery) {
            $ele.append(content);
        }
    });

    /**
     *  @param arguments
     *  @param Object Params(Name => Contidion,defaultValue)
     */

    $service.extend('args', function (arguments_, params) {
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
    });

    $service.extend('getCsrf', function () {
        return $('[name="csrf-token"]').attr('content');
    })

}($service))