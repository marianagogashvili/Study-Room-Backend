const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const Group = require("../models/group");

exports.getGroups = async (req, res, next) => {
	const groups = await Group.find();
	res.status(200).json(groups);
};