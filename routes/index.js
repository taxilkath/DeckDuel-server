module.exports = function() {

    /* GET home page. */
    app.get('/', function(req, res, next) {
        res.json({ "status_code": 1, message: 'hooray! welcome to our Node.js rest api with MongoDB database!' });
    });


    app.get('/deletetable', function(req, res, next) {

        db.collection('tbl_room').deleteMany(function(err, result) {

            res.json({ "status_code": 1, message: 'Success' });
        });

    });


    //find and return free server 
    app.get('/chooseServer/:DeviceType/:v', function(req, res, next) {

        var devicetype = req.params.DeviceType || '';
        var version = req.params.v || '';

        db.collection('server_info').findOne(function(err, sinfo) {

            if (!err) {

                res.json({ "status_code": 1, 'info': sinfo, 'fc': config.NEWUSER_FBCHIPS, 'rvchips': config.REWARD_VIDEO_CHIPS });

            } else {

                console.log(err);
                res.json({ "status_code": 0, 'msg': 'could not connect to server, please try again' });
            }
        });
    });





    /* GET home page. */
    app.post('/upp', function(req, res, next) {

        if (!req.files)
            return res.status(400).send('No files were uploaded.');

        if (!req.body.user_id)
            return res.status(400).send('userid missing');


        let pp = req.files.pp;
        var user_id = req.body.user_id;

        try {
            var user_id = objectId(user_id);
        } catch (e) {
            return res.status(400).send('invalid user');
        }
        userSettingCases.getUserData(user_id, function(err, userData) {
            if (userData) {

                if (pp) {

                    var fileExt = pp.name.split('.').pop();
                    var img_path = '/images/profile_pic/' + user_id + '_' + commonClass.GetRandomString(5) + '.' + fileExt;

                    pp.mv('./public' + img_path, function(err) {
                        if (err)
                            return res.status(500).send(err);


                        var upWhere = { $set: { pp: img_path } };
                        userSettingCases.updateUserData(upWhere, user_id, function() {
                            res.json({ "status_code": 1, 'img_path': img_path });
                        });

                    });
                } else {

                    return res.status(400).send('No files were uploaded.');
                }
            } else {
                return res.status(400).send('invalid user');
            }
        });


    });


    /* GET home page. */
    app.get('/:id', function(req, res, next) {

        var id = req.params.id || '';

        if (id) {

            var MobileDetect = require('mobile-detect'),
                md = new MobileDetect(req.headers['user-agent']);


            if (md.os() == 'AndroidOS') {

                console.log('AndroidOS');
                res.redirect('https://play.google.com/store/apps/details?id=com.lakdi.callbreakmultiplayer&referrer=' + id)

            } else {

                console.log('other');
                res.status(500).send({ error: "Ooooooopppppppppppppppps:(" });
            }
        }


    });




    app.post('/maintenance', function(req, res, next) {


        db.collection('server_info').findOne(function(err, sinfo) {

            if (!err) {

                var stime = "2018-09-21 15:00:00";
                var etime = "2018-09-21 16:00:00";

                let moment = require('moment');
                var maintenance_time = moment(stime).format('YYYY-MM-DD HH:mm:ss');
                var current_time = moment().format('YYYY-MM-DD HH:mm:ss');

                var start_date = moment(maintenance_time, 'YYYY-MM-DD HH:mm:ss');
                var end_date = moment(current_time, 'YYYY-MM-DD HH:mm:ss');
                var duration = start_date.diff(end_date);

                console.log(duration);

                // console.log(duration);
                var upWhere = { $set: { "m_stime": stime, "m_etime": etime } };
                db.collection('server_info').update({ _id: sinfo._id }, upWhere);

                // sending to all clients in 'game' room(channel) except sender
                if (duration > 1) {


                    var maintenance_stime = moment(stime).format('YYYY-MM-DD h:mm:ss');
                    var maintenance_etime = moment(etime).format('YYYY-MM-DD h:mm:ss');

                    var start_date = moment(maintenance_stime, 'YYYY-MM-DD HH:mm:ss');
                    var end_date = moment(maintenance_etime, 'YYYY-MM-DD HH:mm:ss');
                    var mduration = end_date.diff(start_date);

                    commonClass.SendDataBroadCast({ 'en': 'MM', 'sc': 1, m_mode: false, 'time': duration, 'mtime': mduration });
                    res.json({ "status_code": 1 });
                } else {
                    res.json({ "status_code": 0 });

                }



            }
        });



    });


}