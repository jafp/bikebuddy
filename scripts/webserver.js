

var sys = require('sys'),
	exec = require('child_process').exec,
	path = __dirname + '/../api/app.js';

exec('node ' + path, function(error, stdout, stderr) {
	sys.puts(stdout);
	sys.puts(stderr);
});

