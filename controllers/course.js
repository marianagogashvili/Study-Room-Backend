const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const Mongoose = require('mongoose')

const Course = require("../models/course");
const Student = require("../models/student");
const Teacher = require("../models/teacher");
const Assignment = require("../models/assignment");
const Post = require("../models/post");

const Group = require("../models/group");

exports.createCourse = async (req, res, next) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const error = new Error('Validation failed.');
			error.statusCode = 422;
			error.data = errors.array();
			throw error;
		}

		const teacherId = req.body.teacherId;
		const title = req.body.title;
		const description = req.body.description;
		const key = req.body.key;
		const groupName = req.body.groupName;
		const students = req.body.students;

		const course = new Course({
			title: title,
			description: description,
			key: key,
			creator: teacherId
		});

		await course.save();

		await Teacher.findByIdAndUpdate(teacherId, { $push: { courses: course }});

		if (students.length !== []) {
			students.forEach(async (s) => {
				course.students.push(s);
				await Student.findByIdAndUpdate(s._id, { $push: { courses: course } });
			});
		}

		await course.save();

		if (groupName !== '') {
			const group = await Group.find({name: groupName});
			const studs = await Student.find({ group: group });
			studs.forEach(async (s)  => {
				course.students.push(s);
				await Student.findByIdAndUpdate(s._id, { $push: { courses: course } });
			});
		}

		await course.save();

		res.status(201).json('Course was created successfully');
		
	} catch (err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
};

exports.getCourse = async (req, res, next) => {
	try {	
		const id = req.body.id;
		const course = await Course.findById(Mongoose.Types.ObjectId(id)).populate('creator');
		if (course) {
			res.status(200).json(course); 
		} else {
			const err = new Error();
			err.status = 404;
			err.data = 'This course does not exist';
			throw err;
		}
	} catch (err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
};

exports.editCourse = async (req, res, next) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const error = new Error('Validation failed.');
			error.statusCode = 422;
			error.data = errors.array();
			throw error;
		}
		const id = req.body.id;
		const teacherId = req.body.teacherId;
		const title = req.body.title;
		const key = req.body.key;
		const description = req.body.description;

		const course = await Course.findById(id);
		if (!course) {
			const err = new Error();
			err.status = 404;
			err.data = 'This course does not exist';
			throw err;
		}

		if (course.creator.toString() === teacherId) {
			course.title = title;
			course.key = key;
			course.description = description;
			await course.save();
		} else {
			const err = new Error();
			err.status = 404;
			err.data = 'Permission denied';
			throw err;
		}
		const result = await Course.findByIdAndUpdate(id, {title: title, key: key, description: description});
		res.status(200).json({message: "Course was updated successfully"}); 
	} catch (err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}

exports.getStudents = async (req, res, next) => {
	try {
		const id = req.body.id;
		const students = await Course.findById(Mongoose.Types.ObjectId(id)).populate({ path: 'students', populate: { path: 'group' }});

		res.status(200).json(students); 
	} catch (err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}

exports.deleteStudent = async (req, res, next) => {
	try {
		const studentId = req.body.studentId.toString() ;
		const courseId = req.body.courseId.toString() ;

		const student = await Student.findById(Mongoose.Types.ObjectId(studentId));
		if (!student) {
			const err = new Error();
			err.status = 404;
			err.data = 'This student does not exist';
			throw err;
		}

		const course = await Course.findById(Mongoose.Types.ObjectId(courseId));
		if (!course) {
			const err = new Error();
			err.status = 404;
			err.data = 'This course does not exist';
			throw err;
		}
		console.log(student);
		console.log(course);

		await student.courses.pull(courseId);
		await student.save();
		await course.students.pull(studentId);
		await course.save();

		res.status(200).json({message: "Student was removed from course"});
	} catch (err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}

exports.findStudentsByParams = async (req, res, next) => {
	const fullName = req.body.fullName;
	const login = req.body.login;
	const groupVal = req.body.group;
	const courseId = req.body.courseId;

	let students = [];
	let group = '';

	if (fullName !== '' || login !== '' || groupVal !== '') {
		let group = await Group.findOne({name: groupVal});

		students = await Student.find().populate('group')
			.and([
		      { 'fullName': {$regex: fullName , $options: "i"} },
		      { 'login': {$regex: login, $options: "i"} },
		      { 'courses': { $ne: courseId } },
		      group ? { 'group': group._id } : {}
		    ]);
	}
	res.status(200).json(students);
}

exports.addStudents = async (req, res, next) => {
	try {
		const course = await Course.findById(req.body.courseId);
		if (!course) {
			const err = new Error();
			err.status = 404;
			err.data = 'This course does not exist';
			throw err;
		}
		const students = req.body.students;

		if (students.length !== []) {
			students.forEach(async (s) => {
				course.students.push(s);
				await Student.findByIdAndUpdate(s._id, { $push: { courses: course } });
			});
		}

		await course.save();
		res.status(201).json({message: "Students added successfully"});
	} catch (err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
	

}

exports.deleteStudents = async (req, res, next) => {
	try {
		const courseId = req.body.courseId;
		const course = await Course.findById(courseId);
		if (!course) {
			const err = new Error();
			err.status = 404;
			err.data = 'This course does not exist';
			throw err;
		}
		course.students.forEach(async (studentId) => {
			const student = await Student.findById(studentId);

			await student.courses.pull(courseId);
			await student.save();
		});

		course.students = [];
		await course.save();
		res.status(200).json({message: "Students deleted"});
	} catch (err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}

exports.deleteCourse = async (req, res, next) => {
	try {

		const course = await Course.findById(req.body.id);
		if (!course) {
			const err = new Error();
			err.status = 404;
			err.data = 'This course does not exist';
			throw err;
		}
		course.students.forEach(async (studentId) => {
			const student = await Student.findById(studentId);

			await student.courses.pull(course._id);
			await student.save();
		});
		await Course.deleteOne({ _id: course._id });
		res.status(200).json({message: "Course deleted"});
	} catch (err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}

exports.getFeed = async (req, res, next) => {
	const courseId = req.body.courseId;
	let assignments = await Assignment.find({course: courseId});
	let posts = await Post.find({course: courseId});

	let combinedAr = assignments.concat(posts);
	combinedAr.sort(function(a, b){
	  return new Date(a.createdAt) - new Date(b.createdAt);
	});
	// console.log(combinedAr);
	res.status(200).json(combinedAr);
}
