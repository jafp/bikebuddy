
/**
 * Module dependencies.
 */

var express = require('express'),
	mongoose = require('mongoose'),
	routes = require('./routes'),
	api = require('./routes/api'),
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
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes
app.get('/', routes.index);
app.get('/partials/:name', routes.partials);

// JSON API
app.get('/api/trips', api.trips.list);
app.get('/api/trips/:id', api.trips.get);
app.get('/api/trips/testData', api.trips.testData);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

// Start server
app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", 3000, app.settings.env);
});

