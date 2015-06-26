/**
 *
 * Created by kimjin-young on 2015. 6. 24..
 *
 */

module.exports = function(repeat,scheduleAt) {

    return {

        excuteAt: function() {
            console.log('scheduledAt : %s min:%s hour:%s day:%s', scheduleAt, scheduleAt.getMinutes(),scheduleAt.getHours(),scheduleAt.getDate());

            switch(repeat) {

                case 'none' :
                    return scheduleAt;
                case 'daily' :
                    format = scheduleAt.getMinutes() + ' ' + scheduleAt.getHours() + ' ' + '* * *';
                    console.log(format);
                    return format;

                case 'weekly' :
                    format = scheduleAt.getMinutes() + ' ' + scheduleAt.getHours() + ' ' + '* * ' + scheduleAt.getDay();
                    console.log(format);
                    return format;

                case 'monthly' :
                    format = scheduleAt.getMinutes() + ' ' + scheduleAt.getHours() + ' ' + scheduleAt.getDate() + ' ' +  '* *';
                    console.log(format);
                    return format;

                default :
                    return scheduleAt;
            }
        }
    }

};
