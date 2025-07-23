module.exports = {
	CSL:function(data, socket){

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
		

		db.collection('game_chipstore').find({}).sort( { chips: -1 } ).toArray(function(err, chipstoreInfo){
			commonClass.SendData({'data':chipstoreInfo,'en':data.en, 'sc':1}, socket.id);
		});
	},
	
	
}