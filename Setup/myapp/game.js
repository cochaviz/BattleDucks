var game = function(gameId)  {
    this.player1 = null,//to be initialized with players id (ws connection id)
    this.player2 = null,
    this.playerturn = -1,
    this.cycleState = 0,
    this.board1 = null,
    this.board2 = null,
    this.id = gameId,//game id
    this.readyPlayer1 = false,
    this.readyPlayer2 = false,
    this.gameStatus = 0//nobody joined
    //for gameStatus: add Const/map with more reprezentative names ex:"1 joine", "aborted"
}

game.prototype.joinGame = function(PlayerId){
    if (this.gameStatus == 0){
        //this player is player1 and must wait
        this.player1 = PlayerId;//id which actually is a connectionId
        console.log("[Game.js] player1 %s joined game %s", PlayerId, this.gameId);
        this.gameStatus = 1;//there is one player on this game
        return 1;
    }
    else if (this.gameStatus == 1){
        //this player is player2 and starts the game
        this.player2 = PlayerId;//id which actually is a connectionId
        console.log("[Game.js]player2 %s joined game %s", PlayerId, this.gameId);
        this.gameStatus = 2;//there aretwo player on this game
        return 2;       
    }
    else 
        return "Something went wrong";
}

game.prototype.getOtherPlayer = function(PlayerId){
    if (PlayerId == this.player1)
        return this.player2;
    else  if (PlayerId == this.player2)
        return this.player1;    
    else 
        return "Something went wrong, this player might "    
    }

game.prototype.hasTwoPLayers = function(){
    if (this.gameStatus == 2){
        console.log("game %s is ready to start", this.id);
        return true;
    }
    return false;
}


game.prototype.validateTurn = function(playerId){
    if (playerId == this.player1 && this.playerturn %2 == 0)
        return true;
    if (playerId == this.player2 && this.playerturn %2 != 0)
        return true;
    return false;
}

game.prototype.promtTurn = function(){//return player whos turn it is
    this.playerturn ++;
    if (this.playerturn % 2 == 0){
        return this.player1;
    }else {
        return this.player2;
    }  
}

game.prototype.setBoard = function(playerId, board){
    if (playerId == this.player1)
        this.board1 = board;
    else if (playerId == this.player2)
        this.board2 = board;
}

game.prototype.checkHit = function(position, playerId){
    //gets a req from playerId trying to hit opponent at 'position'
    //there must be a better way than duble code.. :/
    if (playerId == this.player1){
        //check position in board2
        for (i=0;i<this.board2.length; i++){
            if (this.board2[i][0] == position[0] && this.board2[i][1] == position[1]){
                //delete from array - this will leave the poz 'undefined'
                delete this.board2[i][0];
                delete this.board2[i][1];
                return true;
            }
        }
        return false;
    }
    else if (playerId == this.player2){
        //check position in board1
        for (i=0;i<this.board1.length; i++){
            if (this.board1[i][0] == position[0] && this.board1[i][1] == position[1]){
                //delete from array
                delete this.board1[i][0];
                delete this.board1[i][1];
                return true;
            }
        }
        return false;
    }
}

game.prototype.checkWin = function(){
    let p1 = 0;
    for (i=0;i<this.board1.length;i++)
        if (typeof this.board1[i][0] !== 'undefined' )  //if (!(this.board1[i][0] === "undefined"))
            p1 = 1;
    let p2 = 0;
    for (i=0;i<this.board2.length;i++)
        if (typeof this.board2[i][0] !== "undefined")//if (!(this.board2[i][0] === "undefined"))
            p2 = 1;
    if (p2 == 0)
        return this.player1;//he won
    if (p1 == 0)
        return this.player2;//he won
    return 0;// no-one won yet                    
}



game.prototype.playersReady = function(playerId){
    if (playerId == this.player1)
        this.readyPlayer1 = true;
    if (playerId == this.player2)
        this.readyPlayer2 = true;
}

game.prototype.startGuessing = function(){//for the first player turn promt
    if (this.readyPlayer1 == true && this.readyPlayer2 == true && this.cycleState == 0){
        this.cycleState = 1;
        return 1;
    }
    return 0;
}

module.exports = game;