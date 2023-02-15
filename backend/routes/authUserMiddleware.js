var jwt = require("jsonwebtoken");
const { User } = require("../models");

const authUserMiddleware = async (req, res, next) => {
  const endpoint = req.baseUrl + req.path;
  const excluded = [
    "/functions/login",
    "/functions/refresh-token",
    "/functions/logout",
  ];
  if (excluded.includes(endpoint)) {
    next();
  } else {
    const { authorization } = req.headers;
    const error = { message: "Unauthorized", status: 401 };
    if (!authorization) {
      throw error;
    }
    const [_prefix, token] = authorization.split(" ");
    if (!token) {
      throw error;
    }
    try {
      var decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findOne({ where: { id: decoded.id } });
      req.user = user;
      next();
    } catch (err) {
      throw error;
    }
  }
};

module.exports = authUserMiddleware;
