/**
 * Created by 2m on 2016/11/17.
 */

$(function($global){
    $('#tab').click(function($event){
        $event.preventDefault();

        var $target = $event.target,$href;

        if($target.tagName == 'A' && ($href = $($target).attr('href')) != '#')
        {
            $service.initPanel($href.slice(1));
        }

    })

    $global.$service = {
        '$container' : {},

        'initPanel' : function($action)
        {
            var $explode = $action.split('-'),
                $module = $explode[0],
                $$action = $explode[1];

            if(!($module in this.$container) || !($$action in this.$container[$module]))
            {
                if(!($module in this.$container))
                {
                    this.$container[$module] = {};
                }

                var $object = this[$module][$$action],

                    $init = function($panel)
                    {
                        this.$panel = $panel;
                    },

                    $$object;

                $init.prototype = $object;

                $$object = new $init($('#' + $action ));

                if('init' in $$object)
                {
                    $$object.init();
                }

                this.$container[$module][$$action] = $$object;
                return $$object;
            }else{
                return this.$container[$module][$$action];
            }
        },
    }
}(window))

function C()
{
    console.log.apply(null,arguments);
}


(function($service){
    $service.ajax = function($config)
    {
        return $.ajax($config).then(function($response){
            if($response.status == 1)
            {
                delete $response.status;
                return $response;
            }else{
                return $.Deferred.reject($response).promise();
            }
        })
    }
}($service))

var SUCCESS = 1,ERROR = 2,NORMAL = 0;
    
$(function($service){

    $service.alert = function()
    {  
        var 
            $args,$class,$modal;

        if(!('_modal_' in this))
        {
            this._modal_ = new $service.modal('#alert');
        }

        if(arguments.length == 0)
        {
            return this._modal_;
        }

    
        $args = $service.helper.parseArgs(arguments,
            {
                'content' : function($value)
                {
                    return typeof $value == 'string' || typeof $value == 'object';
                },
                'level' : function($value)
                {
                    return !isNaN($value) && $value <= 2;
                },
                'title' : function($value)
                {
                    return typeof $value == 'string' || typeof $value == 'object';
                },
                'autoClose' : function($value)
                {
                    return !isNaN($value);
                },
                'callback' : function($value)
                {
                    return typeof $value == 'function';
                }
            }
        )

        $class = ['','alert-success','alert-danger'];

        $modal = this._modal_;

        $modal.body.removeClass($class.join(' ')).addClass($class[$args.level]);

        $modal.reset().setTitle($args.title || ['h4',{'class' : 'text-center'},'Alert']).setContent($args.content);

        if($args.callback)
        {
            $modal.onClosen($args.callback);
        }

        if($args.autoClose)
        {
            $modal.close($args.autoClose);
        }

        $modal.show();
    }
}($service))

$(function($service){
    $service.helper = {
        'tag' : function()
        {
            var 
                $tag,$args;

            $args = $service.helper.parseArgs(arguments,
                {
                    'tagName' : function($value)
                    {
                        return typeof $value == 'string';
                    },
                    'options' : function($value)
                    {
                        return typeof $value == 'object' && !($value instanceof jQuery);
                    },
                    'content' : function($value)
                    {
                        return $value || $value === null;
                    },
                    'appendTo' : function($value)
                    {
                        return typeof $value == 'object' && $value instanceof jQuery;
                    }
                }
            )

            $tag = $('<' + $args.tagName + '></' + $args.tagName + '>');


            if($args.options)
            {
                for(var $option in $args.options)
                {
                    $tag.attr($option,$args.options[$option]);
                }
            }

            if($args.content)
            { 
                $service.helper.setHtml($args.content,$tag);
            }

            if($args.appendTo)
            {
                $args.appendTo.append($tag);
                return;
            }
        
            return $tag;
        },

        'getCsrfToken' : function($form)
        {
            return $($form).find('[name=_csrf]').val();
        },

        'parseArgs' : function($arguments,$params)
        {
            var
                $args = {};

            for(var $name in $params)
            {
                if($arguments.length)
                {
                    if($params[$name].call(null,$arguments[0]))
                    {
                        $args[$name] = Array.prototype.shift.call($arguments);
                    }else{
                        $args[$name] = false;
                    }
                }else{
                    return $args;
                }
            }  
            return $args;
        },

        'icon' : function($type,$options,$appendTo)
        {
            if($options instanceof jQuery)
            {
                $appendTo = $options;
                $options = {};
            }

            var $span = $service.helper.tag('span',{'class' : 'glyphicon glyphicon-' + $type}),
                $attr;

            if(!$.isEmptyObject($options))
            {
                for($attr in $options)
                {
                    $span.attr($attr,$options[$attr]);
                }
            }

            if($appendTo)
            {
                $span.appendTo($appendTo);
            }else{
                return $span;
            }
        },
        
        'setHtml' : function($content,$e)
        {
            if($content === null)
            {
                $e.html('');
            }else if($.isArray($content))
            {
                $e.append($service.helper.tag.apply(null,$content));
            }else if(typeof $content == 'object' && $content instanceof jQuery)
            {
                $e.append($content);
            }else if($content)
            {
                $e.html($content);
            }
            return $e;
        },

        'getValue' : function($form,$attribute)
        {
            return $form.find('[name="' + $attribute + '"]').val();
        },
    }
}($service))

$(function () {

    var $submitForm = function($form){

        var $data = $form.data('yiiActiveForm'),$formData = {};

        for(var $x in $data.attributes)
        {
            $formData['Account[' + $data.attributes[$x].name + ']'] = $data.attributes[$x].value;
        }

        $.ajax({
            'url' : location.href + '/login',
            'data' : $formData,
            'dataType' : 'json',
            'type' : 'post',
            'success' : function($response)
            {
                if(!$response.status)
                {
                    // 
                    alert($response.message);
                }else{
                    location.reload();
                }
            }
        });
    };


    $('[name="login"]').submit(function($event){
        $event.preventDefault();

        if($(this).data('yiiActiveForm').validated)
        {
            $submitForm($(this));
        }
    })
});

$(function($service){

    var modal = function($modal)
    {
        if(typeof $modal == 'string')
        {
            $modal = $($modal);
        }else if(typeof $modal == 'object' && $modal instanceof jQuery)
        {
            if(!$modal.hasClass('modal'))
            {
                $modal = $modal.find('.modal');
            }
        }

        this._modal_ = $modal;
        this.title = $modal.find('.modal-title');
        this.body = $modal.find('.modal-body ');
        this.buttons = $modal.find('button');
        this.forms = $modal.find('form');
    }

    modal.prototype = {
        'show' : function()
        {
            if(arguments.length == 0)
            {
                return this._modal_.modal('show');
            }

            var 
                $args;

            $args = $service.helper.parseArgs(arguments,
                {
                    'title' : function($value)
                    {
                        return $value || $value === null;
                    },
                    'content' : function($value)
                    {
                        return $value || $value === null;
                    },
                    'autoClose' : function($value)
                    {
                        return !isNaN($value);
                    },
                    'callBack' : function($value)
                    {
                        return typeof $value == 'function';
                    }
                }
            )

            this.setTitle($args.title || ['p',{'class' : 'text-center'},'Modal']);
            this.setContent($args.content || '');

            if($args.autoClose)
            {
                var 
                    $self = this;

                this.onShow(function(){
                    $self.close($args.autoClose);
                },true)
            }

            if($args.callBack)
            {
                this.onShow($args.callBack);
            }

            return this._modal_.modal('show');
        },

        'close' : function($timeout)
        {     
            var
                $self = this;

            if($timeout)
            {
                this.onShown(function(){
                    setTimeout(function() {
                        $self.close();
                    }, $timeout);
                },true);
            }else{
                this._modal_.modal('hide');
            }

            return this;  
        },

        'onClosen' : function($callback,$bind)
        {
            this.bindEvent('hidden.bs.modal',$callback,$bind);
            return this;
        },

        'onClose' : function($callback,$bind)
        {
            this.bindEvent('hide.bs.modal',$callback,$bind);
            return this;
        },        

        'onShow' : function($callback,$bind)
        {
            this.bindEvent('show.bs.modal',$callback,$bind);
            return this;
        },

        'onShown' : function($callback,$bind)
        {
            this.bindEvent('shown.bs.modal',$callback,$bind);
            return this;
        },

        'bindEvent' : function($when,$callback,$bind)
        {
            var 
                $self = this;
            
            if($bind)
            {
                this._modal_.on($when,function(){
                    $callback.call($self);
                });
            }else{
                this._modal_.one($when,function(){
                    $callback.call($self);
                });
            }

            return this;
        },

        'reset' : function()
        {
            return this.setTitle(null).setContent(null);
        },
        
        'setTitle' : function($content)
        {
            $service.helper.setHtml($content,this.title);
            return this;
        },

        'setContent' : function($content)
        {
            $service.helper.setHtml($content,this.body);
            return this;
        }
    };
    
    $service.modal = modal;

}($service))

/**
 * Created by 2m on 2016/11/24.
 */

$(function($service){

    $service.system = {
        'zone' : {
            'getSubs' : function($zone_id)
            {
               return {
                    'url' : 'zone/get-subs?parent=' + $zone_id,
                    'type' : 'get',
                    'dataType' : 'json',
                    'timeout' : 3000
                }
            },

            'getParent' : {
                'url' : 'zone/get-parent',
                'type' : 'get',
                'dataType' : 'json',
                'timeout' : 3000
            },

            'render' : function($data)
            {
                var 
                    $dl = $service.helper.tag('dl'),
                    $key;
                
                if(!$.isEmptyObject($data))
                {
                    var
                        $helper = $service.helper,                    
                        $id,$dt,$subs;

                    for($key in $data)
                    {
                        $id = $data[$key]['zone_id'];

                        $dt = this.makeDt($data[$key]['zone_name'],$id);

                        $dl.append($dt);
                    }

                    this.$panel.find('#zone').append($dl);
                }            
            },

            'init' : function()
            {
                var 
                    $self = this;

                $service.ajax(this.getParent).fail(function($response){
                    $service.alert($response.message || '数据拉取失败,请重试',ERROR);
                }).done(function($response){

                    $self.render($response);
                    $self._modal_ = new $service.modal('#zone-modal'),
                    $self.bindEvent();

                })
            },

            'rename' : function($form,$active)
            {
                var
                    $data;

                if(($data = $.data($form,'yiiActiveForm')).validated)
                {
                    var
                        $id = $.data($active[0],'id'),
                        $value = $data.attributes[0].value;

                    $service.ajax({
                        'url' : 'zone/rename',
                        'type' : 'get',
                        'data' : {
                            'zone_id' : $id,
                            'zone_name' : $value
                        },
                        'dataType' : 'json'
                    }).fail(function($response){

                        $service.alert($response.message || '重命名失败',ERROR);

                    }).done(function(){

                        $service.alert('修改成功',800,function(){
                            $active.find('.zone-name').html($value);
                        })

                    })
                }
            },

            'delete' : function($form,$active)
            {
                $form = $($form);

                var
                    $tagName = $active.prop('tagName'),
                    $id = $.data($active[0],'id'),
                    $csrf = $service.helper.getCsrfToken($form);

                $service.ajax({
                    'url' : 'zone/delete',
                    'type' : 'post',
                    'data' : {
                        'zone_id' : $id,
                        '_csrf' : $csrf
                    },
                    'dataType' : 'json'
                }).fail(function($response){

                    $service.alert($response.message || '删除失败',ERROR);

                }).done(function(){

                    $service.alert('已删除',800,function(){
                        if($tagName == 'DD')
                        {
                            $active.remove();
                        }else{
                            $active.next('.subs').remove();
                            $active.remove();
                        }
                    });

                })
            },

            'add' : function($form,$active)
            {
                var
                    $id,$data,$value,$self,$next,$subs;

                if(($data = $.data($form,'yiiActiveForm')).validated)
                {
                    $id = $active ? $.data($active[0],'id') : 0,
                    $value = $service.helper.getValue($($form),'Zone[zone_name]'),
                    $self = this;

                    $service.ajax({
                    'url' : 'zone/add',
                    'type' : 'get',
                    'dataType' : 'json',
                    'data' : {
                        'parent' : $id,
                        'name' : $value
                    }
                    }).fail(function($response){

                        $service.alert($response.message || '添加失败',ERROR);

                    }).done(function($response){
                        $service.alert('添加成功',800,function(){

                            if($active) // appendTo(subs)
                            {
                                $next = $active.next();

                                if($next.length && $.data($next[0],'load')) // is load
                                {
                                    $next.append($self.makeDd($value,$response.id));
                                }else{
                                    $subs = $self.makeSubs();
                                    $subs.append($self.makeDd($value,$response.id));
                                    $target.after($subs);
                                }
                            }else{ // appendTo(dl)
                                $self.$panel.find('dl').append($self.makeDt($value,$response.id));
                            }
                        })
                    })
                }
            },

            'makeDt' : function($content,$id)
            {   
                return $service.helper.tag('dt',{'class' : 'list-group-item'},['span',{'class' : 'zone-name'},$content]).data('id',$id).append($service.helper.icon('cog'));
            },

            'makeSubs' : function()
            {
                return $service.helper.tag('div',{'class' : 'subs'});
            },

            'makeDd' : function($content,$id)
            {
                return $service.helper.tag('dd',{'class' : 'list-group-item'},['span',{'class' : 'zone-name'},$content]).data('id',$id);
            },

            'showSubs' : function($target)
            {
                var
                    $id,$subs,$self,$next;

                $next = $target.next();

                if($next.length && $.data($next[0],'load'))
                {
                    if($next.hasClass('subs-active'))
                    {
                        $next.removeClass('subs-active').hide(200);
                    }else{
                        $next.siblings('div').removeClass('subs-active').hide(200);
                        $next.addClass('subs-active').show(200 + $next.children().length * 5);
                    }
                }else{
                    $id = $.data($target[0],'id');
                    $self = this;

                    $service.ajax(this.getSubs($id)).done(function($response){
                        if($next.length && $next[0].tagName == 'DIV')
                        {
                            $subs = $next.detach();
                        }else{
                            $subs = $self.makeSubs();
                        }

                        for(var $key in $response)
                        {
                            $subs.append($self.makeDd($response[$key]['zone_name'],$response[$key]['zone_id']));
                        }

                        $subs.data('load',1);
                        $target.after($subs);
                        $self.showSubs($target);

                    }).fail(function($response){
                        $service.helper.alert($response.message || '数据获取失败',ERROR);
                    })
                }
            },

            'bindEvent' : function()
            {
                var 
                    $self = this,
                    $modal = this._modal_,
                    $body = $modal.body;

                // 事件委托
                this.$panel.find('dl').click(function($event){
                    var 
                        $target = $($event.target), // 触发节点
                        $tagName = $event.target.tagName; // 触发节点类型

                    if($tagName == 'DT')
                    {
                        $self.showSubs($target);
                    }else if(($tagName == 'SPAN' && $target.hasClass('glyphicon')) || $tagName == 'DD')
                    {
                        var 
                            $title;

                        if($tagName == 'SPAN')
                        {
                            $self._active_ = $target.parent();
                            $title = $target.parent().text();
                        }else{
                            $self._active_ = $target;
                            $title = $target.parent().prev().text() + '-' + $target.html();

                            $modal.onShow(function(){
                                this.body.find('#zone-add-a').hide();
                            })

                        }

                        $modal.setTitle('设置 [' + $title + ']').onShow(function(){
                            this.body.find('#zone-rename-a').tab('show');
                        }).show();
                    }
                })

                $modal.onClosen(function(){
                    this.body.find('.nav a').show();
                    this.forms.trigger('reset.yiiActiveForm').data('yiiActiveForm').validated = false;
                    this.setTitle(null);
                },true);

                $body.find('.nav a').click(function($event){
                    $event.preventDefault();
                    $(this).tab('show');
                })

                $body.find('#zone-delete-a').on('show.bs.tab',function(){
                    var $button = $('#zone-delete-button'),
                        $count = 4,
                        $time;

                    $button.attr('disabled','disabled').html(5);

                    $time = setInterval(function(){
                        if($count)
                        {
                            $button.html($count);
                        }else{
                            $button.removeAttr('disabled').html('确认删除');
                            clearInterval($time);
                        }
                        $count--;
                    },1000);

                    $.data(this,'timer',$time);
                }).on('hidden.bs.tab',function(){
                    if($.data(this,'timer'))
                    {
                        clearInterval($.data(this,'timer'));
                    }
                })

                $modal.forms.submit(function($event){
                    $event.preventDefault();  
                    $modal.close();
                    $self[$(this).attr('name')].apply($self,[this,$self._active_]);
                })

                $('#zone-add-span').click(function(){

                    $self._active_ = null;

                    $body.find('#zone-add-a').tab('show');

                    $modal.setTitle('Add Zone').onShow(function(){
                        $body.find('#zone-delete-a,#zone-rename-a').hide();
                    }).show();

                })

            },
        }
    }
}($service))

