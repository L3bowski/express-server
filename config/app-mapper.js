var express = require('express');
var path = require('path');
var assets = require('express-asset-versions');

var rootPath = path.normalize(__dirname + '/..');

module.exports = function (server, apps) {

	function appMapper(req, res, next) {
		var domain = req.headers.host;
		var relativeUrl = req.url;

		if (req.url.indexOf('plugins') > -1) {
			return next();
		}

		req.url = updateRelativeUrl(apps, domain, relativeUrl);
		return next();
	}

	function registerApp(app) {
		var appPath = path.join(rootPath, app.appPath);
		var appRouter = require(appPath);
		var assetsPath = path.join(appPath, 'public');

		server.use('/' + app.namespace, express.static(assetsPath));
		server.use(assets('/' + app.namespace, assetsPath));
		server.use('/' + app.namespace, appRouter);

		if (app.defaultApp) {
			server.use('/', appRouter);
		}
	}

	function setViewsPaths(apps) {
		var viewsPaths = apps.reduce(function(paths, app) {
			return paths.concat(path.join(rootPath, app.appPath, 'views'));
		}, []);
		server.set('views', viewsPaths);
	}

	function updateRelativeUrl(apps, domain, relativeUrl) {
		var map = apps.reduce(function(map, app) {
			if (map.matched) {
				return map;
			}

			var match = (app.mapToDomain && domain.indexOf(app.namespace) > -1) || (!app.mapToDomain && relativeUrl.startsWith('/' + app.namespace));
			var updatedUrl = app.namespace + map.relativeUrl;
			return {
				relativeUrl: (match && app.mapToDomain) ? updatedUrl : relativeUrl,
				matched: match
			}
		}, {
			relativeUrl: relativeUrl,
			matched: false
		});

		return map.relativeUrl;
	}

	var pluginsPath = path.join(rootPath, 'plugins');

	setViewsPaths(apps);
	server.use(appMapper);
	server.use('/plugins', express.static(pluginsPath));
	server.use(assets('../plugins', pluginsPath));
	apps.forEach(registerApp);
};