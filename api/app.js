
/**
 * Module dependencies.
 */

var compressor = require('node-minify'),
	express = require('express'),
	mongoose = require('mongoose'),
	routes = require('./routes'),
	expressValidator = require('express-validator'),
	RedisStore = require('connect-redis')(express),
	api = require('./routes/api'),
	User = require('./models/user.js'),
	Trip = require('./models/trip.js'),
	app = module.exports = express();

// Connect to MongoDB 
mongoose.connect('mongodb://localhost/bikebuddy');

new compressor.minify({
	type: 'uglifyjs',
	fileIn: [
		__dirname + '/../app/js/app.js',
		__dirname + '/../app/js/services.js',
		__dirname + '/../app/js/filters.js',
		__dirname + '/../app/js/directives.js',
		__dirname + '/../app/js/controllers.js'
	],
	fileOut: __dirname + '/../app/build/bikebuddy.min.js',
	callback: function(err) {
		if (err) {
			console.log(err);
		} else {
			console.log('Javascript minified using UglifyJS');
		}
	}
});

new compressor.minify({
	type: 'yui-css',
	fileIn: [
		__dirname + '/../app/lib/bootstrap/css/bootstrap.css',
		__dirname + '/../app/css/app.css',
	],
	fileOut: __dirname + '/../app/build/bikebuddy.min.css',
	callback: function(err) {
		if (err) {
			console.log(err);
		} else {
			console.log('CSS minified using UglifyJS');
		}
	}
});

// Configuration
app.configure(function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.set('view options', {
		layout: false
	});

	app.use(expressValidator);
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser());
	app.use(express.session({ 
		store: new RedisStore(),
		secret: 'adldkfj82lasj'
	}));
	app.use('/static', express.static(__dirname + '/../app'));

});

app.configure('development', function(){
	app.set('port', 3000);
	app.set('ssl required', false);

	app.use(express.errorHandler({ 
		dumpExceptions: true, showStack: true 
	}));
});

app.configure('production', function(){
	app.set('port', 27015);
	app.set('ssl required', true);
	app.use(express.errorHandler());
});

/**
 * Middleware for checking that a user is logged in.
 * Responds with a object containing a 'authenticationNeeded' property.
 */
function requiresLogin(req, res, next) {
	if (req.session.user) {
		next();
	} else {
		res.send({ 'authenticationNeeded': true });
	}
}

// Routes
app.get('/', routes.index);
app.get('/partials/:name', routes.partials);

// JSON API

// Testing only!
app.get('/api/trips/testData', api.trips.testData);
app.get('/api/trips', api.trips.list);
app.post('/api/trips/:id/join', api.trips.join);
app.post('/api/trips/:id/leave', api.trips.leave);
app.get('/api/trips/:id', api.trips.get);
app.put('/api/trips', api.trips.create);

app.get('/api/areas', api.areas.list);

app.put('/api/users', api.users.create);
app.get('/api/users', api.users.get);
app.get('/api/users/session', api.users.currentUser);
app.post('/api/users/session', api.users.login);
app.delete('/api/users/session', api.users.logout);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

// Start server
app.listen(app.get('port'), function(){
  console.log("Express server listening on port %d in %s mode", app.get('port'), app.settings.env);
});

