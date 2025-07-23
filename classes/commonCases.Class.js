var randomstring = require("randomstring");
var cryptoLib = require("cryptlib");

var key = config.ENCRYPT_KEY;
var iv = config.ENCRYPT_IV;
shaKey = cryptoLib.getHashSha256(key, 32);

module.exports = {
  encryptedString: function (string) {
    return cryptoLib.encrypt(string, shaKey, iv);
  },
  decryptedString: function (string) {
    return cryptoLib.decrypt(string, shaKey, iv);
  },
  GetRandomString: function (len) {
    return randomstring.generate(len);
  },
  getCountryFromIp: function (ip) {
    var ip2country = require("ip2country");
    return ip2country(ip);
  },
  SendData: function (data, socket) {
    io.to(socket).emit("res", data);

    if (data.en != "DB") {
      printLog("\n\n\nSendData");
      printLog(data);
    }
    // io.to(socket).emit('res', commonClass.encryptedString(JSON.stringify(data)));
  },
  SendDataBroadCast: function (data) {
    io.sockets.emit("res", commonClass.encryptedString(JSON.stringify(data)));
  },
  getRandomInt: function (max) {
    return Math.floor(Math.random() * Math.floor(max));
  },
  room_user_left: function (room_id, socket, reason = "") {
    socket.leave(room_id);

    if (reason == "") {
      commonClass.SendData({ en: "RL", sc: 1 }, socket.id);
    } else {
      commonClass.SendData({ en: "RL", sc: 1, reason: reason }, socket.id);
    }
  },
};
