"use strict";
require("dotenv").config();

let schema;
if (process.env.NODE_ENV === "production" && process.env.SCHEMA) {
  schema = process.env.SCHEMA;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    console.log({ schema });
    console.log("Started adding constraints...");
    await queryInterface.addConstraint("Venues", {
      type: "foreign key",
      fields: ["groupId"],
      references: {
        table: "Groups",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
      schema,
    });
    console.log("Constraint added for Venues...");
    await queryInterface.addConstraint("Events", {
      type: "foreign key",
      fields: ["groupId"],
      references: {
        table: "Groups",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
      schema,
    });
    console.log("Constraint added for Events (group)...");
    await queryInterface.addConstraint("Events", {
      type: "foreign key",
      fields: ["venueId"],
      references: {
        table: "Venues",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
      schema,
    });
    console.log("Constraint added for Events (venue)...");
    await queryInterface.addConstraint("EventImages", {
      type: "foreign key",
      fields: ["eventId"],
      references: {
        table: "Events",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
    console.log("Constraint added for EventImages...");
    await queryInterface.addConstraint("Groups", {
      type: "foreign key",
      fields: ["organizerId"],
      references: {
        table: "Users",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
      schema,
    });
    console.log("Constraint added for Groups...");
    await queryInterface.addConstraint("Attendances", {
      type: "foreign key",
      fields: ["eventId"],
      references: {
        table: "Events",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
      schema,
    });
    console.log("Constraint added for Attendances (event)...");
    await queryInterface.addConstraint("Attendances", {
      type: "foreign key",
      fields: ["userId"],
      references: {
        table: "Users",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
      schema,
    });
    console.log("Constraint added for Attendances (user)...");
    await queryInterface.addConstraint("Memberships", {
      type: "foreign key",
      fields: ["userId"],
      references: {
        table: "Users",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
      schema,
    });
    console.log("Constraint added for Memberships (user)...");
    await queryInterface.addConstraint("Memberships", {
      type: "foreign key",
      fields: ["groupId"],
      references: {
        table: "Groups",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
      schema,
    });
    console.log("Constraint added for Memberships (group)...");
    await queryInterface.addConstraint("GroupImages", {
      type: "foreign key",
      fields: ["groupId"],
      references: {
        table: "Groups",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
      schema,
    });
    console.log("Constraint added for GroupImages...");
    console.log("Finished adding constraints...");
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint(
      "Venues",
      "Venues_groupId_Groups_fk",
      { schema }
    );
    await queryInterface.removeConstraint(
      "Events",
      "Events_groupId_Groups_fk",
      { schema }
    );
    await queryInterface.removeConstraint(
      "Events",
      "Events_venueId_Venues_fk",
      { schema }
    );
    await queryInterface.removeConstraint(
      "EventImages",
      "EventImages_eventId_Events_fk",
      { schema }
    );
    await queryInterface.removeConstraint(
      "Groups",
      "Groups_organizerId_Users_fk",
      { schema }
    );
    await queryInterface.removeConstraint(
      "Attendances",
      "Attendances_eventId_Events_fk",
      { schema }
    );
    await queryInterface.removeConstraint(
      "Attendances",
      "Attendances_userId_Users_fk",
      { schema }
    );
    await queryInterface.removeConstraint(
      "Memberships",
      "Memberships_groupId_Groups_fk",
      { schema }
    );
    await queryInterface.removeConstraint(
      "Memberships",
      "Memberships_userId_Users_fk",
      { schema }
    );
    await queryInterface.removeConstraint(
      "GroupImages",
      "GroupImages_groupId_Groups_fk",
      { schema }
    );
  },
};
