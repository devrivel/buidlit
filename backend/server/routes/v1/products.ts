import { Router, Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import parseDuration from 'parse-duration'
import Product from '../../models/Product'
import Currency from '../../models/Currency'
import Chain from '../../models/Chain'
import Subscription from '../../models/Subscription'
import { IKeyable } from '../../interfaces/IKeayble'
import { extractUser, requireMerchantAccessLevel, validateApiKey } from '../../middleware/AuthMiddleware'
import { logger } from '../../utils/Logger'

const router = Router()

function parseToSeconds (str:any) {
	if (!isNaN(str)) return str
	const seconds = parseDuration(str, 's')
	return seconds
}

router.post('/', [
	validateApiKey,
	extractUser,
	requireMerchantAccessLevel(['owner', 'admin', 'developer'], ''),
	body('merchant').notEmpty(),
	body('name').notEmpty(),
	body('price').notEmpty().custom((value) => !isNaN(value) && value > 0),
	body('currency').notEmpty().custom(value => !!value.type && !!value.detail)
], async (req: Request, res: Response) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		return res.status(400).json({ code: 400, errors: errors.array() })
	}

	try {
		let interval = req.body.recurring?.interval
		if (interval) {
			interval = parseToSeconds(interval)
			req.body.recurring.interval = interval

			if (!interval || interval < 86400) return res.status(400).json({ code: 400, message: 'Invalid interval.' })
		}

		const intervalCount = req.body.recurring?.intervalCount
		if (intervalCount && isNaN(intervalCount))
			return res.status(400).json({ code: 400, message: 'Invalid interval count.' })

		let trialPeriod = req.body.recurring?.trialPeriod
		if (trialPeriod) {
			trialPeriod = parseToSeconds(trialPeriod)
			req.body.recurring.trialPeriod = trialPeriod

			if (!trialPeriod) return res.status(400).json({ code: 400, message: 'Invalid trial period.' })
		}

		const product = await Product.create({ ...req.body })

		return res.status(200).send(product)
	} catch (error:any) {
		logger.error(error.message)
		return res.status(500).json({ code: 500, message: 'Something went wrong.' })
	}
})

router.put('/:productId', [
	validateApiKey,
	extractUser,
	requireMerchantAccessLevel(['owner', 'admin', 'developer'], '')
], async (req: Request, res: Response) => {
	try {
		const product = await Product.findOne({ _id: req.params.productId })
		if (!product) return res.status(404).json({ code: 404, message: 'Not found.' })

		product.set(req.body)
		await product.save()

		return res.status(200).send(product)
	} catch (error:any) {
		logger.error(error.message)
		return res.status(500).json({ code: 500, message: 'Something went wrong.' })
	}
})

router.get('/', [
	validateApiKey,
	extractUser,
	requireMerchantAccessLevel(['owner', 'admin', 'developer'], '')
], async (req: Request, res: Response) => {
	const merchant = req.query?.merchant
	if (!merchant) return res.status(400).json({ code: 400, message: 'Missing required parameters.' })

	const products = await Product.find({ merchant })

	const results = []

	for (const product of products) {
		const data: IKeyable = { ...product.toObject() }

		data.subscriptionCount = await Subscription.countDocuments({
			product: product._id,
			status: 'active'
		})
		results.push(data)
	}

	return res.status(200).json({ results })
})

router.get('/:productId', async (req: Request, res: Response) => {
	const product = await Product.findOne({ _id: req.params.productId })
	if (!product) return res.status(404).json({ code: 404, message: 'Not found.' })

	return res.status(200).send(product)
})

router.get('/checkout/:checkoutId', async (req: Request, res: Response) => {
	try {
		const product = await Product.findOne({ checkoutId: req.params.checkoutId }).populate('merchant')
		if (!product) return res.status(404).json({ code: 404, message: 'Not found.' })

		const currency = await Currency.findOne({ symbol: product.currency?.detail })
		const merchantChains = product.merchant.paymentAddresses.map((item) => item.chainId)

		const chains = await Chain.find({ chainId: { $in: merchantChains }})

		return res.status(200).json({ product, currency, chains })
	} catch (error:any) {
		logger.error(error.message)
		return res.status(500).json({ code: 500, message: 'Something went wrong.' })
	}
})

export default router