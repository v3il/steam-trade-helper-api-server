const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('express-async-errors');

const rootRouter = require('./routes');
const errorsHandler = require('./routes/errorsHandler');
const config = require('./config');
const runInfoUpdater = require('./scripts/getInfo');
const { initSocket } = require('./socketInstance');

module.exports = async () => {
    const app = express();

    app.use(cors());
    app.use(bodyParser.json());
    app.use(express.static('src/public'));

    app.use('/', rootRouter);
    app.use(errorsHandler);

    runInfoUpdater();

    const server = app.listen(config.PORT, () => {
        console.log(`Server successfully started at ${config.PORT}.`);
    });

    initSocket(server);

    return server;
};
