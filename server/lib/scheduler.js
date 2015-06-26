/**
 *
 * Created by kimjin-young on 2015. 6. 24..
 */

var Agenda = require('agenda');
var request = require('request');
var app = require('../server');
var _ = require('underscore');
var db = require('../datasources.development.js');

var connectionOpts = db.mongoDS.host + ':' + db.mongoDS.port + '/' + db.mongoDS.database;
var agenda = new Agenda({db: {address: connectionOpts }});

exports.planStartAt = (function(repeat,scheduledAt) {

    var startDate = scheduledAt;
    var whichday;

    console.log('scheduledAt : %s min:%s hour:%s day:%s', startDate, startDate.getMinutes(),startDate.getHours(),startDate.getDate());

    switch(repeat) {

        case 'none' :
            return scheduledAt;
        case 'daily' :
            format = startDate.getMinutes() + ' ' + startDate.getHours() + ' ' + '* * *';
            console.log(format);
            return format;

        case 'weekly' :
            format = startDate.getMinutes() + ' ' + startDate.getHours() + ' ' + '* * ' + startDate.getDay();
            console.log(format);
            return format;

        case 'monthly' :
            format = startDate.getMinutes() + ' ' + startDate.getHours() + ' ' + startDate.getDate() + ' ' +  '* *';
            console.log(format);
            return format;

        default :
            return scheduledAt;
    }


});


exports.addPlanJob = function(jobName, data) {

    if(data.enabled == false) {
        console.log('disabled planCall id : ' + data.id);
        return;
    }

    agenda.define(jobName, function(job,done){

        var reqBody;
        var ment = '';
        var recordFilename;

        if(job.attrs.data.ment.file)
            ment = 'ments/' + job.attrs.data.ment.container + '/' + job.attrs.data.ment.file;

        recordFilename = new Date().toISOString() + '.wav';
        console.log('recordFile :' + recordFilename);

        // ToDo : Find Free conference call number
        //        Now this conference call number used by jobName


        reqBody = {
            "method" : "INIT",
            "id": jobName,                      // jobName -> Free conference call number
            "record": job.attrs.data.record,
            "recordFilename" : recordFilename,
            "callType" : job.attrs.data.callType,
            "greetingAnn" : ment,
            "attendants" : job.attrs.data.attendees };

        console.log(JSON.stringify(reqBody));

        request({
            url: "http://221.146.204.182:9087/FamilyCallCore/FamilyCallHttpServlet",
            method: "POST",
            json: true,
            body: reqBody
        }, function( error, response, body ) {

            var calledAt = new Date();

            // ToDo : app.models.History is written when Call is terminated.
            app.models.History.create({
                planId: job.attrs.data.id,
                plannerId: job.attrs.data.plannerId,
                planInfo : {
                    'title': job.attrs.data.title,
                    'enabled': job.attrs.data.enabled,
                    'callType': job.attrs.data.callType,
                    'record': job.attrs.data.record,
                    'recordFilename' : recordFilename,
                    'ment': job.attrs.data.ment,
                    'scheduledAt': job.attrs.data.scheduledAt,
                    'repeat': job.attrs.data.repeat,
                    'attendees': job.attrs.data.attendees},
                planCalledAt : calledAt,
                result : 200},function(err,obj) {

                if(error) {
                    console.log(err);
                }
            });


            if(!error && response.statusCode == 200) {

                var calledAt = new Date();

                // ToDo : app.models.History is written when Call is terminated.
                app.models.History.create({
                    planId: job.attrs.data.id,
                    plannerId: job.attrs.data.plannerId,
                    planInfo : {
                        'title': job.attrs.data.title,
                        'enabled': job.attrs.data.enabled,
                        'callType': job.attrs.data.callType,
                        'record': job.attrs.data.record,
                        'recordFilename' : recordFilename,
                        'ment': job.attrs.data.ment,
                        'scheduledAt': job.attrs.data.scheduledAt,
                        'repeat': job.attrs.data.repeat,
                        'attendees': job.attrs.data.attendees},
                    planCalledAt : calledAt,
                    result : response.statusCode},function(err,obj) {

                    if(error) {
                        console.log(err);
                    }
                });

            }
        });     //request

        done();

    }); // agenda define

    var job = agenda.create(jobName,data);
    job.attrs.type = 'single';

    // run job for planId
    if(data.repeat == 'once') {
        job.schedule(this.planStartAt(data.__data.repeat,data.__data.scheduledAt));
    } else {
        job.repeatEvery(this.planStartAt(data.__data.repeat,data.__data.scheduledAt));


    }

    job.save(function(err) {
        if(err) {
            console.log('SaveJob Error :' + err);
        }
    });

    agenda.start();

}

exports.removePlanJob = function(jobName) {

    agenda.cancel({name: jobName}, function(err, numRemoved) {
        if(!err) console.log('[removePlanJob] planJob is removed' + numRemoved);
    });
}

exports.removePlanJobArray = function(jobArray) {

    _.each(jobArray,function(job){
        agenda.cancel({name: job}, function(err, numRemoved) {
            if(!err) console.log('[removePlanJobArray] planJobs are removed' + numRemoved);
        });

    });
}
