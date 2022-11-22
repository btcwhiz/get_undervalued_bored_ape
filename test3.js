const jsonfile = require("jsonfile");

let data = [];

const getBalance = async () => {
  const listedTokens = jsonfile.readFileSync(`test.json`);
  console.log(listedTokens);
};

for (let i = 0; i < 10000; i++) {
  data.push({
    token_id: i,
    price: {
      opensea: {},
      looksrare: {},
    },
    salesHistory: [],
  });
}

jsonfile.writeFile(`./test.json`, data, { spaces: 2 }, (err) => {
  if (err) {
    console.log(err);
  }
});

// getBalance();
