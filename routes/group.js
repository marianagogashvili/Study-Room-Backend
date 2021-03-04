const express = require('express');
const groupController = require('../controllers/group');

const Group = require('../models/group');

const router = express.Router();

router.get('/getGroups', groupController.getGroups);


module.exports = router;