"use strict";
const crypto = require("crypto");
const { Model } = require("sequelize");
var jwt = require("jsonwebtoken");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Session, {
        targetKey: "id",
        foreignKey: "UserId",
        as: "Sessons",
      });
      User.hasMany(models.Article, {
        targetKey: "id",
        foreignKey: "UserId",
        as: "Articles",
      });
      User.hasMany(models.UserFollow, {
        targetKey: "id",
        foreignKey: "UserId",
        as: "Following",
      });
      User.hasMany(models.UserFollow, {
        foreignKey: "id",
        foreignKey: "FollowId",
        as: "Follower",
      });
    }
  }
  User.init(
    {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: DataTypes.STRING,
      dob: DataTypes.DATE,
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      avatar: {
        type: DataTypes.STRING,
      },
      randomUserId: {
        type: DataTypes.STRING,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        get() {
          return () => this.getDataValue("password");
        },
      },
      salt: {
        type: DataTypes.STRING,
        get() {
          return () => this.getDataValue("salt");
        },
      },
    },
    {
      sequelize,
      modelName: "User",
      scopes: {
        "with-following": function () {
          const { UserFollow } = sequelize.models;
          return {
            attributes: [
              "*",
              [
                sequelize.fn("COUNT", sequelize.col("Following.UserId")),
                "following",
              ],
            ],
            include: [
              {
                duplicating: false,
                attributes: [],
                model: UserFollow,
                as: "Following",
              },
            ],
            group: ["User.id"],
          };
        },
        "with-follower": function () {
          const { UserFollow } = sequelize.models;
          return {
            attributes: [
              "*",
              [
                sequelize.fn("COUNT", sequelize.col("Follower.FollowId")),
                "follower",
              ],
            ],
            include: [
              {
                duplicating: false,
                model: UserFollow,
                as: "Follower",
                attributes: [],
              },
            ],
            group: ["User.id"],
          };
        },
      },
    }
  );

  User.generateSalt = function () {
    return crypto.randomBytes(16).toString("base64");
  };
  User.encryptPassword = function (plainText, salt) {
    return crypto
      .createHash("RSA-SHA256")
      .update(plainText)
      .update(salt)
      .digest("hex");
  };

  const setSaltAndPassword = (user) => {
    if (user.changed("password")) {
      user.salt = User.generateSalt();
      user.password = User.encryptPassword(user.password(), user.salt());
    }
  };
  User.beforeCreate(setSaltAndPassword);
  User.beforeUpdate(setSaltAndPassword);

  User.prototype.addSession = async function () {
    const { Session } = sequelize.models;
    const token = jwt.sign(
      this.get({ plain: true }),
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "2y" }
    );
    const session = await Session.create({ UserId: this.id, token });
    return session;
  };

  User.prototype.correctPassword = function (enteredPassword) {
    return (
      User.encryptPassword(enteredPassword, this.salt()) === this.password()
    );
  };

  return User;
};
