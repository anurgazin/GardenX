var mongoose = require("mongoose");
var Schema = mongoose.Schema;
mongoose.Promise = require("bluebird");

var plantsListScheme = new Schema({
  plants: [
    {
      title: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        required: true,
      },
    },
  ],
  user: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("plantsList", plantsListScheme);
