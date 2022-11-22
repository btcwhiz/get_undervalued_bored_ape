const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const tokenSchema = new Schema({
  collection_id: {
    type: String,
    required: true,
  },
  token_id: {
    type: String,
    required: true,
  },
  order: [
    {
      price: {
        type: Number,
      },
      created_date: {
        type: Number,
      },
      marketplace: {
        type: String,
      },
      payment_token: {
        type: String,
      },
      payment_token_price: {
        type: Number,
      },
    },
  ],
  sale_history: [
    {
      price: {
        type: Number,
      },
      created_date: {
        type: Number,
      },
      marketplace: {
        type: String,
      },
      payment_token: {
        type: String,
      },
      payment_token_price: {
        type: Number,
      },
    },
  ],
});

module.exports = mongoose.model("token", tokenSchema);
