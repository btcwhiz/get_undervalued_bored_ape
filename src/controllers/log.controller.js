const jsonfile = require("jsonfile");

const getLogs = (req, res) => {
  const log = jsonfile.readFileSync(__dirname + `/../data/common/log.json`);
  res.status(200).json({
    status: true,
    data: log,
  });
};
module.exports = {
  getLogs,
};
