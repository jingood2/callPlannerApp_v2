// require 'server.js' as you would mormally do in any node.js app
//var app = require('../../server/server');

module.exports = function(Plan) {

  // get planList
  Plan.listPlans = function(request, cb) {

    var app = Plan.app;
    var attendee = app.models.Attendee;

    var tel = '0' + request.accessToken.userId;

    attendee.find({
      include: 'plan', where: {tel: tel}
    },function(err,listPlans){
      if(err) {
        console.log(err);
      }
      console.log(listPlans);

      cb(err,listPlans);
    });

  }

  Plan.remoteMethod(
    'listPlans',
    {
      accepts: { arg: 'request', type: 'object', http:{source: 'req'}},
      http: {path: '/listPlans', verb: 'get'},
      returns : { arg: 'listPlans', type: 'array'}
    }

  );
};
