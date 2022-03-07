var mongoose = require("mongoose");
var Schema = mongoose.Schema;
mongoose.Promise = require("bluebird");

var plantsListScheme = new Schema({
  plants: [{
    type: String,
  }],
  user: {
    type: String,
    required: true,
  }
});

module.exports = mongoose.model("plantsList", plantsListScheme);
