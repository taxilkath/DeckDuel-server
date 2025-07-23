module.exports = {
	COSL:function(data, socket){

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
		

		db.collection('game_coinstore').find({}).sort( { price: -1 } ).toArray(function(err, chipstoreInfo){
			commonClass.SendData({'data':chipstoreInfo,'en':data.en, 'sc':1}, socket.id);
		});
	},
	CIAP:function(data, socket){

		var en = data.en;
		if(typeof data.data == 'undefined'){
			commonClass.SendData({'Message' : 'CIAP request is not in data object', 'en':data.en, 'sc':0}, socket.id);
			return false;
		}
		var data=data.data;
		data['en']=en;


		if(typeof data.user_id == 'undefined'){
			commonClass.SendData({ 'Message' : 'CIAP user_id is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		if(typeof data.ptype == 'undefined'){
			commonClass.SendData({ 'Message' : 'CIAP ptype is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		if(typeof data.pdata == 'undefined'){
			commonClass.SendData({ 'Message' : 'CIAP pdata is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}

		if(typeof data.productId == 'undefined'){
			commonClass.SendData({ 'Message' : 'CIAP productId is not defined','en':data.en, 'sc':0}, socket.id);
			return false;
		}



		var user_id = objectId(data.user_id);
		var ptype = data.ptype;
		var pdata = data.pdata;
		var productId = data.productId;


		if(ptype == 'chips'){

			db.collection('game_chipstore').findOne( { sku_id : productId }, function(err, result){

				if(result){

					var pchips = result.chips;
					chipsTrackerCases.insert({chips : pchips,type : 'credit', msg : 'purchase', "ct" : "chips", uid : user_id,},socket);
					userSettingCases.userFindUpdate({ $inc: { chips :  pchips} }, user_id, function(err, userInfo){
						
						commonClass.SendData({'chips':userInfo.value.chips, ptype:ptype, pchips:pchips,'en':data.en, 'sc':1}, socket.id);

					});
				}else{

					commonClass.SendData({ 'Message' : 'Purchase verification failed.','en':data.en, 'sc':0}, socket.id);
				}		
			});


		}else{

			db.collection('game_coinstore').findOne( { sku_id : productId }, function(err, result){

				if(result){

					var pcoin = result.coin;
					chipsTrackerCases.insertOne({chips : pcoin,type : 'credit', msg : 'purchase', "ct" : "coins", uid : user_id,},socket);
					userSettingCases.userFindUpdate({ $inc: { coins :  pcoin} }, user_id, function(err, userInfo){
						
						commonClass.SendData({'coins':userInfo.value.coins, pcoin:pcoin, ptype:ptype, 'en':data.en, 'sc':1}, socket.id);

					});
				}else{

					commonClass.SendData({ 'Message' : 'Purchase verification failed.','en':data.en, 'sc':0}, socket.id);
				}		
			});

		}
	}
	
	
}