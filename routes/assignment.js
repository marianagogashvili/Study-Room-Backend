const express = require('express');
const { body } = require('express-validator');

const router = express.Router();
const assignmentController = require('../controllers/assignment');
const Assignment = require('../models/assignment');
const isAuthTeacher = require('../middleware/is-auth-teacher');
const isAuth = require('../middleware/is-auth');

router.post('/createAssignment', isAuthTeacher, assignmentController.createAssignment);

// router.post('/getAssignmentsByCourse', isAuth, assignmentController.getByCourse);

router.post('/getAssignmentById', isAuth, assignmentController.getById);

router.post('/editAssignment', isAuthTeacher, assignmentController.editAssignment);

router.post('/deleteAssignment', isAuthTeacher, assignmentController.deleteAssignment);


module.exports = router;