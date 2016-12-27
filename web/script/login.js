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