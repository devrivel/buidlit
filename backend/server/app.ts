import 'dotenv/config'
import express, { Express, ErrorRequestHandler } from 'express'
import cors from 'cors'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'

import { logger } from './utils/Logger'
import config from './config'
import { initMongo } from './services/Mongo'
import { initAgenda } from './services/Agenda'

const app: Express = express()

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

initMongo()
initAgenda()

// Routers
import v1 from './routes/v1'

app.use('/v1', v1)

app.use(((err, req, res, next) => {
	logger.error(err.stack)
	res.status(500).json({ code: 500, message: 'Something went wrong.'})
}) as ErrorRequestHandler)

app.listen(config.PORT, () => {
	console.log('API start time', new Date().toISOString())
})