var express = require("express");
var http = require("http");
var webSocket = require("ws");
var path = require("path");

var Game = require("./game");//imports game specifics (object & methods)
var myRouter = require("./routes/myroutes");// imports routes
var stats = require("./myStats");//imports global game stats (for tracking puposes)
var messages = require("./public/javascripts/mymessages");

var port = process.argv[2];
var app = express();

var cookies = require("cookie-parser");
var credentials = require("./cookieCredentials");
app.use(cookies(credentials.cookieSecret));

var myCookies = {};//cookieId - nr of visits per unique Id
cookieId = 0;

app.use(express.static(__dirname + "/public"));
app.set('views', __dirname + '/views');
app.set("view engine", "ejs");


app.get("/game", myRouter);
app.get ('/', function (req, res) {// move to myRoutes
  if (req.cookies.id){//if this cookie already exists
    myCookies[req.cookies.id] ++;// increment the number of vizits for this user
    res.cookie("id", req.cookies.id);
    console.log( req.cookies.id + "    visitTimes:" + myCookies[req.cookies.id]);
  }
  else {//create new cookie
    myCookies[cookieId++] = 1;
    res.cookie("id", cookieId-1);
    console.log( cookieId-1 + "    visitTimes:" + myCookies[cookieId-1]);
  }
  res.render("splash", {InitializedGames: stats.newGames, AbortedGames: stats.abortedGames, PlayersJoined: stats.playersJoined});
});


var server = http.createServer(app);
var wss = new webSocket.Server({ server });

var websockets = {};// maps connectionIds to game obj 

var connectionId = 0;//unique Id for new connection
var currentGame = new Game(stats.newGames ++);// creates new game obj


wss.on ("connection", function connection(ws){
  stats.playersJoined++;

  //for every new connection:
  let currentConnection = ws;
  currentConnection.id = connectionId ++;
  let joinType = currentGame.joinGame(currentConnection);
  websockets[currentConnection.id] = currentGame;// links player to a game obj

  //currentConnection.send("connected");//debugging
  console.log("[app.js] SERVER: this user: " +  currentConnection.id + " connected to this game: " + currentGame.id);
  console.log("[app.js] SERVER: nr of games: " + stats.newGames);

  if (joinType === 1){
    let message = messages.waitForPLayer;
    currentConnection.send(JSON.stringify(message));
  }else if (joinType === 2){
    let message = messages.gameStarting;
    currentConnection.send(JSON.stringify(message));
    let otherPlayer = currentGame.getOtherPlayer(currentConnection);
    otherPlayer.send(JSON.stringify(message));//anounce player 1 that game is starting

  }else {//smth went bad - recoverable
    let message = messages.unknownError1;
    currentConnection.send(JSON.stringify(message));
    let otherPLayer = currentGame.getOtherPlayer(currentConnection);
    otherPLayer.send(JSON.stringify(message));
  }

  if (currentGame.hasTwoPLayers()){
    currentGame = new Game(stats.newGames++);//add param ?
  }

  //Now are the messages coming in from the players
  currentConnection.on("message", function incoming(message){
    let clientMsg = JSON.parse(message); 
    let clientGame = websockets[currentConnection.id];//figures out which game is the player in
    
    console.log("SERVER: [Message from client]" + currentConnection.id + " says: " + message);
    if (clientMsg.type === "I placed my ducks"){
      clientGame.setBoard(currentConnection, clientMsg.data);
      clientGame.playerReady(currentConnection);
      if (clientGame.bothPlayersReady() === 1){//if both players have joined, the game can start

        // players can prepare for game start
        let msg = messages.bothPlayerReady; 
        currentConnection.send(JSON.stringify(msg));
        clientGame.getOtherPlayer(currentConnection).send(JSON.stringify(msg));
        
        //start poking game, player1 is first 
        let msg2 = messages.chose; 
        clientGame.promtTurn().send(JSON.stringify(msg2));
      }
    }

    //req-resp atack cycle 
    if (clientMsg.type === "Guess"){
      if (clientGame.validateTurn(currentConnection)){// check if the req is from the right user

        //sends response back to client who requested the atack
        let hit = clientGame.checkHit(clientMsg.data, currentConnection);
        let msg = messages.GuessRes;
        msg.poz = clientMsg.data;
        msg.hit = hit;
        currentConnection.send(JSON.stringify(msg));

        //sends atack info to the other player
        let msg2 = messages.Attack;
        msg2.poz = clientMsg.data;
        msg2.hit = hit;
        clientGame.getOtherPlayer(currentConnection).send(JSON.stringify(msg2));
        
        console.log("SERVER: user" + currentConnection.id + "hit "+ clientGame.getOtherPlayer(currentConnection).id + "at position" + msg2.poz+ "-->"+ hit);

        //checks if the atack was a wining one that should end the game
        if (clientGame.checkWin() === currentConnection){//this player won
          console.log (currentConnection.id + "won the game " + clientGame.id + "against other player :" +  clientGame.getOtherPlayer(currentConnection).in);
          let msg = messages.gameWon;
          currentConnection.send(JSON.stringify(msg));
          let msg2 = messages.gameLost;
          clientGame.getOtherPlayer(currentConnection).send(JSON.stringify(msg2));
        }
        else {
          //promts the next user to take his turn
          let msg3 = messages.chose; 
          clientGame.promtTurn().send(JSON.stringify(msg3));
        }
      }
    }
  });


  currentConnection.on("close", function(code){
    stats.playersJoined--;
    stats.abortedGames ++;

    console.log(currentConnection.id + " disconnected from game " + websockets[currentConnection.id]);
    let clientGame = websockets[currentConnection.id];

    let msg = messages.aborted;
    if (clientGame.getOtherPlayer(currentConnection) !== -1 && clientGame.getOtherPlayer(currentConnection) !== null)
      clientGame.getOtherPlayer(currentConnection).send(JSON.stringify(msg));
  
    clientGame.disconnectPlayer(currentConnection);//this.playerId = -1;     
  });

});

server.listen(port, function() {
  console.log("Server running on port " + port);
});
