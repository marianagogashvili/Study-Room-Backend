const express = require('express');
const { body } = require('express-validator');

const router = express.Router();
const assignmentController = require('../controllers/assignment');
const Assignment = require('../models/assignment');
const isAuth = require('../middleware/is-auth-teacher');

router.post('/createAssignment', isAuth, assignmentController.createAssignment);

router.post('/getAssignmentsByCourse', isAuth, assignmentController.getByCourse);

router.post('/getAssignmentById', isAuth, assignmentController.getById);

// router.post('/editAssignment', isAuth, assignmentController.editAssignment);

router.post('/deleteAssignment', isAuth, assignmentController.deleteAssignment);


module.exports = router;