import { connect } from 'mongoose'
import config from '../config'
import { logger } from '../utils/Logger'

export function initMongo () {
	connect(config.mongoConnection)
		.then(() => {
			logger.info('Mongo Inited 🚀')
		})
		.catch((err) => {
			logger.error(err.message)
		})
}