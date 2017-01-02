// Cache at {time}
function zeCache() {
    var z = {z},
        e = {e};

    return {
        'getParent': function () {
            var
                parent = [];
            
            for (var key in z) {
                parent.push({ 'zone_id': key, 'zone_name': z[key]['zone_name'] });
            }

            return parent;
        },
        'getSubs': function (parent) {
            return z[parent]['subs'];
        },
        'getEvents': function (zid) {
            if (!zid) {
                var
                    event = [];
                
                for (var key in e) {
                    event.push({ 'event_name': e[key]['event_name'], 'event_id': key });
                }

                return event;
            } else {
                return z[zid]['events'];
            }
        },
        'getZones': function (eid) {
            
        }
    };
}

