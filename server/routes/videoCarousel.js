const express = require('express');
const router = express.Router();
const videoCarouselController = require('../controllers/videoCarouselController');

// Public route to get active videos
router.get('/', videoCarouselController.getAllVideos);

module.exports = router;
