/**
 * minify.js
 */

var uglifyParser = require("uglify-js").parser,
	uglify = require("uglify-js").uglify,
	fs = require('fs');

var files = [
	
	'app/lib/moment.min.js',
	
	'app/js/app.js',
	'app/js/services.js',
	'app/js/filters.js',
	'app/js/directives.js',
	'app/js/controllers.js'
];

var minify = function(basePath, outputPath) {

	var code = '',
		ast,
		result;

	files.forEach(function(file) {
		var path = basePath + '/' + file;
		if (fs.existsSync(path)) {
			code += fs.readFileSync(path);
		}
	});

	ast = uglifyParser.parse(code);
	ast = uglify.ast_mangle(ast);
	ast = uglify.ast_squeeze(ast);
	result = uglify.gen_code(ast);

	fs.writeFileSync(outputPath, result);
}

module.exports = minify;