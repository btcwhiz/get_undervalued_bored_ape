const axios = require("axios");
const jsonfile = require("jsonfile");
const CoinMarketCap = require("coinmarketcap-api");
const api_key = process.env.API_KEY;
const cm_api_key = process.env.COINMARKETCAP_API_KEY;
const { nftInfo } = require("../config");

const Token = require("../models/token.model");
const FloorPrice = require("../models/floorprice.model");
const Metadata = require("../models/metadata.model");

const getMe = async (req, res) => {
  await updateFloorPrices();
  res.status(200).json({
    status: "success",
  });
};

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const getEtherPrice = async () => {
  while (true) {
    try {
      const client = new CoinMarketCap(cm_api_key);
      const res = await client.getQuotes({ symbol: "ETH", convert: "USD" });
      return res.data["ETH"]["quote"]["USD"]["price"];
    } catch (e) {
      sleep(2000);
      console.log("Faild");
      continue;
    }
  }
};

const getFurthestNFTs = async (req, res) => {
  const collection = req.params.nfttype;
  const page = req.params.page;
  // const etherPrice = await getEtherPrice();
  const etherPrice = 1165;
  let listedTokens = await Token.find({
    collection_name: collection,
    "order.0": { $exists: true },
  });
  let tempList = [];
  for (let i = 0; i < listedTokens.length; i++) {
    let token = listedTokens[i];
    const metadata = await Metadata.findOne({ token_id: token.token_id });
    let floorPriceTemp = 0,
      floorPriceToken = "ETH",
      floorPriceTokenPrice = 1150;
    let traits = metadata.traits;
    for (let j = 0; j < traits.length; j++) {
      const floorPrice = await FloorPrice.findOne({
        collection_name: collection,
        trait_type: traits[j].trait_type,
        trait_value: traits[j].trait_value.toLowerCase(),
      });
      if (
        floorPriceTemp * floorPriceTokenPrice <
        floorPrice.floor_price * floorPrice.payment_token_price
      ) {
        floorPriceTemp = floorPrice.floor_price;
        floorPriceToken = floorPrice.payment_token;
        floorPriceTokenPrice = floorPrice.payment_token_price;
      }
    }
    tempList.push({
      collection_name: token.collection_name,
      token_id: token.token_id,
      order: token.order,
      sale_history: token.sale_history,
      floor_price: floorPriceTemp,
      floor_price_token: floorPriceToken,
      floor_price_token_price: floorPriceTokenPrice,
    });
  }
  tempList.sort((token1, token2) => {
    let diff1 = 0;
    if (token1.order.length == 1) {
      diff1 =
        token1.floor_price * token1.floor_price_token_price -
        token1.order[0].price * token1.order[0].payment_token_price;
    } else {
      diff1 = Math.min(
        token1.floor_price * token1.floor_price_token_price -
          token1.order[0].price * token1.order[0].payment_token_price,
        token1.floor_price * token1.floor_price_token_price -
          token1.order[1].price * token1.order[1].payment_token_price
      );
    }
    let diff2 = 0;
    if (token2.order.length == 1) {
      diff2 =
        token2.floor_price * token2.floor_price_token_price -
        token2.order[0].price * token2.order[0].payment_token_price;
    } else {
      diff2 = Math.min(
        token2.floor_price * token2.floor_price_token_price -
          token2.order[0].price * token2.order[0].payment_token_price,
        token2.floor_price * token2.floor_price_token_price -
          token2.order[1].price * token2.order[1].payment_token_price
      );
    }
    if (diff1 < diff2) {
      return 1;
    } else if (diff1 > diff2) {
      return -1;
    } else return 0;
  });
  const result =
    tempList.length >= 10 * page
      ? tempList.slice(10 * (page - 1), 10 * page)
      : [];
  res.status(200).json({
    status: true,
    data: result,
  });
};

const getListedNFTs = async (req, res) => {
  const collection = req.params.nfttype;
  const filter = req.params.filter;
  const page = req.params.page;
  // const etherPrice = await getEtherPrice();
  const etherPrice = 1165;
  Token.find({
    collection_name: collection,
    "order.0": { $exists: true },
  }).then((listedTokens) => {
    if (filter == "bestprice") {
      listedTokens.sort((token1, token2) => {
        let price1 = 0;
        token1.order.forEach((item) => {
          if (item.payment_token_price) {
            let diff = item.price * (item.payment_token_price - etherPrice);
            if (diff > price1) {
              price1 = diff;
            }
          }
        });
        let price2 = 0;
        token2.order.forEach((item) => {
          if (item.payment_token_price) {
            let diff = item.price * (item.payment_token_price - etherPrice);
            if (diff > price2) {
              price2 = diff;
            }
          }
        });

        if (price1 < price2) {
          return 1;
        } else if (price1 > price2) {
          return -1;
        } else {
          return 0;
        }
      });
    } else if (filter == "topsale") {
      listedTokens.sort((token1, token2) => {
        let cnt1 =
          token1.sale_history.length > 0 ? token1.sale_history.length : 0;
        let cnt2 =
          token1.sale_history.length > 0 ? token2.sale_history.length : 0;

        if (cnt1 < cnt2) {
          return 1;
        } else if (cnt1 > cnt2) {
          return -1;
        } else {
          return 0;
        }
      });
    } else if (filter == "lastsale") {
      listedTokens.sort((token1, token2) => {
        let orderPrice1 = 0;
        token1.order.forEach((item) => {
          if (item.price * item.payment_token_price > orderPrice1) {
            orderprice1 = item.price * item.payment_token_price;
          }
        });
        let lastPrice1 =
          token1.sale_history.length == 0
            ? 0
            : token1.sale_history[0].price *
              token1.sale_history[0].payment_token_price;
        let diff1 = lastPrice1 - orderPrice1;

        let orderPrice2 = 0;
        token2.order.forEach((item) => {
          if (item.price * item.payment_token_price > orderPrice2) {
            orderprice2 = item.price * item.payment_token_price;
          }
        });
        let lastPrice2 =
          token2.sale_history.length == 0
            ? 0
            : token2.sale_history[0].price *
              token2.sale_history[0].payment_token_price;
        let diff2 = lastPrice2 - orderPrice2;

        if (diff1 < diff2) {
          return 1;
        } else if (diff1 > diff2) {
          return -1;
        } else {
          return 0;
        }
      });
    }
    const result =
      listedTokens.length >= 10 * page
        ? listedTokens.slice(10 * (page - 1), 10 * page)
        : [];
    res.status(200).json({
      status: true,
      data: result,
    });
  });
};

const getFloorPrices = async (req, res) => {
  res.status(200).json({
    status: true,
    data: "success",
  });
};

const getCollectionStats = async (req, res) => {
  let nfttype = req.params.nfttype;
  const stats = jsonfile.readFileSync(
    __dirname + `/../data/stats/${nfttype}.json`
  );

  res.status(200).json({
    status: true,
    data: stats,
  });
};

const getTokenById = async (req, res) => {
  const collection = req.params.collection;
  const token_id = req.params.token_id;
  let token = await Token.findOne({
    collection_name: collection,
    token_id: token_id,
  });
  let metadata = await Metadata.findOne({ token_id: token_id });
  const traits = metadata.traits;
  let trait_temp = [];
  for (let i = 0; i < traits.length; i++) {
    let floor = await FloorPrice.findOne({
      collection_name: collection,
      trait_type: traits[i].trait_type,
      trait_value: traits[i].trait_value.toLowerCase(),
    });
    trait_temp.push({
      trait_type: traits[i].trait_type,
      trait_value: traits[i].trait_value,
      floor_price: floor.floor_price,
    });
  }
  let result = {
    collection_name: token.collection_name,
    token_id: token.token_id,
    order: token.order,
    sale_history: token.sale_history,
    traits: trait_temp,
  };
  res.status(200).json({
    status: true,
    data: result,
  });
};

module.exports = {
  getMe,
  getListedNFTs,
  getCollectionStats,
  getFloorPrices,
  getFurthestNFTs,
  getTokenById,
};
