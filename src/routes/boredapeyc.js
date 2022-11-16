const express = require("express");
const boredapeycController = require("../controllers/boredapeyc.controller");

const router = express.Router();

router.get("/getTraitFloorPrices", boredapeycController.getTraitFloorPrices);
router.get("/getMe", boredapeycController.getMe);

module.exports = router;
