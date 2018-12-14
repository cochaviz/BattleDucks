// Globals
let grid_size = 10;
let override = false;

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

function hasCoordinate(arr, coordinate) {
    if (arr == null || coordinate == null)
        return false;

    for(let i=0; i<arr.length; i++) {
        if(arraysEqual(arr[i], coordinate)) {
            return true;
        }
    }
    return false;
}

// Shows overlay
function showOverlay(message){
    $("#overlay").css({"display" : "block"});
    $("#overlay_title").html(message);
}

function showQuit() {
    $("#quit_overlay").css({"display" : "block"});
    $("#overlay_title").html("Are you sure you want to quit?")
}

// Hides overlay
function hideOverlay(){
    $(".overlay").css({"display" : "none"})
}

// Show opponent board
function showOpponent(grid_size) {
        generateGrid("opponent_board", "opponent_grid", grid_size, "0");

        let placeholder = document.createElement("div");
        placeholder.setAttribute("id", "statistics");
        document.getElementById("opponent_board").appendChild(placeholder);

        $("#statistics").css({"display" : "block", "visibility": "visible"});
        $("#duckies").css({"visibility": "hidden", display: "none"});
        $("#opponent_board").css({"visibility": "visible", display: "block"});
}

// Update the in-game statistics
function updatePlayerStatistics(n_ducks_player, n_ducks_opponent, shots_fired) {
    $("#statistics").html(
        "<ul>" +
        "<li>Your ducks left: "+ n_ducks_player +"</li>" +
        "<li>Opponent's ducks left: "+ n_ducks_opponent +"</li>" +
        "<li>Shots fired: "+ shots_fired +"</li>" +
        "</ul>"
    );
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
    this.n_ducks_player = null;
    this.n_ducks_opponent = null;
    this.shots = 0;

    this.clicked_tiles = [];

    this.generateAll = function(){
        // Last position of any ship
        let prev_left;
        let prev_top;

        // Generate required HTML elements
        generateGrid("player_board", "player_grid", grid_size, "snappable");

        let placeholder = document.createElement("div");
        placeholder.setAttribute("id", "placeholder");
        document.getElementById("player_board").appendChild(placeholder);


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

    this.updateBoard = function(poz, hit){
        this.shots++;

        if(hit) {
            updateTile(poz, 3, "#player_board");    //rip
            this.n_ducks_player--;
        }
    };

    this.updateOtherBoard = function(poz, hit){
        this.shots++;
        this.clicked_tiles.push(poz);

        if(hit){
            updateTile(poz, 1, "#opponent_board");  //explosion
            this.n_ducks_opponent--;
        } else {
            updateTile(poz, 4, "#opponent_board");  //miss
        }
    };
}

(function setup(){
    let socket = new WebSocket("ws://localhost:3333");
    let game = new ClientGame();
    game.generateAll();

    socket.onmessage = function(event){
        let ServerMessage = JSON.parse(event.data);

        if (ServerMessage.type === "Waiting for a player to join") {
            // Update the player
            $("#placeholder").html("Hmmm... where is everybody?");
        }

        if (ServerMessage.type === "game is starting soon"){
            // Update the player
            $("#player_ready").toggleClass("ready_clickable").html("Ready");
            $("#placeholder").html("Let's get ready!");
            let not_clicked = true;

            $(document).ready(function() {
                $("#player_ready").click(function () {
                    // Check if board is valid
                    if(not_clicked) {
                        if (validBoard() || override) {
                            not_clicked = false;

                            // Update the player
                            $("#placeholder").html("We're ready!");
                            $("#player_ready").toggleClass("ready_clickable").html("Waiting for other player...");

                            // Make the placement permanent
                            let used_tiles = returnBoard();
                            insertDucks(used_tiles);

                            // Update game object
                            game.n_ducks_player = used_tiles.length;
                            game.n_ducks_opponent = used_tiles.length;

                            // Remove moveable ducks
                            $(".ship").remove();

                            // Generate and send server message
                            let myMsg = Messages.playerReady;
                            myMsg.data = used_tiles;
                            socket.send(JSON.stringify(myMsg));
                        } else {
                            $("#placeholder").html("Hey, you forgot some of us!");
                        }
                    }
                });
            });
        }
        if (ServerMessage.type === "All ducks on deck"){//both boards are ready for battle
            // Show opponent board
            showOpponent(grid_size);
            updatePlayerStatistics(game.n_ducks_player, game.n_ducks_opponent, game.shots);
        }
        if (ServerMessage.type === "YourTurn"){
            // Update the player
            $("#placeholder").html("Let's attack!!");

            $(document).ready(function(){
                $(".tile_0").click(function(){
                        // Read coordinate from div id
                    let coordinate_string = $(this).attr("id");
                    let position = [parseInt(coordinate_string.charAt(1)), parseInt(coordinate_string.charAt(3))];

                    if(!hasCoordinate(game.clicked_tiles, position)){
                        // Send server message
                        let myMsg = Messages.playerChose;
                        myMsg.data = position;
                        socket.send(JSON.stringify(myMsg));

                        // Update player
                        $("#placeholder").html("And now we wait...");
                    }
                });
            });
        }
        if (ServerMessage.type === "GuessResponse"){
            game.updateOtherBoard(ServerMessage.poz, ServerMessage.hit);
            updatePlayerStatistics(game.n_ducks_player, game.n_ducks_opponent, game.shots);
        }
        if (ServerMessage.type === "Hit"){
            game.updateBoard(ServerMessage.poz, ServerMessage.hit);
            updatePlayerStatistics(game.n_ducks_player, game.n_ducks_opponent, game.shots);
        }
        if (ServerMessage.type === "game aborted"){
            showOverlay("Your opponent left the game");
            //socket.close();
        }
        if (ServerMessage.type === "gameWon"){
            showOverlay("You won!");
            socket.close();
        }
        if (ServerMessage.type === "gameLost"){
            showOverlay("You lost!");
            socket.close();
        }
            
      
    };
    socket.onopen = function(){
    };

    socket.onclose = function(){
        // nothing ?
    };
    socket.onerror = function(){  
    };//idk

})();
