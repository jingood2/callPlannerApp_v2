module.exports = function(Attendee) {


    Attendee.listOfNonmember = function(planId,cb) {

        Attendee.find({ where: {and:[{planId: planId},{member:false}]}},
            function(err,listPlans){
                if(err) {
                    console.log(err);
                }
                console.log(listPlans);

                cb(err,listPlans);
        });
    }

    Attendee.remoteMethod(
        'listOfNonmember',
        {
            accepts:
                { arg: 'planId', type: 'string'},
            http: {path: '/listOfNonmember', verb: 'get'},
            returns : { arg: 'listOfNonmember', type: 'array'}
        }

    );

};
