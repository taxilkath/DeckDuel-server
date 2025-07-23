module.exports = {
	insertFreind:function(id, callback){

		var info = {
			_id:id,
			block_from :[],
			block :[],
			request :[],
			friends :[],
			fbfriends :[],
		};

		db.collection('game_friends').insertOne(info);
	},
	// send friend request
	SFR:function(data, socket){

		var en = data.en;
		if(typeof data.data == 'undefined'){
			commonClass.SendData({'Message' : 'SFR request is not in data object', 'en':data.en, 'sc':0}, socket.id);
			return false;
		}
		var data=data.data;
		data['en']=en;


		if(typeof data.user_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'SFR user_id is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		if(typeof data.user_uid == 'undefined'){
			commonClass.SendData({ 'Message' : 'SFR user_uid is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		if(typeof data.other_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'SFR other_id is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		if(typeof data.other_uid == 'undefined'){
			commonClass.SendData({ 'Message' : 'SFR other_uid is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}


		if(typeof data.is_robot == 'undefined'){
			commonClass.SendData({ 'Message' : 'SFR is_robot is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		var user_id = objectId(data.user_id);
		var other_id = objectId(data.other_id);
		var user_uid = data.user_uid;
		var is_robot = data.is_robot;
		var other_uid = data.other_uid;

		if(is_robot == true){

			db.collection('game_friends').updateOne({_id: user_id},{$push: {"friends":other_uid}});
			db.collection('game_friends').updateOne({_id: other_id},{$push: {"friends":user_uid}});
			commonClass.SendData({ 'Message' : 'send request successfully .','en':data.en, 'sc':1}, socket.id);

		}else{

			db.collection('game_friends').find({_id: other_id, "request":user_uid}).count(function(err, is_send){

				

				if(is_send == 1){

					commonClass.SendData({ 'Message' : 'already request sent.','en':data.en, 'sc':2}, socket.id);

				}else if( is_send == 0){

					

					db.collection('game_friends').updateOne({_id: other_id},{$push: {"request":user_uid}},function(err, response){

						if(response){

 							userSettingCases.userFindUpdate({$inc: { "counters.fr": 1 }}, other_id, function(err, userdata){

 								if(userdata.value.socketId !='' ){
									commonClass.SendData({"frc":userdata.value.counters.fr, 'en':"NC", 'sc':1}, userdata.value.socketId);//game score
 								}
 							});


						}
					});
				}
			});
		}
	},
	// LIST friend request
	LFR:function(data, socket){

		var en = data.en;
		if(typeof data.data == 'undefined'){
			commonClass.SendData({'Message' : 'LFR request is not in data object', 'en':data.en, 'sc':0}, socket.id);
			return false;
		}
		var data=data.data;
		data['en']=en;


		if(typeof data.user_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'LFR user_id is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}


		var user_id = objectId(data.user_id);
		db.collection('game_friends').findOne( { _id : user_id }, function(err, friends){

			db.collection('game_users').aggregate([
			{
				$match : {
					uid : { $in: friends.request }
				}
			},
			{
		      	$project:{
		          	_id:1,
		            chips:1,
		            coins:1,
		            un:1,
		            pp:1,
		            uid:1,
		            socketId:1
		        }
		 	}
			]).toArray(function(err, res){
				commonClass.SendData({'data':res,'en':data.en, 'sc':1}, socket.id);
			});
		});
	},
	// Action friend request
	AFR:function(data, socket){

		var en = data.en;
		if(typeof data.data == 'undefined'){
			commonClass.SendData({'Message' : 'AFR request is not in data object', 'en':data.en, 'sc':0}, socket.id);
			return false;
		}
		var data=data.data;
		data['en']=en;


		if(typeof data.user_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'AFR user_id is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		if(typeof data.IA == 'undefined'){ //is accept
			commonClass.SendData({ 'Message' : 'AFR IA is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		if(typeof data.other_uid == 'undefined'){
			commonClass.SendData({ 'Message' : 'AFR other_uid is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		if(typeof data.user_uid == 'undefined'){
			commonClass.SendData({ 'Message' : 'AFR user_uid is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}


		if(typeof data.other_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'AFR other_id is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}


		var user_id = objectId(data.user_id);
		var other_id = objectId(data.other_id);
		var is_accept = data.IA;
		var other_uid = data.other_uid;
		var user_uid = data.user_uid;


		db.collection('game_friends').find({_id: user_id, "request":other_uid}).count(function(err, is_send){

			if(is_send == 1){

				db.collection('game_friends').updateOne({_id: user_id},{$pull: {"request":other_uid}},function(err, response){

					if(response && is_accept == 1){


						db.collection('game_friends').updateOne({_id: user_id},{$push: {"friends":other_uid}});
						db.collection('game_friends').updateOne({_id: other_id},{$push: {"friends":user_uid}});

						

						db.collection('game_users').findOne({_id: objectId(data.other_id)},function(err, user_data){

							friendsCases.getOnlineFriendCount(other_id,function(err, result){


								var online = (result.length > 0) ? result[0].online : 0;

								if(user_data.socketId !=''){

									var urmsg = (user_data.counters.urmsg===undefined) ? 0 : user_data.counters.urmsg;
									commonClass.SendData({urmsg:urmsg, online:online, 'en':"NC", 'sc':1}, user_data.socketId);//game score
								}
							})

						})
					}
				});
			}
		});
	},
	//Block user
	BU:function(data, socket){

		var en = data.en;
		if(typeof data.data == 'undefined'){
			commonClass.SendData({'Message' : 'BU request is not in data object', 'en':data.en, 'sc':0}, socket.id);
			return false;
		}
		var data=data.data;
		data['en']=en;


		if(typeof data.user_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'BU user_id is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		if(typeof data.other_uid == 'undefined'){
			commonClass.SendData({ 'Message' : 'BU other_uid is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		if(typeof data.user_uid == 'undefined'){
			commonClass.SendData({ 'Message' : 'BU user_uid is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}


		if(typeof data.other_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'BU other_id is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}


		var user_id = objectId(data.user_id);
		var other_id = objectId(data.other_id);
		var other_uid = data.other_uid;
		var user_uid = data.user_uid;

		db.collection('game_friends').find({_id: user_id, "block":other_uid}).count(function(err, is_block){

			if(is_block == 0){

				db.collection('game_friends').updateOne({_id: user_id},{$push: {"block":other_uid}},function(err, response){

					if(response){


						db.collection('game_friends').updateOne({_id: other_id},{$pull: {"friends":user_uid}, $push: {"block_from":user_uid}});
						commonClass.SendData({ 'Message' : 'user block successfully .','en':data.en, 'sc':1}, socket.id);

					}
				});
			}
		});
	},
	//unBlock user
	UBU:function(data, socket){

		var en = data.en;
		if(typeof data.data == 'undefined'){
			commonClass.SendData({'Message' : 'UBU request is not in data object', 'en':data.en, 'sc':0}, socket.id);
			return false;
		}
		var data=data.data;
		data['en']=en;


		if(typeof data.user_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'UBU user_id is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		if(typeof data.other_uid == 'undefined'){
			commonClass.SendData({ 'Message' : 'UBU other_uid is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}


		if(typeof data.other_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'UBU other_id is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}


		if(typeof data.user_uid == 'undefined'){
			commonClass.SendData({ 'Message' : 'UBU user_uid is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}


		var user_id = objectId(data.user_id);
		var other_id = objectId(data.other_id);
		var user_uid = data.user_uid;
		var other_uid = data.other_uid;

		db.collection('game_friends').updateOne({_id: user_id},{$pull: {"block":other_uid}}, function(err, res){
			db.collection('game_friends').find({_id: user_id, "friends":other_uid}).count(function(err, is_friends){

				if(is_friends == 1){

					db.collection('game_friends').updateOne({_id: other_id},{$push: {"friends":user_uid}, $pull: {"block_from":user_uid}});

				}else{

					db.collection('game_friends').updateOne({_id: other_id},{$pull: {"block_from":user_uid}});
				}
			});


			commonClass.SendData({ 'Message' : 'unblock user successfully .','en':data.en, 'sc':1}, socket.id);
		});
	},
	//friend list
	FL:function(data ,socket){

		var en = data.en;
		if(typeof data.data == 'undefined'){
			commonClass.SendData({'Message' : 'FL request is not in data object', 'en':data.en, 'sc':0}, socket.id);
			return false;
		}
		var data=data.data;
		data['en']=en;


		if(typeof data.user_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'FL user_id is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}


		if(typeof data.tIds == 'undefined'){
			commonClass.SendData({ 'Message' : 'FL tIds is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		if(typeof data.flt == 'undefined'){ //freinds list type 1 = online 2 = all 3 = blocked
			commonClass.SendData({ 'Message' : 'FL flt is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}


		var user_id = objectId(data.user_id);
		var tIds = data.tIds;
		var flt = data.flt;
		var uid = data.user_uid;

 		userSettingCases.updateUserData({$set: { "counters.fr": 0 }}, user_id );


		db.collection('game_friends').findOne( { _id : user_id }, function(err, friends){


			var user_friends = friends.friends;
			var jnk  = _.uniq(_.merge(tIds,user_friends));
			
			var block_from = (typeof friends.block_from == 'undefined') ? [] : friends.block_from; 
			var jnk = _.difference(jnk, block_from);


			if( jnk.length > 0){

				tIds.push(uid);
				
				db.collection('game_friends').updateOne({_id: user_id},{$set: {"friends":jnk, "fbfriends":tIds}},function(err, res){

					friendsCases.getUserFriendList(user_id, '', function(err, friendlist){
						commonClass.SendData({'data':friendlist,block:friends.block,'en':data.en, 'sc':1}, socket.id);
					});
				});

			}else{

				friendsCases.getUserFriendList(user_id, friends, function(err, friendlist){
					commonClass.SendData({'data':friendlist,block:friends.block,'en':data.en, 'sc':1}, socket.id);
				});

			}
		});
	},
	UF:function(data, socket){

		var en = data.en;
		if(typeof data.data == 'undefined'){
			commonClass.SendData({'Message' : 'UF request is not in data object', 'en':data.en, 'sc':0}, socket.id);
			return false;
		}
		var data=data.data;
		data['en']=en;


		if(typeof data.user_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'UF user_id is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}


		if(typeof data.other_uid == 'undefined'){
			commonClass.SendData({ 'Message' : 'UF other_uid is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		if(typeof data.user_uid == 'undefined'){
			commonClass.SendData({ 'Message' : 'UF user_uid is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}


		if(typeof data.other_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'UF other_id is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}


		var user_id = objectId(data.user_id);
		var other_id = objectId(data.other_id);
		var other_uid = data.other_uid;
		var user_uid = data.user_uid;


		db.collection('game_friends').find({_id: user_id, "friends":other_uid}).count(function(err, is_friends){

			if(is_friends == 1){

				
				db.collection('game_friends').updateOne({_id: user_id},{$pull: {"friends":other_uid}});
				db.collection('game_friends').updateOne({_id: other_id},{$pull: {"friends":user_uid}});
				commonClass.SendData({ 'Message' : 'unfriend successfully .','en':data.en, 'sc':1}, socket.id);


			}else{

				commonClass.SendData({ 'Message' : "it's not your friend.",'en':data.en, 'sc':0}, socket.id);
			}
		});
	},
	IF:function(data, socket){

		var en = data.en;
		if(typeof data.data == 'undefined'){
			commonClass.SendData({'Message' : 'IF request is not in data object', 'en':data.en, 'sc':0}, socket.id);
			return false;
		}
		var data=data.data;
		data['en']=en;


		if(typeof data.user_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'IF user_id is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}
		if(typeof data.ifsids == 'undefined'){
			commonClass.SendData({ 'Message' : 'IF ifsids is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}
		if(typeof data.roomId == 'undefined'){
			commonClass.SendData({ 'Message' : 'IF roomId is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}
		

		var ifids = data.ifsids; 
		if(ifids.length > 0){
			db.collection('game_users').findOne({_id: objectId(data.user_id)},function(err, res){

				if(res){

			        data.ifsids.forEach(function(sid) { 
						commonClass.SendData({'en':'IF', 'roomId':data.roomId, un:res.un, pp:res.pp, bootvalue:data.bootvalue }, sid);
					});
				}

			});
	    }
	},
	getUserFriendList:function(user_id, friends, callback){

		var project = {
          	_id:1,
            chips:1,
            coins:1,
            un:1,
            pp:1,
            uid:1,
            roomId:1,
            socketId:1,
            osid:1,
            tId:1,
            tbl_type : 1
        };

        if( friends == '' ){


    		db.collection('game_friends').findOne( { _id : user_id }, function(err, friends){ 
				if(friends){


		        	var friend =  friends.friends;


			        var blockUser =  friends.block;
			        
					friend = friend.concat(blockUser);
					friend = _.uniq(friend);

					var match = {
						uid : { $in:  friend},
			        };
			        

					db.collection('game_users').aggregate([
					{
						$match : match
					},
					{
				      	$project:project
				 	}
					]).toArray(callback);

				}	

			});
        }else{


        	if(friends){

		        var friend =  friends.friends;


		        var blockUser =  friends.block;

		        friend = friend.concat(blockUser);
				friend = _.uniq(friend);


				var match = {
					uid : { $in:  friend},
		        };
		        

				db.collection('game_users').aggregate([
				{
					$match : match
				},
				{
			      	$project:project
			 	}
				]).toArray(callback);

			}	
        }
	},
	getOnlineFriendCount:function(user_id, callback){

    	
    	db.collection('game_friends').findOne( { _id : user_id }, function(err, friends){ 
			if(friends){


	        	var friend =  friends.friends;


		        var blockUser =  friends.block;

				friend = friend.concat(blockUser);
				friend = _.uniq(friend);

				var match = {
					uid : { $in:  friend},
					socketId : { $ne : ""}
		        };
		        

				db.collection('game_users').aggregate([
				{
					$match : match
				},
			 	{
			      	$count: "online"
			    }
				]).toArray(callback);

			}	

		});
	}
}