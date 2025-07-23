module.exports = {
	getDefaultFields:function(data, socket, callback){
		var ud = {
			chips:(typeof data.chips == 'undefined') ? 0 : data.chips, 
			type :(typeof data.type == 'undefined') ? '' : data.type,
			ct :(typeof data.ct == 'undefined') ? 'chips' : data.ct,//currency type chips, coins
			msg :(typeof data.msg == 'undefined') ? '' : data.msg,
			uid :(typeof data.uid == 'undefined') ? '' : data.uid,
			createdOn: new Date()
		};
		callback(ud);
	},
	insert:function(data,socket,callback){

		printLog()

		chipsTrackerCases.getDefaultFields(data, socket, function(tData){

			var userData = tData;
			db.collection('game_chips_tracker').insertOne(userData,callback);

		});
	},

	insertMany:function(data,socket,callback){
		db.collection('game_chips_tracker').insertMany(data,callback);
	},
	roomUserChipsCut:function(RoomInfo, chips, socket){
		
		var ctinfo = [];
		for (var i = 0; i < config.PER_TABLE_PLAYER; i++) {

			var info = {
				chips : chips,
				type : 'debit',
				msg : 'Game boot value debit',
				uid : RoomInfo['s'+i].uid,
				createdOn: new Date()
			};

			ctinfo.push(info);
		};
		chipsTrackerCases.insertMany(ctinfo,socket);
	},
	CH:function(data, socket){

		var en = data.en;
		if(typeof data.data == 'undefined'){
			commonClass.SendData({'Message' : 'CH request is not in data object', 'en':data.en, 'sc':0}, socket.id);
			return false;
		}
		var data=data.data;
		data['en']=en;


		if(typeof data.user_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'CH user_id is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		var user_id = objectId(data.user_id);


		db.collection('game_chips_tracker').find({uid: user_id}).limit(100).sort({createdOn:-1}).toArray(function(err, result) {
		    if (err) printLog('err1'); printLog(err);
			commonClass.SendData({'data':result,'en':data.en, 'sc':1}, socket.id);

		});
	}
	
}