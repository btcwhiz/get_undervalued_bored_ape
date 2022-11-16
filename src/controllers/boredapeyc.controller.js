const jsonfile = require("jsonfile");
const {
  getListedNFTs,
  getListedNFTs1,
  updateFloorPrices,
} = require("../utils/boredapeyc");

const getMe = async (req, res) => {
  await updateFloorPrices();
  res.status(200).json({
    status: "success",
  });
};

const getTraitFloorPrices = (req, res) => {
  const traitFloorPrices = jsonfile.readFile(
    __dirname + "/../data/boredapeyc/traitfloorprice.json",
    (error, data) => {
      if (error) {
        console.log(error);
      } else {
        res.status(200).json({
          status: "Success",
          data: data,
        });
      }
    }
  );
};

module.exports = {
  getMe,
  getTraitFloorPrices,
};
