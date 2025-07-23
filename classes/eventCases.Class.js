var cryptoLib = require("cryptlib");

module.exports = {
  bind: function (socket) {
    socket.on("req", function (data) {
      try {
        var data = JSON.parse(data);
      } catch (e) {
        printLog(e);
      }

      printLog("\n\n\n\n\n rec....");
      printLog(data);
      printLog(data.en);
      printLog("\n\n\n\n\n");
      var en = data.en;

      switch (en) {
        case "GSP": //GUEST signup or login
          signupClass[en](data, socket);
          break;
        case "TPSP": //thirdparty signup or login
          signupClass[en](data, socket);
          break;
        case "JT": //join table
          tablesManager[en](data, socket);
          break;
        case "JFT": //join friend table
          tablesManager[en](data, socket);
          break;
        case "RL": //room leave
          playingCases[en](data, socket);
          break;
        case "RJ": //room join
          playingCases[en](data, socket);
          break;
        case "SB": //set bid
          playingCases[en](data, socket);
          break;
        case "SU": //Standup
          playingCases[en](data, socket);
          break;
        case "LB": //leaderboard
          userSettingCases[en](data, socket);
          break;
        case "DB": //Daily bonus
          userSettingCases[en](data, socket);
          break;
        case "DBC": //Daily bonus collect
          userSettingCases[en](data, socket);
          break;
        case "WWC": //weekly winner contest
          userSettingCases[en](data, socket);
          break;
        case "URC": //update reward chips
          userSettingCases[en](data, socket);
          break;
        case "RSC": //send chips
          userSettingCases[en](data, socket);
          break;
        case "UP": //user profile
          userSettingCases[en](data, socket);
          break;
        case "LC": //Lucky Card
          userSettingCases[en](data, socket);
          break;
        case "EUN": //update user name
          userSettingCases[en](data, socket);
          break;
        case "GS": //gift send
          userSettingCases[en](data, socket);
          break;
        case "GL": //gift list
          userSettingCases[en](data, socket);
          break;
        case "GSM": //Game send msg
          userSettingCases[en](data, socket);
          break;
        case "UPC": //use promocode
          userSettingCases[en](data, socket);
          break;
        case "CA": //change avtar
          userSettingCases[en](data, socket);
          break;
        case "FL": //friend list
          friendsCases[en](data, socket);
          break;
        case "AFR": //Action friend request
          friendsCases[en](data, socket);
          break;
        case "SFR": //send friend request
          friendsCases[en](data, socket);
          break;
        case "LFR": //LIST friend request
          friendsCases[en](data, socket);
          break;
        case "BU": //Block user
          friendsCases[en](data, socket);
          break;
        case "UBU": //Block user
          friendsCases[en](data, socket);
          break;
        case "UF": //unfriend
          friendsCases[en](data, socket);
          break;
        case "IF": //invite friend
          friendsCases[en](data, socket);
          break;
        case "NL": //notification list
          notificationCases[en](data, socket);
          break;
        case "NC": //notification count
          notificationCases[en](data, socket);
          break;
        case "SM": //send message
          notificationCases[en](data, socket);
          break;
        case "ASC": //Accept Send Chips
          notificationCases[en](data, socket);
          break;
        case "RN": //remove notification
          notificationCases[en](data, socket);
          break;
        case "HLGFC": //high low get first card
          miniGamesCases[en](data, socket);
          break;
        case "HLNC": //high low next card
          miniGamesCases[en](data, socket);
          break;
        case "ABGFC": //andar bahar get first card
          miniGamesCases[en](data, socket);
          break;
        case "ABUS": //andar bahar user selected ( 1 = anadar, 2 = bahar )
          miniGamesCases[en](data, socket);
          break;
        case "ABCA": //andar bahar chips add
          miniGamesCases[en](data, socket);
          break;
        case "GSC": //get scratch card
          miniGamesCases[en](data, socket);
          break;
        case "SCCA": //scratch card chips add
          miniGamesCases[en](data, socket);
          break;
        case "CH": //chips History
          chipsTrackerCases[en](data, socket);
          break;
        case "TEST":
          cardClass[en](data, socket);
          break;
      }
    });

    socket.on("disconnect", function (data) {
      printLog("socket disconnect called: ", socket.id, data);

      var upWhere = { $set: {} };
      upWhere.$set.socketId = "";
      userSettingCases.updateUserDataBySocket(socket.id, upWhere);
    });
  },
};
