const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
	title: {
		type: String,
		required: true
	},
	fileUrl: {
		type: String
	},
	link: {
		type: String
	},
	course: {
		type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
	},
	topic: {
		type: Schema.Types.ObjectId,
        ref: 'Topic',
        required: true
	}
}, { timestamps: true });
 
module.exports = mongoose.model('Post', postSchema);