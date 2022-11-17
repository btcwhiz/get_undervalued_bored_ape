const express = require("express");

const listednfts = require("./listednfts.route");

module.exports = (app) => {
  const router = express.Router();

  router.use("/listednfts", listednfts);

  router.get("/test", (req, res) => {
    res.status(200).send({
      status: "success",
      msg: "Welcome",
    });
  });

  app.use(router);
};
