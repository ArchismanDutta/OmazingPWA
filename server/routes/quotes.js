const express = require("express");
const router = express.Router();
const quoteController = require('../controllers/quoteController');

// Public route to get daily quote
router.get("/daily", quoteController.getDailyQuote);

module.exports = router;
