"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Venues extends Model {
    static associate(models) {
      Venues.hasMany(models.Event);
      Venues.belongsTo(models.Group);
    }
  }
  Venues.init(
    {
      groupId: { type: DataTypes.INTEGER, allowNull: false },
      address: { type: DataTypes.STRING, allowNull: false },
      city: { type: DataTypes.STRING, allowNull: false },
      state: { type: DataTypes.STRING, allowNull: false },
      lat: { type: DataTypes.FLOAT, allowNull: false },
      lng: { type: DataTypes.FLOAT, allowNull: false },
    },
    {
      sequelize,
      modelName: "Venues",
    }
  );
  return Venues;
};
