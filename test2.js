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
    }
    paymentTokenPriceHistory[paymentToken[i].symbol] = temp;
  }

  const listedTokens = jsonfile.readFileSync(`./test.json`);

  /// OpenSea
  let listedNFTS = [];
  let cur = 0;
  while (cur < 100) {
    let token_ids = "";
    for (let i = cur; i < cur + 20; i++) {
      token_ids += `token_ids=${i}&`;
    }
    let next = "";
    do {
      let config = {
        method: "get",
        url: `https://api.opensea.io/v2/orders/ethereum/seaport/listings?asset_contract_address=${contract_address}&limit=50&${token_ids}&order_by=created_date&order_direction=desc&cursor=${next}`,
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
        await sleep(2000);
        continue;
      }
      const orders = res.data.orders;
      for (let i = 0; i < orders.length; i++) {
        let obj = {
          token_id: orders[i].maker_asset_bundle.assets[0].token_id,
          price:
            orders[i].current_price /
            10 ** orders[i].taker_asset_bundle.assets[0].decimals,
          created_date: orders[i].created_date,
          payment_token:
            orders[i].taker_asset_bundle.assets[0].asset_contract.symbol,
        };
        listedNFTS.push(obj);
      }
      next = res.data.next;
      await sleep(500);
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

  cur = 0;
  for (let i = 0; i < 100; i++) {
    // let next = "";
    // let events = [];
    // while (true) {
    //   let config = {
    //     method: "get",
    //     url: `https://api.opensea.io/api/v1/events?asset_contract_address=${contract_address}&limit=50&token_id=${i.toString()}&event_type=successful&cursor=${next}`,
    //     headers: {
    //       "X-API-KEY": api_key,
    //     },
    //   };
    //   let res = {};
    //   try {
    //     res = await axios(config);
    //   } catch (e) {
    //     console.log(e);
    //     await sleep(2000);
    //     continue;
    //   }
    //   const asset_events = res.data.asset_events;
    //   asset_events.forEach((event) => {
    //     let token_price = getTokenPrice(
    //       paymentTokenPriceHistory[event.payment_token.symbol],
    //       new Date(event.created_date).getTime()
    //     );
    //     events.push({
    //       date: event.created_date,
    //       marketplace: "opensea",
    //       price: event.total_price / 10 ** 18,
    //       token_type: event.payment_token.symbol,
    //       token_price: token_price,
    //     });
    //   });
    //   if (res.data.next == null) {
    //     break;
    //   }
    //   next = res.data.next;
    //   await sleep(500);
    // }
    // listedTokens[i].salesHistory = listedTokens[i].salesHistory.filter(
    //   (history) => {
    //     return history.marketplace != "opensea";
    //   }
    // );
    // events.forEach((event) => {
    //   listedTokens[i].salesHistory.push(event);
    // });

    if (cur >= listedNFTS.length) {
      listedTokens[i].price.opensea = {};
      continue;
    }
    if (i.toString() == listedNFTS[cur].token_id) {
      if (
        listedTokens[i].price.opensea == {} ||
        listedTokens[i].price.looksrare.created_date !=
          listedNFTS[cur].created_date
      ) {
        const paymentTokenPrice = getTokenPrice(
          paymentTokenPriceHistory[listedNFTS[cur].payment_token],
          new Date(listedNFTS[cur].created_date).getTime()
        );
        console.log(i, paymentTokenPrice);
        listedTokens[i].price.opensea = {
          price: listedNFTS[cur].price,
          created_date: listedNFTS[cur].created_date,
          payment_token: listedNFTS[cur].payment_token,
          payment_token_price: paymentTokenPrice,
        };
      }
      cur++;
    } else {
      listedTokens[i].price.opensea = {};
    }
  }

  // /// LooksRare
  // listedNFTS = [];
  // cursor = "";
  // while (true) {
  //   let orderList = [];
  //   while (true) {
  //     try {
  //       const res = await axios({
  //         method: "GET",
  //         url: `https://api.looksrare.org/api/v1/orders?isOrderAsk=true&collection=${contract_address}&status[]=VALID&pagination[first]=150&pagination[cursor]=${cursor}`,
  //       });
  //       orderList = res.data.data;
  //       break;
  //     } catch (e) {
  //       console.log(e);
  //       await sleep(2000);
  //       continue;
  //     }
  //   }
  //   if (orderList.length == 0) {
  //     break;
  //   }
  //   orderList.forEach((order) => {
  //     listedNFTS.push({
  //       token_id: order.tokenId,
  //       price: order.price / 10 ** 18,
  //       created_date: new Date(order.startTime * 1000),
  //       payment_token: "WETH",
  //     });
  //   });
  //   cursor = orderList[orderList.length - 1].hash;
  //   await sleep(250);
  // }

  // listedNFTS.sort((p1, p2) =>
  //   p1.created_date < p2.created_date
  //     ? 1
  //     : p1.created_date > p2.created_date
  //     ? -1
  //     : 0
  // );

  // listedNFTS.sort((p1, p2) =>
  //   Number(p1.token_id) > Number(p2.token_id)
  //     ? 1
  //     : Number(p1.token_id) < Number(p2.token_id)
  //     ? -1
  //     : 0
  // );

  // index = 1;
  // while (index < listedNFTS.length) {
  //   if (listedNFTS[index].token_id == listedNFTS[index - 1].token_id) {
  //     listedNFTS.splice(index, 1);
  //     continue;
  //   }
  //   index++;
  // }

  // cur = 0;
  // for (let i = 0; i < 10000; i++) {
  //   if (cur >= listedNFTS.length) {
  //     listedTokens[i].price.looksrare = {};
  //     continue;
  //   }
  //   if (i.toString() == listedNFTS[cur].token_id) {
  //     console.log(listedTokens[i].price.looksrare.created_date);
  //     if (
  //       listedTokens[i].price.looksrare == {} ||
  //       listedTokens[i].price.looksrare.created_date !=
  //         listedNFTS[cur].created_date
  //     ) {
  //       console.log(i);
  //       const paymentTokenPrice = getTokenPrice(
  //         paymentTokenPriceHistory[listedNFTS[cur].payment_token],
  //         new Date(listedNFTS[cur].created_date).getTime()
  //       );

  //       listedTokens[i].price.looksrare = {
  //         price: listedNFTS[cur].price,
  //         created_date: listedNFTS[cur].created_date,
  //         payment_token: listedNFTS[cur].payment_token,
  //         payment_token_price: paymentTokenPrice,
  //       };
  //     }
  //     cur++;
  //   } else {
  //     listedTokens[i].price.looksrare = {};
  //   }
  // }

  // let sale_events = [];
  // cursor = "";
  // while (true) {
  //   let events = [];
  //   while (true) {
  //     try {
  //       const res = await axios({
  //         method: "GET",
  //         url: `https://api.looksrare.org/api/v1/events?collection=${contract_address}&type=SALE&pagination[first]=150&pagination[cursor]=${cursor}`,
  //       });
  //       events = res.data.data;
  //       break;
  //     } catch (error) {
  //       console.log(error);
  //       await sleep(500);
  //       continue;
  //     }
  //   }
  //   if (events.length == 0) {
  //     break;
  //   }
  //   events.forEach((event) => {
  //     sale_events.push({
  //       token_id: event.token.tokenId,
  //       price: event.order.price / 10 ** 18,
  //       date: new Date(event.createdAt),
  //       payment_token: "WETH",
  //     });
  //   });
  //   cursor = events[events.length - 1].id;
  //   console.log(events.length, cursor);
  //   await sleep(250);
  // }

  // sale_events.sort((p1, p2) =>
  //   p1.date < p2.date ? 1 : p1.date > p2.date ? -1 : 0
  // );

  // sale_events.sort((p1, p2) =>
  //   Number(p1.token_id) > Number(p2.token_id)
  //     ? 1
  //     : Number(p1.token_id) < Number(p2.token_id)
  //     ? -1
  //     : 0
  // );

  // jsonfile.writeFile(
  //   __dirname + `/test2.json`,
  //   sale_events,
  //   { spaces: 2 },
  //   (err) => {
  //     if (err) {
  //       console.log(err);
  //     }
  //   }
  // );

  // cur = 0;
  // for (let i = 0; i < 10000; i++) {
  //   listedTokens[i].salesHistory = listedTokens[i].salesHistory.filter(
  //     (event) => {
  //       return event.marketplace == "opensea";
  //     }
  //   );
  //   while (sale_events[cur] && i.toString() == sale_events[cur].token_id) {
  //     console.log(sale_events[cur].token_id);
  //     const token_price = getTokenPrice(
  //       paymentTokenPriceHistory["WETH"],
  //       new Date(sale_events[cur].date).getTime()
  //     );
  //     listedTokens[i].salesHistory.push({
  //       price: sale_events[cur].price,
  //       marketplace: "looksrare",
  //       date: sale_events[cur].date,
  //       token_type: "WETH",
  //       token_price: token_price,
  //     });
  //     cur++;
  //   }
  // }

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
