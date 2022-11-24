const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const metadataSchema = new Schema({
  token_id: {
    type: String,
    required: true,
  },
  traits: [
    {
      trait_type: {
        type: String,
        required: true,
      },
      trait_value: {
        type: String,
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model("Metadata", metadataSchema);
