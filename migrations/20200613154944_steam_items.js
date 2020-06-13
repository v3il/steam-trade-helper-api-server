exports.up = function(knex) {
    return knex.schema.createTable('steam_items', table => {
        table.increments('id');
        table.integer('steam_id').notNullable();
        table.string('item_name').notNullable();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('steam_items');
};
