/**
 * Created by 2m on 2017/3/21.
 */

function make()
{
    for(var i = 0 ; i <= 20 ; i++)
    {
        (function(i){
            var
                parentName = 'Zone-' + String.fromCharCode(65 + i);

            $.ajax({
                'url': 'http://repair.com/zone/add',
                'data' : {
                    'name' : parentName
                }
            }).done(function (response) {
                C('已创建 -> ' + parentName);
                createChild(response.content[0], parentName);
            });
        })(i);
    }
}

function createChild(id,name)
{
    for(var j = 0 ; j <= 15 ; j++)
    {
        (function(id,name){
            var
                childName = name + j;

            $.ajax({
                'url': 'http://repair.com/zone/add',
                'data' : {
                    'name' : childName,
                    'parent' : id
                }
            }).done(function () {
                C('已创建 -> ' + childName);
            });
        })(id,name);
    }
}

setTimeout(function(){
    make();
},500);