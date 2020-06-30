exports.up = function (knex) {
    return knex.schema.alterTable('dynamic_items', (table) => {
        table.string('my_auto_price').nullable();
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('dynamic_items', (table) => {
        table.dropColumn('my_auto_price');
    });
};
