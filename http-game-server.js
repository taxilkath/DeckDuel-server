express = require("express");
app = express();

const fileUpload = require('express-fileupload');
app.use(fileUpload());

const http = require('http').Server(app);
const url = require('url');
const path = require('path');
const bodyParser = require('body-parser')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/public'));


const mongod = require('mongodb')
objectId = module.exports = require('mongodb').ObjectID;
schedule = module.exports = require('node-schedule');
moment = module.exports = require('moment');

// Load environment variables
require('dotenv').config();

// Configuration object using environment variables
config = module.exports = {
    SERVER_PREFX: process.env.SERVER_PREFX,
    logEnabled: process.env.LOG_ENABLED === 'true',
    LocalIP: process.env.LOCAL_IP,
    SERVER_PORT: parseInt(process.env.SERVER_PORT),
    DB_HOST: process.env.DB_HOST,
    DB_PORT: parseInt(process.env.DB_PORT),
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    "DB-PASSWORD": process.env.DB_PASSWORD,
    BASE_URL: process.env.BASE_URL,
    ENCRYPT_KEY: process.env.ENCRYPT_KEY,
    ENCRYPT_IV: process.env.ENCRYPT_IV,
    PER_TABLE_PLAYER: parseInt(process.env.PER_TABLE_PLAYER),
    NEWUSER_CHIPS: parseInt(process.env.NEWUSER_CHIPS),
    NEWUSER_COINS: parseInt(process.env.NEWUSER_COINS),
    NEWUSER_FBCHIPS: parseInt(process.env.NEWUSER_FBCHIPS),
    GAME_START_SERVICE_TIMER: parseInt(process.env.GAME_START_SERVICE_TIMER),
    GAME_START_SERVICE_TIMER_D: parseInt(process.env.GAME_START_SERVICE_TIMER_D),
    GAME_FIRST_BID_TIMER: parseInt(process.env.GAME_FIRST_BID_TIMER),
    GAME_SECOND_BID_TIMER: parseInt(process.env.GAME_SECOND_BID_TIMER),
    GAME_TURN_TIMER: parseInt(process.env.GAME_TURN_TIMER),
    GAME_TURN_TIMER_D: parseInt(process.env.GAME_TURN_TIMER_D),
    GAME_WIN_TIMER: parseInt(process.env.GAME_WIN_TIMER),
    ROBOT_ADD_TIMER: parseInt(process.env.ROBOT_ADD_TIMER)
};
_ = module.exports = require('lodash');
request = module.exports = require('request');
ecClass = module.exports = require('./classes/eventCases.Class.js');
commonClass = module.exports = require('./classes/commonCases.Class.js');
signupClass = module.exports = require('./classes/signupCases.Class.js');
tablesManager = module.exports = require('./classes/tablesManagerCases.Class.js');
chipsTrackerCases = module.exports = require('./classes/chipsTrackerCases.Class.js');
chipStoreCases = module.exports = require('./classes/chipStoreCases.Class.js');
friendsCases = module.exports = require('./classes/friendsCases.Class.js');
coinStoreCases = module.exports = require('./classes/coinStoreCases.Class.js');
userSettingCases = module.exports = require('./classes/userSettingCases.Class.js');
timerClass = module.exports = require('./classes/timerCases.Class.js');
playingCases = module.exports = require('./classes/playingCases.Class.js');
notificationCases = module.exports = require('./classes/notificationCases.Class.js');
// autoCases = module.exports = require('./classes/autoCases.Class.js');
cardClass = module.exports = require('./classes/cardCases.Class.js');



/* ======================================================
 			socket.io Handler
   ====================================================*/

io = module.exports = require('socket.io')(http);

// io.set("transports", ["xhr-polling","websocket","polling"]);
// io.set('heartbeat timeout', 4000); 
// io.set('heartbeat interval', 2000);

io.sockets.on('connection', function(socket) {
    // console.log('client connect');
    ecClass.bind(socket);
});




/*======================================================
            Logger Defination
======================================================*/

printLog = module.exports = function(logData) {
    if (config.logEnabled) {
        if (logData != "") {
            console.log("**logData**");
            console.log(logData);
            console.log("**logData**");
        }
    }
};




/*======================================================
            mongodb conection
=======================================================*/
var MongoClient = mongod.MongoClient;


var databaseURL = 'mongodb://' + config.DB_HOST + ':' + config.DB_PORT + '/' + config.DB_NAME


MongoClient.connect(databaseURL, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, database) {
    if (err) {
        printLog(err);
    } else {
        console.log('conection done::', databaseURL)
        db = module.exports = database.db(config.DB_NAME);
        db.collection('game_users').updateMany({ is_robot: true }, { $set: { status: 0 } });

        db.collection('game_users').updateMany({ is_robot: true }, { $set: { status: 0 } });

        // db.collection('game_users').
        // find({}).
        // project( { uid:1 }).
        // forEach(function(e) {

        //     friendsCases.insertFreind(e._id);

        // });
    }
});




require('./routes/index.js')();





http.listen(config.SERVER_PORT, function() {
    console.log("Listening on " + config.SERVER_PORT);
});