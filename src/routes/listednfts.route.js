const express = require("express");
const boredapeycController = require("../controllers/listednfts.controller");

const router = express.Router();

router.get("/:nfttype", boredapeycController.getListedNFTs);
router.get("/getMe", boredapeycController.getMe);
router.get("/:nfttype/:token_id", boredapeycController.getSaleHistory);

module.exports = router;
