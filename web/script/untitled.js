   'watchDl' : function()
            {
                var 
                    _this = this;

                // 事件委托
                this.$panel.find('dl').click(function(event){
                    var 
                        $target = $(event.target), 
                        tagName = event.target.tagName;

                    if(tagName == 'DT')
                    {
                        // $self.showSubs($target);

                        var
                            $next = $target.next();

                        if(!$next.length || $.data($next[0],'loda'))
                        {

                            var
                                index = $target.index();
                                id = $.data($target.parent()[0],'ids')[index];

                            C(id);
                            // this.renderDd();
                        }



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


/*
                $modal.onClosen(function(){
                    this.body.find('.nav a').show();
                    this.forms.trigger('reset.yiiActiveForm').data('yiiActiveForm').validated = false;
                    this.setTitle(null);
                },true);

                $body.find('.nav a').click(function(event){
                    event.preventDefault();
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

                $modal.forms.submit(function(event){
                    event.preventDefault();  
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
*/
            },