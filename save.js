const jsonfile = require("jsonfile");
const traits = jsonfile.readFileSync("./traits.json");
const FloorPrice = require("./src/models/floorprice.model");
const tokens = jsonfile.readFileSync("./boredapeyc1.json");
const Token = require("./src/models/token.model");
const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const saveTokenData = async () => {
  let tokens = await jsonfile.readFileSync(`boredapeyc1.json`);
  for (let i = 0; i < 10000; i++) {
    let order = [];
    if (tokens[i].price.opensea.price) {
      let token_price = 1150;
      if (tokens[i].price.opensea.payment_token_price) {
        token_price = tokens[i].price.opensea.payment_token_price;
      }
      order.push({
        price:
          tokens[i].price.opensea.payment_token == "USDC"
            ? tokens[i].price.opensea.price * 10 ** 12
            : tokens[i].price.opensea.price,
        marketplace: "opensea",
        created_date: new Date(tokens[i].price.opensea.created_date),
        payment_token: tokens[i].price.opensea.payment_token,
        payment_token_price: token_price,
      });
    }
    if (tokens[i].price.looksrare.price) {
      let token_price = 1150;
      if (tokens[i].price.looksrare.payment_token_price) {
        token_price = tokens[i].price.looksrare.payment_token_price;
      }
      order.push({
        price:
          tokens[i].price.looksrare.payment_token == "USDC"
            ? tokens[i].price.looksrare.price * 10 ** 12
            : tokens[i].price.looksrare.price,
        marketplace: "looksrare",
        created_date: new Date(tokens[i].price.looksrare.created_date),
        payment_token: tokens[i].price.looksrare.payment_token,
        payment_token_price: token_price,
      });
    }

    let sale_history = [];
    for (let j = 0; j < tokens[i].salesHistory.length; j++) {
      let token_price = 1150;
      if (tokens[i].salesHistory[j].token_price) {
        token_price = tokens[i].salesHistory[j].token_price;
      }
      sale_history.push({
        price:
          tokens[i].salesHistory[j].token_type == "USDC"
            ? tokens[i].salesHistory[j].price * 10 ** 12
            : tokens[i].salesHistory[j].price,
        created_date: new Date(tokens[i].salesHistory[j].date),
        marketplace: tokens[i].salesHistory[j].marketplace,
        payment_token: tokens[i].salesHistory[j].token_type,
        payment_token_price: token_price,
      });
    }
    let _newtoken = new Token({
      collection_name: "boredapeyc",
      token_id: i.toString(),
      order: order,
      sale_history: sale_history,
    });
    console.log(i);
    await _newtoken.save();
  }
};

const savedata = async () => {
  for (trait in traits) {
    let trait_list = traits[trait];
    for (item in trait_list) {
      let newFloorprice = new FloorPrice({
        trait_type: trait,
        trait_value: item,
        trait_count: trait_list[item],
        floor_price: 0,
      });
      try {
        await newFloorprice.save();
      } catch (e) {
        console.log(e);
        break;
      }
      sleep(500);
      console.log(newFloorprice);
    }
  }
};

const saveFloorPrice = async () => {
  let traits = await jsonfile.readFileSync(`traits.json`);
  for (trait in traits) {
    let trait_list = traits[trait];
    for (item in trait_list) {
      let _floor = new FloorPrice({
        collection_name: "boredapeyc",
        trait_type: trait,
        trait_value: item,
        trait_count: trait_list[item],
        floor_price: 0,
        marketplace: "opensea",
        payment_token: "ETH",
        payment_token_price: 1150,
      });
      await _floor.save();
    }
  }
};

const calcFloorPrice = async () => {
  const tokenList = await Token.find({
    collection_name: "boredapeyc",
    "order.0": { $exists: true },
  });

  for (let i = 0; i < tokenList.length; i++) {
    let token = tokenList[i];
    let price = 0,
      marketplace = "opensea",
      payment_token = "ETH",
      payment_token_price = 1150;
    if (token.order.length == 1) {
      price = token.order[0].price;
      marketplace = token.order[0].marketplace;
      payment_token = token.order[0].payment_token;
      payment_token_price = token.order[0].payment_token_price;
    } else {
      if (
        token.order[0].price * token.order[0].payment_token_price <
        token.order[1].price * token.order[1].payment_token_price
      ) {
        price = token.order[0].price;
        marketplace = token.order[0].marketplace;
        payment_token = token.order[0].payment_token;
        payment_token_price = token.order[0].payment_token_price;
      } else {
        price = token.order[1].price;
        marketplace = token.order[1].marketplace;
        payment_token = token.order[1].payment_token;
        payment_token_price = token.order[1].payment_token_price;
      }
    }

    let metadata = await Metadata.findOne({ token_id: token.token_id });
    let traits = metadata.traits;
    for (let j = 0; j < traits.length; j++) {
      let floorPrice = await FloorPrice.findOne({
        trait_type: traits[j].trait_type,
        trait_value: traits[j].trait_value.toLowerCase(),
      });
      if (
        floorPrice.floor_price == 0 ||
        floorPrice.floor_price * floorPrice.payment_token >
          price * payment_token_price
      ) {
        floorPrice.floor_price = price;
        floorPrice.marketplace = marketplace;
        floorPrice.payment_token = payment_token;
        floorPrice.payment_token_price = payment_token_price;
        await floorPrice.save();
      }
    }
  }
};
saveTokenData();
