var express = require("express");
var router = express.Router();
//var stats = require("./myStats");//???

// GET GAME PAGE: GAME.HTML  
router.get ('/game', function (req, res) {
    res.sendFile("game.html", {root: "./myapp/public"});
});

module.exports = router;