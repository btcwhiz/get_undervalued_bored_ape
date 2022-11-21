const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const collectionSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
  },
  contract_address: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Collection", collectionSchema);
