const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const Mongoose = require('mongoose')

const Course = require("../models/course");
const Student = require("../models/student");
const Teacher = require("../models/teacher");
const Assignment = require("../models/assignment");
const Post = require("../models/post");
const Solution = require("../models/solution");
const Testwork = require("../models/testwork");

const Group = require("../models/group");

let checkCourseOwner = (creator, teacherId) => {
	if (creator !== teacherId) {
		const err = new Error();
		err.status = 404;
		err.data = 'Permission denied';
		throw err;
	}
}

exports.createCourse = async (req, res, next) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const error = new Error('Validation failed.');
			error.statusCode = 422;
			error.data = errors.array();
			throw error;
		}

		const title = req.body.title;
		const description = req.body.description;
		const key = req.body.key;
		const groupName = req.body.groupName;
		const students = req.body.students;

		const course = new Course({
			title: title,
			description: description,
			key: key,
			creator: req.userId
		});

		await course.save();

		await Teacher.findByIdAndUpdate(req.userId, { $push: { courses: course }});

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

		checkCourseOwner(course.creator.toString(), req.userId);

		course.title = title;
		course.key = key;
		course.description = description;
		await course.save();

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
		const students = await Course.findById(Mongoose.Types.ObjectId(id)).populate({ path: 'students', populate: { path: 'group' }, options: {sort: {'fullName': 1} }});

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

		checkCourseOwner(course.creator.toString(), req.userId);

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

		checkCourseOwner(course.creator.toString(), req.userId);
		
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
		
		checkCourseOwner(course.creator.toString(), req.userId);

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

		checkCourseOwner(course.creator.toString(), req.userId);

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

	let assignmentsWithChildren = [];
	for ([index, assignment] of assignments.entries()) {

		assignmentsWithChildren.push({value: assignment, children: []});

		let childrenEnd = false;

		while(!childrenEnd) {
			console.log("loop opp opp");
			console.log("he", assignment);
			if (assignment.children.length > 0) {
				console.log("he2", assignment);
				for ([index, child] of assignment.children.entries()) {
					console.log("he3", assignment);
					// assignment = await Assignment.findById(child.toString()).populate('children');
					assignment = await Assignment.findById(child.toString());


					assignmentsWithChildren[index].children.push({value: assignment, children: []});
					console.log("he4", assignment);
				}
				
			} else {
				childrenEnd = true;
			}
		}



		// find all assignments of this course
		// for each ass in assignments
			// for each child in ass.children
				// find assingment with parent as ass
		// 

		// if (assignment.children.length > 0) {

		// 	for (child of assignment.children) {

		// 		let ass = await Assignment.findById(child.toString()).populate('children');
		// 		assignmentsWithChildren[index].children.push(ass);

				
		// 	}
			
		// }
	}
	// console.log(assignmentsWithChildren);

	let ex = [
	    { name:"one", children: [
	    	{ name:"one.one", children: [
	    		{ name:"one.one.one", children: [] },
	    		{ name:"one.one.two", children: [] },
	    		{ name:"one.one.three", children: [] },
	    	] },
	    	{ name:"one.two", children: [] }
	    ] },
	    { name:"two", children: [
	    	 { name:"two.one", children: [] }
	    ] }
	];
	kinec = false;
	// while(!kinec) {
		for (val of ex) {

			console.log("val1", val);
			if (val.children) {
				for (val2 of val.children) {

					console.log("val2", val2);
					if (val2.children) {
						for (val3 of val2.children) {
							console.log("val3", val3);
						}
					}
				}
			}
		}
	// }
 	
	
	let posts = await Post.find({course: courseId});
	let testworks = await Testwork.find({course: courseId});

	let combinedAr = assignments.concat(posts);
	combinedAr = combinedAr.concat(testworks);
	combinedAr.sort(function(a, b){
	  return new Date(a.createdAt) - new Date(b.createdAt);
	});
	// console.log(combinedAr);
	// res.status(200).json(combinedAr);
	res.status(200).json(assignmentsWithChildren);

}

exports.getStudentGrades = async (req, res, next) => { 
	try {
		const courseId = req.body.id;

		const assignments = await Assignment.find({course: courseId});
		let result = [];

		for (const assignment of assignments) {
			const solution = await Solution.findOne({assignment: assignment._id, student: req.userId});
			result.push({id: assignment._id, title: assignment.title, createdAt: assignment.createdAt, deadline: assignment.deadline, maxGrade: assignment.maxGrade, grade: solution ? solution.grade : null, comment: solution ? solution.comment : null});
		}

		console.log(result);
		res.status(200).json(result);
	} catch (err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}
