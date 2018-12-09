var express = require("express");
var router = express.Router();


// GET HOME PAGE: SPLASH.HTML
router.get ('/', function (req, res) {
    res.sendFile("splash.html", {root: "./public"});
   // res.sendFile('splash.html', {root: path.join(__dirname,'./public')});
});

// GET GAME PAGE: GAME.HTML  
router.get ('/game', function (req, res) {
    res.sendFile("game.html", {root: "./public"});
});

module.exports = router;