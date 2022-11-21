const express = require("express");

const listednfts = require("./listednfts.route");
const log = require("./log.route");
const marketplace = require("./marketplace.route");
const collection = require("./collection.route");
const token = require("./token.route");

module.exports = (app) => {
  const router = express.Router();

  router.use("/listednfts", listednfts);
  router.use("/log", log);
  router.use("/marketplace", marketplace);
  router.use("/collection", collection);
  router.use("/token", token);
  router.get("/test", (req, res) => {
    res.status(200).send({
      status: "success",
      msg: "Welcome",
    });
  });

  router.post("/test", (req, res) => {
    res.status(200).json({
      status: "success",
      msg: req.body,
    });
  });

  app.use(router);
};
