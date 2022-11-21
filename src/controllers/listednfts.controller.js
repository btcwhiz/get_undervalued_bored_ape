const axios = require("axios");
const jsonfile = require("jsonfile");
const api_key = process.env.API_KEY;
const { nftInfo } = require("../config");

const getMe = async (req, res) => {
  await updateFloorPrices();
  res.status(200).json({
    status: "success",
  });
};

const getListedNFTs = (req, res) => {
  const nfttype = req.params.nfttype;
  const nfttype_list = jsonfile.readFileSync(
    __dirname + "/../data/common/nfttype.json"
  );

  const nft_file = nfttype_list.filter((item) => {
    return item.type == nfttype;
  });

  if (nft_file.length == 0) {
    res.status(404).json({
      status: false,
      msg: "Unsupported nft",
    });
  } else {
    const filename = nft_file[0].filename;
    jsonfile.readFile(
      __dirname + `/../data/listednfts/${filename}`,
      (error, data) => {
        if (error) {
          console.log(error);
          res.status(404).json({
            status: "Faild",
          });
        } else {
          res.status(200).json({
            status: true,
            data: data,
          });
        }
      }
    );
  }
};

const getSaleHistory = async (req, res) => {
  let nfttype = req.params.nfttype;
  let token_id = req.params.token_id;
  let events = [];
  let next = "";
  const contract_address = nftInfo[nfttype].contract_address;
  while (true) {
    let config = {
      method: "get",
      url: `https://api.opensea.io/api/v1/events?asset_contract_address=${contract_address}&limit=50&token_id=${token_id}&event_type=successful&cursor=${next}`,
      headers: {
        "X-API-KEY": api_key,
      },
    };
    let res = {};
    try {
      res = await axios(config);
    } catch (e) {
      console.log(e);
      continue;
    }
    const asset_events = res.data.asset_events;
    asset_events.forEach((event) => {
      events.push({
        date: new Date(event.created_date).toDateString(),
        price: event.total_price / 10 ** 18,
        token_type: event.payment_token.symbol,
      });
    });
    if (res.data.next == null) {
      break;
    }
    next = res.data.next;
  }
  res.status(200).json({
    status: true,
    data: events,
  });
};

const getCollectionStats = async (req, res) => {
  let nfttype = req.params.nfttype;
  let collection_slug = nftInfo[nfttype].collection_slug;
  let config = {
    method: "get",
    url: `https://api.opensea.io/api/v1/collection/${collection_slug}/stats`,
    headers: {
      "X-API-KEY": api_key,
    },
  };

  let statsRes = {};
  while (true) {
    try {
      statsRes = await axios(config);
      break;
    } catch (e) {
      continue;
    }
  }
  const stats = statsRes.data.stats;

  res.status(200).json({
    status: true,
    data: stats,
  });
};

module.exports = {
  getMe,
  getListedNFTs,
  getSaleHistory,
  getCollectionStats,
};
