const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const Mongoose = require('mongoose');
const Student = require('../models/student');
const Assignment = require('../models/assignment');
const Solution = require('../models/solution');
const Testwork = require('../models/testwork');
const TestAnswer = require('../models/testAnswer');


exports.getStudent = async (req, res, next) => {
	try {
		const studentId = req.userId;
		const student = await Student.findById(studentId).populate('group').populate('courses');
		if (!student) {
			const error = new Error();
			error.statusCode = 404;
			error.data  = 'This student does not exist';
			throw error;
		} else {
			res.status(201).json(student);
		}
	} catch(err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}

exports.editStudent = async (req, res, next) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const error = new Error();
			error.statusCode = 422;
			error.data  = errors.array();
			throw error;
		}

		const id = req.userId;
		const login = req.body.login;

		const checkLogin = await Student.findOne({login:login});
		if (checkLogin !== null && checkLogin.id.toString() !== id) {
			const error = new Error();
			error.statusCode = 404;
			error.data  = [{param: 'login', msg:'Login is already taken'}];
			throw error;
		}

		const fullName = req.body.fullName;
		const oldPassword = req.body.oldPassword;
		const newPassword = req.body.newPassword;

		const student = await Student.findById(Mongoose.Types.ObjectId(id));

		if (!student) {
			const error = new Error();
			error.statusCode = 404;
			error.data  = 'This student does not exist';
			throw error;
		} else {
			const passIsCorrect = await bcrypt.compare(oldPassword, student.password);
			if (!passIsCorrect) {
				const error = new Error();
				error.statusCode = 422;
				error.data  = [{ param: 'oldPassword', msg: 'Old password is incorrect'}];
				throw error;
			} else {
				student.login = login;
				student.fullName = fullName;
				const hashedPass = await bcrypt.hash(newPassword, 12);
				student.password = hashedPass;
				const result = await student.save();
				res.status(200).json({message: 'Student was updated successfully', student: student});
			}
		}
	} catch (err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}

exports.getGrades = async (req, res, next) => {
	try {

		const student = await Student.findById(req.userId).populate('courses');
		console.log(student.courses);

		let assignments;
		let solutions;

		let result = [];

		for (course of student.courses) {
			let maxGrade = 0;
			let grade = 0;

			assignments = await Assignment.find({course: course._id});
			assignments.forEach(a => maxGrade += a.maxGrade);
			solutions = await Solution.find({student: req.userId, assignment: {"$in": assignments} });
			solutions.forEach(s => grade += s.grade ? s.grade : 0);
			result.push({id: course._id, title: course.title, grade: grade, maxGrade: maxGrade});
		}


		res.status(200).json(result);

	}  catch (err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}

exports.getAssignments = async (req, res, next) => {
	try {
		const student = await Student.findById(req.userId).populate('courses');

		const works = [];
		for (course of student.courses) {
			const ass = await Assignment.find({course: course._id});
			for (a of ass) {
				const solution = await Solution.findOne({student: req.userId, assignment: a});
				works.push({
					work: {
						type: 'assignment', 
						_id: a._id, 
						title: a.title, 
						deadline: a.deadline, 
						maxGrade: a.maxGrade,
						createdAt: a.createdAt}, 
					solution: solution, 
					course: course.title, 
					courseId: course._id});
			}
			const tests = await Testwork.find({course: course._id});
			for (test of tests) {
				let maxGrade = 0;
				for (question of test.questions) {
					maxGrade += question.points;
				}
				const answer = await TestAnswer.findOne({student: req.userId, testwork: test._id});
				let pending = false;
				let grade = 0;
				if (answer) {
					answer.answers.forEach(val => {
						if (!val.grade) {
							pending = true;
						}
						grade += val.grade ? val.grade : 0;
					});
				} else {
					grade = null;
				}
				
				works.push({
					work: {
						type: 'test', 
						_id: test._id, 
						title: test.title, 
						deadline: test.deadline, 
						maxGrade: maxGrade,
						createdAt: a.createdAt}, 
					solution: {grade: grade}, 
					pending: pending, 
					course: course.title, 
					courseId: course._id});

			}
		}
		works.sort((a, b) => {
			return new Date(a.work.createdAt) - new Date(b.work.createdAt);
		})
		// console.log(assignments);

		res.status(200).json({works: works, courses: student.courses});
	}  catch (err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}

