module.exports = function(Subscriber) {

    Subscriber.beforeRemote('create', function(ctx, user, next){

        var req = ctx.req;
        req.body.id = req.body.tel;
        next();

    });

    Subscriber.afterRemote('delete', function(ctx,user,next){

        var app = Subscriber.app;

        app.models.Plan.deleteById({where: {id: {inq: user.id}}},function(err,result) {

            next();
        });

    })
};
