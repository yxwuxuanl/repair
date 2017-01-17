$(function($service){

    var modal = function(modal)
    {
        if(typeof modal == 'string')
        {
            modal = $(modal);
        }else if(modal instanceof jQuery)
        {
            if(!modal.hasClass('modal'))
            {
                modal = modal.find('.modal');
            }
        }

        this.$modal = modal;
        this.$title = modal.find('.modal-title');
        this.$body = modal.find('.modal-body');
    }

    modal.prototype = {
        'show' : function()
        {
            if(arguments.length == 0)
            {
                return this.$modal.modal('show');
            }

            var 
                args;

            args = $service.$helpers.args(arguments,
                {
                    'title': [
                        function (value) {
                            return typeof value == 'object' || typeof value == 'string';
                        },'Modal'
                    ],
                    'content': [
                        function (value) {
                            return typeof value == 'object' || typeof value == 'string';
                        },null
                    ],
                    'autoClose' : function(value)
                    {
                        return !isNaN(value);
                    }
                }
            )

            this.setTitle(args.title).setContent(args.content);

            if(args.autoClose)
            {
                this.close(args.autoClose);
            }

            this.$modal.modal('show');
            return this;
        },

        'close' : function(timeout)
        {     
            var
                self = this;

            if(timeout)
            {
                this.onShown(function(){
                    setTimeout(function() {
                         self.close();
                    }, timeout);
                });
            }else{
                this.$modal.modal('hide');
            }

            return this;  
        },

        'onClosen' : function(callback,bind)
        {
            this.bindEvent('hidden.bs.modal',callback,bind);
            return this;
        },

        'onClose' : function(callback,bind)
        {
            this.bindEvent('hide.bs.modal',callback,bind);
            return this;
        },        

        'onShow' : function(callback,bind)
        {
            this.bindEvent('show.bs.modal',callback,bind);
            return this;
        },

        'onShown' : function(callback,bind)
        {
            this.bindEvent('shown.bs.modal',callback,bind);
            return this;
        },

        'bindEvent' : function(when,callback,bind)
        {
            var 
                self = this;
            
            if(bind)
            {
                this.$modal.on(when,function(){
                    callback.call(self);
                });
            }else{
                this.$modal.one(when,function(){
                    callback.call(self);
                });
            }

            return this;
        },

        'reset' : function()
        {
            return this.setTitle().setContent();
        },
        
        'setTitle' : function(content)
        {
            $service.$helpers.setContent(this.$title,content);
            return this;
        },

        'setContent' : function(content)
        {
            $service.$helpers.setContent(this.$body,content);
            return this;
        }
    };
    
    $service.addHelper('modal', modal);

}($service))