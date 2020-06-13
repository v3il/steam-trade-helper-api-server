const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('express-async-errors');

const rootRouter = require('./routes');
const errorsHandler = require('./routes/errorsHandler');
const config = require('./config');

module.exports = async () => {
    const app = express();

    app.use(cors());
    app.use(bodyParser.json());

    app.set('view engine', 'ejs');

    app.use('/', rootRouter);
    app.use(errorsHandler);

    return app.listen(config.PORT, () => {
        console.log(`Server successfully started at ${config.PORT}.`);
    });
};
