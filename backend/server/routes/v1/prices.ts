import { Router, Request, Response } from 'express'
import axios from 'axios'
import { logger } from '../../utils/Logger'
import Chain from '../../models/Chain'
import Currency from '../../models/Currency'

const router = Router()

router.get('/convert', async (req: Request, res: Response) => {
	try {
		const { chainId, from, to, amount } = req.query
		if (!chainId || !from || !to || !amount) return res.status(400).json({ code: 400, message: 'Missing required parameters.' })
		if (!Number(amount)) return res.status(400).json({ code: 400, message: 'Invalid amount.' })

		const chain = await Chain.findOne({ chainId })
		if (!chain || !chain.slug) return res.status(400).json({ code: 400, message: 'Unsupported chain.' })

		const fromCurrency = await Currency.findOneWithCache({ chainId, symbol: from })
		const toCurrency = await Currency.findOneWithCache({ chainId, symbol: to })

		if (!fromCurrency) return res.status(400).json({ code: 400, message: 'Unsupported "from" currency.' })
		if (!toCurrency) return res.status(400).json({ code: 400, message: 'Unsupported "to" currency.' })

		const resp = await axios.get(`${process.env.PRICE_API}/simple/price`, {
			params: {
				ids: `${fromCurrency.priceId},${toCurrency.priceId}`,
				vs_currencies: 'usd'
			}
		})

		const rates = resp.data
		const fromRate = rates[fromCurrency.priceId]
		const toRate = rates[toCurrency.priceId]

		const baseAmount = fromRate.usd * Number(amount)
		const rate = baseAmount / toRate.usd
		const usdRate = rate * toRate.usd

		return res.status(200).json({ rate, usdRate, fromAddress: fromCurrency.address, toAddress: toCurrency.address })
	} catch (error:any) {
		logger.error(error.message)
		return res.status(500).json({ code: 500, message: 'Something went wrong.' })
	}
})

export default router