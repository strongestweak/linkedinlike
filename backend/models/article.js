"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Article extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Article.belongsTo(models.User, {
        foreignKey: "UserId",
        targetKey: "id",
        as: "User",
      });
      Article.hasMany(models.ArticleUserReact, {
        as: "ArticleUserReact",
        targetKey: "id",
        foreignKey: "ArticleId",
      });
    }
  }
  Article.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      UserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      datePublished: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: () => new Date()
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      thumbnail: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Article",
      scopes: {
        "with-react": function () {
          const { ArticleUserReact } = sequelize.models;
          return {
            include: [
              {
                duplicating: false,
                model: ArticleUserReact,
                as: "ArticleUserReact",
                attributes: ["type", [sequelize.fn("COUNT", "*"), "count"]],
              },
            ],
            group: ["Article.id", "ArticleUserReact.type"],
          };
        },
      },
    }
  );
  return Article;
};
