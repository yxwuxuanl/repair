/**
 * Created by 2m on 2017/3/22.
 */


function make()
{
    var
        strName = '仰约页,艾草花,万玉山,郭孟川,淳于扉飞,谷垒彤,季夏青,韦丽红,张露轩,娄巍巍,尉迟早即,罗辉,向怿林,芮行,黄敬铭,吴宣萱,索尤美,幸子茜,全泉仪,卫时宁,孙鹏,赫连筱雪,郝彦芳,农清绵,邓穗亭,任秋梦,诸葛灵儿,上官云归,龙舒元,王政泽,蔚金蓓,郭雪敏,宁清华,段爱苹,翁瑞虎,公芳,林子晴,裴浩然,储山均,解栋,屈友香,井佳伊,桑凡,居凡清,宰挚翔,敖苒,诸品灼,盛俊廷,司徒碧珊,段惠莲,江媛宪,容鹭,东麟坤,武官正,师美玲,咸三才,党育,满格来,元中华,洪艺',
        arrName = strName.split(',');

    for(var i = 0 ; i < arrName.length ; i++)
    {
        (function(name){
            $.ajax({
                'url': 'http://repair.com/account/add',
                'data' : {
                    'accountName' : name
                }
            }).done(function(){
                C('已创建 ' + name);
            })
        })(arrName[i]);
    }
}

setTimeout(function(){
    make();
},500);