exports.up = function(knex) {
    return knex.schema.createTableIfNotExists('steam_items', table => {
        table.increments('id');
        table.integer('steam_id').notNullable();
        table.string('item_name').notNullable();
        table.boolean('watch').defaultTo(1);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('steam_items');
};
