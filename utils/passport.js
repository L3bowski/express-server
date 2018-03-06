var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

const userPrefixSeparator = '||->';
var deserializers = {};

const getUserFromPrefixedUserId = prefixedUserId => {
	var decomposition = prefixedUserId.split(userPrefixSeparator);
	var namespace = decomposition[0];
	var userId = decomposition[1];
    return deserializers[namespace](userId);
};

const isStaticContent = relativeUrl => 
	relativeUrl.indexOf('/js/') > -1 || relativeUrl.indexOf('/css/') > -1 ;

const prefixUserId = (appNamespace, userSession) => {
	if (userSession.passport && userSession.authDomains[appNamespace]) {
		userSession.passport.user = appNamespace +
			userPrefixSeparator + userSession.authDomains[appNamespace];
	}
	else {
		delete userSession.passport;
	}
};

const getPassportMiddleware = authenticatedApps => {
	return function (req, res, next) {

		if (isStaticContent(req.url)) return next();

		var currentApp = authenticatedApps.find(app => req.url.startsWith('/' + app.name));
		if (!currentApp) return next();
		
		prefixUserId(currentApp.name, req.session);
		// The following middleware deserializes the user
		return passport.session()(req, res, next);
	}
};

const userResolver = doneCallback => {
	return user => {
    	if (!user) {
			var error = {
    			message: 'Incorrect username or password'
			};
			return doneCallback(error, null);
		}
    	return doneCallback(null, user);
    };
};

const userSerializer = (user, doneCallback) => doneCallback(null, user.id);

const userDeserializer = (prefixedUserId, doneCallback) =>
	getUserFromPrefixedUserId(prefixedUserId).then(userResolver(doneCallback));

const configurePassport = (server, apps) => {
	const authenticatedApps = apps.filter(app => app.enableAuthentication);

	server.use(passport.initialize()); 
	server.use(getPassportMiddleware(authenticatedApps));

	passport.serializeUser(userSerializer);
	passport.deserializeUser(userDeserializer);
}

// TODO Securize access through namespace

passport.createStrategy = function (namespace, authenticator, deserializer, logInHandler, logOutHandler) {

	if (namespace.indexOf(userPrefixSeparator) > -1) {
		throw 'The namespace ' + namespace + ' is not valid!';
	}

	deserializers[namespace] = deserializer;

	var localStrategy = new LocalStrategy({
	    usernameField: 'username',
	    passwordField: 'password'
	}, function (username, password, userAuthenticated) {
	    return authenticator(username, password)
	    .then(userResolver(userAuthenticated));
	});

	passport.use(namespace, localStrategy);

	function logIn (req, res, next) {

		function userAuthenticated(error, user, info) {
	        if (error) return res.status(401).json(error);

	        req.logIn(user, function (error) {
	            if (error) return res.send(error);

				req.session.authDomains = req.session.authDomains || {};
				req.session.authDomains[namespace] = user.id;
				
	            logInHandler(req, res, next);
	        });
	    }

	    passport.authenticate(namespace, userAuthenticated)(req, res, next);
	};

	function logOut (req, res, next) {
		req.session.authDomains = req.session.authDomains || {};
        delete req.session.authDomains[namespace];
        delete req.session.passport;
        return logOutHandler(req, res, next);
	};

	return {
		logIn,
		logOut
	};
}

module.exports = { configurePassport };
