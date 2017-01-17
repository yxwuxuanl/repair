var
    a = {
        b: {
            'say': function () {
                console.log(this);
            }
        }
    }

a.b.say();