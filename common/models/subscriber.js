module.exports = function(Subscriber) {

    Subscriber.beforeRemote('create', function(ctx, user, next){

        var req = ctx.req;

        req.body.id = req.body.phone;

        console.log('userId :' + req.body.id);
        next();

    });
};
