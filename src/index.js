require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { getListedNFTs } = require("./utils/boredapeyc");
const { CronJob } = require("cron");

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

const cronJob = new CronJob("0 0 */1 * * *", async () => {
  getListedNFTs();
});

if (!cronJob.running) {
  cronJob.start();
}
getListedNFTs();
