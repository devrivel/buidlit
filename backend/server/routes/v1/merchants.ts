import { Router, Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import Merchant from '../../models/Merchant'
import ApiKey from '../../models/ApiKey'
import Product from '../../models/Product'
import Chain from '../../models/Chain'

import { logger } from '../../utils/Logger'
import { extractUser, requireMerchantAccessLevel, validateApiKey } from '../../middleware/AuthMiddleware'

const router = Router({ mergeParams: true })

router.post('/', [
	extractUser,
	body('name').notEmpty().trim().escape()
], async (req:Request, res:Response) => {
	try {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ code: 400, errors: errors.array() })
		}

		const merchant = new Merchant({ ...req.body, admins: [], createdBy: req.user._id })
		merchant.admins = [{ user: req.user._id, role: 'owner' }]
		await merchant.save()

		return res.status(200).send(merchant)
	} catch (error:any) {
		logger.error(error.message)
		return res.status(500).json({ code: 500, message: 'Something went wrong.' })
	}
})

router.get('/', [
	extractUser
], async (req: Request, res: Response) => {
	try {
		const merchants = await Merchant.find({ 'admins.user': req.user._id })
		return res.status(200).json({ results: merchants })
	} catch (error:any) {
		logger.error(error.message)
		return res.status(500).json({ code: 500, message: 'Something went wrong.' })
	}
})

router.get('/:id', async (req: Request, res: Response) => {
	const merchant = await Merchant.findOne({ _id: req.params.id })
	if (!merchant)  return res.status(404).json({ code: 404, message: 'Not found.' })

	return res.status(200).send(merchant)
})

router.put('/:id', [
	extractUser,
	requireMerchantAccessLevel(['owner', 'admin'], '')
], async (req: Request, res: Response) => {
	if (!Object.entries(req.body).length) return res.status(400).json({ code: 400, message: 'Nothing to update.' })
	delete req.body.admins
	delete req.body.createdBy

	try {
		const merchant = await Merchant.findOne({ _id: req.params.id })
		if (!merchant) return res.status(404).json({ code: 404, message: 'Not found.' })

		merchant.set(req.body)
		await merchant.save()

		return res.status(200).send(merchant)
	} catch (error:any) {
		logger.error(error.message)
		return res.status(500).json({ code: 500, message: 'Something went wrong.' })
	}
})

router.post('/:id/apikeys', [
	extractUser, 
	requireMerchantAccessLevel(['owner', 'admin', 'developer'], '')
], async (req:Request, res:Response) => {
	const { id } = req.params
	const type = req.query?.type || 'live'

	if (type !== 'live' && type !== 'test') return res.status(400).json({ code: 400, message: 'Invalid key type.' }) 

	const apikey = await ApiKey.create({
		merchant: id,
		createdBy: req.user._id,
		type
	})

	return res.status(200).send(apikey)
})

router.get('/:id/apikeys', [
	extractUser,
	requireMerchantAccessLevel(['owner', 'admin', 'developer'], '')
], async (req:Request, res:Response) => {
	let type = req.query?.type || 'live'
	if (type !== 'live' && type !== 'test') type = 'live'

	const keys = await ApiKey.find({ 
		merchant: req.params.id, 
		type
	})

	return res.status(200).json({ results: keys })
})

router.get('/:id/products', [
	validateApiKey,
	extractUser,
	requireMerchantAccessLevel(['owner', 'admin', 'developer'], '')
], async (req: Request, res: Response) => {
	const products = await Product.find({ merchant: req.params.id })
	return res.status(200).json({ results: products })
})

router.get('/:id/chains', async (req: Request, res: Response) => {
	const merchant = await Merchant.findOne({ _id: req.params.id })
	if (!merchant) return res.status(404).json({ code: 404, message: 'Not found.' })

	const chainIds = merchant?.paymentAddresses.map(addr => addr.chainId)
	const chains = await Chain.find({ chainId: { $in: chainIds }})

	return res.status(200).json({ results: chains })
})

export default router