const { join } = require('path');
const express = require('express');
const assets = require('express-asset-versions');
var sassCompiler = require('./sass-compiler');
var session = require('express-session');
var bodyParser = require('body-parser');
var passport = require('passport');
var tracer = require('./tracer');
var { getUserManagementUtils } = require('./passport');

const namespaceRelativeUrl = (namespace, relativeUrl) => {
	var namespacePrefix = '/' + namespace;
	var namespacedUrl = relativeUrl;

	if (relativeUrl == null || relativeUrl == '') {
		namespacedUrl = namespacePrefix;
	}
	else if (relativeUrl == '/') {
		namespacedUrl = namespacePrefix + '/';
	}
	else if (!relativeUrl.startsWith(namespacePrefix)) {
		namespacedUrl = namespacePrefix + relativeUrl;
	}
	
	return namespacedUrl;
};

const namespaceUrlByQueryParameters = (relativeUrl, queryString) => {
	if (queryString.namespace) {
		relativeUrl = namespaceRelativeUrl(queryString.namespace, relativeUrl)
	}
	return relativeUrl;
};

const namespaceUrlByDomain = (apps, domain, relativeUrl) => {
	var domainAppAccess = apps.find(app =>
		(app.publicDomains != null &&
		app.publicDomains.find(d => domain.indexOf(d) > -1) != null));
	
	if (domainAppAccess) {
		relativeUrl = namespaceRelativeUrl(domainAppAccess.name, relativeUrl);
	}

	return relativeUrl;
};

const setNamespace = (config, apps, req) => {
	var accessedApp = apps.find(app => {
		var regexBase = "\\/" + app.name + "(\\/|\\?|$)"
		var regex = new RegExp(regexBase, "g");
		return req.url.match(regex);
	});

	if (!accessedApp) {
		req.url = namespaceRelativeUrl(config.defaultApp, req.url);
		req._namespace = config.defaultApp;
	}
	else {
		req._namespace = accessedApp.name;
	}

	tracer.info('Accessed app: ' + req._namespace);
};

const isolateViewsAccess = (namespace, res) => {
	res.render = function(viewName, parameters) {
		var isolateView = namespace + '\\views\\' + viewName;
		this._render(isolateView, parameters);
	};
};

const appResolver = (config, apps) => 
	function resolvingApp(req, res, next) {
		tracer.info('Relative url:' + req.url);

		res._render = res.render;
		req.url = namespaceUrlByQueryParameters(req.url, req.query);

		if (req.url.startsWith('/plugins')) {
			return next();
		}
		req.url = namespaceUrlByDomain(apps, req.headers.host, req.url);

		setNamespace(config, apps, req);
		isolateViewsAccess(req._namespace, res);
		return next();
	};

const registerApp = (server, config, appConfig) => {
	tracer.info('App name: ' + appConfig.name);

	var assetsPath = join(appConfig.path, appConfig.assetsFolder);
	server.use('/' + appConfig.name, express.static(assetsPath));
	server.use(assets('/' + appConfig.name, assetsPath));

	const jsonMiddleware = bodyParser.json();
	const sessionMiddleware = session({
		secret: config.sessionSecret,
		resave: false,
		saveUninitialized: true,
		name: appConfig.name
	});

	// TODO Provide only on enable authentiaction
	const passportInitialize = passport.initialize();
	const passportSession = passport.session();
	const appMiddleware = {
		bodyParser: jsonMiddleware,
		session: sessionMiddleware,
		passport: [sessionMiddleware, jsonMiddleware, passportInitialize, passportSession]
	};

	const userManagementUtils = getUserManagementUtils(appConfig.name);

	try
	{
		var { configureRouter } = require(appConfig.indexFilePath);
		var appRouter = tracer.trace(configureRouter)(appMiddleware, { userManagementUtils });
		server.use('/' + appConfig.name, appRouter);
	}
	catch(exception)
	{
		tracer.error('An error occurred when trying to publish ' + appConfig.name);
	}
};

const publishApps = (server, config, appsConfig) => {
	// TODO make optional
	sassCompiler(appsConfig);

	var appsFolder = join(__dirname, '..', 'apps');
	server.set('views', appsFolder);

	const pluginsPath = join(__dirname, '..', 'plugins');	
	server.use('/plugins', express.static(pluginsPath));

	server.use(tracer.trace(appResolver(config, appsConfig)));

	appsConfig.forEach(app => tracer.trace(registerApp)(server, config, app));

	server.use((req, res, next) => {
		return res.status(404)._render('error-page', {
			statusCode: 404,
			message: "The url you are looking for does not exist"
		});
	});

	server.use((err, req, res, next) => {
		return res.status(500)._render('error-page', {
			statusCode: 500,
			message: "Internal server error"
		});
	});
};

module.exports = { publishApps, namespaceUrlByDomain, setNamespace };
