const express = require("express");

const boredapeyc = require("./boredapeyc");

module.exports = (app) => {
  const router = express.Router();

  router.use("/boredapeyc", boredapeyc);

  router.get("/test", (req, res) => {
    res.status(200).send({
      status: "success",
      msg: "Welcome",
    });
  });

  app.use(router);
};
