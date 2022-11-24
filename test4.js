const axios = require("axios");
const opensea_api_key = process.env.OPENSEA_API_KEY;
const looksrare_api_key = process.env.LOOKSRARE_API_KEY;
const {
  nftInfo,
  paymentToken,
  paymentTokenPricePeriod,
} = require("./src/config");

const jsonfile = require("jsonfile");

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const getPaymentTokenPrice = async (symbol, period) => {
  let history = [];
  while (true) {
    try {
      const res = await axios({
        method: "get",
        url: `https://www.coingecko.com/price_charts/${symbol}/usd/${period}.json`,
      });
      history = res.data.stats;
      break;
    } catch (e) {
      console.log(e);
      await sleep(2000);
      continue;
    }
  }
  return history;
};

const getTokenPrice = (priceHistory, timestamp) => {
  let diff = new Date().getTime() - timestamp;
  let priceHistoryTemp = [];
  if (diff < 86400 * 1000) {
    priceHistoryTemp = priceHistory["24_hours"];
  } else if (diff > 86400 * 1000 && diff < 7 * 86400 * 1000) {
    priceHistoryTemp = priceHistory["7_days"];
  } else if (diff > 7 * 86400 * 1000 && diff < 14 * 86400 * 1000) {
    priceHistoryTemp = priceHistory["14_days"];
  } else if (diff > 14 * 86400 * 1000 && diff < 30 * 86400 * 1000) {
    priceHistoryTemp = priceHistory["30_days"];
  } else if (diff > 30 * 86400 * 1000 && diff < 90 * 86400 * 1000) {
    priceHistoryTemp = priceHistory["90_days"];
  } else if (diff > 90 * 86400 * 1000 && diff < 365 * 86400 * 1000) {
    priceHistoryTemp = priceHistory["365_days"];
  } else if (diff > 365 * 86400 * 1000) {
    priceHistoryTemp = priceHistory["max"];
  }
  for (let i = priceHistoryTemp.length - 1; i > 0; i--) {
    if (
      timestamp <= priceHistoryTemp[i][0] &&
      timestamp >= priceHistoryTemp[i - 1][0]
    ) {
      return priceHistoryTemp[i - 1][1];
    }
  }
};

const getListedTokens = async (api_key, contract_address, nfttype) => {
  let paymentTokenPriceHistory = {};

  for (let i = 0; i < paymentToken.length; i++) {
    let temp = {};
    for (let j = 0; j < paymentTokenPricePeriod.length; j++) {
      let res = await getPaymentTokenPrice(
        paymentToken[i].id,
        paymentTokenPricePeriod[j]
      );
      temp[paymentTokenPricePeriod[j]] = res;
      console.log(i, j);
    }
    paymentTokenPriceHistory[paymentToken[i].symbol] = temp;
  }

  const listedTokens = jsonfile.readFileSync(`./test.json`);

  for (let i = 7000; i < 10000; i++) {
    let next = "";
    let events = [];
    while (true) {
      let config = {
        method: "get",
        url: `https://api.opensea.io/api/v1/events?asset_contract_address=${contract_address}&limit=50&token_id=${i.toString()}&event_type=successful&cursor=${next}`,
        headers: {
          "X-API-KEY": api_key,
        },
      };
      let res = {};
      try {
        res = await axios(config);
        console.log(i);
      } catch (e) {
        console.log(e);
        await sleep(3000);
        continue;
      }
      await sleep(500);
      const asset_events = res.data.asset_events;
      asset_events.forEach((event) => {
        let token_price = getTokenPrice(
          paymentTokenPriceHistory[event.payment_token.symbol],
          new Date(event.created_date).getTime()
        );
        events.push({
          date: event.created_date,
          marketplace: "opensea",
          price: event.total_price / 10 ** 18,
          token_type: event.payment_token.symbol,
          token_price: token_price,
        });
      });
      if (res.data.next == null) {
        break;
      }
      next = res.data.next;
    }
    listedTokens[i].salesHistory = listedTokens[i].salesHistory.filter(
      (history) => {
        return history.marketplace != "opensea";
      }
    );
    events.forEach((event) => {
      listedTokens[i].salesHistory.push(event);
    });
  }

  jsonfile.writeFile(
    __dirname + `/test.json`,
    listedTokens,
    { spaces: 2 },
    (err) => {
      if (err) {
        console.log(err);
      }
    }
  );
};

getListedTokens(
  "72068b022909446e830208fa410442b3",
  "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
  "boredapeyc"
);
