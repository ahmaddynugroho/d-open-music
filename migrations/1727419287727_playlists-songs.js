/* global exports */

/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createTable("playlist_songs", {
    id: {
      type: "varchar(21)",
      primaryKey: true,
      notNull: true,
      unique: true,
    },
    playlist_id: {
      type: "varchar(21)",
      references: "playlists",
      notNull: true,
      onDelete: "CASCADE",
    },
    song_id: {
      type: "varchar(21)",
      references: "songs",
      notNull: true,
      onDelete: "CASCADE",
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("playlist_songs");
};
