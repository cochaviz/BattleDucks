(function (exports) {

    exports.h
    ello = {//for debugging
        type: "i just want to say hello" // i mean quack*
    };

    //server to client
    exports.waitForPLayer = {
        type: "Waiting for a player to join"
    };

    //server to client
    exports.waitForPlayerBoard = {
        type: "Waiting for player to place their ducks"
    };

    //client to server
    exports.playerReady = {
        type: "I placed my ducks",
        data: null
    };

    exports.bothPlayerReady = {
        type: "All ducks on deck"
    };

    //server to client
    exports.aborted = {
        type: "game aborted"
    };

    //server to client
    exports.chose = {
        type: "YourTurn"
    };

    // (lin,col) guess
    exports.playerChose = {
        type: "Guess",
        data: null
    };

    exports.GuessRes = {
        type: "GuessResponse",
        poz: null,
        hit: null
    };

    exports.Attack = {
        type: "Hit",
        poz: null,
        hit: null
    };

    exports.gameOver = {
        type: "The game is over"
    };

    exports.gameWon = {
        type: "gameWon"
    };

    exports.gameLost = {
        type: "gameLost"
    };

    exports.gameStarting = {
        type: "game is starting soon"
    };

    exports.unknownError1 = {
        type: "invalid gamestatus when trying to join a game"
    };


}(typeof exports === "undefined" ? this.Messages = {} : exports));
