const { validationResult } = require('express-validator');
const fs = require('fs');
const Post = require("../models/post");
const Course = require("../models/course");

exports.createPost = async (req, res, next) => {
	const title = req.body.title;
	const course = req.body.courseId;
	const topic = req.body.topicId;

	const postCourse = await Course.findById(course);
	if (postCourse.creator.toString() !== req.userId) {
		const err = new Error();
		err.status = 403;
		err.data = 'You are not validated';
		throw err;
	}

	const link = req.body.link === "undefined" ? null : req.body.link;

	let fileUrl = null;
	if (req.files[0]) {
		fileUrl = req.files[0].path;
	}

	const post = new Post({
		title: title,
		course: course,
		topic: topic,
		fileUrl: fileUrl,
		link: link
	});
	await post.save();
	res.status(200).json(post);
};

exports.getPostsByCourse = async (req, res, next) => {
	const courseId = req.body.id;
	const posts = await Post.find({course: courseId});

	res.status(200).json(posts);
};

exports.deletePost = async (req, res, next) => {
	const postId = req.body.id;

	const post = await Post.findById(postId).populate('course');

	if (post.course.creator.toString() !== req.userId) {
		const err = new Error();
		err.status = 403;
		err.data = 'You are not validated';
		throw err;
	}

	if (post.fileUrl) {
		fs.unlinkSync(post.fileUrl);
	}

	await Post.deleteOne({_id: postId});
	res.status(200).json({message: "Post deleted"});
};