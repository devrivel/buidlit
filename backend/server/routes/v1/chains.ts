import { Router, Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import Chain from '../../models/Chain'
import Currency from '../../models/Currency'
import { extractUser, requireGlobalAccessLevel } from '../../middleware/AuthMiddleware'
import { logger } from '../../utils/Logger'

const router = Router()

router.post('/', [
	extractUser,
	requireGlobalAccessLevel(['admin', 'developer']),
	body('chainId').notEmpty(),
	body('name').notEmpty()
], async (req: Request, res: Response) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		return res.status(400).json({ code: 400, errors: errors.array() })
	}

	try {
		const exists = await Chain.exists({ chainId: req.body.chainId })
		if (exists) return res.status(400).json({ code: 400, message: 'Chain already exists.' })

		const chain = await Chain.create({ ...req.body })
		return res.status(200).send(chain)
	} catch (error:any) {
		logger.error(error.message)
		return res.status(500).json({ code: 500, message: 'Something went wrong.' })
	}
})

router.put('/:chainId', [
	extractUser,
	requireGlobalAccessLevel(['admin', 'developer'])
], async (req: Request, res: Response) => {
	if (!Object.entries(req.body).length) return res.status(400).json({ code: 400, message: 'Nothing to update.' })

	try {
		const chain = await Chain.findOne({ chainId: req.params.chainId })
		if (!chain) return res.status(404).json({ code: 404, message: 'Not found.' })

		chain.set(req.body)
		await chain.save()

		return res.status(200).send(chain)
	} catch (error:any) {
		logger.error(error.message)
		return res.status(500).json({ code: 500, message: 'Something went wrong.' })
	}
})

router.get('/:chainId', async (req: Request, res: Response) => {
	try {
		const chain = await Chain.findOne({ chainId: req.params.chainId })
		if (!chain)  return res.status(404).json({ code: 404, message: 'Not found.' })

		return res.status(200).send(chain)
	} catch (error:any) {
		logger.error(error.message)
		return res.status(500).json({ code: 500, message: 'Something went wrong.' })
	}
})

router.get('/:chainId/currencies', async (req: Request, res: Response) => {
	const currencies = await Currency.find({ chainId: req.params.chainId })
	return res.status(200).json({ results: currencies })
})

router.get('/', async (req: Request, res: Response) => {
	const testnet = req.query?.testnet === 'true' ? true : false
	const chains = await Chain.find({ testnet })
	return res.status(200).json({ results: chains })
})

export default router