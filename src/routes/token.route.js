const express = require("express");
const tokenController = require("../controllers/token.controller");
const router = express.Router();

router.get("/:collection_id", tokenController.getAllTokensByCollectionId);
router.get("/:collection_id", tokenController.getTokenInfoByTokenIdCollection);

module.exports = router;
