const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
	login: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	fullName: {
		type: String,
		required: true
	},
	class: {
		type: String,
		required: true
	},
	firstLogin: {
		type: Date,
		default: new Date(),
		required: false
	},
	lastLogin: {
		type: Date,
		default: new Date(),
		required: false
	},
	courses: [
		{
		  type: Schema.Types.ObjectId,
		  ref: 'Course'
		}
	]
});

module.exports = mongoose.model('Student', studentSchema);