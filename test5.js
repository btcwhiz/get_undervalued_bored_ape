const jsonfile = require("jsonfile");
const listedTokenTemp = jsonfile.readFileSync("./boredapeyc.json");
const axios = require("axios");
const HttpsProxyAgent = require("https-proxy-agent");
const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};
const getBalance = async () => {
  let cur = 0;
  while (cur < 4) {
    cur++;
    let config = {
      method: "get",
      url: `https://api.opensea.io/v2/orders/ethereum/seaport/listings?asset_contract_address=0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d&limit=50&token_ids=5&order_by=created_date&order_direction=desc&cursor=`,
      headers: {
        "X-API-KEY": "72068b022909446e830208fa410442b3",
      },
    };
    let res = {};
    try {
      res = axios(config);
      console.log("Success");
    } catch (e) {
      // console.log(e);
      console.log("Failed");
      // await sleep(1500);
      continue;
    }
  }
};

getBalance();
