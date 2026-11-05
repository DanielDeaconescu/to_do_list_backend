const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExpiration: Date,
  tasks: {
    items: [
      {
        taskId: {
          type: Schema.Types.ObjectId,
          ref: "Task",
          required: true,
        },
      },
    ],
  },
});

module.exports = mongoose.model("User", userSchema);
