const axios = require("axios");
const jsonfile = require("jsonfile");
const api_key = process.env.API_KEY;
const { nftInfo } = require("../config");

const addLog = async (nftname) => {
  let log = jsonfile.readFileSync(__dirname + `/../data/common/log.json`);
  log.push({
    type: nftname,
    date: new Date().toDateString(),
  });
  jsonfile.writeFileSync(__dirname + `/../data/common/log.json`, log, {
    spaces: 2,
  });
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
        url: `https://api.opensea.io/v2/orders/ethereum/seaport/listings?asset_contract_address=${nftInfo.boredapeyc.contract_address}&limit=50&${token_ids}&order_by=created_date&order_direction=desc&cursor=${next}`,
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
  addLog("boredapeyc");
};

module.exports = {
  getListedNFTs,
};
