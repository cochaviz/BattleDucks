// DEBUG -- REMOVE FOR PROD
let override = false;

// Globals
let grid_size = 10;

// Check equality of arrays
function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

// Show opponent board
function showOpponent(grid_size) {
        generateGrid("opponent_board", "opponent_grid", grid_size, 0);

        $("#duckies").css({"visibility": "hidden", display: "none"});
        $("#opponent_board").css({"visibility": "visible", display: "block"});
}


// Generate a grid consisting of divs
function generateGrid(parent_id, grid_id, size, tile_status) {
    let element = document.createElement("div");
    element.setAttribute("class", "grid");
    element.setAttribute("id", grid_id);

    document.getElementById(parent_id).appendChild(element);

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            element = document.createElement("div");
            element.setAttribute("class", "tile_"+tile_status);
            element.setAttribute("id", "("+j+","+i+")");

            document.getElementById(grid_id).appendChild(element);
        }
    }
}

// Calculate the coordinate of a ship cell within the player_grid
function getUnitCoordinate(cell) {
    let grid_position = $("#player_grid").offset();
    

    let position_top = cell.offset().top - grid_position.top;
    let position_left = cell.offset().left - grid_position.left;

    let tile = getComputedStyle(document.querySelector(".tile_snappable"));

    let grid_x = Math.round(position_left/tile.width.slice(0,2));
    let grid_y = Math.round(position_top/tile.height.slice(0,2));

    return [grid_x, grid_y];
}

// Return all the coordinates of the cells of a ship in a 2D array
function getShipCoordinate(ship) {
    let cells = ship.children();
    let cell_coordinates = [];

    for(let i=0; i<cells.length; i++) {
        cell_coordinates.push(getUnitCoordinate($(cells[i]), $("#player_grid")));
    }
    return cell_coordinates;
}

// Check if ship postition is valid (e.g. within the boarders of the grid), and if not return to the last valid position
function validPosition(this_ship, grid_size) {
    let cell_positions = getShipCoordinate(this_ship, $("#player_grid"));
    for(let i=0; i<cell_positions.length; i++){
        let this_cell = cell_positions[i];

        if(this_cell[0] >= grid_size || this_cell[0] < 0 || this_cell[1] >= grid_size || this_cell[1] < 0) {
            return false;
        }
    }
    return true;
}

// Check if ships aren't overlapping with each other
function noOverlap() {
    let used_tiles = [];
    let ships = document.getElementsByClassName("ship");

    for(let i=0; i<ships.length; i++) {
        let current_ship_coord = getShipCoordinate($(ships[i]), $("#player_grid"));

        for(let j = 0; j < used_tiles.length; j++) {
            for(let k = 0; k < current_ship_coord.length; k++) {
                if (arraysEqual(current_ship_coord[k], used_tiles[j])) {
                    return false;
                }
            }
        }
        for(let j = 0; j < current_ship_coord.length; j++){
            used_tiles.push(current_ship_coord[j]);
        }
    }
    return true;
}

// Check if all ships are in the board, and if they don't overlap
function validBoard() {
    let ships = document.getElementsByClassName("ship");

    if(noOverlap()) {
        for(let i=0; i<ships.length; i++) {
            if(!validPosition($(ships[i]))) {
                return false;
            }
        }
        return true;
    }
    return false;
}

// Return the coordinates of all ship tiles
function returnBoard() {
    let used_tiles = [];
    let ships = document.getElementsByClassName("ship");

    for(let i=0; i<ships.length; i++) {
        let current_ship_coord = getShipCoordinate($(ships[i]), $("#player_grid"));

        for(let j = 0; j < current_ship_coord.length; j++){
            used_tiles.push(current_ship_coord[j]);
        }
    }
    return used_tiles;
}

// Rotate children of a parent -90 dergrees
function rotateChildren(parent) {
    let children = parent.children();
    for(let i=0; i<children.length; i++) {
        $(children[i]).toggleClass("rotate_-90");
    }
}

// Update a tile given a status and coordinate
function updateTile(coordinate, status, parent) {
    $(parent).find("#\\("+coordinate[0]+"\\,"+coordinate[1]+"\\)").attr("class", "tile_"+status);
}

// Insert all ducks into the player board permanently
function insertDucks(used_tiles) {
    for(let i=0; i<used_tiles.length; i++) {
        updateTile(used_tiles[i], 2, "#player_board");
    }
}

// Checks if an array contains a coordinate
function containsCoordinate(array, coordinate) {
    for(let i=0; i<array.length; i++) {
        if(arraysEqual(coordinate, array[i])) {
            return true;
        }
    }
    return false;
}

// Game Object
function ClientGame(){
    this.myBoats = null;
    this.otherplayer = null;

    this.generateAll = function(){
        // Last position of any ship
        let prev_left;
        let prev_top;

        // Generate required HTML elements
        generateGrid("player_board", "player_grid", grid_size, "snappable");

        // UI functionality
        $(document).ready(function(){
            let audioElement = document.createElement("audio");
            audioElement.setAttribute("src", "sounds/oof.mp3");

            $(".ship").draggable({
                snap: ".tile_snappable", snapTolerance : "40", snapMode: "inner",
        
                start: function() {
                    // Save where this is coming from
                    prev_left = $(this).css("left");
                    prev_top = $(this).css("top");
                },
                
                stop: function() {
                    // Revert changes if position is invalid
                    if(!(validPosition($(this), grid_size) && noOverlap())) {
                        $(this).css({left:prev_left, top:prev_top});
                    }
                }
        
            }).click(function() {
                // Save previous position
                prev_left = $(this).css("left");
                prev_top = $(this).css("top");

                // Rotate ship and ship children
                $(this).toggleClass("rotate_90");
                rotateChildren($(this));

                // Revert rotation and position
                if(!(validPosition($(this), grid_size) && noOverlap())) {
                    $(this).css({left:prev_left, top:prev_top});

                    $(this).toggleClass("rotate_90");
                    rotateChildren($(this));
        
                    $("#placeholder").html("QUACK! I cannot rotate here!").css({"transition": "ease-out"});
                    audioElement.play();
                }
        
            });
        });
    };

    this.createBoard = function(){
        //---------------------------------------------
        a = [[2,2], [3,3]];
        return a;
    };

    this.takeAGuess = function(position){
        //Zohar
        //makes a valid guess, return (lin,col)

        let a = position;
        return a;
    };

    this.updateBoard = function(poz, hit){
        if(hit){
            updateTile(poz, 3, "#player_board");    //rip
        }
        
    };

    this.updateOtherBoard = function(poz, hit){
        if(hit){
            updateTile(poz, 1, "#opponent_board");  //explosion
        } else {
            updateTile(poz, 4, "#opponent_board");  //miss
        }
    };
}

(function setup(){
    let socket = new WebSocket("ws://localhost:3333");
    let game = new ClientGame();
    console.log("smth");// Doesn't show i don't know why...
    game.generateAll(); // I have the same problem...

    let clicked_tiles = [];

    socket.onmessage = function(event){
        let ServerMessage = JSON.parse(event.data);

        if (ServerMessage.type === "Waiting for a player to join") {
            // Update the player
            $("#placeholder").html("Let's get ready...");
        }

        if (ServerMessage.type === "game is starting soon"){
            // Update the player
            $("#player_ready").toggleClass("ready_clickable").html("Ready");

            $(document).ready(function() {
                $("#player_ready").click(function () {
                    // Check if board is valid
                    if(validBoard() || override) {
                        // Update the player and make ready button ready button clickable
                        $("#placeholder").html("We're ready!");
                        $("#player_ready").toggleClass("ready_clickable").html("Waiting for other player...");

                        // Make the placement permanent
                        let used_tiles = returnBoard();
                        insertDucks(used_tiles);

                        // Generate and send server message
                        let myMsg = Messages.playerReady;
                        myMsg.data = used_tiles;
                        socket.send(JSON.stringify(myMsg));
                    } else {
                        $("#placeholder").html("Hey, you forgot me!");
                    }
                });
            });
        }
        if (ServerMessage.type === "All ducks on deck"){//both boards are ready for battle
            // Show opponent board
            showOpponent(grid_size);
        }
        if (ServerMessage.type === "YourTurn"){
            // Update the player
            $("#placeholder").html("Let's attack!!");

            $(document).ready(function(){
                $("#opponent_grid").find(".tile_0").click(function(){
                    // Read coordinate from div id
                    let coordinate_string = $(this).attr("id");
                    let position = [parseInt(coordinate_string.charAt(1)), parseInt(coordinate_string.charAt(3))];

                    // If the clicked div hasn't been clicked before
                    //if(!(containsCoordinate(clicked_tiles, position))) {
                    //    clicked_tiles.push(position);

                        // Send server message
                        let myMsg = Messages.playerChose;
                        myMsg.data = position;
                        socket.send(JSON.stringify(myMsg));

                        // Update player
                        $("#placeholder").html("And now we wait...");
                    //}
                });
            });
        }
        if (ServerMessage.type === "GuessResponse"){
            game.updateOtherBoard(ServerMessage.poz, ServerMessage.hit);
        }
        if (ServerMessage.type === "Hit"){
            game.updateBoard(ServerMessage.poz, ServerMessage.hit);
        }
        if (ServerMessage.type === "game aborted")
            alert("game was aborted");
        if (ServerMessage.type === "gameWon")
            alert("YOU WON!");
        if (ServerMessage.type === "gameLost")
            alert("You Lost! Start new game!");
      
    }
    socket.onopen = function(){
        //let messageToServer = Messagez.hello;
        //socket.send(JSON.stringify(messageToServer));
       // socket.send("hello");
        //alert("this is sending"); OK
    };

    socket.onclose = function(){
        // nothuing ?
    };

})();
