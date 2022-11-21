const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const marketplaceSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Marketplace", marketplaceSchema);
