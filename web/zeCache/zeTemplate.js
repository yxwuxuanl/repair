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
            
        },
        'getZones': function (eid) {
            
        }
    };
}

