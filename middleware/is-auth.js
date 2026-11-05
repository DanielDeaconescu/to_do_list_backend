module.exports = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    res.status(401).json({ message: "You are not logged in." });
  }
  next();
};
