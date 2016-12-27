/**
 * Created by 2m on 2016/11/17.
 */

$(function(global){
    var
        $service = {
            'contains' : {},

            'runModule': function ($target)
            {   
                $target = $($target);

                var
                    href = $target.attr('href'),
                    module_;
                
                if (href != '#')
                {
                    module_ = href.slice(1, -6);

                    if (!(module_ in this.contains))
                    {
                        this.initModule(module_, true);
                    }

                    $target.tab('show');
                }
            }, 

            'initModule': function (name,inject)
            {
                var
                    object;
                
                object = this.modules[name];

                if (inject)
                {
                    object['$panel'] = $('#' + name + '-panel');
                    object['$service'] = this;
                    object['helper'] = this.helper;
                }    

                object.init();

                this.contains[name] = object;
            }, 

            'registerModule': function (name, content)
            {
                this.modules[name] = content;
            }, 

            'extend': function (name, content)
            {
                this[name] = content;
            },

            'modules' : {},
            'helper': {},
        }

    $service.registerModule('init', {
        'init': function ()
        {
            $('#nav').click(function (event) {
                
                event.preventDefault();

                var $target = event.target,
                    href;

                if($target.tagName == 'A')
                {
                    $service.runModule($target);
                }
            })
        }
    })

    global.$service = $service;

    $service.initModule('init',false);

}(window))

function C()
{
    console.log.apply(null,arguments);
}


