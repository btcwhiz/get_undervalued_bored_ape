require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { CronJob } = require("cron");

const { cronJobFunc } = require("./cronjob");
const { dbInfo } = require("./config");

const routes = require("./routes");
const app = express();

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("Sever is running!");
});

app.post("/posttest", (req, res) => {
  console.log(req.body);
  res.send(req.body);
});

routes(app);

mongoose
  .connect(dbInfo.url)
  .then((result) => {
    app.listen(port, () => {
      console.log(`Server is started at:${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

cronJobFunc();

const cronJob = new CronJob("0 0 */2 * * *", async () => {
  cronJobFunc();
});

if (!cronJob.running) {
  cronJob.start();
}
