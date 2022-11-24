const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const floorPriceSchema = new Schema({
  collection_name: {
    type: String,
    required: true,
  },
  trait_type: {
    type: String,
    require: true,
  },
  trait_value: {
    type: String,
    require: true,
  },
  trait_count: {
    type: Number,
    require: true,
  },
  floor_price: {
    type: Number,
    require: true,
  },
  marketplace: {
    type: String,
    require: true,
  },
  payment_token: {
    type: String,
    require: true,
  },
  payment_token_price: {
    type: Number,
    require: true,
  },
});

module.exports = mongoose.model("FloorPrice", floorPriceSchema);
