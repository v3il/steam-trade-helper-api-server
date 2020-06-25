exports.up = function(knex) {
    return knex.schema.createTableIfNotExists('dynamic_items', table => {
        table.increments('id');
        table.integer('item_steam_id').notNullable();
        table.string('item_steam_name').notNullable();
        table.string('item_steam_name_en').notNullable();
        table.text('stat_data').notNullable();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('dynamic_items');
};
