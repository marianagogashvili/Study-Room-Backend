const express = require('express');
const courseController = require('../controllers/course');
const { body } = require('express-validator');

const Course = require('../models/course');
const isAuthTeacher = require('../middleware/is-auth-teacher');
const isAuthStudent = require('../middleware/is-auth-student');

const router = express.Router();

router.post('/getCourseTeacher', isAuthTeacher, courseController.getCourse);
// router.post('/getCourseStudent', isAuthStudent, courseController.getCourse);

router.post('/createCourse', [
	body('title').not().isEmpty().withMessage('Title is empty')
				 .isLength({min: 3}).withMessage('Title is too short'),
	body('description').not().isEmpty().withMessage('Description is empty')
				 .isLength({min: 3}).withMessage('Description is too short'),
	body('key').not().isEmpty().withMessage('Key is empty')	 
], isAuthTeacher, courseController.createCourse);

router.put('/editCourse',  [
	body('title').not().isEmpty().withMessage('Title is empty')
				 .isLength({min: 3}).withMessage('Title is too short'),
	body('description').not().isEmpty().withMessage('Description is empty')
				 .isLength({min: 3}).withMessage('Description is too short'),
	body('key').not().isEmpty().withMessage('Key is empty')	 
], isAuthTeacher, courseController.editCourse);

router.post('/getStudentsOfCourse', isAuthTeacher, courseController.getStudents);

router.post('/deleteStudentFromCourse', isAuthTeacher, courseController.deleteStudent);

router.post('/findStudentsByParams', isAuthTeacher, courseController.findStudentsByParams);

router.post('/addStudents', isAuthTeacher, courseController.addStudents);

router.post('/deleteStudents', isAuthTeacher, courseController.deleteStudents);

module.exports = router; 