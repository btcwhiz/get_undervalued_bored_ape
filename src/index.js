require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { getListedNFTs } = require("./utils/boredapeyc");

const cron = require("node-cron");
cron.schedule("0 0 * * * *", getListedNFTs);

const routes = require("./routes");
const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET"],
  })
);

const port = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("Sever is running!");
});

routes(app);
app.listen(port, () => {
  console.log(`Server is started at:${port}`);
});
