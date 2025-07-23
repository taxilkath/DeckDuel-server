module.exports = {
	robotTurn:function (roomId, turn, socket){

		tablesManager.GetTableInfo(roomId, function(err,roomInfo){
			
			if(roomInfo){

				printLog('\n\n\nauto case robot turn');

				playingCases.getDiceValue(roomInfo, turn.uid, true, function(diceValue){

					var data = {
						en : "TT",
						dv : diceValue,
						user_id : turn.uid.toString()
					}

					if(diceValue == 6 && roomInfo.players[turn.uid].totaldv6 == 2){

						data['type'] = 1;
						playingCases.skipTurn(data, roomInfo, turn.uid, socket);

					}else{

						var userPawns = roomInfo.players[turn.uid].pawns;
						var uniqUserPawns = _.uniq(userPawns);
						
						var gotohome = autoCases.check_any_pawn_go_to_home(turn, diceValue);

						if(gotohome !=''){

							data['pawnMoveIndex'] = autoCases.getNextMoveablePostion(gotohome, diceValue, turn.positions);
							data['pawnIndex'] = turn.pawns.indexOf(gotohome);
							data['type'] = 2;
							playingCases.handleTT(data, roomInfo, turn.uid, socket);

						}else{
							printLog('notdsadasd');
							
							if(uniqUserPawns.length == 1 && userPawns[0] == 'B70'){

								autoCases.helperAllB70(diceValue, turn, data, roomInfo, socket);

							}else{


								var pawnIndexOf = userPawns.indexOf('B70');
								if(diceValue == 6 && pawnIndexOf > -1){
									
									printLog('\n\n if');
									autoCases.helperB70Kill(pawnIndexOf, diceValue, turn, data, roomInfo, socket);

								}else{

									printLog('else');

									var killInfo = autoCases.helperCheckKill(diceValue, turn, data, roomInfo, socket);
									if(killInfo.length > 0){

										data['pawnMoveIndex'] = killInfo[0].pawn_tomove;
										data['pawnIndex'] = killInfo[0].pawn_pos;
										data['type'] = 2;
										playingCases.handleTT(data, roomInfo, turn.uid, socket);

									}else{
										
										printLog('no kill');

										var safe_pawn = autoCases.helperCheckUserSafePosition(diceValue, turn, roomInfo);
										if(safe_pawn.length > 0){

											data['pawnMoveIndex'] = safe_pawn[0].pawn_tomove;
											data['pawnIndex'] = safe_pawn[0].pawn_pos;
											data['type'] = 2;
											playingCases.handleTT(data, roomInfo, turn.uid, socket);

										}else{

											printLog('no nearest safe');
											var double_pawn_safe = autoCases.helperCheckDoublePawnSafePosition(diceValue, turn);
											if(double_pawn_safe.length > 0){

												data['pawnMoveIndex'] = double_pawn_safe[0].pawn_tomove;
												data['pawnIndex'] = double_pawn_safe[0].pawn_pos;
												data['type'] = 2;
												playingCases.handleTT(data, roomInfo, turn.uid, socket);

											}else{

												printLog('no Double pawns');
		    									var maxposition = autoCases.get_maxposition(turn.pawns, turn.positions);
												var is_near_other_pawn = autoCases.is_near_other_pawn(maxposition, turn.positions, roomInfo, turn);
												if(is_near_other_pawn){

													printLog('is_near_other_pawn');
													printLog(is_near_other_pawn);
													
													data['pawnMoveIndex'] = autoCases.getNextMoveablePostion(maxposition.val, diceValue, turn.positions);
													data['pawnIndex'] = turn.pawns.indexOf(maxposition.val);
													data['type'] = 2;
													playingCases.handleTT(data, roomInfo, turn.uid, socket);

												}else{

													printLog('no nearest pawns');
													var near_pawn = autoCases.other_home_nearest_pawn(roomInfo, turn);
													printLog(near_pawn);

													if(near_pawn!=''){

														data['pawnMoveIndex'] = autoCases.getNextMoveablePostion(near_pawn, diceValue, turn.positions);
														data['pawnIndex'] = turn.pawns.indexOf(near_pawn);
														data['type'] = 2;
														playingCases.handleTT(data, roomInfo, turn.uid, socket);

													}else{

														printLog('no nearest home pawns');
														printLog(maxposition);

														var pawnMoveIndex = autoCases.getNextMoveablePostion(maxposition.val, diceValue, turn.positions);
														printLog('\n\npawnMoveIndex');
														printLog(pawnMoveIndex);

														var pawnMoveInfo = autoCases.getPawnPositionInfo(pawnMoveIndex);
														printLog('pawnMoveInfo');
														printLog(pawnMoveInfo);

														if(pawnMoveInfo.a == 'A'){

															if(pawnMoveInfo.n > 5){

																printLog('other pawns move');
																var removepawn = ["B70", "A5"];
																removepawn.push(maxposition.val);
																var updatedUserPawns = _.difference(turn.pawns, removepawn);
																
																var nextmovablepawn = autoCases.check_any_pawn_movable(updatedUserPawns, diceValue, turn);
																printLog('\nnextmovablepawn');
																printLog(nextmovablepawn);
																if(nextmovablepawn == ''){

																	data['type'] = 1;
																	playingCases.skipTurn(data, roomInfo, turn.uid, socket);

																}else{

																	data['pawnMoveIndex'] = autoCases.getNextMoveablePostion(nextmovablepawn, diceValue, turn.positions);
																	data['pawnIndex'] = turn.pawns.indexOf(nextmovablepawn);
																	data['type'] = 2;
																	playingCases.handleTT(data, roomInfo, turn.uid, socket);
																}

															}else{

																data['pawnMoveIndex'] = pawnMoveIndex;
																data['pawnIndex'] = turn.pawns.indexOf(maxposition.val);
																data['type'] = 2;
																playingCases.handleTT(data, roomInfo, turn.uid, socket);
															}
														}else{

															data['pawnMoveIndex'] = pawnMoveIndex;
															data['pawnIndex'] = turn.pawns.indexOf(maxposition.val);
															data['type'] = 2;
															playingCases.handleTT(data, roomInfo, turn.uid, socket);
														}




													}
												}
												
												
											}

										}

									}
									
								}

							}
						}
					}



				});
					
			}
		});
	},
	turnTimeOut:function(roomId, currentTurnId, socket){
	},
	getNextMoveablePostion:function(pawnPosition, diceValue, positions){

	    var currentPawn = autoCases.getPawnPositionInfo(pawnPosition);
	    var endPawn = autoCases.getPawnPositionInfo(positions.end);

	    if(currentPawn.n + diceValue > 52){

	        var nextMoveablePawn = ((currentPawn.n + diceValue) - (52+1));

	    }else{
	        
	        var nextMoveablePawn = (currentPawn.n + diceValue);
	    }

    	if(currentPawn.n <= endPawn.n && currentPawn.n + diceValue > endPawn.n){
		// if(currentPawn.n < endPawn.n && nextMoveablePawn > endPawn.n){
        	return 'A'+(((currentPawn.n + diceValue) % endPawn.n)-1);

		}else{

			if(currentPawn.a == 'A'){
            
	            return 'A'+nextMoveablePawn;

	        }else{

	            return 'B'+nextMoveablePawn;
	        }
		}
	},
	getPreviousMoveablePostion:function(pawnPosition, diceValue, turn){

	    var currentPawn = autoCases.getPawnPositionInfo(pawnPosition);
	    var endPawn = autoCases.getPawnPositionInfo(turn.positions.end);

	    if(currentPawn.n - diceValue > 52){

	        var nextMoveablePawn = ((currentPawn.n - diceValue) - (52+1));

	    }else{
	        
	        if(currentPawn.n - diceValue < 0){

	            var nextMoveablePawn = (currentPawn.n - diceValue)+53;

	        }else{

	            var nextMoveablePawn = (currentPawn.n - diceValue);
	        }
	    }

	    if(currentPawn.n < endPawn.n && nextMoveablePawn > endPawn.n){

	        return 'A'+nextMoveablePawn;

	    }else{

	        return 'B'+nextMoveablePawn;
	    }
	},
	getPawnPositionInfo:function(pawnPosition){

	    return {
	        a : pawnPosition.substring(0, 1),
	        n : parseInt(pawnPosition.substring(1, 3)),
	    };
	},
	helperAllB70:function(diceValue, turn, data, roomInfo, socket){

		if(diceValue == 6){

			data['pawnMoveIndex'] = turn.positions.start;
			data['pawnIndex'] = 0;
			data['type'] = 2;
			playingCases.handleTT(data, roomInfo, turn.uid, socket);

		}else{

			data['type'] = 1;
			playingCases.skipTurn(data, roomInfo, turn.uid, socket);

		}
	},
	helperB70Kill:function(pawnIndexOf, diceValue, turn, data, roomInfo, socket){
		var killInfo = autoCases.helperCheckKill(diceValue, turn, data, roomInfo, socket);

		if(killInfo.length > 0){

			data['pawnMoveIndex'] = killInfo[0].pawn_tomove;
			data['pawnIndex'] = killInfo[0].pawn_pos;
			data['type'] = 2;
			playingCases.handleTT(data, roomInfo, turn.uid, socket);

		}else{

			printLog('helperB70Kill else');

			var safe_pawn = autoCases.helperCheckUserSafePosition(diceValue, turn, roomInfo);
			if(safe_pawn.length > 0){

				data['pawnMoveIndex'] = safe_pawn[0].pawn_tomove;
				data['pawnIndex'] = safe_pawn[0].pawn_pos;
				data['type'] = 2;
				playingCases.handleTT(data, roomInfo, turn.uid, socket);

			}else{

				var double_pawn_safe = autoCases.helperCheckDoublePawnSafePosition(diceValue, turn);
				if(double_pawn_safe.length > 0){

					data['pawnMoveIndex'] = double_pawn_safe[0].pawn_tomove;
					data['pawnIndex'] = double_pawn_safe[0].pawn_pos;
					data['type'] = 2;
					playingCases.handleTT(data, roomInfo, turn.uid, socket);

				}else{

					data['pawnMoveIndex'] = turn.positions.start;
					data['pawnIndex'] = pawnIndexOf;
					data['type'] = 2;
					playingCases.handleTT(data, roomInfo, turn.uid, socket);
				}
			}
		}
	},
	helperCheckKill:function(diceValue, turn, data, roomInfo, socket, callback){

		var updatedUserPawns = _.difference(turn.pawns, ["B70", "A5"]);
		var die_info = [];

		_.each(updatedUserPawns, function(value) {

			var pawnMoveIndex = autoCases.getNextMoveablePostion(value, diceValue, turn.positions);
			if( roomInfo.nodie.indexOf(pawnMoveIndex) < 0 ){
				
				var dieinfo = autoCases.helperCheckKill2(pawnMoveIndex, turn, roomInfo, value);
				
				if(dieinfo.length > 0){

					die_info = dieinfo;
					return false;
				}
			}

		});

		return die_info;
	},
	helperCheckKill2:function(pawnMoveIndex, turn, roomInfo, pawn){

		var die_info = [];

		if( roomInfo.nodie.indexOf(pawnMoveIndex) < 0 ){

		    _.forEach(roomInfo.players, function(value, key) {

		        var pawn_index = value.pawns.indexOf(pawnMoveIndex);
		        if( pawn_index > -1 && value.uid.toString() != turn.uid.toString()){
		                
		            var total_pawns_in_position = _.filter(value.pawns, function(o) { 
		                if (o == pawnMoveIndex) return o 
		            }).length;

		            if(total_pawns_in_position == 1){

		            	var pawnIndex = turn.pawns.indexOf(pawn);
		                die_info.push({"slot": value.slot, pawn_pos : pawnIndex, pawn_tomove:pawnMoveIndex});
		            }
		        }
		    });
		}

		return die_info;
	},
	helperCheckUserSafePosition:function(diceValue, turn, roomInfo){

		var safe_pawn = [];

		var updatedUserPawns = _.difference(turn.pawns, ["B70", "A5"]);
		_.each(updatedUserPawns, function(value) {

			var pawnMoveIndex = autoCases.getNextMoveablePostion(value, diceValue, turn.positions);
			if( roomInfo.nodie.indexOf(pawnMoveIndex) > -1 ){

				safe_pawn = [{
					pawn_tomove : pawnMoveIndex,
	        	 	pawn_pos : turn.pawns.indexOf(value)

				}];
				return false;
			}
		});

		return safe_pawn;
	},
	helperCheckDoublePawnSafePosition:function(diceValue, turn){

		var double_pawn_safe = [];
		var updatedUserPawns = _.difference(turn.pawns, ["B70", "A5"]);
		_.each(updatedUserPawns, function(value) {

			var pawnMoveIndex = autoCases.getNextMoveablePostion(value, diceValue, turn.positions);
			if( turn.pawns.indexOf(pawnMoveIndex) > -1 ){
				
				double_pawn_safe = [{
					pawn_tomove : pawnMoveIndex,
	        	 	pawn_pos : turn.pawns.indexOf(value)

				}];
				return false;
			}

		});
		return double_pawn_safe;
	},
	get_maxposition:function(user_pawn, positions){

	    var updatedUserPawns = _.difference(user_pawn, ["B70", "A5"]);
	    var end_positions = autoCases.getPawnPositionInfo(positions.end);

	    var neg = [], pos = [], maxposition = '';

	    _.each(updatedUserPawns, function(value) {

	        var valuePositions = autoCases.getPawnPositionInfo(value);
	        var diffPosition = end_positions.n - valuePositions.n;

	        if(diffPosition >= 0){
	            pos.push({diff:diffPosition, val : value});
	        }else{
	            neg.push({diff:diffPosition, val : value});
	        }
	    });

	    if(pos.length > 0){

	       maxposition = _.maxBy(pos, function(o) { return o.diff; });
	        
	    }else{
	       
	       maxposition = _.minBy(neg, function(o) { return o.diff; });
	    }

	    return maxposition;
	},
	is_near_other_pawn:function(maxposition, positions, RoomInfo, turn){
    	
	    var next_positions = [];
	    for (var i = 1; i <= 6; i++) {
	       
	       next_positions.push(autoCases.getNextMoveablePostion(maxposition.val, i, positions));
	    };

	    for (var i = 1; i <= 6; i++) {
	       
	       next_positions.push(autoCases.getPreviousMoveablePostion(maxposition.val, i, turn));
	    };

	    var updated_next_positions = _.difference(next_positions, ["A0", "A1", "A2", "A3", "A4", "A5"]);
	    printLog(updated_next_positions);

	    var is_near_other_pawn = 0, pawn = '';
	    _.each(RoomInfo.players, function(value){

	        if( value.uid.toString() != turn.uid.toString() ){

	            if(is_near_other_pawn == 0){
	                _.each(value.pawns, function(pawn_value){
	                    
	                    if(updated_next_positions.indexOf(pawn_value) > -1){
	                        is_near_other_pawn = 1;
	                        return false;
	                    }

	                });
	            }else{
	                return false;
	            }

	        }
	    });

	    return is_near_other_pawn;
	},
	other_home_nearest_pawn:function(RoomInfo, turn){

	    var indexOfHomeNearest = [];
	    _.each(RoomInfo.players, function(value){

	        if(value.uid.toString() != turn.uid.toString()){

	            for (var i = 1; i <= 6; i++) {
	           
	               indexOfHomeNearest.push(autoCases.getNextMoveablePostion(value.positions.start, i, turn.positions));
	            };
	        }
	    });

	    printLog();
	    var pawn_index = '';
	    _.each(turn.pawns, function(value){

	    	printLog(value);
	        if(indexOfHomeNearest.indexOf(value) > -1){
	            pawn_index = value;
	            return false;
	        }
	    });


	    printLog(pawn_index);
	    printLog(indexOfHomeNearest);
	    return pawn_index;
	},
	check_any_pawn_movable:function(pawns, diceValue, turn){

	    var nextMoveablePawn = '';
	    _.each(pawns, function(value){

	        var pawnMoveIndex = autoCases.getNextMoveablePostion(value, diceValue, turn.positions);
	        var pawnMoveInfo = autoCases.getPawnPositionInfo(pawnMoveIndex);

	        if(pawnMoveInfo.a == "A" && pawnMoveInfo.n > 5){
	            //condition
	        }else{

	            nextMoveablePawn = value;
	            printLog(pawnMoveInfo);
	            return false;
	        }

	    })

	    return nextMoveablePawn;
	},
	check_any_pawn_go_to_home:function(turn, diceValue){

		var nextMoveablePawn = '';
		_.each(turn.pawns, function(value){

		    var pawnMoveIndex = autoCases.getNextMoveablePostion(value, diceValue, turn.positions);
		    var pawnMoveInfo = autoCases.getPawnPositionInfo(pawnMoveIndex);

		    if(pawnMoveInfo.a == "A" && pawnMoveInfo.n == 5){
		        nextMoveablePawn = value;
		        printLog(pawnMoveInfo);
		        return false;
		    }
		})

		return nextMoveablePawn;
	}

}
