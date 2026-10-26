const express = require('express');
const router = express.Router();
const { sendContactEmail } = require('../controllers/Contactcontroller.js');

router.post('/send', sendContactEmail);

module.exports = router;

