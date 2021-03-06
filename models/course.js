const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const courseSchema = new Schema({
	title: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	key: {
		type: String,
		required: false
	},
	opened: {
		type: Boolean,
		required: true
	},
	field: {
      type: Schema.Types.ObjectId,
      ref: 'Field',
      required: true
    },
	creator: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true
    },
    students: [
		{
		  type: Schema.Types.ObjectId,
		  ref: 'Student'
		}
	],
	requests: [
		{
		  type: Schema.Types.ObjectId,
		  ref: 'Student'
		}
	]

});

module.exports = mongoose.model('Course', courseSchema);