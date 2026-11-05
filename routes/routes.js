const express = require("express");

const app = express();
const taskController = require("../controllers/tasks");
const isAuth = require("../middleware/is-auth");
const { body } = require("express-validator");
const User = require("../models/user");

const router = express.Router();

router.post("/add-task", isAuth, taskController.postAddTask);

router.get("/", isAuth, taskController.getTasks);

router.get("/edit-task/:taskId", isAuth, taskController.getEditTask);

router.post("/edit-task", isAuth, taskController.postEditTask);

router.post("/delete-task", isAuth, taskController.postDeleteTask);

router.post("/completed", isAuth, taskController.postMarkCompleted);

router.get("/get-tasks-week", isAuth, taskController.getTasksWeek);

router.get("/get-high-incomplete", isAuth, taskController.getHighIncomplete);

router.post("/search-tag", isAuth, taskController.searchByTag);

router.get("/status", taskController.getAuthStatus);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please enter a valid email!"),
    body("password")
      .isLength({ min: 5 })
      .isAlphanumeric()
      .withMessage("Please enter a valid password!"),
  ],
  taskController.postLogin,
);

router.post("/logout", taskController.postLogout);

router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email!")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject("Email alreay used!");
          }
        });
      }),
    body("password")
      .isLength({ min: 5 })
      .isAlphanumeric()
      .withMessage("Please enter a valid password!"),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords have to match!");
      }
      return true;
    }),
  ],
  taskController.postSignup,
);

router.post(
  "/reset",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email!")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((user) => {
          if (!user) {
            return Promise.reject("No account with this email found!");
          }
        });
      }),
  ],
  taskController.postReset,
);

router.post("/new-password", taskController.postNewPassword);

router.get("/reset/:token", taskController.getResetValidate);

module.exports = router;
