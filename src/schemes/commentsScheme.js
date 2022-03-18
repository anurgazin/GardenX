var mongoose = require("mongoose");
var Schema = mongoose.Schema;
mongoose.Promise = require("bluebird");

var commentScheme = new Schema({
  text: {
    type: String,
    required: true
  },
  author:{
    type: String,
    required: true
  },
  thread:{
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
});

module.exports = mongoose.model("comments", commentScheme, "Comments");