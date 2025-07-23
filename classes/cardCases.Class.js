module.exports = {
  shufflePack: function (pack) {
    var i = pack.length,
      j,
      tempi,
      tempj;
    if (i === 0) return false;
    while (--i) {
      j = Math.floor(Math.random() * (i + 1));
      tempi = pack[i];
      tempj = pack[j];
      pack[i] = tempj;
      pack[j] = tempi;
    }
    return pack;
  },
  createPack: function () {
    var pack = [
      "As",
      "2s",
      "3s",
      "4s",
      "5s",
      "6s",
      "7s",
      "8s",
      "9s",
      "Ts",
      "Js",
      "Qs",
      "Ks",
      "Ah",
      "2h",
      "3h",
      "4h",
      "5h",
      "6h",
      "7h",
      "8h",
      "9h",
      "Th",
      "Jh",
      "Qh",
      "Kh",
      "Ad",
      "2d",
      "3d",
      "4d",
      "5d",
      "6d",
      "7d",
      "8d",
      "9d",
      "Td",
      "Jd",
      "Qd",
      "Kd",
      "Ac",
      "2c",
      "3c",
      "4c",
      "5c",
      "6c",
      "7c",
      "8c",
      "9c",
      "Tc",
      "Jc",
      "Qc",
      "Kc",
    ];
    return pack;
  },
  draw: function (pack, amount, hand, initial) {
    var cards = new Array();
    cards = pack.slice(0, amount);

    pack.splice(0, amount);

    if (!initial) {
      hand.push.apply(hand, cards);
    }
    return cards;
  },
  TEST: function (data, socket) {
    commonClass.SendData(
      {
        data: { roomInfo: { data: "5c66944d599e223c90c78e35" } },
        en: "NT",
        sc: 1,
      },
      socket.id
    );
  },
};
