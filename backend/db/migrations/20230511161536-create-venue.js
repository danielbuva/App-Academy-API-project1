"use strict";

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "Venues",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        groupId: {
          type: Sequelize.INTEGER,
          references: { model: "Groups", key: "id" },
          allowNull: false,
          onDelete: "cascade",
        },
        address: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        city: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        state: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        lat: {
          allowNull: false,
          type: Sequelize.FLOAT,
        },
        lng: {
          allowNull: false,
          type: Sequelize.FLOAT,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
      },
      options
    );
  },
  async down(queryInterface) {
    options.tableName = "Venues";
    await queryInterface.dropTable(options);
  },
};
