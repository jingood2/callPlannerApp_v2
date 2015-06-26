
var _ = require('underscore');
var scheduler = require('../../server/lib/scheduler.js');

module.exports = function(Subscriber) {


  Subscriber.observe('after delete', function(ctx,next){

    var app = Subscriber.app;
    var planId;

    app.models.Plan.find({where: {ownerId: ctx.where.id}},function(err,records){
      _.each(records,function(record){
        app.models.Plan.destroyById(record.id,function(err){

          if(err) console.stack(err);

          console.log('deleted Plan(%s) count ', record.id);
        });

      });
    });

    next();

  })
};
