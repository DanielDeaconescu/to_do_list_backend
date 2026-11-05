const crypto = require("crypto");

const Task = require("../models/task");
const formatMongoDate = require("../util/formatDate");
const calculateDateRage = require("../util/calculateDateRange");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const { Resend } = require("resend");
const { validationResult } = require("express-validator");
const user = require("../models/user");
// const io = require("../socket");

const resend = new Resend(process.env.RESEND_KEY);

const TASKS_PER_PAGE = 2;

exports.postAddTask = (req, res, next) => {
  const name = req.body.name;
  const dueDate = req.body.dueDate;
  const tags = req.body.tags;
  const priority = req.body.priority;
  const description = req.body.description;

  const task = new Task({
    name: name,
    description: description,
    createdAt: Date.now(),
    completed: false,
    dueDate: dueDate,
    tags: tags,
    priority: priority,
    userId: req.user._id,
  });

  // io.getIO().emit("tasks", { action: "create", task: task });

  // TO DO: update tasks.items array for each user

  task
    .save()
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      if (!err.status) {
        err.status = 500;
      }
      next(err);
    });
};

exports.getTasks = async (req, res, next) => {
  try {
    const filter = { userId: req.user._id };

    const totalTasks = await Task.countDocuments(filter);
    const lastPage = Math.max(Math.ceil(totalTasks / TASKS_PER_PAGE), 1);
    const requested = parseInt(req.query.page, 10) || 1;

    const currentPage = Math.min(Math.max(requested, 1), lastPage);

    const tasks = await Task.find()
      .skip((currentPage - 1) * TASKS_PER_PAGE)
      .limit(TASKS_PER_PAGE);

    res.json({ totalTasks, lastPage, currentPage, tasks });
  } catch (error) {
    next(error);
  }
};

exports.getEditTask = (req, res, next) => {
  const taskId = req.params.taskId;

  Task.find({ _id: taskId })
    .then((task) => {
      return res.json(task[0]);
    })
    .catch((err) => console.log(err));
};

exports.postEditTask = (req, res, next) => {
  const taskId = req.body.taskId;
  const updatedName = req.body.name;
  const updatedDueDate = req.body.dueDate;
  const updatedTags = req.body.tags;
  const updatedPriority = req.body.priority;

  Task.findById(taskId)
    .then((task) => {
      console.log(task.userId.toString());
      if (task.userId.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: "You are not allowed to perform this action." });
      }
      task.name = updatedName;
      task.dueDate = updatedDueDate;
      task.tags = updatedTags;
      task.priority = updatedPriority;
      return task.save().then((result) => {
        console.log("UPDATED PRODUCT!");
        res.status(201).json({ message: "Product updated successfully!" });
      });
    })
    .catch((err) => console.log(err));
};

exports.postDeleteTask = (req, res, next) => {
  const taskId = req.body.taskId;

  Task.deleteOne({ _id: taskId, userId: req.user._id })
    .then((result) => {
      if (result.deletedCount === 0) {
        return res
          .status(403)
          .json({ message: "You are not allowed to perform this action." });
      }
      return res.json(result);
    })
    .catch((err) => console.log(err));
};

exports.postMarkCompleted = (req, res, next) => {
  const taskId = req.body.taskId;

  Task.findById(taskId)
    .then((task) => {
      console.log("task in postMarkCompleted: ", task);
      console.log(task.completed);
      if (task.completed === true) {
        task.completed = false;
      } else {
        task.completed = true;
      }

      return task.save();
    })
    .then(() => {
      return Task.find();
    })
    .then((tasks) => {
      return res.json(tasks);
    })
    .catch((err) => {
      if (err.statusCode === 404) {
        return res.status(404).json({ message: err.message });
      }
      res.status(500).json({ message: "Updating task failed!" });
    });
};

exports.getTasksWeek = (req, res, next) => {
  const range = calculateDateRage();
  Task.getTasksCurrentWeek(range.start, range.end)
    .then((tasks) => {
      res.render("tasks", {
        tasks: tasks,
        formatMongoDate,
      });
    })
    .catch((err) => console.log(err));
};

// get all high priority incomplete tasks

exports.getHighIncomplete = (req, res, next) => {
  Task.getHighIncomplete()
    .then((tasks) => {
      res.render("tasks", {
        tasks: tasks,
        formatMongoDate,
      });
    })
    .catch((err) => console.log(err));
};

// get all the tasks which contain a certain tag

exports.searchByTag = (req, res, next) => {
  const tag = req.body.tagSearch;
  Task.searchByTag(tag)
    .then((tasks) => {
      res.render("tasks", {
        tasks: tasks,
        formatMongoDate,
      });
    })
    .catch((err) => console.log(err));
};

exports.getAuthStatus = (req, res, next) => {
  if (req.session && req.session.isLoggedIn) {
    return res.json({ isAuthenticated: true, user: req.session.user });
  }

  return res.json({
    isAuthenticated: false,
    user: null,
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errorsV: errors.mapped() });
  }

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(400).json({ errors: "Incorrect email or password!" });
      }
      bcrypt
        .compare(password, user.password)
        .then((match) => {
          if (!match) {
            return res
              .status(400)
              .json({ errors: "Incorrect email or password!" });
          }

          req.session.isLoggedIn = true;
          req.session.user = JSON.parse(JSON.stringify(user));

          req.session.save((err) => {
            if (err) {
              console.log(err);
              return res.status(500).json({ message: "Session save failed" });
            }

            return res.json({ isAuthenticated: true });
          });
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Login failed" });
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Log out failed!" });
    }

    res.clearCookie("connect.sid");

    return res.status(200).json({ message: "Logged out successfully!" });
  });
};

exports.postSignup = (req, res, next) => {
  // we want to store a new user in the database
  const email = req.body.email;
  const password = req.body.password;
  const passwordConfirm = req.body.confirmPassword;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.mapped() });
  }

  return bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const newUser = new User({
        email: email,
        password: hashedPassword,
        tasks: { items: [] },
      });

      return newUser.save();
    })
    .then((result) => {
      res.status(201).json({ message: "User created successfully!" });
      // send welcome email
      return resend.emails.send({
        to: email,
        from: "TO DO LIST App <contact@webvertize.ro>",
        subject: "Welcome to our TO DO LIST App",
        html: "<h1>Welcome to the TO DO LIST App!</h1>",
      });
    })
    .catch((err) => console.log(err));
};

exports.postReset = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.mapped() });
  }

  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.json({ error: "Unable to generate password reset token!" });
    }
    const token = buffer.toString("hex");

    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          return res
            .status(400)
            .json({ error: "No account with this email found." });
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;

        return user.save();
      })
      .then((result) => {
        resend.emails.send({
          to: req.body.email,
          from: "TO DO LIST App <contact@webvertize.ro>",
          subject: "Password Reset Link",
          html: `
            <p>You requested a password reset</p>
            <p>Click this <a href="http://localhost:5173/reset/${token}">link</a> to set a new password</p>
          `,
        });
        return res.json({ message: "Reset password link sent!" });
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

exports.postNewPassword = (req, res, next) => {
  // get the user id based on the token in the URL and send it in the FE
  const { token, password } = req.body;
  let resetUser;

  console.log("received token, password: ", token, password);

  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      if (!user) {
        return res.status(400).json({ error: "Invalid or expired token!" });
      }
      resetUser = user;
      return bcrypt.hash(password, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.json({ message: "Password updated successfully!" });
    })
    .catch((err) => console.log(err));
};

exports.getResetValidate = (req, res, next) => {
  const token = req.params.token;

  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      if (!user) {
        return res.status(400).json({ error: "Link expired or invalid!" });
      }

      return res.json({ valid: true });
    })
    .catch((err) => {
      return res.status(500).json({ message: "Something went wrong!" });
    });
};
