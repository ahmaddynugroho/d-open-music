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
  pgm.createTable("user_album_likes", {
    id: {
      type: "varchar(21)",
      notNull: true,
      primaryKey: true,
      unique: true,
    },
    user_id: {
      type: "varchar(21)",
      notNull: true,
      references: "users",
      onDelete: "CASCADE",
    },
    album_id: {
      type: "varchar(21)",
      notNull: true,
      references: "albums",
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
  pgm.dropTable("user_album_likes");
};
