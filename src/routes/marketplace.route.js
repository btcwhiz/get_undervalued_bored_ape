const express = require("express");
const marketplaceController = require("../controllers/marketplace.controller");

const router = express.Router();

router.get("/getAll", marketplaceController.getAllMarketplace);
router.get("/getMarketplaceById/:id", marketplaceController.getMarketplaceById);
router.post("/add", marketplaceController.addMarketplace);

module.exports = router;
