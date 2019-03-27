module.exports = {
	note: "This is a very simple example NodeJS app that uses TransomJS and the Scaffold module.",
	name: "My Static content Example App",
	transom: {},
	definition: {
		graceful: {},
		scaffold: {
			staticRoutes: [{
				path: '/assets/*',
				folder: 'public-assets'
			}],
			redirectRoutes: [{
				path: '/redirect',
				target: '/assets/transomlogo.png'
			}]
		}
	}
};