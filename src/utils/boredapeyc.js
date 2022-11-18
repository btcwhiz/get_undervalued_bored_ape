const axios = require("axios");
const jsonfile = require("jsonfile");
const { boredapeyc } = require("../config");
const api_key = process.env.API_KEY;

const getListedNFTs1 = async () => {
  const listedNFTS = jsonfile.readFile(
    __dirname + "/../data/boredapeyc/listedNFTs.json"
  );
  return listedNFTS;
};

const updateFloorPrices = async () => {
  console.log("first");
  const listedNFTS = jsonfile.readFileSync(
    __dirname + "/../data/boredapeyc/listedNFTs.json"
  );
  console.log("first", listedNFTS);

  let floorPrices = jsonfile.readFileSync(
    __dirname + "/../data/boredapeyc/traitfloorprice.json"
  );
  console.log("first", floorPrices);

  const metadata = jsonfile.readFileSync(
    __dirname + "/../data/boredapeyc/tokenmetadata.json"
  );

  for (let i = 0; i < listedNFTS.length; i++) {
    let token_id = listedNFTS[i].token_id;
    let price = listedNFTS[i].price;
    let traits = metadata[token_id].attributes;
    console.log("token info", token_id, price);
    for (let j = 0; j < traits.length; j++) {
      let trait_type = traits[j].trait_type;
      let trait_value = traits[j].value.toLowerCase();
      console.log("process", trait_type, trait_value);
      if (
        floorPrices[trait_type][trait_value].floor_price == 0 ||
        floorPrices[trait_type][trait_value].floor_price > price
      ) {
        floorPrices[trait_type][trait_value].floor_price = price;
      }
    }
  }
  jsonfile.writeFile(
    __dirname + "/../data/boredapeyc/traitfloorprice.json",
    floorPrices,
    { spaces: 2 },
    (err) => {
      if (err) {
        console.log(err);
      }
    }
  );
};

const getListedNFTs = async () => {
  listedNFTS = [];
  let cur = 0;

  while (cur < 10000) {
    let token_ids = "";
    for (let i = cur; i < cur + 20; i++) {
      token_ids += `token_ids=${i}&`;
    }
    let next = "";
    do {
      let config = {
        method: "get",
        url: `https://api.opensea.io/v2/orders/ethereum/seaport/listings?asset_contract_address=${boredapeyc.contract_address}&limit=50&${token_ids}&order_by=created_date&order_direction=desc&cursor=${next}`,
        headers: {
          "X-API-KEY": api_key,
        },
      };
      let res = {};
      try {
        res = await axios(config);
        console.log(cur);
      } catch (e) {
        console.log(e.data);
        continue;
      }
      const orders = res.data.orders;
      for (let i = 0; i < orders.length; i++) {
        let obj = {
          token_id: orders[i].maker_asset_bundle.assets[0].token_id,
          price: orders[i].current_price / 10 ** 18,
          created_date: orders[i].created_date,
          end_date: orders[i].closing_date,
        };
        listedNFTS.push(obj);
      }
      next = res.data.next;
    } while (next != null);
    cur += 20;
  }
  listedNFTS.sort((p1, p2) =>
    Number(p1.token_id) > Number(p2.token_id)
      ? 1
      : Number(p1.token_id) < Number(p2.token_id)
      ? -1
      : 0
  );
  let index = 1;
  while (index < listedNFTS.length) {
    if (listedNFTS[index].token_id == listedNFTS[index - 1].token_id) {
      listedNFTS.splice(index, 1);
      continue;
    }
    index++;
  }
  jsonfile.writeFile(
    __dirname + "/../data/listednfts/boredapeyc.json",
    listedNFTS,
    { spaces: 2 },
    (err) => {
      if (err) {
        console.log(err);
      }
    }
  );
};

module.exports = {
  updateFloorPrices,
  getListedNFTs,
  getListedNFTs1,
};
