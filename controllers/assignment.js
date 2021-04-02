const { validationResult } = require('express-validator');
const Assignment = require("../models/assignment");

const Course = require("../models/course");
const Solution = require("../models/solution");
const Notification = require("../models/notification");

const fs = require('fs');

let checkCourseCreator = async (courseId, teacherId) => {

	const course = await Course.findById(courseId);
	if (course.creator.toString() !== teacherId) {
		const err = new Error();
		err.data = "You are not allowed to do this";
		err.status = 403;
		throw err;
	}
}

exports.addMargin = async (req, res, next) => {
	try {
		const assignmentId = req.body.id;
		const val = req.body.value;


		const assignment = await Assignment.findById(assignmentId);
		checkCourseCreator(assignment.course, req.userId);

		await Assignment.updateOne({_id: assignmentId}, { $inc: {margin: val} });
		res.status(201).json("Moved");
	} catch (err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}

exports.createAssignment = async (req, res, next) => {
	try {
		const title = req.body.title;
		const description = req.body.description;
		const courseId = req.body.courseId;
		const topicId = req.body.topicId;
		// const parentId = req.body.parentId; 
		const hidden = req.body.hidden; 
		const maxGrade = req.body.maxGrade; 

		checkCourseCreator(courseId, req.userId);

		let availableFrom = new Date(req.body.availableFrom).setHours(new Date(req.body.availableFrom).getHours() + 2);
		let deadline = new Date(req.body.deadline).setHours(new Date(req.body.deadline).getHours() + 2) || null;

		if (title === '' || description === '' || courseId === '' || topicId === ''  || !availableFrom) {
			req.files.forEach(file => {
				fs.unlinkSync(file.path);
			});
			const err = new Error();
			err.data = "Validation was failed";
			err.status = 422;
			throw err;
		}

		let fileUrls = [];
		req.files.forEach(file => {
			fileUrls.push(file.path);
		});

		const assignment = new Assignment({
			title: title, 
			description: description,
			fileUrl: fileUrls,
			course: courseId,
			hidden: hidden,
			topic: topicId,
			maxGrade: maxGrade,
			availableFrom: availableFrom,
			deadline: deadline
		});

		// if (parentId !== '') {
		// 	assignment.parent = parentId;
		// }

		await assignment.save();

		const notification = new Notification({
			title: assignment.title,
			description: "created",
			user: req.userId,
			type: "assignment",
			linkId: assignment._id,
			courseId: courseId
		});
		await notification.save();

		res.status(201).json(assignment);
	} catch (err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
};

exports.getById = async (req, res, next) => {
	try {
		const id = req.body.id;
		const assignment = await Assignment.findById(id).populate('topic');

		if (!assignment) {
			let err =  new Error();
			err.statusCode = 404;
			err.data = "This assignment does't exist";
			throw err;
		}

		res.status(200).json(assignment);
	} catch (err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}

exports.editAssignment = async (req, res, next) => {
	try {
		const id = req.body.id;
		const title = req.body.title;
		const hide = req.body.hide;
		const description = req.body.description;
		const maxGrade = req.body.maxGrade;

		const availableFrom = new Date(req.body.availableFrom).setHours(new Date(req.body.availableFrom).getHours() + 2);
		const deadline = new Date(req.body.deadline).setHours(new Date(req.body.deadline).getHours() + 2) || null;
		const remove = JSON.parse(req.body.remove);

		const assignment = await Assignment.findById(id).populate('topic');

		checkCourseCreator(assignment.course, req.userId);

		if (!assignment) {
			let err =  new Error();
			err.statusCode = 404;
			err.data = "This assignment does't exist";
			throw err;
		}

		if (title === '' || description === '' || !maxGrade  || !availableFrom) {
			req.files.forEach(file => {
				fs.unlinkSync(file.path);
			});
			const err = new Error();
			err.data = "Validation was failed";
			err.status = 422;
			throw err;
		}


		let newFiles = [...assignment.fileUrl];
		remove.forEach(r =>  {
			console.log(r);
			newFiles = newFiles.filter(file => file !== r);
		});
		
		
		req.files.forEach(file =>  newFiles.push(file.path));

		assignment.title = title;
		assignment.description = description;
		assignment.availableFrom = availableFrom;
		assignment.deadline = deadline;
		assignment.fileUrl = newFiles;
		assignment.maxGrade = maxGrade;
		assignment.hidden = hide;

		await assignment.save();

		remove.forEach(file => {
			fs.unlinkSync(file);
		});

		const notification = new Notification({
			title: assignment.title,
			description: "edited",
			user: req.userId,
			type: "assignment",
			linkId: assignment._id,
			courseId: assignment.course
		});
		await notification.save();

		res.status(201).json(assignment);
	}  catch (err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}

exports.deleteAssignment = async (req, res, next) => {
	try {
		const id = req.body.id;
		const assignment = await Assignment.findById(id)

		// const children = await Assignment.find({parent: assignment._id});
		// if (children.length > 0) {
		// 	if (assignment.parent) {
		// 		children.forEach(async child => {
		// 			child.parent = assignment.parent;
		// 			await child.save();
		// 		});
		// 	} else {
		// 		children.forEach(async child => {
		// 			child.parent = assignment.parent;
		// 			await child.save();
		// 		});
		// 	}
		// }

		// await children.save();

		if (!assignment) {
			let err =  new Error();
			err.statusCode = 404;
			err.data = "This assignment does't exist";
			throw err;
		}

		checkCourseCreator(assignment.course, req.userId);

		const solutions = await Solution.find({assignment: assignment._id});
		solutions.forEach(async solution => {
			solution.fileUrl.forEach(file => {
				fs.unlinkSync(file);
			});
			await Solution.deleteOne({_id: solution.id});
		});

		assignment.fileUrl.forEach(file => {
			fs.unlinkSync(file);
		});
		await Assignment.deleteOne({_id: id});

		const notification = new Notification({
			title: assignment.title,
			description: "deleted",
			user: req.userId,
			type: "assignment",
			courseId: assignment.course
		});
		await notification.save();

		res.status(200).json({message: "Assignment was deleted"});
	} catch (err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}

	