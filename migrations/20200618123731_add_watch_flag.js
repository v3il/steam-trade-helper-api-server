exports.up = function(knex) {
    return knex.schema.table('steam_items', function(table) {
        table.boolean('watch').defaultTo(1);
    });
};

exports.down = function(knex) {
    return knex.schema.table('steam_items', function(table) {
        table.dropColumn('watch');
    });
};
