const nftInfo = {
  boredapeyc: {
    contract_address: "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
    collection_slug: "boredapeyachtclub",
    type: "boredapeyc",
  },
  cryptopunks: {
    contract_address: "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb",
    collection_slug: "cryptopunks",
    type: "cryptopunks",
  },
};

const dbInfo = {
  url: "mongodb://127.0.0.1:27017/nftanalyst",
};

const paymentToken = [
  {
    symbol: "ETH",
    id: 279,
  },
  {
    symbol: "WETH",
    id: 2518,
  },
  {
    symbol: "USDC",
    id: 6319,
  },
  {
    symbol: "APE",
    id: 24383,
  },
  {
    symbol: "DAI",
    id: 9956,
  },
];

const paymentTokenPricePeriod = [
  "24_hours",
  "7_days",
  "14_days",
  "30_days",
  "90_days",
  "365_days",
  "max",
];

module.exports = {
  nftInfo,
  dbInfo,
  paymentToken,
  paymentTokenPricePeriod,
};
