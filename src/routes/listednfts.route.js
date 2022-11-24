const express = require("express");
const boredapeycController = require("../controllers/listednfts.controller");

const router = express.Router();

router.get("/:nfttype/:filter/:page", boredapeycController.getListedNFTs);
router.get(
  "/furthest/:nfttype/:page/floorprice",
  boredapeycController.getFurthestNFTs
);
// router.get("/furthest/:nfttype/:page/floorprice", (req, res) => {
//   console.log("adsf");
//   res.json("asdf");
// });
router.get(
  "/token/:collection/:token_id/token",
  boredapeycController.getTokenById
);
router.get("/stats/:nfttype", boredapeycController.getCollectionStats);
router.get("/getMe", boredapeycController.getMe);
router.get("/floorprices", boredapeycController.getFloorPrices);

module.exports = router;
