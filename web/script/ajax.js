(function ($service) {
    /**
     *  @param String url
     *  @param String type
     *  @param Object data
     *  @param String dataType
     *  @param Number timeout
     *  @param Object otherParams
     */

    
    $service.extend('ajax', function () {
        var
            args = $service.args(arguments, {
                'url': function (value)
                {
                    return typeof value == 'string' || typeof value == 'object';
                },
                'type': [
                    function (value)
                    {
                        if (typeof value == 'string')
                        {
                            value = value.toUpperCase();

                            if (value == 'GET' || value == 'POST')
                            {
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
                    function (value)
                    {
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
                    function (value)
                    {
                        if (!isNaN(value))
                        {
                            return value;
                        }    
                    },
                    300000
                ],
                'otherParams': [
                    function (value)
                    {
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
            if (response.status == '1' || response.status == 'success')
            {
                delete response.status;
                return $.Deferred().resolve(response);
            } else {
                return $.Deferred().reject(response);
            } 
        })
    })
    
    
}($service))