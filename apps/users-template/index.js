var express = require('express');
var router = express.Router();
var path = require('path');
var passport = require('passport');
var authenticationService = require('./services/authentication-service');
var elementsController = require('./controllers/elements-controller');
var elementsApi = require('./controllers/elements-api-controller');
var authenticationHandler = passport.createStrategy('users-template',
	authenticationService.authenticator, authenticationService.retriever, authenticationService.logIn, authenticationService.logOut);

router.get('/api/elements', elementsApi.getAll);
router.get('/api/elements/getById', elementsApi.getById);

router.get('/', elementsController.index);
router.get('/secured', elementsController.secured);
router.get('/restricted', elementsController.restricted);

router.post('/log-in', authenticationHandler.logIn);
router.post('/log-out', authenticationHandler.logOut);

router.get('/client-side', function (req, res, next) {
	res.set('Content-Type', 'application/javascript');
	return res.json({
		user: {
			id: req.user && req.user.id,
			username: req.user && req.user.username
		}
	});
});

module.exports = router;
