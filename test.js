const axios = require("axios");
const jsonfile = require("jsonfile");
const https = require("https");
const fs = require("fs");
const path = require("path");

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const downloadImage = async (url, path) => {
  const writer = fs.createWriteStream(path);

  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
};

const getMetaDatas = async () => {
  let metadata = {};
  for (let i = 7000; i < 10000; i++) {
    let config = {
      method: "get",
      url: `https://ipfs.io/ipfs/QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/${i}`,
    };
    let res = {};
    while (1) {
      try {
        res = await axios(config);
        console.log(i);
      } catch (e) {
        console.log(e.data);
        await sleep(1000);
        continue;
      }
      break;
    }
    metadata["" + i] = res.data;
    const url_str_list = res.data.image.split("//");
    const url = `https://ipfs.io/ipfs/${url_str_list[1]}`;
    const file = `./meta_data/img/${i}.png`;
    while (true) {
      try {
        await downloadImage(url, file);
        break;
      } catch (e) {
        console.log(e);
        continue;
      }
    }
    await sleep(1000);
  }
  jsonfile.writeFile(
    "./meta_data/boredapeyc.json",
    metadata,
    { spaces: 2 },
    (err) => {
      if (err) {
        console.log(err);
      }
    }
  );
};

getMetaDatas();

const axios = require("axios");
const fs = require("fs");
const jsonfile = require("jsonfile");
const contract_address = process.env.CONTRACT_ADDRESS;
const collection_slug = process.env.COLLECTION_SLUG;
const api_key = process.env.API_KEY;

let traitFloorPrices = {};
let listedNFTS = [];

const initializeTraitFloorPrices = async () => {
  let config = {
    method: "get",
    url: `https://api.opensea.io/api/v1/collection/${collection_slug}`,
    headers: {
      "X-API-KEY": api_key,
    },
  };

  const res = await axios(config);
  const traits = res.data.collection.traits;
  const key_list = Object.keys(traits);

  for (let i = 0; i < key_list.length; i++) {
    let obj = {};
    let value_list = Object.keys(traits[key_list[i]]);
    for (let j = 0; j < value_list.length; j++) {
      obj[value_list[j].toString()] = 0;
    }
    traitFloorPrices[key_list[i].toString()] = obj;
  }
};

const getAllListedNFTS = async () => {
  listedNFTS = [];
  let cur = 0;

  while (cur < 10000) {
    let token_ids = "";
    for (let i = cur; i < cur + 20; i++) {
      token_ids += `token_ids=${i}&`;
    }
    let config = {
      method: "get",
      url: `https://api.opensea.io/v2/orders/ethereum/seaport/listings?asset_contract_address=${contract_address}&limit=50&${token_ids}&order_by=created_date&order_direction=desc`,
      headers: {
        "X-API-KEY": api_key,
      },
    };
    0;
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

  let cur_1 = 0;
  while (cur_1 < listedNFTS.length) {
    let token_ids = "";
    for (let j = cur_1; j < cur_1 + 20; j++) {
      if (j >= listedNFTS.length) {
        break;
      }
      token_ids += `token_ids=${listedNFTS[j].token_id}&`;
    }
    let config = {
      method: "get",
      url: `https://api.opensea.io/api/v1/assets?${token_ids}&asset_contract_address=${contract_address}&limit=20`,
      headers: {
        "X-API-KEY": api_key,
      },
    };
    let res = {};
    try {
      res = await axios(config);
      console.log(cur_1);
    } catch (e) {
      console.log(e.data);
      continue;
    }
    const assets = res.data.assets.reverse();
    for (let j = 0; j < assets.length; j++) {
      listedNFTS[cur_1 + j]["traits"] = assets[j].traits;
    }
    cur_1 += 20;
  }

  for (let i = 0; i < listedNFTS.length; i++) {
    for (let j = 0; j < listedNFTS[i].traits.length; j++) {
      let type = listedNFTS[i].traits[j].trait_type;
      let value = listedNFTS[i].traits[j].value.toLowerCase();
      if (
        traitFloorPrices[type][value] == 0 ||
        traitFloorPrices[type][value] > listedNFTS[i].price
      ) {
        traitFloorPrices[type][value] = listedNFTS[i].price;
      }
    }
  }

  for (let i = 0; i < listedNFTS.length; i++) {
    for (let j = 0; j < listedNFTS[i].traits.length; j++) {
      let type = listedNFTS[i].traits[j].trait_type;
      let value = listedNFTS[i].traits[j].value.toLowerCase();
      listedNFTS[i].traits[j].floorPrice = traitFloorPrices[type][value];
    }
  }
};

const getNFTs = async () => {
  await initializeTraitFloorPrices();
  await getAllListedNFTS();
  let underValuedNFTs = listedNFTS.filter((nft) => {
    for (let i = 0; i < nft.traits.length; i++) {
      if (nft.price < nft.traits[i].floorPrice) {
        return true;
      }
    }
  });
  jsonfile.writeFile("./test.json", listedNFTS, { spaces: 2 }, (err) => {
    if (err) {
      console.log(err);
    }
  });
  jsonfile.writeFile("./test2.json", underValuedNFTs, { spaces: 2 }, (err) => {
    if (err) {
      console.log(err);
    }
  });
  jsonfile.writeFile("./test3.json", traitFloorPrices, { spaces: 2 }, (err) => {
    if (err) {
      console.log(err);
    }
  });
};
getNFTs();
