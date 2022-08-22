import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

import User from '../models/User'
import Merchant from '../models/Merchant'
import ApiKey from '../models/ApiKey'
import { logger } from '../utils/Logger'

function isExpired(timestamp:Date) {
	const now = new Date().getTime()
	const ts = new Date(timestamp).getTime()

	return now > ts
}

export async function extractUser (req: Request, res: Response, next: NextFunction) {
	function unauthorized () {
		return res.status(401).json({ code: 401, message: 'Unauthorized.' })
	}

	if (req.apiKeyValid === true) return next()

	try {
		if (!req.headers.authorization) return unauthorized()
		const token = req.headers.authorization.replace('Bearer ', '')

		jwt.verify(token, process.env.TOKEN_SECRET || '', async (err, decoded) => {
			if (err) {
				console.log(err)
				return unauthorized()
			}

			if (typeof decoded == 'string' || !decoded?.user?._id) return unauthorized()

			const user = await User.findOne({ _id: decoded.user._id }).select('-password').lean()
			if (!user) return unauthorized()

			const merchants = await Merchant.find({ 'admins.user': user._id }).select('admins')
			const accessRights = <any>[]

			merchants.forEach((merchant) => {
				const entry = merchant.admins.find(admin => admin.user.toString() === user._id.toString())
				accessRights.push({ merchant: merchant._id, role: entry?.role })
			})

			req.user = user
			req.user.accessRights = accessRights
      
			next()
		})
	} catch (error:any) {
		logger.error(error.message)
		return res.status(500).json({ code: 500, message: 'Something went wrong.' })
	}
}

export function requireMerchantAccessLevel (acceptedRoles:Array<string>, merchantId:string | undefined) {
	return (req: Request, res:Response, next:NextFunction) => {
		function unauthorized () {
			return res.status(401).json({ code: 401, message: 'Unauthorized.' })
		}

		if (req.apiKeyValid === true) return next()

		if (req.user?.role === 'admin') return next()
		if (!req.user?.accessRights?.length) return unauthorized()

		const id = merchantId || req.body?.merchant || req.query?.merchant || req.params?.id

		if (!id) return res.status(400).json({ code: 400, message: 'Missing merchant ID.' })

		const access = req.user.accessRights.find((right:any) => right.merchant.toString() === id)
		if (!access || !acceptedRoles.includes(access.role)) return unauthorized()

		next()
	}
}

export function requireGlobalAccessLevel(acceptedRoles:Array<string>) {
	return (req: Request, res:Response, next:NextFunction) => {
		function unauthorized () {
			return res.status(401).json({ code: 401, message: 'Unauthorized.' })
		}

		if (!req.user?.accessRights?.length) return unauthorized()
		if (!acceptedRoles.includes(req.user.role)) return unauthorized()

		next()
	}
}

export async function validateApiKey (req: Request, res: Response, next: NextFunction) {
	if (!req.headers['x-api-key']) {
		req.apiKeyValid = false
		return next()
	}

	const apikey = await ApiKey.findOne({ key: req.headers['x-api-key'] })
	if (apikey && apikey.active && !isExpired(apikey.expiresAt)) {
		req.apiKeyValid = true
		return next()
	}

	return res.status(401).json({ code: 401, message: 'Invalid API key.' })
}

export async function requireApiKey (req: Request, res: Response, next: NextFunction) {
	function unauthorized () {
		return res.status(401).json({ code: 401, message: 'Unauthorized.' })
	}

	if (!req.headers['x-api-key']) return unauthorized()

	const apikey = await ApiKey.findOne({ key: req.headers['x-api-key'] })
	if (apikey && apikey.active && !isExpired(apikey.expiresAt)) {
		return next()
	}

	return res.status(401).json({ code: 401, message: 'Invalid API key.' })
}