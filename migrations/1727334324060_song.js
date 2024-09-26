/* global exports */

exports.up = (pgm) => {
  pgm.createTable("song", {
    id: {
      type: "varchar(21)",
      unique: true,
      notNull: true,
      primaryKey: true,
    },
    title: {
      type: "text",
      notNull: true,
    },
    year: {
      type: "integer",
      notNull: true,
    },
    genre: {
      type: "text",
      notNull: true,
    },
    performer: {
      type: "text",
      notNull: true,
    },
    duration: {
      type: "integer",
    },
    album_id: {
      type: "text",
    },
  });
};
