exports.up = function (knex) {
    return knex.schema.alterTable('dynamic_items', (table) => {
        table.boolean('pinned').defaultTo(false);
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('dynamic_items', (table) => {
        table.dropColumn('pinned');
    });
};
