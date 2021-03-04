const express = require('express');
const fieldController = require('../controllers/field');

const Field = require('../models/field');

const router = express.Router();

router.get('/getFields', fieldController.getFields);


module.exports = router;