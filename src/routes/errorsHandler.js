module.exports = (error, request, response, next) => {
    console.error(error.message);
    response.status(500).json({ error: error.message || 'Server Error' });
}