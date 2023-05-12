"use strict";

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "Attendances",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        eventId: {
          type: Sequelize.INTEGER,
          references: { model: "Events", key: "id" },
          allowNull: false,
          onDelete: "cascade",
        },
        userId: {
          type: Sequelize.INTEGER,
          references: { model: "Users", key: "id" },
          allowNull: false,
          onDelete: "cascade",
        },
        status: {
          allowNull: false,
          type: Sequelize.ENUM,
        },
        createdAt: {
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
          type: Sequelize.DATE,
        },
      },
      options
    );
  },
  async down(queryInterface) {
    options.tableName = "Attendances";
    await queryInterface.dropTable(options);
  },
};
