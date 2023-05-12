"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class GroupImages extends Model {
    static associate(models) {
      GroupImages.belongsTo(models.Group, { foreignKey: "groupId" });
    }
  }
  GroupImages.init(
    {
      groupId: { type: DataTypes.INTEGER, allowNull: false },
      url: { type: DataTypes.STRING, allowNull: false },
      preview: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "GroupImages",
    }
  );
  return GroupImages;
};
