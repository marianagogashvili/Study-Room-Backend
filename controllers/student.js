const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

const Student = require('../models/student');
const Teacher = require('../models/teacher');

exports.register = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error('Validation failed');
		error.statusCode = 422;
		error.data = errors.array();
		throw error;
	}
	const login = req.body.login;
	const fullName = req.body.fullName;
	const type = req.body.type;
	const className = req.body.className;
	const password = req.body.password;

	try {
		const hashedPassword = await bcrypt.hash(password, 12);
		if (type === 'student') {
			const student = new Student({
				login: login,
				fullName: fullName,
				password: hashedPassword,
				class: className
			});
			const result = await student.save();
			res.status(201).json({ message: 'Student created!' });
		} else if (type === 'teacher') {
			const teacher = new Teacher({
				login: login,
				fullName: fullName,
				password: hashedPassword
			});
			const result = await teacher.save();
			res.status(201).json({ message: 'Teacher created!' });
		}
	} catch (err) {
		next(err);
	}
	
}