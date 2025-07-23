module.exports = {
	otherUserWaitngTimer:function(roomId, socket, callback){

		printLog("\n\n\notherUserWaitngTimer>>>"+roomId);
		let startTime = new Date(Date.now() + config.ROBOT_ADD_TIMER);
		var timerId = commonClass.GetRandomString(20);
		schedule.scheduleJob(timerId,startTime, function(){
		  	tablesManager.addBot(roomId,socket);
		});

		timerClass.updateTimer(roomId, timerId)
		// timerClass.cancelTimer(data._id, timerId);
	},
	updateTimer:function(roomId, timerId){

		if( (null != roomId && roomId !="") && (null != timerId && timerId !="") ){
			var upWhere = {$set: {}};
			upWhere.$set.timerid = timerId;
			upWhere.$set.utime = new Date(Date.now());
		  	tablesManager.RoomUpdate(roomId,upWhere);
		}
	},
	cardDistributeTimer:function(roomId, socket){

		if( (null != roomId && roomId !="") ){

			let startTime = new Date(Date.now() + config.GAME_CARD_DISTRIBUTE_TIMER);
			var timerId = commonClass.GetRandomString(20);
			schedule.scheduleJob(timerId,startTime, function(){
				playingCases.distributeCards(roomId, socket);
			});

		}
	},
	cancelTimer:function(roomId, timerId, callback){

		// printLog('cancelTimer>>>>roomId>>>>'+roomId+'>>>>timerId>>>>'+timerId);
		if( (null != roomId && roomId !="") && (null != timerId && timerId !="") ){

			try{
				//job schedule cancel
				var my_job = schedule.scheduledJobs[timerId];
				my_job.cancel();
				
			}catch(e){

			}
			var upWhere = {$set: {}};
			upWhere.$set.timerid='';
		  	tablesManager.RoomUpdate(roomId,upWhere, function(err, data){
		  		callback(true);
		  	});
		}else{
		  	callback(true);
		}
	},
	gameStartTimer:function(roomId, socket){

		printLog('gameStartTimer');
		// printLog(roomId);
		if( roomId !="" ){
			
			commonClass.SendData({'data':{ 'time':config.GAME_START_SERVICE_TIMER}, 'en':'GST', 'sc':1}, roomId);

			let startTime = new Date(Date.now() + config.GAME_START_SERVICE_TIMER_D);
			var timerId = commonClass.GetRandomString(20);
			schedule.scheduleJob(timerId,startTime, function(){

				playingCases.gameStart(roomId, socket);
			});


			var upWhere = {$set: {}};
			upWhere.$set.timerid = timerId;
			upWhere.$set.igt = true;
			upWhere.$set.sbc = 0;
			upWhere.$set.fbc = 0;
			upWhere.$set.totalBid = 0;
			upWhere.$set.timerType = 'gameStart';

			upWhere.$set.utime = moment().format('YYYY-MM-DD HH:mm:ss');
		  	tablesManager.RoomUpdate(roomId,upWhere, function(err, data){
		  	});

		}
	},
	firstBidSelectionTimer:function(roomId, socket){

		// printLog(roomId);
		if( roomId !="" ){
			
			commonClass.SendData({'data':{ 'time':config.GAME_FIRST_BID_TIMER}, 'en':'FBST', 'sc':1}, roomId);
			playingCases.selectFirstRobotBid(roomId, socket);

			let startTime = new Date(Date.now() + (config.GAME_FIRST_BID_TIMER+1000));
			var timerId = commonClass.GetRandomString(20);
			schedule.scheduleJob(timerId,startTime, function(){

				playingCases.firstBidComplete(roomId, socket);

			});


			var upWhere = {$set: {},$inc: {}};
			upWhere.$set.timerid = timerId;
			upWhere.$inc.bidSelectionCount = 1;

			upWhere.$set.utime = moment().format('YYYY-MM-DD HH:mm:ss');
		  	tablesManager.RoomUpdate(roomId,upWhere, function(err, data){
		  	});

		}
	},
	SecondBidSelectionTimer:function(roomId, socket){

		// printLog(roomId);
		if( roomId !="" ){
			
			commonClass.SendData({'data':{ 'time':config.GAME_SECOND_BID_TIMER}, 'en':'SBST', 'sc':1}, roomId);
			playingCases.selectSecondRobotBid(roomId, socket);

			let startTime = new Date(Date.now() + (config.GAME_SECOND_BID_TIMER+1000));
			var timerId = commonClass.GetRandomString(20);
			schedule.scheduleJob(timerId,startTime, function(){

				playingCases.cardDistribute(roomId, socket);
			});


			var upWhere = {$set: {},$inc: {}};
			upWhere.$set.timerid = timerId;
			upWhere.$inc.bidSelectionCount = 2;

			upWhere.$set.utime = moment().format('YYYY-MM-DD HH:mm:ss');
		  	tablesManager.RoomUpdate(roomId,upWhere, function(err, data){
		  	});

		}
	},
	NextTurnTimer:function(roomId, socket){
		let startTime = new Date(Date.now() + 2000);
		var timerId = commonClass.GetRandomString(20);
		schedule.scheduleJob(timerId,startTime, function(){
		  	playingCases.cardDistribute(roomId, socket);
		});

		var upWhere = {$set: {}};
		upWhere.$set.timerid = timerId;
		// upWhere.$set.utime = new Date(Date.now());
	  	tablesManager.RoomUpdate(roomId,upWhere, function(err, data){
	  		return true;
	  	});
	},
	selectVariation:function(roomId, currentTurnId, socket, callback){
		let startTime = new Date(Date.now() + config.GAME_VARIATION_SELECT_TIMER);
		var timerId = commonClass.GetRandomString(20);
		schedule.scheduleJob(timerId,startTime, function(){
		  	playingCases.autoSelectVariation(roomId, currentTurnId, socket);
		});

		var upWhere = {$set: {}};
		upWhere.$set.timerid = timerId;
		// upWhere.$set.utime = new Date(Date.now());
	  	tablesManager.RoomUpdate(roomId,upWhere, function(err, data){
	  		callback(true);
	  	});
	},
	firstTurnTimer:function(roomId, socket, callback){
		let startTime = new Date(Date.now() + 3000);
		var timerId = commonClass.GetRandomString(20);
		schedule.scheduleJob(timerId,startTime, function(){
		  	playingCases.nextTurn(roomId, socket);
		});

		var upWhere = {$set: {}};
		upWhere.$set.timerid = timerId;
		// upWhere.$set.utime = new Date(Date.now());
	  	tablesManager.RoomUpdate(roomId,upWhere, function(err, data){
	  		callback(true);
	  	});
	},
	WinnerTimer:function(roomId, socket, callback){

		printLog('WinnerTimer timer');
		let startTime = new Date(Date.now() + config.GAME_WIN_TIMER+2000);
		var timerId = commonClass.GetRandomString(20);
		schedule.scheduleJob(timerId,startTime, function(){
		  	timerClass.gameStartTimer(roomId, socket);
		});

		var upWhere = {$set: {}};
		upWhere.$set.timerid = timerId;
		upWhere.$set.igt = false;
		upWhere.$set.timerType = 'win';
		// upWhere.$set.utime = new Date(Date.now());
	  	tablesManager.RoomUpdate(roomId,upWhere, function(err, data){
	  		callback(true);
	  	});
	},
}