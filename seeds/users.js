exports.seed = function (knex) {
    return knex('users').del()
        .then(function () {
            return knex('users').insert([
                { login: 'admin', password: '8fd84813630d7623f75f85f3550ca4189c9db0be99336c88d0f981ab2beffeeb' },
                { login: 'user', password: 'd06ac7e40e9a71fe6f60a1d083af9d94a4df9e493794e726d06c9894044aea6e' },
            ]);
        });
};
