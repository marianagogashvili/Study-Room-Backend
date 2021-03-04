const Field = require("../models/field");

exports.getFields = async (req, res, next) => {
	const fields = await Field.find();
	res.status(200).json(fields);
};