module.exports = {
	apps : [{
		script: 'ts-node',
		args: 'server/app.ts',
		watch: true,
		ignore_watch: ['node_modules'],
		env: {
			NODE_ENV: 'development',
		},
		env_production: {
			NODE_ENV: 'production',
		}
	}],
}
