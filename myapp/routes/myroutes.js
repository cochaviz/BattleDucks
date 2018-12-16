var express = require("express");
var router = express.Router();
//var stats = require("./myStats");//???

// GET GAME PAGE: GAME.HTML  
router.get ('/game', function (req, res) {
    res.sendFile("game.html", {root: "./public"});
});


//router.set("view engine", "ejs");

// GET HOME PAGE: SPLASH.HTML
/*router.get ('/', function (req, res) {
   // res.render("splash.ejs", {InitializedGames: stats.newGames, AbortedGames: stats.abortedGames, random: "42"});//doesnt work here ??
    res.sendFile("splash.html", {root: "./public"});
   // res.sendFile('splash.html', {root: path.join(__dirname,'./public')});
});*/


module.exports = router;