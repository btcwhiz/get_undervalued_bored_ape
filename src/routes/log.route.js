const express = require("express");
const logController = require("../controllers/log.controller");

const router = express.Router();

router.get("/:nfttype", logController.getLogs);

module.exports = router;
