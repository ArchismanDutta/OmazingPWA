const express = require("express");
const router = express.Router();
const socialAuthController = require("../controllers/socialAuthController");

router.post("/google", socialAuthController.googleLogin);
router.post("/facebook", socialAuthController.facebookLogin);

module.exports = router;
