var express = require("express");
var http = require("http");
var path = require("path");
var myRouter = require("./routes/myroutes");// imports routes
var webSocket = require("ws");
var stats = require("./myStats");//imports global game stats (for tracking puposes)
var messages = require("./public/javascripts/mymessages");
var Game = require("./game");//imports game specifics (object & methods)
var port = process.argv[2];
var app = express();

var cookies = require("cookie-parser");//for, u guessed, cookies 
var credentials = require("./cookieCredentials");
app.use(cookies(credentials.cookieSecret));
var myCookies = {};//cookieid-how many visits
cookieId = 0;

app.use(express.static(__dirname + "/public"));


//using imported routes (this happens before creating the server)
//app.get("/", myRouter);// to be rendered with a ejs templatev for statsx
app.get("/game", myRouter);

app.set('views', __dirname + '/views')
app.set("view engine", "ejs");
app.get ('/', function (req, res) {
  //res.render("splash.ejs", {InitializedGames: stats.newGames, AbortedGames: stats.abortedGames, random: "42"});modu
  // res.cookie("visits", "0");
  if (req.cookies.id){//
    myCookies[req.cookies.id] ++;// increment the number of vizits for this user
    res.cookie("id", req.cookies.id);
    console.log("COOKIEif: ");
    console.log( req.cookies.id + "    visitTimes:" + myCookies[req.cookies.id]);
  }
  else {
    myCookies[cookieId++] = 1;
    res.cookie("id", cookieId-1);
    console.log("COOKIEelse: " );
    console.log( cookieId-1 + "    visitTimes:" + myCookies[cookieId-1]);
  }
 // console.log("COOKIE: " + req.cookies);
  res.render("splash", {InitializedGames: stats.newGames, AbortedGames: stats.abortedGames, PlayersJoined: stats.playersJoined});
});

//http.createServer(app).listen(port);
var server = http.createServer(app);
var wss = new webSocket.Server({ server });// in balloon demo 'var' is 'const'

var websockets = {};// maps connectionIds to game obj (in theory)

var connectionId = 0;
var currentGame = new Game(stats.newGames ++);//should i add a param ?


wss.on ("connection", function connection(ws){
  stats.playersJoined++;

  //for every new connection:
  let currentConnection = ws;//idk ws type
  currentConnection.id = connectionId ++;// unique id for each new connection 
  let joinType = currentGame.joinGame(currentConnection);
  websockets[currentConnection.id] = currentGame;// links player to a game obj. Usefull for..?

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

  }else {//smth went bad
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
    let clientMsg = JSON.parse(message);//gets the message from the ws connection//cant parse proper strings 
    let clientGame = websockets[currentConnection.id];//figures out which game is the player in
    
   /* if (clientMessage == "hey");
      console.log("Server recievede HEY from client");*/
   /* if (message == "hey")
      console.log("**Server recievede HEY from client");*/
    console.log("SERVER:[Message from client]" + currentConnection.id + "**" + message);
    if (clientMsg.type === "I placed my ducks"){
      clientGame.setBoard(currentConnection, clientMsg.data);
      clientGame.playersReady(currentConnection);
      if (clientGame.startGuessing() === 1){//-----------------------------------------------------NOT HERE (DO SEPARATE FUNC??)
        //this one time should also promt the user to change "dtrag ducks" to show "opponent board"
        let msg = messages.bothPlayerReady; 
        currentConnection.send(JSON.stringify(msg));
        clientGame.getOtherPlayer(currentConnection).send(JSON.stringify(msg));
        
        //start poking game
        let msg2 = messages.chose; 
        clientGame.promtTurn().send(JSON.stringify(msg2));
      }
    }
    //req-resp cycle
    if (clientMsg.type === "Guess"){//horrible coding
      if (clientGame.validateTurn(currentConnection)){
        //sends response back to client who requested
        let hit = clientGame.checkHit(clientMsg.data, currentConnection);//--------------------------------
        let msg = messages.GuessRes;
        msg.poz = clientMsg.data;
        msg.hit = hit;
        currentConnection.send(JSON.stringify(msg));

        //sends atack info to the other user
        let msg2 = messages.Attack;//dif type of response for the opponent cause client side needs to know which board to update
        msg2.poz = clientMsg.data;
        msg2.hit = hit;
        clientGame.getOtherPlayer(currentConnection).send(JSON.stringify(msg2));
        console.log("SERVER:{this position was hit ?}:"+ msg2.poz+ "-->"+ hit);

        //checks if the atack was a wining one
        if (clientGame.checkWin() === currentConnection){
          //this guy won
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
   
      //if (newMessage.type == messages.hello){
      //resp
    //}
  });
  currentConnection.on("close", function(code){
    stats.playersJoined--;
    console.log(currentConnection.id + " disconnected from game " + websockets[currentConnection.id]);
    let clientGame = websockets[currentConnection.id];
    stats.abortedGames ++;

    let msg = messages.aborted;

    if (clientGame.getOtherPlayer(currentConnection) !== -1 && clientGame.getOtherPlayer(currentConnection) !== null)
      clientGame.getOtherPlayer(currentConnection).send(JSON.stringify(msg));

    
    clientGame.disconnectPlayer(currentConnection);//this.playerId = -1;  DO IT IN A SEPPARATE FIELD    
  
    /* try {clientGame.getOtherPlayer(currentConnection).close();}
    catch{console.log("huh abrot huh");}*/
   /* if (code == 1001){//client closed the game
      //abort game or print stats
    }*/
  });

   
});

server.listen(port, function() {
  console.log("Server running on port " + port);
});

/////tester modules

/*var goPlay = function(){//aint working wth button1
  alert('hello!');
}*/
