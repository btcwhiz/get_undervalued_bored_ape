const express = require("express");
const boredapeycController = require("../controllers/boredapeyc.controller");

const router = express.Router();

router.get("/getTraitFloorPrices", boredapeycController.getMe);

module.exports = router;
