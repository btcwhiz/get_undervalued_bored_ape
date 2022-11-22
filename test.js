const { paymentToken, paymentTokenPricePeriod } = require("./src/config");
const jsonfile = require("jsonfile");
const axios = require("axios");

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
      sleep(500);
      break;
    }
  }
  return history;
};

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const getBalance = async () => {
  let paymentTokenPriceHistory = {};

  for (let i = 0; i < paymentToken.length; i++) {
    let temp = {};
    for (let j = 0; j < paymentTokenPricePeriod.length; j++) {
      console.log(i, j);
      let res = await getPaymentTokenPrice(
        paymentToken[i].id,
        paymentTokenPricePeriod[j]
      );
      temp[paymentTokenPricePeriod[j]] = res;
    }
    paymentTokenPriceHistory[paymentToken[i].symbol] = temp;
  }

  jsonfile.writeFile(
    `test.json`,
    paymentTokenPriceHistory,
    { spaces: 2 },
    (err) => {
      if (err) {
        console.log(err);
      }
    }
  );
};

getBalance();
