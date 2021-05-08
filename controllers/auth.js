const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const Mongoose = require('mongoose')

const Student = require('../models/student');
const Teacher = require('../models/teacher');
const Group = require('../models/group');
const Notification = require('../models/notification');

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
		const groupId = req.body.groupId;

		const password = req.body.password;

		const hashedPassword = await bcrypt.hash(password, 12);

		if (type === 'student') {
			const group = await Group.findById(groupId);
			if (!group) {
				const error = new Error();
				error.data = [{ param: 'className', msg: 'This group does not exist'}];
				error.statusCode = 401;
				throw error;
			}
			const student = new Student({
				login: login,
				fullName: fullName,
				password: hashedPassword,
				group: group,
				firstLogin: new Date(),
				lastLogin: new Date()
			});

			const result = await student.save();
			const token = jwt.sign({
				login: student.login, id: student._id.toString(), type: type
			}, 'somesecret', { expiresIn: '24h' });

			res.status(201).json({ message: 'Student created!', id: student._id, token: token, type: type });
		} else if (type === 'teacher') {
			const teacher = new Teacher({
				login: login,
				fullName: fullName,
				password: hashedPassword,
				firstLogin: new Date(),
				lastLogin: new Date()
			});
			const result = await teacher.save();

			const token = jwt.sign({
				login: teacher.login, id: teacher._id.toString(), type: type
			}, 'somesecret', { expiresIn: '24h' });

			res.status(201).json({ message: 'Teacher created!', id: teacher._id, token: token, type: type });
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
			user.lastLogin = new Date();
			await user.save();
			const token = jwt.sign({
				login: login, id: user._id.toString(), type: type
			}, 'somesecret', { expiresIn: '24h' });

			res.status(200).json({ token: token, id: user._id.toString(), type: type });
		}
	} catch(err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}

exports.getNotifications = async (req, res, next) => {
	try {
		const notifications = await Notification.find({user: req.userId});

		res.status(200).json(notifications);
	} catch(err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}


