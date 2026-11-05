const { Timestamp } = require("mongodb");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const dueDate = new Schema();

const taskSchema = new Schema({
  name: { type: String, required: true },
  createdAt: Date,
  completed: Boolean,
  description: String,
  dueDate: {
    dueDay: { type: String },
    dueHour: { type: String },
  },
  tags: Array,
  priority: String,
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Task", taskSchema);

// const mongoDb = require("mongodb");
// const getDb = require("../util/database").getDb;

// class Task {
//   constructor(id, name, dueDate, tags, priority) {
//     this._id = id ? new mongoDb.ObjectId(id) : null;
//     this.name = name;
//     this.createdAt = new Date();
//     this.completed = false;
//     this.dueDate = dueDate;
//     this.tags = tags;
//     this.priority = priority;
//   }

//   save() {
//     const db = getDb();
//     let dbOp;

//     if (this._id) {
//       // update the task
//       dbOp = db.collection("tasks").updateOne(
//         { _id: this._id },
//         {
//           $set: {
//             name: this.name,
//             dueDate: this.dueDate,
//             tags: this.tags,
//             priority: this.priority,
//           },
//         },
//       );
//     } else {
//       // insert the task
//       dbOp = db.collection("tasks").insertOne(this);
//     }

//     return dbOp.then((result) => {}).catch((err) => console.log(err));
//   }

//   static getAllTasks() {
//     const db = getDb();
//     return db
//       .collection("tasks")
//       .find()
//       .toArray()
//       .then((tasks) => {
//         return tasks;
//       })
//       .catch((err) => console.log(err));
//   }

//   static getTaskById(taskId) {
//     const db = getDb();
//     return db
//       .collection("tasks")
//       .find({ _id: new mongoDb.ObjectId(taskId) })
//       .next()
//       .then((product) => {
//         return product;
//       })
//       .catch((err) => console.log(err));
//   }

//   static deleteById(taskId) {
//     const db = getDb();
//     return db
//       .collection("tasks")
//       .deleteOne({ _id: new mongoDb.ObjectId(taskId) })
//       .then(() => {
//         console.log("Deleted!");
//       })
//       .catch((err) => console.log(err));
//   }

//   static markCompleted(taskId) {
//     const db = getDb();
//     return db
//       .collection("tasks")
//       .updateOne(
//         { _id: new mongoDb.ObjectId(taskId) },
//         { $set: { completed: true } },
//       );
//   }

//   static getTasksCurrentWeek(start, end) {
//     const db = getDb();
//     return db
//       .collection("tasks")
//       .find({
//         dueDate: {
//           $gte: start,
//           $lte: end,
//         },
//       })
//       .toArray()
//       .then((tasks) => {
//         return tasks;
//       })
//       .catch((err) => console.log(err));
//   }

//   // get all high priority incomplete tasks
//   static getHighIncomplete() {
//     const db = getDb();
//     return db
//       .collection("tasks")
//       .find({ completed: false, priority: "high" })
//       .toArray()
//       .then((tasks) => tasks)
//       .catch((err) => console.log(err));
//   }

//   // get all tasks which contain a given tag
//   static searchByTag(tag) {
//     const db = getDb();
//     return db
//       .collection("tasks")
//       .find({ tags: tag })
//       .toArray()
//       .then((tags) => {
//         return tags;
//       })
//       .catch((err) => console.log(err));
//   }
// }

// module.exports = Task;
