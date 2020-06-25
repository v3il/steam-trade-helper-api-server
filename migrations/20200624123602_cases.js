exports.up = function(knex) {
    return knex.schema.createTableIfNotExists('cases', table => {
        table.increments('id');
        table.integer('case_steam_id').notNullable();
        table.string('case_steam_name').notNullable();
        table.string('case_steam_name_en').notNullable();
        table.text('stat_data').notNullable();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('cases');
};
