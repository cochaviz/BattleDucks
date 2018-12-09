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

    /* 
     * Client to server: game is complete, the winner is ... 
     */
    // exports.T_GAME_WON_BY = "GAME-WON-BY";
    // exports.O_GAME_WON_BY = {
    //     type: exports.T_GAME_WON_BY,
    //     data: null
    // };

//     /*
//      * Server to client: abort game (e.g. if second player exited the game) 
//      */
//     exports.O_GAME_ABORTED = {
//         type: "GAME-ABORTED"
//     };
//     exports.S_GAME_ABORTED = JSON.stringify(exports.O_GAME_ABORTED);

//     /*
//      * Server to client: choose target word
//      */
//     exports.O_CHOOSE = { type: "CHOOSE-WORD" };
//     exports.S_CHOOSE = JSON.stringify(exports.O_CHOOSE);

//     /*
//      * Server to client: set as player A 
//      */
//     exports.T_PLAYER_TYPE = "PLAYER-TYPE";
//     exports.O_PLAYER_A = {
//         type: exports.T_PLAYER_TYPE,
//         data: "A"
//     };
//     exports.S_PLAYER_A = JSON.stringify(exports.O_PLAYER_A);

//     /* 
//      * Server to client: set as player B 
//      */
//     exports.O_PLAYER_B = {
//         type: exports.T_PLAYER_TYPE,
//         data: "B"
//     };
//     exports.S_PLAYER_B = JSON.stringify(exports.O_PLAYER_B);

//     /* 
//      * Player A to server OR server to Player B: this is the target word 
//      */
//     exports.T_TARGET_WORD = "SET-TARGET-WORD";
//     exports.O_TARGET_WORD = {
//         type: exports.T_TARGET_WORD,
//         data: null
//     };
//     //exports.S_TARGET_WORD does not exist, as we always need to fill the data property

//     /* 
//      * Player B to server OR server to Player A: guessed character 
//      */
//     exports.T_MAKE_A_GUESS = "MAKE-A-GUESS";
//     exports.O_MAKE_A_GUESS = {
//         type: exports.T_MAKE_A_GUESS,
//         data: null
//     };
//     //exports.S_MAKE_A_GUESS does not exist, as data needs to be set

//     /* 
//      * Server to Player A & B: game over with result won/loss 
//      */
//     exports.T_GAME_OVER = "GAME-OVER";
//     exports.O_GAME_OVER = {
//         type: exports.T_GAME_OVER,
//         data: null
//     };


// }(typeof exports === "undefined" ? this.Messages = {} : exports));
// //if exports is undefined, we are on the client; else the server