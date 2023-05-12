"use strict";

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "Memberships",
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
        userId: {
          type: Sequelize.INTEGER,
          references: { model: "Users", key: "id" },
          allowNull: false,
          onDelete: "cascade",
        },
        status: {
          allowNull: false,
          type: Sequelize.ENUM("member", "pending", "co-host", "host"),
          defaultValue: "pending",
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
    options.tableName = "Memberships";
    await queryInterface.dropTable(options);
  },
};
