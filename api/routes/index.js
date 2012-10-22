
exports.index = function(req, res) {
	res.render('index');
}

exports.partials = function(req, res) {
	var name = req.params.name;
	res.sendfile('app/partials/' + name);
}