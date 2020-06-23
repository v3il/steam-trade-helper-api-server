exports.up = function(knex) {
    return knex.schema.createTable('cases', table => {
        table.increments('id');
        table.integer('case_steam_id').notNullable();
        table.string('case_steam_name').notNullable();
        table.text('stat_data').notNullable();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('cases');
};
