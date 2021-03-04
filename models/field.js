const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const fieldSchema = new Schema({
	title: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model('Field', fieldSchema);