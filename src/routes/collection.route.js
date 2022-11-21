const express = require("express");
const collectionController = require("../controllers/collection.controller");

const router = express.Router();

router.get("/getAll", collectionController.getAllCollection);
router.get("/getCollectionById/:id", collectionController.getCollectionById);
router.post("/add", collectionController.addCollection);

module.exports = router;
