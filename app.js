
/**
 * Module dependencies.
 */

var express = require('express'),
	mongoose = require('mongoose'),
	routes = require('./routes'),
	api = require('./routes/api'),
	User = require('./models/user.js'),
	Trip = require('./models/trip.js'),
	app = module.exports = express();

// Connect to MongoDB 
mongoose.connect('mongodb://localhost/bikebuddy');

// Configuration
app.configure(function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.set('view options', {
		layout: false
	});
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use('/static', express.static(__dirname + '/public'));
	app.use(app.router);
});

app.configure('development', function(){
	app.set('port', 3000);
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
	app.set('port', 80);
	app.use(express.errorHandler());
});

// Routes
app.get('/', routes.index);
app.get('/partials/:name', routes.partials);

// JSON API
app.get('/api/trips', api.trips.list);
app.get('/api/trips/testData', api.trips.testData);
app.get('/api/trips/:id', api.trips.get);
app.put('/api/trips', api.trips.create);

app.get('/api/areas', api.areas.list);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

// Start server
app.listen(app.get('port'), function(){
  console.log("Express server listening on port %d in %s mode", app.get('port'), app.settings.env);
});

