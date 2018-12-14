var game = function(gameId)  {
    this.player1 = null,//to be initialized with player-ws-connection id 
    this.player2 = null,
    this.playerturn = -1,
    this.cycleState = 0,
    this.board1 = null,
    this.board2 = null,
    this.id = gameId,
    this.readyPlayer1 = false,
    this.readyPlayer2 = false,
    this.gameStatus = 0//nr of players joined
}


game.prototype.joinGame = function(PlayerId){
    if (this.gameStatus == 0){
        this.player1 = PlayerId;
        this.gameStatus = 1;
        return 1;
    }
    else if (this.gameStatus == 1){//game already has player1
        if (this.player1 == -1){//if the player1 aborted before the game to start
            //recovarable game
            this.player1 = PlayerId;
            this.gameStatus = 1;
            return 1;
        }else{
            //this player is player2 and starts the game
            this.player2 = PlayerId;
            this.gameStatus = 2;
            return 2;  
        }     
    }
    else 
        return "Something went wrong";
}

//gets other playerId, the opponent of current palyer
game.prototype.getOtherPlayer = function(PlayerId){
    if (PlayerId == this.player1)
        return this.player2;
    else  if (PlayerId == this.player2)
        return this.player1;    
    else 
        return "Something went wrong";    
}

//checks if a game is full and returns true if so
game.prototype.hasTwoPLayers = function(){
    if (this.gameStatus == 2){
        console.log("game %s is ready to start", this.id);
        return true;
    }
    return false;
}

//validates player turn
game.prototype.validateTurn = function(playerId){
    if (playerId == this.player1 && this.playerturn %2 == 0)
        return true;
    if (playerId == this.player2 && this.playerturn %2 != 0)
        return true;
    return false;
}

//return player whos turn it is
game.prototype.promtTurn = function(){
    this.playerturn ++;
    if (this.playerturn % 2 == 0){
        return this.player1;
    }else {
        return this.player2;
    }  
}

// recieves array with ducks and saves it
game.prototype.setBoard = function(playerId, board){
    if (playerId == this.player1)
        this.board1 = board;
    else if (playerId == this.player2)
        this.board2 = board;
}

//checks if a player hit/miss position [x,y] on opponents board
game.prototype.checkHit = function(position, playerId){
    if (playerId == this.player1){
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
        for (i=0;i<this.board1.length; i++){
            if (this.board1[i][0] == position[0] && this.board1[i][1] == position[1]){
                delete this.board1[i][0];
                delete this.board1[i][1];
                return true;
            }
        }
        return false;
    }
}

//checks if the players still have alive ducks
game.prototype.checkWin = function(){
    let p1 = 0;
    for (i=0;i<this.board1.length;i++)
        if (typeof this.board1[i][0] !== 'undefined'  && this.board1[i][0] >= 0){  
            p1 = 1;
            console.log(this.board1[i][0]);
        }
    let p2 = 0;
    for (i=0;i<this.board2.length;i++)
        if (typeof this.board2[i][0] !== "undefined" && this.board2[i][0] >= 0)
            p2 = 1;
    if (p2 == 0)
        return this.player1;//player1 won
    if (p1 == 0)
        return this.player2;//player2 won
    return 0;// no-one won yet                    
}


// remembers if one player has the board ready
game.prototype.playerReady = function(playerId){
    if (playerId == this.player1)
        this.readyPlayer1 = true;
    if (playerId == this.player2)
        this.readyPlayer2 = true;
}

//checks if both player have set their boards
game.prototype.bothPlayersReady = function(){
    if (this.readyPlayer1 == true && this.readyPlayer2 == true && this.cycleState == 0){
        this.cycleState = 1;
        return 1;
    }
    return 0;
}

//remembers that a player disconnected
game.prototype.disconnectPlayer = function(playerId){
    if (this.player1 == playerId)
        this.player1 = -1;
    if (this.player2 == playerId)
        this.player2 = -1;
}


module.exports = game;