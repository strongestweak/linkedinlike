var express = require("express");
var router = express.Router();
const { User, Session, Sequelize } = require("../models");

/* GET home page. */
router.post("/login", async function (req, res, next) {
  const { email, password } = req.body;
  const user = await User.findOne({
    where: {
      email,
    },
  });
  const errorMessage = "Invalid username/password.";
  if (!user) {
    throw { message: errorMessage, status: 400 };
  }
  if (!user.correctPassword(password)) {
    throw { message: errorMessage, status: 400 };
  }

  const session = await user.addSession();
  const accessToken = await session.refreshToken();
  console.log("session", session);
  const refreshToken = session.token;
  if (refreshToken) {
    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });
  }
  res.json({ user, accessToken, refreshToken });
});

router.post("/logout", (req, res) => {
  res.cookie("refreshToken", null, {
    maxAge: 0,
  });
  res.json({ message: "SUCCESS" });
});

router.get("/me", async (req, res) => {
  res.json(req.user);
});

router.post("/refresh-token", async (req, res) => {
  const { refreshToken } = req.cookies;
  const error = { message: "Unauthorized", status: 401 };
  if (!refreshToken) {
    throw error;
  }
  const session = await Session.getActiveByToken(refreshToken);
  if (!session) {
    throw error;
  }
  const user = session.User;
  await session.logout();
  const newSession = await user.addSession();
  const accessToken = await newSession.refreshToken();
  const cRefreshToken = newSession.token;
  if (cRefreshToken) {
    res.cookie("refreshToken", cRefreshToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });
  }
  res.json({ accessToken, user, refreshToken: cRefreshToken });
});

module.exports = router;
