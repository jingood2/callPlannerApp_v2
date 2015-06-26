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

};
