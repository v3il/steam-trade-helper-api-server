exports.up = function(knex) {
    return knex.schema.createTableIfNotExists('users', table => {
        table.increments('id');
        table.string('login').notNullable();
        table.string('password').notNullable();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('users');
};
