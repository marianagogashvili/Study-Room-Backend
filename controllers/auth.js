const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const Mongoose = require('mongoose')

const Student = require('../models/student');
const Teacher = require('../models/teacher');

exports.register = async (req, res, next) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const error = new Error('Validation failed.');
			error.statusCode = 422;
			error.data = errors.array();
			throw error;
		}
		const login = req.body.login;
		const fullName = req.body.fullName;
		const type = req.body.type;
		const className = req.body.className;
		const password = req.body.password;

		const hashedPassword = await bcrypt.hash(password, 12);
		if (type === 'student') {
			const student = new Student({
				login: login,
				fullName: fullName,
				password: hashedPassword,
				class: className
			});
			const result = await student.save();
			res.status(201).json({ message: 'Student created!', id: student._id });
		} else if (type === 'teacher') {
			const teacher = new Teacher({
				login: login,
				fullName: fullName,
				password: hashedPassword
			});
			const result = await teacher.save();
			res.status(201).json({ message: 'Teacher created!', id: teacher._id });
		}
	} catch (err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}

exports.login = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error('Validation failed');
		error.statusCode = 422;
		error.data = errors.array();
		throw error;
	}
	const login = req.body.login;
	const password = req.body.password;

	try {
		const student = await Student.findOne({login: login});
		const teacher = await Teacher.findOne({login: login});

		let user;
		let type;
		if (student) {
			user = student;
			type = 'student';
		} else if (teacher) {
			user = teacher;
			type = 'teacher';
		} else {
			const error = new Error('This user does not exist');
			error.data = [{ value: login, param: 'login', msg: 'This user does not exist'}];
			error.statusCode = 401;
			throw error;
		}

		const isEqual = await bcrypt.compare(password, user.password);
		if (!isEqual) {
			const error = new Error('Password is not correct');
			error.data = [{ value: password, param: 'password', msg: 'Password is not correct'}];
			error.statusCode = 401;
			throw error;
		} else {
			const token = jwt.sign({
				login: login, id: user._id.toString(), type: type
			}, 'somesecret', { expiresIn: '1h' });

			res.status(200).json({ token: token, id: user._id.toString() });
		}
	} catch(err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}

// exports.checkUser = async (req, res, next) => { 
// 	const id = req.body.id;

// 	let type = '';
// 	const student = await Student.findById(Mongoose.Types.ObjectId(id));
// 	const teacher = await Teacher.findById(Mongoose.Types.ObjectId(id));

// 	if (student) {
// 		res.status(200).json({ exists: true, type: 'student' });
// 	} else if (teacher) {
// 		res.status(200).json({ exists: true, type: 'teacher' });
// 	} else {
// 		res.status(200).json({ exists: false });		
// 	}
// }
