"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ArticleUserReact extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      ArticleUserReact.belongsTo(models.Article);
      ArticleUserReact.hasOne(models.User, {
        targetKey: "UserId",
        foreignKey: "id",
      });
    }
  }
  ArticleUserReact.init(
    {
      ArticleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      UserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "ArticleUserReact",
    }
  );

  ArticleUserReact.beforeCreate(async (object) => {
    const { UserId, ArticleId } = object;

    if (UserId && ArticleId) {
      const cObject = await ArticleUserReact.findOne({
        where: {
          UserId,
          ArticleId,
        },
      });
      if (cObject) {
        throw new Error("User already react on this Article.");
      }
    }
  });

  return ArticleUserReact;
};
