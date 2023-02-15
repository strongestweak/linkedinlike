"use strict";
const { Model } = require("sequelize");

// USER -> FOLLOW where `UserId` is the `FollowId` and FOLLOW is the Other User ID
module.exports = (sequelize, DataTypes) => {
  class UserFollow extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      UserFollow.belongsTo(models.User, {
        targetKey: "id",
        foreignKey: "UserId",
        as: "User",
      });
      UserFollow.belongsTo(models.User, {
        targetKey: "id",
        foreignKey: "FollowId",
        as: "Follow",
      });
    }
  }
  UserFollow.init(
    {
      UserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      FollowId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "UserFollow",
    }
  );

  UserFollow.prototype.isSameFollow = function () {
    if (this.UserId === this.FollowId) {
      throw new Error("UserId and FollowId must not same.");
    }
  };

  const validate = async (userFollow) => {
    userFollow.isSameFollow();
    if (userFollow.isNewRecord) {
      const { UserId, FollowId } = userFollow;
      const obj = await UserFollow.findOne({ where: { UserId, FollowId } });
      if (obj) {
        throw new Error("This Follow already exist.");
      }
    }
  };

  UserFollow.beforeCreate(validate);
  UserFollow.beforeUpdate(validate);
  return UserFollow;
};
