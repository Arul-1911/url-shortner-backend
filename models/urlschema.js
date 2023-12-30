const mongoose = require("mongoose");
const UrlSchema =new mongoose.Schema({
  longUrl: {
    type: String,
    required: true
  },
  shortUrl: {
    type: String,
    unique:true
  },
  clickCount: {
    type: Number,
    default : 0
  },
});
const UrlModel = mongoose.model("urlschema", UrlSchema);
module.exports = {UrlModel};
