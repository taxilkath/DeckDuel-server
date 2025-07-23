module.exports = {
	UP:function(data, socket){

		var en = data.en;
		if(typeof data.data == 'undefined'){
			commonClass.SendData({'Message' : 'UP request is not in data object', 'en':data.en, 'sc':0}, socket.id);
			return false;
		}
		var data=data.data;
		data['en']=en;


		if(typeof data.user_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'UP user_id is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		
		if(typeof data.user_uid == 'undefined'){
			commonClass.SendData({ 'Message' : 'UP user_uid is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}


		if(typeof data.other_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'UP other_id is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}


		

		var user_id = objectId(data.user_id);
		var other_id = objectId(data.other_id);
		var user_uid = data.user_uid;

		userSettingCases.getUserData(other_id,function(err, userData){
			if(userData){

				var isFriend = 0, isBlocked = 0, isAccept = 0, isOtherUserBlock = 0;

				if( data.user_id ==  data.other_id){

					var userInfo = {
						_id : userData._id,
						sno : userData.sno,
						un : userData.un,
						pp : userData.pp,
						result : userData.result,
						level : userData.level,
						coins : userData.coins,
						userID: userData.userID,
						chips : userData.chips,
						uid : userData.uid,
						is_robot : userData.is_robot,
						isFriend : isFriend,
						isBlocked : isBlocked,
						isAccept : isAccept,
						isOtherUserBlock : isOtherUserBlock
					}

					commonClass.SendData({'data':userInfo,'en':data.en, 'sc':1}, socket.id);
							
				}else{

					if(typeof data.other_id == 'undefined'){
						commonClass.SendData({ 'Message' : 'UP roomId is not defined','en':data.en, 'sc':0}, socket.id);
						return false;
					}

					var roomId = objectId(data.roomId);


					db.collection('game_friends').findOne( { _id : user_id }, function(err, friends){
						

						db.collection('game_friends').findOne( { _id : other_id }, function(err, otherUserfriends){
							if(otherUserfriends && friends){

								var user_friends = friends.friends;
								var user_block = friends.block;
								var user_request = friends.request;
								
								var other_user_request = otherUserfriends.request;
								var other_user_block = otherUserfriends.block;
								
								// printLog(user_block);

								if( _.includes(user_friends,userData.uid) ){ isFriend = 1 }
								if( _.includes(user_block,userData.uid) ){ isBlocked = 1 }
								if( _.includes(user_request,userData.uid) ){ isAccept = 2 }
								if( _.includes(other_user_request,user_uid) ){ isAccept = 1}
								if( _.includes(other_user_block,user_uid) ){ isOtherUserBlock = 1 }

									
								

								tablesManager.GetTableInfo(roomId, function(err,RoomInfo){
						
									if(RoomInfo){

										try{

											var userInfo = {
												_id : userData._id,
												sno : userData.sno,
												un : userData.un,
												pp : userData.pp,
												result : userData.result,
												level : userData.level,
												coins : userData.coins,
												chips : RoomInfo.players[other_id].playerInfo.chips,
												userID : userData.userID,
												is_robot : userData.is_robot,
												uid : userData.uid,
												isFriend : isFriend,
												isBlocked : isBlocked,
												isAccept : isAccept,
												isOtherUserBlock : isOtherUserBlock,
												tgp : RoomInfo.players[other_id].tgp,
												tgw : RoomInfo.players[other_id].tgw,
												bchips : RoomInfo.players[other_id].bchips,
												achips : RoomInfo.players[other_id].achips,
											}

										}catch(e){
											
										}
										commonClass.SendData({'data':userInfo,'en':data.en, 'sc':1}, socket.id);
									}
								});

							}
						});
					});
				}

				

			}else{
				
				commonClass.SendData({ 'Message' : 'userdata not found','en':data.en, 'sc':0}, socket.id);
			}
		});
	},
	LB: function (data, socket) {

        var en = data.en;
        if (typeof data.data == 'undefined') {
            commonClass.SendData({'Message': 'LB request is not in data object', 'en': data.en, 'sc': 0}, socket.id);
            return false;
        }


        var data = data.data;
        data['en'] = en;

        if (typeof data.ip == 'undefined') { //ip address of user
            commonClass.SendData({'Message': 'ip undefined', 'en': data.en, 'sc': 0}, socket.id);
            return false;
        }
        if (typeof data.user_id == 'undefined') {
            commonClass.SendData({'Message': 'LB user_id is not defined', 'en': data.en, 'sc': 0}, socket.id);
            return false;
        }

        if (typeof data.ltime == 'undefined') { //1 = weekly, 2 = all time
            commonClass.SendData({'Message': 'LB ltime is not defined', 'en': data.en, 'sc': 0}, socket.id);
            return false;
        }

        if (typeof data.ltype == 'undefined') { //1 = global, 2 = national, 3 = friend
            commonClass.SendData({'Message': 'LB ltype is not defined', 'en': data.en, 'sc': 0}, socket.id);
            return false;
        }

        var user_id = objectId(data.user_id);
        var tIds = data.tIds;

        // update FB Friends
        if (typeof data.tIds !== 'undefined' && data.tIds) {

            db.collection('game_friends').updateOne({_id: user_id}, {$set: {"fbfriends": data.tIds}});

            db.collection('game_friends').findOne({_id: user_id}, function (err, friends) {
                if (friends) {
                    var user_friends = friends.friends;
                    var jnk = _.uniq(_.merge(user_friends, tIds));
                    var block_from = (typeof friends.block_from == 'undefined') ? [] : friends.block_from;
                    var jnk = _.difference(jnk, block_from);

                    if (jnk.length > 0) {
                        db.collection('game_friends').updateOne({_id: user_id}, {$set: {"friends": jnk}});
                    }
                }
            });
        }

        var ltime = data.ltime;
        var ltype = data.ltype;
        var ip = data.ip;

        var project = {
            un: 1,
            pp: 1,
            socketId: 1
        };

        if (ltime == 1) {
            var sort = {cwchips: -1};
            project.cwchips = 1;
        } else {
            var sort = {chips: -1};
            project.chips = 1;
        }

        if (ltype == 1 || ltype == 2) {
            var country = commonClass.getCountryFromIp(ip);
            project.country = country;

            db.collection('game_users').aggregate([
                {
                    $project: project
                },
                {
                    $sort: sort
                },
                {
                    $limit: 10
                }
            ]).toArray(function (err, result) {

                if (result) {
                    commonClass.SendData({'data': result, 'en': data.en, 'sc': 1}, socket.id);
                } else {
                    commonClass.SendData({'Message': 'please try later', 'en': data.en, 'sc': 0}, socket.id);
                }
            });

        } else if (ltype == 3) {

            db.collection('game_friends').findOne({_id: user_id}, function (err, friends) {

                if (friends) {

                    if (typeof friends.fbfriends !== 'undefined' && friends.fbfriends) {

                        db.collection('game_users').aggregate([
                            {
                                $match: {
                                    'tId': {
                                        $in: friends.fbfriends
                                    }
                                }
                            },
                            {
                                $sort: sort
                            },
                            {
                                $project: project
                            },
                            {
                                $limit: 10
                            }
                        ]).toArray(function (err, result) {
                            commonClass.SendData({'data': result, 'en': data.en, 'sc': 1}, socket.id);
                        });
                    } else {
                        commonClass.SendData({'data': [], 'en': data.en, 'sc': 1}, socket.id);
                    }
                } else {
                    commonClass.SendData({'data': [], 'en': data.en, 'sc': 1}, socket.id);
                }
            });
        }
    },
	DB:function(data, socket){
		
		var en = data.en;
		if(typeof data.data == 'undefined'){
			commonClass.SendData({'Message' : 'LB request is not in data object', 'en':data.en, 'sc':0}, socket.id);
			return false;
		}
		var data=data.data;
		data['en']=en;


		if(typeof data.user_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'user_id un is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		var user_id = objectId(data.user_id);
		userSettingCases.getUserData(user_id, function(err,userdata){

			var total_count = userdata.counters.dbc;

			
			let ip2country = require('ip2country');
			let c2t = require('countries-and-timezones');
			let momenttimezone = require('moment-timezone');


			var country = ip2country(socket.request.connection.remoteAddress);
			const mxTimezones = c2t.getTimezonesForCountry('IN');

			if(mxTimezones.length > 0){

				var last_collect_time = moment(userdata.lasts.lbct).format('YYYY-MM-DD');
  			  	var converted_date = momenttimezone().tz(mxTimezones[0].name).format('YYYY-MM-DD');

			  	var datea = moment(converted_date);
			  	var dateb = moment(last_collect_time);
			  	var diff_day = datea.diff(dateb, 'days');

			  	if(  diff_day == 0 ){

					commonClass.SendData({'Message' : 'you have already collected daily bonus for today.', 'en':data.en, 'sc':0}, socket.id);

			  	}else{
			  		
				  	if(diff_day == 1){

				  		var day = total_count+1;
				  		userSettingCases.getDailyBonusAmount(day, function(amount){

				  			db.collection('game_daily_bonus').find({}).toArray(function(err, dbarray){

				  				if(dbarray){

						  			var index = _.findKey(dbarray, function(o) { return o.amount == amount; });
									commonClass.SendData({'data': dbarray, 'index':index, 'day':day, 'en':data.en, 'sc':1}, socket.id);
				  				}

				  			})

				  		})

				  	}else{

				  		var day = 1;
				  		userSettingCases.getDailyBonusAmount(day,function(amount){

				  			db.collection('game_daily_bonus').find({}).toArray(function(err, dbarray){

				  				if(dbarray){

						  			var index = _.findKey(dbarray, function(o) { return o.amount = amount; });
									commonClass.SendData({'data': dbarray, 'index':index, 'day':day, 'en':data.en, 'sc':1}, socket.id);
				  				}

				  			})

				  		})
					}
				}
				  
			}else{

			  printLog('DB>>>timezone not found');
			}


		});
	}, 
	DBC:function(data, socket){
		
		var en = data.en;
		if(typeof data.data == 'undefined'){
			commonClass.SendData({'Message' : 'LB request is not in data object', 'en':data.en, 'sc':0}, socket.id);
			return false;
		}
		var data=data.data;
		data['en']=en;


		if(typeof data.user_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'user_id un is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		if(typeof data.is_share == 'undefined'){
			commonClass.SendData({ 'Message' : 'is_share un is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		var user_id = objectId(data.user_id);
		var is_share = data.is_share;

		userSettingCases.getUserData(user_id, function(err,userdata){

			var total_count = userdata.counters.dbc;

			let ip2country = require('ip2country');
			let c2t = require('countries-and-timezones');
			let moment = require('moment');
			let momenttimezone = require('moment-timezone');


			var country = ip2country(socket.request.connection.remoteAddress);
			const mxTimezones = c2t.getTimezonesForCountry('IN');

			if(mxTimezones.length > 0){

				var last_collect_time = moment(userdata.lasts.lbct).format('YYYY-MM-DD');
  			  	var converted_date = momenttimezone().tz(mxTimezones[0].name).format('YYYY-MM-DD');

			  	var datea = moment(converted_date);
			  	var dateb = moment(last_collect_time);
			  	var diff_day = datea.diff(dateb, 'days');

			  	if(  diff_day == 0 ){

					commonClass.SendData({'Message' : 'you have already collected daily bonus for today.', 'en':data.en, 'sc':0}, socket.id);

			  	}else{
			  		
				  	if(diff_day == 1){

				  		var day = total_count+1;
				  		userSettingCases.getDailyBonusAmount(day,function(amount){

				  			if(is_share == 1){
				  				amount = amount+250;
				  			}
				  			
				  			userSettingCases.addDailyBonus(user_id, day, amount, converted_date, data, socket);

				  		})

				  	}else{

				  		var day = 1;
				  		userSettingCases.getDailyBonusAmount(day,function(amount){

				  			if(is_share == 1){
				  				amount = amount+250;
				  			}
				  			userSettingCases.addDailyBonus(user_id, day, amount, converted_date, data, socket);
				  		})
					}
				}
				  
			}else{

			  printLog('DB>>>timezone not found');
			}


		});
	},
	WWC:function(data, socket){

		var en = data.en;
		if(typeof data.data == 'undefined'){
			commonClass.SendData({'Message' : 'WWC request is not in data object', 'en':data.en, 'sc':0}, socket.id);
			return false;
		}
		var data=data.data;
		data['en']=en;

		if(typeof data.user_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'WWC user_id is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		if(typeof data.ctype == 'undefined'){ //1 = last week, 2 = this week
			commonClass.SendData({ 'Message' : 'WWC ctype is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		var user_id = objectId(data.user_id);
		var ctype = data.ctype;

		userSettingCases.getUserData(user_id,function(err, userData){
			
			if(userData){


				var project = {
		          	un:1,
		          	pp:1,
		          	socketId:1
		        };

				if( ctype == 1 ){

					var sort = {lwchips:-1};
					project.lwchips = 1;

				}else{
					
					var sort = {cwchips:-1};
					project.cwchips = 1;
				}


				db.collection('game_users').aggregate([
				{
					$project: project
				},
				{
					$sort: sort
				},
				{ 
					$limit : 3 
				}
				]).toArray(function(err, result){

					if(result){
						
						if(ctype == 1){
							commonClass.SendData({'data':result, lwchips:userData.lwchips,prize:[100000,50000,25000], 'en':data.en, 'sc':1}, socket.id);
						}else{
							commonClass.SendData({'data':result, prize:[100000,50000,25000], cwchips:userData.cwchips, 'en':data.en, 'sc':1}, socket.id);
						}

					}else{

						commonClass.SendData({ 'Message' : 'please try later','en':data.en, 'sc':0}, socket.id);
					}

				});
			}
		});
	},
	URC:function(data, socket){

		var en = data.en;
		if(typeof data.data == 'undefined'){
			commonClass.SendData({'Message' : 'URC request is not in data object', 'en':data.en, 'sc':0}, socket.id);
			return false;
		}
		var data=data.data;
		data['en']=en;


		if(typeof data.user_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'URC user_id is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		if(typeof data.rc == 'undefined'){
			commonClass.SendData({ 'Message' : 'URC rc is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}
		

		var user_id = objectId(data.user_id);
		userSettingCases.getUserData(user_id,function(err, userData){
			// printLog();
			// printLog(userData);
			if(userData){

        		// var mbc = (userData.counters.mbc == undefined ?  0 :userData.counters.mbc) + 1;

        		
        		// var amount = Math.pow(2, (data.cc-1))*50;
        		// if(amount > 5000){
        		// 	amount = 5000;
        		// }

        		var upWhere = { $inc: { chips :  data.rc }};
				userSettingCases.userFindUpdate(upWhere, user_id,function(err,res){

					if(res){
						db.collection('game_chips_tracker').insertOne({chips : data.rc, type : 'credit', msg : 'collect Reward box', uid : user_id, createdOn: new Date()});
						commonClass.SendData({ chips:res.value.chips, 'en':data.en, 'sc':1}, socket.id);
					}
				});




			}
		});
	},
	RSC:function(data, socket){

		var en = data.en;
		if(typeof data.data == 'undefined'){
			commonClass.SendData({'Message' : 'RSC request is not in data object', 'en':data.en, 'sc':0}, socket.id);
			return false;
		}
		var data=data.data;
		data['en']=en;


		if(typeof data.user_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'RSC user_id is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		if(typeof data.other_userid == 'undefined'){
			commonClass.SendData({ 'Message' : 'RSC other_userid  is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		if(typeof data.chips == 'undefined'){
			commonClass.SendData({ 'Message' : 'RSC chips is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}


		var user_id = objectId(data.user_id);
		var other_userid = data.other_userid;
		var chips = data.chips;

		var sendChips = [500,1000,2500,5000,10000,15000,30000,50000,75000,100000,1500000,3000000,5000000,7500000,10000000];

		if (sendChips.indexOf(chips) > -1){


			var info = {
				'from' : user_id,
				'to' : other_userid,
				'type' : 'RSC',
				'chips': chips,
				'status': 0,
				'at': new Date()
			};

			db.collection('game_notification').insertOne(info);

 			db.collection('game_users').updateMany(
			{ 
				uid: { $in: other_userid } 
			}, 
			{
				$inc: { "counters.urmsg": 1 }
			}, 
			{
				multi:true
			},function(err, info){

				// printLog(err);
				// printLog(info);
				db.collection('game_users').find({ uid: { $in: other_userid } }).toArray(function(err, resp){

					_.forEach(resp, function(value) {

						if( value.socketId != ''){
							commonClass.SendData({urmsg:value.counters.urmsg, 'en':"NC", 'sc':1}, value.socketId);//game score
						}
					});
				});

			});

		}else{

			commonClass.SendData({ 'Message' : 'custom chips not transfer. please select system transfer chips','en':data.en, 'sc':0}, socket.id);
		}
	},
	LC:function(data, socket){

		var en = data.en;
		if(typeof data.data == 'undefined'){
			commonClass.SendData({'Message' : 'LC request is not in data object', 'en':data.en, 'sc':0}, socket.id);
			return false;
		}
		var data=data.data;
		data['en']=en;


		if(typeof data.user_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'LC user_id is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}


		if(typeof data.roomId == 'undefined'){
			commonClass.SendData({ 'Message' : 'LC roomId is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}


		if(typeof data.cards == 'undefined'){
			commonClass.SendData({ 'Message' : 'LC cards is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}



		var user_id = objectId(data.user_id);
		var roomId = objectId(data.roomId);
		var cards = data.cards;

		userSettingCases.getLuckyCard(function(err, luckyCard){

			if(luckyCard){

			 	var lCard = luckyCard.INFO;
			 	var ucard = data.cards.split(',');;
			 	var total_count = 0;

			 	if( lCard.length == ucard.length){

			 		if(lCard.indexOf(ucard[0]) > -1){

			 			total_count++;
			 		}

			 		if(lCard.indexOf(ucard[1]) > -1){

			 			total_count++;
			 		}

			 		if(lCard.indexOf(ucard[2]) > -1){

			 			total_count++;
			 		}
			 	}
			 	

			 	if(total_count == 1){

					var randChips = 1000;

			 	}else if(total_count == 1){

			 		var rn = require('random-number');
					var options = {
					  min:  1
					, max:  4
					, integer: true
					}

					var randChips = rn(options) * 100000;

			 	}else if(total_count == 3){

			 		var rn = require('random-number');
					var options = {
					  min:  5
					, max:  100
					, integer: true
					}

					var randChips = rn(options) * 100000;
				}


				tablesManager.GetTableInfo(roomId, function(err,RoomInfo){
		
					if(RoomInfo && RoomInfo.players[user_id]){


						var setobj = {}, inc = {};
						inc['players.'+user_id+'.playerInfo.chips'] = randChips;


						/*##################update user chips, cwchips########################################*/
			 			db.collection('game_users').updateOne( {_id: user_id}, { $inc:{chips:randChips,cwchips: randChips}});
						/*#######################################################################################################*/


						tablesManager.RoomFindUpdate(RoomInfo._id,{$inc:inc},function(err, updateRoomData){
							
							commonClass.SendData({'chips':updateRoomData.value.players[user_id].playerInfo.chips,slot:updateRoomData.value.players[user_id].slot,user_id:user_id, 'en':data.en, 'sc':1}, updateRoomData.value._id);

						});

					}
				});

			}
		});
	},
	EUN:function(data, socket){

		var en = data.en;
		if(typeof data.data == 'undefined'){
			commonClass.SendData({'Message' : 'EUN request is not in data object', 'en':data.en, 'sc':0}, socket.id);
			return false;
		}
		var data=data.data;
		data['en']=en;


		if(typeof data.un == 'undefined'){
			commonClass.SendData({ 'Message' : 'EUN un is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		if(typeof data.user_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'EUN user_id is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		var user_id = objectId(data.user_id)
		var upWhere = {$set: {}};
 		upWhere.$set.un = data.un;
		userSettingCases.userFindUpdate(upWhere, user_id, function(err, res){

			commonClass.SendData({'name': data.un,'en':data.en, 'sc':1}, socket.id);

		});
	},
	GL:function(data, socket){

		var en = data.en;
		if(typeof data.data == 'undefined'){
			commonClass.SendData({'Message' : 'GL request is not in data object', 'en':data.en, 'sc':0}, socket.id);
			return false;
		}
		var data=data.data;
		data['en']=en;


		if(typeof data.user_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'GL user_id is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}
		

		db.collection('game_gift').find({}).toArray(function(err, info){
			commonClass.SendData({'data':info,'en':data.en, 'sc':1}, socket.id);
		});
	},
	GS:function(data, socket){

		var en = data.en;
		if(typeof data.data == 'undefined'){
			commonClass.SendData({'Message' : 'GS request is not in data object', 'en':data.en, 'sc':0}, socket.id);
			return false;
		}
		var data=data.data;
		data['en']=en;


		if(typeof data.user_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'GS user_id is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		if(typeof data.roomId == 'undefined'){
			commonClass.SendData({ 'Message' : 'GS roomId is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		if(typeof data.giftId == 'undefined'){
			commonClass.SendData({ 'Message' : 'GS giftId is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		if(typeof data.type == 'undefined'){
			commonClass.SendData({ 'Message' : 'GS type is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}
		
		var user_id = objectId(data.user_id);
		var giftId = objectId(data.giftId);
		var roomId = objectId(data.roomId);
		var type = data.type;

		db.collection('game_gift').findOne( {_id:giftId},function(err, giftInfo){

			if(giftInfo){

				var giftUrl = giftInfo.url;

				
				tablesManager.GetTableInfo(roomId, function(err,RoomInfo){
					
					// printLog(RoomInfo);
					if( RoomInfo && RoomInfo.players[user_id] ){

						var userChips = RoomInfo.players[user_id].playerInfo.chips;
						var cutChips = giftInfo.chips;

						var setobj = {};


						if(type == 2){

							var total_player = playingCases.getPlayersCount(RoomInfo.players);
							cutChips = giftInfo.chips * total_player;

							_.forOwn(RoomInfo.players, function(value, key) { 
								setobj['players.'+key+'.gift'] = giftUrl;
							});

						}else{
							setobj['players.'+data.to+'.gift'] = giftUrl;
						}

						
						if( userChips > cutChips){

							var upWhere = { $inc: { chips :  -cutChips }};
							userSettingCases.userFindUpdate(upWhere, user_id,function(err,res){

								// printLog(err);
								// printLog(res);
								if(res && res.value){
									
									var useraftrChips = res.value.chips;
									var inc = {};
									inc['players.'+user_id+'.playerInfo.chips'] = -cutChips;
									inc['players.'+user_id+'.achips'] = -cutChips;

									tablesManager.RoomFindUpdate(roomId,{ $set:setobj, $inc:inc},function(err, updateRoomData){

										commonClass.SendData({
										data:{
											type : data.type,
											from : data.user_id,
											chips : useraftrChips,
											giftUrl : giftUrl,
											to : data.to
										}, 
										'en':data.en,
										'sc':1}, 
										roomId);
									});

								}else{

									printLog('user update error');
								}
							});


						}else{
							printLog("you don't have enough chips to send gift.");
							commonClass.SendData({'Message' :"you don't have enough chips to send gift.", 'en':data.en,'sc':501}, socket.id);
							return false;
						}

					}else{
						printLog('user not found');
					}

				});
				
			}else{
				printLog('gift not found');
			}
		});
	},
	GSM:function(data, socket){

		var en = data.en;
		if(typeof data.data == 'undefined'){
			commonClass.SendData({'Message' : 'GSM request is not in data object', 'en':data.en, 'sc':0}, socket.id);
			return false;
		}
		var data=data.data;
		data['en']=en;


		if(typeof data.user_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'GSM user_id is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		if(typeof data.roomId == 'undefined'){
			commonClass.SendData({ 'Message' : 'GSM roomId is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}


		if(typeof data.type == 'undefined'){
			commonClass.SendData({ 'Message' : 'GSM type is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}


		if(typeof data.msg == 'undefined'){
			commonClass.SendData({ 'Message' : 'GSM msg is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}
		
		var user_id = objectId(data.user_id);
		var roomId = objectId(data.roomId);
		var type = data.type;
		var msg = data.msg;
		var sender_name = data.sender_name;



		tablesManager.GetTableInfo(roomId, function(err,RoomInfo){
			
			// printLog(RoomInfo);
			if( RoomInfo && RoomInfo.players[user_id] ){

				if(type == 1){


					if(typeof data.to == 'undefined'){
						commonClass.SendData({ 'Message' : 'GSM to is not defined','en':data.en, 'sc':0}, socket.id);
						return false;
					}


					var to = objectId(data.to);


					if( to && RoomInfo.players[to] && RoomInfo.players[to].is_robot == false && RoomInfo.players[to].playerInfo.clientId){

						commonClass.SendData({
							data:{
								type : data.type,
								from : data.user_id,
								msg : msg,
								to : data.to,
								sender_name:sender_name
							}, 
							'en':data.en,
							'sc':1}, 
							RoomInfo.players[to].playerInfo.clientId);
					}
				}else{

					commonClass.SendData({
							data:{
								type : data.type,
								from : data.user_id,
								msg : msg,
								sender_name:sender_name
							}, 
							'en':data.en,
							'sc':1}, 
							roomId);
				}


			}else{
				printLog('user not found');
			}

		});
	},
	CA:function(data, socket){

		var en = data.en;
		if(typeof data.data == 'undefined'){
			commonClass.SendData({'Message' : 'CA request is not in data object', 'en':data.en, 'sc':0}, socket.id);
			return false;
		}
		var data=data.data;
		data['en']=en;


		if(typeof data.user_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'CA user_id is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		if(typeof data.avatar == 'undefined'){
			commonClass.SendData({ 'Message' : 'CA avatar is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		if(typeof data.un == 'undefined'){
			commonClass.SendData({ 'Message' : 'CA un is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		
		var user_id = objectId(data.user_id);
		var avatar = data.avatar;
		
		var upWhere = { $set: { pp :  '/images/user_avatar/'+avatar, 'un':data.un }};
		userSettingCases.userFindUpdate(upWhere, user_id,function(err,res){

			if(res){
				
				commonClass.SendData({ info:res.value.pp, 'en':data.en, 'sc':1}, socket.id);
			}
		});
	},
	getDailyBonusAmount:function(day, callback){

		if(day == 1){
			var amount = 250;
		}else if(day == 2){
			var amount = 500;
		}else if(day == 3){
			var amount = 1000;
		}else if(day >= 4 && day <= 10){
			var amount = 3000;
		}else if(day >= 11 && day <= 15){
			var amount = 5000;
		}else if(day >= 16 && day <= 20){
			var amount = 7500;
		}else if(day >= 21){
			var amount = 10000;
		}

		callback(amount);
	},
	addDailyBonus:function(user_id, day, amount, bonus_collected_time, data, socket, callback){

		var upWhere = {$set: { "counters.dbc" : day, "lasts.lbct": bonus_collected_time}, $inc: { "chips": amount }};
 		userSettingCases.userFindUpdate(upWhere, user_id, function(err, res){
			
			commonClass.SendData({ chips:res.value.chips, 'en':data.en, 'sc':1}, socket.id);
			db.collection('game_chips_tracker').insertOne({chips : amount, type : 'credit', msg : 'Daily bonus', uid : user_id, createdOn: new Date()});

		});
	},
	updateUserData:function(data, user_id, callback){

 		db.collection('game_users').updateOne({_id: user_id},data, callback);
	},
	getUserData:function(user_id, callback){

		db.collection('game_users').findOne( {_id:user_id},callback);
	},
	clearUserRoomData:function(user_id, callback){
		
		var upWhere = {$set: {}};
		upWhere.$set.roomId = '';
		upWhere.$set.roomSeat = '';
		upWhere.$set.status = 0;
		upWhere.$set.tnmtId = '';
		userSettingCases.updateUserData(upWhere, user_id, callback);
	},
	userFindUpdate:function(data, user_id, callback){
		
		db.collection('game_users').findOneAndUpdate({_id: user_id},data,{returnOriginal:false},callback);
	},
	getUserDataBySocket:function(socketId, callback){

		db.collection('game_users').findOne( {socketId:socketId},callback);
	},
	updateUserDataBySocket:function(socketId, data, callback){
 		db.collection('game_users').updateOne({socketId: socketId},data, callback);
	},
	userManageCoin:function(coin, user_id, callback){

        var upWhere = { $inc: { "coins" : coin}};
 		db.collection('game_users').updateOne({_id: user_id},upWhere, callback);
	},
	getLuckyCard:function(callback){

		db.collection('game_options').findOne( { TYPE : "LUCKYCARD" }, callback);
	}
}