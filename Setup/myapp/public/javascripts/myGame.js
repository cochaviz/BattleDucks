//var messages = require("./mymessages"); NO
function ClientGame(){
    this.myBoats = null;
    this.otherplayer = null;
    this.createBoard = function(){
        //18 tiles
        //Zohar :)
        //returns array with boat position
        //checks if the ducks are placed wright and only then returns
        //ready buuton fires the validity check function 
        let a = [[3,3]];
        return a;
    };
    this.takeAGuess = function(){
        //Zohar
        //makes a valid guess, return (lin,col)
        let a = [3,3];
        return a;
    }

    this.updateBoard = function(poz, hit){
        //hit = true/false or smth 
        //update gui
        
    }
    this.updateOtherBoard = function(poz, hit){
        //update gui
    }

}

(function setup(){
    var socket = new WebSocket("ws://localhost:3333");
    var game = new ClientGame();
    console.log("smth");//doesnt show idk why
    socket.onmessage = function(event){
        alert("recieved message: " + event.data);
        let ServerMessage = JSON.parse(event.data);
        alert("parsed message type is: " + ServerMessage.type);
        if (ServerMessage.type === "game is starting soon"){
            //var game = new ClientGame();
            let ducks = game.createBoard();//returns array with boat poz
            let myMsg = Messages.playerReady;
            myMsg.data = ducks;
            alert("**" + JSON.stringify(myMsg));
            socket.send(JSON.stringify(myMsg));
           // socket.send(ducks);
        }
        if (ServerMessage.type == "All ducks on deck"){//both boards are ready for battle
            //shows oponents board(ZOHAR)
        }
        if (ServerMessage.type == "YourTurn"){//my turn to make a guess
            //mouse listener (separate function ?) Zohar
            let position = game.takeAGuess();//returns a poz
            let myMsg = Messages.playerChose;
            myMsg.data = position;
            alert("**" + JSON.stringify(myMsg));
            socket.send(JSON.stringify(myMsg));
           // socket.send(position);
        }
        if (ServerMessage.type == "GuessResponse"){
            game.updateOtherBoard(ServerMessage.poz, ServerMessage.hit);
        }
        if (ServerMessage.type == "Hit"){//when this player gets atacked
            game.updateBoard(ServerMessage.poz, ServerMessage.hit);
        }
        if (ServerMessage.type == "game aborted")
            alert("game was aborted");
        if (ServerMessage.type == "gameWon")
            alert("YOU WON!");
        if (ServerMessage.type == "gameLost")
            alert("You Lost! Start new game!");
      
    }
    socket.onopen = function(){
        //let messageToServer = Messagez.hello;
        //socket.send(JSON.stringify(messageToServer));
       // socket.send("hello");
        //alert("this is sending"); OK
    };
})();//this fucking thing took me 4h; for immediate run
