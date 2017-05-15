function list (req, res, next) {
	return res.render('users-template-restricted-list');
}

function details (req, res, next) {
	return res.render('users-template-restricted-details', {
		restrictedId: parseInt(req.query.id)
	});
}

function edit (req, res, next) {
	return res.render('users-template-restricted-edit', {
		restrictedId: parseInt(req.query.id)
	});
}

module.exports = {
	list,
	details,
	edit
};
