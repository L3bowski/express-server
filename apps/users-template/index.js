var express = require('express');
var router = express.Router();
var path = require('path');
var authenticationService = require('./services/authentication-service');
var { createStrategy, logInMiddleware, logOutMiddleware } = require('../../utils/passport');
createStrategy('users-template', authenticationService.handlers);

const configureRouter = (middleware) => {
	router.get('/', middleware.passport, function (req, res, next) {
		return res.render('users-template-index');
	});

	router.post('/log-in', middleware.passport, logInMiddleware('users-template'), (req, res, next) => {
		return res.json(authenticationService.getClientSideInfo(req.user, req.body.permissions));
	});
	router.post('/log-out', middleware.passport, logOutMiddleware, (req, res, next) => {
		return res.send('Successfully logged out');
	});

	router.get('/client-side', middleware.passport, function (req, res, next) {
		res.set('Content-Type', 'application/javascript');
		return res.json({
			user: authenticationService.getClientSideInfo(req.user, req.query.permissions)
		});
	});

	var publicControllers = require('./controllers/public')(router, middleware);
	var restrictedControllers = require('./controllers/restricted')(router, middleware);
	return router;
}

module.exports = { configureRouter };
