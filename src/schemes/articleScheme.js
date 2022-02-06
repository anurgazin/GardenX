var mongoose = require("mongoose");
var Schema = mongoose.Schema;
mongoose.Promise = require("bluebird");

var articleSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  author:{
    type: String,
    required: true
  },
  fileName: {
    default: '',
    type: String,
  },
});

module.exports = mongoose.model("articles", articleSchema, "Articles");