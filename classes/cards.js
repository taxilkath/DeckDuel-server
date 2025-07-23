var _ = require("lodash");

module.exports.cardValue = function (card) {
    if (card.length == 2 && _.isString(card)) {
        var number = _.upperCase(_.head(card));
        var colors = _.upperCase(_.tail(card));
        if (number == "A") {
            number = 1;
        } else if (number == "T") {
            number = 10;
        } else if (number == "J") {
            number = 11;
        } else if (number == "Q") {
            number = 12;
        } else if (number == "K") {
            number = 13;
        } else {
            number = parseInt(number);
        }
        switch (colors) {
            case "C":
                color = "Clubs";
                break;
            case "S":
                color = "Spades";
                break;
            case "D":
                color = "Diamonds";
                break;
            case "H":
                color = "Hearts";
                break;
            default:
                console.error(new Error("Incorrect Card Color " + card));
                break;
        }
        if (_.isNaN(number)) {
            console.error(new Error("Incorrect Card Number " + card));
        }
        
        return {
            number: number,
            color: color,
            value: card,
            code : colors.toLowerCase()
        };
    } else {
        console.error(new Error("Incorrect Card Value " + card));
    }
};

module.exports.keyToString = function (key) {
    key = parseInt(key);
    var retVal = "";
    switch (key) {
        case 1:
            retVal = "A";
            break;
        case 14:
            retVal = "A";
            break;
        case 2:
            retVal = "2";
            break;
        case 3:
            retVal = "3";
            break;
        case 4:
            retVal = "4";
            break;
        case 5:
            retVal = "5";
            break;
        case 6:
            retVal = "6";
            break;
        case 7:
            retVal = "7";
            break;
        case 8:
            retVal = "8";
            break;
        case 9:
            retVal = "9";
            break;
        case 10:
            retVal = "T";
            break;
        case 11:
            retVal = "J";
            break;
        case 12:
            retVal = "Q";
            break;
        case 13:
            retVal = "K";
            break;

    }
    return retVal;
};

module.exports.numberValue = function (card) {
    var cardObj = module.exports.cardValue(card);
    if (cardObj.number == 1) {
        cardObj.number = 14;
    }
    return cardObj.number;
};

module.exports.getAllCards = function (card) {
    var number = _.head(card);
    var color = _.tail(card);
    var allColorsObj = [

        {
            shortName: "s",
            fullName: "Spade"
        }, {
            shortName: "h",
            fullName: "Heart"
        }, {
            shortName: "d",
            fullName: "Diamond"
        }, {
            shortName: "c",
            fullName: "Club"
        }
    ];
    var allNumbersObj = [{
            shortName: "A",
            fullName: "Ace"
        },
        {
            shortName: "2",
            fullName: "Two"
        },
        {
            shortName: "3",
            fullName: "Three"
        },
        {
            shortName: "4",
            fullName: "Four"
        },
        {
            shortName: "5",
            fullName: "Five"
        },
        {
            shortName: "6",
            fullName: "Six"
        },
        {
            shortName: "7",
            fullName: "Seven"
        },
        {
            shortName: "8",
            fullName: "Eight"
        },
        {
            shortName: "9",
            fullName: "Nice"
        },
        {
            shortName: "T",
            fullName: "Ten"
        },
        {
            shortName: "J",
            fullName: "Jack"
        },
        {
            shortName: "Q",
            fullName: "Queen"
        },
        {
            shortName: "K",
            fullName: "King"
        }
    ];
    var allCards = [];
    _.each(allColorsObj, function (color) {
        _.each(allNumbersObj, function (number) {
            allCards.push({
                shortName: number.shortName + color.shortName,
                fullName: number.fullName + " " + color.fullName,
                colorShort: color.shortName,
                colorFull: color.fullName,
                numberShort: number.shortName,
                numberFull: number.fullName
            });
        });
    });
    return allCards;
};