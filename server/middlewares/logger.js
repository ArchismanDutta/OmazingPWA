// middlewares/logger.js
const morgan = require("morgan"); // Install: npm install morgan

const logger = morgan("dev");
module.exports = logger;
