var mongoose = require("mongoose");
var Schema = mongoose.Schema;
mongoose.Promise = require("bluebird");

var plantScheme = new Schema({
  name: {
    type: String,
    required: true,
  },
  tips: {
    type: String,
    required: true,
  },
  schedule: {
    type: String,
    required: true,
  },
  photo:{
    default: '',
    type: String,
  }
});

module.exports = mongoose.model("plants", plantScheme, "Plants");
