// var SUCCESS = 1,ERROR = 2,NORMAL = 0;
    
$(function ($service) {
    
    /**
     *  @param String|Object title
     *  @param Number level
     *  @param String|Object content
     *  @param Number autoClose
     *  @param Function closeCallBack
     */

    $service.addUtility('alert', function () {
        var
            args, $modal, _alert, titleClass, buttonClass;
        

        if (arguments.length == 0) {
            return {
                'success': function () {
                    Array.prototype.unshift.call(arguments, '操作成功');
                    Array.prototype.unshift.call(arguments, 1);
                    $service.$helpers.alert.apply(null, arguments);
                },
                'error': function () {
                    Array.prototype.unshift.call(arguments, '操作失败');
                    Array.prototype.unshift.call(arguments, 2);
                    $service.$helpers.alert.apply(null, arguments);
                }
            }
        }

        if (!('_alert_' in $service)) {    

            _alert = new $service.$helpers.modal('#alert');
            
            _alert['$button'] = _alert.$modal.find('button');

            _alert.onClosen(function () {
                this.$title.removeClass('error success');
                this.$button.removeClass('btn-success btn-danger');
            }, true);

            $service['_alert_'] = _alert;
        }
            
        $modal = _alert || $service._alert_;

        args = $service.$helpers.args(arguments, {
            'level': [
                function (value) {
                    return !isNaN(value) && value >= 0 && value <= 2;
                },0
            ],
            'title': [
                function (value) {
                    return typeof value == 'string' || typeof value == 'object';
                },'Alert'
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

        if (args.level) {
            if (args.level == 1) {
                titleClass = 'success';
                buttonClass = 'btn-success';
            } else {
                titleClass = 'error';
                buttonClass = 'btn-danger';
            }

            $modal.$button.addClass(buttonClass);
            $modal.$title.addClass(titleClass);
        }

        if (args.callback) {
            $modal.onClosen(args.callback);
        }

        $modal.show(args.title, args.content, args.autoClose);
    });
}($service));