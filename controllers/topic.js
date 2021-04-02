const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const Topic = require("../models/topic");
const Course = require("../models/course");
const Assignment = require("../models/assignment");
const Article = require("../models/article");
const Testwork = require("../models/testwork");
const Solution = require("../models/assignment");
const Post = require("../models/post");

exports.createTopic = async (req, res, next) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const error = new Error();
			error.statusCode = 422;
			error.data  = "Validation was failed";
			throw error;
		}

		const courseId = req.body.courseId;
		const title = req.body.title;
		const hidden = req.body.hidden;
		const beforeTopic = req.body.beforeTopic;

		const course = await Course.findById(courseId);
		if (!course) {
			const error = new Error();
			error.statusCode = 404;
			error.data  = 'This course does not exist';
			throw error;
		}

		if (course.creator.toString() !== req.userId ) {
			const error = new Error();
			error.statusCode = 403;
			error.data  = 'Permission denied';
			throw error;
		}

		if (!beforeTopic) {
			let numberOfTopics = await Topic.countDocuments({course: courseId});
			const num = numberOfTopics + 1;
			const topic = new Topic({
				title: title,
				hidden: hidden,
				course: courseId,
				num: num
			});
			await topic.save();
			res.status(201).json(topic);
		} else {

			const topic = new Topic({
				title: title,
				hidden: hidden,
				course: courseId,
				num: beforeTopic
			});
			await Topic.updateMany({num: {$gte: beforeTopic}}, { $inc: { num: 1 } } );

			await topic.save();

			res.status(201).json(topic);
		}
		
	} catch (err) {
		console.log(err);
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
	
};

exports.getTopics = async (req, res, next) => {
	try {
		const courseId = req.body.courseId;
		const topics = await Topic.find({course: courseId}).sort({ num: 'asc'});
		res.status(200).json(topics);

	} catch (err) {
		console.log(err);
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}


exports.editTopic = async (req, res, next) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const error = new Error();
			error.statusCode = 422;
			error.data  = "Validation was failed";
			throw error;
		}

		const topicId = req.body.id;
		const title = req.body.title;
		const hidden = req.body.hidden;

		const topic = await Topic.findById(topicId).populate('course');
		if (!topic) {
			const error = new Error();
			error.statusCode = 404;
			error.data  = 'This topic does not exist';
			throw error;
		}

		if (topic.course.creator.toString() !== req.userId) {
			const error = new Error();
			error.statusCode = 403;
			error.data  = 'Permission denied';
			throw error;
		}

		topic.title = title;
		topic.hidden = hidden;

		await topic.save()

		res.status(201).json(topic);
	} catch (err) {
		console.log(err);
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}
exports.deleteTopic = async (req, res, next) => {
	try {
		const topicId = req.body.id;
		const topic = await Topic.findById(topicId).populate('course');
		if (!topic) {
			const error = new Error();
			error.statusCode = 404;
			error.data  = 'This topic does not exist';
			throw error;
		}
		if (topic.course.creator.toString() !== req.userId) {
			const error = new Error();
			error.statusCode = 403;
			error.data  = 'Permission denied';
			throw error;
		}

		const number = topic.num;
		let assignments = await Assignment.find({topic: topicId});
		let posts = await Post.find({topic: topicId});

		assignments.forEach(async a => {
			
			const solutions = await Solution.find({assignment: a._id});
			solutions.forEach(async solution => {
				solution.fileUrl.forEach(file => {
					fs.unlinkSync(file);
				});
				await Solution.deleteOne({_id: solution._id});
			});

			a.fileUrl.forEach(file => {
				fs.unlinkSync(file);
			});

			await Assignment.deleteOne({_id: a._id});
		});
		posts.forEach(async post => {
			if (post.fileUrl !== null) {
				fs.unlinkSync(post.fileUrl);
			}

			await Post.deleteOne({_id: post._id});
		});

		await Article.deleteMany({topic: topicId});
		await Testwork.deleteMany({topic: topicId});

		await Topic.deleteOne({_id: topicId});
		await Topic.updateMany({num: {$gt: number}}, { $inc: { num: -1 } } );

		res.status(201).json({message: "Topic deleted"});
	} catch (err) {
		console.log(err);
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}