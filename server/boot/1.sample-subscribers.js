/**
 *
 *
 * Created by kimjin-young on 2015. 6. 2..
 */

module.exports = function(app) {

  var Subscriber = app.models.Subscriber;

  var subscribers = [
      {id: '01044929591', email: 'jingood1@gmail.com', password: 'c9744052', phone:'01044929591'},
      {id: '01044929592', email: 'jingood2@gmail.com', password: 'c9744052', phone:'01044929592',exchangeEmail: 'jinyoungk@realnetworks.com'},
      {id: '01044929593', email: 'jingood3@gmail.com', password: 'c9744052', phone:'01044929593', exchangeEmail: 'minsooKim@realnetworks.com'},
      {id: '01044929594', email: 'jingood4@gmail.com', password: 'c9744052', phone:'01044929594'},
      {id: '0220145199', email: 'jingood5@gmail.com', password: 'c9744052', phone:'01044929592'}
    ];

  var count = subscribers.length;

    subscribers.forEach(function(subscriber){

      Subscriber.create(subscriber, function(err, instance){
        if(err)
          return console.log(err);

        console.log('Subscriber created:', instance);

        count--;

        if(count === 0)
          console.log('Done');
      })

    });


}
