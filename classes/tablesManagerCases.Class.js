var position = {
  yellow: { start: "B1", end: "B51" },
  blue: { start: "B14", end: "B12" },
  red: { start: "B27", end: "B25" },
  green: { start: "B40", end: "B38" },
};

module.exports = {
  getDefaultFields: function (data, socket, callback) {
    var ud = {
      tp: 0, //total player
      players: {},
      timerid: "", //timer id
      timerType: "", //timer type
      utime: new Date(Date.now()), //update time,
      igs: false,
      bidCard: "",
      otherCard: [],
      andarCard: [],
      baharCard: [],
      bidSelectionCount: 0,
      turn: 0, // 0 = andar,1 = bahar
      throwCard: [],
      totalBid: 0,
      fbc: 0, //first bid complete
      sbc: 0, //second bid complete
      availableSlot: {
        slot0: "slot0",
        slot1: "slot1",
        slot2: "slot2",
        slot3: "slot3",
        slot4: "slot4",
      },
    };
    callback(ud);
  },
  GTL: function (data, socket) {
    var en = data.en;
    data["en"] = en;

    db.collection("game_tables")
      .find({})
      .toArray(function (err, gameTableInfo) {
        commonClass.SendData(
          { data: gameTableInfo, en: data.en, sc: 1 },
          socket.id
        );
      });
  },
  JT: function (data, socket) {
    var en = data.en;
    if (typeof data.data == "undefined") {
      commonClass.SendData(
        { Message: "JT request is not in data object", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }
    var data = data.data;
    data["en"] = en;

    if (typeof data.user_id == "undefined") {
      commonClass.SendData(
        { Message: "JT user_id is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }
    if (typeof data.tt == "undefined") {
      //table type : DJ = direct join
      commonClass.SendData(
        { Message: "JT tt is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    if (typeof data.is_private == "undefined") {
      //0 = false, 1 = true
      commonClass.SendData(
        { Message: "JT is_private is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    switch (data.tt) {
      case "DJ":
        tablesManager.DJ(data, socket, function (err, res) {});
        break;
      case "PJ":
        tablesManager.PJ(data, socket, function (err, res) {});
        break;
      case "TJ":
        tablesManager.TJ(data, socket, function (err, res) {});
        break;
    }
  },
  DJ: function (data, socket) {
    db.collection("game_users").findOne(
      { _id: objectId(data.user_id) },
      function (err, res) {
        // printLog(err);
        if (res) {
          var uchips = res.chips;

          if (uchips < 100) {
            commonClass.SendData(
              {
                Message: "you don't have enough chips to play on this table.",
                en: data.en,
                sc: 501,
              },
              socket.id
            );
            return false;
          } else {
            var suchips = uchips / 500;

            if (parseInt(suchips) < 100) {
              var suchips = uchips;
            }

            db.collection("game_tables")
              .find({ tblbet_value: { $lte: suchips } })
              .limit(1)
              .sort({ tblbet_value: -1 })
              .toArray(function (e, sdata) {
                if (sdata.length > 0) {
                  var gtres = sdata[0];
                  var tbl_chips = gtres.tblbet_value;

                  if (res.roomSeat != "" && res.roomId != "") {
                    tablesManager.GetTableInfo(
                      objectId(res.roomId),
                      function (err, rres) {
                        if (rres) {
                          tablesManager.join_table(
                            data,
                            res,
                            gtres,
                            socket,
                            function (userData) {}
                          );
                        } else {
                          if (uchips < tbl_chips) {
                            commonClass.SendData(
                              {
                                Message:
                                  "you don't have enough chips to play on this table.",
                                en: data.en,
                                sc: 501,
                              },
                              socket.id
                            );
                            return false;
                          } else {
                            tablesManager.join_table(
                              data,
                              res,
                              gtres,
                              socket,
                              function (userData) {}
                            );
                          }
                        }
                      }
                    );
                  } else {
                    if (uchips < tbl_chips) {
                      commonClass.SendData(
                        {
                          Message:
                            "you don't have enough chips to play on this table.",
                          en: data.en,
                          sc: 501,
                        },
                        socket.id
                      );
                      return false;
                    } else {
                      tablesManager.join_table(
                        data,
                        res,
                        gtres,
                        socket,
                        function (userData) {}
                      );
                    }
                  }
                } else {
                  commonClass.SendData(
                    {
                      Message:
                        "you don't  have enough chips to play on this table.",
                      en: data.en,
                      sc: 501,
                    },
                    socket.id
                  );
                  return false;
                }
              });
          }
        } else {
          commonClass.SendData(
            { Message: "user not found", en: data.en, sc: 501 },
            socket.id
          );
          return false;
        }
      }
    );
  },
  PJ: function (data, socket) {
    if (typeof data.tblvalue == "undefined") {
      commonClass.SendData(
        { Message: "PJ tblvalue is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    var tblvalue = data.tblvalue;

    db.collection("game_users").findOne(
      { _id: objectId(data.user_id) },
      function (err, res) {
        if (res) {
          var uchips = res.chips;

          if (uchips < tblvalue) {
            commonClass.SendData(
              {
                Message: "you don't have enough chips to create private table",
                en: data.en,
                sc: 501,
              },
              socket.id
            );
            return false;
          } else {
            tablesManager.privateTblCreate(
              data,
              socket,
              res,
              function (response) {}
            );
          }
        }
      }
    );
  },
  TJ: function (data, socket) {
    printLog("tablesManager :: Direct join >>" + data.user_id);

    if (typeof data.tbl_id == "undefined") {
      commonClass.SendData(
        { Message: "TJ tbl_id is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    db.collection("game_users").findOne(
      { _id: objectId(data.user_id) },
      function (err, res) {
        if (res) {
          var uchips = res.chips;

          db.collection("game_tables").findOne(
            { _id: objectId(data.tbl_id) },
            function (err, gtres) {
              var tbl_chips = gtres.tblbet_value;

              if (res.roomSeat != "" && res.roomId != "") {
                tablesManager.GetTableInfo(
                  objectId(res.roomId),
                  function (err, rres) {
                    if (rres) {
                      commonClass.SendData(
                        {
                          Message: "you are already playing in other table",
                          roomId: res.roomId,
                          en: data.en,
                          sc: 2,
                        },
                        socket.id
                      );
                      return false;
                    } else {
                      if (uchips < tbl_chips) {
                        commonClass.SendData(
                          {
                            Message:
                              "you don't have enough chips to play on this table.",
                            en: data.en,
                            sc: 501,
                          },
                          socket.id
                        );
                        return false;
                      } else {
                        tablesManager.join_table(
                          data,
                          res,
                          gtres,
                          socket,
                          function (userData) {}
                        );
                      }
                    }
                  }
                );
              } else {
                if (uchips < tbl_chips) {
                  commonClass.SendData(
                    {
                      Message:
                        "you don't have enough chips to play on this table.",
                      en: data.en,
                      sc: 501,
                    },
                    socket.id
                  );
                  return false;
                } else {
                  tablesManager.join_table(
                    data,
                    res,
                    gtres,
                    socket,
                    function (userData) {}
                  );
                }
              }
            }
          );
        }
      }
    );
  },
  JFT: function (data, socket) {
    var en = data.en;
    if (typeof data.data == "undefined") {
      commonClass.SendData(
        { Message: "JFT request is not in data object", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }
    var data = data.data;
    data["en"] = en;

    if (typeof data.user_id == "undefined") {
      commonClass.SendData(
        { Message: "JFT user_id is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }
    if (typeof data.roomId == "undefined") {
      commonClass.SendData(
        { Message: "JFT roomId is not defined", en: data.en, sc: 0 },
        socket.id
      );
      return false;
    }

    var roomId = objectId(data.roomId);
    db.collection("game_users").findOne(
      { _id: objectId(data.user_id) },
      function (err, res) {
        if (res) {
          var uchips = res.chips;

          tablesManager.GetTableInfo(objectId(roomId), function (err, rres) {
            if (rres) {
              if (
                uchips >= rres.tinfo.tblbet_value &&
                rres.tp < config.PER_TABLE_PLAYER
              ) {
                tablesManager.roomUserAdd(res, rres, socket);
              } else {
                if (rres.tp > config.PER_TABLE_PLAYER) {
                  commonClass.SendData(
                    {
                      Message: "no empty seat available on this table.",
                      en: "JT",
                      sc: 2,
                    },
                    socket.id
                  );
                } else {
                  commonClass.SendData(
                    {
                      Message: "no enough chips to play on this table.",
                      en: "JT",
                      sc: 2,
                    },
                    socket.id
                  );
                }
              }
            } else {
              commonClass.SendData(
                {
                  Message: "no empty seat available on this table.",
                  en: "JT",
                  sc: 2,
                },
                socket.id
              );
            }
          });
        } else {
          commonClass.SendData(
            { Message: "user not found", en: data.en, sc: 501 },
            socket.id
          );
          return false;
        }
      }
    );
  },
  addBot: function (roomId, socket, callback) {
    tablesManager.GetTableInfo(roomId, function (err, RoomInfo) {
      if (RoomInfo) {
        if (
          playingCases.getPlayersCount(RoomInfo.players) <
          config.PER_TABLE_PLAYER
        ) {
          tablesManager.GetBotInfo(0, function (err, binfo) {
            if (binfo) {
              var rn = require("random-number");
              var options = {
                min: 25,
                max: 50,
                integer: true,
              };

              var randID = rn(options);
              var randChips = RoomInfo.tinfo.tblbet_value * randID;
              var upWhere = { $set: { chips: randChips } };
              userSettingCases.userFindUpdate(
                upWhere,
                binfo._id,
                function (err, userInfo) {
                  if (userInfo) {
                    tablesManager.roomUserAdd(userInfo.value, RoomInfo, socket);
                  } else {
                    printLog("bot not found2");
                  }
                }
              );
            } else {
              db.collection("game_users").updateMany(
                { is_robot: true },
                { $set: { status: 0 } }
              );
              timerClass.otherUserWaitngTimer(RoomInfo._id, socket);
              printLog("bot not found1");
            }
          });
        }
      }
    });
  },
  join_table: function (data, userData, tblData, socket, callback) {
    db.collection("tbl_room").findOne(
      {
        is_private: 0,
        "tinfo._id": tblData._id,
        tp: { $lt: config.PER_TABLE_PLAYER },
      },
      function (err, rres) {
        if (rres) {
          if (userData.roomId.toString() == rres._id.toString()) {
            printLog("1111111");
            socket.join(rres._id);
            commonClass.SendData({ data: rres, en: "JT", sc: 1 }, socket.id);
          } else {
            if (userData.chips >= rres.tinfo.tblbet_value) {
              tablesManager.roomUserAdd(userData, rres, socket);
            } else {
              commonClass.SendData(
                {
                  Message: "you don't have enough chips to play on this table.",
                  en: data.en,
                  sc: 501,
                },
                socket.id
              );
              return false;
            }
          }
        } else {
          tablesManager.getDefaultFields(data, socket, function (tData) {
            var playerSlot = "";
            for (var slot in tData.availableSlot) {
              playerSlot = slot;
              break;
            }
            delete tData.availableSlot[playerSlot];

            var user_id = userData._id;
            var uinfo = {
              uid: userData._id,
              playerInfo: {
                un: userData.un,
                chips: userData.chips,
                pp: userData.pp,
                clientId: socket.id, //socket id
              },
              tt: 0, //total timeout
              slot: playerSlot,
              active: true,
              tgp: 0, //total game play
              tgw: 0, //total game won
              bchips: userData.chips, //before chips
              achips: userData.chips, //after chips
              is_robot: userData.is_robot,
              andarCardBid: 0,
              baharCardBid: 0,
            };

            tData.tinfo = tblData;
            tData.players = {
              [user_id]: uinfo,
            };
            tData.tp = tData.tp + 1;

            tData.is_private = data.is_private;
            db.collection("tbl_room").insertOne(
              tData,
              function (err, roomInfo) {
                var roomId = roomInfo.ops[0]._id;
                var upWhere = {
                  $set: {
                    socketId: socket.id,
                    roomId: roomId,
                    status: 1,
                    tbl_type: data.is_private,
                  },
                };

                userSettingCases.updateUserData(
                  upWhere,
                  user_id,
                  function (err, res) {
                    socket.join(roomInfo.ops[0]._id);
                    commonClass.SendData(
                      { data: roomInfo.ops[0], en: "JT", sc: 1 },
                      socket.id
                    );

                    if (roomInfo.ops[0].is_private == 0) {
                      timerClass.otherUserWaitngTimer(
                        roomInfo.ops[0]._id,
                        socket
                      );
                    }

                    setTimeout(function () {
                      timerClass.gameStartTimer(roomInfo.ops[0]._id, socket);
                    }, 1000);
                  }
                );
              }
            );
          });
        }
      }
    );
  },
  roomUserAdd: function (userInfo, roomInfo, socket) {
    var upWhere = { $inc: { tp: 1 } };
    tablesManager.RoomUpdate(roomInfo._id, upWhere, function (err, res) {
      for (var slot in roomInfo.availableSlot) {
        var playerSlot = slot;
        break;
      }

      if (playerSlot != undefined) {
        delete roomInfo.availableSlot[playerSlot];
        var user_id = userInfo._id;

        var uinfo = {
          uid: userInfo._id,
          playerInfo: {
            un: userInfo.un,
            chips: userInfo.chips,
            pp: userInfo.pp,
            clientId: userInfo.is_robot ? "" : socket.id, //socket id
          },
          tt: 0, //total timeout
          slot: playerSlot,
          active: roomInfo.igs ? false : true,
          tgp: 0, //total game play
          tgw: 0, //total game won
          bchips: userInfo.chips, //before chips
          achips: userInfo.chips, //after chips
          is_robot: userInfo.is_robot,
          andarCardBid: 0,
          baharCardBid: 0,
        };

        // printLog("roomInfo.igs");
        // printLog(roomInfo.igs);

        if (roomInfo.igs) {
          uinfo.active = false;
        }

        let setobj = {};
        var players = roomInfo.players;
        players[user_id] = uinfo;
        setobj["players"] = players;
        setobj["availableSlot"] = roomInfo.availableSlot;

        var nuuinfo = uinfo;
        nuuinfo["utime"] = new Date(Date.now());

        commonClass.SendData({ data: nuuinfo, en: "NU", sc: 1 }, roomInfo._id);

        if (userInfo.is_robot == false) {
          socket.join(roomInfo._id);
        }

        delete uinfo.utime;

        tablesManager.RoomFindUpdate(
          roomInfo._id,
          { $set: setobj },
          function (err, updateRoomData) {
            if (updateRoomData.value) {
              var upWhere = {
                $set: {
                  socketId: socket.id,
                  roomId: roomInfo._id,
                  status: 1,
                  tbl_type: roomInfo.is_private,
                },
              };
              userSettingCases.updateUserData(
                upWhere,
                user_id,
                function (err, res) {}
              );

              var total_player = playingCases.getPlayersCount(
                updateRoomData.value.players
              );

              if (userInfo.is_robot == false) {
                commonClass.SendData(
                  { data: updateRoomData.value, time: diff, en: "JT", sc: 1 },
                  socket.id
                );
              }

              if (updateRoomData.value.is_private == 0) {
                var dv = Math.floor(Math.random() * 5) + 1;
                setTimeout(function () {
                  timerClass.otherUserWaitngTimer(
                    updateRoomData.value._id,
                    socket
                  );
                }, 1000 * dv);
              }

              // printLog(updateRoomData.value);
              if (total_player > 1 && updateRoomData.value.igs == true) {
                var timediff = require("timediff");
                var last_update = updateRoomData.value.utime;
                var startTime = new Date(Date.now());
                var diff = timediff(last_update, startTime, "s");
                diff["totalMilli"] = config.GAME_TURN_TIMER;
                if (config.GAME_TURN_TIMER < diff.milliseconds) {
                  diff["milliseconds"] = config.GAME_TURN_TIMER;
                }
              }

              if (
                total_player == 2 &&
                updateRoomData.value.timerType != "win" &&
                updateRoomData.value.timerType != "gameStart"
              ) {
                //
              } else {
                var next_time = moment().format("YYYY-MM-DD HH:mm:ss");
                var start_time = moment(roomInfo.utime).format(
                  "YYYY-MM-DD HH:mm:ss"
                );
                let diff_milliseconds =
                  Date.parse(next_time) - Date.parse(start_time);
                let diff_seconds = diff_milliseconds / 1000;

                if (diff_seconds > 30) {
                  setTimeout(function () {
                    timerClass.gameStartTimer(updateRoomData.value._id, socket);
                  }, 1000);
                } else if (diff_seconds < 10 && roomInfo.igs == false) {
                  if (userInfo.is_robot == false) {
                    commonClass.SendData(
                      { data: { time: diff_seconds * 1000 }, en: "GST", sc: 1 },
                      socket.id
                    );
                  }
                }
              }
            }
          }
        );
      }
    });
  },
  GetBotInfo: function (chips = 0, callback) {
    db.collection("game_users").findOne(
      { is_robot: true, status: 0, chips: { $gte: chips } },
      callback
    );
  },
  GetTableInfo: function (roomId, callback) {
    db.collection("tbl_room").findOne({ _id: roomId }, callback);
  },
  RoomUpdate: function (roomId, data, callback) {
    db.collection("tbl_room").updateOne({ _id: roomId }, data, callback);
  },
  RoomFindUpdate: function (roomId, data, callback) {
    db.collection("tbl_room").findOneAndUpdate(
      { _id: roomId },
      data,
      { returnOriginal: false },
      callback
    );
  },
  GameTableUpdate: function (tblId, data, callback) {
    db.collection("game_tables").updateOne({ _id: tblId }, data, callback);
  },
  privateTblCreate: function (data, socket, userData) {
    tablesManager.getDefaultFields(data, socket, function (tData) {
      var playerSlot = "";
      for (var slot in tData.availableSlot) {
        playerSlot = slot;
        break;
      }

      delete tData.availableSlot[playerSlot];

      var user_id = userData._id;
      var uinfo = {
        uid: userData._id,
        playerInfo: {
          un: userData.un,
          chips: userData.chips,
          pp: userData.pp,
          clientId: socket.id, //socket id
        },
        tt: 0, //total timeout
        slot: playerSlot,
        active: true,
        tgp: 0, //total game play
        tgw: 0, //total game won
        bchips: userData.chips, //before chips
        achips: userData.chips, //after chips
        is_robot: userData.is_robot,
        andarCardBid: 0,
        baharCardBid: 0,
      };

      tData.tinfo = {
        _id: objectId("5ba9b37f4db9f9fa6e1e7770"),
        tblname: "Private",
        tblbet_value: data.tblvalue,
      };

      tData.players = {
        [user_id]: uinfo,
      };
      tData.tp = tData.tp + 1;

      tData.is_private = data.is_private;

      db.collection("tbl_room").insertOne(tData, function (err, roomInfo) {
        var roomId = roomInfo.ops[0]._id;
        var upWhere = {
          $set: {
            socketId: socket.id,
            roomId: roomId,
            status: 1,
            tbl_type: data.is_private,
          },
        };

        userSettingCases.updateUserData(upWhere, user_id, function (err, res) {
          socket.join(roomInfo.ops[0]._id);
          commonClass.SendData(
            { data: roomInfo.ops[0], tt: "PJ", en: "JT", sc: 1 },
            socket.id
          );

          setTimeout(function () {
            timerClass.gameStartTimer(roomInfo.ops[0]._id, socket);
          }, 1000);
        });
      });
    });
  },
  switchTable: function (roomId, is_private, user_id, tblInfo, socket) {
    var data = {
      is_private: is_private,
    };

    db.collection("game_users").findOne({ _id: user_id }, function (err, res) {
      if (res) {
        tablesManager.join_table_2(roomId, data, res, tblInfo, socket);
      }
    });
  },
  join_table_2: function (roomId, data, userData, tblData, socket, callback) {
    db.collection("tbl_room").findOne(
      {
        _id: { $ne: roomId },
        is_private: 0,
        "tinfo._id": tblData._id,
        tp: { $lt: config.PER_TABLE_PLAYER },
      },
      function (err, rres) {
        if (rres) {
          if (userData.roomId.toString() == rres._id.toString()) {
            printLog("1111111");
            socket.join(rres._id);
            commonClass.SendData({ data: rres, en: "JT", sc: 1 }, socket.id);
          } else {
            if (userData.chips >= rres.tinfo.tblbet_value) {
              tablesManager.roomUserAdd(userData, rres, socket);
            } else {
              commonClass.SendData(
                {
                  Message: "you don't have enough chips to play on this table.",
                  en: data.en,
                  sc: 501,
                },
                socket.id
              );
              return false;
            }
          }
        } else {
          tablesManager.getDefaultFields(data, socket, function (tData) {
            var playerSlot = "";
            for (var slot in tData.availableSlot) {
              playerSlot = slot;
              break;
            }
            delete tData.availableSlot[playerSlot];

            var user_id = userData._id;
            var uinfo = {
              uid: userData._id,
              playerInfo: {
                un: userData.un,
                chips: userData.chips,
                pp: userData.pp,
                clientId: socket.id, //socket id
              },
              tt: 0, //total timeout
              slot: playerSlot,
              active: true,
              tgp: 0, //total game play
              tgw: 0, //total game won
              bchips: userData.chips, //before chips
              achips: userData.chips, //after chips
              is_robot: userData.is_robot,
              andarCardBid: 0,
              baharCardBid: 0,
            };

            tData.tinfo = tblData;
            tData.players = {
              [user_id]: uinfo,
            };
            tData.tp = tData.tp + 1;

            tData.is_private = data.is_private;
            db.collection("tbl_room").insertOne(
              tData,
              function (err, roomInfo) {
                var roomId = roomInfo.ops[0]._id;
                var upWhere = {
                  $set: {
                    socketId: socket.id,
                    roomId: roomId,
                    status: 1,
                    tbl_type: data.is_private,
                  },
                };

                userSettingCases.updateUserData(
                  upWhere,
                  user_id,
                  function (err, res) {
                    socket.join(roomInfo.ops[0]._id);
                    commonClass.SendData(
                      { data: roomInfo.ops[0], en: "JT", sc: 1 },
                      socket.id
                    );

                    if (roomInfo.ops[0].is_private == 0) {
                      timerClass.otherUserWaitngTimer(
                        roomInfo.ops[0]._id,
                        socket
                      );
                    }

                    setTimeout(function () {
                      timerClass.gameStartTimer(roomInfo.ops[0]._id, socket);
                    }, 1000);
                  }
                );
              }
            );
          });
        }
      }
    );
  },
};
