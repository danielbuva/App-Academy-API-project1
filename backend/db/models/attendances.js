"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Attendances extends Model {
    static associate(models) {
      Attendances.belongsTo(models.Event);
      Attendances.belongsTo(models.User);
    }
  }
  Attendances.init(
    {
      eventId: { type: DataTypes.INTEGER, allowNull: false },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      status: { type: DataTypes.ENUM, allowNull: false },
    },
    {
      sequelize,
      modelName: "Attendances",
    }
  );
  return Attendances;
};
