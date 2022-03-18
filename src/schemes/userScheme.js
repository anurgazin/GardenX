var mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
var Schema = mongoose.Schema;
mongoose.Promise = require("bluebird");

var userScheme = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Email is invalid");
      }
    },
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});
 userScheme.pre("save", async function (next) {
   if (this.isModified("password")) {
     this.password = await bcrypt.hash(this.password, 10);
   }
   next();
 });
userScheme.statics.findByCredentials = async (email, password) => {
  const user = await mongoose.model("users", userScheme).findOne({ email });
  if (!user) {
    throw new Error("Unable to login");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Unable to login");
  }
  return user;
};
userScheme.statics.findByEmail = async (email)=> {
  const user = await mongoose.model("users", userScheme).findOne({ email });
  if (!user) {
    throw new Error("User is not exist");
  }
  return user;
}
userScheme.statics.findById = async (_id)=> {
  const user = await mongoose.model("users", userScheme).findOne({ _id });
  if (!user) {
    console.log("Error in FindById")
    throw new Error("User is not exist");
  }
  return user;
}
module.exports = mongoose.model("users", userScheme, "Users");