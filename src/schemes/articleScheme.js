var mongoose = require("mongoose");
var Schema = mongoose.Schema;
mongoose.Promise = require("bluebird");

var articleScheme = new Schema({
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
  date:{
    type: String,
    required: true
  },
  votes: {
      type: Number,
      default: 0
  },
  fileName: {
    default: '',
    type: String,
  },
});

module.exports = mongoose.model("articles", articleScheme, "Articles");