const initServer = require('./server');

initServer().catch((error) => {
    console.error(error.message);
    process.exit(1);
});
