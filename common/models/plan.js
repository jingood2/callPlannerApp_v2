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
    var tel;

    tel =  request.accessToken.userId;

    attendee.find({
      include: 'plan', where: {userId: tel}
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
    var response;

    Plan.create(plan,function(err,planObj){

      // before create job
      var attendeeTels = [];

      if(err) return console.trace(err);

      attendees = planObj.__data.attendees;

      attendees.forEach(function(attendee){

        attendeeTels.push(attendee.tel);

      });

      console.log(attendeeTels);

      // find exchange email for member from Subscriber
      Subscriber.find({where: {id: {inq: attendeeTels }}}, function(err, subsObj) {

        if(err) {
          // ToDo: rollback created Plan
          return console.trace(err);
        }

        _.each(subsObj, function(sub){
          _.each(attendees, function(attendee) {
            attendee.planId = planObj.id;
            if (sub.tel === attendee.tel) {
              attendee.userId = sub.id;
              attendee.exchangeEmail = sub.exchangeEmail;
              attendee.exchangePassword = sub.exchangePassword;
            }
          });
        });

        console.log(attendees);

        /*
        attendees.forEach(function(attendee){
          attendee.planId = planObj.id;

          subsObj.forEach(function(sub){
            if(sub.id === attendee.tel) {
              attendee.member = true;
              attendee.exchangeEmail = sub.exchangeEmail;
            }
          });
        });
        */

        // add members included in the lan to attendee

        app.models.Attendee.create(attendees, function(err,attendObj){
          if(err) {
            // ToDo: rollback created Plan

            return console.log(err);
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
      req.body.ownerId = req.body.id;
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
      console.log('[beforeRemote] ownerId: ' + req.body.ownerId);
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

    var app = Plan.app;
    var subsObj, attendObj;

    if(ctx.isNewInstance) {


    }else {
      console.log('[Operation hook]before update.');

      /*
      var attendees = ctx.instance.__data.attendees;

      if(attendees){

        if(Array.isArray(attendees)) {

          app.models.Attendee.createUpdates(attendees,function(err,result){

            if(err) console.stack(err);

            console.log(result);

          });

        } else {

        }

      }
      */
    }
    next();

  });

  // The after save hook is called after a model change was successfully persisted to the datasource.
  Plan.observe('after save', function(ctx,next){

    var app = Plan.app;
    var Subscriber = app.models.Subscriber;

    if(ctx.isNewInstance) {



    }else {
      console.log('Updated %s matching', ctx.Model.pluralModelName);

      var array1 = [];

      var attendees = ctx.instance.__data.attendees;

      _.each(attendees,function(record){
        array1.push(record.tel);
      });

      if(attendees){

        if(Array.isArray(attendees)) {

          console.log(array1);

          app.models.Attendee.destroyAll({where: {tel: array1}},function(err,info){

            if(err) console.stack(err);

            console.log(info);

          });

        } else {

        }

      }

    }
    next();

  });

};
