import { Router, Request, Response } from 'express'
import { getRouterPath, encodePath } from '../../services/Uniswap'
import Web3 from 'web3'
import { logger } from '../../utils/Logger'

const router = Router()

router.get('/path', async (req: Request, res: Response) => {
	try {
		if (!req.query?.chainId || !req.query.from || !req.query.to) 
			return res.status(400).json({ code: 400, message: 'Missing required parameters.' })

		const { chainId, from, to } = req.query

		if (typeof from !== 'string' || typeof to !== 'string') 
			return res.status(400).json({ code: 400, message: 'Missing required parameters.' })

		if (from === to) {
			return res.status(200).json({
				path: [],
				packDetail: [],
				encodedPath: Web3.utils.randomHex(32)
			})
		}

		const routerPath = await getRouterPath({ chainId: Number(chainId), from, to })
		console.log(routerPath)
		const path = encodePath(routerPath?.route[0].route)

		return res.status(200).send(path)
	} catch (error:any) {
		console.log(error.message)
		logger.error(error)
		return res.status(500).json({ code: 500, message: 'Something went wrong.' })
	}
})

export default router
