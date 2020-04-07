var express = require("express");
var router = express.Router();
//var stats = require("./myStats");//???

/* GET game page */
router.get ('/game', function (req, res) {
    res.sendFile("game.html", {root: "./public"});
});

module.exports = router;