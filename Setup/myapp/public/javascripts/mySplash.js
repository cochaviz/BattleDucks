// Shows overlay
function showOverlay(message){
    $("#overlay").css({"display" : "block"});
    $("#overlay_title").html(message);
}

// Hides overlay
function hideOverlay(){
    $("#overlay").css({"display" : "none"})
}