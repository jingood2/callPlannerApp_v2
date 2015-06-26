module.exports = function(Attendee) {


    Attendee.beforeRemote('create', function(ctx, attendee, next) {

      var req = ctx.req;


      if(ctx.req.accessToken) {
        attendee.removeAttribute(attendee.exchangeEmail);
        attendee.removeAttribute(attendee.exchangePassword);
        next();
      } else {
        next(new Error("must be logged in to create plan"));
      }

    });


    Attendee.beforeRemote('create', function(ctx, affectedModelInstance, next) {

        // is a member ?
        // has a exchange account ?

        var app = Attendee.app;

        console.log(affectedModelInstance);

        next();

    });

    Attendee.afterRemote('create', function(ctx, affectedModelInstance, next) {

        next();

    });
};
