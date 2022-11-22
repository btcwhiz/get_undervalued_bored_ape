const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const logSchema = new Schema({
  timestamp: {
    type: Date,
    required: True,
  },
});

module.exports = mongoose.model("Log", logSchema);
