import { Router, Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import Currency from '../../models/Currency'
import { extractUser, requireGlobalAccessLevel } from '../../middleware/AuthMiddleware'
import { logger } from '../../utils/Logger'

const router = Router()

router.post('/', [
	extractUser,
	requireGlobalAccessLevel(['admin', 'developer']),
	body('name').notEmpty().escape(),
	body('symbol').notEmpty(),
	body('address').notEmpty(),
	body('chainId').notEmpty()
], async (req: Request, res: Response) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		return res.status(400).json({ code: 400, errors: errors.array() })
	}

	try {
		const currency = await Currency.create({ ...req.body })
		return res.status(200).send(currency)
	} catch (error:any) {
		logger.error(error.message)
		return res.status(500).json({ code: 500, message: 'Something went wrong.' })
	}
})

router.put('/:symbol/:chainId', [
	extractUser,
	requireGlobalAccessLevel(['admin', 'developer'])
], async (req: Request, res: Response) => {
	if (!Object.entries(req.body).length) return res.status(400).json({ code: 400, message: 'Nothing to update.' })
	const { symbol, chainId } = req.params

	try {
		const currency = await Currency.findOne({ symbol, chainId })
		if (!currency) return res.status(404).json({ code: 404, message: 'Not found.' })

		currency.set(req.body)
		await currency.save()

		return res.status(200).send(currency)
	} catch (error:any) {
		logger.error(error.message)
		return res.status(500).json({ code: 500, message: 'Something went wrong.' })
	}
})

router.get('/:symbol/:chainId', async (req: Request, res: Response) => {
	try {
		const { symbol, chainId } = req.params

		const currency = await Currency.findOne({ symbol, chainId })
		if (!currency) return res.status(404).json({ code: 404, message: 'Not found.' })

		return res.status(200).send(currency)
	} catch (error:any) {
		logger.error(error.message)
		return res.status(500).json({ code: 500, message: 'Something went wrong.' })
	}
})

router.get('/:symbol', async (req: Request, res: Response) => {
	const currencies = await Currency.find({ symbol: req.params.symbol })
	return res.status(200).json({ results: currencies })
})

export default router