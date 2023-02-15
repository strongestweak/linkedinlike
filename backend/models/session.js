"use strict";
const { Model,Sequelize } = require("sequelize");
var jwt = require("jsonwebtoken");
module.exports = (sequelize, DataTypes) => {
  class Session extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Session.belongsTo(models.User);
    }
  }
  Session.init(
    {
      UserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      expiredAt: {
        type: DataTypes.INTEGER,
        defaultValue: () => {
          const cDate = new Date();
          cDate.setFullYear(cDate.getFullYear() + 2);
          return cDate.getTime();
        },
      },
    },
    {
      sequelize,
      modelName: "Session",
    }
  );

  Session.prototype.refreshToken = async function () {
    const { isActive, expiredAt } = this;
    const cDate = new Date();
    if (!isActive || expiredAt < cDate.getTime()) {
      throw { message: "Unauthorized", status: 401 };
    }
    const { User } = sequelize.models;
    const user = await User.findOne({ where: { id: this.UserId } });
    const token = jwt.sign(
      user.get({ plain: true }),
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1m" }
    );
    return token;
  };

  Session.prototype.logout = async function () {
    await this.update({ isActive: false });
  };

  Session.getActiveByToken = async function (token) {
    const { User } = sequelize.models;
    const session = await Session.findOne({
      include: [{ model: User, as: "User" }],
      where: {
        token,
        isActive: true,
        expiredAt: {
          [Sequelize.Op.gt]: new Date().getTime(),
        },
      },
    });
    return session;
  };

  return Session;
};
