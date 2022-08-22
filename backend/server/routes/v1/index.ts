import { Router, Request, Response } from 'express'
const router = Router()

import AuthRouter from './auth'
import MerchantsRouter from './merchants'
import ChainsRouter from './chains'
import CurrenciesRouter from './currencies'
import ProductsRouter from './products'
import PricesRouter from './prices'
import SubscriptionsRouter from './subscriptions'
import SwapsRouter from './swaps'

router.get('/', (req:Request, res:Response) => {
	res.json({ version: 1.0, message: 'Rivel API' })
})

router.use('/auth', AuthRouter)
router.use('/merchants', MerchantsRouter)
router.use('/chains', ChainsRouter)
router.use('/currencies', CurrenciesRouter)
router.use('/products', ProductsRouter)
router.use('/prices', PricesRouter)
router.use('/subscriptions', SubscriptionsRouter)
router.use('/swaps', SwapsRouter)

export default router