/* global exports */

exports.up = (pgm) => {
  pgm.createTable("album", {
    id: {
      type: "varchar(21)",
      unique: true,
      notNull: true,
      primaryKey: true,
    },
    name: {
      type: "text",
      notNull: true,
    },
    year: {
      type: "integer",
      notNull: true,
    },
  });
};
