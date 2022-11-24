const jsonfile = require("jsonfile");
const Token = require("../models/token.model");

const saveData = () => {
  const listedTokens = jsonfile.readFileSync(
    __dirname + `/../data/tokens/boredapeyc.json`
  );

  listedTokens.forEach((token) => {
    let order = [];
    if (Object.keys(token.price.opensea).indexOf("price") > -1) {
      order.push({
        price: token.price.opensea.price,
        marketplace: "boredapeyc",
        created_date: new Date(token.price.opensea.created_date),
        payment_token: token.price.opensea.payment_token,
        payment_token_price: token.price.opensea.payment_token_price,
      });
    }
    if (Object.keys(token.price.looksrare).indexOf("price") > -1) {
      order.push({
        price: token.price.looksrare.price,
        marketplace: "boredapeyc",
        created_date: new Date(token.price.looksrare.created_date),
        payment_token: token.price.looksrare.payment_token,
        payment_token_price: token.price.looksrare.payment_token_price,
      });
    }
    let sale_history = [];

    token.salesHistory.forEach((history) => {
      sale_history.push({
        price: history.price,
        created_date: new Date(history.date),
        marketplace: history.marketplace,
        payment_token: history.token_type,
        payment_token_price: history.token_price,
      });
    });
    let newToken = new Token({
      collection_name: "boredapeyc",
      token_id: token.token_id,
      order: order,
      sale_history: sale_history,
    });
    newToken.save().then((token) => {
      console.log(token.sale_history, token.order);
    });
  });
};

module.exports = {
  saveData,
};
