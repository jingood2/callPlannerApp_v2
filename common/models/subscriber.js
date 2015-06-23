module.exports = function(Subscriber) {

  Subscriber.observe('after delete', function(ctx,next){

    var app = Subscriber.app;

    app.models.Plan.destroyAll({ownerId:  ctx.where.id},function(err,info){

      if(err) console.stack(err);

      console.log('deleted Plan count :' + info.count);

    });

    next();

  })
};
