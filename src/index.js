const express = require("express");

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
