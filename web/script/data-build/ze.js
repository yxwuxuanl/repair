/**
 * Created by 2m on 2017/3/21.
 */


function make() {
    var
        events, zones;

    $.ajax({
        'url': 'http://repair.com/event/get-events',
        'type': 'get',
        'async': false
    }).done(function (response) {
        events = response.content;
    });

    $.ajax({
        'url': 'http://repair.com/zone/get-parent',
        'type': 'get',
        'async': false
    }).done(function (response) {
        zones = response.content;
    });

    for (var i = 0; i < zones.length; i++)
    {
        var
            zone = zones[i]['zone_id'],
            x = 0;

        for(var j = 0 ; j < events.length ; j++)
        {
            if((Math.random()*(5-1)+1) > 3)
            {
                (function(zone,event){
                    addMap(zone,event);
                })(zone,events[j]['event_id']);
                x++;
            }

            if(x == 21)
            {
                break;
            }
        }
    }
    C('Done!');
}

function addMap(zone,event)
{
    $.ajax({
        'url': 'http://repair.com/zone/add-event',
        'type': 'get',
        'data' : {
            'eventId' : event,
            'zoneId' : zone
        }
    }).done(function () {
        C('建立了 ' + event + '->' + zone);
    });
}



setTimeout(function(){
    make();
},100);