// require 'server.js' as you would mormally do in any node.js app
//var app = require('../../server/server');
var _ = require('underscore');

module.exports = function(Plan) {

  /*
   * custom REST API
   */
  // get planList
  Plan.listPlans = function(request, cb) {

    var app = Plan.app;
    var attendee = app.models.Attendee;

    var tel = request.accessToken.userId;

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

  // request handler function
  Plan.callPlan = function(request, cb) {

    var app = Plan.app;
    var plan = request;
    var Subscriber = app.models.Subscriber;
    var attendeeTels = [];
    var response;

    Plan.create(plan,function(err,planObj){

      // before create job
      var listAttendee = [];

      if(err) return console.trace(err);

      attendees = planObj.__data.attendees;

      attendees.forEach(function(attendee){
        attendee.planId = planObj.id;
        listAttendee.push(attendee.tel);

      });

      // find exchange email for member from Subscriber
      Subscriber.find({where: {id: {inq: listAttendee }}}, function(err, subsObj) {

        if(err) {

          // ToDo: rollback created Plan
          return console.trace(err);
        }

        attendees.forEach(function(attendee){
          attendee.planId = planObj.id;

          subsObj.forEach(function(sub){
            if(sub.id === attendee.tel) {
              attendee.member = true;
              attendee.exchangeEmail = sub.exchangeEmail;
            }
          });
        });

        // add members included in the plan to attendee

        app.models.Attendee.create(attendees, function(err,attendObj){
          if(err) {
            // ToDo: rollback created Plan

            return console.log(err);
          }

          for(var i = 0; i < attendObj.length; i++) {
            planObj.attendees[i].id = attendObj[i].id;
          }

        });

        response = planObj;
        cb(null, response);
      });

    });


  } // remote method

  Plan.remoteMethod(
    'callPlan',
    {
      accepts: { arg: 'data', type: 'object', http:{source: 'body'}},
      http: {path: '/callPlan', verb: 'post'},
      returns :
        { arg: 'plan', type: 'array'}
    }

  );


  /*
   * remote hook session
   */
  Plan.beforeRemote('callPlan', function(ctx, affectedModelInstance, next) {

    var req = ctx.req;

    if(ctx.req.accessToken) {
      // set FK for subscriber
      req.body.ownerId = req.accessToken.userId;
      next();
    } else {
      next(new Error("must be logged in to create plan"));
    }

  });

  Plan.afterRemote('callPlan', function(ctx,affectedModelInstance, next){

    // ToDo
    next();

  });

  Plan.afterRemoteError('callPlan', function(ctx,affectedModelInstance, next){

  });

  Plan.beforeRemote('create', function(ctx, affectedModelInstance, next) {

    var req = ctx.req;

    console.log('[beforeRemote] Plan create..')

    if(ctx.req.accessToken) {
      // set FK for subscriber
      req.body.ownerId = req.accessToken.userId;
      next();
    } else {
      next(new Error("must be logged in to create plan"));
    }

  });

  Plan.afterRemote('create', function(ctx, affectedModelInstance, next) {

    var req = ctx.req;
    console.log('[afterRemote] Plan create..');
    next();

  });

  Plan.observe('before save', function updateTimestamp(ctx, next){

    if(ctx.isNewInstance) {

      //ctx.data.modified = new Date();
      console.log('[Operation hook] before created..'  );
    }else {
      ctx.data.modified = new Date();
      //console.log('[Operation hook]before update : %s', planJobName);
    }
    next();

  });

  // The after save hook is called after a model change was successfully persisted to the datasource.
  Plan.observe('after save', function(ctx,next){

    var app = Plan.app;
    var subsObj, attendObj;

    if (ctx.isNewInstance) {
      var listAttendee = [];
      var Subscriber = app.models.Subscriber;

      console.log('Saved %s#%s', ctx.Model.modelName, ctx.instance.id);

      attendees = ctx.instance.__data.attendees;

      ctx.instance.__data.attendees.forEach(function(attendee){
        attendee.planId = ctx.instance.id;
        listAttendee.push(attendee.tel);
      });

      // find exchange email for member from Subscriber
      Subscriber.find({where: {id: {inq: listAttendee }}}, function(err, subsObj) {

        if(err) return console.trace(err);

        // only callPlanner member
        attendees.forEach(function(attendee){

          // ToDo : need to modified by underscore
          subsObj.forEach(function(sub){
            if(sub.id === attendee.tel) {
              attendee.member = true;
              attendee.exchangeEmail = sub.exchangeEmail;
            }
          });
        });

        app.models.Attendee.create(attendees, function(err,attendObj){

          if(err) return console.log(err);

          console.log(attendObj);

        });

        //ctx.result = attendObj;
        next();

      });

    } else {

      if(ctx.instance){

        /*
        app.models.Attendee.createUpdates(ctx.instance.__data.attendees,function(err,objs){

          // attendee 업데이트시에는 반드시 attendee id를 포함해서 갱신요청해야 함.
          if(err) {
            // ToDo: how updating attendee is failed ?
            return console.log(err);
          }
          console.log('updated attendees:' + objs);
        });
        */
      }

      next();
    }

  });

};
