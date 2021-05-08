const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const folderSchema = new Schema({
	title: {
		type: String,
		required: true
	},
	description: {
		type: String
	},
	files: [
		{
			fileUrl: {
				type: String
			},
			folder: {
				type: String
			}
		}
	]
});

module.exports = mongoose.model('Folder', folderSchema);