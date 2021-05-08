const { validationResult } = require('express-validator');
const fs = require('fs');
const Post = require("../models/post");
const Course = require("../models/course");
const Notification = require("../models/notification");

let checkCourseCreator = async (courseId, teacherId) => {

	const course = await Course.findById(courseId);
	if (course.creator.toString() !== teacherId) {
		const err = new Error();
		err.data = "You are not allowed to do this";
		err.status = 403;
		throw err;
	}
}

exports.createPost = async (req, res, next) => {
	const title = req.body.title;
	const hidden = req.body.hidden;
	const course = req.body.courseId;
	const topic = req.body.topicId;

	checkCourseCreator(course, req.userId);

	const link = req.body.link === "undefined" ? null : req.body.link;

	let fileUrl = null;
	if (req.files[0]) {
		fileUrl = req.files[0].path;
	}

	const post = new Post({
		title: title,
		course: course,
		hidden: hidden,
		topic: topic,
		fileUrl: fileUrl,
		link: link
	});
	await post.save();

	const notification = new Notification({
		title: post.title,
		description: "You've added post",
		user: req.userId,
		type: "post",
		linkId: post._id,
		courseId: post.course
	});
	await notification.save();

	res.status(200).json(post);
};

exports.addMargin = async (req, res, next) => {
	try {
		const postId = req.body.id;
		const val = req.body.value;

		const post = await Post.findById(postId);

		checkCourseCreator(post.course, req.userId);

		await Post.updateOne({_id: postId}, { $inc: {margin: val} });
		res.status(201).json("Moved");
	} catch (err) {
		if (!err.statusCode) {
	      err.statusCode = 500;
	    }
		next(err);
	}
}


exports.getPostsByCourse = async (req, res, next) => {
	const courseId = req.body.id;
	const posts = await Post.find({course: courseId});

	res.status(200).json(posts);
};

exports.deletePost = async (req, res, next) => {
	const postId = req.body.id;

	const post = await Post.findById(postId);

	checkCourseCreator(post.course, req.userId);

	if (post.fileUrl) {
		fs.unlinkSync(post.fileUrl);
	}
	await Notification.deleteMany({linkId: postId});

	await Post.deleteOne({_id: postId});

	res.status(200).json({message: "Post deleted"});
};