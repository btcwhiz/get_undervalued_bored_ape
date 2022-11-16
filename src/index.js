require("dotenv").config();

const express = require("express");

const { getListedNFTs, getListedNFTs1 } = require("./utils/boredapeyc");

const cron = require("node-cron");

cron.schedule("0 * * * * *", getListedNFTs1);

const routes = require("./routes");

const app = express();

const port = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("Sever is running!");
});

routes(app);

app.listen(port, () => {
  console.log(`Server is started at:${port}`);
});
