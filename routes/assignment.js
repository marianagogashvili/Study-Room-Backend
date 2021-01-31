const express = require('express');
const { body } = require('express-validator');

const router = express.Router();
const assignmentController = require('../controllers/assignment');
const Assignment = require('../models/assignment');
const isAuth = require('../middleware/is-auth-teacher');

router.post('/createAssignment', isAuth, assignmentController.createAssignment);

module.exports = router;