module.exports = {
	NL:function(data, socket){

		var en = data.en;

		if(typeof data.data == 'undefined'){
			commonClass.SendData({'Message' : 'NL request is not in data object', 'en':data.en, 'sc':0}, socket.id);
			return false;
		}

		var data=data.data;
		data['en']=en;


		if(typeof data.user_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'NL user_id is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		if(typeof data.uid == 'undefined'){
			commonClass.SendData({ 'Message' : 'NL uid is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}
		

		var user_id = objectId(data.user_id);
		
 		userSettingCases.userFindUpdate({$set: { "counters.urmsg": 0}}, user_id );


		db.collection('game_notification').aggregate([
		{ 
            $match : {
				to : { $in:  [data.uid] }
 			}
        },
	   	{
		    $lookup:{
		        from: "game_users",
		        localField: "from",
		        foreignField: "_id",
		        as: "user_data"
		    }
		},  
		{
	      	$project:{
	            from:1,
	            chips:1,
		        uid:1,
		        at:1,
		        status:1,
		        msg:1,
		        type:1,
		        "user_data.pp":1,
		        "user_data.un":1,
	        }
		},
		{ 
			$unwind: "$user_data" 
		},
		{
			$sort:{ 
				at:-1
			}
		}
		]).toArray(function(err, result){

			commonClass.SendData({data:result, 'en':data.en, 'sc':1}, socket.id);//game score

		});
	},
	NC:function(data, socket){

		var en = data.en;

		if(typeof data.data == 'undefined'){
			commonClass.SendData({'Message' : 'NC request is not in data object', 'en':data.en, 'sc':0}, socket.id);
			return false;
		}

		var data=data.data;
		data['en']=en;


		if(typeof data.user_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'NC user_id is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}
		

		var user_id = objectId(data.user_id);

		db.collection('game_users').findOne({_id: objectId(data.user_id)},function(err, user_data){


			friendsCases.getOnlineFriendCount(user_id,function(err, result){

				var online = (result.length > 0) ? result[0].online : 0;

				var urmsg = (user_data.counters.urmsg===undefined) ? 0 : user_data.counters.urmsg;
				commonClass.SendData({urmsg:urmsg, online:online, 'en':data.en, 'sc':1}, socket.id);//game score
			})

		})
	},
	SM:function(data, socket){

		printLog('sm called');
		var en = data.en;
		if(typeof data.data == 'undefined'){
			commonClass.SendData({'Message' : 'SM request is not in data object', 'en':data.en, 'sc':0}, socket.id);
			return false;
		}
		var data=data.data;
		data['en']=en;


		if(typeof data.user_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'SM user_id is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		if(typeof data.other_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'SM other_id  is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		if(typeof data.msg == 'undefined'){
			commonClass.SendData({ 'Message' : 'SM msg is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}


		var user_id = objectId(data.user_id);
		var other_userid = data.other_id;
		var msg = data.msg;




		var otherId = objectId(other_userid); 
		userSettingCases.getUserData(otherId, function(err,userdata){

			if(userdata){

					var info = {
						'from' : user_id,
						'to' : [userdata.uid],
						'type' : 'MSG',
						'msg': msg,
						'status': 0,
						'at': new Date()
					};

				db.collection('game_notification').insertOne(info);

				db.collection('game_users').findOneAndUpdate({uid: userdata.uid},{$inc:{"counters.urmsg":1}},{returnOriginal:false}, function(err, user_data){

		 			if(user_data.value){

		 				var urmsg = (user_data.value.counters.urmsg===undefined) ? 0 : user_data.value.counters.urmsg;

		 				if( user_data.value.socketId != ''){
							commonClass.SendData({urmsg:user_data.value.counters.urmsg, 'en':"NC", 'sc':1}, user_data.value.socketId);
						}
		 			}
							
		 		});
				
			}

		});
	},
	ASC:function(data, socket){

		var en = data.en;

		if(typeof data.data == 'undefined'){
			commonClass.SendData({'Message' : 'ASC request is not in data object', 'en':data.en, 'sc':0}, socket.id);
			return false;
		}

		var data=data.data;
		data['en']=en;


		if(typeof data.user_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'ASC user_id is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}


		if(typeof data.noti_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'ASC noti_id is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}
		

		var user_id = objectId(data.user_id);
		var noti_id = objectId(data.noti_id);

		db.collection('game_notification').findOne( { _id : noti_id }, function(err, notiInfo){

			if(notiInfo){

				if(notiInfo.type == 'RSC'){

					var chips = notiInfo.chips;
					var cfrom = notiInfo.from;
					var cto = notiInfo.to;

					db.collection('game_users').findOne({_id: objectId(data.user_id)},function(err, user_data){

						if(user_data){

							var user_chips = user_data.chips;

							if( user_chips > chips ){

								userSettingCases.userFindUpdate({ $inc: { chips :  -chips } }, user_id, function(err, userInfo){
									commonClass.SendData({'chips':userInfo.value.chips,'en':"UC", 'sc':1}, socket.id);

									userSettingCases.userFindUpdate({ $inc: { chips :  chips } }, cfrom, function(err, userInfo2){

										if(userInfo2.value.socketId != ''){
											commonClass.SendData({'chips':userInfo2.value.chips,'en':"UC", 'sc':1}, userInfo2.value.socketId);
										}
										
										if(cto.length > 1){
											db.collection('game_notification').updateOne({_id: noti_id},{$pull: {"to":user_uid}});
										}else{
											db.collection('game_notification').deleteOne( {_id:noti_id});
										}
									});

								});


							}else{
								commonClass.SendData({'Message' :"you don't have enough chips to send", 'en':data.en,'sc':501}, socket.id);
								return false;
							}

						}else{
							commonClass.SendData({ 'Message' : 'Invalid user','en':data.en, 'sc':0}, socket.id);
							return false;
						}
					});

				}else{
					commonClass.SendData({ 'Message' : 'Invalid notification','en':data.en, 'sc':0}, socket.id);
					return false;
				}

			}

		});
	},
	RN:function(data, socket){

		var en = data.en;

		if(typeof data.data == 'undefined'){
			commonClass.SendData({'Message' : 'ASC request is not in data object', 'en':data.en, 'sc':0}, socket.id);
			return false;
		}

		var data=data.data;
		data['en']=en;


		if(typeof data.user_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'ASC user_id is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}


		if(typeof data.noti_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'ASC noti_id is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}
		

		var user_id = objectId(data.user_id);
		var noti_id = objectId(data.noti_id);

		db.collection('game_notification').findOne( { _id : noti_id }, function(err, notiInfo){

			if(notiInfo){


					var chips = notiInfo.chips;
					var cfrom = notiInfo.from;
					var cto = notiInfo.to;


					if(cto.length > 1){
						db.collection('game_notification').updateOne({_id: noti_id},{$pull: {"to":user_uid}});
					}else{
						db.collection('game_notification').deleteOne( {_id:noti_id});
					}
						

			}else{
				commonClass.SendData({ 'Message' : 'Invalid notification','en':data.en, 'sc':0}, socket.id);
				return false;
			}


		});
	},
	FrindsOnline:function(data, socket, is_online){
		var uid = data.uid;

    	db.collection('game_friends').aggregate([
		{ 
            $match : {
				friends : { $in:  [uid] }
 			}
        },
	   	{
		    $lookup:{
		        from: "game_users",
		        localField: "_id",
		        foreignField: "_id",
		        as: "user_data"
		    }
		},  
		{
	      	$project:{
		        _id:0,
		        "user_data.socketId":1,
		        "user_data.counters.urmsg":1
	        }
		},
		{ 
			$unwind: "$user_data" 
		},
		{
			$sort:{ 
				at:-1
			}
		}
		]).toArray(function(err, result){
			_.forEach(result, function(value) {

				if( value.user_data.socketId != ''){
					commonClass.SendData({urmsg:value.user_data.counters.urmsg, ol:is_online,'en':"NC", 'sc':1}, value.user_data.socketId);
				}
			});

		});
	}
}