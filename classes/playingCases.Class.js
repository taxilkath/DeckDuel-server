var libCards = require("./cards.js");

module.exports = {
  RL: function (data, socket) {
    var en = data.en;
    if (typeof data.data == "undefined") {
      commonClass.SendData(
        { Message: "RL request is not in data object", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }
    var data = data.data;
    data["en"] = en;

    if (typeof data.user_id == "undefined") {
      commonClass.SendData(
        { Message: "RL user_id is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    if (typeof data.roomId == "undefined") {
      commonClass.SendData(
        { Message: "RL roomId is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    var roomId = objectId(data.roomId);
    var user_id = objectId(data.user_id);

    tablesManager.GetTableInfo(roomId, function (err, RoomInfo) {
      if (RoomInfo) {
        var type = data.type === undefined ? "remove" : data.type;
        printLog("type>>>>" + type);
        playingCases.removeUser(RoomInfo, user_id, type, socket);
      } else {
        commonClass.SendData({ en: "RL", sc: 1 }, socket.id);
      }
    });
  },
  RJ: function (data, socket) {
    //room join
    printLog("rj called");

    var en = data.en;
    if (typeof data.data == "undefined") {
      commonClass.SendData(
        { Message: "RJ request is not in data object", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }
    var data = data.data;
    data["en"] = en;

    if (typeof data.user_id == "undefined") {
      commonClass.SendData(
        { Message: "RJ user_id is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    if (typeof data.roomId == "undefined") {
      commonClass.SendData(
        { Message: "RJ roomId is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    var user_id = objectId(data.user_id);
    var roomId = objectId(data.roomId);
    var rjtype = data.rjtype;

    db.collection("tbl_room").findOne(
      { _id: roomId },
      function (err, RoomInfo) {
        if (RoomInfo) {
          console.log("RoomInfo");

          if (RoomInfo.players[user_id]) {
            socket.join(RoomInfo._id);

            var setobj = {};
            setobj["players." + user_id + ".playerInfo.clientId"] = socket.id;
            tablesManager.RoomUpdate(
              RoomInfo._id,
              { $set: setobj },
              function (err, updateRoomData) {
                var timediff = require("timediff");
                var last_update = RoomInfo.utime;
                var startTime = new Date(Date.now());
                var diff = timediff(last_update, startTime, "s");
                diff["totalMilli"] = config.GAME_TURN_TIMER;
                if (config.GAME_TURN_TIMER < diff.milliseconds) {
                  diff["milliseconds"] = config.GAME_TURN_TIMER;
                }

                db.collection("game_users").updateOne(
                  { _id: user_id },
                  { $set: { socketId: socket.id } }
                );
                commonClass.SendData(
                  { data: RoomInfo, time: diff, rejoin: true, en: "JT", sc: 1 },
                  socket.id
                );
              }
            );
          } else {
            commonClass.SendData(
              {
                Message:
                  "You are removed from playing as you didn't take turn 3 times.",
                en: "RL",
                sc: 1,
              },
              socket.id
            );
          }
        } else {
          commonClass.SendData({ en: "RL", sc: 1 }, socket.id);
        }
      }
    );
  },
  SB: function (data, socket) {
    printLog("SB called");

    var en = data.en;
    if (typeof data.data == "undefined") {
      commonClass.SendData(
        { Message: "SB request is not in data object", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }
    var data = data.data;
    data["en"] = en;

    if (typeof data.user_id == "undefined") {
      commonClass.SendData(
        { Message: "SB user_id is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    if (typeof data.roomId == "undefined") {
      commonClass.SendData(
        { Message: "SB roomId is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    if (typeof data.bidType == "undefined") {
      // 0 = andar, 1 = bahar
      commonClass.SendData(
        { Message: "SB bidType is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    if (typeof data.bidAmount == "undefined") {
      commonClass.SendData(
        { Message: "SB bidAmount is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    var user_id = objectId(data.user_id);
    var roomId = objectId(data.roomId);
    var bidType = data.bidType;
    var bidAmount = data.bidAmount;

    db.collection("tbl_room").findOne(
      { _id: roomId },
      function (err, RoomInfo) {
        if (RoomInfo && RoomInfo.players[user_id]) {
          var userInfo = RoomInfo.players[user_id];
          var userChips = userInfo.playerInfo.chips;

          var addcard = bidType == 0 ? "andarCard" : "baharCard";
          var incobj = {};
          incobj["players." + user_id + ".playerInfo.chips"] = -bidAmount;
          incobj["players." + user_id + ".achips"] = -bidAmount;
          incobj["players." + user_id + "." + addcard + "Bid"] = bidAmount;
          incobj["totalBid"] = 1;

          tablesManager.RoomFindUpdate(
            RoomInfo._id,
            { $inc: incobj },
            function (err, result) {
              if (result.value) {
                chipsTrackerCases.insert(
                  {
                    chips: bidAmount,
                    type: "Debit",
                    msg: "Bid",
                    ct: "chips",
                    uid: user_id,
                  },
                  ""
                );
                db.collection("game_users").updateOne(
                  { _id: user_id },
                  { $inc: { chips: -bidAmount, cwchips: -bidAmount } }
                );

                commonClass.SendData(
                  {
                    data: {
                      slot: userInfo.slot,
                      bid: bidAmount,
                      bidType: data.bidType,
                    },
                    en: data.en,
                    sc: 1,
                  },
                  RoomInfo._id
                );

                var active_players = playingCases.getActivePlayersCount(
                  result.value.players
                );

                printLog("\n\n\nactive_players--->" + active_players);
                printLog("totalBid--->" + result.value.totalBid);
                printLog(
                  "bidSelectionCount--->" + result.value.bidSelectionCount
                );
                printLog("\n\n\n");

                if (active_players == result.value.totalBid) {
                  if (result.value.fbc == 0 && result.value.sbc == 0) {
                    timerClass.cancelTimer(
                      result.value._id,
                      result.value.timerid,
                      function (cancleData) {
                        printLog(result.value._id);
                        printLog(result.value.timerid);
                        printLog("firstBidComplete");
                        playingCases.firstBidComplete(result.value._id, socket);
                      }
                    );
                  }

                  if (result.value.fbc == 1 && result.value.sbc == 0) {
                    timerClass.cancelTimer(
                      result.value._id,
                      result.value.timerid,
                      function (cancleData) {
                        tablesManager.RoomFindUpdate(
                          result.value._id,
                          { $set: { sbc: 1, totalBid: 0 } },
                          function (err, roomInfo) {
                            playingCases.cardDistribute(
                              result.value._id,
                              socket
                            );
                          }
                        );
                      }
                    );
                  }
                }
              }
            }
          );
        } else {
          commonClass.SendData({ en: "RL", sc: 1 }, socket.id);
        }
      }
    );
  },
  SU: function (data, socket) {
    var en = data.en;
    if (typeof data.data == "undefined") {
      commonClass.SendData(
        { Message: "SU request is not in data object", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }
    var data = data.data;
    data["en"] = en;

    if (typeof data.user_id == "undefined") {
      commonClass.SendData(
        { Message: "SU user_id is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    if (typeof data.roomId == "undefined") {
      commonClass.SendData(
        { Message: "SU roomId is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    var roomId = objectId(data.roomId);
    var user_id = objectId(data.user_id);

    tablesManager.GetTableInfo(roomId, function (err, RoomInfo) {
      if (RoomInfo && RoomInfo.players[user_id]) {
        var unset = {},
          inc = {};
        unset["players." + user_id.toString()] = "";
        inc["tp"] = -1;

        var userSlot = RoomInfo.players[user_id].slot;
        RoomInfo.availableSlot[userSlot] = userSlot;

        var bchips = RoomInfo.players[user_id].bchips;
        var achips = RoomInfo.players[user_id].achips;

        tablesManager.RoomFindUpdate(
          roomId,
          {
            $unset: unset,
            $inc: inc,
            $set: { availableSlot: RoomInfo.availableSlot },
          },
          function (err, updateRoomData) {
            if (err) {
              printLog("err15");
              printLog(err);
            } else {
              var RoomInfo = updateRoomData.value;

              playingCases.ResponseSU(userSlot, achips - bchips, roomId);

              var ActivePlayers = playingCases.getActivePlayersCount(
                RoomInfo.players
              );
              var total_player = playingCases.getPlayersCount(RoomInfo.players);

              if (ActivePlayers == 0 && total_player > 0) {
                var setobj = {},
                  incobj = {};

                setobj["igs"] = false;
                setobj["timerType"] = "win";
                setobj["bidCard"] = "";
                setobj["otherCard"] = [];
                setobj["andarCard"] = [];
                setobj["baharCard"] = [];
                setobj["turn"] = 0;
                setobj["throwCard"] = [];
                incobj["bidSelectionCount"] = -RoomInfo.bidSelectionCount;

                _.each(RoomInfo.players, function (player) {
                  setobj["players." + player.uid + ".andarCardBid"] = 0;
                  setobj["players." + player.uid + ".baharCardBid"] = 0;
                  setobj["players." + player.uid + ".active"] = true;
                });

                tablesManager.RoomUpdate(
                  RoomInfo._id,
                  { $set: setobj, $inc: incobj },
                  function (err, result) {
                    if (!err) {
                      timerClass.gameStartTimer(RoomInfo._id, socket);
                    } else {
                      printLog(err);
                    }
                  }
                );
              }
            }
          }
        );
      } else {
        // printLog('not found');
      }
    });
  },
  selectFirstRobotBid: function (roomId, socket) {
    tablesManager.GetTableInfo(roomId, function (err, roomInfo) {
      if (roomInfo) {
        var number = [1, 2, 4, 8];
        var position = [0, 1, 1, 1];
        var setobj = {};

        _.each(roomInfo.players, function (item) {
          if (item.is_robot && item.active) {
            var bidAmount =
              roomInfo.tinfo.tblbet_value *
              number[Math.floor(Math.random() * number.length)];
            var bidType = position[Math.floor(Math.random() * position.length)];

            if (bidAmount <= item["playerInfo"].chips) {
              var data = {
                user_id: item.uid,
                roomId: roomId,
                bidType: bidType,
                bidAmount: bidAmount,
              };

              var dv = Math.floor(Math.random() * 5) + 2;

              setTimeout(function () {
                playingCases.SB({ data: data, en: "SB", sc: 1 }, socket);
              }, 1000 * dv);
            }
          }
        });
      }
    });
  },
  selectSecondRobotBid: function (roomId, socket) {
    tablesManager.GetTableInfo(roomId, function (err, roomInfo) {
      if (roomInfo) {
        var number = [1, 2, 4, 8];
        var position = [0, 1, 1, 1];
        var setobj = {};

        _.each(roomInfo.players, function (item) {
          if (item.is_robot && item.active) {
            var randomNumber = Math.floor(Math.random() * 3) + 1;
            if (randomNumber == 2) {
              var bidAmount =
                roomInfo.tinfo.tblbet_value *
                number[Math.floor(Math.random() * number.length)];
              var bidType =
                position[Math.floor(Math.random() * position.length)];

              if (bidAmount <= item["playerInfo"].chips) {
                var data = {
                  user_id: item.uid,
                  roomId: roomId,
                  bidType: bidType,
                  bidAmount: bidAmount,
                };

                var dv = Math.floor(Math.random() * 5) + 2;
                setTimeout(function () {
                  playingCases.SB({ data: data, en: "SB", sc: 1 }, socket);
                }, 1000 * dv);
              }
            }
          }
        });
      }
    });
  },
  firstBidComplete: function (roomId, socket) {
    tablesManager.GetTableInfo(roomId, function (err, roomInfo) {
      // printLog(err);
      if (roomInfo && roomInfo.fbc == 0 && roomInfo.sbc == 0) {
        tablesManager.RoomFindUpdate(
          roomInfo._id,
          { $set: { fbc: 1, totalBid: 0 } },
          function (err, roomInfo) {
            if (roomInfo.value) {
              var roomInfo = roomInfo.value;
              var setobj = {},
                incobj = {},
                pushobj = {},
                unsetobj = {},
                tp = 0;

              var total_players = playingCases.getPlayersCount(
                roomInfo.players
              );

              _.each(roomInfo.players, function (item) {
                if (item.active) {
                  if (item.andarCardBid == 0 && item.baharCardBid == 0) {
                    commonClass.SendData(
                      {
                        data: { slot: item.slot, type: "standup" },
                        en: "RL",
                        sc: 1,
                      },
                      roomInfo._id
                    );
                    roomInfo.availableSlot[item.slot] = item.slot;
                    setobj["availableSlot"] = roomInfo.availableSlot;
                    tp++;
                    unsetobj["players." + item.uid] = "";

                    userSettingCases.clearUserRoomData(
                      item.uid,
                      function (err, res) {}
                    );
                  }
                }
              });

              if (tp > 0) {
                incobj["tp"] = -tp;

                tablesManager.RoomFindUpdate(
                  roomInfo._id,
                  { $unset: unsetobj, $inc: incobj, $set: setobj },
                  function (err, res) {
                    if (!err) {
                      var activePlayer = playingCases.getActivePlayersCount(
                        res.value.players
                      );
                      if (activePlayer > 0) {
                        playingCases.cardDistribute(roomId, socket);
                      } else {
                        if (res.value.tp == 0) {
                          db.collection("tbl_room").deleteOne({ _id: roomId });
                        } else {
                          var total_player = playingCases.getPlayersCount(
                            res.value.players
                          );
                          if (total_player > 0) {
                            timerClass.gameStartTimer(roomInfo._id, socket);
                          }
                        }
                      }
                    }
                  }
                );
              } else {
                playingCases.cardDistribute(roomId, socket);
              }
            }
          }
        );
      }
    });
  },
  gameStart: function (roomId, socket) {
    tablesManager.GetTableInfo(roomId, function (err, roomInfo) {
      if (roomInfo) {
        var total_player = playingCases.getPlayersCount(roomInfo.players);
        var total_robot = playingCases.getRobotCount(roomInfo.players);

        printLog("game start");
        printLog("total_player");
        printLog(total_player);

        if (total_player > 0) {
          var pack = cardClass.createPack();
          var myPack = cardClass.shufflePack(pack);
          var bidCard = cardClass.draw(myPack, 1, "", true);
          var otherCard = cardClass.draw(myPack, 51, "", true);

          var setobj = {};
          setobj["igs"] = true;
          setobj["bidCard"] = bidCard[0];
          setobj["otherCard"] = otherCard;

          _.each(roomInfo.players, function (player) {
            setobj["players." + player.uid + ".andarCardBid"] = 0;
            setobj["players." + player.uid + ".baharCardBid"] = 0;
            setobj["players." + player.uid + ".active"] = true;
          });

          commonClass.SendData(
            { data: { card: bidCard[0] }, en: "BIDCARD", sc: 1 },
            roomId
          );

          tablesManager.RoomFindUpdate(
            roomInfo._id,
            { $set: setobj },
            function (err, res) {
              var RoomInfo = res.value;
              // printLog(err)
              // printLog(RoomInfo)
              if (RoomInfo) {
                var ActivePlayers = playingCases.getActivePlayersCount(
                  RoomInfo.players
                );
                if (ActivePlayers > 0 && RoomInfo.igs == true) {
                  playingCases.addUserPlayMatch(roomInfo.players, roomId);
                  timerClass.firstBidSelectionTimer(roomInfo._id, socket);
                }
              }
            }
          );
        }
      }
    });
  },
  cardDistribute: function (roomId, socket) {
    tablesManager.GetTableInfo(roomId, function (err, roomInfo) {
      if (roomInfo) {
        if (roomInfo.otherCard.length > 0) {
          var pushobj = {},
            setobj = {},
            pullobj = {},
            deckCards = roomInfo.otherCard;

          if (deckCards.length > 0) {
            if (
              roomInfo.throwCard.length == 2 &&
              roomInfo.bidSelectionCount == 1
            ) {
              timerClass.SecondBidSelectionTimer(roomInfo._id, socket);
            } else {
              var newTakenCard = _.last(deckCards);
              var addcard = roomInfo.turn == 0 ? "andarCard" : "baharCard";
              pushobj[addcard] = newTakenCard;
              pushobj["throwCard"] = newTakenCard;
              pullobj["otherCard"] = newTakenCard;
              setobj["turn"] = playingCases.nextTurn(roomInfo.turn);
              setobj["utime"] = new Date(Date.now());

              tablesManager.RoomFindUpdate(
                roomInfo._id,
                { $set: setobj, $push: pushobj, $pull: pullobj },
                function (err, result) {
                  if (!err) {
                    printLog(roomInfo._id);
                    commonClass.SendData(
                      {
                        data: { card: newTakenCard, type: roomInfo.turn },
                        en: "TC",
                        sc: 1,
                      },
                      roomInfo._id
                    );

                    var bidCardDetail = libCards.cardValue(roomInfo.bidCard);
                    var NewCardDetail = libCards.cardValue(newTakenCard);

                    if (bidCardDetail.number == NewCardDetail.number) {
                      printLog(addcard + "--->winner");

                      var winnerInfo = [];
                      var setobj = {},
                        incobj = {};

                      setobj["igs"] = false;
                      setobj["timerType"] = "win";
                      setobj["bidCard"] = "";
                      setobj["otherCard"] = [];
                      setobj["andarCard"] = [];
                      setobj["baharCard"] = [];
                      setobj["turn"] = 0;
                      setobj["throwCard"] = [];
                      incobj["bidSelectionCount"] = -roomInfo.bidSelectionCount;

                      _.each(roomInfo.players, function (player) {
                        var lost =
                          addcard == "baharCard"
                            ? "andarCardBid"
                            : "baharCardBid";
                        printLog("lost");
                        printLog("addcard==>" + addcard);
                        printLog(lost);
                        printLog(player[lost]);

                        var playerBid = player[addcard + "Bid"];
                        if (playerBid > 0) {
                          var winAmount = playerBid * 2;

                          winnerInfo.push({
                            slot: player.slot,
                            winAmount: winAmount,
                            lostAmount: player[lost],
                          });

                          incobj[
                            "players." + player.uid + ".playerInfo.chips"
                          ] = winAmount;
                          incobj["players." + player.uid + ".achips"] =
                            winAmount;
                          incobj["players." + player.uid + ".tgw"] = 1;

                          chipsTrackerCases.insert(
                            {
                              chips: winAmount,
                              type: "Credit",
                              msg: "Win",
                              ct: "chips",
                              uid: player.uid,
                            },
                            ""
                          );
                          db.collection("game_users").updateOne(
                            { _id: objectId(player.uid) },
                            {
                              $inc: {
                                chips: winAmount,
                                cwchips: winAmount,
                                "result.gw": 1,
                              },
                            }
                          );
                        } else {
                          winnerInfo.push({
                            slot: player.slot,
                            winAmount: 0,
                            lostAmount: player[lost],
                          });
                        }

                        setobj["players." + player.uid + ".andarCardBid"] = 0;
                        setobj["players." + player.uid + ".baharCardBid"] = 0;
                        setobj["players." + player.uid + ".active"] = true;
                      });

                      tablesManager.RoomUpdate(
                        roomInfo._id,
                        { $set: setobj, $inc: incobj },
                        function (err, result) {
                          if (!err) {
                            if (winnerInfo.length > 0) {
                              printLog("winner");
                              printLog(winnerInfo);

                              commonClass.SendData(
                                {
                                  data: {
                                    winnerInfo: winnerInfo,
                                    timer: config.GAME_WIN_TIMER,
                                  },
                                  en: "WIN",
                                  sc: 1,
                                },
                                roomInfo._id
                              );

                              timerClass.WinnerTimer(
                                roomInfo._id,
                                socket,
                                function (wtdata) {}
                              );
                            } else {
                              printLog("else next game start");
                            }
                          } else {
                            printLog(err);
                          }
                        }
                      );
                    } else {
                      timerClass.NextTurnTimer(roomInfo._id, socket);
                    }
                  } else {
                    printLog(err);
                  }
                }
              );
            }
          }
        }
      }
    });
  },
  decideDeal: function (RoomInfo) {
    var players = RoomInfo.players;
    var firstPlayer = null,
      dealFound = false,
      isFirst = true,
      dealPlayer;
    for (var player in players) {
      if (players[player].active) {
        if (isFirst) {
          firstPlayer = players[player];
          isFirst = false;
        }
        if (players[player].deal === true) {
          // players[player].deal = false;
          dealPlayer = players[player];
          dealFound = true;
        }
      }
    }
    if (!dealFound) {
      return firstPlayer;
    } else {
      var nextPlayer = playingCases.getNextActivePlayer(
        RoomInfo,
        dealPlayer.uid,
        "106"
      );
      return nextPlayer;
    }
  },
  decideTurn: function (RoomInfo) {
    var players = RoomInfo.players;
    var firstPlayer = null,
      dealFound = false,
      isFirst = true,
      dealPlayer;

    for (var player in players) {
      if (players[player].active) {
        if (isFirst) {
          firstPlayer = players[player];
          isFirst = false;
        }

        if (players[player].deal === true) {
          dealPlayer = players[player];
          dealFound = true;
        }
      }
    }

    if (!dealFound) {
      return firstPlayer;
    } else {
      var nextPlayer = playingCases.getNextActivePlayer(
        RoomInfo,
        dealPlayer.uid,
        "107"
      );
      return nextPlayer;
    }
  },
  getPrevActivePlayer: function (roomInfo, id) {
    var slot = roomInfo.players[id].slot,
      num = slot.substr(4) * 1;

    for (var count = 0; count <= 4; count++) {
      num--;
      num = Math.abs(num);

      if (num > 4) {
        num = num % 5;
      }
      if (roomInfo.availableSlot["slot" + num]) {
        continue;
      }
      if (playingCases.getPlayerBySlot("slot" + num)) {
        if (
          !playingCases.getPlayerBySlot("slot" + num).active ||
          playingCases.getPlayerBySlot("slot" + num).packed
        ) {
          continue;
        } else {
          break;
        }
      }
    }

    var newPlayer = playingCases.getPlayerBySlot(
      roomInfo.players,
      "slot" + num
    );
    return newPlayer;
  },
  getNextActivePlayer: function (roomInfo, id, type = "") {
    if (roomInfo.players[id].slot) {
      var slot = roomInfo.players[id].slot,
        num = slot.substr(4) * 1;

      for (var count = 0; count <= 4; count++) {
        num++;
        if (num > 4) {
          num = num % 5;
        }
        if (roomInfo.availableSlot["slot" + num]) {
          continue;
        }
        if (playingCases.getPlayerBySlot(roomInfo.players, "slot" + num)) {
          if (
            !playingCases.getPlayerBySlot(roomInfo.players, "slot" + num)
              .active ||
            playingCases.getPlayerBySlot(roomInfo.players, "slot" + num).packed
          ) {
            continue;
          } else {
            break;
          }
        }
      }

      var newPlayer = playingCases.getPlayerBySlot(
        roomInfo.players,
        "slot" + num
      );
      return newPlayer;
    }
  },
  getPlayerBySlot: function (players, slot) {
    for (var player in players) {
      if (players[player].slot === slot) {
        return players[player];
      }
    }
    return undefined;
  },
  getActivePlayers: function (players) {
    for (var player in players) {
      if (players[player].active === true && !players[player].packed) {
        return players[player];
      }
    }
    return undefined;
  },
  getActivePlayersCount: function (players) {
    var count = 0;
    for (var player in players) {
      if (players[player].active && !players[player].packed) {
        count++;
      }
    }
    return count;
  },
  getRobotActivePlayersCount: function (players) {
    var count = 0;
    for (var player in players) {
      if (
        players[player].is_robot &&
        players[player].active &&
        !players[player].packed
      ) {
        count++;
      }
    }
    return count;
  },
  getPlayersCount: function (players) {
    return _.size(players);
  },
  getActionTurnPlayer: function (players) {
    var activePlayer;
    for (var player in players) {
      if (players[player].turn) {
        activePlayer = players[player];
        break;
      }
    }
    return activePlayer;
  },
  getRobotCount: function (players) {
    var count = 0;

    for (var player in players) {
      if (players[player].is_robot) {
        count++;
      }
    }
    return count;
  },
  getDealerPlayer: function (players) {
    var activePlayer;
    for (var player in players) {
      if (players[player].deal) {
        activePlayer = players[player];
        break;
      }
    }
    return activePlayer;
  },
  RoomConnectedSocket: function (roomId, socket) {
    // printLog(roomId);
    try {
      var clients = io.of("/").adapter.rooms[roomId];

      // var clients = socket.adapter.rooms[roomId];
      printLog("clients");
      printLog(clients);
    } catch (e) {
      printLog("errr");
      printLog(e);
      var clients = undefined;
    }

    return clients;
  },
  resetAllPlayers: function (players) {
    for (var player in players) {
      delete players[player].winner;
      delete players[player].playerInfo.cards;
      players[player].turn = false;
      players[player].active = true;
    }
    return players;
  },
  removeUser: function (RoomInfo, user_id, rtype, socket) {
    if (RoomInfo.players[user_id]) {
      userSettingCases.clearUserRoomData(user_id, function (err, upudata) {
        var total_player = playingCases.getPlayersCount(RoomInfo.players);
        var userSlot = RoomInfo.players[user_id].slot;
        var isCurrentUserTurn = RoomInfo.players[user_id].turn;

        var bchips = RoomInfo.players[user_id].bchips;
        var achips = RoomInfo.players[user_id].achips;

        commonClass.SendData(
          {
            data: { slot: userSlot, type: rtype, chips: achips - bchips },
            en: "RL",
            sc: 1,
          },
          RoomInfo._id
        );

        if (rtype == "SWITCH") {
          socket.leave(RoomInfo._id);
          tablesManager.switchTable(
            RoomInfo._id,
            RoomInfo.is_private,
            user_id,
            RoomInfo.tinfo,
            socket
          );
        } else {
          try {
            var csoket = RoomInfo.players[user_id].playerInfo.clientId;
            var socketss = io.sockets.connected[csoket];
            socketss.leave(RoomInfo._id);
          } catch (e) {
            // printLog(e)
          }
        }

        var clients = playingCases.RoomConnectedSocket(RoomInfo._id, socket);
        var totalGamePlayer = playingCases.getPlayersCount(RoomInfo.players);
        var totalGameRobot = playingCases.getRobotCount(RoomInfo.players);

        if (total_player == 1 || clients == undefined) {
          db.collection("tbl_room").deleteOne({ _id: RoomInfo._id });
        } else {
          var setobj = {},
            incobj = {},
            pushobj = {},
            unsetobj = {};
          RoomInfo.availableSlot[userSlot] = userSlot;
          setobj["availableSlot"] = RoomInfo.availableSlot;

          incobj["tp"] = -1;
          unsetobj["players." + user_id] = "";

          tablesManager.RoomFindUpdate(
            RoomInfo._id,
            { $unset: unsetobj, $inc: incobj, $set: setobj },
            function (err, RoomInfo) {
              printLog(err);
              if (!err) {
                var RoomInfo = RoomInfo.value;
                var totalGamePlayer = playingCases.getPlayersCount(
                  RoomInfo.players
                );
                var totalGameRobot = playingCases.getRobotCount(
                  RoomInfo.players
                );
                var clients = playingCases.RoomConnectedSocket(
                  RoomInfo._id,
                  socket
                );

                if (totalGameRobot == totalGamePlayer && clients == undefined) {
                  db.collection("tbl_room").deleteOne({ _id: RoomInfo._id });
                } else {
                  var total_active_player = playingCases.getActivePlayersCount(
                    RoomInfo.players
                  );
                  var total_player = playingCases.getPlayersCount(
                    RoomInfo.players
                  );

                  printLog("total_active_player--->" + total_active_player);
                  printLog("total_player--->" + total_player);

                  if (total_active_player == 0 && total_player > 0) {
                    timerClass.cancelTimer(
                      RoomInfo._id,
                      RoomInfo.timerid,
                      function (cancleData) {
                        timerClass.gameStartTimer(RoomInfo._id, socket);
                      }
                    );
                  }
                }
              }
            }
          );
        }
      });
    } else {
      try {
        var socketss = io.sockets.connected[socket.id];
        socketss.leave(RoomInfo._id);
      } catch (e) {
        printLog(e);
      }

      userSettingCases.clearUserRoomData(user_id, function (err, upudata) {
        if (rtype == "SWITCH") {
          tablesManager.switchTable(
            RoomInfo._id,
            RoomInfo.is_private,
            user_id,
            RoomInfo.tinfo,
            socket
          );
        } else {
          commonClass.SendData(
            { data: { slot: "", type: "" }, en: "RL", sc: 1 },
            socket.id
          );
        }
      });
    }
  },
  turnTimeOut: function (roomId, currentTurnId, socket) {
    tablesManager.GetTableInfo(roomId, function (err, RoomInfo) {
      if (RoomInfo) {
        printLog("\n\n\n\n");

        var ActivePlayers = playingCases.getActivePlayersCount(
          RoomInfo.players
        );
        printLog("ActivePlayers>>>>>" + ActivePlayers);

        if (ActivePlayers > 1 && RoomInfo.igs == true) {
          printLog("turn timeout");

          if (RoomInfo.players[currentTurnId]) {
            var totalTimeout = RoomInfo.players[currentTurnId].tt;

            commonClass.SendData(
              {
                data: {
                  tt: totalTimeout,
                  slot: RoomInfo.players[currentTurnId].slot,
                },
                en: "TIMEOUT",
                sc: 1,
              },
              RoomInfo._id
            );

            if (totalTimeout < 5) {
              printLog("next turn timeout");

              var nextTurn = playingCases.getNextActivePlayer(
                RoomInfo,
                currentTurnId,
                "110"
              );
              var setobj = {},
                incobj = {};
              setobj["players." + nextTurn.uid + ".turn"] = true;
              setobj["players." + currentTurnId + ".turn"] = false;

              incobj["players." + currentTurnId + ".tt"] = 1;

              tablesManager.RoomUpdate(
                RoomInfo._id,
                { $set: setobj, $inc: incobj },
                function (err, updateRoomData) {
                  playingCases.nextTurn(RoomInfo._id, socket);
                }
              );
            } else {
              playingCases.removeUser(
                RoomInfo,
                currentTurnId,
                "timeout",
                socket
              );
            }
          } else {
            // playingCases.nextTurn(RoomInfo._id, socket);
          }
        } else {
          printLog("1jnk12345");
        }
      } else {
        printLog("1jnk123454567");

        // commonClass.SendData({'en':'RL', 'sc':1}, socket.id);
      }
    });
  },
  WinnerTimerAfter: function (roomId, socket) {
    tablesManager.GetTableInfo(roomId, function (err, roomInfo) {
      if (roomInfo) {
        var players = playingCases.resetAllPlayers(roomInfo.players);
        var ActivePlayers = playingCases.getPlayersCount(players);

        if (
          ActivePlayers > 1 &&
          roomInfo.igs == false &&
          roomInfo.timerType != "gameStart"
        ) {
          timerClass.gameStartTimer(roomInfo._id, socket);
        }
      }
    });
  },
  nextTurn: function (turn) {
    var number = parseInt(turn);
    return (number + 1) % 2;
  },
  ResponseSU: function (userSlot, chips, roomId) {
    commonClass.SendData(
      {
        data: {
          slot: userSlot,
          chips: chips,
        },
        en: "SU",
        sc: 1,
      },
      roomId
    ); //Next Turn
  },
  addUserPlayMatch: function (players, roomId) {
    _.each(players, function (player) {
      if (player.is_robot == false && player.active == true) {
        db.collection("game_user_play_match").insertOne(
          {
            uid: player.uid.toString(),
            roomId: roomId.toString(),
            date: new Date(),
          },
          function (err) {
            printLog(err);
          }
        );
      }
    });
  },
};
