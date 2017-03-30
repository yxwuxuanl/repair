/**
 * Created by 2m on 2017/3/22.
 */


function make()
{
    var
        strName = '仰约页,艾草花,万玉山,郭孟川,淳于扉飞,谷垒彤,季夏青,韦丽红,诸品灼,盛俊廷,司徒碧珊,段惠莲,江媛宪,容鹭,东麟坤,武官正,师美玲,咸三才,党育,满格来,元中华,洪艺',
        arrName = strName.split(',');

    for(var i = 0 ; i < arrName.length ; i++)
    {
        (function(name){
            $.ajax({
                'url': 'http://repair.com/account/add',
                'data' : {
                    'accountName' : name
                }
            }).done(function(response){
                C('已创建 ' + name);
            })
        })(arrName[i]);
    }
}

setTimeout(function(){
    make();
},500);