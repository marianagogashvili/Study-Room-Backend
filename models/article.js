const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const articleSchema = new Schema({
	title: {
		type: String,
		required: true
	},
	text: {
		type: String,
		required: true
	},
	course: {
		type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
	},
	margin: {
		type: Number,
		default: 0
	},
	topic: {
		type: Schema.Types.ObjectId,
        ref: 'Topic',
        required: true
	}
}, { timestamps: true });
 
module.exports = mongoose.model('Article', articleSchema);