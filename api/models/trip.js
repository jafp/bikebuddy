
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = mongoose.ObjectId;

// Define the schema
var tripSchema = new Schema({
	where: { type: String, required: true },
	area: { type: String, required: true },
	when: Date,
	type: String,
	intensity: String,
	duration: String,
	description: String,
	comments: [{ 
		comment: String, 
		when: { type: Date, default: Date.now } 
	}],
	participants: [ { user: String } ]
});

// Define the model
var Trip = mongoose.model('Trip', tripSchema);

// Export the model
module.exports = Trip;