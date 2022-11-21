const { collection } = require("../models/token.model");
const Token = require("../models/token.model");

const getAllTokensByCollectionId = async (req, res) => {
  const collection_id = req.params.collection_id;
  let result = [];
  try {
    result = await Token.find({
      collection_id: collection_id,
    });
    res.status(200).json({
      status: true,
      data: result,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      status: false,
      data: "Faild",
    });
  }
};

const getTokenInfoByTokenIdCollection = async (req, res) => {
  const collection_id = req.params.collection_id;
  const token_id = req.params.token_id;
  let result = [];
  try {
    result = await Token.find({
      collection_id: collection_id,
      token_id: token_id,
    });
    res.status(200).json({
      status: true,
      data: result,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      status: false,
      data: "Faild",
    });
  }
};

module.exports = {
  getAllTokensByCollectionId,
  getTokenInfoByTokenIdCollection,
};
