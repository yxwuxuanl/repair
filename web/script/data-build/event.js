/**
 * Created by 2m on 2017/3/21.
 */

function make()
{
    for(var i = 0 ; i <= 60 ; i++)
    {
        (function(i){
            var
                eventName = '事件' + i;

            $.get('http://repair.com/event/add?eventName=' + eventName).done(function(){
                C('已创建' + eventName);
            });
        })(i);
    }
}

setTimeout(function(){
    make();
},100);